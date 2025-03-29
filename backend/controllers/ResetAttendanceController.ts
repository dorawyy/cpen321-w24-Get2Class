import { client } from "../services";

export class ResetAttendanceController {
    async resetAttendance() {
        const allSchedules = await client.db("get2class").collection("schedules").find().toArray();

        for (let schedule of allSchedules) {
            if (schedule.fallCourseList.length != 0) {
                for (let course of schedule.fallCourseList) {
                    course.attended = false;
                }
            }
            if (schedule.winterCourseList.length != 0) {
                for (let course of schedule.winterCourseList) {
                    course.attended = false;
                }
            }
            if (schedule.summerCourseList.length != 0) {
                for (let course of schedule.summerCourseList) {
                    course.attended = false
                }
            }
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

    async deductKarma() {
        const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const todayIndex = (today + 6) % 7; // Adjust so Monday = 0, Tuesday = 1, ..., Sunday = 6

        if (todayIndex < 5) {
            const term = getTerm();
            
            let karmaToDeduct = 0;

            const allSchedules = await client.db("get2class").collection("schedules").find().toArray();

            for (let schedule of allSchedules) {
                if (term == "Fall") {
                    for (let course of schedule.fallCourseList) {
                        const daysBool = JSON.parse(course.daysBool);
                        if (daysBool.at(todayIndex) == true && course.attended == false) {
                            karmaToDeduct += course.credits * 10;
                        }
                    }
                } else if (term == "Winter") {
                    for (let course of schedule.winterCourseList) {
                        const daysBool = JSON.parse(course.daysBool);
                        if (daysBool.at(todayIndex) == true && course.attended == false) {
                            karmaToDeduct += course.credits * 10;
                        }
                    }
                } else {
                    for (let course of schedule.summerCourseList) {
                        const daysBool = JSON.parse(course.daysBool);
                        if (daysBool.at(todayIndex) == true && course.attended == false) {
                            karmaToDeduct += course.credits * 10;
                        }
                    }
                }

                await removeKarma(schedule.sub, karmaToDeduct);
            }
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

async function removeKarma(sub: string, karmaLost: number) {
    let currKarma;

    const userData = await client.db("get2class").collection("users").findOne({ sub });
    
    if (userData != null) {
        currKarma = userData.karma;
    } else {
        return;
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

    await client.db("get2class").collection("users").updateOne(filter, document, options);
}
