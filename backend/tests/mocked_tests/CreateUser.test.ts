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
    });
    await client.close();
    await cronResetAttendance.stop();
    await server.close();
});

describe("Mocked: POST /user", () => {
    test("Unable to reach get2class database", async () => {
        const dbSpy = jest.spyOn(client, "db").mockImplementationOnce(() => {
            throw new Error("Database connection error");
        });

        const res = await request(server).post('/user').send({
            email: "createnewuser@gmail.com",
            sub: "123",
            name: "New User"
        });

        expect(res.statusCode).toStrictEqual(500);
        expect(dbSpy).toHaveBeenCalledWith('get2class');
        expect(dbSpy).toHaveBeenCalledTimes(1);

        dbSpy.mockRestore();
    });

    test("Unable to create user in users collection", async () => {
        const userCollectionMock = jest.fn().mockImplementationOnce(() => {
            throw new Error("Database connection error");
        });

        const dbSpy = jest.spyOn(client, "db").mockReturnValueOnce({
            collection: userCollectionMock
        } as any);

        const res = await request(server).post('/user').send({
            email: "createnewuser@gmail.com",
            sub: "123",
            name: "New User"
        });

        expect(res.statusCode).toStrictEqual(500);
        expect(userCollectionMock).toHaveBeenCalledWith('users');
        expect(userCollectionMock).toHaveBeenCalledTimes(1);
        expect(dbSpy).toHaveBeenCalledWith('get2class');
        expect(dbSpy).toHaveBeenCalledTimes(1);

        userCollectionMock.mockRestore();
        dbSpy.mockRestore();
    });

    test("Unable to create schedule in schedules collection", async () => {
        const mockUserInsertResult = { sub: "123" };
        const insertUserMock = jest.fn().mockResolvedValueOnce(mockUserInsertResult);

        const userCollectionMock = jest.fn().mockImplementationOnce(() => {
            return { insertOne: insertUserMock }
        });

        const scheduleCollectionMock = jest.fn().mockImplementationOnce(() => {
            throw new Error("Database connection error");
        });

        const dbSpy = jest.spyOn(client, "db").mockReturnValueOnce({
            collection: userCollectionMock
        } as any).mockReturnValueOnce({
            collection: scheduleCollectionMock
        } as any);

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