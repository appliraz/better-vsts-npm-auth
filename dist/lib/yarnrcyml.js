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
const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
const npm_1 = require("./npm");
/**
 * Represents an .yarnrc.yml configuration file and presents an interface
 * for interactions with it.
 */
class YarnrcYml {
    /**
     * @param {string} basePath - path to .yarnrc.yml file or directory containing .yarnrc.yml file
     */
    constructor(basePath) {
        if (!basePath) {
            throw new Error("Yarnrcyml constructor must be called with directory which contains the .yarnrc.yml file");
        }
        if (!basePath.endsWith(".yarnrc.yml")) {
            basePath = path.join(basePath, ".yarnrc.yml");
        }
        this.filePath = basePath;
        this.settings = {};
    }
    /**
     * Returns a YarnrcYml instance for the user-level config file.
     * Does not invoke npm; uses same path convention as user .npmrc.
     */
    static getUserNpmrc() {
        const userNpmrcPath = npm_1.getUserNpmrcPath();
        let userConfigPath;
        if (userNpmrcPath.endsWith(".npmrc")) {
            userConfigPath = path.join(userNpmrcPath.substring(0, userNpmrcPath.length - ".npmrc".length), ".yarnrc.yml");
        }
        else {
            userConfigPath = path.join(path.dirname(userNpmrcPath), ".yarnrc.yml");
        }
        return new YarnrcYml(userConfigPath);
    }
    /**
     * Inspects this object's settings for registry entries
     * and returns an array of Registry objects for the ones
     * it finds.
     * @returns {Registry[]}
     */
    getRegistries(settings) {
        let settingsKeys = Object.getOwnPropertyNames(settings || this.settings);
        let registries = [];
        settingsKeys.forEach(key => {
            const settingValue = settings ? settings[key] : this.settings[key];
            if (typeof settingValue === "object") {
                registries.push(...this.getRegistries(settingValue));
            }
            else {
                if (key.indexOf("npmRegistryServer") > -1) {
                    registries.push(new YarnRcYmlRegistry(settingValue));
                }
            }
        });
        return registries;
    }
    /**
     * Reads the contents of the .yarnrc.yml file corresponding
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
                            that.settings = yaml.load(data || "") || {};
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
     * writes them to disk at the .yarnrc location
     * the object was instantiated from.
     */
    saveSettingsToFile() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs.writeFile(this.filePath, yaml.dump(this.settings), err => {
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
}
exports.YarnrcYml = YarnrcYml;
class YarnRcYmlRegistry {
    constructor(registryUrl) {
        if (!registryUrl) {
            throw new Error("Registry constructor must be called with url for the given registry");
        }
        this.url = registryUrl;
        this.token = "";
        this.basicAuthSettings = {
            username: null,
            password: null,
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
            result.npmRegistries = {
                [`${identifier}registry/`]: {
                    'npmAuthToken': this.token,
                }
            };
        }
        else {
            if (this.basicAuthSettings.username && this.basicAuthSettings.password) {
                result.npmAuthIdent = `${this.basicAuthSettings.username}:${this.basicAuthSettings.password}`;
            }
        }
        return result;
    }
}
exports.YarnRcYmlRegistry = YarnRcYmlRegistry;
//# sourceMappingURL=yarnrcyml.js.map