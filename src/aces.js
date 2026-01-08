import { action, condition, expression } from "../template/aceDefine.js";

// ============================================
// FIRING CATEGORY
// ============================================
const firing = "Firing";

action(
  firing,
  "Fire",
  {
    highlight: true,
    deprecated: false,
    isAsync: false,
    listName: "Fire",
    displayText: "{my}: Fire weapon",
    description: "Fire the weapon (respects fire mode, ammo, and cooldown)",
    params: [],
  },
  function () {
    this.fire();
  }
);

action(
  firing,
  "SetFireMode",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Set fire mode",
    displayText: "{my}: Set fire mode to {0}",
    description: "Set the weapon's fire mode",
    params: [
      {
        id: "mode",
        name: "Fire Mode",
        desc: "The fire mode to set",
        type: "combo",
        initialValue: "single",
        items: [
          { single: "Single Shot" },
          { automatic: "Automatic" },
          { burst: "Burst Fire" },
        ],
      },
    ],
  },
  function (mode) {
    this.setFireMode(mode);
  }
);

action(
  firing,
  "SetFireRate",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Set fire rate",
    displayText: "{my}: Set fire rate to {0} seconds",
    description: "Set the time between shots in seconds",
    params: [
      {
        id: "rate",
        name: "Fire Rate",
        desc: "Time between shots in seconds",
        type: "number",
        initialValue: "0.1",
      },
    ],
  },
  function (rate) {
    this._fireRate = rate;
  }
);

action(
  firing,
  "ResetFireCooldown",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Reset fire cooldown",
    displayText: "{my}: Reset fire cooldown",
    description: "Instantly reset the fire cooldown, allowing immediate firing",
    params: [],
  },
  function () {
    this._fireCooldown = 0;
  }
);

action(
  firing,
  "SetBurstCount",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Set burst count",
    displayText: "{my}: Set burst count to {0}",
    description: "Set the number of shots in burst fire mode",
    params: [
      {
        id: "count",
        name: "Burst Count",
        desc: "Number of shots per burst",
        type: "number",
        initialValue: "3",
      },
    ],
  },
  function (count) {
    this._burstCount = Math.max(1, Math.floor(count));
  }
);

condition(
  firing,
  "CanFire",
  {
    highlight: true,
    deprecated: false,
    isTrigger: false,
    isInvertible: true,
    listName: "Can fire",
    displayText: "{my}: Can fire",
    description: "True if the weapon can fire (has ammo, not reloading, cooldown elapsed)",
    params: [],
  },
  function () {
    return this.canFire();
  }
);

condition(
  firing,
  "OnFire",
  {
    highlight: true,
    deprecated: false,
    isTrigger: true,
    isInvertible: false,
    listName: "On fire",
    displayText: "{my}: On fire",
    description: "Triggered when the weapon fires a shot",
    params: [],
  },
  function () {
    return true;
  }
);

condition(
  firing,
  "CompareFireMode",
  {
    highlight: false,
    deprecated: false,
    isTrigger: false,
    isInvertible: true,
    listName: "Compare fire mode",
    displayText: "{my}: Fire mode is {0}",
    description: "Check if the weapon is in a specific fire mode",
    params: [
      {
        id: "mode",
        name: "Fire Mode",
        desc: "The fire mode to compare",
        type: "combo",
        initialValue: "single",
        items: [
          { single: "Single Shot" },
          { automatic: "Automatic" },
          { burst: "Burst Fire" },
        ],
      },
    ],
  },
  function (mode) {
    return this.getFireModeString() === mode;
  }
);

expression(
  firing,
  "FireRate",
  {
    highlight: false,
    deprecated: false,
    returnType: "number",
    description: "Get the fire rate (time between shots in seconds)",
    params: [],
  },
  function () {
    return this._fireRate;
  }
);

expression(
  firing,
  "FireCooldown",
  {
    highlight: false,
    deprecated: false,
    returnType: "number",
    description: "Get the current fire cooldown remaining (in seconds)",
    params: [],
  },
  function () {
    return this._fireCooldown;
  }
);

expression(
  firing,
  "FireCooldownProgress",
  {
    highlight: false,
    deprecated: false,
    returnType: "number",
    description: "Get fire cooldown progress as a percentage (0-1, where 100 means ready to fire)",
    params: [],
  },
  function () {
    return this.getFireCooldownProgress();
  }
);

