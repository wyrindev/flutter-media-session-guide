### Windows Setup

#### Window Initialization Requirement

SMTC handles are bound per-window via Win32 `HWND`. Activate the session after the Flutter engine creates the main window (e.g. inside or following `runApp`):

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}
```

> **App Title & Icon Identity:** Unpackaged Windows applications appear as "Unknown Application" in SMTC by default. See **Step 4: Windows AUMID Identity** to configure MSIX packaging or register a Start Menu shortcut identity.
