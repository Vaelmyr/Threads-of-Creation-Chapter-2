const cmdEnterCreative = (player, dimKey) => {
    const config = CREATIVE_DIMS[dimKey];
    if (!config) {
        player.displayClientMessage('\u00a7cUnknown creative dimension: ' + dimKey, true);
        return 0;
    }

    const currentDim = dimToString(player.level.dimension);

    if (currentDim === config.dimension) {
        player.displayClientMessage('\u00a7cYou are already in that creative dimension!', true);
        return 0;
    }

    player.server.runCommandSilent('execute in ' + config.dimension + ' run tp ' + getPlayerName(player) + ' ~ ~ ~');
    return 1;
}

const cmdExitCreative = (player) => {
    const currentDim = dimToString(player.level.dimension);
    if (!isCreativeDim(currentDim)) {
        player.displayClientMessage('\u00a7cYou are not in a creative dimension!', true);
        return 0;
    }

    const posKey = DATA_PREFIX + 'survival_pos';
    const dim = player.persistentData.contains(posKey)
        ? player.persistentData.getCompound(posKey).getString('dim')
        : 'minecraft:overworld';

    player.server.runCommandSilent('execute in ' + dim + ' run tp ' + getPlayerName(player) + ' ~ ~ ~');
    return 1;
}

const cmdResetCreative = (player) => {
    const currentDim = dimToString(player.level.dimension);
    if (isCreativeDim(currentDim)) {
        player.displayClientMessage('\u00a7cYou must exit the creative dimension first!', true);
        return 0;
    }

    const creativeKeys = [
        DATA_PREFIX + 'creative_profile',
        DATA_PREFIX + 'creative_curios',
        DATA_PREFIX + 'creative_neoforge',
    ].concat(Object.keys(CREATIVE_DIMS).map(k => DATA_PREFIX + 'creative_pos_' + k));

    let removed = 0;
    creativeKeys.forEach((key) => {
        if (player.persistentData.contains(key)) {
            player.persistentData.remove(key);
            removed++;
        }
    });

    if (removed > 0) {
        player.displayClientMessage('\u00a7aCreative dimension data reset! (' + removed + ' entries cleared)', true);
        console.info('[CreativeDimension] Reset creative data for ' + getPlayerName(player) + ' (' + removed + ' entries)');
    } else {
        player.displayClientMessage('\u00a7eNo creative dimension data found to reset.', true);
    }

    return 1;
}

ServerEvents.commandRegistry((event) => {
    let Commands = event.commands;

    // Build the 'enter' subcommand with a literal for each creative dimension
    let enterNode = Commands.literal('enter');
    Object.keys(CREATIVE_DIMS).forEach((key) => {
        enterNode = enterNode.then(
            Commands.literal(key).executes((ctx) => {
                return cmdEnterCreative(ctx.source.player, key);
            })
        );
    });

    event.register(
        Commands.literal('creative')
            .then(enterNode)
            .then(Commands.literal('exit').executes((ctx) => cmdExitCreative(ctx.source.player)))
            .then(
                Commands.literal('debug')
                    .then(Commands.literal('reset').executes((ctx) => cmdResetCreative(ctx.source.player)))
            )
    );
});
