const { app, serverReady, resetAttendanceJob } = require("../../index");
import { client } from '../../services';
import request from 'supertest';
import { Server } from "http";

let server: Server;

beforeAll(async () => {
    server = await serverReady;  // Wait for the server to be ready
    await client.db("get2class").collection("users").insertOne({ 
        email: "asdfasdf@gmail.com",
        sub: "123",
        name: "asdfasdf",
        karma: 0,
        notificationTime: 15,
        notificationsEnabled: true
     });
});

afterAll(async () => {
    if (resetAttendanceJob) {
        resetAttendanceJob.stop(); // Stop the cron job to prevent Jest from hanging
    }
    if (client) {
        await client.db("get2class").collection("users").deleteOne({
            sub: "123"
        });
        await client.close();
    }
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
});

describe("Unmocked: GET /user", () => {
    test("Found valid user", async () => {
        const res = await request(app).get("/user").query({sub: "123"});

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('email');
    });

    test("No valid user", async () => {
        const res = await request(app).get("/user").query({sub: "blahblah"});
        expect(res.statusCode).toBe(400);
    });

    test("Empty query", async () => {
        const res = await request(app).get("/user").query({});
        expect(res.statusCode).toBe(400);
    });
});
