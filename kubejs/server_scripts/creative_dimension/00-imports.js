/** @type {typeof import("net.neoforged.neoforge.event.entity.EntityTravelToDimensionEvent").$EntityTravelToDimensionEvent} */
const $EntityTravelToDimensionEvent = Java.loadClass("net.neoforged.neoforge.event.entity.EntityTravelToDimensionEvent");

/** @type {typeof import("net.minecraft.server.level.ServerPlayer").$ServerPlayer} */
const $ServerPlayer = Java.loadClass("net.minecraft.server.level.ServerPlayer");

/** @type {typeof import("net.neoforged.neoforge.event.entity.player.PlayerEvent$PlayerChangedDimensionEvent").$PlayerEvent$PlayerChangedDimensionEvent} */
const $PlayerChangedDimensionEvent = Java.loadClass(
    "net.neoforged.neoforge.event.entity.player.PlayerEvent$PlayerChangedDimensionEvent"
);

/** @type {typeof import("net.minecraft.nbt.CompoundTag").$CompoundTag} */
const $CompoundTag = Java.loadClass("net.minecraft.nbt.CompoundTag");

/** @type {import("net.minecraft.world.entity.Entity").$Entity$$Type} */
const $Entity = Java.loadClass("net.minecraft.world.entity.Entity");

/** @type {typeof import("net.minecraft.world.entity.EntityType").$EntityType} */
const $EntityType = Java.loadClass("net.minecraft.world.entity.EntityType");

/**@type {typeof import("net.minecraft.world.entity.player.Player").$Player} */
const $Player = Java.loadClass("net.minecraft.world.entity.player.Player");

// https://nekoyue.github.io/ForgeJavaDocs-NG/javadoc/1.21.x-neoforge/net/minecraft/nbt/NbtIo.html
const $NbtIo = Java.loadClass("net.minecraft.nbt.NbtIo");

/** @type {typeof import("net.minecraft.nbt.NbtAccounter").$NbtAccounter} */
const $NbtAccounter = Java.loadClass('net.minecraft.nbt.NbtAccounter');

/** @type {typeof import("net.minecraft.world.level.storage.LevelResource").$LevelResource} */
const $LevelResource = Java.loadClass("net.minecraft.world.level.storage.LevelResource");

/** @type {typeof import("net.neoforged.neoforge.event.entity.player.PlayerEvent$Clone").$PlayerEvent$Clone} */
const $PlayerEvent$Clone = Java.loadClass("net.neoforged.neoforge.event.entity.player.PlayerEvent$Clone");

const $CarryType = Java.loadClass('tschipp.carryon.common.carry.CarryOnData$CarryType');
const $DataManager = Java.loadClass('tschipp.carryon.common.carry.CarryOnDataManager');

const $CuriosApi = Java.loadClass('top.theillusivec4.curios.api.CuriosApi');
const $ItemStack = Java.loadClass('net.minecraft.world.item.ItemStack');

const $FakePlayer = Java.loadClass('net.neoforged.neoforge.common.util.FakePlayer');
