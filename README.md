<img src="./src/icon.svg" width="100" /><br>
# WeaponKit
<i>Build shooter mechanics in minutes, not hours. Handles firing modes (single/auto/burst), four reload types (magazine/per-bullet/speed/passive), ammo pools, and fire rate cooldowns. Comprehensive triggers and expressions let you create everything from pistols to miniguns without event spaghetti.</i> <br>
### Version 1.2.0.0

[<img src="https://placehold.co/200x50/4493f8/FFF?text=Download&font=montserrat" width="200"/>](https://github.com/SalmanShhh/C3Addon-simple_weapon/releases/download/salmanshh_weaponkit-1.2.0.0.c3addon/salmanshh_weaponkit-1.2.0.0.c3addon)
<br>
<sub> [See all releases](https://github.com/SalmanShhh/C3Addon-simple_weapon/releases) </sub> <br>

#### What's New in 1.2.0.0
**Added:**
Introduces 'Speed Reload' and 'Passive Reload' types to weapon reload logic, including reserve ammo management for speed reload and automatic ammo regeneration for passive reload. Updates configuration, actions, expressions, and localization to support new reload types and reserve ammo

**Changed:**
refines reload time calculations for per-bullet and passive reloads.

**Fixed:**
fixed compare reload type and Fire Mode fixed
On Reload Start triggers for Passive Reload

<sub>[View full changelog](#changelog)</sub>

---
<b><u>Author:</u></b> SalmanShh <br>
<sub>Made using [CAW](https://marketplace.visualstudio.com/items?itemName=skymen.caw) </sub><br>

## Table of Contents
- [Usage](#usage)
- [Examples Files](#examples-files)
- [Properties](#properties)
- [Actions](#actions)
- [Conditions](#conditions)
- [Expressions](#expressions)
---
## Usage
To build the addon, run the following commands:

```
npm i
npm run build
```

To run the dev server, run

```
npm i
npm run dev
```

## Examples Files

---
## Properties
| Property Name | Description | Type |
| --- | --- | --- |
| Max Ammo | Maximum ammunition capacity (set to -1 for infinite ammo) | integer |
| Starting Ammo | Ammunition when the weapon is created | integer |
| Fire Rate | Time between shots in seconds | float |
| Fire Mode | Single Shot: Fires one bullet per Fire action call (semi-automatic, pistol/rifle). Automatic: Fires continuously each fire rate interval per Fire action (machine gun, SMG). Burst Fire: Fires multiple shots in quick succession per Fire action (burst rifles, consumes 1 ammo per burst). | combo |
| Burst Count | Number of shots in burst fire mode | integer |
| Burst Delay | Time between shots in a burst (seconds) | float |
| Reload Time | Time in seconds. Magazine/Speed: Full reload duration. Per-Bullet: Total time to reload all bullets (divided by max ammo per bullet). Passive: Seconds to regenerate one bullet. | float |
| Reload Type | How the weapon reloads. Magazine: Manual reload, restores max ammo after reload time. Per-Bullet: Manual reload, adds bullets one-by-one (total reload time ÷ max ammo per bullet). Speed Reload: Manual reload, discards remaining ammo and consumes from reserve pool. Passive Reload: Automatic regeneration (reload time = seconds per bullet). | combo |
| Auto Reload | Automatically reload when empty and firing | check |


---
## Actions
| Action | Description | Params
| --- | --- | --- |
| Add ammo | Add ammunition to current count (capped at max) | Amount             *(number)* <br> |
| Set current ammo | Set the current ammunition count | Ammo             *(number)* <br> |
| Set max ammo | Set the maximum ammunition capacity | Max Ammo             *(number)* <br> |
| Subtract ammo | Subtract ammunition from current count | Amount             *(number)* <br> |
| Fire | Fire the weapon (respects fire mode, ammo, and cooldown) |  |
| Reset fire cooldown | Instantly reset the fire cooldown, allowing immediate firing |  |
| Set burst count | Set the number of shots in burst fire mode | Burst Count             *(number)* <br> |
| Set fire mode | Set the weapon's fire mode | Fire Mode             *(combo)* <br> |
| Set fire rate | Set the time between shots in seconds | Fire Rate             *(number)* <br> |
| Add reserve ammo | Add ammunition to the reserve pool for Speed Reload | Amount             *(number)* <br> |
| Cancel reload | Cancel the current reload |  |
| Instant reload | Instantly reload the weapon to max ammo |  |
| Reload bullets | Instantly reload a number of bullets (for Per-Bullet reload type) | Count             *(number)* <br> |
| Start reload | Start reloading the weapon |  |
| Set auto reload | Enable or disable auto reload when empty | Enabled             *(combo)* <br> |
| Set reload time | Set the reload duration in seconds | Reload Time             *(number)* <br> |
| Set reload type | Set how the weapon reloads. Magazine: Manual reload restores max ammo. Per-Bullet: Manual reload adds bullets sequentially. Speed Reload: Manual reload discards remaining ammo and draws from reserves. Passive Reload: Automatic regeneration. | Reload Type             *(combo)* <br> |
| Set reserve ammo | Set the reserve ammunition count for Speed Reload (-1 = infinite) | Amount             *(number)* <br> |


---
## Conditions
| Condition | Description | Params
| --- | --- | --- |
| Compare current ammo | Compare the current ammo count | Comparison *(cmp)* <br>Value *(number)* <br> |
| Has ammo | True if the weapon has at least 1 ammo |  |
| Is ammo full | True if current ammo equals max ammo |  |
| On add ammo | Triggered when ammo is added to the weapon |  |
| On empty | Triggered when trying to fire with no ammo |  |
| Can fire | True if the weapon can fire (has ammo, not reloading, cooldown elapsed) |  |
| Compare fire mode | Check if the weapon is in a specific fire mode | Fire Mode *(combo)* <br> |
| On fire | Triggered when the weapon fires a shot |  |
| Compare reload type | Compare the current reload type | Reload Type *(combo)* <br> |
| Is reloading | True if the weapon is currently reloading |  |
| On partial reload | Triggered when one bullet is loaded (Per-Bullet and Passive Reload types) |  |
| On partial reload start | Triggered when per-bullet reload begins loading a bullet |  |
| On reload complete | Triggered when reload finishes |  |
| On reload start | Triggered when reload begins (Manual reload types and Passive Reload) |  |


---
## Expressions
| Expression | Description | Return Type | Params
| --- | --- | --- | --- |
| AmmoPercent | Get ammo as a percentage (0-1) | number |  | 
| CurrentAmmo | Get the current ammunition count | number |  | 
| MaxAmmo | Get the maximum ammunition capacity | number |  | 
| AutomaticFireModeID | Returns the ID for Automatic fire mode (1) | number |  | 
| BurstCount | Get the number of shots in burst fire mode | number |  | 
| BurstFireModeID | Returns the ID for Burst Fire mode (2) | number |  | 
| FireCooldown | Get the current fire cooldown remaining (in seconds) | number |  | 
| FireCooldownProgress | Get fire cooldown progress as a percentage (0-1, where 100 means ready to fire) | number |  | 
| FireMode | Get the current fire mode ("single", "automatic", or "burst") | string |  | 
| FireModeID | Get the current fire mode as a number (0=single, 1=automatic, 2=burst) | number |  | 
| FireRate | Get the fire rate (time between shots in seconds) | number |  | 
| SingleFireModeID | Returns the ID for Single Shot fire mode (0) | number |  | 
| PerBulletReloadTime | Get the reload time per bullet based on reload type. For Per-Bullet reload: ReloadTime / MaxAmmo. For Passive reload: ReloadTime (seconds per bullet). Otherwise: full ReloadTime | number |  | 
| Reloading | Returns 1 if reloading, 0 if not | number |  | 
| ReloadProgress | Get reload progress as percentage (0-1, where 1 means reload complete) | number |  | 
| ReloadTime | Get the reload duration in seconds | number |  | 
| ReloadType | Get the current reload type (magazine, per_bullet, speed_reload, or passive_reload) | string |  | 
| ReloadTypeID | Get the current reload type as a number (0=magazine, 1=per_bullet, 2=speed_reload, 3=passive_reload) | number |  | 
| ReloadTypeIDMagazine | Returns the ID for Magazine reload type (0) | number |  | 
| ReloadTypeIDPassive | Returns the ID for Passive Reload type (3) | number |  | 
| ReloadTypeIDPerBullet | Returns the ID for Per-Bullet reload type (1) | number |  | 
| ReloadTypeIDSpeed | Returns the ID for Speed Reload type (2) | number |  | 
| ReserveAmmo | Get the current reserve ammo count (-1 = infinite reserves) | number |  | 


---
## Changelog

### Version 1.2.0.0

**Added:**
Introduces 'Speed Reload' and 'Passive Reload' types to weapon reload logic, including reserve ammo management for speed reload and automatic ammo regeneration for passive reload. Updates configuration, actions, expressions, and localization to support new reload types and reserve ammo

**Changed:**
refines reload time calculations for per-bullet and passive reloads.

**Fixed:**
fixed compare reload type and Fire Mode fixed
On Reload Start triggers for Passive Reload
---

### Version 1.1.0.0

**Changed:**
removed Reload Type - Ammo Regeneration.

---

### Version 1.0.0.0

**Added:**
- Firing
Fire weapon with customizable fire rate
3 fire modes: Single Shot, Automatic, Burst Fire
Fire cooldown system prevents rapid firing
OnFire trigger for spawning projectiles/effects

- Ammo System
Max ammo capacity
Current ammo tracking
Add/subtract/set ammo via actions
OnEmpty trigger when out of ammo

Save/Load Support:

- Reload System
3 reload types:
Magazine: Reload all at once (traditional)
Per-Bullet: Load bullets one at a time (shotgun-style)
Ammo Regeneration: Automatic regeneration over time
Auto-reload option when empty
Manual reload action
OnReloadStart, OnReloadComplete, OnPartialReload triggers
Reload progress tracking (0-100%)

---

### Version 0.0.0.0

**Added:**
Initial release.

---
