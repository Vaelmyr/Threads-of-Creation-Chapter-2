/**
 * Save the player's current position, rotation, gamemode (and dimension for survival pool)
 * into persistentData under the appropriate key.
 * @param {$ServerPlayer} player
 */
function saveCurrentLocationState(player) {
    let states = player.persistentData.getCompound("creative_dimension:pool_states");
    const currentDimensionId = getDimensionId(player.level.dimension);
    const currentDimensionPool = getPoolFromDimensionId(currentDimensionId);

    let state = new $CompoundTag();
    state.put("pos", [player.getX(), player.getY(), player.getZ()]);
    state.put("rotation", [player.getYRot ? player.getYRot() : 0, player.getXRot ? player.getXRot() : 0]);
    state.putInt("gamemode", player.gameMode.getGameModeForPlayer().id);

    if (currentDimensionPool === 'survival') {
        state.putString("dimension", currentDimensionId);
        states.put("survival", state);
    } else {
        states.put(currentDimensionId, state);
    }

    player.persistentData.put("creative_dimension:pool_states", states);
}

/**
 * Restore the player's gamemode for the target dimension from saved state.
 * Defaults to `creative` for creative pool and `survival` for survival pool.
 * @param {$ServerPlayer} player
 * @param {string} targetDimensionId    Target dimension ID to restore gamemode for, e.g. `creative_dimension:superflat`
 */
function restorePlayerGamemode(player, targetDimensionId) {
    const playerName = getPlayerName(player);
    const dimensionPool = getPoolFromDimensionId(targetDimensionId);
    const stateKey = dimensionPool === "survival" ? "survival" : targetDimensionId;

    let gamemode = dimensionPool === "creative" ? "creative" : "survival";

    const states = player.persistentData.getCompound("creative_dimension:pool_states");
    if (states.contains(stateKey)) {
        const state = states.getCompound(stateKey);

        if (state.contains("gamemode")) {
            const gamemodeId = state.getInt("gamemode");
            gamemode = GAMEMODE_NAMES[gamemodeId] || gamemode;
        }
    }

    const cmd = `gamemode ${gamemode} ${playerName}`;
    player.server.runCommandSilent(cmd);
}

/**
 * Save the player's current pool to persistentData so it can be used for respawning in the correct dimension and other edge cases.
 * @param {$ServerPlayer} player
 */
function saveCurrentPool(player) {
    const currentDimensionId = getDimensionId(player.level.dimension);
    const currentDimensionPool = getPoolFromDimensionId(currentDimensionId);
    player.persistentData.putString("creative_dimension:last_dimension_pool", currentDimensionPool);
}

/**
 * Create a snapshot of the player's current state. Ignoring `BLACKLIST_NBT_KEYS` to avoid issues when loading the state later.
 * @param {$ServerPlayer} player
 * @returns {$CompoundTag}
 */
function snapshotPlayerState(player) {
    var nbt = new $CompoundTag();
    player.saveWithoutId(nbt);
    BLACKLIST_NBT_KEYS.forEach(key => nbt.remove(key));
    return nbt;
}

/**
 * Load the player's state from the given NBT. Ignoring `BLACKLIST_NBT_KEYS` to avoid issues when loading the state.
 * @param {$ServerPlayer} player
 * @param {$CompoundTag} nbt
 */
function loadPlayerState(player, nbt) {
    if (!nbt) return;
    BLACKLIST_NBT_KEYS.forEach(key => nbt.remove(key));

    const persistentDataCopy = player.persistentData.copy();
    player.load(nbt);
    player.persistentData.merge(persistentDataCopy);
}

/**
 * Clear the player's state to default to avoid exploit crossing over between pools when no saved state exists for the target pool.
 * @param {$ServerPlayer} player
 */
