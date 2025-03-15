import { OAuth2Client } from "google-auth-library";
import { serverReady, cronResetAttendance } from '../../index';
import { client } from '../../services';
import request from 'supertest';

let server: any;

jest.mock('google-auth-library', () => {
    return {
        OAuth2Client: jest.fn().mockImplementation()
    };
});

beforeAll(async () => {
    server = await serverReady;
});

afterAll(async () => {
    await client.close();
    cronResetAttendance.stop();
    await server.close();
});

describe("Unmocked: POST /tokensignin", () => {
    test("Return a sub from payload", async () => {
        const mockVerifyIdToken = jest.fn().mockResolvedValue({
            getPayload: () => ({ sub: "123" })
        });

        (OAuth2Client as any).mockImplementation(() => ({
            verifyIdToken: mockVerifyIdToken
        }));

        const res = await request(server).post('/tokensignin').send({
            idToken: "mock-id-token",
            audience: "mock-audience"
        });

        expect(mockVerifyIdToken).toHaveBeenCalledWith({
            idToken: "mock-id-token",
            audience: "mock-audience"
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ sub: "123" });
    });

    test("No data sent in body", async () => {
        const mockVerifyIdToken = jest.fn().mockResolvedValue({
            getPayload: () => ({ sub: "123" })
        });

        (OAuth2Client as any).mockImplementation(() => ({
            verifyIdToken: mockVerifyIdToken
        }));

        const res = await request(server).post('/tokensignin').send({});

        expect(mockVerifyIdToken).toHaveBeenCalledTimes(0);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
    })
});