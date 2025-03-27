import { client } from "../services";

export class ResetAttendanceController {
    async resetAttendance() {
        const allSchedules = await client.db("get2class").collection("schedules").find().toArray();

        const term = getTerm()
        for (let schedule of allSchedules) {
            let karmaLost = 0
            if (schedule.fallCourseList.length != 0) {
                for (let course of schedule.fallCourseList) {
                    if (term == "Fall" && course.attended == false) {
                        karmaLost += 30
                    }
                    course.attended = false;
                }
            }
            if (schedule.winterCourseList.length != 0) {
                for (let course of schedule.winterCourseList) {
                    if (term == "Winter" && course.attended == false) {
                        karmaLost += 30
                    }
                    course.attended = false;
                }
            }
            if (schedule.summerCourseList.length != 0) {
                for (let course of schedule.summerCourseList) {
                    if (term == "Summer" && course.attended == false) {
                        karmaLost += 30
                    }
                    course.attended = false
                }
            }
            deductKarma(schedule.sub, karmaLost)
        }

        for (let schedule of allSchedules) {
            const filter = {
                sub: schedule.sub
            };

            const document = {
                $set: {
                    fallCourseList: schedule.fallCourseList,
                    winterCourseList: schedule.winterCourseList,
                    summerCourseList: schedule.summerCourseList
                }
            };
            
            await client.db("get2class").collection("schedules").updateOne(filter, document);
        }
    }
}

function getTerm(): string {
    const month = new Date().getMonth() + 1; 

    if (month >= 1 && month <= 4) {
        return "Winter";
    } else if (month >= 5 && month <= 8) {
        return "Summer";
    } else {
        return "Fall";
    }
}

async function deductKarma(sub: String, karmaLost: number) {
    let currKarma;

    const userData = await client.db("get2class").collection("users").findOne({ sub });
    
    if (userData != null) {
        currKarma = userData.karma;
    } else {
        // handle error
        // return res.status(400).send("User not found");
    }

    const filter = {
        sub
    };

    const document = {
        $set: {
            karma: currKarma - karmaLost
        },
    };

    const options = {
        upsert: false
    };

    const updateData = await client.db("get2class").collection("users").updateOne(filter, document, options);

    if (!updateData.acknowledged || updateData.modifiedCount == 0) {
        // handle error
        // return res.status(400).send("Unable to update karma");
    } else {
        // handle success
        // res.status(200).json({ acknowledged: updateData.acknowledged, message: "Successfully gained karma" });
    }
}
