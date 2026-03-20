/**
 * Teleport the player to the saved position for the given target dimension.
 * If no saved state exists, uses the spawn point of the target dimension.
 * @param {$ServerPlayer} player
 * @param {string} targetDimensionId    Target dimension ID to teleport to, e.g. `creative_dimension:superflat`
 */
function teleportPlayerToDimension(player, targetDimensionId) {
    const playerName = getPlayerName(player);
    const dimensionPool = getPoolFromDimensionId(targetDimensionId);
    const stateKey = dimensionPool === 'survival' ? 'survival' : targetDimensionId;

    let dimension = targetDimensionId;
    let pos = "~ ~ ~"
    let rot = "0 0"

    // Try to read the saved position and dimension for the target dimension from `persistentData`
    const states = player.persistentData.getCompound("creative_dimension:pool_states");
    if (states.contains(stateKey)) {
        const state = states.getCompound(stateKey);

        const posNbt = state.getList('pos', 6);
        if (posNbt && posNbt.size() === 3) {
            pos = `${posNbt.getDouble(0)} ${posNbt.getDouble(1)} ${posNbt.getDouble(2)}`;
        }

        const rotNbt = state.getList('rotation', 5);
        if (rotNbt && rotNbt.size() === 2) {
            rot = `${rotNbt.getFloat(0)} ${rotNbt.getFloat(1)}`;
        }

        // If teleporting back to the survival pool and a dimension was saved
        // teleport to that dimension instead of the default one for the pool
        if (dimensionPool === 'survival' && state.contains('dimension')) {
            dimension = state.getString('dimension');
        }
    }

    const cmd = `execute in ${dimension} run tp ${playerName} ${pos} ${rot}`;
    player.server.runCommandSilent(cmd);
}

/**
 * Enter a creative dimension (or switch between creative dimensions).
 * @param {$ServerPlayer} player
 * @param {string} dimensionKey     Dimension key, e.g. `superflat`
 */
function cmdCreativeEnter(player, dimensionKey) {
    const targetDimensionId = CREATIVE_DIMENSIONS_POOL.find(dimId => dimId.endsWith(dimensionKey));
    if (!targetDimensionId) {
        informPlayer(player, Text.literal(`Unknown creative dimension: ${dimensionKey}`).red());
        return 0;
    }

    const currentDimensionId = getDimensionId(player.level.dimension);
    if (currentDimensionId === targetDimensionId) {
        informPlayer(player, Text.literal('You are already in this dimension').yellow());
        return 0;
    }

    teleportPlayerToDimension(player, targetDimensionId);
    return 1;
}

/**
 * Exit the creative dimension returning to the survival dimension you came from.
 * @param {$ServerPlayer} player
 */
function cmdCreativeExit(player) {
    const currentDimensionId = getDimensionId(player.level.dimension);
    const currentPool = getPoolFromDimensionId(currentDimensionId);

    if (currentPool !== 'creative') {
        informPlayer(player, Text.literal('You are not in a creative dimension').red());
        return 0;
    }

    // 1.   Get the survival dimension and position to return to from saved state
    // 1a.  If the saved state doesn't exists, default to overworld and spawn point
    // 2. Teleport the player to the saved position in the survival dimension
    teleportPlayerToDimension(player, 'minecraft:overworld');
    return 1;
}

/**
 * Show debug information about the creative dimension.
 * @param {$ServerPlayer} player    Target player
 */
function cmdCreativeDebugInfo(player) {
    player.tell(Text.literal('--- Creative Dimension Debug Info ---').blue());
    player.tell(Text.literal(`Current dimension: ${getDimensionId(player.level.dimension)}`).gray());
    player.tell(Text.literal(`Current dimension pool: ${getPoolFromDimensionId(getDimensionId(player.level.dimension))}`).gray());
    player.tell(Text.literal(`Profile path: ${getProfilePath(player).toString()}`).gray());
    player.tell(Text.literal(`Saved states: ${player.persistentData.getCompound("creative_dimension:pool_states").toString()}`).gray());
    // Add the saved states to debug info
    player.tell(Text.literal('---------------------------------').blue());

    return 0;
}

ServerEvents.commandRegistry(function (event) {
    var Commands = event.commands;

    var enterCmd = Commands.literal('enter');
    CREATIVE_DIMENSIONS_POOL.forEach(function (dimensionId) {
        const shortName = dimensionId.split('creative_dimension:').pop();
        enterCmd = enterCmd.then(
            Commands.literal(shortName).executes(function (ctx) {
                return cmdCreativeEnter(ctx.source.player, shortName);
            })
        );
    });

    var exitCmd = Commands.literal('exit').executes(function (ctx) {
        return cmdCreativeExit(ctx.source.player)
    });

    var debugCmd = Commands.literal('debug')
        .then(Commands.literal('info').executes(function (ctx) {
            return cmdCreativeDebugInfo(ctx.source.player);
        }));

    event.register(
        Commands.literal('creative')
            .then(enterCmd)
            .then(exitCmd)
            .then(debugCmd)
    );
});
