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

describe("Unmocked: PUT /karma", () => {
    test("Update valid user karma points", async () => {
        const res = await request(server).put("/karma").send({
            sub: "123",
            karma: 60
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('acknowledged');
        expect(res.body).toHaveProperty('message');
    });

    test("Unable to update a nonexistent user karma points", async () => {
        const res = await request(server).put("/karma").send({
            sub: "321",
            karma: 60
        });

        expect(res.statusCode).toBe(400);
        expect(res.text).toBe("User not found");
        expect(res.body).toEqual({});
    });

    test("Missing data field when updating karma points", async () => {
        const res = await request(server).put("/karma").send({
            sub: "123"
        });

        console.log(res.text);

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
    });

    test("No body in request", async () => {
        const res = await request(server).put("/karma").send({});

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
    })
});