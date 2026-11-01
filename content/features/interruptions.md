### Audio Interruptions

Configures whether the plugin automatically manages OS audio focus changes (e.g. incoming phone calls, navigation prompts).

#### Method Signature

`FlutterMediaSessionPlatform.instance.setAutoHandleInterruptions(bool enabled)`

| Parameter | Type | Required? | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `enabled` | `bool` | **Yes** | `false` | `true` to let the plugin request focus and automatically handle pause/duck events; `false` to disable. |

```dart
await FlutterMediaSessionPlatform.instance.setAutoHandleInterruptions(true);
```

> **Usage Note:** If your playback engine already manages audio focus (such as `just_audio` with `AudioSession` or `media_kit`), leave `enabled: false` to prevent conflicting audio focus handlers. Enable this option when your audio engine does not manage audio focus itself.
