const { app, serverReady, cronResetAttendance } = require("../../index");
const { mySchedule, myUser, myDBScheduleItem, Init } = require("../utils");
import { client } from '../../services';
import request from 'supertest';
import { Server } from "http";

let server: Server;

beforeAll(async () => {
    server = await serverReady;  // Wait for the server to be ready
    await client.db("get2class").collection("users").insertOne(myUser);
    let dbScheduleItem = myDBScheduleItem;
    dbScheduleItem.fallCourseList = mySchedule.courses;
    await client.db("get2class").collection("schedules").insertOne(myDBScheduleItem);
});

afterAll(async () => {
    await client.db("get2class").collection("schedules").deleteOne({
        sub: myUser.sub
    })
    await client.db("get2class").collection("users").deleteOne({
        sub: myUser.sub
    });
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


describe("Mocked: GET /schedule", () => {
    test("Empty request body", async () => {
        const sub = "";
        const term = "";

        const res = await request(app).get("/schedule")
            .query({sub: sub, term: term});
        expect(res.statusCode).toBe(400);
    });
    
    // test("Invalid term string", async () => {
    //     const sub = myUser.sub;
    //     const term = "springCourseList";

    //     const res = await request(app).get("/schedule")
    //         .query({sub: sub, term: term});
    //     expect(res.statusCode).toBe(400);
    // });

    // test("Valid request", async () => {
    //     const sub = myUser.sub;
    //     const term = "fallCourseList";

    //     const res = await request(app).get("/schedule")
    //         .query({sub: sub, term: term});
    //     expect(res.statusCode).toBe(200);
    // });
});