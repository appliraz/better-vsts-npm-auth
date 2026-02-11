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
const npm_1 = require("./lib/npm");
const config_1 = require("./lib/config");
const registry_auth_reducer_1 = require("./lib/registry-auth-reducer");
const vsts_auth_client_1 = require("./lib/vsts-auth-client");
const yarnrcyml_1 = require("./lib/yarnrcyml");
const uuid = require("uuid/v4");
const fs = require("fs");
var vsts_auth_client_2 = require("./lib/vsts-auth-client");
exports.setRefreshToken = vsts_auth_client_2.setRefreshToken;
/**
 * Authentication library for maintaining an up-to-date
 * authentication token in the user's npmrc for interfacing with
 * VSTS feeds
 *
 * Workflow:
 *   1.    read into memory the npmrc credentials from the given project
 *         in order to see which registries we need credentials for
 *   2.a   if there are credentials in ~/.npmrc, verify that the token
 *         has more than 1 week until it expires
 *   2.b   if not, request an access_token and store the
 *         new credentials in ~/.npmrc
 *
 *   A note on authentication & authorization:
 *         this program should not prompt the user unless absolutely
 *         necessary. Authentication should only be needed once, when
 *         this program is run for the very first time on a device.
 *         Any subsequent authorization needs (such as for step 2.b
 *         above) should use the cached refresh_token to gain a fresh
 *         access_token for authorization.
 */
function isAuthorizationError(e) {
    return e instanceof vsts_auth_client_1.AuthorizationError;
}
exports.isAuthorizationError = isAuthorizationError;
function run(options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        let configObj;
        try {
            if (options.configOverride) {
                config_1.Config.setConfigPath(options.configOverride);
            }
            configObj = config_1.Config.get();
            // if npmrcPath / yarnrcPath isn't specified, default is the working directory
            options.npmrcPath = options.npmrcPath || process.cwd();
            options.yarnrcYmlPath = options.yarnrcYmlPath || process.cwd();
            const projectYarnrcYml = new yarnrcyml_1.YarnrcYml(options.yarnrcYmlPath);
            const isProjectUsingYarnv2 = fs.existsSync(projectYarnrcYml.filePath);
            let userRc, projectRc;
            if (!isProjectUsingYarnv2) {
                [userRc, projectRc] = yield Promise.all([
                    npm_1.Npmrc.getUserNpmrc().readSettingsFromFile(),
                    new npm_1.Npmrc(options.npmrcPath).readSettingsFromFile()
                ]);
            }
            else {
                [userRc, projectRc] = yield Promise.all([
                    yarnrcyml_1.YarnrcYml.getUserNpmrc().readSettingsFromFile(),
                    new yarnrcyml_1.YarnrcYml(options.yarnrcYmlPath).readSettingsFromFile()
                ]);
            }
            let authenticatedRegistries = yield registry_auth_reducer_1.authenticateRegistries(...userRc.getRegistries(), ...projectRc.getRegistries());
            // get the new settings which need to be written to the user npmrc file
            console.log("Authenticating the following registries:\n", authenticatedRegistries.map(r => `\t${r.url}\n`).join(""));
            let authSettings = authenticatedRegistries.map(r => r.getAuthSettings());
            Object.assign(userRc.settings, ...authSettings);
            yield userRc.saveSettingsToFile();
        }
        catch (e) {
            // if this is running in a CI environment, reject to signal failure
            // otherwise, open the auth page as the error is likely due to
            // the user needing to authorize the app and/or configure their
            // refresh_token
            if (!process.env.BUILD_BUILDID && !process.env.RELEASE_RELEASEID) {
                // as of April 2020, appears this endpoint is staying as-is for now even with the branding
                // change to "Azure DevOps": https://web.archive.org/web/20200406154934/https://docs.microsoft.com/en-us/azure/devops/integrate/get-started/authentication/oauth?view=azure-devops
                let consentUrl = `https://app.vssps.visualstudio.com/oauth2/authorize?client_id=${configObj.clientId}&response_type=Assertion&state=${uuid()}&scope=vso.packaging_write&redirect_uri=${configObj.redirectUri}`;
                console.log("\n*****\n" +
                    "We need user consent before this script can run.\n\n" +
                    "Follow instructions in the browser window that just opened, or if a browser does not open,\n" +
                    "manually browse to this url and follow the instructions there:\n\n" +
                    `${consentUrl}\n\n` +
                    "Then run better-vsts-npm-auth again after consent has been granted.\n*****\n");
            }
            // no matter what, we error out here
            if (options.stack === true) {
                throw e;
            }
            else {
                process.exit(1);
            }
        }
    });
}
exports.run = run;
//# sourceMappingURL=index.js.map