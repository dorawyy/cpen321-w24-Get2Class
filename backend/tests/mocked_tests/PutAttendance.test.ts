import { serverReady, cronResetAttendance } from '../../index';
import { mySchedule, myUser, myDBScheduleItem, DBScheduleItem } from "../utils";
import { client } from '../../services';
import request from 'supertest';
import { Server } from "http";

let server: Server;

beforeAll(async () => {
    server = await serverReady;  // Wait for the server to be ready
    let schedule: DBScheduleItem = myDBScheduleItem;
    schedule.fallCourseList = mySchedule.courses;
    schedule.summerCourseList = mySchedule.courses;
    await client.db("get2class").collection("schedules").insertOne(myDBScheduleItem);
});

afterAll(async () => {
    await client.db("get2class").collection("schedules").deleteOne({
        sub: myUser.sub
    });
    await client.db("get2class").collection("schedules").deleteMany({
        sub: myUser.sub
    });
    await client.close();
    cronResetAttendance.stop();
    await new Promise((resolve) => { resolve(server.close()); });
});

// Interface PUT /attendance
describe("Mocked: PUT /attendance", () => {
    // Mocked behavior: client db/collection throws an error
    // Input: valid subject id
    // Expected status code: 500
    // Expected behavior: should return error response due to db/collection failure
    // Expected output: error response with status 500 and error message "Database connection error"
    test("Unable to reach get2class database", async () => {
        const dbSpy = jest.spyOn(client, "db").mockImplementationOnce(() => {
            throw new Error("Database connection error");
        });

        const req = {
            sub: myUser.sub,
            className: mySchedule.courses[0]["name"],
            classFormat: mySchedule.courses[0]["format"],
            term: "fallCourseList"
        }

        const res = await request(server).put("/attendance")
            .send(req);
        
        expect(res.statusCode).toStrictEqual(500);
        expect(dbSpy).toHaveBeenCalledWith('get2class');
        expect(dbSpy).toHaveBeenCalledTimes(1);

        dbSpy.mockRestore();
    });

    // Mocked behavior: client db/collection throws an error throws an error at the second client.db.collection call
    // Input: valid email, subject id, and name
    // Expected status code: 500
    // Expected behavior: should return error response due to db/collection failure
    // Expected output: error response with status 500 and error message "Database connection error"
    test("Unable to create schedule in schedules collection", async () => {
        const mockUserInsertResult = { sub: "123" };
        const insertUserMock = jest.fn().mockResolvedValueOnce(mockUserInsertResult);

        const userCollectionMock = jest.fn().mockImplementationOnce(() => {
            return { insertOne: insertUserMock }
        });

        const dbMock1 = {
            collection: userCollectionMock
        } as Partial<jest.Mocked<Db>>;

        const scheduleCollectionMock = jest.fn().mockImplementationOnce(() => {
            throw new Error("Database connection error");
        });
        
        const dbMock2 = {
            collection: scheduleCollectionMock
        } as Partial<jest.Mocked<Db>>;

        const dbSpy = jest.spyOn(client, "db").mockReturnValueOnce(
            dbMock1 as Db
        ).mockReturnValueOnce(
            dbMock2 as Db
        );

        const res = await request(server).post('/user').send({
            email: "createnewuser@gmail.com",
            sub: "123",
            name: "New User"
        });

        expect(res.statusCode).toStrictEqual(500);
        expect(userCollectionMock).toHaveBeenCalledWith('users');
        expect(userCollectionMock).toHaveBeenCalledTimes(1);
        expect(scheduleCollectionMock).toHaveBeenCalledWith('schedules');
        expect(scheduleCollectionMock).toHaveBeenCalledTimes(1);
        expect(dbSpy).toHaveBeenCalledWith('get2class');
        expect(dbSpy).toHaveBeenCalledTimes(2);

        userCollectionMock.mockRestore();
        scheduleCollectionMock.mockRestore();
        dbSpy.mockRestore();
    });
});