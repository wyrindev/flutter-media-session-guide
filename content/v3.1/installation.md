{{OLD_VERSION_ALERT}}
### Add Dependency

Add `flutter_media_session` to your Flutter project using the command line:

```bash
flutter pub add flutter_media_session
```

Or manually add it to your `pubspec.yaml` under `dependencies`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_media_session: {{PACKAGE_VERSION_SPEC}}
```

Then run `flutter pub get` to install the package.

---

### Player Engine Packages (Optional)

`flutter_media_session` works with **any** playback engine. You can choose a popular audio package or bring your own custom audio pipeline:

* **just_audio**: A cross-platform audio player backed by platform-native decoders, with playlist, caching, and stream support.
  ```bash
  flutter pub add just_audio
  ```
* **media_kit**: A high-performance audio/video player powered by libmpv for desktop and mobile.
  ```bash
  flutter pub add media_kit
  flutter pub add media_kit_libs_audio # or media_kit_libs_video
  ```
* **Custom Engine / Other Packages** (e.g. `audioplayers`, `video_player`, native decoders):
  Use the **Manual (Custom Engine)** integration in Step 3 to push metadata and handle transport actions directly.
