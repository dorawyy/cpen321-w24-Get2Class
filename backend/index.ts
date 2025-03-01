import express, { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { validationResult } from 'express-validator';
import { client } from "./services";
import { UserRoutes } from './routes/UserRoutes';
import morgan from 'morgan';
import { ScheduleRoutes } from './routes/ScheduleRoutes';

const app = express();

app.use(express.json());
app.use(morgan('tiny'));

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
 * Mongo and Express connection setup
 */
client.connect().then(() => {
    console.log("MongoDB Client Connected");

    app.listen(3000, () => {
        console.log("Listening on port " + 3000);
    });
}).catch(err => {
    console.error(err);
    client.close();
});