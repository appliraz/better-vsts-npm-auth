export declare type IYarnRcYmlSettings = {
    [key: string]: IYarnRcYmlSettings | string;
};
/**
 * Represents an .yarnrc.yml configuration file and presents an interface
 * for interactions with it.
 */
export declare class YarnrcYml {
    filePath: string;
    settings: IYarnRcYmlSettings;
    /**
     * @param {string} basePath - path to .yarnrc.yml file or directory containing .yarnrc.yml file
     */
    constructor(basePath: string);
    /**
     * Returns a YarnrcYml instance for the user-level config file.
     * Does not invoke npm; uses same path convention as user .npmrc.
     */
    static getUserNpmrc(): YarnrcYml;
    /**
     * Inspects this object's settings for registry entries
     * and returns an array of Registry objects for the ones
     * it finds.
     * @returns {Registry[]}
     */
    getRegistries(settings?: IYarnRcYmlSettings): Array<YarnRcYmlRegistry>;
    /**
     * Reads the contents of the .yarnrc.yml file corresponding
     * to this object then parses and initializes settings.
     * When finished, returns this object.
     */
    readSettingsFromFile(): Promise<YarnrcYml>;
    /**
     * Encodes this object's settings and then
     * writes them to disk at the .yarnrc location
     * the object was instantiated from.
     */
    saveSettingsToFile(): Promise<void>;
}
export interface IYarnRcYmlBasicAuthSettings {
    username: string;
    password: string;
}
export declare class YarnRcYmlRegistry {
    url: string;
    token: string;
    feed: string;
    project: string;
    basicAuthSettings: IYarnRcYmlBasicAuthSettings;
    constructor(registryUrl: string);
    /**
     * Returns the auth settings for this Registry
     */
    getAuthSettings(): IYarnRcYmlSettings;
}
