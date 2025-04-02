import { Request, Response } from "express";
import { client } from "../services";

export class ScheduleController {
    /**
     * getSchedule returns back a specific schedule (fallCourseList, winterCourseList, summerCourseList) back to the user
     * 
     * @param req the request made by the client
     * @param res the response that will be returned back to the client
     */
    async getSchedule(req: Request, res: Response) {
        const sub = req.query.sub;
        const term = req.query.term;

        let allowedKeys = ["fallCourseList", "winterCourseList", "summerCourseList"];

        const data = await client.db("get2class").collection("schedules").findOne({ sub });

        if (allowedKeys.includes(term as string) && data != null) {
            res.status(200).json({ courseList: data[term as string] })
        } else {
            res.status(400).send("User not found");
        }
    }

    /**
     * saveSchedule puts a schedule into the database (could be fallCourseList, winterCourseList, or summerCourseList) and returns a success response back to the user
     * 
     * @param req the request made by the client
     * @param res the response that will be returned back to the client
     */
    async saveSchedule(req: Request, res: Response) {
        const sub = req.body.sub;
        let document;
        
        const filter = {
            sub
        };

        if (req.body.fallCourseList) {
            document = {
                $set: {
                    fallCourseList: req.body.fallCourseList
                }
            };
        } else if (req.body.winterCourseList) {
            document = {
                $set: {
                    winterCourseList: req.body.winterCourseList
                }
            };
        } else {
            document = {
                $set: {
                    summerCourseList: req.body.summerCourseList
                }
            };
        }

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

    /**
     * clearSchedule deletes the schedule for a specific term (fallCourseList, winterCourseList, or summerCourseList)
     * 
     * @param req the request made by the client
     * @param res the response that will be returned back to the client
     */
    async clearSchedule(req: Request, res: Response) {
        const sub = req.body.sub;
        let document;

        const filter = {
            sub
        };

        if (req.body.fallCourseList) {
            document = {
                $set: {
                    fallCourseList: req.body.fallCourseList
                }
            };
        } else if (req.body.winterCourseList) {
            document = {
                $set: {
                    winterCourseList: req.body.winterCourseList
                }
            };
        } else if (req.body.summerCourseList) {
            document = {
                $set: {
                    summerCourseList: req.body.summerCourseList
                }
            };
        } else {
            return res.status(400).send("Unable to clear schedule");
        }

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

    /**
     * getAttendance retrieves the attendance value for a specific course within a specific schedule
     * this occurs whenever the user clicks on a specific class they want to view the route for or check into
     * 
     * @param req the request made by the client
     * @param res the response that will be returned back to the client
     */
    async getAttendance(req: Request, res: Response) {
        const sub = req.query.sub;
        const className = req.query.className;
        const classFormat = req.query.classFormat;
        const term = req.query.term;

        const userScheduleData = await client.db("get2class").collection("schedules").findOne({ sub });

        if (userScheduleData != null) {
            let classes = userScheduleData[term as string];
            let found = false
            let attendanceVal;

            for (let c of classes) {
                if (c.name == className && c.format == classFormat) {
                    found = true;
                    attendanceVal = c.attended;
                }
            }
            
            if (found) {
                res.status(200).json({ attended: attendanceVal });
            } else {
                res.status(400).send("Class not found");
            }
        } else {
            res.status(400).send("User not found");
        }
    }

    /**
     * updateAttendance updates the attendance value for a specific course within a specific schedule
     * this happens when the user successfully checks into a class
     * 
     * @param req the request made by the client
     * @param res the response that will be returned back to the client
     */
    async updateAttendance(req: Request, res: Response) {
        const sub = req.body.sub;
        const className = req.body.className;
        const classFormat = req.body.classFormat;
        const term = req.body.term;

        let allowedKeys = ["fallCourseList", "winterCourseList", "summerCourseList"];

        const userScheduleData = await client.db("get2class").collection("schedules").findOne({ sub });

        if (userScheduleData != null) {
            let classes;
            if (allowedKeys.includes(term)) {
                classes = userScheduleData[term as string];
            } else {
                return res.status(400).send("Unable to update attendance");
            }

            for (let c of classes) {
                if (c.name == className && c.format == classFormat) {
                    c.attended = true;
                }
            }

            let document;

            const filter = {
                sub
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
            } 

            const options = {
                upsert: false
            };

            const updateData = await client.db("get2class").collection("schedules").updateOne(filter, document, options);

            if (!updateData.acknowledged || updateData.modifiedCount == 0) {
                res.status(400).send("Unable to update attendance");
            } else {
                res.status(200).json({ acknowledged: updateData.acknowledged, message: "Successfully updated attendance" });
            }
        } else {
            res.status(400).send("Could not find user schedule data");
        }
    }
}