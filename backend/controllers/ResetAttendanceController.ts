import { client } from "../services";

export class ResetAttendanceController {
    async resetAttendance() {
        const allSchedules = await client.db("get2class").collection("schedules").find().toArray();

        let term = getTerm()

        for (let schedule of allSchedules) {
            if (schedule.fallCourseList.length != 0) {
                for (let course of schedule.fallCourseList) {
                    if (term == "Fall" && course.attended == false) {
                        // remove some karma
                    }
                    course.attended = false;
                }
            }
            if (schedule.winterCourseList.length != 0) {
                for (let course of schedule.winterCourseList) {
                    if (term == "Winter" && course.attended == false) {
                        // remove some karma
                    }
                    course.attended = false;
                }
            }
            if (schedule.summerCourseList.length != 0) {
                for (let course of schedule.summerCourseList) {
                    if (term == "Summer" && course.attended == false) {
                        // remove some karma
                    }
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
