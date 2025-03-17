import { Request, Response } from "express";
import { OAuth2Client } from 'google-auth-library';
import { client } from "../services";

export class UserController {
    async tokenSignIn(req: Request, res: Response) {
        const client = new OAuth2Client();
        
        const ticket = await client.verifyIdToken({
            idToken: req.body.idToken,
            audience: req.body.audience
        });
        
        const payload: any = ticket.getPayload();
        res.status(200).json({ sub: payload.sub })
    }

    async findUser(req: Request, res: Response) {
        const query = req.query;
        const sub = query.sub;

        const userData = await client.db("get2class").collection("users").findOne({ sub });
        res.status(200).send(userData);
    }

    async createUser(req: Request, res: Response) {
        const userRequestBody = {
            email: req.body.email,
            sub: req.body.sub,
            name: req.body.name,
            karma: 0,
            notificationTime: 15,
            notificationsEnabled: true
        };

        const courseListRequestBody = {
            email: req.body.email,
            sub: req.body.sub,
            name: req.body.name,
            fallCourseList: [],
            winterCourseList: [],
            summerCourseList: []
        };

        const userData = await client.db("get2class").collection("users").insertOne(userRequestBody);
        const scheduleData = await client.db("get2class").collection("schedules").insertOne(courseListRequestBody);

        res.status(200).json({ userAcknowledged: userData.acknowledged, scheduleAcknowledged: scheduleData.acknowledged, message: "Successfully registered account" });
    }

    async getNotifications(req: Request, res: Response) {
        const sub = req.query.sub;

        const data = await client.db("get2class").collection("users").findOne({ sub });
        
        if (data != null) {
            const notificationsEnabled = data.notificationsEnabled;
            const notificationTime = data.notificationTime;

            res.status(200).json({ notificationsEnabled, notificationTime });
        } else {
            res.status(400).send("User not found");
        }
    }

    async updateNotifications(req: Request, res: Response) {
        const sub = req.body.sub;
        const notificationsEnabled = req.body.notificationsEnabled;
        const notificationTime = req.body.notificationTime;

        const filter = {
            sub
        };

        const document = {
            $set: {
                notificationsEnabled,
                notificationTime
            },
        };

        const options = {
            upsert: false
        };

        const notificationData = await client.db("get2class").collection("users").updateOne(filter, document, options);

        if (!notificationData.acknowledged || notificationData.modifiedCount == 0) {
            res.status(400).send("Unable to modify data");
        } else {
            res.status(200).json({ acknowledged: notificationData.acknowledged, message: "Successfully saved notifications" });
        }
    }

    async updateKarma(req: Request, res: Response) {
        const sub = req.body.sub;
        const karma = req.body.karma;

        let currKarma;

        const userData = await client.db("get2class").collection("users").findOne({ sub });
        
        if (userData != null) {
            currKarma = userData.karma;
        } else {
            return res.status(400).send("User not found");
        }

        const filter = {
            sub
        };

        const document = {
            $set: {
                karma: currKarma + karma
            },
        };

        const options = {
            upsert: false
        };

        const updateData = await client.db("get2class").collection("users").updateOne(filter, document, options);

        if (!updateData.acknowledged || updateData.modifiedCount == 0) {
            return res.status(400).send("Unable to update karma");
        } else {
            res.status(200).json({ acknowledged: updateData.acknowledged, message: "Successfully gained karma" });
        }
    }
}