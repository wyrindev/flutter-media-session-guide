### Background Keep-Alive

Helps keep audio streaming active when the app is in the background.

#### Method Signature

`FlutterMediaSessionPlatform.instance.setBackgroundKeepAlive(bool enabled)`

| Parameter | Type | Required? | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `enabled` | `bool` | **Yes** | — | `true` to acquire system wake lock and high-performance Wi-Fi lock; `false` to release. |

```dart
// Acquire wake lock and high-performance Wi-Fi lock during active playback
await FlutterMediaSessionPlatform.instance.setBackgroundKeepAlive(true);

// Release locks when playback stops
await FlutterMediaSessionPlatform.instance.setBackgroundKeepAlive(false);
```

#### Platform Behaviors

- **Android:** Acquires `PARTIAL_WAKE_LOCK` and `WIFI_MODE_FULL_HIGH_PERF`. The `android.permission.WAKE_LOCK` permission is already included by the plugin's manifest.
- **Web:** Requests a screen wake lock via `navigator.wakeLock.request('screen')` to keep the display active. The lock is automatically released by the browser when the tab is hidden.
- **iOS / macOS:** Background audio is sustained by the OS audio session (`UIBackgroundModes: audio` on iOS). This method is a no-op on these platforms.
- **Windows:** Background media playback is sustained by SMTC registration. This method is a no-op on Windows.
