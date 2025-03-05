import express, { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { client } from "./services";
import { UserRoutes } from './routes/UserRoutes';
import morgan from 'morgan';
import { ScheduleRoutes } from './routes/ScheduleRoutes';

const app = express();
var cron = require('node-cron');

app.use(express.json());
app.use(morgan('tiny'));

/**
 * Cron Scheduler: resets attendance at the end of each day (PST) for all users
 */
cron.schedule('0 0 * * *', async () => {
    try {
        const allSchedules = await client.db("get2class").collection("schedules").find().toArray();
        console.log(allSchedules);
        for (let i = 0; i < allSchedules.length; i++) {
            if (allSchedules[i]["fallCourseList"].length != 0) {
                for (let j = 0; j < allSchedules[i]["fallCourseList"].length; j++) {
                    allSchedules[i]["fallCourseList"][j]["attended"] = false;
                }
            }
            if (allSchedules[i]["winterCourseList"].length != 0) {
                for (let j = 0; j < allSchedules[i]["winterCourseList"].length; j++) {
                    allSchedules[i]["winterCourseList"][j]["attended"] = false;
                }
            }
            if (allSchedules[i]["summerCourseList"].length != 0) {
                for (let j = 0; j < allSchedules[i]["summerCourseList"].length; j++) {
                    allSchedules[i]["summerCourseList"][j]["attended"] = false;
                }
            }
        }

        for (let i = 0; i < allSchedules.length; i++) {
            const filter = {
                sub: allSchedules[i]["sub"]
            };

            const document = {
                $set: {
                    fallCourseList: allSchedules[i]["fallCourseList"],
                    winterCourseList: allSchedules[i]["winterCourseList"],
                    summerCourseList: allSchedules[i]["summerCourseList"]
                }
            };

            const updatedData = await client.db("get2class").collection("schedules").updateOne(filter, document);
        }
    } catch (err) {
        console.error(err);
    }
}, {
    timezone: "America/Los_Angeles"
});

/**
 * User Routes
 */
UserRoutes.forEach((route) => {
    (app as any)[route.method] (
        route.route,
        route.validation,
        async (req: Request, res: Response, next: NextFunction) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                /* If there are validation errors, send a response with the error messages */
                return res.status(400).send({ errors: errors.array() });
            }

            try {
                await route.action(
                    req,
                    res,
                    next,
                );
            } catch (err) {
                console.log(err);
                return res.sendStatus(500); // Don't expose internal server workings
            }
        },
    );
});

/**
 * Schedule Routes
 */
ScheduleRoutes.forEach((route) => {
    (app as any)[route.method] (
        route.route,
        route.validation,
        async (req: Request, res: Response, next: NextFunction) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                /* If there are validation errors, send a response with the error messages */
                return res.status(400).send({ errors: errors.array() });
            }

            try {
                await route.action(
                    req,
                    res,
                    next,
                );
            } catch (err) {
                console.log(err);
                return res.sendStatus(500); // Don't expose internal server workings
            }
        },
    );
});

/**
 * Test routes to confirm back end is working as expected
 */
app.get('/get2class', (req: Request, res: Response) => {
    res.json({ "data": "Get2Class GET" });
});

app.post('/get2class', (req: Request, res: Response) => {
    res.json({ "data": `Client sent: ${req.body.text}` });
});

// app.delete('/reset_db', async (req: Request, res: Response) => {
//     try {
//         const deleteUsers = await client.db("get2class").collection("users").deleteMany({});
//         const deleteSchedules = await client.db("get2class").collection("schedules").deleteMany({});
//         res.status(200).send("DB Reset");
//     } catch (err) {
//         console.error(err);
//         res.status(500).send(err);
//     }
// });

// app.get('/test', async (req: Request, res: Response) => {
//     try {
//         const allSchedules = await client.db("get2class").collection("schedules").find().toArray();
//         console.log(allSchedules);
//         for (let i = 0; i < allSchedules.length; i++) {
//             if (allSchedules[i]["fallCourseList"].length != 0) {
//                 for (let j = 0; j < allSchedules[i]["fallCourseList"].length; j++) {
//                     allSchedules[i]["fallCourseList"][j]["attended"] = false;
//                 }
//             }
//             if (allSchedules[i]["winterCourseList"].length != 0) {
//                 for (let j = 0; j < allSchedules[i]["winterCourseList"].length; j++) {
//                     allSchedules[i]["winterCourseList"][j]["attended"] = false;
//                 }
//             }
//             if (allSchedules[i]["summerCourseList"].length != 0) {
//                 for (let j = 0; j < allSchedules[i]["summerCourseList"].length; j++) {
//                     allSchedules[i]["summerCourseList"][j]["attended"] = false;
//                 }
//             }
//         }

//         for (let i = 0; i < allSchedules.length; i++) {
//             const filter = {
//                 sub: allSchedules[i]["sub"]
//             };

//             const document = {
//                 $set: {
//                     fallCourseList: allSchedules[i]["fallCourseList"],
//                     winterCourseList: allSchedules[i]["winterCourseList"],
//                     summerCourseList: allSchedules[i]["summerCourseList"]
//                 }
//             };

//             const updatedData = await client.db("get2class").collection("schedules").updateOne(filter, document);
//         }
//         res.status(200).send("working");
//     } catch (err) {
//         console.error(err);
//         res.status(500).send(err);
//     }
// });

/**
 * Mongo and Express connection setup
 */
client.connect().then(() => {
    console.log("MongoDB Client Connected");

    app.listen(process.env.PORT, () => {
        console.log("Listening on port " + process.env.PORT);
    });
}).catch(err => {
    console.error(err);
    client.close();
});