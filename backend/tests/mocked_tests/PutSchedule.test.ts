const { app, serverReady, cronResetAttendance } = require("../../index");
const { mySchedule, myUser, myDBScheduleItem, Init } = require("../utils");
import { client } from '../../services';
import request from 'supertest';
import { Server } from "http";

let server: Server;

beforeAll(async () => {
    server = await serverReady;  // Wait for the server to be ready
});

beforeEach(async() => {
    await client.db("get2class").collection("users").insertOne(myUser);
    await client.db("get2class").collection("schedules").insertOne(myDBScheduleItem);
})

afterEach(async() => {
    await client.db("get2class").collection("schedules").deleteOne({
        sub: myUser.sub
    })
    await client.db("get2class").collection("users").deleteOne({
        sub: myUser.sub
    });
})

afterAll(async () => {
    if (cronResetAttendance) {
        cronResetAttendance.stop(); // Stop the cron job to prevent Jest from hanging
    }
    if (client) {
        await client.close();
    }
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
});


describe("Mocked: PUT /schedule", () => {
    test("Database throws", async () => {
        const req = {
            sub: myUser.sub,
            fallCourseList: mySchedule.courses
        };

        const collection = client.db("get2class").collection("schedules");
        jest.spyOn(collection, 'updateOne').mockRejectedValue(new Error('Forced error'));
        // jest.spyOn(collection, 'updateOne').mockImplementation(() => {
        //     throw new Error('Forced error');
        // });

        const res = await request(app).put("/schedule").send(req);
        expect(res.statusCode).toBe(500);
    });

    // test("Valid request 'winterCourseList'", async () => {
    //     const req = {
    //         sub: myUser.sub,
    //         winterCourseList: mySchedule.courses
    //     };

    //     const res = await request(app).put("/schedule").send(req);
    //     expect(res.statusCode).toBe(200);
    // });

    // test("Valid request 'summerCourseList'", async () => {
    //     const req = {
    //         sub: myUser.sub,
    //         summerCourseList: mySchedule.courses
    //     };

    //     const res = await request(app).put("/schedule").send(req);
    //     expect(res.statusCode).toBe(200);
    // });
});

// describe("Mocked: POST /photo", () => {
//     // Mocked behavior: database.uploadPhoto throws an error // Input: test_photo.png is a valid photo
//     // Expected status code: 500
//     // Expected behavior: the error was handled gracefully
//     // Expected output: None
//     test("Database throws", async () => {
//         jest.spyOn(database, 'uploadPhoto').mockImplementation(() => {
//             throw new Error('Forced error');
//         });
//         const photo = fs.readFileSync("test/res/test_photo.png");
//         let res;
//         expect(async () => {
//             res = await app.post("/photo")
//                 .attach("photo", photo);
//             }).toNotThrow();
//         expect(res.status).toStrictEqual(500);
//         expect(database.uploadPhoto).toHaveBeenCalledTimes(1);
//     });

//     // more tests...
// });