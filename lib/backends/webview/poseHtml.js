"use strict";
/**
 * WebView HTML assembler (light / online).
 *
 * Loads TF.js from CDN script tags and MoveNet (or a custom graph model)
 * from {@link OnlineRuntimeParts.modelUrl}. For BlazePose, also loads
 * `@tensorflow-models/pose-detection` (no graph URL). The thin page runtime
 * is still inlined from the package. Same camera / adaptive quality /
 * postMessage events as the offline SDK.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_LOADING_TEXT = exports.POSE_HTML_BUILD = void 0;
exports.buildPoseHtml = buildPoseHtml;
const react_native_1 = require("react-native");
const captureMode_1 = require("../../quality/captureMode");
const brandAssets_1 = require("./brandAssets");
/** Bumped on every assembler-path change — appears in WebView diag logs. */
exports.POSE_HTML_BUILD = '20260812-onlineLight-mediaSources';
/** Default boot overlay copy (WebView `loading_message` parity). */
exports.DEFAULT_LOADING_TEXT = 'AI Loading';
const PAGE_CSS = `
    html, body { margin:0; padding:0; width:100%; height:100%; background:#000; overflow:hidden; }
    #wrap { position:relative; width:100%; height:100%; background:#000; }
    video, img#still, canvas {
      position:absolute; inset:0; width:100%; height:100%;
      object-fit:cover; opacity:0; transition:opacity 180ms ease-out;
    }
    video, img#still { z-index:1; background:#000; }
    canvas { z-index:2; pointer-events:none; }
    #boot {
      position:absolute; inset:0; z-index:4;
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      background:#0a0a0a; color:#fff;
      font:15px/1.4 -apple-system,system-ui,sans-serif;
      transition:opacity 180ms ease-out;
      gap:0;
      padding:24px;
      box-sizing:border-box;
    }
    #boot.hide { opacity:0; pointer-events:none; }
    #boot .boot-powered {
      color:rgba(255,255,255,0.55);
      font-size:11px;
      font-weight:600;
      letter-spacing:0.14em;
      text-transform:uppercase;
      margin-bottom:10px;
    }
    #boot .boot-logo {
      width:min(220px, 62vw);
      height:auto;
      margin-bottom:22px;
      display:block;
      box-sizing:border-box;
      background:#3a3a3a;
      padding:14px 16px;
      border-radius:10px;
    }
    #boot .boot-spinner {
      width:28px; height:28px; margin-bottom:16px;
      border:2px solid #333; border-top-color:#ffc300; border-radius:50%;
      animation:ptspin 0.8s linear infinite;
    }
    #boot .boot-msg {
      color:#e8e8e8; font-size:14px; font-weight:500;
      text-align:center; padding:0 12px; min-height:1.2em;
    }
    #boot .boot-msg.is-error { color:#FE8370; font-size:13px; }
    @keyframes ptspin { to { transform:rotate(360deg); } }
    #wm {
      position:absolute; right:10px; bottom:10px; z-index:3;
      display:none; flex-direction:column; align-items:flex-end;
      pointer-events:none;
      text-shadow:0 1px 2px rgba(0,0,0,0.55);
    }
    #wm.show { display:flex; }
    #wm .wm-powered {
      color:rgba(255,255,255,0.7);
      font:600 11px/1.2 -apple-system,system-ui,sans-serif;
      letter-spacing:0.12em;
      text-transform:uppercase;
      margin-bottom:4px;
    }
    #wm .wm-logo {
      width:130px; height:auto; display:block;
      opacity:0.92;
      filter:drop-shadow(0 1px 2px rgba(0,0,0,0.45));
    }
    #hud {
      position:absolute; left:8px; right:8px; bottom:8px; z-index:3;
      color:#ffc300; font:12px/1.3 -apple-system,system-ui,sans-serif;
      text-shadow:0 1px 2px #000; pointer-events:none;
      display:none;
    }
    #hud.debug { display:block; }
`;
/** Escape text for safe HTML text-node content. */
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
/** `</script` inside injected JS text would terminate the inline script tag. */
function escapeScript(js) {
    return js.replace(/<\/script/gi, '<\\/script');
}
function escapeAttr(value) {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
/**
 * Assemble the pose page for online delivery: CDN TF.js + remote model URL
 * + inlined thin page runtime.
 */
function buildPoseHtml(parts, options) {
    const isAndroid = react_native_1.Platform.OS === 'android';
    const capturePriority = options?.capturePriority === 'quality' ? 'quality' : 'performance';
    const preferQuality = capturePriority === 'quality';
    const coldStart = options?.coldStart === 'full' ? 'full' : 'basic';
    const loadingText = typeof options?.loadingText === 'string' && options.loadingText.trim().length > 0
        ? options.loadingText.trim()
        : exports.DEFAULT_LOADING_TEXT;
    const watermarkOn = coldStart === 'full' && (options?.showWatermark ?? true);
    const debugHud = !!options?.debugHud;
    const config = JSON.stringify({
        facingMode: options?.facingMode ?? 'user',
        minScore: options?.minScore ?? 0.25,
        idealWidth: options?.idealWidth ?? 480,
        idealHeight: options?.idealHeight ?? 360,
        idealFrameRate: options?.idealFrameRate ?? 24,
        profileId: options?.profileId ?? 'ultralite',
        minTargetFps: options?.minTargetFps ?? 15,
        drawSkeleton: options?.drawSkeleton ?? true,
        coldStart,
        skeletonDef: options?.skeletonDef ?? null,
        loadingText,
        showWatermark: watermarkOn,
        debugHud,
        sourceType: options?.sourceType === 'video' || options?.sourceType === 'image'
            ? options.sourceType
            : 'camera',
        sourceUrl: typeof options?.sourceUrl === 'string' ? options.sourceUrl : null,
        captureConstraintMode: captureMode_1.CAPTURE_CONSTRAINT_MODE,
        capturePriority,
        platform: react_native_1.Platform.OS,
        modelUrl: parts.modelUrl,
        modelId: parts.modelId,
        modelKind: parts.modelKind,
        tfjsWasmPath: parts.tfjsWasmPath,
        inferFrameSkip: isAndroid && captureMode_1.ANDROID_INFER_FRAME_SKIP > 0 ? captureMode_1.ANDROID_INFER_FRAME_SKIP : 0,
        preprocessPath: isAndroid ? captureMode_1.ANDROID_PREPROCESS_PATH : 'imagebitmap',
        softCapProfile: isAndroid && !preferQuality ? captureMode_1.ANDROID_SOFT_CAP_PROFILE : null,
        perfDebug: isAndroid && captureMode_1.ANDROID_PERF_DEBUG,
    });
    const cdnScripts = parts.tfjsScriptUrls
        .map((url) => `<script src="${escapeAttr(url)}"></script>`)
        .join('');
    return [
        '<!DOCTYPE html><html><head><meta charset="utf-8" />',
        '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />',
        '<style>', PAGE_CSS, '</style></head><body>',
        '<div id="wrap">',
        '<video id="video" playsinline muted autoplay></video>',
        '<img id="still" alt="" draggable="false" />',
        '<canvas id="overlay"></canvas>',
        '<div id="wm">',
        '<div class="wm-powered">powered by</div>',
        '<img class="wm-logo" alt="PoseTracker" src="', brandAssets_1.POSETRACKER_LOGO_DATA_URL, '" />',
        '</div>',
        '<div id="boot">',
        '<div class="boot-powered">powered by</div>',
        '<img class="boot-logo" alt="PoseTracker" src="', brandAssets_1.POSETRACKER_LOGO_DATA_URL, '" />',
        '<div class="boot-spinner"></div>',
        '<div class="boot-msg">', escapeHtml(loadingText), '</div>',
        '</div>',
        '<div id="hud"', debugHud || (isAndroid && captureMode_1.ANDROID_PERF_DEBUG) ? ' class="debug"' : '', '>',
        'booting…',
        '</div>',
        '</div>',
        cdnScripts,
        '<script>window.__PT_BUILD=', JSON.stringify(`${exports.POSE_HTML_BUILD}/${parts.version}`),
        ';window.__PT_CONFIG=', config,
        ';window.__PT_MODEL_URL=', JSON.stringify(parts.modelUrl),
        ';window.__PT_MODEL_ID=', JSON.stringify(parts.modelId),
        ';window.__PT_MODEL_KIND=', JSON.stringify(parts.modelKind),
        ';window.__PT_WASM_PATH=', JSON.stringify(parts.tfjsWasmPath),
        ';window.__PT_MODEL_JSON=null',
        ';window.__PT_WEIGHTS_B64=null',
        ';window.__PT_WASM_B64=null',
        ';window.__PT_PIPELINE_WASM_B64=null',
        ';</script>',
        '<script>', escapeScript(parts.runtimeJs), '</script>',
        '</body></html>',
    ].join('');
}
