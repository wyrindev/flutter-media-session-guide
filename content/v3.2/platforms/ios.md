### iOS Setup

#### Background Audio Mode

Add the `audio` background mode to your iOS project's `ios/Runner/Info.plist`:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
</array>
```

#### Audio Session

`AVAudioSession` category and configuration are handled automatically by the plugin during playback. Custom audio categories are only needed if your app has specialized capture or ducking requirements.
