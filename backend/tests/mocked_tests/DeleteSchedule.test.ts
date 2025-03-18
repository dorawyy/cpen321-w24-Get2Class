import { serverReady, cronResetAttendance } from '../../index';
import { mySchedule, myUser, myDBScheduleItem, DBScheduleItem } from "../utils";
import { client } from '../../services';
import request from 'supertest';
import { Server } from "http";

let server: Server;

beforeAll(async () => {
    // Wait for the server to be ready
    server = await serverReady;  
    let dbScheduleItem: DBScheduleItem = myDBScheduleItem;
    dbScheduleItem.fallCourseList = mySchedule.courses;
    await client.db("get2class").collection("schedules").insertOne(myDBScheduleItem);
});

afterAll(async () => {
    // Initialize DB for tests
    await client.db("get2class").collection("schedules").deleteOne({
        sub: myUser.sub
    });
    await client.close();
    cronResetAttendance.stop();
    await new Promise((resolve) => { resolve(server.close()); });

});

// Interface DELETE /schedule
describe("Mocked: DELETE /schedule", () => {
    // Mocked behavior: client db/collection throws an error
    // Input: valid subject id
    // Expected status code: 500
    // Expected behavior: should return error response due to db/collection failure
    // Expected output: error response with status 500 and error message "Database connection error"
    test("Unable to reach get2class database", async () => {
        const dbSpy = jest.spyOn(client, "db").mockImplementationOnce(() => {
            throw new Error("Database connection error");
        });

        const req = {sub: myUser.sub, fallCourseList: "fallCourseList"};
        const res = await request(server).delete("/schedule").send(req);
        
        expect(res.statusCode).toStrictEqual(500);
        expect(dbSpy).toHaveBeenCalledWith('get2class');
        expect(dbSpy).toHaveBeenCalledTimes(1);

        dbSpy.mockRestore();
    });
});