/**
 * WebView HTML assembler (light / online).
 *
 * Loads TF.js from CDN script tags and MoveNet (or a custom graph model)
 * from {@link OnlineRuntimeParts.modelUrl}. The thin page runtime is still
 * inlined from the package. Same camera / adaptive quality / postMessage
 * events as the offline SDK.
 */
import type { CapturePriority } from '../../quality/profiles';
import type { SkeletonDefinition } from '../../types/skeleton';
import type { OnlineRuntimeParts } from './onlineRuntime';
/** Bumped on every assembler-path change — appears in WebView diag logs. */
export declare const POSE_HTML_BUILD = "20260811-onlineLight-localhostBase";
/** Default boot overlay copy (WebView `loading_message` parity). */
export declare const DEFAULT_LOADING_TEXT = "AI Loading";
export interface PoseHtmlOptions {
    facingMode?: 'user' | 'environment';
    /** Min keypoint score for the in-page skeleton. Default 0.25. */
    minScore?: number;
    /**
     * getUserMedia resolution hint. Defaults follow the adaptive quality
     * profile (often UltraLite on Android, Pro/Prime on iOS). Inference always
     * letterboxes down to 192×192 regardless.
     */
    idealWidth?: number;
    idealHeight?: number;
    idealFrameRate?: number;
    /** Active adaptive quality profile id (ceiling for warm-up downgrades). */
    profileId?: string;
    /**
     * Platform minimum target FPS (floor). iOS ≈ 30, Android ≈ 10 (experiment).
     * Passed from RN so the HTML page shares the same AdaptiveChoice policy.
     */
    minTargetFps?: number;
    /** Draw the skeleton overlay inside the page. Default true. */
    drawSkeleton?: boolean;
    /**
     * `performance` (default) applies Android soft-cap / warm-up floor mapping.
     * `quality` disables soft-cap and opens at prime / device-native HD.
     */
    capturePriority?: CapturePriority;
    /**
     * `basic` (default for warmers): model + WebGL zeros only — no getUserMedia.
     * `full`: open the camera after warm-up (camera screens / explicit full preload).
     */
    coldStart?: 'basic' | 'full';
    /**
     * Custom skeleton overlay (Strapi skeleton document). When omitted, the
     * page uses PoseTrackerFront `DEFAULT_SKELETON` (navy + gold).
     */
    skeletonDef?: SkeletonDefinition | null;
    /**
     * Boot overlay label (WebView `loading_message` query param parity).
     * Default {@link DEFAULT_LOADING_TEXT}. Technical progress stays on
     * `initialization` / `diag` events — never on this UI.
     */
    loadingText?: string;
    /**
     * Bottom-right “powered by” + join-logo watermark on the live camera
     * surface. Hosts typically derive this from plan (`!isPaidPlan`).
     * Ignored / forced off for `coldStart: 'basic'` warmers.
     */
    showWatermark?: boolean;
    /** Show the technical `#hud` overlay (FPS / backend). Default false. */
    debugHud?: boolean;
}
/**
 * Assemble the pose page for online delivery: CDN TF.js + remote model URL
 * + inlined thin page runtime.
 */
export declare function buildPoseHtml(parts: OnlineRuntimeParts, options?: PoseHtmlOptions): string;
