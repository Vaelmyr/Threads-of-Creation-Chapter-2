const $EntityTravelToDimensionEvent = Java.loadClass('net.neoforged.neoforge.event.entity.EntityTravelToDimensionEvent');

NativeEvents.onEvent($EntityTravelToDimensionEvent, function (event) {
    const entity = event.getEntity();
    const targetDim = dimToString(event.getDimension());
    const currentDim = dimToString(entity.level.dimension);

    const currentIsCreative = isCreativeDim(currentDim);
    const targetIsCreative = isCreativeDim(targetDim);

    if (!currentIsCreative && !targetIsCreative) {
        return;
    }

    // Check for player entity
    let isPlayer = false;
    try {
        isPlayer = !!entity.player;
    } catch (e) { }

    if (!isPlayer) {
        try {
            isPlayer = (String(entity.getType())).indexOf('player') !== -1;
        } catch (e) { }
    }

    // Non-player entity: block and remove
    if (!isPlayer) {
        event.setCanceled(true);
        entity.discard();
        console.info(`[CreativeDimension.$EntityTravelToDimensionEvent] Non-player entity blocked: ${entity}`);
        return;
    }

    // Player entity: Check for CarryOn
    if (isCarryingWithCarryOn(entity)) {
        event.setCanceled(true);
        entity.tell('\u00a7cYou cannot change dimension while carrying something! Please put it down first.');
        console.info(`[CreativeDimension.$EntityTravelToDimensionEvent] Player ${getPlayerName(entity)} can't change dimension because is carrying something`);
        return;
    }

    // Player entity: handle transitions
    if (!currentIsCreative && targetIsCreative) {
        // Survival → Creative
        onCreativeDimTransition(entity, true, targetDim);
    } else if (currentIsCreative && !targetIsCreative) {
        // Creative → Survival
        onCreativeDimTransition(entity, false, targetDim);
    } else {
        // Creative → Creative (switching between creative dims)
        onCreativeDimSwitch(entity, targetDim);
    }
});

// Handle respawn: if the player died while in the creative dimension, restore survival state
PlayerEvents.respawned(event => {
    const player = event.player;

    if (!player.persistentData.contains(DATA_PREFIX + 'in_creative')) return;

    console.info(`[CreativeDimension.respawned] Player ${getPlayerName(player)} died in creative dimension`);
    onCreativeDimTransition(player, false, 'minecraft:overworld');
});
