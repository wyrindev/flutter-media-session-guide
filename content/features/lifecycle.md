### Session Lifecycle

Controls starting, stopping, and releasing the platform media controls and background services.

#### Methods

##### `FlutterMediaSession().activate()`

Initializes platform media controls, registers the foreground service on Android (requesting `POST_NOTIFICATIONS` permission if needed), and registers with the OS media controls.

```dart
final session = FlutterMediaSession();
await session.activate();
```

##### `FlutterMediaSession().deactivate()`

Removes OS notifications, stops foreground services, releases wake locks, and removes transport controls from the OS lock screen.

```dart
await session.deactivate();
```

> With `manageLifecycle: true`, the adapter calls `activate()` on bind and `deactivate()` on unbind automatically.
