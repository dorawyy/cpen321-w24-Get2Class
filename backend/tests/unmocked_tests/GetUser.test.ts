import { serverReady, cronResetAttendance } from '../../index';
import { client } from '../../services';
import request from 'supertest';

let server: any;

beforeAll(async () => {
    server = await serverReady;

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
    cronResetAttendance.stop();
    await server.close();
});

describe("Unmocked: GET /user", () => {
    test("Found valid user", async () => {
        const res = await request(server).get("/user").query({sub: "123"});

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('email');
        expect(res.body).toHaveProperty('sub');
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('karma');
        expect(res.body).toHaveProperty('notificationTime');
        expect(res.body).toHaveProperty('notificationsEnabled');
    });

    test("No valid user", async () => {
        const res = await request(server).get("/user").query({sub: "blahblah"});

        expect(res.statusCode).toBe(400);
        expect(res.text).toBe("User does not exist");
        expect(res.body).toEqual({});
    });

    test("Empty query", async () => {
        const res = await request(server).get("/user").query({});

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
    });
});
