const $CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag');
const $ListTag = Java.loadClass('net.minecraft.nbt.ListTag');
const $CuriosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');
const $CarryType = Java.loadClass('tschipp.carryon.common.carry.CarryOnData$CarryType');
const $DataManager = Java.loadClass('tschipp.carryon.common.carry.CarryOnDataManager');

//#region Profile
const saveProfile = (player) => {
    // 1. Temporarily strip keys from `persistentData` so they don't end up in the profile
    const cdmBackup = new $CompoundTag();
    CDM_KEYS.forEach((key) => {
        if (player.persistentData.contains(key)) {
            cdmBackup.put(key, player.persistentData.get(key));
            player.persistentData.remove(key);
        }
    });

    // 2. Save the full player NBT and strip excluded keys
    const nbt = new $CompoundTag();
    player.saveWithoutId(nbt);
    EXCLUDE_KEYS.forEach((key) => nbt.remove(key));

    // 3. Remove NeoForgeData entirely — it contains a live reference to `persistentData`
    //    which causes circular references when stored back into `persistentData`.
    //    CDM keys are already handled separately, and other persistent mod data
    //    should not be swapped between creative/survival profiles.
    nbt.remove('NeoForgeData');

    // 4. Deep-copy the tag to break ALL live object references.
    //    NeoForgeData (which contains persistentData) was already removed above,
    //    so copy() is safe and avoids SNBT round-trip failures with modded NBT.
    const copy = nbt.copy();

    // 5. Restore keys to the live `persistentData`
    getKeys(cdmBackup).forEach((key) => player.persistentData.put(key, cdmBackup.get(key)));

    console.info(`[CreativeDimension.saveProfile] Profile saved for player ${getPlayerName(player)}`);
    return copy;
}

const restoreProfile = (player, savedProfile) => {
    if (!savedProfile || savedProfile.isEmpty()) {
        console.warn(`[CreativeDimension.restoreProfile] No profile data to restore for player ${getPlayerName(player)}`);
        return;
    }

    console.info(`[CreativeDimension.restoreProfile] Restoring profile for player ${getPlayerName(player)}`);

    // Backup CDM data — player.load() will overwrite persistentData via NeoForgeData
    const cdmBackup = new $CompoundTag();
    CDM_KEYS.forEach((key) => {
        if (player.persistentData.contains(key)) {
            cdmBackup.put(key, player.persistentData.get(key));
        }
    });

    clearProfile(player);
    player.load(savedProfile);

    // Restore CDM keys to persistentData (player.load() overwrote it via NeoForgeData)
    getKeys(cdmBackup).forEach((key) => {
        player.persistentData.put(key, cdmBackup.get(key));
    });

    console.info(`[CreativeDimension.restoreProfile] Profile restored for player ${getPlayerName(player)}`);

    // Sync to client
    try { player.inventoryMenu.broadcastChanges(); } catch (e) { }
    try { player.containerMenu.broadcastChanges(); } catch (e) { }
}

function clearProfile(player) {
    try { player.inventory.clearContent(); }
    catch (e) {
        try { player.getInventory().clearContent(); } catch (e2) { }
    }

    try { player.getEnderChestInventory().clearContent(); } catch (e) { }

    try { player.removeAllEffects(); } catch (e) { }

    try {
        player.setHealth(player.getMaxHealth());
        player.setAbsorptionAmount(0);
    } catch (e) { }

    try {
        const foodData = player.getFoodData();
        foodData.setFoodLevel(20);
        foodData.setSaturation(5.0);
        foodData.setExhaustion(0.0);
    } catch (e) { }

    try {
        player.experienceLevel = 0;
        player.totalExperience = 0;
        player.experienceProgress = 0;
    } catch (e) { }
}
//#endregion Profile

//#region Curios
const saveCurios = (player) => {
    const wrapper = new $CompoundTag();

    $CuriosApi
        .getCuriosInventory(player)
        .ifPresent(function (handler) {
            const iter = handler.getCurios().entrySet().iterator();

            while (iter.hasNext()) {
                const entry = iter.next();

                wrapper.put(
                    String(entry.getKey()),
                    entry.getValue().serializeNBT()
                );
            }

            console.info(`[CreativeDimension.saveCurios] Curios saved for player ${getPlayerName(player)}: ${getKeys(wrapper).join(', ')}`);
        });

    return wrapper;
}

const restoreCurios = (player, wrapper) => {
    if (!wrapper || wrapper.isEmpty()) {
        console.warn(`[CreativeDimension.restoreCurios] No curios data to restore for player ${getPlayerName(player)}`);
        return;
    }

    $CuriosApi
        .getCuriosInventory(player)
        .ifPresent((handler) => {
            getKeys(wrapper).forEach((id) => {
                handler
                    .getStacksHandler(id)
                    .ifPresent((stacksHandler) => {
                        stacksHandler.deserializeNBT(wrapper.getCompound(id));
                    });
            });

            console.info(`[CreativeDimension.restoreCurios] Curios restored for player ${getPlayerName(player)}: ${getKeys(wrapper).join(', ')}`);
        });
}

