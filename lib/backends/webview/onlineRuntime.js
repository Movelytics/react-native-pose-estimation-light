"use strict";
/**
 * Online (light) pose-runtime loader.
 *
 * The npm package ships only the thin page runtime (`pose-runtime.js`).
 * TF.js + WASM backends load from a CDN; MoveNet (or a custom graph model)
 * loads from a URL on every WebView boot — same idea as the historical
 * PoseTracker Front tracking page.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ONLINE_TFJS_VERSION = void 0;
exports.defaultOnlineRuntimeUrls = defaultOnlineRuntimeUrls;
exports.getOnlineRuntimeParts = getOnlineRuntimeParts;
exports.getOnlineRuntimeVersion = getOnlineRuntimeVersion;
const poseRuntimeSource_1 = require("./poseRuntimeSource");
const poseModels_1 = require("../../models/poseModels");
/** TF.js version pinned for CDN scripts (matches offline SDK build). */
exports.ONLINE_TFJS_VERSION = '4.22.0';
const JSDELIVR = 'https://cdn.jsdelivr.net/npm';
function defaultOnlineRuntimeUrls(cdnBase = JSDELIVR, tfjsVersion = exports.ONLINE_TFJS_VERSION) {
    const base = cdnBase.replace(/\/$/, '');
    return {
        tfjsScriptUrls: [
            `${base}/@tensorflow/tfjs-core@${tfjsVersion}/dist/tf-core.min.js`,
            `${base}/@tensorflow/tfjs-converter@${tfjsVersion}/dist/tf-converter.min.js`,
            `${base}/@tensorflow/tfjs-backend-webgl@${tfjsVersion}/dist/tf-backend-webgl.min.js`,
            `${base}/@tensorflow/tfjs-backend-wasm@${tfjsVersion}/dist/tf-backend-wasm.min.js`,
        ],
        tfjsWasmPath: `${base}/@tensorflow/tfjs-backend-wasm@${tfjsVersion}/dist/`,
    };
}
/**
 * Build the online runtime descriptor used by {@link buildPoseHtml}.
 * Throws when the selected model cannot be loaded (e.g. blazepose without URL).
 */
function getOnlineRuntimeParts(options = {}) {
    const resolved = (0, poseModels_1.resolvePoseModel)({
        model: options.model,
        modelUrl: options.modelUrl,
    });
    if (!resolved.modelUrl) {
        throw new Error(resolved.unsupportedReason ?? `Model "${resolved.modelId}" is unavailable.`);
    }
    const urls = defaultOnlineRuntimeUrls(options.tfjsCdnBase, options.tfjsVersion);
    return {
        version: poseRuntimeSource_1.POSE_RUNTIME_VERSION,
        delivery: 'online',
        modelId: resolved.modelId,
        modelUrl: resolved.modelUrl,
        tfjsScriptUrls: urls.tfjsScriptUrls,
        tfjsWasmPath: urls.tfjsWasmPath,
        runtimeJs: poseRuntimeSource_1.POSE_RUNTIME_JS,
    };
}
function getOnlineRuntimeVersion() {
    return poseRuntimeSource_1.POSE_RUNTIME_VERSION;
}
