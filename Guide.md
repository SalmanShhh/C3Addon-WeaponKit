# WeaponKit Behavior Guide

**WeaponKit** is a Construct 3 behavior for building shooter weapon logic directly on object instances. It replaces repetitive event-sheet plumbing for fire cooldowns, fire modes, ammo accounting, and reload systems (including per-bullet, speed, and passive regeneration), so you can focus on game feel and effects while keeping weapon rules consistent and debuggable.

## Table of Contents

1. [Core Concepts](#1-core-concepts)
2. [Project Setup](#2-project-setup)
3. [Plugin Properties](#3-plugin-properties)
4. [Firing Modes and Shot Flow](#4-firing-modes-and-shot-flow)
5. [Reload Systems](#5-reload-systems)
6. [Ammo and Reserve Management](#6-ammo-and-reserve-management)
7. [Runtime Signals and State Checks](#7-runtime-signals-and-state-checks)
8. [Persistence and Save Behavior](#8-persistence-and-save-behavior)
9. [C3 Debugger](#9-c3-debugger)
10. [Actions Reference](#10-actions-reference)
11. [Conditions Reference](#11-conditions-reference)
12. [Expressions Reference](#12-expressions-reference)
13. [Triggers Reference](#13-triggers-reference)
14. [Game Use Cases](#14-game-use-cases)
15. [Feature Deep-Dives](#15-feature-deep-dives)
16. [Tips and Common Mistakes](#16-tips-and-common-mistakes)

## 1. Core Concepts

### The problem this addon solves
Without a dedicated weapon behavior, you usually hand-build a web of timers, booleans, and counters for each gun: cooldown timers, burst sequencing, reload state, ammo pools, and trigger events. **WeaponKit** centralizes that logic in one behavior so every weapon object follows the same reliable rules.

Event sheet example:
```text
Event: On Left Mouse Button pressed
  Action: PlayerWeapon.WeaponKit -> Fire
  // one call triggers mode-aware behavior (single/auto/burst) and ammo checks
```

### Key design decisions
- **Per-instance behavior model**: each object with WeaponKit has independent ammo, cooldown, and reload state.
- **Mode + type IDs under the hood**: fire mode and reload type are internally numeric (`0..2` and `0..3`), while expressions provide readable strings too.
- **Trigger-first integration**: firing/reload/empty events are exposed as triggers so VFX/SFX/UI can react cleanly.
- **Infinite ammo support**: `max_ammo = -1` bypasses ammo depletion checks for arcade/prototype setups.

Event sheet example:
```text
Event: WeaponKit On fire
  Action: Spawn Bullet at Muzzle
  Action: Audio -> Play "shot"
  // behavior decides if shot is valid; this event handles consequences
```

### Key concepts at a glance

| Concept | Meaning | Why it matters |
|---|---|---|
| **Current Ammo** | Ammo currently loaded in the weapon | Gate for firing and reload transitions |
| **Max Ammo** | Capacity of the weapon magazine/chamber (`-1` = infinite) | Defines full state and ammo percent |
| **Fire Rate** | Seconds between legal shots | Controls DPS pacing |
| **Fire Mode** | `single`, `automatic`, or `burst` | Changes behavior of `Fire` action |
| **Reload Type** | `magazine`, `per_bullet`, `speed_reload`, `passive_reload` | Controls how ammo returns |
| **Reserve Ammo** | External pool used by speed reload (`-1` = infinite) | Enables survival-style ammo economy |

### Scenarios where this addon excels
- **Quick shooter prototyping**: wire up a playable gun in minutes.
- **Multiple weapon archetypes**: pistol/SMG/shotgun behaviors from one system.
- **UI-heavy games**: use expressions for ammo bars and reload indicators.
- **Ammo economy gameplay**: reserve pools with speed reload tradeoffs.
- **Arcade wave games**: passive reload and auto-reload keep pacing high.
- **Data-driven balancing**: tune properties at runtime through actions.

## 2. Project Setup

1. Add the **WeaponKit** behavior to your weapon-bearing object (e.g., `PlayerWeapon`).
2. Configure initial properties (ammo, fire mode, reload type).
3. Add input events that call `Fire` and `Start reload`.
4. Hook triggers to your effects/UI.
5. Add HUD text using expressions.

First working setup:
```text
Event: On Start of layout
  Action: PlayerWeapon.WeaponKit -> Set max ammo to 30
  Action: PlayerWeapon.WeaponKit -> Set current ammo to 30
  Action: PlayerWeapon.WeaponKit -> Set fire mode to "single"
  Action: PlayerWeapon.WeaponKit -> Set reload type to "magazine"

Event: Left Mouse Button is down
  Condition: PlayerWeapon.WeaponKit Can fire
  Action: PlayerWeapon.WeaponKit -> Fire

Event: On R pressed
  Action: PlayerWeapon.WeaponKit -> Start reload

Event: PlayerWeapon.WeaponKit On fire
  Action: Spawn Bullet at Muzzle
  Action: HUDText -> Set text to "Ammo: " & PlayerWeapon.WeaponKit.CurrentAmmo

Event: PlayerWeapon.WeaponKit On reload complete
  Action: HUDText -> Set text to "Ammo: " & PlayerWeapon.WeaponKit.CurrentAmmo
```

## 3. Plugin Properties

> WeaponKit is a **behavior**; this table lists its behavior properties from `config.caw.js`.

| Property | Type | Default | Description |
|---|---|---:|---|
| Max Ammo (`max_ammo`) | Integer | `30` | Magazine/chamber capacity. Use `-1` for infinite ammo. |
| Starting Ammo (`starting_ammo`) | Integer | `30` | Initial current ammo on creation. |
| Fire Rate (`fire_rate`) | Float | `0.1` | Seconds between legal shots. |
| Fire Mode (`fire_mode`) | Combo | `single` | Shot mode: single, automatic, burst. |
| Burst Count (`burst_count`) | Integer | `3` | Number of shots emitted by one burst cycle. |
| Burst Delay (`burst_delay`) | Float | `0.05` | Delay between shots inside a burst. |
| Reload Time (`reload_time`) | Float | `2.0` | Magazine/speed total reload duration; per-bullet total refill duration; passive seconds-per-bullet. |
| Reload Type (`reload_type`) | Combo | `magazine` | Reload behavior: magazine, per_bullet, speed_reload, passive_reload. |
| Auto Reload (`auto_reload`) | Check | `true` | If enabled, tries to start reload when firing empty. |

Property-driven setup example:
```text
Event: On Start of layout
  Action: Rifle.WeaponKit -> Set fire rate to 0.08
  Action: Rifle.WeaponKit -> Set burst count to 3
  Action: Rifle.WeaponKit -> Set auto reload to "enabled"
  // runtime actions let you override editor defaults for difficulty tiers
```

## 4. Firing Modes and Shot Flow

### What it does and when to use it
Use fire modes to shape weapon identity:
- **Single**: one shot per legal call.
- **Automatic**: continuous calls fire as cooldown allows.
- **Burst**: one trigger call emits multiple timed shots but consumes one ammo.

### How to configure or call it
- Set startup mode via property or `Set fire mode` action.
- Call `Fire` from input events.
- Gate with `Can fire` condition for clean control flow.

Example:
```text
Event: Left Mouse Button is down
  Condition: PlayerWeapon.WeaponKit Compare fire mode = "automatic"
  Condition: PlayerWeapon.WeaponKit Can fire
  Action: PlayerWeapon.WeaponKit -> Fire
  // hold-to-fire for automatic weapons

Event: Left Mouse Button pressed
  Condition: PlayerWeapon.WeaponKit Compare fire mode = "single"
  Action: PlayerWeapon.WeaponKit -> Fire
  // click-to-fire for semi-auto
```

### Edge cases and gotchas
- In **burst mode**, one ammo is consumed for the whole burst sequence.
- `On fire` can trigger multiple times during one burst.
- Calling `Fire` while cooldown/reload active safely does nothing (except empty handling).

## 5. Reload Systems

### What it does and when to use it
WeaponKit provides four reload styles:
- **Magazine Reload**: refill to max after reload time.
- **Per-Bullet Reload**: increments ammo one bullet at a time.
- **Speed Reload**: discards remaining loaded ammo and reloads from reserve pool.
- **Passive Reload**: regenerates ammo over time automatically.

### How to configure or call it
- Set reload style with `Set reload type`.
- Use `Start reload` and `Cancel reload` for manual flows.
- Use `Set reserve ammo` / `Add reserve ammo` for speed reload economy.

Example:
```text
Event: On R pressed
  Condition: Weapon.WeaponKit Compare reload type = "per_bullet"
  Action: Weapon.WeaponKit -> Start reload
  // starts incremental loading loop

Event: Weapon.WeaponKit On partial reload
  Action: Audio -> Play "shell_insert"
  Action: HUDText -> Set text to "Ammo: " & Weapon.WeaponKit.CurrentAmmo
```

### Edge cases and gotchas
- **Speed reload** requires enough reserve ammo unless reserve is `-1` (infinite).
- **Passive reload** can fire `On reload start` and then repeated `On partial reload`.
- `Cancel reload` affects active manual reload states; passive regeneration follows reload type logic.

## 6. Ammo and Reserve Management

### What it does and when to use it
This feature group handles current ammo, max ammo, and reserve pool updates for gameplay systems like pickups, perks, and loadouts.

### How to configure or call it
- Use `Add ammo` / `Subtract ammo` for incremental changes.
- Use `Set current ammo` / `Set max ammo` for direct overrides.
- Use reserve actions when using speed reload.

Example:
```text
Event: Player overlaps AmmoCrate
  Action: Weapon.WeaponKit -> Add ammo 15
  Action: Weapon.WeaponKit -> Add reserve ammo 30
  Action: Destroy AmmoCrate
  // hybrid pickup fills loaded ammo and reserves
```

### Edge cases and gotchas
- `On add ammo` only triggers when ammo is actually added by add-ammo logic.
- Setting very low max ammo can force clipping behavior in UI assumptions.
- `max_ammo = -1` is a special infinite mode and changes many normal comparisons.

## 7. Runtime Signals and State Checks

### What it does and when to use it
Use conditions and triggers to build responsive effects/UI without polling everything every tick.

### How to configure or call it
- Use **conditions** (`Can fire`, `Is reloading`, `Has ammo`) for decision branches.
- Use **triggers** (`On fire`, `On empty`, `On reload complete`) for event reactions.

Example:
```text
Event: Weapon.WeaponKit On empty
  Action: Audio -> Play "dry_fire"
  Action: HUDText -> Set text to "OUT OF AMMO"
  // no bullet spawn here; this is only feedback logic

Event: Every tick
  Condition: Weapon.WeaponKit Is reloading
  Action: ReloadBar -> Set width to 200 * Weapon.WeaponKit.ReloadProgress
```

### Edge cases and gotchas
- `On empty` can trigger when trying to fire with zero ammo.
- Auto-reload may start immediately after empty fire attempt when enabled.
- Trigger handlers should be side-effect focused (FX/UI), not state duplication.

## 8. Persistence and Save Behavior

WeaponKit serializes runtime values through save/load (`_saveToJson` / `_loadFromJson`), including ammo counts, selected modes/types, reload state, timers, reserve ammo, and passive reload accumulator.

Event sheet example:
```text
Event: On save requested
  Action: System -> Save game to slot "slot1"

Event: On load requested
  Action: System -> Load game from slot "slot1"
  // weapon state (ammo/reload/timers) restores automatically via behavior serialization
```

Practical notes:
- Save during reload can restore mid-reload state.
- Reserve ammo persists, including `-1` infinite reserve.

## 9. C3 Debugger

WeaponKit implements `_getDebuggerProperties`, so live state appears in the C3 debugger.

### What sections the debugger shows
- One section named after the behavior type (e.g., `WeaponKit`).

### Fields

| Field | Meaning |
|---|---|
| `currentAmmo` | Current loaded ammo (or `Infinite` when max is infinite). |
| `maxAmmo` | Capacity (or `Infinite`). |
| `fireMode` | Readable current fire mode string. |
| `reloadType` | Numeric reload type ID (`0..3`). |
| `isReloading` | Whether a manual reload cycle is active. |
| `reloadProgress` | Progress from `0` to `1`. |
| `reserveAmmo` | Current reserve ammo (`Infinite` if `-1`). |


Debugger-focused example:
```text
Event: On T pressed
  Action: Weapon.WeaponKit -> Set reserve ammo to 999
  // verify reserveAmmo change instantly in debugger panel
```

## 10. Actions Reference

### Ammo

| Action | Description |
|---|---|
| Add ammo | Adds ammo to current ammo, respecting max limits. |
| Subtract ammo | Removes ammo from current ammo, useful for scripted penalties. |
| Set current ammo | Sets loaded ammo directly to a specific value. |
| Set max ammo | Changes weapon capacity at runtime. |

### Firing

| Action | Description |
|---|---|
| Fire | Attempts to fire using current mode, cooldown, and ammo rules. |
| Set fire mode | Switches mode between single, automatic, and burst. |
| Set fire rate | Changes time between shots in seconds. |
| Set burst count | Sets number of shots emitted by burst mode. |
| Reset fire cooldown | Clears cooldown so next legal fire can happen immediately. |

### Reload

| Action | Description |
|---|---|
| Start reload | Begins reload based on current reload type. |
| Cancel reload | Cancels active manual reload cycle. |
| Instant reload | Immediately fills weapon to full ammo behavior rules. |
| Reload bullets | Instantly adds a number of bullets (per-bullet style helper). |
| Set reload time | Sets reload duration/regen timing parameter. |
| Set reload type | Switches active reload behavior model. |
| Set auto reload | Enables/disables auto reload on empty fire attempt. |
| Set reserve ammo | Sets reserve pool (`-1` for infinite). |
| Add reserve ammo | Adds to reserve pool for speed reload economy. |

Action usage example:
```text
Event: On pickup "RapidFireBoost"
  Action: Weapon.WeaponKit -> Set fire rate to 0.05
  Action: Weapon.WeaponKit -> Reset fire cooldown
  // immediate effect without waiting for old cooldown
```

## 11. Conditions Reference

| Condition | Description |
|---|---|
| Has ammo | True when current ammo is at least 1. |
| Is ammo full | True when current ammo equals max ammo. |
| Compare current ammo | Compares current ammo using chosen comparator/value. |
| Can fire | True when cooldown is clear, ammo is valid, and weapon is not blocked by reload/burst state. |
| Compare fire mode | True when active mode matches selected mode. |
| Is reloading | True while manual reload is active. |
| Compare reload type | True when active reload type matches selected type. |

Condition usage example:
```text
Event: Every tick
  Condition: Weapon.WeaponKit Has ammo
  Action: Crosshair -> Set animation "ready"

Event: Every tick
  Condition: Weapon.WeaponKit Is reloading
  Action: Crosshair -> Set animation "reload"
```

## 12. Expressions Reference

| Expression | Returns | Description |
|---|---|---|
| CurrentAmmo | number | Current loaded ammo amount. |
| MaxAmmo | number | Weapon capacity value. |
| AmmoPercent | number | Loaded ammo ratio from `0` to `1`. |
| FireRate | number | Current fire rate in seconds per shot. |
| FireCooldown | number | Remaining cooldown seconds before next shot. |
| FireCooldownProgress | number | Cooldown progress from `0` to `1`. |
| FireMode | string | Current fire mode string (`single`, `automatic`, `burst`). |
| FireModeID | number | Current fire mode ID (`0..2`). |
| SingleFireModeID | number | Constant ID for single mode (`0`). |
| AutomaticFireModeID | number | Constant ID for automatic mode (`1`). |
| BurstFireModeID | number | Constant ID for burst mode (`2`). |
| BurstCount | number | Current configured burst shot count. |
| ReloadTime | number | Current reload timing parameter. |
| ReloadProgress | number | Reload progress from `0` to `1`. |
| Reloading | number | `1` if reloading, else `0`. |
| ReloadType | string | Current reload type string. |
| ReloadTypeID | number | Current reload type ID (`0..3`). |
| ReloadTypeIDMagazine | number | Constant ID for magazine reload (`0`). |
| ReloadTypeIDPerBullet | number | Constant ID for per-bullet reload (`1`). |
| ReloadTypeIDSpeed | number | Constant ID for speed reload (`2`). |
| ReloadTypeIDPassive | number | Constant ID for passive reload (`3`). |
| PerBulletReloadTime | number | Effective per-bullet timing helper value. |
| ReserveAmmo | number | Current reserve ammo (`-1` means infinite). |

Expression usage example:
```text
Event: Every tick
  Action: AmmoText -> Set text to Weapon.WeaponKit.CurrentAmmo & " / " & Weapon.WeaponKit.MaxAmmo
  Action: CooldownBar -> Set width to 120 * Weapon.WeaponKit.FireCooldownProgress
```

## 13. Triggers Reference

| Trigger | Description |
|---|---|
| On fire | Fires whenever a shot is emitted (including each burst shot). |
| On empty | Fires when attempting to fire with no ammo. |
| On add ammo | Fires when ammo is successfully added. |
| On reload start | Fires when reload begins (manual and passive behavior start). |
| On partial reload start | Fires when a per-bullet step begins. |
| On partial reload | Fires when one bullet is added in per-bullet/passive flows. |
| On reload complete | Fires when reload reaches completion/full state. |

Trigger usage example:
```text
Event: Weapon.WeaponKit On reload complete
  Action: Audio -> Play "reload_done"
  Action: HUDFlash -> Start effect "green"
```

## 14. Game Use Cases

### 1) Basic pistol
**Scenario:** A semi-auto pistol with simple manual reload.

Event sheet:
```text
Event: On Start of layout
  Action: Pistol.WeaponKit -> Set fire mode to "single"
  Action: Pistol.WeaponKit -> Set reload type to "magazine"

Event: Left Mouse Button pressed
  Action: Pistol.WeaponKit -> Fire
```
Tip: pair with `On fire` for muzzle flash and recoil.

### 2) Hold-to-fire SMG
**Scenario:** Automatic weapon that fires while button is held.

Event sheet:
```text
Event: Left Mouse Button is down
  Condition: SMG.WeaponKit Can fire
  Action: SMG.WeaponKit -> Fire
```
Tip: tune fire rate and spread in tandem.

### 3) Burst rifle
**Scenario:** Tactical rifle that emits 3 rounds per click.

Event sheet:
```text
Event: On Start of layout
  Action: Rifle.WeaponKit -> Set fire mode to "burst"
  Action: Rifle.WeaponKit -> Set burst count to 3

Event: Left Mouse Button pressed
  Action: Rifle.WeaponKit -> Fire
```
Tip: `On fire` runs for each burst shot, so spawn one bullet per trigger.

### 4) Shotgun shell-by-shell
**Scenario:** Reload one shell at a time with interruption potential.

Event sheet:
```text
Event: On R pressed
  Action: Shotgun.WeaponKit -> Set reload type to "per_bullet"
  Action: Shotgun.WeaponKit -> Start reload

Event: Shotgun.WeaponKit On partial reload
  Action: Audio -> Play "shell_insert"
```
Tip: call `Cancel reload` when player fires mid-reload.

### 5) Arena auto-reload flow
**Scenario:** Fast-paced game with no manual reload key.

Event sheet:
```text
Event: On Start of layout
  Action: Gun.WeaponKit -> Set auto reload to "enabled"

Event: Left Mouse Button is down
  Action: Gun.WeaponKit -> Fire
```
Tip: let `On empty` play feedback while auto-reload transitions.

### 6) Survival reserve economy
**Scenario:** Reload consumes scarce reserve ammo.

Event sheet:
```text
Event: On Start of layout
  Action: Rifle.WeaponKit -> Set reload type to "speed_reload"
  Action: Rifle.WeaponKit -> Set reserve ammo to 90

Event: On R pressed
  Action: Rifle.WeaponKit -> Start reload
```
Tip: display `ReserveAmmo` in HUD to support player planning.

### 7) Infinite-reserve tactical shooter
**Scenario:** Reserve never runs out, but reload timing still matters.

Event sheet:
```text
Event: On Start of layout
  Action: Rifle.WeaponKit -> Set reload type to "speed_reload"
  Action: Rifle.WeaponKit -> Set reserve ammo to -1
```
Tip: keep reserve UI hidden when using infinite reserve.

### 8) Energy weapon with passive recharge
**Scenario:** Ammo regenerates over time automatically.

Event sheet:
```text
Event: On Start of layout
  Action: Blaster.WeaponKit -> Set reload type to "passive_reload"
  Action: Blaster.WeaponKit -> Set reload time to 0.5

Event: Blaster.WeaponKit On partial reload
  Action: EnergyBar -> Set width to 200 * Blaster.WeaponKit.AmmoPercent
```
Tip: passive mode works best with strong overheat-like feedback.

### 9) Boss phase weapon tuning
**Scenario:** Weapon changes behavior in phase 2.

Event sheet:
```text
Event: BossHP <= 50%
  Action: BossGun.WeaponKit -> Set fire mode to "automatic"
  Action: BossGun.WeaponKit -> Set fire rate to 0.04
```
Tip: reset cooldown after major mode swap for immediate responsiveness.

### 10) Dynamic pickup buffs
**Scenario:** Temporary item boosts burst size.

Event sheet:
```text
Event: On pickup BurstBooster
  Action: PlayerGun.WeaponKit -> Set fire mode to "burst"
  Action: PlayerGun.WeaponKit -> Set burst count to 5

Event: 10 seconds after pickup
  Action: PlayerGun.WeaponKit -> Set burst count to 3
```
Tip: pair buff timers with HUD icon state.

### 11) Scripted cutscene firing
**Scenario:** Enemy fires scripted volleys independent of input.

Event sheet:
```text
Event: Every 0.25 seconds
  Condition: EnemyGun.WeaponKit Can fire
  Action: EnemyGun.WeaponKit -> Fire
```
Tip: this keeps cooldown logic centralized even in AI scripts.

### 12) Dry-fire UX polish
**Scenario:** Play click sound and prompt reload when empty.

Event sheet:
```text
Event: PlayerGun.WeaponKit On empty
  Action: Audio -> Play "dry_click"
  Action: HintText -> Set text to "Press R to reload"
```
Tip: keep `On empty` lightweight; avoid repeated heavy logic.

### 13) Mid-fight emergency reload
**Scenario:** Instant refill powerup in roguelike rooms.

Event sheet:
```text
Event: On pickup InstantMag
  Action: Weapon.WeaponKit -> Instant reload
```
Tip: still trigger VFX so player reads state change.

### 14) Wave reset cleanup
**Scenario:** New wave starts with normalized ammo state.

Event sheet:
```text
Event: On wave started
  Action: Weapon.WeaponKit -> Set current ammo to Weapon.WeaponKit.MaxAmmo
  Action: Weapon.WeaponKit -> Cancel reload
```
Tip: prevents stale reload states carrying into fresh encounters.

### 15) Multi-weapon loadout swap
**Scenario:** Player switches active weapon object.

Event sheet:
```text
Event: On weapon slot changed to 2
  Action: Pistol -> Set visible false
  Action: Rifle -> Set visible true
  // each object keeps its own WeaponKit ammo/cooldown state
```
Tip: behavior state is per object instance, so no manual state copy needed.

### 16) Low-ammo warning system
**Scenario:** Flash HUD below threshold.

Event sheet:
```text
Event: Every tick
  Condition: Weapon.WeaponKit Compare current ammo <= 5
  Action: AmmoText -> Set color "red"
```
Tip: combine with `AmmoPercent` for smooth gradient UI.

### 17) Edge-case save/load during reload
**Scenario:** Player saves mid-reload and resumes later.

Event sheet:
```text
Event: On save hotkey pressed
  Action: System -> Save game to slot "quick"

Event: On load hotkey pressed
  Action: System -> Load game from slot "quick"
```
Tip: validate restore visually using debugger `reloadProgress` field.

## 15. Feature Deep-Dives

### Fire cooldown pipeline
- `Fire` only succeeds when cooldown is clear and state allows firing.
- Successful fire sets cooldown to `FireRate`.
- `FireCooldownProgress` lets you animate reticles and shot-ready bars.

Example:
```text
Event: Every tick
  Action: ReticleCooldown -> Set angle to 360 * Weapon.WeaponKit.FireCooldownProgress
```

### Burst behavior model
- Burst starts once per valid call.
- Emits multiple timed `On fire` triggers using `Burst Count` and `Burst Delay`.
- Ammo cost is one unit per burst cycle in current implementation.

Example:
```text
Event: Weapon.WeaponKit On fire
  Action: Spawn Bullet
  // executes for each burst shot, not just burst start
```

### Reload model comparison

| Reload Type | Input style | Ammo source | Best for |
|---|---|---|---|
| Magazine | Manual (`R`) | Magazine refill | Standard shooter feel |
| Per-Bullet | Manual (`R`) | Incremental fill | Shotguns/revolvers |
| Speed Reload | Manual (`R`) | Reserve pool | Survival/economy systems |
| Passive Reload | Automatic | Time-based regen | Energy weapons/arcade loops |

Comparison example:
```text
Event: On weapon archetype selected "energy"
  Action: Weapon.WeaponKit -> Set reload type to "passive_reload"
  Action: Weapon.WeaponKit -> Set reload time to 0.75
```

## 16. Tips and Common Mistakes

- **Use `Can fire` for held input** to avoid unnecessary `Fire` calls every tick.
- **Remember burst semantics**: one ammo currently powers an entire burst sequence.
- **Set reserve ammo when using speed reload**, or reload may fail with limited reserve.
- **Treat `-1` as special infinite value** for max ammo/reserve ammo in your UI logic.
- **Do not duplicate internal timers in events**; read `ReloadProgress`/`FireCooldownProgress` instead.
- **Use triggers for effects and conditions for decisions** to keep event sheets readable.
- **When testing passive reload**, verify both `On reload start` and repeated `On partial reload` behavior.
- **Save/load testing should include mid-reload states** to confirm persistence behaves as expected.
