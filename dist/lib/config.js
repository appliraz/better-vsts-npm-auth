"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
const ini_1 = require("ini");
const DEFAULT_CONFIG_PATH = path_1.join(os_1.homedir(), ".vstsnpmauthrc");
let configPathOverride = undefined;
const getConfigPath = () => configPathOverride ? configPathOverride : DEFAULT_CONFIG_PATH;
const defaults = {
    clientId: "C0518EF9-B87D-4C07-9132-CF404B18B546",
    redirectUri: "https://stateless-vsts-oauth.azurewebsites.net/oauth-callback",
    tokenEndpoint: "https://stateless-vsts-oauth.azurewebsites.net/token-refresh",
    tokenExpiryGraceInMs: "1800000"
};
/**
 * Represents the user configuration for better-vsts-npm-auth
 * and presents an interface for interactions with it.
 */
class Config {
    /**
     * Uses the given path as the location for the module's
     * configuration file instead of the default.
     */
    static setConfigPath(path) {
        configPathOverride = path;
    }
    /**
     * Adds or updates the given setting and writes it
     * to the configuration file.
     */
    static set(key, val) {
        let configObj = Config.get();
        configObj[key] = val;
        Config.write(configObj);
    }
    /**
     * Forces a write of the given object to the
     * configuration file.
     */
    static write(obj) {
        let configContents = ini_1.encode(obj);
        let configPath = getConfigPath();
        fs_1.writeFileSync(configPath, configContents);
    }
    /**
     * Reads the configuration file from disk and
     * returns the parsed config object.
     */
    static get() {
        let configContents = "";
        try {
            // we're deliberately using a sync call here because
            // otherwise the yargs command doesn't prevent the
            // rest of the program from running
            configContents = fs_1.readFileSync(getConfigPath(), "utf8");
        }
        catch (e) {
            // the config file is optional, so if it doesn't exist
            // just swallow the error and return the default (empty)
            // object. Otherwise, throw the error.
            if (e.code !== "ENOENT") {
                throw e;
            }
        }
        let configObj = ini_1.parse(configContents);
        // merge with defaults, with user specified config taking precedence
        return Object.assign({}, defaults, configObj);
    }
}
exports.Config = Config;
//# sourceMappingURL=config.js.map