import { Request, Response, NextFunction } from "express";
import { client } from "../services";

export class ScheduleController {
    async getSchedule(req: Request, res: Response, nextFunction: NextFunction) {
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
            res.status(400).send("User not found");
        }
    }

    async saveSchedule(req: Request, res: Response, nextFunction: NextFunction) {
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

        const scheduleData = await client.db("get2class").collection("schedules").updateOne(filter, document, options);

        if (!scheduleData.acknowledged || scheduleData.modifiedCount == 0) {
            res.status(400).send("Unable to save schedule");
        } else {
            res.status(200).json({ acknowledged: scheduleData.acknowledged, message: "Successfully uploaded schedule" });
        }
    }

    async clearSchedule(req: Request, res: Response, nextFunction: NextFunction) {
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

        const scheduleData = await client.db("get2class").collection("schedules").updateOne(filter, document, options);

        if (!scheduleData.acknowledged || scheduleData.modifiedCount == 0) {
            res.status(400).send("Unable to clear schedule");
        } else {
            res.status(200).json({ acknowledged: scheduleData.acknowledged, message: "Successfully cleared schedule" });
        }
    }
}