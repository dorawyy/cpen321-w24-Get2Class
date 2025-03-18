import { serverReady, cronResetAttendance } from '../../index';
import { mySchedule, myUser, myDBScheduleItem, DBScheduleItem } from "../utils";
import { client } from '../../services';
import request from 'supertest';
import { Server } from "http";

let server: Server;

beforeAll(async () => {
    server = await serverReady;  // Wait for the server to be ready
    let dbScheduleItem: DBScheduleItem = myDBScheduleItem;
    dbScheduleItem.fallCourseList = mySchedule.courses;
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

// Interface GET /attendance
describe("Unmocked: GET /attendance", () => {
    // Input: valid subject id, classFormat and term string and invalid className
    // Expected status code: 400
    // Expected behavior: should return error status code and contain a message text explaining that the class was not found
    // Expected output: empty body and "class not found"
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
        expect(res.text).toBe("Class not found");
        expect(res.body).toEqual({});
    });

    // Input: valid subject id, className, classFormat and term string
    // Expected status code: 200
    // Expected bahaviour: should return status success and a body acknowledging user and schedule db updates
    // Expected output: acknowledged, message
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

    // Input: valid subject id, classFormat and className string and invalid subject id
    // Expected status code: 400
    // Expected behavior: should return error status code and contain a message text explaining that the class was not found
    // Expected output: empty body and "class not found"
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
        expect(res.text).toBe("User not found");
        expect(res.body).toEqual({});
    });

    // Input: empty request body
    // Expected status code: 400
    // Expected behavior: should return error status code and contain 'errors' in body for missing field
    // Expected output: errors
    test("Empty request body", async () => {
        const req = {};
        const res = await request(server).get("/attendance")
            .query(req);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
    });
});