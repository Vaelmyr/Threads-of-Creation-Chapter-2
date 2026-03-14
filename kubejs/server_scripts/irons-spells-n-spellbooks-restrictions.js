LootJS.modifiers((event) => {
    event
        .addTableModifier(LootType.CHEST)
        .addLoot(
            LootEntry.of('irons_restrictions:fragment')
                .setCount(4)
                .randomChance(0.6)
        )
        .addLoot(
            LootEntry.of('irons_restrictions:unfinished_manuscript')
                .setCount(1)
                .randomChance(0.3)
        );
});
