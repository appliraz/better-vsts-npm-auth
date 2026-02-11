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
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("./config");
const node_fetch_1 = require("node-fetch");
const querystring = require("querystring");
const k_REFRESH_TOKEN = "refresh_token";
const ONE_SECOND_IN_MS = 1000;
class AuthorizationError extends Error {
    constructor(...a) {
        super(...a);
    }
}
exports.AuthorizationError = AuthorizationError;
function getVstsLabOauthToken() {
    return process.env["SYSTEM_ACCESSTOKEN"];
}
exports.getVstsLabOauthToken = getVstsLabOauthToken;
function isVstsFeedUrl(url) {
    if (!(url.indexOf("/_packaging/") > -1)) {
        return false;
    }
    let isLegacyUri = url.indexOf("pkgs.visualstudio.com/") > -1;
    if (isLegacyUri) {
        return true;
    }
    else {
        let isAdoUri = url.indexOf("pkgs.dev.azure.com/") > -1;
        return isAdoUri;
    }
}
exports.isVstsFeedUrl = isVstsFeedUrl;
function setRefreshToken(token) {
    config_1.Config.set(k_REFRESH_TOKEN, token);
}
exports.setRefreshToken = setRefreshToken;
function getUserAuthToken() {
    return __awaiter(this, void 0, void 0, function* () {
        let configObj = config_1.Config.get();
        // validate config
        if (!configObj || !configObj.tokenEndpoint) {
            return Promise.reject(new Error("invalid config, missing tokenEndpoint"));
        }
        else if (!configObj[k_REFRESH_TOKEN]) {
            return Promise.reject(new AuthorizationError("missing " + k_REFRESH_TOKEN));
        }
        const response = yield node_fetch_1.default(`${configObj.tokenEndpoint}?${querystring.stringify({ code: configObj[k_REFRESH_TOKEN] })}`, {
            method: 'POST'
        });
        const body = yield response.json();
        if (!body || !body[k_REFRESH_TOKEN] || !body.access_token) {
            throw "malformed response body:\n" + body;
        }
        // stash the refresh_token
        config_1.Config.set(k_REFRESH_TOKEN, body[k_REFRESH_TOKEN]);
        const accessToken = body.access_token;
        // VSTS auth service doesn't accomodate clock skew well
        // in these "JIT" scenarios. Check if the token nbf is
        // after our time, and wait for the difference if it is.
        let newTokenDecoded = jsonwebtoken_1.decode(accessToken);
        console.log("\nnew token received:", "\n\tnbf:", newTokenDecoded && newTokenDecoded.nbf, "\n\texp:", newTokenDecoded && newTokenDecoded.exp, "\n\tscope:", newTokenDecoded && newTokenDecoded.scp);
        // print out information about the token's time window for which it's valid
        const now = Date.now();
        const NOW_IN_EPOCH = Math.floor(now / ONE_SECOND_IN_MS);
        if (newTokenDecoded.nbf > NOW_IN_EPOCH) {
            const timeToWaitInMs = Math.floor(newTokenDecoded.nbf - NOW_IN_EPOCH) *
                ONE_SECOND_IN_MS;
            console.log("waiting out clock skew of", timeToWaitInMs, "milliseconds.");
            yield new Promise(r => setTimeout(r, timeToWaitInMs));
        }
        return accessToken;
    });
}
exports.getUserAuthToken = getUserAuthToken;
//# sourceMappingURL=vsts-auth-client.js.map