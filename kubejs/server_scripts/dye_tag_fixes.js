ServerEvents.tags('item', (event) => {
    const colors = [
        'white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 
        'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 
        'brown', 'green', 'red', 'black'
    ];

    colors.forEach(color => {
        event.add(`c:${color}_dyes`, `minecraft:${color}_dye`);
    });
});