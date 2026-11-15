### Action Slot Layout

Customizes the order and placement of media buttons on Android notifications and compact lock screen views.

#### Methods & Constructors

`FlutterMediaSessionPlatform.instance.setActionLayout(ActionSlotLayout layout)`

#### Symmetrical Layout: `ActionSlotLayout.symmetrical`

Places previous/play/next in the center with optional custom buttons on the outer ends.

| Parameter | Type | Required? | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `left` | `MediaAction?` | No | `null` | Custom action or feature placed on far left (slot 0). |
| `skipPrevious` | `MediaAction` | No | `MediaAction.skipToPrevious` | Previous track button. |
| `playPause` | `MediaAction` | No | `MediaAction.play` | Center toggle button. |
| `skipNext` | `MediaAction` | No | `MediaAction.skipToNext` | Next track button. |
| `right` | `MediaAction?` | No | `null` | Custom action or feature placed on far right (slot 4). |
| `compactActionIndices` | `List<int>?` | No | `[1, 2, 3]` | Up to 3 slot indices shown in collapsed notification. |

```dart
await FlutterMediaSessionPlatform.instance.setActionLayout(
  ActionSlotLayout.symmetrical(
    left: MediaAction.repeat,
    right: MediaAction.shuffle,
  ),
);
```

<div class="screenshot-grid">
  <div class="screenshot-card">
    <img src="img/screenshot/android_symmetrical.webp" alt="Symmetrical Layout" />
    <div class="screenshot-caption">Symmetrical layout: [Repeat, Prev, Pause, Next, Shuffle]</div>  </div>
  <div class="screenshot-card">
    <img src="img/screenshot/android_sequential.webp" alt="Sequential Layout" />
    <div class="screenshot-caption">Sequential layout: [Prev, Pause, Next, Repeat, Shuffle]</div>
  </div>
</div>

> **Player Compatibility Note:** Standard action slots such as `MediaAction.shuffle` and `MediaAction.repeat` depend on the underlying player adapter. While `just_audio` supports both natively, `media_kit` does not provide built-in shuffle state and only supports repeat modes in its default adapter.

#### Sequential Layout: `ActionSlotLayout.sequential`

Places core transport actions first, followed by optional custom actions.

| Parameter | Type | Required? | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `skipPrevious` | `MediaAction` | No | `MediaAction.skipToPrevious` | Previous track button. |
| `playPause` | `MediaAction` | No | `MediaAction.play` | Center toggle button. |
| `skipNext` | `MediaAction` | No | `MediaAction.skipToNext` | Next track button. |
| `custom1` | `MediaAction?` | No | `null` | 4th slot button. |
| `custom2` | `MediaAction?` | No | `null` | 5th slot button. |
| `compactActionIndices` | `List<int>?` | No | `[0, 1, 2]` | Up to 3 slot indices for compact view. |

```dart
await FlutterMediaSessionPlatform.instance.setActionLayout(
  ActionSlotLayout.sequential(
    custom1: MediaAction.repeat,
    custom2: MediaAction.custom(name: 'favorite', customLabel: 'Like', customIconResource: 'ic_heart'),
  ),
);
```

#### Custom Slot List: `ActionSlotLayout(slots, {compactActionIndices})`

Explicitly configure an exact list of up to 5 actions.

| Parameter | Type | Required? | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `slots` | `List<MediaAction>` | **Yes** | — | Explicit list of up to 5 action slots. |
| `compactActionIndices` | `List<int>?` | No | `null` | Explicit 0-based indices for compact mode (max 3). |

```dart
await FlutterMediaSessionPlatform.instance.setActionLayout(
  ActionSlotLayout(
    slots: [
      MediaAction.skipToPrevious,
      MediaAction.play,
      MediaAction.skipToNext,
      MediaAction.repeat,
      MediaAction.custom(name: 'favorite', customLabel: 'Like', customIconResource: 'ic_heart'),
    ],
    compactActionIndices: [0, 1, 2],
  ),
);
```

---

#### Custom Actions & Drawable Icons (Android)

Android notifications allow up to 5 buttons in expanded view. You can define custom buttons using `MediaAction.custom`:

```dart
final favoriteAction = MediaAction.custom(
  name: 'favorite',
  customLabel: 'Favorite',
  customIconResource: 'ic_heart', // Name of drawable resource without extension
);
```

<div class="screenshot-grid">
  <div class="screenshot-card">
    <img src="img/screenshot/android_standard_actions.webp" alt="Standard Actions" />
    <div class="screenshot-caption">Standard 3-button controls (Prev, Play/Pause, Next)</div>
  </div>
  <div class="screenshot-card">
    <img src="img/screenshot/android_custom_actions.webp" alt="Expanded with Custom Actions" />
    <div class="screenshot-caption">Expanded 5-button controls with custom actions & slot mapping</div>
  </div>
</div>

##### Resource Placement
Place custom vector or PNG icons in your Android app module:
* Path: `android/app/src/main/res/drawable/ic_heart.xml` (or `.png`)
* In Dart, pass only the resource name `'ic_heart'` (omit directory and `.xml`/`.png` extension).
