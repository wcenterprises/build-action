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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDirectory = exports.wrapError = exports.isHostedRunner = exports.listFolder = exports.doesFileExist = exports.doesDirectoryExist = exports.isHTTPError = exports.UserError = exports.HTTPError = exports.getRequiredEnvParam = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Get an environment parameter, but throw an error if it is not set.
 */
function getRequiredEnvParam(paramName) {
    const value = process.env[paramName];
    if (value === undefined || value.length === 0) {
        throw new Error(`${paramName} environment variable must be set`);
    }
    return value;
}
exports.getRequiredEnvParam = getRequiredEnvParam;
class HTTPError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
exports.HTTPError = HTTPError;
/**
 * An Error class that indicates an error that occurred due to
 * a misconfiguration of the action or the CodeQL CLI.
 */
class UserError extends Error {
    /* eslint-disable-next-line no-useless-constructor */
    constructor(message) {
        super(message);
    }
}
exports.UserError = UserError;
/*eslint-next-line @typescript-eslint/no-explicit-any*/
function isHTTPError(arg) {
    return arg?.status !== undefined && Number.isInteger(arg.status);
}
exports.isHTTPError = isHTTPError;
/*
 * Returns whether the path in the argument represents an existing directory.
 */
function doesDirectoryExist(dirPath) {
    try {
        const stats = fs.lstatSync(dirPath);
        return stats.isDirectory();
    }
    catch (e) {
        return false;
    }
}
exports.doesDirectoryExist = doesDirectoryExist;
/*
 * Returns whether the file exists
 */
function doesFileExist(filePath) {
    try {
        const stats = fs.lstatSync(filePath);
        return stats.isFile();
    }
    catch (e) {
        return false;
    }
}
exports.doesFileExist = doesFileExist;
/**
 * Returns a recursive list of files in a given directory.
 */
function listFolder(dir) {
    if (!doesDirectoryExist(dir)) {
        return [];
    }
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
        if (entry.isFile()) {
            files.push(path.resolve(dir, entry.name));
        }
        else if (entry.isDirectory()) {
            files = files.concat(listFolder(path.resolve(dir, entry.name)));
        }
    }
    return files;
}
exports.listFolder = listFolder;
/**
 * This function implements a heuristic to determine whether the
 * runner we are on is hosted by GitHub. It does this by checking
 * the name of the runner against the list of known GitHub-hosted
 * runner names. It also checks for the presence of a toolcache
 * directory with the name hostedtoolcache which is present on
 * GitHub-hosted runners.
 *
 * @returns true iff the runner is hosted by GitHub
 */
function isHostedRunner() {
    return (
    // Name of the runner on hosted Windows runners
    process.env['RUNNER_NAME']?.includes('Hosted Agent') ||
        // Name of the runner on hosted POSIX runners
        process.env['RUNNER_NAME']?.includes('GitHub Actions') ||
        // Segment of the path to the tool cache on all hosted runners
        process.env['RUNNER_TOOL_CACHE']?.includes('hostedtoolcache'));
}
exports.isHostedRunner = isHostedRunner;
function wrapError(error) {
    return error instanceof Error ? error : new Error(String(error));
}
exports.wrapError = wrapError;
function resolveDirectory(testPath) {
    return path.resolve(testPath);
}
exports.resolveDirectory = resolveDirectory;
//# sourceMappingURL=utility.js.map