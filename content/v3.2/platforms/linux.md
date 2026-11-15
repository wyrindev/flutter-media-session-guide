### Linux Setup

#### MPRIS 2 Integration

The plugin registers on the D-Bus Session Bus under `org.mpris.MediaPlayer2.<name>.instance<PID>` when `activate()` is called, exposing both the root interface and the player interface at `/org/mpris/MediaPlayer2`.

No extra runtime dependencies are required; GDBus is part of GLib/GTK. Build requirements:

```bash
sudo apt-get install -y clang cmake ninja-build pkg-config libgtk-3-dev
```

#### Application Identity (Optional)

By default, the MPRIS `Identity` and `DesktopEntry` are derived from the process name. Call `setAppId` before `activate()` to set them explicitly — see **Step 4: App Identity** for the full example.

> **Tip:** Matching the `id` argument to your `.desktop` filename (without the `.desktop` extension) allows desktop environments to associate the MPRIS session with your application's icon and metadata.
