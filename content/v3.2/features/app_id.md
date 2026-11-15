### App Identity

`setAppId` registers the application's identity with the OS media subsystem. Its effect is platform-specific:

| Platform | Effect |
| :--- | :--- |
| **Windows** | Sets the AUMID so SMTC shows the app's title and icon instead of "Unknown Application". |
| **Linux** | Sets the MPRIS `DesktopEntry` (associates with a `.desktop` file) and `Identity` (display name). |
| Other platforms | No-op. |

Call `setAppId` before `session.activate()`.

---

#### Windows — Unpackaged / Portable Distribution

<div class="screenshot-grid">
  <div class="screenshot-card">
    <img src="img/screenshot/windows_unknown_app.webp" alt="Unknown Application without AUMID" />
    <div class="screenshot-caption">Default SMTC without AUMID (Unknown app)</div>
  </div>
  <div class="screenshot-card">
    <img src="img/screenshot/windows_known_app.webp" alt="Registered Application with AUMID" />
    <div class="screenshot-caption">With AUMID configured (App title and icon)</div>
  </div>
</div>

For portable or development builds without an installer:

```dart
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_media_session/flutter_media_session.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (!kIsWeb && Platform.isWindows) {
    // Must be called before session.activate()
    await FlutterMediaSession().setAppId(
      'com.company.myapp',
      displayName: 'My Media Player', // Creates Start Menu shortcut required by SMTC
      iconPath: r'C:\path\to\icon.ico', // Optional
    );
  }

  runApp(const MyApp());
  // Then call session.activate() when starting playback
}
```

##### Parameters

| Parameter | Type | Required? | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String` | **Yes** | — | Unique identifier (e.g. `com.company.myapp`). |
| `displayName` | `String?` | No | `null` | Display name. On Windows, used as the Start Menu shortcut name. On Linux, used as the MPRIS `Identity`. Omit on Windows if your installer already creates the required shortcut. |
| `iconPath` | `String?` | No | `null` | Absolute path to an icon file (`.ico` on Windows). |

---

#### Windows — Packaged MSIX Distribution

When packaging via MSIX, Windows automatically assigns the AUMID from the package identity. No call to `setAppId` is needed:

```yaml
# pubspec.yaml
msix_config:
  display_name: My Media Player
  publisher_display_name: My Company
  identity_name: com.mycompany.mymediaplayer
  msix_version: 1.0.0.0
  logo_path: windows/runner/resources/app_icon.ico
```

> **Note:** Inside an MSIX container, `flutter_media_session` detects the package identity automatically.

---

#### Linux — DesktopEntry & Identity

On Linux, `setAppId` sets the MPRIS `DesktopEntry` (used to associate with a `.desktop` file) and `Identity` (the human-readable application name visible to media controllers):

```dart
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_media_session/flutter_media_session.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (!kIsWeb && Platform.isLinux) {
    await FlutterMediaSession().setAppId(
      'com.example.myapp', // matches the .desktop filename (without .desktop extension)
      displayName: 'My Media Player',
    );
  }

  runApp(const MyApp());
}
```

> **Note:** `iconPath` is ignored on Linux; the application icon is resolved by the desktop environment from the `.desktop` file.

---

#### Migration from `setWindowsAppUserModelId`

`setWindowsAppUserModelId` is deprecated. Replace it with `setAppId`:

```dart
// Before
await FlutterMediaSession().setWindowsAppUserModelId('com.company.myapp', displayName: 'My App');

// After
await FlutterMediaSession().setAppId('com.company.myapp', displayName: 'My App');
```
