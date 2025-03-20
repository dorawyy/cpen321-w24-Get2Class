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
}