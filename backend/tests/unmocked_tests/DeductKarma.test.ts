import { Server } from 'http';
import { serverReady, cronResetAttendance, resetAttendanceController, cronDeductKarma } from '../../index';
import { client } from '../../services';
import request from 'supertest';

let server: Server;

beforeAll(async () => {
    server = await serverReady;
});

beforeEach(async () => {
    await client.db("get2class").collection("schedules").insertOne({ 
        email: "asdfasdf@gmail.com",
        sub: "123",
        name: "asdfasdf",
        fallCourseList: [
            {
                name: "CPEN 321 - Software Engineering",
                daysBool: "[true, false, true, false, false]",
                startTime: "(15, 30)",
                endTime: "(17, 0)",
                startDate: "2025-01-06",
                endDate: "2025-04-07",
                location: "CHBE - Room 102",
                credits: 4,
                format: "Lecture",
                attended: false
            }
        ],
        winterCourseList: [
            {
                name: "CPEN 321 - Software Engineering",
                daysBool: "[true, false, true, false, false]",
                startTime: "(15, 30)",
                endTime: "(17, 0)",
                startDate: "2025-01-06",
                endDate: "2025-04-07",
                location: "CHBE - Room 102",
                credits: 4,
                format: "Lecture",
                attended: false
            }
        ],
        summerCourseList: [
            {
                name: "CPEN 321 - Software Engineering",
                daysBool: "[true, false, true, false, false]",
                startTime: "(15, 30)",
                endTime: "(17, 0)",
                startDate: "2025-01-06",
                endDate: "2025-04-07",
                location: "CHBE - Room 102",
                credits: 4,
                format: "Lecture",
                attended: false
            }
        ]
     });

     await client.db("get2class").collection("users").insertOne({
        email: "asdfasdf@gmail.com",
        sub: "123",
        name: "asdfasdf",
        karma: 0,
        notificationTime: 15,
        notificationsEnabled: true
     });
});

afterEach(async () => {
    await client.db("get2class").collection("schedules").deleteOne({
        sub: "123"
    });
    await client.db("get2class").collection("users").deleteOne({
        sub: "123"
    });
});

afterAll(async () => {
    await client.close();
    await cronResetAttendance.stop();
    cronDeductKarma.stop();
    await new Promise((resolve) => { resolve(server.close()); });
});

// Unmocked Tests for Deduct Karma
describe("Unmocked: Test deduct attendance karma logic", () => {
    // Input: none
    // Expected status code: 200
    // Expected bahaviour: should deduct the user's karma based on the day and the classes they have not attended (this is for classes in the winter term)
    // Expected output: karma is -40
    test("Test karma reduction for term: winter", async () => {
        jest.spyOn(global.Date.prototype, 'getDay').mockReturnValueOnce(1);
        jest.spyOn(global.Date.prototype, 'getMonth').mockReturnValueOnce(1);

        await resetAttendanceController.deductKarma();

        const res = await request(server).get("/user").query({ sub: "123" });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("karma", -40);

        jest.resetAllMocks();
    });

    // Input: none
    // Expected status code: 200
    // Expected bahaviour: should deduct the user's karma based on the day and the classes they have not attended (this is for classes in the summer term)
    // Expected output: karma is -40
    test("Test karma reduction for term: summer", async () => {
        jest.spyOn(global.Date.prototype, 'getDay').mockReturnValueOnce(1);
        jest.spyOn(global.Date.prototype, 'getMonth').mockReturnValueOnce(5);

        await resetAttendanceController.deductKarma();

        const res = await request(server).get("/user").query({ sub: "123" });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("karma", -40);

        jest.resetAllMocks();
    });

    // Input: none
    // Expected status code: 200
    // Expected bahaviour: should deduct the user's karma based on the day and the classes they have not attended (this is for classes in the fall term)
    // Expected output: karma is -40
    test("Test karma reduction for term: fall", async () => {
        jest.spyOn(global.Date.prototype, 'getDay').mockReturnValueOnce(1);
        jest.spyOn(global.Date.prototype, 'getMonth').mockReturnValueOnce(8);

        await resetAttendanceController.deductKarma();

        const res = await request(server).get("/user").query({ sub: "123" });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("karma", -40);
    });
});