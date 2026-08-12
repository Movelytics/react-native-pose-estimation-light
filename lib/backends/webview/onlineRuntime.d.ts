/**
 * Online (light) pose-runtime loader.
 *
 * The npm package ships only the thin page runtime (`pose-runtime.js`).
 * TF.js + WASM backends load from a CDN; MoveNet (or a custom graph model)
 * loads from a URL on every WebView boot — same idea as the historical
 * PoseTracker Front tracking page.
 *
 * BlazePose: appends `@tensorflow-models/pose-detection` CDN after TF.js
 * (no graph `modelUrl`); the page runtime calls `createDetector`.
 */
import { type PoseModelAlias, type PoseModelKind } from '../../models/poseModels';
/** TF.js version pinned for CDN scripts (matches offline SDK build). */
export declare const ONLINE_TFJS_VERSION = "4.22.0";
/** pose-detection UMD pin (BlazePose). */
export declare const ONLINE_POSE_DETECTION_VERSION = "2.1.3";
export interface OnlineRuntimeUrls {
    /** Ordered <script src> list (core → converter → webgl → wasm [→ pose-detection]). */
    tfjsScriptUrls: string[];
    /** Directory passed to `tf.wasm.setWasmPaths`. */
    tfjsWasmPath: string;
}
export interface OnlineRuntimeParts {
    version: string;
    delivery: 'online';
    modelId: string;
    /** Graph kinds only; null for BlazePose. */
    modelUrl: string | null;
    modelKind: Exclude<PoseModelKind, 'unsupported'>;
    tfjsScriptUrls: string[];
    tfjsWasmPath: string;
    /** Thin page runtime shipped in the package (~50 KB). */
    runtimeJs: string;
}
export interface GetOnlineRuntimeOptions {
    model?: PoseModelAlias;
    modelUrl?: string;
    /**
     * Override jsDelivr package root, e.g.
     * `https://cdn.jsdelivr.net/npm` (default) or a mirrored host.
     */
    tfjsCdnBase?: string;
    /** Override TF.js version segment in CDN URLs. */
    tfjsVersion?: string;
    /** Override pose-detection version (BlazePose CDN). */
    poseDetectionVersion?: string;
}
export declare function defaultOnlineRuntimeUrls(cdnBase?: string, tfjsVersion?: string): OnlineRuntimeUrls;
export declare function defaultPoseDetectionCdnUrl(cdnBase?: string, version?: string): string;
/**
 * Build the online runtime descriptor used by {@link buildPoseHtml}.
 * Throws when the selected model cannot be loaded.
 */
export declare function getOnlineRuntimeParts(options?: GetOnlineRuntimeOptions): OnlineRuntimeParts;
export declare function getOnlineRuntimeVersion(): string;
