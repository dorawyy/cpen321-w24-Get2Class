// const { serverReady, resetAttendanceJob } = require("../../index");
// import { client } from '../../services';
// import { Server } from "http";

export const myUser = {
    email: "asdfasdf@gmail.com",
    sub: "123",
    name: "asdfasdf",
    karma: 0,
    notificationTime: 15,
    notificationsEnabled: true
};

export const myDBScheduleItem = {
    email: myUser.email,
    sub: myUser.sub,
    name: myUser.name,
    fallCourseList: [],
    winterCourseList: [],
    summerCourseList: []
};
  
export const mySchedule = {
    courses: [
        {
            "name": "MATH 101",
            "daysBool": "[true, false, true, false, true]",
            "startTime": "(9, 30)",
            "endTime": "(10, 50)",
            "startDate": "2024-09-05",
            "endDate": "2024-12-10",
            "location": "BuildingA - Room 101",
            "credits": 3.0,
            "format": "Lecture"
        }
    ]
};

// let server: Server;

// export class Init {
//     async init_schedule_test() {
//         server = await serverReady;  // Wait for the server to be ready
//         await client.db("get2class").collection("users").insertOne(myUser);
//         await client.db("get2class").collection("schedules").insertOne(myDBScheduleItem);
//     }

//     async shutdown_schedule_test() {
//         await client.db("get2class").collection("schedules").deleteMany({
//             sub: myUser.sub
//         })
//         await client.db("get2class").collection("users").deleteOne({
//             sub: myUser.sub
//         });
//         if (resetAttendanceJob) {
//             resetAttendanceJob.stop(); // Stop the cron job to prevent Jest from hanging
//         }
//         if (client) {
//             await client.close();
//         }
//         if (server) {
//             await new Promise((resolve) => server.close(resolve));
//         }
//     }
// }