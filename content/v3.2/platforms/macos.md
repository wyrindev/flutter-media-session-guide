### macOS Setup

#### Overview

Standard playback, lock screen controls, and Control Center media widgets work out of the box without extra plist entries or entitlements.

> **Network Streams:** If your application streams media over HTTP/HTTPS under macOS App Sandbox, ensure your app's `macos/Runner/*.entitlements` file includes:
> ```xml
> <key>com.apple.security.network.client</key>
> <true/>
> ```
