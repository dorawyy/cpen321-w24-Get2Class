const { serverReady, cronResetAttendance } = require("../../index");
const { mySchedule, myUser, myDBScheduleItem } = require("../utils");
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
    await server.close();
});


describe("Unmocked: PUT /schedule", () => {
    test("Empty request body", async () => {
        const res = await request(server).put("/schedule").send({});
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
    });

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

    test("Invalid user sub", async () => {
        const req = {
            sub: "Ryan Gosling",
            summerCourseList: mySchedule.courses
        };

        const res = await request(server).put("/schedule").send(req);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('acknowledged');
        expect(res.body).toHaveProperty('message');
    });
});