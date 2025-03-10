const request = require("supertest");
const { app } = require("../../index");


describe("Unmocked: PUT /schedule", () => {
    test("Empty request body", async () => {
        const res = await request(app).put("/schedule").send({});
        expect(res.statusCode).toBe(400);
    });
});