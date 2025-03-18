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
    await new Promise((resolve) => { resolve(server.close()); });
});

// Interface GET /schedule
describe("Unmocked: GET /schedule", () => {
    // Input: empty request body
    // Expected status code: 400
    // Expected behavior: should return error status code and contain 'errors' in body for missing field
    // Expected output: errors
    test("Empty request body", async () => {
        const req = {};

        const res = await request(server).get("/schedule")
            .query(req);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
    });

    // Input: valid subject id and invalid term string "springCourseList"
    // Expected status code: 400
    // Expected behavior: should return error status code and contain a message text explaining that the schedule was not found
    // Expected output: empty body and "User not found"
    test("Invalid term string", async () => {
        const req = {
            sub: myUser.sub,
            term: "springCourseList"
        };

        const res = await request(server).get("/schedule")
            .query(req);
        expect(res.statusCode).toBe(400);
        expect(res.text).toBe("User not found");
        expect(res.body).toEqual({});
    });

    // Input: valid subject id and term string "fallCourseList"
    // Expected status code: 200
    // Expected bahaviour: should return status success and a body containing the requested schedule
    // Expected output: "courseList"
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

    // Input: valid subject id and term string "winterCourseList"
    // Expected status code: 200
    // Expected bahaviour: should return status success and a body containing the requested schedule
    // Expected output: "courseList"
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

    // Input: valid subject id and term string "summerCourseList"
    // Expected status code: 200
    // Expected bahaviour: should return status success and a body containing the requested schedule
    // Expected output: "courseList"
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

    // Input: an invalid subject id and a valid term string
    // Expected status code: 400
    // Expected behavior: should return error status code and contain a message text explaining that schedule was not found
    // Expected output: empty body and "User not found"
    test("Invalid user sub", async () => {
        const req = {
            sub: "Ryan Gosling",
            term: "fallCourseList"
        };

        const res = await request(server).get("/schedule")
            .query(req);
        expect(res.statusCode).toBe(400);
        expect(res.text).toBe("User not found");
        expect(res.body).toEqual({});
    });
});