import { app } from '../../index';
import { client } from '../../services';
import request from 'supertest';

beforeAll(async () => {
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
    await client.db("get2class").collection("users").deleteOne({
        sub: "123"
    });
    await client.close();
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
