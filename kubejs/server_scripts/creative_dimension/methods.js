const $CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag');
const $TagParser = Java.loadClass('net.minecraft.nbt.TagParser');
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

    // 4. Convert to SNBT string to break ALL object references.
    //    Storing a CompoundTag inside persistentData causes circular references
    //    because saveWithoutId() embeds live references to persistentData itself.
    const snbt = nbt.toString();

    // 5. Restore keys to the live `persistentData`
    getKeys(cdmBackup).forEach((key) => player.persistentData.put(key, cdmBackup.get(key)));

    console.info(`[CreativeDimension.saveProfile] Profile saved for player ${getPlayerName(player)}`);
    return snbt;
}

const restoreProfile = (player, snbt) => {
    if (!snbt || snbt.length === 0) {
        console.warn(`[CreativeDimension.restoreProfile] No profile data to restore for player ${getPlayerName(player)}`);
        return;
    }

    const savedProfile = $TagParser.parseTag(snbt);

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
                const entry = iter.next();

                const stacks = entry.getValue().getStacks();
                for (let i = 0; i < stacks.getSlots(); i++) {
                    stacks.setStackInSlot(i, 'minecraft:air');
                }

                const cosmetic = entry.getValue().getCosmeticStacks();
                for (let i = 0; i < cosmetic.getSlots(); i++) {
                    cosmetic.setStackInSlot(i, 'minecraft:air');
                }
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

const teleportToDefaultPos = (player) => {
    const dim = dimToString(player.level.dimension);
    let { x, y, z } = CREATIVE_DIM_SPAWN;

    if (dim !== CREATIVE_DIM) {
        const spawn = player.level.getSharedSpawnPos();
        x = spawn.getX();
        y = spawn.getY();
        z = spawn.getZ();
    }

    player.server.runCommandSilent('execute in ' + dim + ' run tp ' + getPlayerName(player) + ' ' + x + ' ' + y + ' ' + z);
    console.info(`[CreativeDimension.teleportToDefaultPos] No saved position, teleported ${getPlayerName(player)} to (${x}, ${y}, ${z}) in ${dim}`);
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
const onCreativeDimTransition = (player, isEntering) => {
    const from = isEntering ? 'survival' : 'creative';
    const to = isEntering ? 'creative' : 'survival';
    const tag = `[CreativeDimension.onCreativeDim${isEntering ? 'Enter' : 'Exit'}]`;
    const playerName = getPlayerName(player);

    console.info(`${tag} Player ${playerName} ${isEntering ? 'entered' : 'exiting'} creative dimension`);

    // Track whether the player is currently in the creative dimension
    if (isEntering) {
        player.persistentData.putBoolean(DATA_PREFIX + 'in_creative', true);
    } else {
        player.persistentData.remove(DATA_PREFIX + 'in_creative');
    }

    // Save current state (profile is stored as SNBT string to avoid circular NBT references)
    player.persistentData.putString(DATA_PREFIX + from + '_profile', saveProfile(player));
    player.persistentData.put(DATA_PREFIX + from + '_curios', saveCurios(player));
    savePosition(player, DATA_PREFIX + from + '_pos');
    console.info(`${tag} ${from} state saved for player ${playerName}`);

    // Restore target state
    if (player.persistentData.contains(DATA_PREFIX + to + '_profile')) {
        restoreProfile(player, player.persistentData.getString(DATA_PREFIX + to + '_profile'));
        restoreCurios(player, player.persistentData.getCompound(DATA_PREFIX + to + '_curios'));
        console.info(`${tag} ${to} profile restored for player ${playerName}`);
    } else if (isEntering) {
        clearProfile(player);
        clearCurios(player);
        console.info(`${tag} No ${to} state found, state cleared for player ${playerName}`);
    } else {
        console.warn(`${tag} No ${to} state found for player ${playerName}`);
    }

    // Apply game mode and teleport next tick
    const gameMode = isEntering ? 'creative' : 'survival';
    const msg = isEntering
        ? '\u00a7aYou have entered the creative dimension!'
        : '\u00a7aYou have returned to the survival dimension!';

    const posKey = DATA_PREFIX + to + '_pos';
    const hasSavedPos = player.persistentData.contains(posKey);

    scheduleNextTick(player, function (_player) {
        _player.setGameMode(gameMode);

        if (hasSavedPos) {
            teleportToSavedPos(_player, posKey);
        } else {
            teleportToDefaultPos(_player, to);
        }

        _player.tell(msg);
    });
}
//#endregion Dimension Change
