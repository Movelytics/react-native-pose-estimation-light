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

/** Production MoveNet SinglePose Lightning topology (Front default). */
export const DEFAULT_MOVENET_LIGHTNING_URL =
  'https://app.posetracker.com/scripts/tmp_model_to_remove.json';

/** Docs API / Front `model` query aliases. */
export type PoseModelAlias =
  | 'movenet'
  | 'movenet-singlepose-lightning'
  | 'lightning'
  | 'blazepose'
  | (string & {});

export interface ResolvePoseModelOptions {
  /**
   * Docs API `model` query parity (`movenet` default, `blazepose`, …).
   * Ignored when {@link modelUrl} is set.
   */
  model?: PoseModelAlias;
  /** Explicit TF.js graph-model topology URL (weights resolve as siblings). */
  modelUrl?: string;
}

export type PoseModelKind = 'movenet-graph' | 'blazepose' | 'custom-graph' | 'unsupported';

export interface ResolvedPoseModel {
  /** Stable id reported in diagnostics / track params. */
  modelId: string;
  kind: PoseModelKind;
  /** TF.js `loadGraphModel` URL when kind is movenet-graph or custom-graph. */
  modelUrl: string | null;
  /** Human-readable reason when kind is unsupported. */
  unsupportedReason?: string;
}

/**
 * Resolve which online pose model the light WebView should run.
 * Default: MoveNet SinglePose Lightning (product URL).
 */
export function resolvePoseModel(options: ResolvePoseModelOptions = {}): ResolvedPoseModel {
  const explicit =
    typeof options.modelUrl === 'string' && options.modelUrl.trim().length > 0
      ? options.modelUrl.trim()
      : null;
  if (explicit) {
    const alias =
      typeof options.model === 'string' && options.model.trim().length > 0
        ? options.model.trim()
        : 'custom';
    return { modelId: alias, kind: 'custom-graph', modelUrl: explicit };
  }

  const key = (options.model ?? 'movenet').trim().toLowerCase();
  if (key === 'movenet' || key === 'movenet-singlepose-lightning' || key === 'lightning') {
    return {
      modelId: 'movenet-singlepose-lightning',
      kind: 'movenet-graph',
      modelUrl: DEFAULT_MOVENET_LIGHTNING_URL,
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
    unsupportedReason:
      `Unknown model "${options.model}". Use "movenet" (default), "blazepose", or pass modelUrl.`,
  };
}

/** Origin used as WebView `baseUrl` so model fetches are same-origin when possible. */
export function originFromModelUrl(modelUrl: string): string {
  try {
    const u = new URL(modelUrl);
    return `${u.protocol}//${u.host}/`;
  } catch {
    return 'https://app.posetracker.com/';
  }
}
