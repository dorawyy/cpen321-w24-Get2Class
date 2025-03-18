import { serverReady, cronResetAttendance } from '../../index';
import { mySchedule, myUser, myDBScheduleItem, DBScheduleItem } from "../utils";
import { client } from '../../services';
import request from 'supertest';
import { Server } from "http";

let server: Server;

beforeAll(async () => {
    server = await serverReady;  // Wait for the server to be ready
    let schedule: DBScheduleItem = myDBScheduleItem;
    schedule.fallCourseList = mySchedule.courses;
    schedule.summerCourseList = mySchedule.courses;
    await client.db("get2class").collection("schedules").insertOne(myDBScheduleItem);
});

afterAll(async () => {
    await client.db("get2class").collection("schedules").deleteOne({
        sub: myUser.sub
    });
    await client.db("get2class").collection("schedules").deleteMany({
        sub: myUser.sub
    });
    await client.close();
    cronResetAttendance.stop();
    await new Promise((resolve) => { resolve(server.close()); });
});

// Interface PUT /attendance
describe("Unmocked: PUT /attendance", () => {
    // Input: valid subject id and term string "fallCourseList"
    // Expected status code: 200
    // Expected bahaviour: should return status success and a body acknowledging schedule db updates
    // Expected output: acknowledged, message
    test("Valid request 'fallCourseList'", async () => {
        const req = {
            sub: myUser.sub,
            className: mySchedule.courses[0]["name"],
            classFormat: mySchedule.courses[0]["format"],
            term: "fallCourseList"
        }

        const res = await request(server).put("/attendance")
            .send(req);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('acknowledged');
        expect(res.body).toHaveProperty('message');
    });

    // Input: valid subject id and term string "winterCourseList" corresponding to an empty schedule
    // Expected status code: 400
    // Expected bahaviour: should return error status code and contain a message text explaining that attendance was not updated
    // Expected output: empty body and "Unable to clear schedule"
    test("Empty schedule 'winterCourseList'", async () => {
        const req = {
            sub: myUser.sub,
            className: mySchedule.courses[0]["name"],
            classFormat: mySchedule.courses[0]["format"],
            term: "winterCourseList"
        }

        const res = await request(server).put("/attendance")
            .send(req);
        expect(res.statusCode).toBe(400);
        expect(res.text).toBe("Unable to clear schedule");
        expect(res.body).toEqual({});
    });

    // Input: valid subject id and term string "summerCourseList"
    // Expected status code: 200
    // Expected bahaviour: should return status success and a body acknowledging schedule db updates
    // Expected output: acknowledged, message
    test("Valid request 'summerCourseList'", async () => {
        const req = {
            sub: myUser.sub,
            className: mySchedule.courses[0]["name"],
            classFormat: mySchedule.courses[0]["format"],
            term: "summerCourseList"
        }

        const res = await request(server).put("/attendance")
            .send(req);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('acknowledged');
        expect(res.body).toHaveProperty('message');
    });

    // Input: valid subject id and invalid term string "springCourseList"
    // Expected status code: 400
    // Expected behavior: should return error status code and contain a message text explaining that attendance was not updated
    // Expected output: empty body and "Unable to clear schedule"
    test("Invalid request 'springCourseList'", async () => {
        const req = {
            sub: myUser.sub,
            className: mySchedule.courses[0]["name"],
            classFormat: mySchedule.courses[0]["format"],
            term: "springCourseList"
        }

        const res = await request(server).put("/attendance")
            .send(req);
        expect(res.statusCode).toBe(400);
        expect(res.text).toBe("Unable to clear schedule");
        expect(res.body).toEqual({});
    });

    // Input: valid subject id and invalid term string "springCourseList"
    // Expected status code: 400
    // Expected behavior: should return error status code and contain a message text explaining that user was not found
    // Expected output: empty body and "Could not find user schedule data"
    test("Invalid user sub", async () => {
        const req = {
            sub: "Ryan Gosling",
            className: mySchedule.courses[0]["name"],
            classFormat: mySchedule.courses[0]["format"],
            term: "fallCourseList"
        }

        const res = await request(server).put("/attendance")
            .send(req);
        expect(res.statusCode).toBe(400);
        expect(res.text).toBe("Could not find user schedule data");
        expect(res.body).toEqual({});
    });
    
    // Input: empty request body
    // Expected status code: 400
    // Expected behavior: should return error status code and contain 'errors' in body for missing field
    // Expected output: errors
    test("Empty request body", async () => {
        const req = {};
        const res = await request(server).put("/attendance").send(req);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
    });
});