const request = require("supertest");
const { app, serverReady, client, resetAttendanceJob } = require("../../index");
import { Server } from "http";

let server: Server;

beforeAll(async () => {
    server = await serverReady;  // Wait for the server to be ready
});

afterAll(async () => {
    if (resetAttendanceJob) {
        resetAttendanceJob.stop(); // Stop the cron job to prevent Jest from hanging
    }
    if (client) {
        await client.close();
    }
    if (server) {
        await new Promise((resolve) => server.close(resolve));
    }
});

describe("Unmocked: PUT /schedule", () => {

    test("Empty request body", async () => {
        const res = await request(app).put("/schedule").send({});
        expect(res.statusCode).toBe(400);
    });
});