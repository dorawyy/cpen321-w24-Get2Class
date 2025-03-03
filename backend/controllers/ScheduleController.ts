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

    async getAttendance(req: Request, res: Response, nextFunction: NextFunction) {
        const sub = req.query["sub"];
        const className = req.query["className"];
        const classFormat = req.query["classFormat"];
        const term = req.query["term"];

        const userScheduleData = await client.db("get2class").collection("schedules").findOne({ sub: sub });

        if (userScheduleData != null) {
            let classes = userScheduleData[term as string];
            let found = false
            let attendanceVal;

            for (let i = 0; i < classes.length; i++) {
                if (classes[i].name == className && classes[i].format == classFormat) {
                    found = true;
                    attendanceVal = classes[i].attended;
                }
            }
            
            if (found == true) {
                res.status(200).json({ attended: attendanceVal });
            } else {
                res.status(400).send("Class not found");
            }
        } else {
            res.status(400).send("User not found");
        }
    }

    async updateAttendance(req: Request, res: Response, nextFunction: NextFunction) {
        const sub = req.body["sub"];
        const className = req.body["className"];
        const classFormat = req.body["classFormat"];
        const term = req.body["term"];

        const userScheduleData = await client.db("get2class").collection("schedules").findOne({ sub: sub });

        if (userScheduleData != null) {
            let classes = userScheduleData[term];

            for (let i = 0; i < classes.length; i++) {
                if (classes[i].name == className && classes[i].format == classFormat) {
                    classes[i].attended = true;
                }
            }

            let document;

            const filter = {
                sub: sub
            };

            if (term == "fallCourseList") {
                document = {
                    $set: {
                        fallCourseList: classes
                    }
                };
            } else if (term == "winterCourseList") {
                document = {
                    $set: {
                        winterCourseList: classes
                    }
                };
            } else {
                document = {
                    $set: {
                        summerCourseList: classes
                    }
                };
            }; 

            const options = {
                upsert: false
            };

            const updateData = await client.db("get2class").collection("schedules").updateOne(filter, document, options);

            if (!updateData.acknowledged || updateData.modifiedCount == 0) {
                res.status(400).send("Unable to clear schedule");
            } else {
                res.status(200).json({ acknowledged: updateData.acknowledged, message: "Successfully updated attendance" });
            }
        } else {
            res.status(400).send("Could not find user schedule data");
        }
    }
}