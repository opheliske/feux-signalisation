# My Lights

Mobile app for Benoit — controls a physical traffic light (green, orange, red lamps) from his phone.

The light works through **modes**: named, looping sequences of steps (a combination of lamps + duration). The app lets you list, launch, create, edit and delete these modes on the device.

## Running the app

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app (iOS or Android).

## Simulation mode vs Wi-Fi

By default, the app runs in **simulation mode**: commands are printed to the console, no hardware required.

To control a real light over Wi-Fi, create a `.env` file at the root:

```
EXPO_PUBLIC_LIGHT_MODE=wifi
```

Then enter the light's IP address in the app's **Settings** screen.

## Firmware HTTP API

The app talks to the ESP32-C3 through a **binary API** (little-endian). The source of truth is [`services/protocol.ts`](services/protocol.ts), aligned with the firmware's C code (`main/modes/`).

| Action | Method | URL | Body |
|---|---|---|---|
| List the modes | `GET` | `http://<IP>/get_modes` | _(empty)_ |
| Active mode | `GET` | `http://<IP>/get_mode` | _(empty)_ |
| Firmware version | `GET` | `http://<IP>/version` | _(empty)_ |
| Command on a mode | `POST` | `http://<IP>/command` | binary packet |

The body of `POST /command` is `[ command_id : uint8 ] [ payload ]`:

| `command_id` | Action | Payload |
|---|---|---|
| `1` | `set` (activate) | `[ name_len u16 ] [ name ]` |
| `2` | `add` | `[ name_len u16 ] [ name ] [ loop u8 ] [ nb_steps u16 ] [[ mask u8 ][ duration u32 ] …]` |
| `4` | `delete` | `[ name_len u16 ] [ name ]` |
| `5` | `edit` | `[ name_len u16 ] [ name ] [ loop u8 ] [ nb_steps u16 ] [[ mask u8 ][ duration u32 ] …]` |

`mask` is a combination of lamp bits: green = `0x01`, orange = `0x02`, red = `0x04` (0 = off). `duration` is in milliseconds. Limits: `name` ≤ 100 bytes, ≤ 10 steps per mode.

The app polls `GET /get_mode` every 5 s (heartbeat) to track the active mode — which can change on the light side via the physical button — and to infer the connected / disconnected state.

> The legacy direct JSON endpoints (`/lampe`, `/allumer`, `/eteindre`) are inherited and outside the scope of the current mode-based firmware.

## Running the tests

```bash
npm test
```

The tests cover:
- the **binary protocol** ([`services/protocol.ts`](services/protocol.ts)): packet encoding/decoding, lamp masks, duration conversions;
- the **playback engine** ([`services/playbackEngine.ts`](services/playbackEngine.ts)): step progression, looping, pause, resume, stop.
