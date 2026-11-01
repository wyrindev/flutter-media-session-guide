### `just_audio` Adapter

Integrate [`just_audio`](https://pub.dev/packages/just_audio) with `flutter_media_session`:

<div class="markdown-callout markdown-callout-note">
  <svg class="icon callout-icon"><use href="#icon-info"></use></svg>
  <div class="callout-content">
    <div class="callout-title">Verified Compatibility</div>
    <p>Tested and verified with <code>just_audio: ^0.9.40</code> (<code>>=0.9.0 &lt;1.0.0</code>).</p>
  </div>
</div>

---

#### 1. Adapter Implementation

Save this file as `just_audio_media_session_adapter.dart` in your project (e.g. `lib/services/just_audio_media_session_adapter.dart`):

```dart
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:just_audio/just_audio.dart';
import 'package:flutter_media_session/flutter_media_session.dart';

/// An adapter bridging `just_audio` [AudioPlayer] with [FlutterMediaSession].
class JustAudioMediaSessionAdapter implements MediaSessionAdapter {
  final AudioPlayer player;
  final MediaMetadata Function(AudioPlayer player)? metadataMapper;
  final bool manageLifecycle;

  final List<StreamSubscription> _subscriptions = [];
  FlutterMediaSession? _session;
  bool _isUpdating = false;

  JustAudioMediaSessionAdapter(
    this.player, {
    this.metadataMapper,
    this.manageLifecycle = false,
  });

  @override
  void bind(FlutterMediaSession session) {
    unbind();
    _session = session;

    if (manageLifecycle) {
      _session?.activate().catchError((e) {
        debugPrint('JustAudioAdapter: Failed to activate media session: $e');
      });
    }

    _subscriptions.add(player.playerStateStream.listen((_) => _syncPlaybackState()));
    _subscriptions.add(player.positionStream.listen((_) => _syncPlaybackState()));
    _subscriptions.add(player.durationStream.listen((_) {
      _syncMetadata();
      _syncPlaybackState();
    }));
    _subscriptions.add(player.speedStream.listen((_) => _syncPlaybackState()));
    _subscriptions.add(player.bufferedPositionStream.listen((_) => _syncPlaybackState()));
    _subscriptions.add(player.sequenceStateStream.listen((_) => _syncMetadata()));
    _subscriptions.add(FlutterMediaSessionPlatform.instance.onMediaAction.listen(_handleMediaAction));

    _syncMetadata();
    _syncPlaybackState();
  }

  @override
  void unbind() {
    for (final sub in _subscriptions) {
      sub.cancel();
    }
    _subscriptions.clear();

    if (manageLifecycle) {
      _session?.deactivate().catchError((e) {
        debugPrint('JustAudioAdapter: Failed to deactivate media session: $e');
      });
    }
    _session = null;
  }

  void _syncMetadata() {
    if (_session == null || _isUpdating) return;

    MediaMetadata metadata;
    if (metadataMapper != null) {
      metadata = metadataMapper!(player);
    } else {
      // Default extraction: try Map keys, then fall back to dynamic property access
      final currentItem = player.sequenceState?.currentSource;
      final tag = currentItem?.tag;

      String? title;
      String? artist;
      String? album;
      String? artworkUri;

      if (tag != null) {
        if (tag is Map) {
          title = tag['title']?.toString();
          artist = tag['artist']?.toString();
          album = tag['album']?.toString();
          artworkUri = tag['artworkUri']?.toString() ?? tag['artwork']?.toString();
        } else if (tag is String) {
          title = tag;
        } else {
          try {
            title = (tag as dynamic).title?.toString();
          } catch (_) {}
          try {
            artist = (tag as dynamic).artist?.toString();
          } catch (_) {}
          try {
            album = (tag as dynamic).album?.toString();
          } catch (_) {}
          try {
            artworkUri = (tag as dynamic).artworkUri?.toString() ?? (tag as dynamic).artwork?.toString();
          } catch (_) {}
        }
      }

      if (title == null || title.isEmpty) {
        try {
          final uriStr = (currentItem as dynamic).uri?.toString() ?? (currentItem as dynamic).url?.toString();
          if (uriStr != null) {
            title = Uri.decodeFull(uriStr.split('/').last.split('?').first);
          }
        } catch (_) {}
      }

      if (title == null || title.isEmpty) {
        title = tag?.toString() ?? 'Unknown Title';
      }

      metadata = MediaMetadata(
        title: title,
        artist: artist ?? 'Unknown Artist',
        album: album,
        artworkUri: artworkUri,
        duration: player.duration ?? Duration.zero,
      );
    }

    _isUpdating = true;
    FlutterMediaSessionPlatform.instance.updateMetadata(metadata).catchError((e) {
      debugPrint('JustAudioAdapter: Failed to update metadata: $e');
    }).whenComplete(() => _isUpdating = false);
  }

  void _syncPlaybackState() {
    if (_session == null) return;

    final state = player.playerState;
    PlaybackStatus status = PlaybackStatus.idle;

    if (state.processingState == ProcessingState.buffering ||
        state.processingState == ProcessingState.loading) {
      status = PlaybackStatus.buffering;
    } else if (state.playing) {
      status = PlaybackStatus.playing;
    } else if (state.processingState == ProcessingState.completed) {
      status = PlaybackStatus.ended;
    } else if (state.processingState == ProcessingState.idle) {
      status = PlaybackStatus.idle;
    } else {
      status = PlaybackStatus.paused;
    }

    MediaRepeatMode repeatMode = MediaRepeatMode.none;
    if (player.loopMode == LoopMode.one) {
      repeatMode = MediaRepeatMode.one;
    } else if (player.loopMode == LoopMode.all) {
      repeatMode = MediaRepeatMode.all;
    }

    final playbackState = PlaybackState(
      status: status,
      position: player.position,
      speed: player.speed,
      bufferedPosition: player.bufferedPosition,
      repeatMode: repeatMode,
      shuffleModeEnabled: player.shuffleModeEnabled,
    );

    FlutterMediaSessionPlatform.instance.updatePlaybackState(playbackState).catchError((e) {
      debugPrint('JustAudioAdapter: Failed to update playback state: $e');
    });

    _syncAvailableActions();
  }

  void _handleMediaAction(MediaAction action) async {
    try {
      switch (action.name) {
        case 'play':
          await player.play();
          break;
        case 'pause':
          await player.pause();
          break;
        case 'stop':
          await player.stop();
          break;
        case 'seekTo':
          if (action.seekPosition != null) {
            await player.seek(action.seekPosition!);
          }
          break;
        case 'skipToNext':
          if (player.hasNext) await player.seekToNext();
          break;
        case 'skipToPrevious':
          if (player.hasPrevious) await player.seekToPrevious();
          break;
        case 'shuffle':
          await player.setShuffleModeEnabled(!player.shuffleModeEnabled);
          _syncAvailableActions();
          break;
        case 'repeat':
          LoopMode nextMode = player.loopMode == LoopMode.off
              ? LoopMode.all
              : (player.loopMode == LoopMode.all ? LoopMode.one : LoopMode.off);
          await player.setLoopMode(nextMode);
          _syncAvailableActions();
          break;
      }
    } catch (e) {
      debugPrint('JustAudioAdapter: Error handling action ${action.name}: $e');
    }
  }

  void _syncAvailableActions() {
    if (_session == null) return;

    final actions = {
      MediaAction.play,
      MediaAction.pause,
      MediaAction.seekTo,
      MediaAction.stop,
      if (player.hasNext) MediaAction.skipToNext,
      if (player.hasPrevious) MediaAction.skipToPrevious,
      MediaAction.custom(
        name: 'shuffle',
        customLabel: 'Shuffle',
        customIconResource: player.shuffleModeEnabled ? 'ic_shuffle_on' : 'ic_shuffle_off',
      ),
      MediaAction.custom(
        name: 'repeat',
        customLabel: 'Repeat',
        customIconResource: player.loopMode == LoopMode.one
            ? 'ic_repeat_one'
            : (player.loopMode == LoopMode.all ? 'ic_repeat_on' : 'ic_repeat_off'),
      ),
    };

    FlutterMediaSessionPlatform.instance.updateAvailableActions(actions).catchError((e) {
      debugPrint('JustAudioAdapter: Failed to update available actions: $e');
    });
  }
}
```

---

#### 2. Usage Template (Quickstart)

Import the adapter and bind your `AudioPlayer` instance:

```dart
import 'package:flutter_media_session/flutter_media_session.dart';
import 'package:just_audio/just_audio.dart';
import 'just_audio_media_session_adapter.dart';

final player = AudioPlayer();
final session = FlutterMediaSession();

// 1. Create adapter (manageLifecycle: true automatically activates session on bind)
final adapter = JustAudioMediaSessionAdapter(
  player,
  manageLifecycle: true,
);

// 2. Bind the adapter
session.bind(adapter);

// 3. Load and play playlist (tag provides metadata automatically)
final playlist = ConcatenatingAudioSource(
  children: [
    AudioSource.uri(
      Uri.parse('https://example.com/track1.mp3'),
      tag: {
        'title': 'Track Title',
        'artist': 'Artist Name',
        'album': 'Album Name',
        'artworkUri': 'https://example.com/cover.jpg',
      },
    ),
  ],
);

await player.setAudioSource(playlist);
await player.play();
```

---

#### 3. Extending the Adapter

##### Custom Metadata Mapping
If your application uses custom model classes (e.g. `SongItem`) instead of `Map` for `AudioSource.tag`, pass `metadataMapper` to resolve fields:

```dart
final adapter = JustAudioMediaSessionAdapter(
  player,
  manageLifecycle: true,
  metadataMapper: (AudioPlayer player) {
    final currentItem = player.sequenceState?.currentSource;
    final tag = currentItem?.tag;

    if (tag is MySongModel) {
      return MediaMetadata(
        title: tag.name,
        artist: tag.singer,
        album: tag.albumTitle,
        artworkUri: tag.thumbnailUrl,
        duration: player.duration ?? Duration.zero,
      );
    }

    return MediaMetadata(
      title: 'Unknown Title',
      artist: 'Unknown Artist',
      duration: player.duration ?? Duration.zero,
    );
  },
);
```

##### Handling Custom Actions
If you configure custom notification buttons via `setActionLayout` (e.g. favorite or download buttons), listen directly to `onMediaAction`:

```dart
import 'dart:async';

StreamSubscription<MediaAction>? _actionSubscription;

void setupCustomActions() {
  _actionSubscription = FlutterMediaSessionPlatform.instance.onMediaAction.listen((MediaAction action) {
    switch (action.name) {
      case 'favorite':
        myFavoritesService.toggleLike();
        break;
      case 'download':
        myDownloadService.startDownload();
        break;
    }
  });
}

void dispose() {
  _actionSubscription?.cancel();
}
```

##### Subclassing the Adapter
To intercept actions or add custom state streams (e.g., analytics), extend `JustAudioMediaSessionAdapter`:

```dart
class MyCustomJustAudioAdapter extends JustAudioMediaSessionAdapter {
  MyCustomJustAudioAdapter(super.player, {super.manageLifecycle, super.metadataMapper});

  @override
  void bind(FlutterMediaSession session) {
    super.bind(session);
    // Listen to custom player streams or analytics here
  }
}
```
