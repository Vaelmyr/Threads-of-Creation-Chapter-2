ServerEvents.tags('item', (event) => {
    function replaceTagsForItems(items, toRemove, toAdd) {
        items.forEach((item) => {
            toRemove.forEach((tag) => {
                event.remove(tag, item);
            })

            toAdd.forEach((tag) => {
                event.add(tag, item);
            });
        });
    }

    replaceTagsForItems([
        'create:goggles',
        'occultism:otherworld_goggles',
        'artifacts:snorkel',
        'artifacts:night_vision_goggles',
    ], [
        'accessories:hat',
        'artifacts:slot/face',
        'trinkets:head/hat',
        'curios:head'
    ], ['accessories:face']);

    replaceTagsForItems([
        'roots:wildwood_quiver',
        'relics:midnight_robe',
        'reliquified_lenders_cataclysm:void_cloak',
    ].concat(event.get('createornithopterglider:gliders').getObjectIds()),
        ['accessories:back', 'curios:back'],
        ['accessories:cape']
    );

    replaceTagsForItems(
        ['cataclysm:ring_of_grudged'],
        ['accessories:rings', 'curios:rings'],
        ['accessories:ring']
    );

    replaceTagsForItems(
        ['cataclysm:unbreakable_skull'],
        ['accessories:talisman', 'curios:talisman'],
        ['accessories:charm']
    );
});
