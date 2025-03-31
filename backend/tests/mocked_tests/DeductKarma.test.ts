import { Server } from 'http';
import { serverReady, cronDeductKarma, cronResetAttendance } from '../../index';
import { client } from '../../services';
import { Db } from 'mongodb';

let server: Server;

beforeAll(async () => {
    server = await serverReady;

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
});

afterAll(async () => {
    await client.db("get2class").collection("schedules").deleteOne({
        sub: "123"
    });
    await client.close();
    cronResetAttendance.stop();
    cronDeductKarma.stop();
    await new Promise((resolve) => { resolve(server.close()); });
});

// Mocked Tests for Deduct Karma
describe("Mocked: Test deduct attendance karma logic", () => {
    test("Throw error on first database call", () => {
        jest.spyOn(global.Date.prototype, 'getDay').mockReturnValueOnce(1);

        const dbSpy = jest.spyOn(client, "db").mockImplementationOnce(() => {
            throw new Error("Database connection error");
        });

        cronDeductKarma.now();

        expect(dbSpy).toHaveBeenCalledWith('get2class');
        expect(dbSpy).toHaveBeenCalledTimes(1);
    });

    test("Throw error on second database call", () => {
        jest.spyOn(global.Date.prototype, 'getDay').mockReturnValueOnce(1);

        const mockToArrayResult = [
            { 
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
            }
        ];
        const toArrayMock = jest.fn().mockResolvedValueOnce(mockToArrayResult);

        const findMock = jest.fn().mockImplementationOnce(() => {
            return { toArray: toArrayMock }
        });

        const scheduleCollectionMock1 = jest.fn().mockImplementationOnce(() => {
            return { find: findMock }
        });

        const dbMock1 = {
            collection: scheduleCollectionMock1
        } as Partial<jest.Mocked<Db>>;

        const userCollectionMock1 = jest.fn().mockImplementationOnce(() => {
            throw new Error("Database connection error");
        });

        const dbMock2 = {
            collection: userCollectionMock1
        } as Partial<jest.Mocked<Db>>;

        const dbSpy = jest.spyOn(client, "db").mockReturnValueOnce(
            dbMock1 as Db
        ).mockReturnValueOnce(
            dbMock2 as Db
        );

        cronDeductKarma.now();

        expect(dbSpy).toHaveBeenCalledWith('get2class');
        expect(dbSpy).toHaveBeenCalledTimes(2);
    });

    test("Throw error on third database call", () => {
        jest.spyOn(global.Date.prototype, 'getDay').mockReturnValueOnce(1);

        const mockToArrayResult = [
            { 
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
            }
        ];
        const toArrayMock = jest.fn().mockResolvedValueOnce(mockToArrayResult);

        const findMock = jest.fn().mockImplementationOnce(() => {
            return { toArray: toArrayMock }
        });

        const scheduleCollectionMock1 = jest.fn().mockImplementationOnce(() => {
            return { find: findMock }
        });

        const dbMock1 = {
            collection: scheduleCollectionMock1
        } as Partial<jest.Mocked<Db>>;

        const mockFindOneResult = {
            email: "asdfasdf@gmail.com",
            sub: "123",
            name: "asdf asdf",
            karma: "0"
        };
        const findOneMock = jest.fn().mockResolvedValueOnce(mockFindOneResult);

        const userCollectionMock1 = jest.fn().mockImplementationOnce(() => {
            return { findOne: findOneMock }
        });

        const dbMock2 = {
            collection: userCollectionMock1
        } as Partial<jest.Mocked<Db>>;

        const userCollectionMock2 = jest.fn().mockImplementationOnce(() => {
            throw new Error("Database connection error");
        });

        const dbMock3 = {
            collection: userCollectionMock2
        } as Partial<jest.Mocked<Db>>;

        const dbSpy = jest.spyOn(client, "db").mockReturnValueOnce(
            dbMock1 as Db
        ).mockReturnValueOnce(
            dbMock2 as Db
        ).mockReturnValueOnce(
            dbMock3 as Db
        );

        cronDeductKarma.now();

        expect(dbSpy).toHaveBeenCalledWith('get2class');
        expect(dbSpy).toHaveBeenCalledTimes(4);
    });
});