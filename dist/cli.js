#!/usr/bin/env node
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
const config_1 = require("./lib/config");
const index_1 = require("./index");
const input = require("input");
let runningCmd = false;
function configSetter(argv) {
    config_1.Config.set(argv.key, argv.value);
}
function configGetter(key) {
    if (key) {
        let configObj = config_1.Config.get();
        let configEntry = configObj[key];
        if (configEntry) {
            console.log(configEntry);
        }
    }
}
function _deleteConfig() {
    _writeConfig({});
}
function _writeConfig(o) {
    console.log("new config:\n", o);
    config_1.Config.write(o);
}
function configDeleter(key) {
    return __awaiter(this, void 0, void 0, function* () {
        if (key) {
            let configObject = config_1.Config.get();
            delete configObject[key];
            _writeConfig(configObject);
        }
        else {
            // delete the whole config, once user confirms
            let deleteConfig = yield input.confrim("Are you sure you want to delete your config file?");
            if (deleteConfig === true) {
                _deleteConfig();
            }
        }
        return Promise.resolve();
    });
}
function commandBuilder(cmd) {
    return (args) => __awaiter(this, void 0, void 0, function* () {
        runningCmd = true;
        yield cmd(args);
        process.exit(0);
    });
}
const argv = require("yargs")
    .usage("Usage: $0 [command] [options]")
    .example("$0", "process the local .npmrc file")
    .example("$0 -n /foo/bar/.npmrc -c /baz/bang/.bettervstsnpmauthcfg", "process the .npmrc file located at /foo/bar, use /baz/bang/.bettervstsnpmauthcfg as the config file")
    .example("$0 config foo bar", 'set a config value "foo" to be "bar"')
    .options("n", {
    alias: "npmrcPath",
    describe: "path to npmrc config",
    type: "string"
})
    .options("y", {
    alias: "yarnrcYmlPath",
    describe: "path to yarnrc.yml config",
    type: "string"
})
    .options("c", {
    alias: "configOverride",
    describe: "alternate path to this tool's configuration file",
    type: "string"
})
    .options("stack", {
    describe: "print the stack trace on error",
    type: "boolean"
})
    .command({
    command: "config [command]",
    desc: 'modify the config (run "config --help" for more info)',
    builder: (yargs) => yargs
        .command({
        command: "set <key> <value>",
        desc: "Set a config variable",
        handler: commandBuilder(configSetter)
    })
        .command({
        command: "get [key]",
        desc: "Get a config variable",
        handler: commandBuilder(configGetter)
    })
        .command({
        command: "delete [key]",
        desc: "Delete a config variable. If the variable is not supplied, deletes the entire config.",
        handler: commandBuilder(configDeleter)
    }),
    handler: commandBuilder(configGetter)
})
    .help().argv;
// safety first - handle and exit non-zero if we run into issues
let abortProcess = (e) => {
    console.log(e);
    process.exit(1);
};
process.on("uncaughtException", abortProcess);
process.on("unhandledRejection", abortProcess);
if (!runningCmd) {
    index_1.run(argv);
}
//# sourceMappingURL=cli.js.map