expression(
  firing,
  "FireMode",
  {
    highlight: false,
    deprecated: false,
    returnType: "string",
    description: "Get the current fire mode (\"single\", \"automatic\", or \"burst\")",
    params: [],
  },
  function () {
    return this.getFireModeString();
  }
);

expression(
  firing,  "BurstCount",
  {
    highlight: false,
    deprecated: false,
    returnType: "number",
    description: "Get the number of shots in burst fire mode",
    params: [],
  },
  function () {
    return this._burstCount;
  }
);

// ============================================
// AMMO CATEGORY
// ============================================
const ammo = "Ammo";

action(
  ammo,
  "SetCurrentAmmo",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Set current ammo",
    displayText: "{my}: Set current ammo to {0}",
    description: "Set the current ammunition count",
    params: [
      {
        id: "ammo",
        name: "Ammo",
        desc: "The ammo count to set",
        type: "number",
        initialValue: "30",
      },
    ],
  },
  function (ammoCount) {
    this._currentAmmo = Math.max(0, Math.min(ammoCount, this._maxAmmo));
  }
);

action(
  ammo,
  "SetMaxAmmo",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Set max ammo",
    displayText: "{my}: Set max ammo to {0}",
    description: "Set the maximum ammunition capacity",
    params: [
      {
        id: "maxAmmo",
        name: "Max Ammo",
        desc: "The maximum ammo capacity",
        type: "number",
        initialValue: "30",
      },
    ],
  },
  function (maxAmmo) {
    this._maxAmmo = Math.max(1, maxAmmo);
    this._currentAmmo = Math.min(this._currentAmmo, this._maxAmmo);
  }
);

action(
  ammo,
  "AddAmmo",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Add ammo",
    displayText: "{my}: Add {0} ammo",
    description: "Add ammunition to current count (capped at max)",
    params: [
      {
        id: "amount",
        name: "Amount",
        desc: "Amount of ammo to add",
        type: "number",
        initialValue: "10",
      },
    ],
  },
  function (amount) {
    const oldAmmo = this._currentAmmo;
    this._currentAmmo = Math.min(this._currentAmmo + amount, this._maxAmmo);
    if (this._currentAmmo > oldAmmo) {
      this._trigger("OnAddAmmo");
    }
  }
);

action(
  ammo,
  "SubtractAmmo",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Subtract ammo",
    displayText: "{my}: Subtract {0} ammo",
    description: "Subtract ammunition from current count",
    params: [
      {
        id: "amount",
        name: "Amount",
        desc: "Amount of ammo to subtract",
        type: "number",
        initialValue: "1",
      },
    ],
  },
  function (amount) {
    this._currentAmmo = Math.max(0, this._currentAmmo - amount);
  }
);

condition(
  ammo,
  "OnAddAmmo",
  {
    highlight: true,
    deprecated: false,
    isTrigger: true,
    isInvertible: false,
    listName: "On add ammo",
    displayText: "{my}: On add ammo",
    description: "Triggered when ammo is added to the weapon",
    params: [],
  },
  function () {
    return true;
  }
);

condition(
  ammo,
  "HasAmmo",
  {
    highlight: false,
    deprecated: false,
    isTrigger: false,
    isInvertible: true,
    listName: "Has ammo",
    displayText: "{my}: Has ammo",
    description: "True if the weapon has at least 1 ammo",
    params: [],
  },
  function () {
    return this._currentAmmo > 0;
  }
);

condition(
  ammo,
  "CompareCurrentAmmo",
  {
    highlight: false,
    deprecated: false,
    isTrigger: false,
    isInvertible: false,
    listName: "Compare current ammo",
    displayText: "{my}: Current ammo {0} {1}",
    description: "Compare the current ammo count",
    params: [
      {
        id: "comparison",
        name: "Comparison",
        desc: "How to compare",
        type: "cmp",
      },
      {
        id: "value",
        name: "Value",
        desc: "Value to compare to",
        type: "number",
        initialValue: "0",
      },
    ],
  },
  function (cmp, value) {
    const runtime = this._getRuntime();
    if (runtime) {
      return runtime.compareValues(this._currentAmmo, cmp, value);
    }
    return false;
  }
);

