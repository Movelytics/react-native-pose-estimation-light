"use strict";
/**
 * Online pose-model catalog for the light SDK.
 *
 * Defaults match the PoseTracker Front / Docs API product path:
 * MoveNet SinglePose Lightning hosted at app.posetracker.com (same URL as
 * `usePoseDetection` / tracking WebView `modelUrl`).
 *
 * BlazePose loads via CDN `@tensorflow-models/pose-detection` inside the
 * WebView (no graph `modelUrl`). Pass a TF.js `modelUrl` for any custom
 * graph model.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MOVENET_LIGHTNING_URL = void 0;
exports.resolvePoseModel = resolvePoseModel;
exports.originFromModelUrl = originFromModelUrl;
/** Production MoveNet SinglePose Lightning topology (Front default). */
exports.DEFAULT_MOVENET_LIGHTNING_URL = 'https://app.posetracker.com/scripts/tmp_model_to_remove.json';
/**
 * Resolve which online pose model the light WebView should run.
 * Default: MoveNet SinglePose Lightning (product URL).
 */
function resolvePoseModel(options = {}) {
    const explicit = typeof options.modelUrl === 'string' && options.modelUrl.trim().length > 0
        ? options.modelUrl.trim()
        : null;
    if (explicit) {
        const alias = typeof options.model === 'string' && options.model.trim().length > 0
            ? options.model.trim()
            : 'custom';
        return { modelId: alias, kind: 'custom-graph', modelUrl: explicit };
    }
    const key = (options.model ?? 'movenet').trim().toLowerCase();
    if (key === 'movenet' || key === 'movenet-singlepose-lightning' || key === 'lightning') {
        return {
            modelId: 'movenet-singlepose-lightning',
            kind: 'movenet-graph',
            modelUrl: exports.DEFAULT_MOVENET_LIGHTNING_URL,
        };
    }
    if (key === 'blazepose') {
        return {
            modelId: 'blazepose',
            kind: 'blazepose',
            modelUrl: null,
        };
    }
    return {
        modelId: key,
        kind: 'unsupported',
        modelUrl: null,
        unsupportedReason: `Unknown model "${options.model}". Use "movenet" (default), "blazepose", or pass modelUrl.`,
    };
}
/** Origin used as WebView `baseUrl` so model fetches are same-origin when possible. */
function originFromModelUrl(modelUrl) {
    try {
        const u = new URL(modelUrl);
        return `${u.protocol}//${u.host}/`;
    }
    catch {
        return 'https://app.posetracker.com/';
    }
}
