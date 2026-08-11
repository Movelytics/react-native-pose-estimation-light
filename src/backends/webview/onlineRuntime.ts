/**
 * Online (light) pose-runtime loader.
 *
 * The npm package ships only the thin page runtime (`pose-runtime.js`).
 * TF.js + WASM backends load from a CDN; MoveNet (or a custom graph model)
 * loads from a URL on every WebView boot — same idea as the historical
 * PoseTracker Front tracking page.
 */

import { POSE_RUNTIME_JS, POSE_RUNTIME_VERSION } from './poseRuntimeSource';
import {
  resolvePoseModel,
  type PoseModelAlias,
  type ResolvedPoseModel,
} from '../../models/poseModels';

/** TF.js version pinned for CDN scripts (matches offline SDK build). */
export const ONLINE_TFJS_VERSION = '4.22.0';

const JSDELIVR = 'https://cdn.jsdelivr.net/npm';

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

export function defaultOnlineRuntimeUrls(
  cdnBase: string = JSDELIVR,
  tfjsVersion: string = ONLINE_TFJS_VERSION,
): OnlineRuntimeUrls {
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
export function getOnlineRuntimeParts(options: GetOnlineRuntimeOptions = {}): OnlineRuntimeParts {
  const resolved: ResolvedPoseModel = resolvePoseModel({
    model: options.model,
    modelUrl: options.modelUrl,
  });
  if (!resolved.modelUrl) {
    throw new Error(resolved.unsupportedReason ?? `Model "${resolved.modelId}" is unavailable.`);
  }
  const urls = defaultOnlineRuntimeUrls(options.tfjsCdnBase, options.tfjsVersion);
  return {
    version: POSE_RUNTIME_VERSION,
    delivery: 'online',
    modelId: resolved.modelId,
    modelUrl: resolved.modelUrl,
    tfjsScriptUrls: urls.tfjsScriptUrls,
    tfjsWasmPath: urls.tfjsWasmPath,
    runtimeJs: POSE_RUNTIME_JS,
  };
}

export function getOnlineRuntimeVersion(): string {
  return POSE_RUNTIME_VERSION;
}
