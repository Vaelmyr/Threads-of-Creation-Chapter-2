const CREATIVE_DIM = 'creative_dimension:superflat';
const CREATIVE_DIM_SPAWN = { x: 0, y: -9, z: 0 };

const DATA_PREFIX = 'creativedimension_';
const CDM_KEYS = [
    DATA_PREFIX + 'survival_profile',
    DATA_PREFIX + 'creative_profile',
    DATA_PREFIX + 'survival_curios',
    DATA_PREFIX + 'creative_curios',
    DATA_PREFIX + 'survival_pos',
    DATA_PREFIX + 'creative_pos',
    DATA_PREFIX + 'in_creative',
];

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
