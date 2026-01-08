<img src="./src/icon.svg" width="100" /><br>
# Simple Weapon
<i>Handle firing, reloading, ammo management, and multiple fire modes without complex events. Perfect for shooters, action games, and any project needing weapon systems.</i> <br>
### Version 1.1.0.0

[<img src="https://placehold.co/200x50/4493f8/FFF?text=Download&font=montserrat" width="200"/>](https://github.com/SalmanShhh/C3Addon-simple_weapon/releases/download/v1.0.0.0/salmanshh_simple_weapon-1.1.0.0.c3addon)
<br>
<sub> [See all releases](https://github.com/SalmanShhh/simple_weapon/releases) </sub> <br>

#### What's New in 1.1.0.0
**Changed:**
removed Reload Type - Ammo Regeneration.


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
| Max Ammo | Maximum ammunition capacity | integer |
| Starting Ammo | Ammunition when the weapon is created | integer |
| Fire Rate | Time between shots in seconds | float |
| Fire Mode | The firing mode of the weapon, Single Shot: One shot per trigger pull; Automatic: Continuous fire while trigger held; Burst Fire: Fires a set number of shots per trigger pull | combo |
| Burst Count | Number of shots in burst fire mode | integer |
| Burst Delay | Time between shots in a burst (seconds) | float |
| Reload Time | Time to reload in seconds (or per bullet for Per-Bullet type, or ammo regen rate for Ammo Regeneration) | float |
| Auto Reload | Automatically reload when empty and firing | check |
| Reload Type | How the weapon reloads ammunition. Magazine: Traditional - press reload, wait full time, get full ammo; Per-Bullet: Reloads one bullet at a time over reload time | combo |


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
| Cancel reload | Cancel the current reload |  |
| Instant reload | Instantly reload the weapon to max ammo |  |
| Reload bullets | Instantly reload a number of bullets (for Per-Bullet reload type) | Count             *(number)* <br> |
| Start reload | Start reloading the weapon |  |
| Set auto reload | Enable or disable auto reload when empty | Enabled             *(combo)* <br> |
| Set reload time | Set the reload duration in seconds | Reload Time             *(number)* <br> |
| Set reload type | Set how the weapon reloads ammunition, Magazine: Traditional - press reload, wait full time, get full ammo, Per-Bullet: Reloads one bullet at a time over reload time, Charge-Based: Gradually reloads ammo over time | Reload Type             *(combo)* <br> |


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
| On partial reload | Triggered when one bullet is loaded (Per-Bullet reload type only) |  |
| On partial reload start | Triggered when per-bullet reload begins loading a bullet |  |
| On reload complete | Triggered when reload finishes |  |
| On reload start | Triggered when reload begins |  |


---
## Expressions
| Expression | Description | Return Type | Params
| --- | --- | --- | --- |
| AmmoPercent | Get ammo as a percentage (0-1) | number |  | 
| CurrentAmmo | Get the current ammunition count | number |  | 
| MaxAmmo | Get the maximum ammunition capacity | number |  | 
| BurstCount | Get the number of shots in burst fire mode | number |  | 
| FireCooldown | Get the current fire cooldown remaining (in seconds) | number |  | 
| FireCooldownProgress | Get fire cooldown progress as a percentage (0-1, where 100 means ready to fire) | number |  | 
| FireMode | Get the current fire mode ("single", "automatic", or "burst") | string |  | 
| FireRate | Get the fire rate (time between shots in seconds) | number |  | 
| Reloading | Returns 1 if reloading, 0 if not | number |  | 
| ReloadProgress | Get reload progress as percentage (0-1, where 1 means reload complete) | number |  | 
| ReloadTime | Get the reload duration in seconds | number |  | 
| ReloadType | Get the current reload type (magazine, per_bullet, or charge_based) | string |  | 


---
## Changelog

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
