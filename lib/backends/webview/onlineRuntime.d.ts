/**
 * Online (light) pose-runtime loader.
 *
 * The npm package ships only the thin page runtime (`pose-runtime.js`).
 * TF.js + WASM backends load from a CDN; MoveNet (or a custom graph model)
 * loads from a URL on every WebView boot — same idea as the historical
 * PoseTracker Front tracking page.
 */
import { type PoseModelAlias } from '../../models/poseModels';
/** TF.js version pinned for CDN scripts (matches offline SDK build). */
export declare const ONLINE_TFJS_VERSION = "4.22.0";
export interface OnlineRuntimeUrls {
    /** Ordered <script src> list (core → converter → webgl → wasm). */
    tfjsScriptUrls: string[];
    /** Directory passed to `tf.wasm.setWasmPaths`. */
    tfjsWasmPath: string;
}
export interface OnlineRuntimeParts {
    version: string;
    delivery: 'online';
    modelId: string;
    modelUrl: string;
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
}
export declare function defaultOnlineRuntimeUrls(cdnBase?: string, tfjsVersion?: string): OnlineRuntimeUrls;
/**
 * Build the online runtime descriptor used by {@link buildPoseHtml}.
 * Throws when the selected model cannot be loaded (e.g. blazepose without URL).
 */
export declare function getOnlineRuntimeParts(options?: GetOnlineRuntimeOptions): OnlineRuntimeParts;
export declare function getOnlineRuntimeVersion(): string;
