const { serverReady, cronResetAttendance } = require("../../index");
const { mySchedule, myUser, myDBScheduleItem } = require("../utils");
import { client } from '../../services';
import request from 'supertest';
import { Server } from "http";

let server: Server;

beforeAll(async () => {
    server = await serverReady;  // Wait for the server to be ready
    let schedule = myDBScheduleItem;
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
    await server.close();
});


describe("Unmocked: PUT /attendance", () => {
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
    });

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
    });

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
    });
    
    test("Empty request body", async () => {
        const req = {};
        const res = await request(server).put("/attendance").send(req);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
    });
});