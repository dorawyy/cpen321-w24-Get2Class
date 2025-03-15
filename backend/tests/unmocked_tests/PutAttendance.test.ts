const { app, serverReady, cronResetAttendance } = require("../../index");
const { mySchedule, myUser, myDBScheduleItem, Init } = require("./utils");
import { client } from '../../services';
import request from 'supertest';
import { Server } from "http";

let server: Server;

beforeAll(async () => {
    server = await serverReady;  // Wait for the server to be ready
    await client.db("get2class").collection("users").insertOne(myUser);
    let dbScheduleItem = myDBScheduleItem;
    dbScheduleItem.fallCourseList = mySchedule.courses;
    dbScheduleItem.summerCourseList = mySchedule.courses;
    await client.db("get2class").collection("schedules").insertOne(myDBScheduleItem);
});

afterAll(async () => {
    await client.db("get2class").collection("schedules").deleteOne({
        sub: myUser.sub
    })
    await client.db("get2class").collection("users").deleteOne({
        sub: myUser.sub
    });
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


describe("Unmocked: PUT /attendance", () => {
    test("Valid request 'fallCourseList'", async () => {
        const req = {
            sub: myUser.sub,
            className: mySchedule.courses[0]["name"],
            classFormat: mySchedule.courses[0]["format"],
            term: "fallCourseList"
        }

        const res = await request(app).put("/attendance")
            .send(req);
        expect(res.statusCode).toBe(200);
    });

    test("Empty schedule 'winterCourseList'", async () => {
        const req = {
            sub: myUser.sub,
            className: mySchedule.courses[0]["name"],
            classFormat: mySchedule.courses[0]["format"],
            term: "winterCourseList"
        }

        const res = await request(app).put("/attendance")
            .send(req);
        expect(res.statusCode).toBe(400);
    });

    test("Valid request 'summerCourseList'", async () => {
        const req = {
            sub: myUser.sub,
            className: mySchedule.courses[0]["name"],
            classFormat: mySchedule.courses[0]["format"],
            term: "summerCourseList"
        }

        const res = await request(app).put("/attendance")
            .send(req);
        expect(res.statusCode).toBe(200);
    });

    test("Invalid request 'springCourseList'", async () => {
        const req = {
            sub: myUser.sub,
            className: mySchedule.courses[0]["name"],
            classFormat: mySchedule.courses[0]["format"],
            term: "springCourseList"
        }

        const res = await request(app).put("/attendance")
            .send(req);
        expect(res.statusCode).toBe(400);
    });

    test("Invalid sub", async () => {
        const req = {
            sub: "Ryan Gosling",
            className: mySchedule.courses[0]["name"],
            classFormat: mySchedule.courses[0]["format"],
            term: "fallCourseList"
        }

        const res = await request(app).put("/attendance")
            .send(req);
        expect(res.statusCode).toBe(400);
    });
    
    test("Empty request body", async () => {
        const res = await request(app).put("/attendance").send({});
        expect(res.statusCode).toBe(400);
    });
});