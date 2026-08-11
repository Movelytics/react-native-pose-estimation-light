/**
 * Online pose-model catalog for the light SDK.
 *
 * Defaults match the PoseTracker Front / Docs API product path:
 * MoveNet SinglePose Lightning hosted at app.posetracker.com (same URL as
 * `usePoseDetection` / tracking WebView `modelUrl`).
 *
 * BlazePose is accepted as a `model` alias for API parity but is not wired
 * in the RN WebView yet (needs MediaPipe). Pass a TF.js `modelUrl` for any
 * custom graph model.
 */
/** Production MoveNet SinglePose Lightning topology (Front default). */
export declare const DEFAULT_MOVENET_LIGHTNING_URL = "https://app.posetracker.com/scripts/tmp_model_to_remove.json";
/** Docs API / Front `model` query aliases. */
export type PoseModelAlias = 'movenet' | 'movenet-singlepose-lightning' | 'lightning' | 'blazepose' | (string & {});
export interface ResolvePoseModelOptions {
    /**
     * Docs API `model` query parity (`movenet` default, `blazepose`, …).
     * Ignored when {@link modelUrl} is set.
     */
    model?: PoseModelAlias;
    /** Explicit TF.js graph-model topology URL (weights resolve as siblings). */
    modelUrl?: string;
}
export interface ResolvedPoseModel {
    /** Stable id reported in diagnostics / track params. */
    modelId: string;
    /** TF.js `loadGraphModel` URL, or null when unsupported without override. */
    modelUrl: string | null;
    /** Human-readable reason when {@link modelUrl} is null. */
    unsupportedReason?: string;
}
/**
 * Resolve which TF.js graph model the light WebView should fetch.
 * Default: MoveNet SinglePose Lightning (product URL).
 */
export declare function resolvePoseModel(options?: ResolvePoseModelOptions): ResolvedPoseModel;
/** Origin used as WebView `baseUrl` so model fetches are same-origin when possible. */
export declare function originFromModelUrl(modelUrl: string): string;
