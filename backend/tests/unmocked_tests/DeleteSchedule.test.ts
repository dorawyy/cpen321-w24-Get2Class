const { serverReady, cronResetAttendance } = require("../../index");
const { mySchedule, myUser, myDBScheduleItem, Init } = require("../utils");
import { client } from '../../services';
import request from 'supertest';
import { Server } from "http";

let server: Server;

beforeAll(async () => {
    // Wait for the server to be ready
    server = await serverReady;  
});

beforeEach(async () => {
    // Initialize DB for tests
    let dbScheduleItem = myDBScheduleItem;
    dbScheduleItem.fallCourseList = mySchedule.courses;
    await client.db("get2class").collection("schedules").insertOne(myDBScheduleItem);
})

afterEach(async () => {
    // Clear db
    await client.db("get2class").collection("schedules").deleteOne({
        sub: myUser.sub
    });
})

afterAll(async () => {
    await client.close();
    cronResetAttendance.stop();
    await server.close();
});

// Interface DELETE /schedule
describe("Unmocked: DELETE /schedule", () => {
    test("Valid request 'fallCourseList'", async () => {
        const req = {sub: myUser.sub, fallCourseList: "fallCourseList"}
        
        const res = await request(server).delete("/schedule")
        .send(req);
        expect(res.statusCode).toBe(200);
    });

    test("Valid request 'winterCourseList'", async () => {
        const req = {sub: myUser.sub, winterCourseList: "winterCourseList"}
        
        const res = await request(server).delete("/schedule")
        .send(req);
        expect(res.statusCode).toBe(200);
    });

    test("Valid request 'summerCourseList'", async () => {
        const req = {sub: myUser.sub, summerCourseList: "summerCourseList"}
        
        const res = await request(server).delete("/schedule")
        .send(req);
        expect(res.statusCode).toBe(200);
    });
    
    test("Invalid term string 'springCourseList'", async () => {
        const req = {sub: myUser.sub, springCourseList: "springCourseList"}
        
        const res = await request(server).delete("/schedule")
        .send(req);
        expect(res.statusCode).toBe(400);
    });
    
    test("Empty request body", async () => {
        const req = {sub: "", fallCourseList: ""};

        const res = await request(server).delete("/schedule")
            .send(req);
        expect(res.statusCode).toBe(400);
    });
});