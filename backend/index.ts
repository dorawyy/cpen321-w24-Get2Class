import express, { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { client } from "./services";
import { UserRoutes } from './routes/UserRoutes';
import morgan from 'morgan';
import { ScheduleRoutes } from './routes/ScheduleRoutes';
import { Server } from 'http';
import { ResetAttendanceController } from './controllers/ResetAttendanceController';

const app = express();
const resetAttendanceController = new ResetAttendanceController();
var cron = require('node-cron');

app.use(express.json());
app.use(morgan('tiny'));

/**
 * Cron Scheduler: resets attendance at the end of each day (PST) for all users
 */
const cronResetAttendance = cron.schedule('0 0 * * *', async () => {
    try {
        await resetAttendanceController.resetAttendance();
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
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                /* If there are validation errors, send a response with the error messages */
                return res.status(400).send({ errors: errors.array() });
            }

            try {
                await route.action(
                    req,
                    res
                );
            } catch (err) {
                console.error(err);
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
        async (req: Request, res: Response) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                /* If there are validation errors, send a response with the error messages */
                return res.status(400).send({ errors: errors.array() });
            }

            try {
                await route.action(
                    req,
                    res
                );
            } catch (err) {
                console.error(err);
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
//         resetAttendanceController.resetAttendance();
//         res.status(200).send("Attendance reset for all courses");
//     } catch (err) {
//         console.error(err);
//         res.status(500).send(err);
//     }
// });

/**
 * Mongo and Express connection setup
 */
// client.connect().then(() => {
//     console.log("MongoDB Client Connected");

//     app.listen(process.env.PORT, () => {
//         console.log("Listening on port: " + process.env.PORT);
//     });
// }).catch(err => {
//     console.error(err);
//     client.close();
// });

const serverReady: Promise<Server> = client.connect().then(() => {
    console.log("MongoDB Client Connected");

    return new Promise<Server>((resolve) => {
        const server = app.listen(process.env.PORT, () => {
            console.log("Listening on port", process.env.PORT);
            resolve(server);
        });
    });
}).catch(err => {
    console.error(err);
    client.close();
    return Promise.reject(new Error(err));
});

export { app, serverReady, cronResetAttendance, resetAttendanceController }
