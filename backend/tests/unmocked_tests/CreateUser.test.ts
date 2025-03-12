import { serverReady, cronResetAttendance } from '../../index';
import { client } from '../../services';
import request from 'supertest';

let server: any;

beforeAll(async () => {
    server = await serverReady;
});

afterAll(async () => {
    await client.db("get2class").collection("users").deleteOne({
        sub: "123"
    });
    await client.db("get2class").collection("schedules").deleteOne({
        sub: "123"
    })
    await client.close();
    cronResetAttendance.stop();
    await server.close();
});

describe("Unmocked: POST /user", () => {
    test("Create a new user", async () => {
        const res = await request(server).post("/user").send({
            email: "createnewuser@gmail.com",
            sub: "123",
            name: "New User"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('userAcknowledged');
        expect(res.body).toHaveProperty('scheduleAcknowledged');
        expect(res.body).toHaveProperty('message');
    });

    test("Missing data when creating user", async () => {
        const res = await request(server).post("/user").send({
            sub: "123",
            name: "New User"
        });

        expect(res.statusCode).toBe(400);
    });

    test("Missing req.body when creating user", async () => {
        const res = await request(server).post("/user").send({});

        expect(res.statusCode).toBe(400);
    });
})