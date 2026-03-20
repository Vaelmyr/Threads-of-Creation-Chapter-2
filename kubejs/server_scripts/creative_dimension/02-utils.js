/**
 * Return the dimension ID from a string, ResourceLocation, or DimensionType.
 * @param {string|$ResourceLocation|$DimensionType} dimension
 * @return {string} Dimension ID, e.g. `creative_dimension:superflat`
 */
function getDimensionId(dimension) {
    if (typeof dimension === 'string') return dimension;
    try { return dimension.location().toString(); } catch (e) { }
    return dimension.toString();
}

/**
 * Determine the pool to which a dimension belongs.
 * @param {string} dimensionId
 * @returns {'creative'|'survival'} Pool name, either 'creative' or 'survival'
 */
function getPoolFromDimensionId(dimensionId) {
    return CREATIVE_DIMENSIONS_POOL.includes(dimensionId) ? 'creative' : 'survival';
}

/**
 * Determine if a player is changing pools when traveling between dimensions.
 * @param {string} fromDimension
 * @param {string} toDimension
 * @returns {boolean} True if the player is changing pools, false otherwise
 */
function getIsChangingPool(fromDimension, toDimension) {
    return getPoolFromDimensionId(fromDimension) !== getPoolFromDimensionId(toDimension);
}

/**
 * Check if an entity is a player.
 * @param {$Entity} entity
 * @returns {boolean} True if the entity is a player, false otherwise
 */
function getIsPlayer(entity
) {
    var isPlayer = false;
    try { isPlayer = !!entity.player; } catch (e) { }

    if (!isPlayer) {
        try { isPlayer = entity.getType() === $EntityType.PLAYER; } catch (e) { }
    }

    return isPlayer;
}

/**
 * Get the name of a player.
 * @param {$Player} player
 * @returns {string} The player's name
 */
function getPlayerName(player) {
    return player.username || (player.getName && player.getName().toString()) || player.toString();
}

/**
 * Show a message to the player in the action bar.
 * @param {$ServerPlayer} player
 * @param {string} message
 * @returns
 */
function informPlayer(player, message) {
    if (!player instanceof $ServerPlayer) return;
    player.displayClientMessage(message, true);
}

/**
 * Get the path to a player's profile file.
 * @param {$Player} player
 * @returns {string} The path to the player's profile file
 */
function getProfilePath(player) {
    var playerDataPath = player.server.getWorldPath($LevelResource.PLAYER_DATA_DIR).toAbsolutePath();
    var fileName = `${player.uuid.toString()}_creativedimension.nbt`;
    var profilePath = `${playerDataPath.toString()}/${fileName}`;

    return profilePath;
}
/**
 * Check if the player is currently carrying something with CarryOn.
 * @param {$Player} player
 * @returns {boolean} True if the player is carrying something, false otherwise
 */
function getIsCarryingWithCarryOn(player) {
    try {
        let carryData = $DataManager.getCarryData(player);

        return (
            carryData.isCarrying($CarryType.BLOCK) ||
            carryData.isCarrying($CarryType.ENTITY) ||
            carryData.isCarrying($CarryType.PLAYER)
        );
    } catch (e) { }

    return true;
}
