const CREATIVE_DIMS = {
    superflat: {
        dimension: 'creative_dimension:superflat',
        spawn: { x: 0, y: -9, z: 0 },
    },
    overworld: {
        dimension: 'creative_dimension:overworld',
        spawn: null, // uses the dimension's world spawn
    },
};

/** Check if a dimension string is any creative dimension */
const isCreativeDim = (dim) => Object.values(CREATIVE_DIMS).some(d => d.dimension === dim);

/** Get the short key (e.g. 'superflat') for a creative dimension string, or null */
const getCreativeDimKey = (dim) => Object.keys(CREATIVE_DIMS).find(k => CREATIVE_DIMS[k].dimension === dim) || null;

const DATA_PREFIX = 'creativedimension_';
const CDM_KEYS = [
    DATA_PREFIX + 'survival_profile',
    DATA_PREFIX + 'creative_profile',
    DATA_PREFIX + 'survival_curios',
    DATA_PREFIX + 'creative_curios',
    DATA_PREFIX + 'survival_pos',
    DATA_PREFIX + 'in_creative',
].concat(Object.keys(CREATIVE_DIMS).map(k => DATA_PREFIX + 'creative_pos_' + k));

// Keys to NOT include in saved profiles
const EXCLUDE_KEYS = [
    'Pos', 'Motion', 'Rotation', 'FallDistance', 'Fire', 'Air', 'OnGround',
    'UUID', 'UUIDMost', 'UUIDLeast', 'id',
    'Dimension', 'enteredNetherPosition',
    'SpawnX', 'SpawnY', 'SpawnZ', 'SpawnDimension', 'SpawnAngle', 'SpawnForced',
    'playerGameType', 'previousPlayerGameType',
    'RootVehicle', 'Passengers', 'SleepTimer', 'Invulnerable',
    'seenCredits', 'LastDeathLocation', 'CurrentDeathLocation',
    'warden_spawn_tracker', 'WardenSpawnTracker',
];
