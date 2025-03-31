import { serverReady, cronResetAttendance, cronDeductKarma } from '../../index';
import { mySchedule, myUser, myDBScheduleItem } from "../utils";
import { client } from '../../services';
import request from 'supertest';
import { Server } from "http";

let server: Server;

beforeAll(async () => {
    server = await serverReady;  // Wait for the server to be ready
    await client.db("get2class").collection("schedules").insertOne(myDBScheduleItem);
});

afterAll(async () => {
    await client.db("get2class").collection("schedules").deleteOne({
        sub: myUser.sub
    });

    await client.close();
    cronResetAttendance.stop();
    cronDeductKarma.stop();
    await new Promise((resolve) => { resolve(server.close()); });
});

// Interface PUT /schedule
describe("Unmocked: PUT /schedule", () => {
    // Input: empty request body
    // Expected status code: 400
    // Expected behavior: should return error status code and contain 'errors' in body for missing field
    // Expected output: errors
    test("Empty request body", async () => {
        const res = await request(server).put("/schedule").send({});
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
    });

    // Input: valid subject id and schedule under fallCourseList
    // Expected status code: 200
    // Expected bahaviour: should return status success and a body acknowledging schedule db updates
    // Expected output: acknowledged, message
    test("Valid request 'fallCourseList'", async () => {
        const req = {
            sub: myUser.sub,
            fallCourseList: mySchedule.courses
        };

        const res = await request(server).put("/schedule").send(req);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('acknowledged');
        expect(res.body).toHaveProperty('message');
    });

    // Input: valid subject id and schedule under winterCourseList
    // Expected status code: 200
    // Expected bahaviour: should return status success and a body acknowledging schedule db updates
    // Expected output: acknowledged, message
    test("Valid request 'winterCourseList'", async () => {
        const req = {
            sub: myUser.sub,
            winterCourseList: mySchedule.courses
        };

        const res = await request(server).put("/schedule").send(req);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('acknowledged');
        expect(res.body).toHaveProperty('message');
    });

    // Input: valid subject id and schedule under summerCourseList
    // Expected status code: 200
    // Expected bahaviour: should return status success and a body acknowledging schedule db updates
    // Expected output: acknowledged, message
    test("Valid request 'summerCourseList'", async () => {
        const req = {
            sub: myUser.sub,
            summerCourseList: mySchedule.courses
        };

        const res = await request(server).put("/schedule").send(req);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('acknowledged');
        expect(res.body).toHaveProperty('message');
    });

    // Input: invalid subject id and valid schedule under summerCourseList
    // Expected status code: 400
    // Expected behavior: should return error status code and contain a message text explaining that schedule was not able to be saved
    // Expected output: empty body and "Unable to save schedule"
    test("Invalid user sub", async () => {
        const req = {
            sub: "Ryan Gosling",
            summerCourseList: mySchedule.courses
        };

        const res = await request(server).put("/schedule").send(req);
        expect(res.statusCode).toBe(400);
        expect(res.text).toBe("Unable to save schedule");
        expect(res.body).toEqual({});
    });
});