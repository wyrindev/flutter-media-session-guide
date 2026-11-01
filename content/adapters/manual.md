### Custom Player Adapter

For custom player packages (e.g. `audioplayers`, `video_player`, `fvp`) or proprietary audio pipelines, implement the `MediaSessionAdapter` interface to bridge your player events with system media controls.

---

#### 1. Adapter Template

Save this file as `custom_player_adapter.dart` and replace the placeholder API calls (`player.trackStream`, `player.statusStream`, etc.) with your player's actual stream and method names:

```dart
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_media_session/flutter_media_session.dart';

/// A template adapter bridging a custom audio/video player with [FlutterMediaSession].
///
/// Replace [TPlayer] with your concrete player class (e.g. `AudioPlayer`).
class CustomPlayerAdapter<TPlayer> implements MediaSessionAdapter {
  final TPlayer player;
  final bool manageLifecycle;

  final List<StreamSubscription> _subscriptions = [];
  FlutterMediaSession? _session;

  CustomPlayerAdapter(
    this.player, {
    this.manageLifecycle = false,
  });

  @override
  void bind(FlutterMediaSession session) {
    unbind();
    _session = session;

    if (manageLifecycle) {
      _session?.activate().catchError((e) {
        debugPrint('CustomPlayerAdapter: Failed to activate media session: $e');
      });
    }

    // 1. Synchronize metadata changes from your player
    _subscriptions.add(player.trackStream.listen((track) {
      FlutterMediaSessionPlatform.instance.updateMetadata(
        MediaMetadata(
          title: track.title,
          artist: track.artist,
          album: track.album,
          artworkUri: track.coverUrl,
          duration: track.duration,
        ),
      );
    }));

    // 2. Synchronize playback status and timeline
    _subscriptions.add(player.statusStream.listen((status) {
      FlutterMediaSessionPlatform.instance.updatePlaybackState(
        PlaybackState(
          status: status.isPlaying ? PlaybackStatus.playing : PlaybackStatus.paused,
          position: player.currentPosition,
          speed: player.playbackRate,
          bufferedPosition: player.bufferedPosition,
          repeatMode: player.isLooping ? MediaRepeatMode.one : MediaRepeatMode.none,
          shuffleModeEnabled: player.isShuffle,
        ),
      );
    }));

    // 3. Receive system remote transport commands
    _subscriptions.add(
      FlutterMediaSessionPlatform.instance.onMediaAction.listen((action) {
        switch (action.name) {
          case 'play':
            player.play();
            break;
          case 'pause':
            player.pause();
            break;
          case 'stop':
            player.stop();
            break;
          case 'seekTo':
            if (action.seekPosition != null) {
              player.seek(action.seekPosition!);
            }
            break;
          case 'skipToNext':
            player.next();
            break;
          case 'skipToPrevious':
            player.previous();
            break;
        }
      }),
    );
  }

  @override
  void unbind() {
    for (final subscription in _subscriptions) {
      subscription.cancel();
    }
    _subscriptions.clear();

    if (manageLifecycle) {
      _session?.deactivate().catchError((e) {
        debugPrint('CustomPlayerAdapter: Failed to deactivate media session: $e');
      });
    }
    _session = null;
  }
}
```

---

#### 2. Usage Template (Quickstart)

```dart
import 'package:flutter_media_session/flutter_media_session.dart';
import 'custom_player_adapter.dart';

final session = FlutterMediaSession();
final adapter = CustomPlayerAdapter(myPlayer, manageLifecycle: true);

// Bind adapter
session.bind(adapter);

// When disposing or switching players
session.unbind();
```

---

#### 3. Lightweight Alternative: Direct `setActionHandler`

If you don't need a full `MediaSessionAdapter` class, register action callbacks directly on `FlutterMediaSession`:

```dart
final session = FlutterMediaSession();
await session.activate();

session.setActionHandler(
  onPlay: () => myPlayer.play(),
  onPause: () => myPlayer.pause(),
  onStop: () => myPlayer.stop(),
  onSeekTo: (position) => myPlayer.seek(position),
  onSkipToNext: () => myPlayer.next(),
  onSkipToPrevious: () => myPlayer.previous(),
  onRewind: () => myPlayer.seek(myPlayer.position - const Duration(seconds: 10)),
  onFastForward: () => myPlayer.seek(myPlayer.position + const Duration(seconds: 10)),
);

// Clear callbacks when no longer needed:
session.clearActionHandler();
```

---

#### 4. Direct State API Reference

| Method | Parameters | Description |
| :--- | :--- | :--- |
| `updateMetadata` | `MediaMetadata` (`title`, `artist`, `album`, `artworkUri`, `duration`) | Updates title, artist, artwork on OS lock screen/media hubs. |
| `updatePlaybackState` | `PlaybackState` (`status`, `position`, `speed`, `bufferedPosition`, `repeatMode`, `shuffleModeEnabled`) | Syncs playing/paused status and seekbar scrubber position. |
| `updateAvailableActions` | `Set<MediaAction>?` | Declares which remote control buttons are enabled on OS controls. |
