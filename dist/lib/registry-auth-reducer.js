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
const vsts_auth_client_1 = require("./vsts-auth-client");
const k_VstfCollectionUri = "SYSTEM_TEAMFOUNDATIONCOLLECTIONURI";
/**
 * Given an array of Registry objects, returns only those
 * which are unique and correspond to a VSTS feed.
 */
function filterUniqueVstsRegistries(registries) {
    return registries.filter((e, i) => {
        try {
            let _isUnique = registries.findIndex((v) => v.url === e.url) === i;
            let _isVstsRegistry = vsts_auth_client_1.isVstsFeedUrl(e.url);
            return _isUnique && _isVstsRegistry;
        }
        catch (e) {
            console.error("exception in filterUniqueVstsRegistries:", e);
            return false;
        }
    });
}
exports.filterUniqueVstsRegistries = filterUniqueVstsRegistries;
function isInSameCollection(r) {
    if (process.env[k_VstfCollectionUri]) {
        let currentCollectionUri = process.env[k_VstfCollectionUri];
        let isLegacyVstsUri = currentCollectionUri.indexOf(r.project + ".visualstudio.com") > -1;
        if (isLegacyVstsUri) {
            return true;
        }
        let isAdoUri = currentCollectionUri.indexOf("dev.azure.com/" + r.project) > -1;
        return isAdoUri;
    }
    else {
        return false;
    }
}
exports.isInSameCollection = isInSameCollection;
/**
 * Given an array of Registry objects, splits them
 * by the collection their VSTS feed resides in. Only
 * splits by whether they are in the same collection
 * as the current job scope or a different one. This
 * depends on running inside of a VSTS agent context
 * as it depends on SYSTEM_TEAMFOUNDATIONCOLLECTIONURI.
 */
function shardRegistriesByCollection(registries) {
    let result = {
        sameCollection: [],
        differentCollection: [],
    };
    registries.forEach((r) => {
        let sameCollection = isInSameCollection(r);
        if (sameCollection) {
            result.sameCollection.push(r);
        }
        else {
            result.differentCollection.push(r);
        }
    });
    return result;
}
exports.shardRegistriesByCollection = shardRegistriesByCollection;
function authenticateRegistries(...registries) {
    return __awaiter(this, void 0, void 0, function* () {
        let registriesToAuthenticate = filterUniqueVstsRegistries(registries);
        // if we can get an OAuth token for the user, that is
        // preferred because it will work for all VSTS registries
        let labToken = vsts_auth_client_1.getVstsLabOauthToken();
        if (!labToken) {
            let userToken = yield vsts_auth_client_1.getUserAuthToken();
            registriesToAuthenticate.forEach((r) => (r.token = userToken));
            return Promise.resolve(registriesToAuthenticate);
        }
        else {
            // when we're running in a VSTS build agent, we can use the
            // lab token present in process.env. However, this OAuth
            // token is only valid for feeds in the Project Collection
            // where the build is running.
            let registriesByCollection = shardRegistriesByCollection(registriesToAuthenticate);
            // use the token exposed in the VSTS environment for use by build tasks
            // details: https://docs.microsoft.com/en-us/vsts/build-release/actions/scripts/powershell#oauth
            registriesByCollection.sameCollection.forEach((r) => {
                console.log(`using SYSTEM_ACCESSTOKEN for ${r.url}`);
                r.token = labToken;
            });
            // if there are registries in other VSTS collections, we currently don't
            // support authenticating those. Print a warning message for each of them.
            if (registriesByCollection.differentCollection.length > 0) {
                console.warn(`Found ${registriesByCollection.differentCollection.length} registries ` +
                    "which could not be authenticated:\n" +
                    registriesByCollection.differentCollection.map((x) => `\t${x.url}\n`));
            }
            return registriesByCollection.sameCollection;
        }
    });
}
exports.authenticateRegistries = authenticateRegistries;
//# sourceMappingURL=registry-auth-reducer.js.map