const { serverReady, cronResetAttendance } = require("../../index");
const { mySchedule, myUser, myDBScheduleItem, Init } = require("../utils");
import { client } from '../../services';
import request from 'supertest';
import { Server } from "http";

let server: Server;

beforeAll(async () => {
    server = await serverReady;
    let dbScheduleItem = myDBScheduleItem;
    dbScheduleItem.fallCourseList = mySchedule.courses;
    await client.db("get2class").collection("schedules").insertOne(myDBScheduleItem);
});

afterAll(async () => {
    await client.db("get2class").collection("schedules").deleteOne({
        sub: myUser.sub
    });

    await client.close();
    cronResetAttendance.stop();
    await server.close();
});

// Interface GET /schedule
describe("Unmocked: GET /schedule", () => {
    test("Empty request body", async () => {
        const sub = "";
        const term = "";

        const res = await request(server).get("/schedule")
            .query({sub: sub, term: term});
        expect(res.statusCode).toBe(400);
    });
    
    test("Invalid term string", async () => {
        const sub = myUser.sub;
        const term = "springCourseList";

        const res = await request(server).get("/schedule")
            .query({sub: sub, term: term});
        expect(res.statusCode).toBe(400);
    });

    test("Valid request", async () => {
        const sub = myUser.sub;
        const term = "fallCourseList";

        const res = await request(server).get("/schedule")
            .query({sub: sub, term: term});
        expect(res.statusCode).toBe(200);
    });
});