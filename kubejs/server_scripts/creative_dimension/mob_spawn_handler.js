/** @type {typeof import("net.minecraft.world.entity.MobSpawnType").$MobSpawnType } */
const $MobSpawnType = Java.loadClass("net.minecraft.world.entity.MobSpawnType")

EntityEvents.checkSpawn((event) => {
    const dim = event.entity.level.dimension.toString();
    if (!isCreativeDim(dim)) return;

    if (event.type == $MobSpawnType.NATURAL || event.type == $MobSpawnType.CHUNK_GENERATION) {
        if (event.entity.entityType.mod == "minecraft") {
            event.cancel();
        }
    }
});
