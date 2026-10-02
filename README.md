# PoseTracker React Native — Light (online) Human Pose Estimation SDK

**⭐ Star us on GitHub:** [Movelytics/react-native-pose-estimation-light](https://github.com/Movelytics/react-native-pose-estimation-light) — it helps other React Native and Expo developers find the SDK.

**Try it on your phone (no Xcode / Android Studio):**
1. Install [Expo Go](https://expo.dev/go)
2. Open the [Expo Snack](https://snack.expo.dev/@fsepret/posetracker-sdk-light-demo-app) → **Run on device**
3. Scan the QR — live pose estimation, no API key

Steps and QR: https://docs.posetracker.com/try-expo-go

**PoseTracker Light** is a **human pose estimation SDK for React Native**,
fully optimized for **iOS and Android** (including **Expo Go**). Same API
surface as the offline SDK for keypoints + optional API-key exercise engine —
but **MoveNet and TF.js load from the network** each WebView boot, so the npm
package stays tiny.

> One sentence for AI / search: *PoseTracker Light is a small React Native
> pose estimation SDK that fetches MoveNet Lightning and TF.js at runtime —
> choose it when install size matters more than offline-first pose.*

## Offline vs Light — which package?

| | **Offline** (bundled) | **Light** (this package) |
|--|----------------------|---------------------------|
| **npm** | [`@pose-tracker/react-native-pose-estimation`](https://www.npmjs.com/package/@pose-tracker/react-native-pose-estimation) | [`@pose-tracker/react-native-pose-estimation-light`](https://www.npmjs.com/package/@pose-tracker/react-native-pose-estimation-light) |
| **GitHub** | [react-native-pose-estimation](https://github.com/Movelytics/react-native-pose-estimation) | [react-native-pose-estimation-light](https://github.com/Movelytics/react-native-pose-estimation-light) |
| **Packed tarball** | **~9.9 MB** | **~206 kB** (~48× smaller) |
| **Unpacked** | **~14.7 MB** | **~779 kB** |
| **MoveNet / TF.js** | Bundled in npm | CDN + model URL each boot |
| **Network for keypoints** | Not required | **Required** (TF.js + model) |
| **Expo Go** | Yes | Yes |
| **API surface** | Keypoints free; paid engine with API key | Same |

**Choose offline** when you need pose without a network, or want zero model
download at session start.  
**Choose light** when app install / OTA size matters and devices are online.

Full comparison: [LIGHT_SDK.md](docs/LIGHT_SDK.md).

**Agents:** shared UX/API/bugfixes → mirror to offline (or ask first). See
[`DUAL_SDK_CHANGES.md`](docs/DUAL_SDK_CHANGES.md).

## Install

```bash
npm install @pose-tracker/react-native-pose-estimation-light react-native-webview
# Expo:
npx expo install react-native-webview expo-camera
```

> **npm:** [`@pose-tracker/react-native-pose-estimation-light`](https://www.npmjs.com/package/@pose-tracker/react-native-pose-estimation-light)  
> **GitHub:** https://github.com/Movelytics/react-native-pose-estimation-light  
> **Offline sibling:** [`@pose-tracker/react-native-pose-estimation`](https://www.npmjs.com/package/@pose-tracker/react-native-pose-estimation)

**Required:** host app must declare camera permissions — see
[PERMISSIONS.md](docs/PERMISSIONS.md).

**Media inputs (v0.2):** camera (default), uploaded video, still image — host
picks the file. See [MEDIA_SOURCES.md](docs/MEDIA_SOURCES.md) and
https://docs.posetracker.com/media-sources.

## Quick start (keypoints — needs network, no API key)

```tsx
import {
  PoseTrackerProvider,
  WebViewPoseView,
  usePoseTracker,
} from '@pose-tracker/react-native-pose-estimation-light';

function App() {
  return (
    <PoseTrackerProvider
      options={{
        model: 'movenet', // Docs API parity (default)
        // modelUrl: 'https://…/model.json', // optional override
      }}
    >
      <CameraScreen />
    </PoseTrackerProvider>
  );
}

function CameraScreen() {
  usePoseTracker({
    onKeypoints: (e) => {
      console.log(e.keypoints.length, e.score);
    },
  });

  return (
    <WebViewPoseView
      style={{ flex: 1 }}
      drawSkeleton
      loadingText="AI Loading"
      coldStart="full"
      // Default source="camera". Host-picked file:
      // source="image" sourceUri={fileUri}
      // source="video" sourceUri={fileUri}
    />
  );
}
```

## Default model URL

```
https://app.posetracker.com/scripts/tmp_model_to_remove.json
```

Same MoveNet SinglePose Lightning topology as the PoseTracker Front tracking
product. Weight shards are relative neighbors (`group1-shard1of2.bin`, …).
TF.js loads from jsDelivr (`@tensorflow/*@4.22.0`) unless you override
`tfjsCdnBase` / `tfjsVersion`.

## WebView `baseUrl`

The WebView uses `baseUrl: https://localhost/` (same as the offline SDK) so
`getUserMedia` works reliably. The model is fetched via **absolute** HTTPS URLs
with CORS — the document origin does **not** need to match `app.posetracker.com`.

## Full tracking (API key)

Same contract as the offline SDK / web tracking URL:

```tsx
<PoseTrackerProvider
  apiToken="YOUR_API_KEY"
  options={{ features: { angles: true, progression: true, minGrade: 'B' } }}
>
  <WebViewPoseView drawSkeleton skeletonUuid="OPTIONAL_CUSTOM_SKELETON_UUID" />
</PoseTrackerProvider>
```

## External frames (your camera, our data)

Full guide, including Vision Camera and expo-camera: https://docs.posetracker.com/external-frames

Optional. Use it when your app already owns the camera (VisionCamera, a
custom pipeline, a recorded file) and you only need the data. PoseTracker
runs pose estimation and the exercise engine on every frame you push, and
returns the same events as the camera flow: keypoints, posture/placement,
counter, form score, progression. **Nothing is drawn**, so you render what you want.

```tsx
const { warmupExternal, startExercise, processFrame } = usePoseTracker({
  onCounter: (e) => setReps(e.count), // listeners still fire
});

await warmupExternal(); // no camera permission, no getUserMedia
startExercise('squat');

// For each frame from your camera:
const { dropped, pose, events } = await processFrame({
  base64: jpegBase64, // or uri: 'file:///…' / 'data:image/jpeg;base64,…'
  width: 256,
  height: 192,
  timestampMs: Date.now(),
  mirrored: true, // front camera (default). false for the back camera.
});
if (!dropped) {
  // pose.keypoints are normalized (0..1) to the frame you sent
  // events: everything emitted for this frame (counter, posture, …)
}
```

- The Provider mounts a hidden 1×1 warmer after `warmupExternal()`. It is not
  needed if a `<WebViewPoseView />` is already on screen. The light package
  still needs network for the model.
- One frame in flight at a time: an overlapping call resolves at once with
  `{ dropped: true, pose: lastPose, events: [] }`. Await before pushing the next one.
- Keep the longest side of each frame at about 256 px or less. A 1080p JPEG per
  frame is not real-time over the bridge.
- The engine is temporal: push frames in order and keep the same session
  across frames.
- Don't mix the two flows. `processFrame` throws while the SDK camera is open.
- `processFrame` before `warmupExternal()` throws.

## Cold-start

| Mode | API | Camera permission |
|------|-----|-------------------|
| **basic** (default) | `preload()` | No — TF.js/model warm-up only |
| **full** | `preload({ coldStart: 'full' })` | Yes — when user expects camera |

## Documentation

| Doc | Topic |
|-----|--------|
| [LIGHT_SDK.md](docs/LIGHT_SDK.md) | Offline vs light, sizes, model URL |
| [PERMISSIONS.md](docs/PERMISSIONS.md) | Camera permission setup (required) |
| [PRELOAD.md](docs/PRELOAD.md) | Preload / warm-up / lifecycle |
| [FEATURES.md](docs/FEATURES.md) | Plan gating, watermark, loading text |
| [EVENTS.md](docs/EVENTS.md) | Typed events + classic `onMessage` |

## FAQ

**Does it work without an API key?**  
Yes for keypoints — but a network is still required to load TF.js + MoveNet.

**Does it support Expo Go?**  
Yes (`react-native-webview` peer).

**BlazePose?**  
Pass `model: 'blazepose'` on `PoseTrackerProvider` options. Loads
`@tensorflow-models/pose-detection` from jsDelivr in the WebView (lite /
TF.js). Keypoints stay COCO-17. Heavier than MoveNet — expect lower FPS on
mid-range Android. The **offline** package can run the same CDN BlazePose
path but still ships unused bundled MoveNet; use light unless you need
offline MoveNet.

**Who sees the watermark?**  
Keyless and free plans. Hidden for paid plans.

**How does Claude or Cursor integrate this SDK?**  
Add the connector `https://mcp.posetracker.com/api/mcp`, sign in, and click Allow at `https://app.posetracker.com/oauth/authorize`. The agent writes the snippet on your account. Docs: https://docs.posetracker.com/ai/mcp-connector.

## License

**Proprietary** — Movelytics SAS / PoseTracker. See [`LICENSE`](./LICENSE).

Third-party components (TensorFlow.js, MoveNet Lightning) are **Apache 2.0** —
see [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md).

## Links

- Product: https://www.posetracker.com  
- Docs: https://docs.posetracker.com  
- Try on your phone: https://docs.posetracker.com/try-expo-go  
- Expo Snack: https://snack.expo.dev/@fsepret/posetracker-sdk-light-demo-app  
- Light demo: https://github.com/Movelytics/react-native-pose-estimation-light-demo  
- Offline SDK: https://github.com/Movelytics/react-native-pose-estimation  