condition(
  ammo,
  "OnEmpty",
  {
    highlight: true,
    deprecated: false,
    isTrigger: true,
    isInvertible: false,
    listName: "On empty",
    displayText: "{my}: On empty",
    description: "Triggered when trying to fire with no ammo",
    params: [],
  },
  function () {
    return true;
  }
);

condition(
  ammo,
  "IsFull",
  {
    highlight: false,
    deprecated: false,
    isTrigger: false,
    isInvertible: true,
    listName: "Is ammo full",
    displayText: "{my}: Ammo is full",
    description: "True if current ammo equals max ammo",
    params: [],
  },
  function () {
    return this._currentAmmo >= this._maxAmmo;
  }
);

expression(
  ammo,
  "CurrentAmmo",
  {
    highlight: true,
    deprecated: false,
    returnType: "number",
    description: "Get the current ammunition count",
    params: [],
  },
  function () {
    return this._currentAmmo;
  }
);

expression(
  ammo,
  "MaxAmmo",
  {
    highlight: true,
    deprecated: false,
    returnType: "number",
    description: "Get the maximum ammunition capacity",
    params: [],
  },
  function () {
    return this._maxAmmo;
  }
);

expression(
  ammo,
  "AmmoPercent",
  {
    highlight: false,
    deprecated: false,
    returnType: "number",
    description: "Get ammo as a percentage (0-1)",
    params: [],
  },
  function () {
    if (this._maxAmmo <= 0) return 0;
    return (this._currentAmmo / this._maxAmmo);
  }
);

// ============================================
// RELOAD CATEGORY
// ============================================
const reload = "Reload";

action(
  reload,
  "Reload",
  {
    highlight: true,
    deprecated: false,
    isAsync: false,
    listName: "Start reload",
    displayText: "{my}: Start reload",
    description: "Start reloading the weapon",
    params: [],
  },
  function () {
    this.startReload();
  }
);

action(
  reload,
  "CancelReload",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Cancel reload",
    displayText: "{my}: Cancel reload",
    description: "Cancel the current reload",
    params: [],
  },
  function () {
    this.cancelReload();
  }
);

action(
  reload,
  "PartialReload",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Reload bullets",
    displayText: "{my}: Reload {0} bullet(s)",
    description: "Instantly reload a number of bullets (for Per-Bullet reload type)",
    params: [
      {
        id: "count",
        name: "Count",
        desc: "Number of bullets to reload",
        type: "number",
        initialValue: "1",
      },
    ],
  },
  function (count) {
    const bulletsToAdd = Math.max(1, Math.floor(count));
    const oldAmmo = this._currentAmmo;
    
    this._currentAmmo = Math.min(this._currentAmmo + bulletsToAdd, this._maxAmmo);
    
    if (this._currentAmmo > oldAmmo) {
      this._trigger("OnPartialReload");
      
      if (this._currentAmmo >= this._maxAmmo) {
        this._trigger("OnReloadComplete");
      }
    }
  }
);

action(
  reload,
  "SetReloadTime",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Set reload time",
    displayText: "{my}: Set reload time to {0} seconds",
    description: "Set the reload duration in seconds",
    params: [
      {
        id: "time",
        name: "Reload Time",
        desc: "Reload time in seconds",
        type: "number",
        initialValue: "2",
      },
    ],
  },
  function (time) {
    const newReloadTime = Math.max(0, time);
    
    // If currently reloading, adjust the timer proportionally
    if (this._isReloading && this._reloadTime > 0) {
      const progress = 1 - (this._reloadTimer / this._reloadTime);
      this._reloadTime = newReloadTime;
      this._reloadTimer = this._reloadTime * (1 - progress);
    } else {
      this._reloadTime = newReloadTime;
    }
  }
);

action(
  reload,
  "InstantReload",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Instant reload",
    displayText: "{my}: Instant reload",
    description: "Instantly reload the weapon to max ammo",
    params: [],
  },
  function () {
    this._currentAmmo = this._maxAmmo;
    this._isReloading = false;
  }
);

action(
  reload,
  "SetAutoReload",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Set auto reload",
    displayText: "{my}: Set auto reload to {0}",
    description: "Enable or disable auto reload when empty",
    params: [
      {
        id: "enabled",
        name: "Enabled",
        desc: "Whether auto reload is enabled",
        type: "combo",
        initialValue: "enabled",
        items: [
          { enabled: "Enabled" },
          { disabled: "Disabled" },
        ],
      },
    ],
  },
  function (enabled) {
    this._autoReload = enabled === "enabled";
  }
);

