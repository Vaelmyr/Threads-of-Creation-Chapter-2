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

ServerEvents.recipes((event) => {
    ['common', 'uncommon', 'rare', 'epic', 'legendary'].forEach((rarity) => {
        event.custom({
            type: 'irons_spellbooks:alchemist_cauldron_brew',
            base_fluid: {
                id: `irons_spellbooks:${rarity}_ink`,
                amount: 1000
            },
            input: {
                item: 'irons_spellbooks:upgrade_orb'
            },
            results: [],
            byproduct: {
                id: `irons_restrictions:${rarity}_upgrade`
            }
        })
            .id(`irons_restrictions:alchemist_cauldron/soak_${rarity}_upgrade`);

        event.custom({
            type: 'irons_spellbooks:alchemist_cauldron_fill',
            input: {
                item: `irons_restrictions:${rarity}_upgrade`
            },
            result: {
                id: 'irons_spellbooks:upgrade_orb',
                count: 1
            },
            fluid: {
                id: `irons_spellbooks:${rarity}_ink`,
                amount: 1000
            },
            mustFitAll: true
        })
            .id(`irons_restrictions:alchemist_cauldron/fill_${rarity}_upgrade`);
    });

    event.shapeless(
        Item.of('irons_restrictions:fragment', 2),
        ['irons_spellbooks:scroll']
    )
        .id('irons_restrictions:fragment');


    event.shapeless(
        'irons_restrictions:unfinished_manuscript',
        [
            'irons_restrictions:fragment',
            'irons_spellbooks:magic_cloth',
            'irons_spellbooks:magic_cloth',
            'irons_spellbooks:magic_cloth',
            'irons_spellbooks:magic_cloth'
        ]
    )
        .id('ironsrestrictions:unfinished_manuscript');
});
