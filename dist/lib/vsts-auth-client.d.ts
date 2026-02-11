export declare class AuthorizationError extends Error {
    constructor(...a: Array<any>);
}
export declare function getVstsLabOauthToken(): string;
export declare function isVstsFeedUrl(url: string): boolean;
export declare function setRefreshToken(token: string): void;
export declare function getUserAuthToken(): Promise<string>;
