### Available Actions

Explicitly restricts or declares which actions are enabled in system controls. By default (`null`), all supported actions are enabled.

#### Method Signature

`FlutterMediaSessionPlatform.instance.updateAvailableActions(Set<MediaAction>? actions)`

| Parameter | Type | Required? | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `actions` | `Set<MediaAction>?` | No | `null` | Allowed set of actions. Pass `null` to enable all actions (default). |

#### Standard Media Actions List

`MediaAction` provides built-in standard actions:

| Static Constant | Name String | Description |
| :--- | :--- | :--- |
| `MediaAction.play` | `'play'` | Resume playback |
| `MediaAction.pause` | `'pause'` | Pause playback |
| `MediaAction.stop` | `'stop'` | Stop playback |
| `MediaAction.skipToNext` | `'skipToNext'` | Skip to next track |
| `MediaAction.skipToPrevious` | `'skipToPrevious'` | Skip to previous track |
| `MediaAction.seekTo` | `'seekTo'` | Scrub/seek to a specific position |
| `MediaAction.rewind` | `'rewind'` | Rewind by standard interval (configured via `setSkipIntervals`) |
| `MediaAction.fastForward` | `'fastForward'` | Fast-forward by standard interval (configured via `setSkipIntervals`) |
| `MediaAction.shuffle` | `'shuffle'` | Toggle shuffle mode |
| `MediaAction.repeat` | `'repeat'` | Toggle repeat mode |

#### Custom Actions

Custom actions can also be declared in the set for supported platforms (e.g. Android notification slots). For layout details, see [Action Slot Layout](#feature-panel-action_slot).

```dart
final favoriteAction = MediaAction.custom(
  name: 'favorite',
  customLabel: 'Favorite',
  customIconResource: 'ic_heart', // Located in android/app/src/main/res/drawable/
);
```

#### Usage Example

```dart
// Restrict controls to a specific set (e.g. for a podcast player with seek & intervals)
await FlutterMediaSessionPlatform.instance.updateAvailableActions({
  MediaAction.play,
  MediaAction.pause,
  MediaAction.stop,
  MediaAction.rewind,
  MediaAction.fastForward,
  MediaAction.seekTo,
});
```
