# Project plan

## Goal

Create a collection of touch-friendly software emulations of unusual musical hardware interfaces. The first experiment is a HiChord-inspired controller that sends MIDI to Koala Sampler on the same tablet.

## Boundaries for the first version

- No HiChord audio engine
- No accounts, cloud service, backend, or database
- No framework unless the interaction prototype demonstrates a need
- Local square-wave audio is for debugging only
- MIDI output is experimental and should fail gracefully when unavailable

## Architecture

```text
pointer / touch / keyboard
            ↓
semantic controller events
            ↓
HiChord-style state model
       ↙              ↘
local preview synth    MIDI output adapter
                           ↓
                         Koala
```

The UI should produce semantic events such as `chordPressed`, `chordReleased`, and `joystickMoved`. MIDI encoding and audio preview should remain separate so either can be replaced later.

## Delivery path

1. Desktop browser prototype and MIDI monitor
2. Android browser/PWA touch testing
3. Test browser-to-Koala routing on the target tablet
4. Add a native Android MIDI adapter only if browser MIDI cannot provide a reliable virtual MIDI source

## Possible future interfaces

- Monome-style grid
- Kaoss Pad-style XY surface
- Ribbon controller
- MPC/Launchpad-style pads
- ROLI/Seaboard-style expressive surface
- Buchla Thunder-style gesture controller
- Isomorphic keyboard layout
