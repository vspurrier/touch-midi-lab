# touch-midi-lab

Touch-first experiments for expressive MIDI control surfaces, beginning with a HiChord-inspired chord interface.

## Current prototype

The browser app in `web/` provides:

- Seven chord buttons and a joystick-style XY modifier surface
- A local square-wave preview synth for immediate feedback
- Experimental Web MIDI output for compatible browsers/devices
- MIDI event monitoring and an all-notes-off panic control
- Mouse, touch, and keyboard interaction

The app deliberately does not reproduce HiChord's sound engine. Koala Sampler is intended to be the eventual sound-producing endpoint; the local synth is only a self-contained development and debugging aid.

## Run it

From this directory, serve the files over HTTP:

```sh
python3 -m http.server 4173 -d web
```

Then open <http://localhost:4173>. Web MIDI generally requires HTTPS or localhost and a browser with Web MIDI support. The local audio preview works without MIDI hardware.

## Direction

The project is intentionally dependency-light while the interaction model is being explored. The next platform question is whether Android Chrome can expose the browser as a MIDI source that Koala can receive. If that proves unreliable, the UI and instrument logic can be retained while adding a small native Android MIDI adapter.

See [`docs/PLAN.md`](docs/PLAN.md) for the planned architecture and possible future controller families.
