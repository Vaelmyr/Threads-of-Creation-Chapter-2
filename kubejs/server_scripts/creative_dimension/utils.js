const $UUID = Java.loadClass('java.util.UUID');

/** Returns the string representation of a dimension */
const dimToString = (dim) => {
    if (!dim) return '';
    if (typeof dim === 'string') return dim;
    try { return String(dim.location()); } catch (e) { }
    return String(dim);
}

/** Get all keys from a CompoundTag as a JS array */
const getKeys = (nbt) => {
    const keys = [];
    const iter = nbt.getAllKeys().iterator();

    while (iter.hasNext()) {
        keys.push(iter.next());
    }

    return keys;
}

/** Schedule an action for the next tick, looking up the player by UUID. */
const scheduleNextTick = (player, callback) => {
    player.server.scheduleInTicks(1, () => {
        const serverPlayer = player.server.getPlayerList().getPlayer($UUID.fromString(String(player.uuid)));

        if (serverPlayer && typeof callback === 'function') {
            callback(serverPlayer);
        }
    });
}

const getPlayerName = (player) => player.username || String(player.getName());
