"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionOutput = exports.ActionInput = exports.EnvVar = void 0;
var EnvVar;
(function (EnvVar) {
    EnvVar["TIMESTAMP"] = "__TIMESTAMP";
    EnvVar["ARTIFACTDIRECORY"] = "__ARTIFACTDIRECORY";
    EnvVar["STAGINGDIRECTORY"] = "__STAGINGDIRECTORY";
    EnvVar["PACKAGEDIRECTORY"] = "__PACKAGEDIRECTORY";
    EnvVar["COPYRIGHT"] = "__COPYRIGHT";
    EnvVar["AUTHORS"] = "__AUTHORS";
    EnvVar["COMPANY"] = "__COMPANY";
    EnvVar["CHANNEL"] = "__CHANNEL";
    EnvVar["VERSION"] = "__VERSION";
    EnvVar["INFORMATIONALVERSION"] = "__INFORMATIONALVERSION";
    EnvVar["REVISION"] = "__REVISION";
    EnvVar["PRODUCT"] = "__PRODUCT";
})(EnvVar || (exports.EnvVar = EnvVar = {}));
var ActionInput;
(function (ActionInput) {
    ActionInput["REPOSITORY"] = "repository";
    ActionInput["TOKEN"] = "token";
    ActionInput["SHA"] = "sha";
    ActionInput["NAME"] = "name";
    ActionInput["CONFIGFILE"] = "config-file";
})(ActionInput || (exports.ActionInput = ActionInput = {}));
var ActionOutput;
(function (ActionOutput) {
    ActionOutput["TIMESTAMP"] = "timestamp";
    ActionOutput["ARTIFACTDIRECORY"] = "artifact-directory";
    ActionOutput["STAGINGDIRECTORY"] = "staging-directory";
    ActionOutput["PACKAGEDIRECTORY"] = "packaging-directory";
    ActionOutput["COPYRIGHT"] = "copyright";
    ActionOutput["AUTHORS"] = "authors";
    ActionOutput["COMPANY"] = "company";
    ActionOutput["CHANNEL"] = "channel";
    ActionOutput["VERSION"] = "version";
    ActionOutput["INFORMATIONALVERSION"] = "informational-version";
    ActionOutput["REVISION"] = "revision";
    ActionOutput["PRODUCT"] = "product";
    ActionOutput["WORKSPACE"] = "workspace";
})(ActionOutput || (exports.ActionOutput = ActionOutput = {}));
//# sourceMappingURL=environment.js.map