const $FakePlayer = Java.loadClass('net.neoforged.neoforge.common.util.FakePlayer');

const BLACKLISTED_ITEMS = new Set([
    'minecraft:command_block',
]);

const BLACKLISTED_PATTERNS = new Set([
    // '@irons_restrictions',
    // '@modid'            — blocks all items from a mod
    // '#minecraft:swords' — blocks all items with a specific tag
]);

// ─── Check Function ───

/**
 * Check if an ItemStack is blacklisted.
 * First checks the exact item ID in the Set (O(1)),
 * then falls back to pattern matching if needed.
 */
const isItemBlacklisted = (stack) => {
    if (stack.isEmpty()) return false;

    const itemId = stack.id;

    // Exact match
    if (BLACKLISTED_ITEMS.has(itemId)) return true;

    // Pattern match
    for (const pattern of BLACKLISTED_PATTERNS.values()) {
        if (pattern.startsWith('#')) {
            // Tag pattern: '#minecraft:swords' → check item tag
            const tag = pattern.substring(1);
            if (stack.hasTag(tag)) return true;
        } else if (pattern.startsWith('@')) {
            // Mod pattern: '@modid' → check item ID prefix
            const modId = pattern.substring(1) + ':';
            if (itemId.startsWith(modId)) return true;
        }
    }

    return false;
}

// ─── Shared Handler Logic ───

/**
 * Check if either hand holds a blacklisted item.
 * If so, cancel the event and notify real players via actionbar.
 * Returns true if the event was cancelled.
 */
const checkAndCancelBlacklisted = (event) => {
    const player = event.getEntity()
    const dim = dimToString(player.level.dimension)
    if (!isCreativeDim(dim)) return false;

    const mainHand = player.getMainHandItem();
    const offHand = player.getOffhandItem();

    const blockedStack = isItemBlacklisted(mainHand) ? mainHand
        : isItemBlacklisted(offHand) ? offHand
            : null;

    if (!blockedStack) return false;

    event.setCanceled(true);

    if (!(player instanceof $FakePlayer)) {
        player.displayClientMessage(
            Component.literal('\u00a7cThis item cannot be used in creative dimensions.'),
            true
        );
    }

    return true;
}

const blacklistUseItemEvent = (event) => {
    const entity = event.getEntity();
    if (!entity.player) return false;

    const dim = dimToString(entity.level.dimension);
    if (!isCreativeDim(dim)) return false;

    const stack = event.getItem();

    // Only block food/drinks, not bows/shields/etc.
    if (stack.item.getFoodProperties(stack, entity) != null) {
        event.setCanceled(true);

        if (!(entity instanceof $FakePlayer)) {
            entity.displayClientMessage(
                Component.literal('\u00a7cEating and drinking is disabled in creative dimensions.'),
                true
            );
        }
    }

    return true;
}

// ─── Event Registrations ───
[
    'net.neoforged.neoforge.event.entity.player.PlayerInteractEvent$RightClickItem',
    'net.neoforged.neoforge.event.entity.player.PlayerInteractEvent$RightClickBlock',
    'net.neoforged.neoforge.event.entity.player.PlayerInteractEvent$LeftClickBlock',
    'net.neoforged.neoforge.event.entity.player.AttackEntityEvent',
    'net.neoforged.neoforge.event.entity.player.PlayerInteractEvent$EntityInteract',
].forEach((eventType) => {
    NativeEvents.onEvent(eventType, checkAndCancelBlacklisted)
});
