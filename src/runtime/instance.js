import { id, addonType } from "../../config.caw.js";
import AddonTypeMap from "../../template/addonTypeMap.js";

export default function (parentClass) {
  return class extends parentClass {
    constructor() {
      super();
      const props = this._getInitProperties() || [];
      
      // Weapon settings from properties
      this._maxAmmo = Number(props[0]) || 30;
      this._currentAmmo = Number(props[1]) || 30;
      this._fireRate = Number(props[2]) || 0.1;
      this._fireMode = Number(props[3]) || 0;       // 0=single, 1=auto, 2=burst
      this._burstCount = Number(props[4]) || 3;
      this._burstDelay = Number(props[5]) || 0.05;
      this._reloadTime = Number(props[6]) || 2.0;
      this._autoReload = Boolean(props[7]);
      this._reloadType = String(props[8]) || "magazine"; // magazine, per_bullet
      
      // Internal state
      this._fireCooldown = 0;
      this._isReloading = false;
      this._reloadTimer = 0;
      this._burstShotsRemaining = 0;
      this._burstTimer = 0;

      // / If enabled, start calling _tick() to processtimer updates
      this._setTicking(true);
    }

    _tick() {
      // Get delta-time from the associated instance, to take in to account the instance's own time scale
      const dt = this.instance.dt;
      
      // Update fire cooldown
      if (this._fireCooldown > 0) {
        this._fireCooldown -= dt;
        if (this._fireCooldown < 0) {
          this._fireCooldown = 0;
        }
      }
      
      // Handle reload based on type
      if (this._isReloading) {
        this._reloadTimer -= dt;
        if (this._reloadTimer <= 0) {
          if (this._reloadType === "per_bullet") {
            this._reloadOneBullet();
          } else {
            this._completeReload();
          }
        }
      }
      
      // Handle burst fire timing
      if (this._burstShotsRemaining > 0 && this._burstTimer > 0) {
        this._burstTimer -= dt;
        if (this._burstTimer <= 0) {
          this._fireBurstShot();
        }
      }
    }

    _trigger(method) {
      super._trigger(self.C3[AddonTypeMap[addonType]][id].Cnds[method]);
    }

    // Check if weapon can fire
    canFire() {
      if (this._fireCooldown > 0) return false;
      if (this._isReloading) return false;
      if (this._currentAmmo <= 0) return false;
      if (this._burstShotsRemaining > 0) return false;
      return true;
    }

    // Fire a single shot
    _fireSingleShot() {
      if (this._currentAmmo <= 0) {
        this._trigger("OnEmpty");
        if (this._autoReload) {
          this.startReload();
        }
        return false;
      }
      
      this._currentAmmo--;
      this._fireCooldown = this._fireRate;
      
      // Trigger fire event
      this._trigger("OnFire");
      
      return true;
    }

    // Fire the weapon based on current fire mode
    fire() {
      if (!this.canFire()) {
        if (this._currentAmmo <= 0 && !this._isReloading) {
          this._trigger("OnEmpty");
          if (this._autoReload) {
            this.startReload();
          }
        }
        return false;
      }
      
      // Fire based on mode
      switch (this._fireMode) {
        case 0: // Single shot
        case 1: // Automatic
          return this._fireSingleShot();
        case 2: // Burst fire
          return this._startBurst();
        default:
          return this._fireSingleShot();
      }
    }

    // Start burst fire
    _startBurst() {
      if (this._burstShotsRemaining > 0) return false;
      
      // Check ammo only once for the entire burst
      if (this._currentAmmo <= 0) {
        this._trigger("OnEmpty");
        if (this._autoReload) {
          this.startReload();
        }
        return false;
      }
      
      // Consume one ammo for the entire burst
      this._currentAmmo--;
      this._fireCooldown = this._fireRate;
      
      this._burstShotsRemaining = this._burstCount;
      this._fireBurstShot();
      return true;
    }

    // Fire a single shot in burst mode
    _fireBurstShot() {
      if (this._burstShotsRemaining <= 0) {
        this._burstTimer = 0;
        return;
      }
      
      // Trigger fire event for each shot in burst
      this._trigger("OnFire");
      this._burstShotsRemaining--;
      
      if (this._burstShotsRemaining > 0) {
        this._burstTimer = this._burstDelay;
      } else {
        this._burstTimer = 0;
      }
    }

    // Start reload
    startReload() {
      if (this._isReloading) return false;
      if (this._currentAmmo >= this._maxAmmo) return false;
      
      this._isReloading = true;
      this._reloadTimer = this._reloadTime;
      
      this._trigger("OnReloadStart");
      
      return true;
    }

    // Reload one bullet (for per-bullet reload type)
    _reloadOneBullet() {
      this._trigger("OnPartialReloadStart");
      this._currentAmmo++;
      this._trigger("OnPartialReload");
      
      if (this._currentAmmo >= this._maxAmmo) {
        this._isReloading = false;
        this._reloadTimer = 0;
        this._trigger("OnReloadComplete");
      } else {
        // Continue reloading next bullet
        this._reloadTimer = this._reloadTime;
      }
    }

    // Complete reload
    _completeReload() {
      this._currentAmmo = this._maxAmmo;
      this._isReloading = false;
      this._reloadTimer = 0;
      this._trigger("OnReloadComplete");
    }

    // Cancel reload
    cancelReload() {
      if (!this._isReloading) return false;
      
      this._isReloading = false;
      this._reloadTimer = 0;
      
      return true;
    }

    // Get spawn position at origin
    getSpawnPosition() {
      const inst = this.instance;
      if (!inst) {
        console.warn("No instance available in getSpawnPosition");
        return { x: 0, y: 0, angle: 0 };
      }
      
      const wi = inst.GetWorldInfo();
      if (!wi){
        console.warn("No WorldInfo available in getSpawnPosition");
         return { x: 0, y: 0, angle: 0 };
      }
      
      // Always use origin position
      const x = wi.GetX();
      const y = wi.GetY();
      const angle = wi.GetAngle();
      
      return { x, y, angle };
    }

    // Set fire mode
    setFireMode(mode) {
      if (typeof mode === "string") {
        switch (mode.toLowerCase()) {
          case "single": this._fireMode = 0; break;
          case "automatic": 
          case "auto": this._fireMode = 1; break;
          case "burst": this._fireMode = 2; break;
          default: this._fireMode = 0;
        }
      } else {
        this._fireMode = mode;
      }
    }

    // Get fire mode as string
    getFireModeString() {
      switch (this._fireMode) {
        case 0: return "single";
        case 1: return "automatic";
        case 2: return "burst";
        default: return "single";
      }
    }

    // Get reload progress (0-1)
    getReloadProgress() {
      if (!this._isReloading) return 0;
      if (this._reloadTime <= 0) return 1;
      
      return 1 - (this._reloadTimer / this._reloadTime);
    }

    // Get fire cooldown progress (0-1)
    getFireCooldownProgress() {
      if (this._fireRate <= 0) return 1;
      return 1 - (this._fireCooldown / this._fireRate);
    }

    _release() {
      super._release();
    }

    _saveToJson() {
      return {
        currentAmmo: this._currentAmmo,
        maxAmmo: this._maxAmmo,
        fireRate: this._fireRate,
        fireMode: this._fireMode,
        burstCount: this._burstCount,
        burstDelay: this._burstDelay,
        reloadTime: this._reloadTime,
        autoReload: this._autoReload,
        reloadType: this._reloadType,
        isReloading: this._isReloading,
        reloadTimer: this._reloadTimer,
      };
    }

    _loadFromJson(o) {
      this._currentAmmo = o.currentAmmo;
      this._maxAmmo = o.maxAmmo;
      this._fireRate = o.fireRate;
      this._fireMode = o.fireMode;
      this._burstCount = o.burstCount;
      this._burstDelay = o.burstDelay;
      this._reloadTime = o.reloadTime;
      this._autoReload = o.autoReload;
      this._reloadType = o.reloadType || "magazine";
      this._isReloading = o.isReloading;
      this._reloadTimer = o.reloadTimer || 0;
    }

    _getDebuggerProperties() {
      return [{
        title: "$" + this.behaviorType.name,
        properties: [
          { name: "$reloadtype", value: this._reloadType },
          { name: "$currentAmmo", value: this._currentAmmo, onedit: v => this._currentAmmo = v },
          { name: "$maxAmmo", value: this._maxAmmo, onedit: v => this._maxAmmo = v },
          { name: "$fireRate", value: this._fireRate, onedit: v => this._fireRate = v },
          { name: "$fireMode", value: this.getFireModeString() },
          { name: "$burstCount", value: this._burstCount, onedit: v => this._burstCount = v },
          { name: "$burstDelay", value: this._burstDelay, onedit: v => this._burstDelay = v },
          { name: "$burstShotsRemaining", value: this._burstShotsRemaining },
          { name: "$reloadType", value: this._reloadType },
          { name: "$reloadTime", value: this._reloadTime, onedit: v => this._reloadTime = v },
          { name: "$isReloading", value: this._isReloading },
          { name: "$reloadProgress", value: this.getReloadProgress() },
        ]
      }];
    }
  };
}
