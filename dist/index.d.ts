export { setRefreshToken } from "./lib/vsts-auth-client";
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
export declare function isAuthorizationError(e: Error): boolean;
export interface IRunOptions {
    configOverride?: string;
    npmrcPath?: string;
    yarnrcYmlPath?: string;
    stack?: boolean;
}
export declare function run(options?: IRunOptions): Promise<void>;
