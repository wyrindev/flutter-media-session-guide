### Android Setup

#### Default Integration

Android requires minimal configuration for typical audio applications:
* **Permissions:** Notification permission (`POST_NOTIFICATIONS`) is requested automatically at runtime on Android 13+ (API 33+) when starting the session. If the user denies notification permission, background playback continues, but the system media notification and lock screen controls will not be visible.
* **Foreground Service:** The media playback foreground service is automatically registered and managed.

#### Stripping Connected Device Permission (Optional)

By default, the plugin declares `FOREGROUND_SERVICE_CONNECTED_DEVICE` for cast/remote device control. If you choose to remove this permission, Android 14+ requires explicitly specifying the foreground service type in `AndroidManifest.xml`:

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">
    
    <uses-permission 
        android:name="android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE" 
        tools:node="remove" />

    <application ...>
        <service
            android:name="dev.wyrin.flutter_media_session.FlutterMediaSessionService"
            android:foregroundServiceType="mediaPlayback"
            tools:replace="android:foregroundServiceType" />
    </application>
</manifest>
```
> Custom notification buttons and drawable icons can be configured under **Action Slot Layout & Icons**.
