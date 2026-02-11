/**
 * Returns the path to the user-level .npmrc file without invoking npm.
 * Uses NPM_CONFIG_USERCONFIG if set, otherwise ~/.npmrc.
 * Works with npm, pnpm, and Yarn.
 */
export declare function getUserNpmrcPath(): string;
export interface INpmSettings {
    [key: string]: string;
}
/**
 * Represents an .npmrc configuration file and presents an interface
 * for interactions with it.
 */
export declare class Npmrc {
    filePath: string;
    settings: INpmSettings;
    /**
     * @param {string} basePath - path to .npmrc file or directory containing .npmrc file
     */
    constructor(basePath: string);
    /**
     * Inspects this object's settings for registry entries
     * and returns an array of Registry objects for the ones
     * it finds.
     * @returns {Registry[]}
     */
    getRegistries(): Array<Registry>;
    /**
     * Reads the contents of the .npmrc file corresponding
     * to this object then parses and initializes settings.
     * When finished, returns this object.
     */
    readSettingsFromFile(): Promise<Npmrc>;
    /**
     * Encodes this object's settings and then
     * writes them to disk at the .npmrc location
     * the object was instantiated from.
     */
    saveSettingsToFile(): Promise<void>;
    /**
     * Checks whether the given key is an auth setting.
     */
    static isAuthSetting(key: string): boolean;
    /**
     * Returns an Npmrc instance for the user-level config file.
     * Does not invoke npm; uses homedir or NPM_CONFIG_USERCONFIG.
     */
    static getUserNpmrc(): Npmrc;
}
export interface IBasicAuthSettings extends INpmSettings {
    username: string;
    password: string;
    email: string;
}
/**
 * An abstraction for an npm registry configuration entry
 */
export declare class Registry {
    url: string;
    token: string;
    basicAuthSettings: IBasicAuthSettings;
    feed: string;
    project: string;
    constructor(registryUrl: string);
    /**
     * Returns the auth settings for this Registry
     */
    getAuthSettings(): INpmSettings;
}
