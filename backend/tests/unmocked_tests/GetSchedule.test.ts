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
    dbScheduleItem.winterCourseList = mySchedule.courses;
    dbScheduleItem.summerCourseList = mySchedule.courses;
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
        const req = {};

        const res = await request(server).get("/schedule")
            .query(req);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
    });
    
    test("Invalid term string", async () => {
        const req = {
            sub: myUser.sub,
            term: "springCourseList"
        };

        const res = await request(server).get("/schedule")
            .query(req);
        expect(res.statusCode).toBe(400);
    });

    test("Valid request 'fallCourseList", async () => {
        const req = {
            sub: myUser.sub,
            term: "fallCourseList"
        };

        const res = await request(server).get("/schedule")
            .query(req);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('courseList');
    });

    test("Valid request 'winterCourseList", async () => {
        const req = {
            sub: myUser.sub,
            term: "winterCourseList"
        };

        const res = await request(server).get("/schedule")
            .query(req);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('courseList');
    });

    test("Valid request 'summerCourseList", async () => {
        const req = {
            sub: myUser.sub,
            term: "summerCourseList"
        };

        const res = await request(server).get("/schedule")
            .query(req);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('courseList');
    });

    test("Invalid user sub", async () => {
        const req = {
            sub: "Ryan Gosling",
            term: "fallCourseList"
        };

        const res = await request(server).get("/schedule")
            .query(req);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('courseList');
    });
});