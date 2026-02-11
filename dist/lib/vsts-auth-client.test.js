"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock("node-fetch");
jest.mock("jsonwebtoken");
jest.mock("./config");
const vsts_auth_client_1 = require("./vsts-auth-client");
const querystring = require("querystring");
const config_1 = require("./config");
let fetch = require("node-fetch");
let jwt = require("jsonwebtoken");
describe("In the vsts-auth-client module", () => {
    let originalEnv;
    beforeAll(() => {
        originalEnv = process.env;
        process.env = {};
    });
    afterAll(() => {
        process.env = originalEnv;
    });
    beforeEach(() => {
        process.env = {};
    });
    afterEach(() => {
        jest.resetAllMocks();
        expect.hasAssertions();
    });
    describe("the AuthorizationError class", () => {
        test("extends the Error class", () => {
            let x = new vsts_auth_client_1.AuthorizationError();
            expect(x).toBeInstanceOf(Error);
        });
        test("to pass constructor arguments to the Error class", () => {
            const msg = "foobar";
            let x = new vsts_auth_client_1.AuthorizationError(msg);
            expect(x).toHaveProperty("message", msg);
        });
    });
    describe("the setRefreshToken static method", () => {
        test("should set the config entry for refresh_token with the given token", () => {
            const fakeToken = "foo";
            vsts_auth_client_1.setRefreshToken(fakeToken);
            expect(config_1.Config.set).toHaveBeenCalledTimes(1);
            expect(config_1.Config.set).toHaveBeenCalledWith("refresh_token", fakeToken);
        });
    });
    describe("the getUserAuthToken static  method", () => {
        const fakeCode = "foo";
        const fakeAccessToken = "baz";
        const nowInMs = 10000;
        const now = nowInMs / 1000;
        beforeEach(() => {
            config_1.Config.get.mockImplementation(() => ({
                tokenEndpoint: "foo",
                refresh_token: "foo"
            }));
            fetch.mockImplementation((url) => {
                const queryString = querystring.stringify({ code: fakeCode });
                expect(url.slice(url.length - queryString.length)).toEqual(queryString);
                return Promise.resolve({
                    json: () => {
                        return Promise.resolve({ refresh_token: "bar", access_token: fakeAccessToken });
                    }
                });
            });
        });
        test("should reject if the config does not have a tokenEndpoint", () => {
            config_1.Config.get.mockImplementation(() => ({}));
            return expect(vsts_auth_client_1.getUserAuthToken()).rejects.toHaveProperty("message", "invalid config, missing tokenEndpoint");
        });
        test("should reject if the config does not have a refresh_token", () => {
            config_1.Config.get.mockImplementation(() => ({
                tokenEndpoint: "foo"
            }));
            let result = vsts_auth_client_1.getUserAuthToken();
            return expect(result)
                .rejects.toBeInstanceOf(vsts_auth_client_1.AuthorizationError)
                .then(() => expect(result).rejects.toHaveProperty("message", "missing refresh_token"));
        });
        describe("should reject if the token endpoint returns", () => {
            test("an error", () => {
                const errorObj = { error: "foo" };
                fetch.mockImplementation(() => {
                    return Promise.reject(errorObj);
                });
                return expect(vsts_auth_client_1.getUserAuthToken()).rejects.toEqual(errorObj);
            });
            describe("a response without", () => {
                const testData = [
                    { name: "a body", cbArgs: [null, null, null] },
                    { name: "a refresh_token in the body", cbArgs: [null, {}, {}] },
                    {
                        name: "an access_token in the body",
                        cbArgs: [null, {}, { refresh_token: "foo" }]
                    }
                ];
                testData.forEach(t => {
                    test(t.name, () => {
                        fetch.mockImplementation(() => {
                            return Promise.resolve({
                                json: () => {
                                    return Promise.resolve(t.cbArgs[2]);
                                }
                            });
                        });
                        return expect(vsts_auth_client_1.getUserAuthToken()).rejects.toContain("malformed response body:\n");
                    });
                });
            });
        });
        test("should make requests with refresh_token supplied as the code and return the access_token", () => {
            jwt.decode.mockImplementation(() => ({ nbf: now }));
            jest.spyOn(Date, "now").mockImplementation(() => nowInMs);
            jest.advanceTimersByTime(1000);
            return expect(vsts_auth_client_1.getUserAuthToken())
                .resolves.toEqual(fakeAccessToken)
                .then(() => {
                expect(fetch).toHaveBeenCalledTimes(1);
                expect.assertions(3);
            });
        });
        test("should not resolve until after the nbf claim in the returned token is >= the current time", () => __awaiter(this, void 0, void 0, function* () {
            const delay = 60000; // 1 minute
            jest.spyOn(Date, "now").mockImplementation(() => nowInMs);
            jwt.decode.mockImplementation(() => ({
                nbf: now + delay / 1000
            }));
            global.setTimeout = jest.fn((f, t) => {
                expect(t).toEqual(delay);
                f();
            });
            let authResponse = yield vsts_auth_client_1.getUserAuthToken();
            expect(authResponse).toEqual(fakeAccessToken);
            expect(fetch).toHaveBeenCalledTimes(1);
            expect.assertions(4);
        }));
    });
});
//# sourceMappingURL=vsts-auth-client.test.js.map