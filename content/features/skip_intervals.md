### Skip & Rewind Intervals

Customizes the skip backward and skip forward step durations on lock screen remote command centers (supported on iOS, macOS, and Web).

`FlutterMediaSessionPlatform.instance.setSkipIntervals({int forwardSeconds = 10, int backwardSeconds = 10})`

| Parameter | Type | Required? | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `forwardSeconds` | `int` | No | `10` | Fast-forward duration in seconds. |
| `backwardSeconds` | `int` | No | `10` | Rewind duration in seconds. |

```dart
await FlutterMediaSessionPlatform.instance.setSkipIntervals(
  forwardSeconds: 30,
  backwardSeconds: 15,
);
```
