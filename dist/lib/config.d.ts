export interface IConfigDictionary {
    [key: string]: string;
}
/**
 * Represents the user configuration for better-vsts-npm-auth
 * and presents an interface for interactions with it.
 */
export declare class Config {
    /**
     * Uses the given path as the location for the module's
     * configuration file instead of the default.
     */
    static setConfigPath(path: string): void;
    /**
     * Adds or updates the given setting and writes it
     * to the configuration file.
     */
    static set(key: string, val: string): void;
    /**
     * Forces a write of the given object to the
     * configuration file.
     */
    static write(obj: IConfigDictionary): void;
    /**
     * Reads the configuration file from disk and
     * returns the parsed config object.
     */
    static get(): IConfigDictionary;
}
