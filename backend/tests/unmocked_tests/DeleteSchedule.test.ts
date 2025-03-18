const { serverReady, cronResetAttendance } = require("../../index");
const { mySchedule, myUser, myDBScheduleItem } = require("../utils");
import { client } from '../../services';
import request from 'supertest';
import { Server } from "http";

let server: Server;

beforeAll(async () => {
    // Wait for the server to be ready
    server = await serverReady;  
    let dbScheduleItem = myDBScheduleItem;
    dbScheduleItem.fallCourseList = mySchedule.courses;
    dbScheduleItem.winterCourseList = mySchedule.courses;
    dbScheduleItem.summerCourseList = mySchedule.courses;
    await client.db("get2class").collection("schedules").insertOne(myDBScheduleItem);
});

afterAll(async () => {
    await client.db("get2class").collection("schedules").deleteOne({ sub: myUser.sub });
    await client.close();
    cronResetAttendance.stop();
    await new Promise((resolve) => { resolve(server.close()); });
});

// Interface DELETE /schedule
describe("Unmocked: DELETE /schedule", () => {
    // Input: valid subject id and term string "fallCourseList"
    // Expected status code: 200
    // Expected bahaviour: should return status success and a body acknowledging schedule db updates
    // Expected output: acknowledged, message
    test("Valid request 'fallCourseList'", async () => {
        const req = {sub: myUser.sub, fallCourseList: []};
        
        const res = await request(server).delete("/schedule").send(req);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('acknowledged');
        expect(res.body).toHaveProperty('message');
    });

    // Input: valid subject id and term string "winterCourseList"
    // Expected status code: 200
    // Expected bahaviour: should return status success and a body acknowledging schedule db updates
    // Expected output: acknowledged, message
    test("Valid request 'winterCourseList'", async () => {
        const req = {sub: myUser.sub, winterCourseList: []};
        
        const res = await request(server).delete("/schedule").send(req);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('acknowledged');
        expect(res.body).toHaveProperty('message');
    });

    // Input: valid subject id and term string "summerCourseList"
    // Expected status code: 200
    // Expected bahaviour: should return status success and a body acknowledging schedule db updates
    // Expected output: acknowledged, message
    test("Valid request 'summerCourseList'", async () => {
        const req = {sub: myUser.sub, summerCourseList: []};
        
        const res = await request(server).delete("/schedule").send(req);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('acknowledged');
        expect(res.body).toHaveProperty('message');
    });
    
    // Input: valid subject id and invalid term string "springCourseList"
    // Expected status code: 400
    // Expected behavior: should return error status code and contain a message text explaining that schedule was not able to be cleared
    // Expected output: empty body and "Unable to clear schedule"
    test("Invalid term string 'springCourseList'", async () => {
        const req = {sub: myUser.sub, springCourseList: []};
        
        const res = await request(server).delete("/schedule").send(req);
        expect(res.statusCode).toBe(400);
        expect(res.text).toBe("Unable to clear schedule");
        expect(res.body).toEqual({});
    });

    // Input: an invalid subject id and a valid term string
    // Expected status code: 400
    // Expected behavior: should return error status code and contain a message text explaining that schedule was not able to be cleared
    // Expected output: empty body and "Unable to clear schedule"
    test("Invalid user sub", async () => {
        const req = {sub: "Ryan Gosling", springCourseList: []};
        
        const res = await request(server).delete("/schedule").send(req);
        expect(res.statusCode).toBe(400);
        expect(res.text).toBe("Unable to clear schedule");
        expect(res.body).toEqual({});
    });
    
    // Input: an empty subject id and term string
    // Expected status code: 400
    // Expected behavior: should return error status code and contain a message text explaining that schedule was not able to be cleared
    // Expected output: empty body and "Unable to clear schedule"
    test("Empty request fields", async () => {
        const req = {sub: "", fallCourseList: []};

        const res = await request(server).delete("/schedule").send(req);
        expect(res.statusCode).toBe(400);
        expect(res.text).toBe("Unable to clear schedule");
        expect(res.body).toEqual({});
    });

    // Input: empty request body
    // Expected status code: 400
    // Expected behavior: should return error status code and contain 'errors' in body for missing field
    // Expected output: errors
    test("Empty request body", async () => {
        const req = {};

        const res = await request(server).delete("/schedule").send(req);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
    });
});