action(
  reload,
  "SetReloadType",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Set reload type",
    displayText: "{my}: Set reload type to {0}",
    description: "Set how the weapon reloads ammunition, Magazine: Traditional - press reload, wait full time, get full ammo, Per-Bullet: Reloads one bullet at a time over reload time, Charge-Based: Gradually reloads ammo over time",
    params: [
      {
        id: "reloadType",
        name: "Reload Type",
        desc: "The reload type",
        type: "combo",
        initialValue: "magazine",
        items: [
          { magazine: "Magazine Reload" },
          { per_bullet: "Per-Bullet Reload" },
        ],
      },
    ],
  },
  function (reloadType) {
    this._reloadType = reloadType;
  }
);

condition(
  reload,
  "IsReloading",
  {
    highlight: true,
    deprecated: false,
    isTrigger: false,
    isInvertible: true,
    listName: "Is reloading",
    displayText: "{my}: Is reloading",
    description: "True if the weapon is currently reloading",
    params: [],
  },
  function () {
    return this._isReloading;
  }
);

condition(
  reload,
  "CompareReloadType",
  {
    highlight: false,
    deprecated: false,
    isTrigger: false,
    isInvertible: false,
    listName: "Compare reload type",
    displayText: "{my}: Reload type is {0}",
    description: "Compare the current reload type",
    params: [
      {
        id: "reloadType",
        name: "Reload Type",
        desc: "The reload type to compare",
        type: "combo",
        initialValue: "magazine",
        items: [
          { magazine: "Magazine Reload" },
          { per_bullet: "Per-Bullet Reload" },
        ],
      },
    ],
  },
  function (reloadType) {
    return this._reloadType === reloadType;
  }
);

condition(
  reload,
  "OnReloadStart",
  {
    highlight: false,
    deprecated: false,
    isTrigger: true,
    isInvertible: false,
    listName: "On reload start",
    displayText: "{my}: On reload start",
    description: "Triggered when reload begins",
    params: [],
  },
  function () {
    return true;
  }
);

condition(
  reload,
  "OnPartialReloadStart",
  {
    highlight: false,
    deprecated: false,
    isTrigger: true,
    isInvertible: false,
    listName: "On partial reload start",
    displayText: "{my}: On partial reload start",
    description: "Triggered when per-bullet reload begins loading a bullet",
    params: [],
  },
  function () {
    return true;
  }
);

condition(
  reload,
  "OnReloadComplete",
  {
    highlight: true,
    deprecated: false,
    isTrigger: true,
    isInvertible: false,
    listName: "On reload complete",
    displayText: "{my}: On reload complete",
    description: "Triggered when reload finishes",
    params: [],
  },
  function () {
    return true;
  }
);

condition(
  reload,
  "OnPartialReload",
  {
    highlight: false,
    deprecated: false,
    isTrigger: true,
    isInvertible: false,
    listName: "On partial reload",
    displayText: "{my}: On partial reload",
    description: "Triggered when one bullet is loaded (Per-Bullet reload type only)",
    params: [],
  },
  function () {
    return true;
  }
);

expression(
  reload,
  "Reloading",
  {
    highlight: true,
    deprecated: false,
    returnType: "number",
    description: "Returns 1 if reloading, 0 if not",
    params: [],
  },
  function () {
    return this._isReloading ? 1 : 0;
  }
);

expression(
  reload,
  "ReloadTime",
  {
    highlight: false,
    deprecated: false,
    returnType: "number",
    description: "Get the reload duration in seconds",
    params: [],
  },
  function () {
    return this._reloadTime;
  }
);

expression(
  reload,
  "ReloadProgress",
  {
    highlight: false,
    deprecated: false,
    returnType: "number",
    description: "Get reload progress as percentage (0-1, where 1 means reload complete)",
    params: [],
  },
  function () {
    return this.getReloadProgress();
  }
);

expression(
  reload,
  "ReloadType",
  {
    highlight: false,
    deprecated: false,
    returnType: "string",
    description: "Get the current reload type (magazine, per_bullet, or charge_based)",
    params: [],
  },
  function () {
    return this._reloadType || "magazine";
  }
);
