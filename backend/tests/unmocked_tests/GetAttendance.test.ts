const { serverReady, cronResetAttendance } = require("../../index");
const { mySchedule, myUser, myDBScheduleItem, Init } = require("../utils");
import { client } from '../../services';
import request from 'supertest';
import { Server } from "http";

let server: Server;

beforeAll(async () => {
    server = await serverReady;  // Wait for the server to be ready
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

// Interface GET /attendance
describe("Unmocked: GET /attendance", () => {
    test("Invalid course name", async () => {
        const req = {
            sub: myUser.sub,
            className: "Introduction to Conspiracy Theories",
            classFormat: mySchedule.courses[0]["format"],
            term: "fallCourseList"
        }

        const res = await request(server).get("/attendance")
            .query(req);
        expect(res.statusCode).toBe(400);
    });

    test("Valid request", async () => {
        const req = {
            sub: myUser.sub,
            className: mySchedule.courses[0]["name"],
            classFormat: mySchedule.courses[0]["format"],
            term: "fallCourseList"
        }

        const res = await request(server).get("/attendance")
            .query(req);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('attended');
    });

    test("Invalid user sub", async () => {
        const req = {
            sub: "Ryan Gosling",
            className: mySchedule.courses[0]["name"],
            classFormat: mySchedule.courses[0]["format"],
            term: "fallCourseList"
        }

        const res = await request(server).get("/attendance")
            .query(req);
        expect(res.statusCode).toBe(400);
    });

    test("Empty request body", async () => {
        const req = {};
        const res = await request(server).get("/attendance")
            .query(req);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
    });
});