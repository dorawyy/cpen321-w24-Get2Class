import express, { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { MongoClient } from 'mongodb';

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.json({ "data": "Get2Class GET" });
});

app.post('/', (req: Request, res: Response) => {
    res.json({ "data": `Client sent: ${req.body.text}` });
});

app.delete('/reset_db', async (req: Request, res: Response) => {
    try {
        const deleteUsers = await client.db("get2class").collection("users").deleteMany({});
        const deleteSchedules = await client.db("get2class").collection("schedules").deleteMany({});
        res.status(200).send("DB Reset");
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

/**
 * Login related routes
 */
app.get('/find_existing_user', async (req: Request, res: Response) => {
    try {
        const query = req.query;
        const sub = query["sub"];

        const data = await client.db("get2class").collection("users").findOne({ "sub": sub });
        res.status(200).send(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ "err": err });
    }
});

app.post('/create_new_user', async (req: Request, res: Response) => {
    try {
        const userRequestBody = {
            email: req.body["email"],
            sub: req.body["sub"],
            name: req.body["name"],
            karma: 0,
            notificationTime: 15,
            notificationsEnabled: true
        };

        const courseListRequestBody = {
            email: req.body["email"],
            sub: req.body["sub"],
            name: req.body["name"],
            fallCourseList: [],
            winterCourseList: [],
            summerCourseList: []
        };

        const userData = await client.db("get2class").collection("users").insertOne(userRequestBody);
        const scheduleData = await client.db("get2class").collection("schedules").insertOne(courseListRequestBody);

        res.status(200).json({ "data": "Successfully registered account" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ "err": err });
    }
});

app.post('/tokensignin', async (req: Request, res: Response) => {
    try {
        const client = new OAuth2Client();

        const ticket = await client.verifyIdToken({
            idToken: req.body["idToken"],
            audience: req.body["audience"]
        });

        const payload = ticket.getPayload();
        res.status(200).json({ "sub": payload?.sub })
    } catch (err) {
        console.error(err);
        res.status(500).json({ "err": err });
    }
});

/**
 * Schedules related routes
 */
app.get('/get_schedule', async (req: Request, res: Response) => {
    try {
        const sub = req.query["sub"];
        const term = req.query["term"];

        let courseList = "";
        if (term == "fallCourseList") courseList = "fallCourseList";
        else if (term == "winterCourseList") courseList = "winterCourseList";
        else courseList = "summerCourseList";

        const data = await client.db("get2class").collection("schedules").findOne({ sub: sub });

        if (data != null) {
            res.status(200).json({ "courseList": data[courseList] });
        } else {
            throw Error("data is null");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

app.put('/store_schedule', async (req: Request, res: Response) => {
    try {        
        const sub = req.body["sub"];
        let document;
        
        const filter = {
            sub: sub
        };

        if (req.body["fallCourseList"]) {
            document = {
                $set: {
                    fallCourseList: req.body["fallCourseList"]
                }
            };
        } else if (req.body["winterCourseList"]) {
            document = {
                $set: {
                    winterCourseList: req.body["winterCourseList"]
                }
            };
        } else {
            document = {
                $set: {
                    summerCourseList: req.body["summerCourseList"]
                }
            };
        };

        const options = {
            upsert: false
        };

        const data = await client.db("get2class").collection("schedules").updateOne(filter, document, options);
        res.status(200).json({ acknowledged: data.acknowledged, message: "Successfully uploaded schedule" });
    } catch (err) {
        console.error(err);
        res.status(500).send(err)
    }
});

/**
 * Mongo and Express connection setup
 */
const client = new MongoClient("mongodb://localhost:27017/");
client.connect().then(() => {
    console.log("MongoDB Client Connected");

    app.listen(3000, () => {
        console.log("Listening on port " + 3000);
    });
}).catch(err => {
    console.error(err);
    client.close();
})