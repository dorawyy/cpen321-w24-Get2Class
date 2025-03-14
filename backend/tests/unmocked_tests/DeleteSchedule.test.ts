const { app, serverReady, cronResetAttendance } = require("../../index");
const { mySchedule, myUser, myDBScheduleItem, Init } = require("./utils");
import { client } from '../../services';
import request from 'supertest';
import { Server } from "http";

let server: Server;

beforeAll(async () => {
    // Wait for the server to be ready
    server = await serverReady;  

    // Initialize DB for tests
    await client.db("get2class").collection("users").insertOne(myUser);
    let dbScheduleItem = myDBScheduleItem;
    dbScheduleItem.fallCourseList = mySchedule.courses;
    await client.db("get2class").collection("schedules").insertOne(myDBScheduleItem);
});

afterAll(async () => {
    // Clear DB
    await client.db("get2class").collection("schedules").deleteOne({
        sub: myUser.sub
    })
    await client.db("get2class").collection("users").deleteOne({
        sub: myUser.sub
    });

    // Shut down server
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


describe("Unmocked: DELETE /schedule", () => {
    test("Valid request 'fallCourseList'", async () => {
        const req = {sub: myUser.sub, fallCourseList: "fallCourseList"}
        
        const res = await request(app).delete("/schedule")
        .send(req);
        expect(res.statusCode).toBe(200);
    });

    test("Valid request 'winterCourseList'", async () => {
        const req = {sub: myUser.sub, winterCourseList: "winterCourseList"}
        
        const res = await request(app).delete("/schedule")
        .send(req);
        expect(res.statusCode).toBe(200);
    });

    test("Valid request 'summerCourseList'", async () => {
        const req = {sub: myUser.sub, summerCourseList: "summerCourseList"}
        
        const res = await request(app).delete("/schedule")
        .send(req);
        expect(res.statusCode).toBe(200);
    });
    
    // test("Invalid term string 'springCourseList'", async () => {
    //     const req = {sub: myUser.sub, springCourseList: "springCourseList"}
        
    //     const res = await request(app).delete("/schedule")
    //     .send(req);
    //     // console.log(res);
    //     expect(res.statusCode).toBe(400);
    // });
    
    test("Empty request body", async () => {
        const req = {sub: "", fallCourseList: ""};

        const res = await request(app).delete("/schedule")
            .send(req);
        expect(res.statusCode).toBe(400);
    });
});