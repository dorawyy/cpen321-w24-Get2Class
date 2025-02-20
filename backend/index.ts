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
        const requestBody = {
            "email": req.body["email"],
            "sub": req.body["sub"],
            "name": req.body["name"],
            "karma": 0,
            "notificationTime": 15,
            "notificationsEnabled": true
        };

        const data = await client.db("get2class").collection("users").insertOne(requestBody);
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
})

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