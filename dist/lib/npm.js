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
const fs = require("fs");
const path = require("path");
const ini = require("ini");
const os_1 = require("os");
const AUTHTOKEN_PARTIAL_KEY = ":_authToken";
/**
 * Returns the path to the user-level .npmrc file without invoking npm.
 * Uses NPM_CONFIG_USERCONFIG if set, otherwise ~/.npmrc.
 * Works with npm, pnpm, and Yarn.
 */
function getUserNpmrcPath() {
    if (process.env.NPM_CONFIG_USERCONFIG) {
        return process.env.NPM_CONFIG_USERCONFIG;
    }
    return path.join(os_1.homedir(), ".npmrc");
}
exports.getUserNpmrcPath = getUserNpmrcPath;
/**
 * Represents an .npmrc configuration file and presents an interface
 * for interactions with it.
 */
class Npmrc {
    /**
     * @param {string} basePath - path to .npmrc file or directory containing .npmrc file
     */
    constructor(basePath) {
        if (!basePath) {
            throw new Error("Npmrc constructor must be called with directory which contains the .npmrc file");
        }
        if (!basePath.endsWith(".npmrc")) {
            basePath = path.join(basePath, ".npmrc");
        }
        this.filePath = basePath;
        this.settings = {};
    }
    /**
     * Inspects this object's settings for registry entries
     * and returns an array of Registry objects for the ones
     * it finds.
     * @returns {Registry[]}
     */
    getRegistries() {
        let settingsKeys = Object.getOwnPropertyNames(this.settings);
        let registries = [];
        settingsKeys.forEach(key => {
            if (key.indexOf("registry") > -1) {
                registries.push(new Registry(this.settings[key]));
            }
        });
        return registries;
    }
    /**
     * Reads the contents of the .npmrc file corresponding
     * to this object then parses and initializes settings.
     * When finished, returns this object.
     */
    readSettingsFromFile() {
        return __awaiter(this, void 0, void 0, function* () {
            let that = this;
            return new Promise((resolve, reject) => {
                fs.readFile(that.filePath, "utf8", (err, data) => {
                    if (err && err.code !== "ENOENT") {
                        reject(err);
                    }
                    else {
                        try {
                            console.log("config from", that.filePath);
                            that.settings = ini.parse(data || "");
                            if (that.settings[""]) {
                                delete that.settings[""];
                            }
                            resolve(that);
                        }
                        catch (e) {
                            reject(e);
                        }
                    }
                });
            });
        });
    }
    /**
     * Encodes this object's settings and then
     * writes them to disk at the .npmrc location
     * the object was instantiated from.
     */
    saveSettingsToFile() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs.writeFile(this.filePath, ini.encode(this.settings), err => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    /**
     * Checks whether the given key is an auth setting.
     */
    static isAuthSetting(key) {
        return key.indexOf(AUTHTOKEN_PARTIAL_KEY) > -1;
    }
    /**
     * Returns an Npmrc instance for the user-level config file.
     * Does not invoke npm; uses homedir or NPM_CONFIG_USERCONFIG.
     */
    static getUserNpmrc() {
        return new Npmrc(getUserNpmrcPath());
    }
}
exports.Npmrc = Npmrc;
/**
 * An abstraction for an npm registry configuration entry
 */
class Registry {
    constructor(registryUrl) {
        if (!registryUrl) {
            throw new Error("Registry constructor must be called with url for the given registry");
        }
        this.url = registryUrl;
        this.token = "";
        this.basicAuthSettings = {
            username: null,
            password: null,
            email: null
        };
        let feedResult = /_packaging\/(.*)\/npm\/registry/i.exec(registryUrl);
        let projectResult = /https?:\/\/(.*)\.pkgs\.visualstudio/i.exec(registryUrl);
        if (projectResult === null) {
            projectResult = /https?:\/\/pkgs\.dev\.azure\.com\/(.+?)\//i.exec(registryUrl);
        }
        this.feed = feedResult && feedResult[1];
        this.project = projectResult && projectResult[1];
    }
    /**
     * Returns the auth settings for this Registry
     */
    getAuthSettings() {
        let result = {};
        if (this.token) {
            let match = /https?:(.*)registry/gi.exec(this.url);
            let identifier = match && match[1];
            result[`${identifier}${AUTHTOKEN_PARTIAL_KEY}`] = this.token;
            result[`${identifier}registry/${AUTHTOKEN_PARTIAL_KEY}`] = this.token;
        }
        else {
            result = this.basicAuthSettings;
        }
        return result;
    }
}
exports.Registry = Registry;
//# sourceMappingURL=npm.js.map