const clearCurios = (player) => {
    $CuriosApi
        .getCuriosInventory(player)
        .ifPresent(function (handler) {
            const iter = handler.getCurios().entrySet().iterator();

            while (iter.hasNext()) {
                let entry = iter.next();
                let stacksHandler = entry.getValue();

                // Serialize current state to get the structure, then replace
                // item lists with explicit empty ListTags and deserialize back.
                // Just removing keys causes deserializeNBT to skip processing;
                // empty lists explicitly tell it "zero items".
                let nbt = stacksHandler.serializeNBT();
                getKeys(nbt).forEach(function (key) {
                    if (key !== 'Slots' && key !== 'SizeOverride') {
                        nbt.put(key, new $ListTag());
                    }
                });

                stacksHandler.deserializeNBT(nbt);
            }

            console.info(`[CreativeDimension.clearCurios] Curios cleared for player ${getPlayerName(player)}`);
        });
}
//#endregion Curios

//#region Position
const teleportToSavedPos = (player, key) => {
    if (!player.persistentData.contains(key)) return;

    const pos = player.persistentData.getCompound(key);
    const dim = pos.getString('dim');
    const x = pos.getDouble('x').toFixed(2);
    const y = (pos.getDouble('y') + 0.5).toFixed(2);
    const z = pos.getDouble('z').toFixed(2);
    const yRot = pos.getFloat('yRot').toFixed(1);
    const xRot = pos.getFloat('xRot').toFixed(1);

    const debugPos = `x=${x}, y=${y}, z=${z}, yRot=${yRot}, xRot=${xRot}`;
    player.server.runCommandSilent(`execute in ${dim} run tp ${getPlayerName(player)} ${x} ${y} ${z} ${yRot} ${xRot}`);
    console.info(`[CreativeDimension.teleportToSavedPos] Teleported ${getPlayerName(player)} to saved position (${debugPos}) in "${dim}"`);
}

const teleportToDefaultPos = (player, dimStr) => {
    const dimKey = getCreativeDimKey(dimStr);
    const dimConfig = dimKey ? CREATIVE_DIMS[dimKey] : null;

    let x, y, z;
    if (dimConfig && dimConfig.spawn) {
        x = dimConfig.spawn.x;
        y = dimConfig.spawn.y;
        z = dimConfig.spawn.z;
    } else {
        // Use overworld spawn as fallback (works for survival return and creative dims without custom spawn)
        const spawn = player.server.overworld().getSharedSpawnPos();
        x = spawn.getX();
        y = spawn.getY();
        z = spawn.getZ();
    }

    player.server.runCommandSilent('execute in ' + dimStr + ' run tp ' + getPlayerName(player) + ' ' + x + ' ' + y + ' ' + z);
    console.info(`[CreativeDimension.teleportToDefaultPos] Teleported ${getPlayerName(player)} to default position (${x}, ${y}, ${z}) in "${dimStr}"`);
}

const savePosition = (player, key) => {
    const pos = new $CompoundTag();
    pos.putString('dim', dimToString(player.level.dimension));
    pos.putDouble('x', player.getX());
    pos.putDouble('y', player.getY());
    pos.putDouble('z', player.getZ());
    pos.putFloat('yRot', player.getYRot ? player.getYRot() : 0.0);
    pos.putFloat('xRot', player.getXRot ? player.getXRot() : 0.0);
    player.persistentData.put(key, pos);

    console.info(`[CreativeDimension.savePosition] Saved position for player ${getPlayerName(player)}`);
}
//#endregion Position

//#region CarryOn
const isCarryingWithCarryOn = (player) => {
    try {
        let carryData = $DataManager.getCarryData(player);

        return (
            carryData.isCarrying($CarryType.BLOCK) ||
            carryData.isCarrying($CarryType.ENTITY) ||
            carryData.isCarrying($CarryType.PLAYER)
        );
    } catch (e) {
        console.error(`[CreativeDimension.isCarryingWithCarryOn] CarryOn check error: ${e}`);
    }

    return true;
}
//#endregion

//#region Dimension Change
/**
 * Handles transition between survival and creative dimensions.
 * Profile and curios are shared across all creative dimensions.
 * Positions are saved per creative dimension.
 *
 * @param {Player} player
 * @param {boolean} isEntering - true if survival→creative, false if creative→survival
 * @param {string} targetDimStr - the dimension string the player is traveling to
 */
