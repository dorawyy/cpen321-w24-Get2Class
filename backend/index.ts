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
 * Mongo and Express connection setup
 */
const serverReady: Promise<Server> = client.connect().then(() => {
    console.log("MongoDB Client Connected");

    const port = process.env.PORT ? process.env.PORT : "3000";

    return new Promise<Server>((resolve) => {
        if (port == "80") {
            const server = app.listen(port, () => {
                console.log("Listening on port 80");
                resolve(server);
            });
        } else if (port == "3000") {
            const server = app.listen(port, () => {
                console.log("Listening on port 3000");
                resolve(server);
            });
        } else {
            const server = app.listen(port, () => {
                console.log("Listening on port unknown");
                resolve(server);
            });
        }
    });
}).catch(err => {
    console.error(err);
    client.close();
    return Promise.reject(new Error(err));
});

export { app, serverReady, cronDeductKarma, cronResetAttendance, resetAttendanceController }
