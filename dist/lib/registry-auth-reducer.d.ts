import { Registry } from "./npm";
import { YarnRcYmlRegistry } from "./yarnrcyml";
export interface IRegistryCollectionShards {
    sameCollection: Array<Registry | YarnRcYmlRegistry>;
    differentCollection: Array<Registry | YarnRcYmlRegistry>;
}
/**
 * Given an array of Registry objects, returns only those
 * which are unique and correspond to a VSTS feed.
 */
export declare function filterUniqueVstsRegistries(registries: Array<Registry | YarnRcYmlRegistry>): Array<Registry | YarnRcYmlRegistry>;
export declare function isInSameCollection(r: Registry | YarnRcYmlRegistry): boolean;
/**
 * Given an array of Registry objects, splits them
 * by the collection their VSTS feed resides in. Only
 * splits by whether they are in the same collection
 * as the current job scope or a different one. This
 * depends on running inside of a VSTS agent context
 * as it depends on SYSTEM_TEAMFOUNDATIONCOLLECTIONURI.
 */
export declare function shardRegistriesByCollection(registries: Array<Registry | YarnRcYmlRegistry>): IRegistryCollectionShards;
export declare function authenticateRegistries(...registries: Array<Registry | YarnRcYmlRegistry>): Promise<Array<Registry | YarnRcYmlRegistry>>;