function onCreativeDimTransition(player, isEntering, targetDimStr) {
    var from = isEntering ? 'survival' : 'creative';
    var to = isEntering ? 'creative' : 'survival';
    var tag = '[CreativeDimension.onCreativeDim' + (isEntering ? 'Enter' : 'Exit') + ']';
    var playerName = getPlayerName(player);

    console.info(tag + ' Player ' + playerName + ' ' + (isEntering ? 'entering' : 'exiting') + ' creative dimension');

    // Track whether the player is currently in the creative dimension
    if (isEntering) {
        player.persistentData.putBoolean(DATA_PREFIX + 'in_creative', true);
    } else {
        player.persistentData.remove(DATA_PREFIX + 'in_creative');
    }

    // Save current profile (shared across all creative dims)
    player.persistentData.put(DATA_PREFIX + from + '_profile', saveProfile(player));
    player.persistentData.put(DATA_PREFIX + from + '_curios', saveCurios(player));
    console.info(tag + ' ' + from + ' profile saved for player ' + playerName);

    // Save position — per-dimension for creative, single key for survival
    if (isEntering) {
        savePosition(player, DATA_PREFIX + 'survival_pos');
    } else {
        var currentDimStr = dimToString(player.level.dimension);
        var currentKey = getCreativeDimKey(currentDimStr);
        if (currentKey) {
            savePosition(player, DATA_PREFIX + 'creative_pos_' + currentKey);
        }
    }

    // Restore target profile (curios are deferred to next tick — see below)
    var hasTargetProfile = player.persistentData.contains(DATA_PREFIX + to + '_profile');
    if (hasTargetProfile) {
        restoreProfile(player, player.persistentData.getCompound(DATA_PREFIX + to + '_profile'));
        console.info(tag + ' ' + to + ' profile restored for player ' + playerName);
    } else if (isEntering) {
        clearProfile(player);
        console.info(tag + ' No ' + to + ' state found, state cleared for player ' + playerName);
    } else {
        console.warn(tag + ' No ' + to + ' state found for player ' + playerName);
    }

    // Determine teleport target
    var gameMode = isEntering ? 'creative' : 'survival';
    var posKey, tpDimStr;

    if (isEntering) {
        var targetKey = getCreativeDimKey(targetDimStr);
        posKey = DATA_PREFIX + 'creative_pos_' + targetKey;
        tpDimStr = targetDimStr;
    } else {
        posKey = DATA_PREFIX + 'survival_pos';
        tpDimStr = player.persistentData.contains(posKey)
            ? player.persistentData.getCompound(posKey).getString('dim')
            : 'minecraft:overworld';
    }

    var hasSavedPos = player.persistentData.contains(posKey);
    var curiosKey = DATA_PREFIX + to + '_curios';
    var msg = isEntering
        ? '\u00a7aYou have entered the creative dimension!'
        : '\u00a7aYou have returned to the survival dimension!';

    scheduleNextTick(player, function (_player) {
        _player.setGameMode(gameMode);

        if (hasSavedPos) {
            teleportToSavedPos(_player, posKey);
        } else {
            teleportToDefaultPos(_player, tpDimStr);
        }
        // Restore or clear curios AFTER the dimension change has completed,
        // otherwise changeDimension() re-syncs capabilities and overwrites our changes.
        if (hasTargetProfile) {
            restoreCurios(_player, _player.persistentData.getCompound(curiosKey));
        } else if (isEntering) {
            clearCurios(_player);
        }

        _player.tell(msg);
    });
}

/**
 * Handles switching between two creative dimensions (no profile swap needed).
 * Saves position for the current creative dim and teleports to the target.
 */
function onCreativeDimSwitch(player, targetDimStr) {
    var playerName = getPlayerName(player);
    var currentDimStr = dimToString(player.level.dimension);
    var currentKey = getCreativeDimKey(currentDimStr);
    var targetKey = getCreativeDimKey(targetDimStr);

    console.info('[CreativeDimension.onCreativeDimSwitch] Player ' + playerName + ' switching from ' + currentKey + ' to ' + targetKey);

    // Save position for the current creative dim
    if (currentKey) {
        savePosition(player, DATA_PREFIX + 'creative_pos_' + currentKey);
    }

    // Teleport to saved position in target creative dim, or default
    var posKey = DATA_PREFIX + 'creative_pos_' + targetKey;
    var hasSavedPos = player.persistentData.contains(posKey);

    scheduleNextTick(player, function (_player) {
        if (hasSavedPos) {
            teleportToSavedPos(_player, posKey);
        } else {
            teleportToDefaultPos(_player, targetDimStr);
        }

        _player.tell('\u00a7aSwitched to creative ' + targetKey + '!');
    });
}
//#endregion Dimension Change
