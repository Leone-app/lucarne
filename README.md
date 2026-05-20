# Cinema Player

Local cinema player for macOS. Manages a video loop and automatically starts a feature film at a scheduled time.

> Experimental project — 100% vibe coded with [Claude](https://claude.ai).

## Installation

```bash
npm install
```

## Start

```bash
npm start
```

Then open:
- **Control room** → http://localhost:3000 (on the Mac screen)
- **Projector** → http://localhost:3000/player.html (move to the projector screen, then press F for fullscreen)

## Usage

1. In the control room, select the **loop folder** (all videos inside play in a loop)
2. Select the **feature film**
3. Set the **start time** for the film (e.g. 20:30)
4. Open the projector window on the projector screen
5. Press **▶ Start show**

The loop starts immediately. At the scheduled time, the film launches automatically with a fade transition. When the film ends, the loop resumes.

## Supported formats

MP4, MOV, MKV, AVI, M4V, WebM — all formats natively supported by macOS/Safari.

## Manual controls

- **Restart loop**: switches immediately to loop mode
- **Play film now**: starts the film without waiting for the scheduled time
- **Stop**: stops everything

## Notes

- Config is saved in `config.json` and persists across restarts
- The server watches the loop folder — adding or removing videos is picked up live
- The projector window reconnects automatically if the server restarts
