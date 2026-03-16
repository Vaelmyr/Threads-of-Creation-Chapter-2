const cmdEnterCreative = (player) => {
    const currentDim = dimToString(player.level.dimension);
    if (currentDim === CREATIVE_DIM) {
        player.tell('\u00a7cYou are already in the creative dimension!');
        return 0;
    }

    player.server.runCommandSilent('execute in ' + CREATIVE_DIM + ' run tp ' + getPlayerName(player) + ' ~ ~ ~');
    return 1;
}

const cmdExitCreative = (player) => {
    const currentDim = dimToString(player.level.dimension);
    if (currentDim !== CREATIVE_DIM) {
        player.tell('\u00a7cYou are not in the creative dimension!');
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
    if (currentDim === CREATIVE_DIM) {
        player.tell('\u00a7cYou must exit the creative dimension first!');
        return 0;
    }

    const creativeKeys = [
        DATA_PREFIX + 'creative_profile',
        DATA_PREFIX + 'creative_curios',
        DATA_PREFIX + 'creative_pos',
    ];

    let removed = 0;
    creativeKeys.forEach(function (key) {
        if (player.persistentData.contains(key)) {
            player.persistentData.remove(key);
            removed++;
        }
    });

    if (removed > 0) {
        player.tell('\u00a7aCreative dimension data reset! (' + removed + ' entries cleared)');
        console.info('[CreativeDimension] Reset creative data for ' + getPlayerName(player) + ' (' + removed + ' entries)');
    } else {
        player.tell('\u00a7eNo creative dimension data found to reset.');
    }

    return 1;
}

ServerEvents.commandRegistry(function (event) {
    let Commands = event.commands;

    event.register(
        Commands.literal('creative')
            .then(Commands.literal('enter').executes((ctx) => cmdEnterCreative(ctx.source.player)))
            .then(Commands.literal('exit').executes((ctx) => cmdExitCreative(ctx.source.player)))
            .then(
                Commands.literal('debug')
                    .then(Commands.literal('reset').executes((ctx) => cmdResetCreative(ctx.source.player)))
            )
    );
});
