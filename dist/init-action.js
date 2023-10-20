"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const core = __importStar(require("@actions/core"));
const process_1 = __importDefault(require("process"));
const path_1 = __importDefault(require("path"));
const version_helpers_1 = require("./helpers/version-helpers");
const environment_1 = require("./helpers/environment");
const action_util_1 = require("./helpers/action-util");
const utility_1 = require("./helpers/utility");
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
    try {
        const timeStamp = version_helpers_1.TimeStamp;
        core.setOutput(String(environment_1.ActionOutput.TIMESTAMP), timeStamp);
        const token = core.getInput(String(environment_1.ActionInput.TOKEN), { required: true });
        const configPath = (0, action_util_1.getOptionalInput)(String(environment_1.ActionInput.CONFIGFILE));
        if (configPath) {
            const userConfig = (0, action_util_1.getYamlConfig)(configPath);
            if (userConfig) {
                core.setOutput(String(environment_1.ActionOutput.COMPANY), userConfig.config?.company);
                core.exportVariable(String(environment_1.EnvVar.COMPANY), userConfig.config?.company);
                core.setOutput(String(environment_1.ActionOutput.AUTHORS), userConfig.config?.authors);
                core.exportVariable(String(environment_1.EnvVar.AUTHORS), userConfig.config?.authors);
                core.setOutput(String(environment_1.ActionOutput.COPYRIGHT), userConfig.config?.copyright);
                core.exportVariable(String(environment_1.EnvVar.COPYRIGHT), userConfig.config?.copyright);
                core.setOutput(String(environment_1.ActionOutput.PRODUCT), userConfig.config?.product);
                core.exportVariable(String(environment_1.EnvVar.PRODUCT), userConfig.config?.product);
            }
            else {
                throw new utility_1.UserError('Invalid configuration!');
            }
        }
        const workspaceDirectory = process_1.default.env.GITHUB_WORKSPACE;
        const workspaceDiretoryBase = (0, action_util_1.getResolvedDirectory)(path_1.default.join(workspaceDirectory, '../'), false);
        const stagingDirectory = (0, action_util_1.getResolvedDirectory)(path_1.default.join(workspaceDiretoryBase, 's'), true);
        core.setOutput(String(environment_1.ActionOutput.STAGINGDIRECTORY), stagingDirectory);
        const artifactDirectory = (0, action_util_1.getResolvedDirectory)(path_1.default.join(workspaceDiretoryBase, 'a'), true);
        core.setOutput(String(environment_1.ActionOutput.ARTIFACTDIRECORY), artifactDirectory);
        const packageDirectory = (0, action_util_1.getResolvedDirectory)(path_1.default.join(workspaceDiretoryBase, 'p'), true);
        core.setOutput(String(environment_1.ActionOutput.PACKAGEDIRECTORY), packageDirectory);
        core.setOutput(String(environment_1.ActionOutput.WORKSPACE), process_1.default.env.GITHUB_WORKSPACE);
        core.exportVariable(String(environment_1.EnvVar.ARTIFACTDIRECORY), 'TODO: ');
    }
    catch (error) {
        // Fail the workflow run if an error occurs
        if (error instanceof Error)
            core.setFailed(error.message);
    }
}
exports.run = run;
//# sourceMappingURL=init-action.js.map