import express, { Application, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { client } from "./services";
import { UserRoutes } from './routes/UserRoutes';
import morgan from 'morgan';
import { ScheduleRoutes } from './routes/ScheduleRoutes';
import { Server } from 'http';
import { ResetAttendanceController } from './controllers/ResetAttendanceController';
import * as cron from 'node-cron'

const app = express();
const resetAttendanceController = new ResetAttendanceController();

app.use(express.json());
app.use(morgan('tiny'));

/**
 * Cron Scheduler: resets attendance at the end of each day (PST) for all users
 */
const cronDeductKarma = cron.schedule('59 23 * * *', async () => {
    try {
        await resetAttendanceController.deductKarma();
    } catch (err) {
        console.error(err);
    }
}, {
    timezone: "America/Los_Angeles"
});

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
    (app as Application)[route.method as keyof Application] (
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
    (app as Application)[route.method as keyof Application] (
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
// app.get('/get2class', (req: Request, res: Response) => {
//     res.json({ "data": "Get2Class GET" });
// });

// app.post('/get2class', (req: Request, res: Response) => {
//     res.json({ "data": `Client sent: ${req.body.text}` });
// });

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
//         resetAttendanceController.deductKarma();
//         res.status(200).send("deducted karma");
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

    const port = process.env.PORT ? process.env.PORT : "3000";

    return new Promise<Server>((resolve) => {
        const server = app.listen(port, () => {
            console.log(`Listening on port ${port.toString()}`);
            resolve(server);
        });
    });
}).catch(err => {
    console.error(err);
    client.close();
    return Promise.reject(new Error(err));
});

export { app, serverReady, cronDeductKarma, cronResetAttendance, resetAttendanceController }
