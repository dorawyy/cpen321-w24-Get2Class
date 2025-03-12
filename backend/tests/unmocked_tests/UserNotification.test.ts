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

describe("Unmocked: GET /notification_settings", () => {
    test("Get valid user notification settings", async () => {
        const res = await request(server).get("/notification_settings").query({sub: "123"});

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('notificationsEnabled');
        expect(res.body).toHaveProperty('notificationTime');
    });

    test("Unable to get nonexistent user notification settings", async () => {
        const res = await request(server).get("/notification_settings").query({sub: "blahblah"});

        expect(res.statusCode).toBe(400);
        expect(res.text).toBe("User not found");
        expect(res.body).toEqual({});
    });

    test("No sub in query", async () => {
        const res = await request(server).get("/notification_settings").query({});

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
    });
});

describe("Unmocked: PUT /notification_settings", () => {
    test("Update valid user notification settings", async () => {
        const res = await request(server).put("/notification_settings").send({
            sub: "123",
            notificationTime: 10,
            notificationsEnabled: false
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('acknowledged');
        expect(res.body).toHaveProperty('message');
    });

    test("Unable to update nonexistent user notification settings", async () => {
        const res = await request(server).put("/notification_settings").send({
            sub: "321",
            notificationTime: 10,
            notificationsEnabled: false
        });

        expect(res.statusCode).toBe(400);
        expect(res.text).toBe("Unable to modify data");
        expect(res.body).toEqual({});
    });

    test("Missing data in body of request when updating user notification settings", async () => {
        const res = await request(server).put("/notification_settings").send({
            sub: "123",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
    });

    test("Missing req.body in request", async () => {
        const res = await request(server).put("/notification_settings").send({});

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
    });
});