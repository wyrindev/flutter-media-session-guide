### Windows AUMID Identity
Windows SMTC identifies applications using an **Application User Model ID (AUMID)** to display your app's title and icon instead of "Unknown Application".

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

---

#### 1. Unpackaged / Portable Distribution (`.zip` / Portable EXE)

For portable distributions or development builds without an installer, call `setWindowsAppUserModelId` before activating:

```dart
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_media_session/flutter_media_session.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (!kIsWeb && Platform.isWindows) {
    // Must be called before session.activate()
    await FlutterMediaSession().setWindowsAppUserModelId(
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
| `id` | `String` | **Yes** | — | Unique identifier string (e.g. `com.company.myapp`). |
| `displayName` | `String?` | No | `null` | Display name for the Start Menu shortcut created by this call. Omit if your installer already creates the required shortcut. |
| `iconPath` | `String?` | No | `null` | Optional absolute path to `.ico` file for the shortcut icon. |

---

#### 2. Packaged MSIX Distribution

When packaging via MSIX (e.g. using `msix:create`), Windows automatically assigns the AUMID from your package identity:

```yaml
# pubspec.yaml
msix_config:
  display_name: My Media Player
  publisher_display_name: My Company
  identity_name: com.mycompany.mymediaplayer
  msix_version: 1.0.0.0
  logo_path: windows/runner/resources/app_icon.ico
```

> **Note:** Inside an MSIX container, `flutter_media_session` detects package identity automatically and bypasses manual shortcut generation.
