import { Request, Response } from "express";
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { client } from "../services";

export class UserController {
    /**
     * tokenSignIn handles the Google Sign In on the front end and generates a subject id that will be used to
     * uniquely identify a particular user in our database
     * 
     * @param req the request made by the client
     * @param res the response that will be returned back to the client
     */
    async tokenSignIn(req: Request, res: Response) {
        const client = new OAuth2Client();
        
        const ticket = await client.verifyIdToken({
            idToken: req.body.idToken,
            audience: req.body.audience
        });
        
        const payload = ticket.getPayload() as unknown as TokenPayload;
        res.status(200).json({ sub: payload.sub })
    }

    /**
     * findUser gets a user from the database and returns back to the user's data to the front end if the 
     * user exists in the database
     * 
     * @param req the request made by the client
     * @param res the response that will be returned back to the client
     */
    async findUser(req: Request, res: Response) {
        const query = req.query;
        const sub = query.sub;

        const userData = await client.db("get2class").collection("users").findOne({ sub });

        if (userData) {
            res.status(200).send(userData);
        } else {
            res.status(400).send("User does not exist");
        }
    }

    /**
     * createUser creates a new user in the database by creating an entry in the schedules and users collection
     * this handles the registration of a particular user
     * 
     * @param req the request made by the client
     * @param res the response that will be returned back to the client
     */
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

    /**
     * getNotifications gets the notification settings of a particular user and returns this back to the front end
     * 
     * @param req the request made by the client
     * @param res the response that will be returned back to the client
     */
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

    /**
     * updateNotifications updates the notification settings of a particular user and returns a success message back to
     * the front end if the update was successful
     * 
     * @param req the request made by the client
     * @param res the response that will be returned back to the client
     */
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

    /**
     * updateKarma updates the karma of a particular user if they are able to check into a class successfully
     * 
     * @param req the request made by the client
     * @param res the response that will be returned back to the client
     */
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