function clearPlayerState(player) {
    try { player.getInventory().clearContent(); } catch (e) { }
    try { player.getEnderChestInventory().clearContent(); } catch (e) { }

    // Clear Curios/Accessories slots
    try {
        $CuriosApi.getCuriosInventory(player).ifPresent(function (handler) {
            handler.getCurios().forEach(function (slotId, stacksHandler) {
                var stacks = stacksHandler.getStacks();
                var cosmetics = stacksHandler.getCosmeticStacks();
                for (var i = 0; i < stacks.getSlots(); i++) {
                    stacks.setStackInSlot(i, $ItemStack.EMPTY);
                }
                for (var i = 0; i < cosmetics.getSlots(); i++) {
                    cosmetics.setStackInSlot(i, $ItemStack.EMPTY);
                }
            });
        });
    } catch (e) { }

    try { player.removeAllEffects(); } catch (e) { }

    try { player.setHealth(player.getMaxHealth()); } catch (e) { }
    try { player.setAbsorptionAmount(0); } catch (e) { }

    try {
        let foodData = player.getFoodData();
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

/**
 * Save the given player NBT data to a file in the playerdata directory.
 * @param {$ServerPlayer} player
 * @param {$CompoundTag} nbt
 */
function savePlayerNbtToFile(player, nbt) {
    $NbtIo.writeCompressed(nbt, getProfilePath(player));
}

/**
 * Read the player NBT data from a file in the playerdata directory. Returns a CompoundTag or null if no file exists.
 * @param {$ServerPlayer} player
 * @returns {$CompoundTag|null}
 */
function readPlayerNbtFromFile(player) {
    var path = getProfilePath(player);
    return $NbtIo.readCompressed(path, $NbtAccounter.unlimitedHeap());
}

/**
 * Sync the player's state with the client.
 * @param {$ServerPlayer} player
 */
function syncPlayerState(/** @type {$ServerPlayer} */ player) {
    player.inventoryMenu.broadcastFullState();
    player.containerMenu.broadcastFullState();
}

/**
 * Swap the player's full NBT state (inventory, etc.) when crossing pool boundaries.
 * Saves the current state to file, loads the saved state for the target pool if it exists.
 * @param {$ServerPlayer} player
 * @returns {boolean} True if the operation succeeded, false if an error occurred
 */
function tryToChangePool(player) {
    try {
        let savedProfile = null;
        try {
            savedProfile = readPlayerNbtFromFile(player);
        } catch (e) { }

        let snapshot = snapshotPlayerState(player);
        savePlayerNbtToFile(player, snapshot);

        // If saved profile exists, load it.
        // Otherwise, clear the player's state to avoid carrying over inventory, etc. between pools.
        if (savedProfile) {
            loadPlayerState(player, savedProfile);
        } else {
            clearPlayerState(player);
        }

        player.server.scheduleInTicks(1, function () {
            syncPlayerState(player);
        });

        return true;
    } catch (e) {
        return false;
    }
}

NativeEvents.onEvent($EntityTravelToDimensionEvent, function (event) {
    const entity = event.getEntity();

    const fromDimension = getDimensionId(entity.level.dimension);
    const toDimension = getDimensionId(event.getDimension());
    const isChangingPool = getIsChangingPool(fromDimension, toDimension);
    const isPlayer = getIsPlayer(entity);

    if (!isPlayer) {
        // If the non-player entity is crossing a pool boundary, cancel the event and discard the entity
        if (isChangingPool) {
            event.setCanceled(true);
            entity.discard();
        }

        // Otherwise, ignore the event and allow the entity to travel as normal
        return;
    }

    /** @type { $ServerPlayer } */
    const player = entity;

    if (getIsCarryingWithCarryOn(player)) {
        event.setCanceled(true);
        informPlayer(player, Text.literal("You cannot change dimensions while carrying an entity").red());
        return;
    }

    // Save current location and dimension to persistentData so it can be restored if needed
    saveCurrentLocationState(player);

    // Attempt to swap profile only when crossing pool boundaries
    if (isChangingPool) {
        if (!tryToChangePool(player)) {
            event.setCanceled(true);
            informPlayer(player, Text.literal("An error occurred while changing dimensions").red())
            return;
        }
    }

    saveCurrentPool(player);
    restorePlayerGamemode(player, toDimension);
});

NativeEvents.onEvent($PlayerEvent$Clone, function (event) {
    if (!event.wasDeath) return;

    const oldPlayer = event.getOriginal();
    const newPlayer = event.getEntity();

    const fromDimension = getDimensionId(oldPlayer.level.dimension);
    const toDimension = getDimensionId(newPlayer.level.dimension);
    const isChangingPool = getIsChangingPool(fromDimension, toDimension);

    if (!isChangingPool) return;

    tryToChangePool(newPlayer);
    saveCurrentPool(newPlayer);

    // Ritarda il restore della gamemode: vanilla sovrascrive la gamemode
    // DOPO il Clone event durante la fase di inizializzazione del respawn
    newPlayer.server.scheduleInTicks(1, function () {
        restorePlayerGamemode(newPlayer, toDimension);
    });
});
