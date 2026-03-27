# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.3.0 - 27-03-2026

### Known Bugs

- ParCool Crawl doesn't work properly due an incompatibility issue with the latest Reliquified Artifacts version

### Added

- Added `c:<color>_dyes` tag to `minecraft:<color>_dye` to fix some crafting recipes
- Apothic Amendments - Enchanting
- Bosses'Rise
- Colorwheel
- Colorwheel Patcher
- CraftPresence
- IceAndFire Community Edition
- Ice and Fire: Spellbooks
- Ice and Fire Dragons X Better Combat
- Loot Integrations: Ice and Fire
- Integrated Stronghold
- Integrated Villages
- Integrated Cataclysm
- Shoulder Surfing Reloaded
- Shoulder Surfing: Iron's Spells Integration
- Shoulder Surfing: Ultimine

### Changed

- Blacklisted from CarryOn `iss_magicfromtheeast:*`
- Apprentice's Codex: 0.7.1.2 -> 0.7.2.3
- AzureLib: 3.1.3 -> 3.1.4
- CBC Enchanced Shells [Create Big Cannons]: 1.0.1 -> 1.0.3
- CoroUtil: 1.3.8 -> 1.3.9
- Create: Let The Adventure Begin: 3.8.2 -> 3.8.4
- Create : Misc & Thins: 4.0 -> 4.1
- Create: Wizardry: 0.4.1 -> 0.4.2
- CreativeCore: 2.13.35 -> 2.13.36
- Entity Culling Fabric/Forge: 1.9.5 -> 1.10
- Fire's Ender Expansion: 2.3.4 -> 2.3.5
- Gensokyo Delight ~ Youkais' Feasts: 1.0.4 -> 1.0.5
- Irons Spells 'n Spellbooks Restrictions: 5.0.9 -> 5.1.1
- JourneyMap: 6.0.0-beta56 -> 6.0.0-beta58
- L_Ender 's Cataclysm: 3.24 -> 3.25
- Lava Fishing: 1.2.12 -> 1.2.13
- Mech Trowel: 1.2.13 -> 1.3.0
- Moonlight Lib: 2.29.20 -> 2.29.23
- Not Enough Animations: 1.11.3 -> 1.12.0
- Petrol's Parts for Create: 1.2.7 -> 1.2.8
- Petrolpark Library: 1.4.28 -> 1.4.30
- Relics: 0.11.8 -> 0.11.9
- Serene Shrubbery: 2.3.0 -> 2.3.1
- Simple Backups: 4.0.28 -> 4.0.29
- Sophisticated Backpacks: 3.25.34.1581 -> 3.25.34.1604
- Sophisticated Core: 1.4.11.1531 -> 1.4.11.1559
- Sophisticated Item Actions: 0.3.5.92 -> 0.3.5.113
- Sophisticated Storage: 1.5.30.1520 -> 1.5.30.1535
- Sophisticated Storage in Motion: 0.10.26.181 -> 0.10.26.197
- Tesseract API (NeoForge): 1.11.9 -> 1.11.10
- Theurgy: 1.68.0 -> 1.70.0
- Too Many Bows: 3.1.1 -> 3.3.0

### Removed

- Removed KubeJS scripts for "Irons Spells 'n Spellbooks Restrictions" fix
- YUNG's Better Strongholds (NeoForge)

## 0.2.2 - 21-03-2026

### Known Bugs

- ParCool Crawl doesn't work properly due an incompatibility issue with the latest Reliquified Artifacts version

### Added

- Etched

## 0.2.1 - 21-03-2026

Added Better Combat compatibility through weapon attribute datapacks, added Etched and Reliquified Iron's Spells 'n Spellbooks. Updated some dependencies and removed Distant Horizons.

### Known Bugs

- ParCool Crawl doesn't work properly due an incompatibility issue with the latest Reliquified Artifacts version

### Added

- Implemented weapon attributes for Better Combat compatibility
- Reliquified Iron's Spells 'n Spellbooks

### Changed

- Ace's Spell Utils: 1.2.4 -> 1.2.5
- Sophisticated Core: 1.4.9.1526 -> 1.4.10.1531
- Blacklisted Backpacks from CarryOn

### Removed
- Distant Horizons: A Level of Detail mod

## 0.2.0 - 20-03-2026

Expanded the Create ecosystem with numerous addons (Bits 'n' Bobs, Transmission, Parallel Pipes, and more). Added quality-of-life and utility mods including WorldEdit, Camera Mod, and Immersive Melodies. Fixed and refactored the Creative Dimension KubeJS scripts. Removed problematic mods (Create: New Age, Create: Ore Excavation) and replaced Legendary Tooltips with Obscure Tooltips. Downgraded CarryOn to fix a multiplayer crash on entity pickup.

### Added

- Better Fps - Render Distance[Forge]
- Camera Mod
- Immersive Melodies [Fabric/Forge]
- In Control!
- Scholar
- Starcatcher
- WorldEdit
- Obscure Tooltips
- Rechiseled: Create
- Create: Bits 'n' Bobs
- Create: Transmission!
- Create More: Parallel Pipes
- Create: FluidLogistic
- Create: Colorful Catalysts
- Create: Let The Adventure Begin
- Create: Addon Compatibility
- Create: Fluid
- Create More: Vertical Belts
- Forge CIT
- Lava Fishing
- Mech Trowel
- Measurements
- Farmer's Delight
- CBC Enchanced Shells [Create Big Cannons]

### Changed

- Refactored Creative Dimension KubeJS scripts
- Ace's Spell Utils: 1.2.3 -> 1.2.4
- CarryOn: 2.2.4.4 -> 2.2.2.11
    - Downgraded due to known bugs causing the players in the same dimension to crash randomly on pickup of entity with inventories
- Oritech: 1.0.1 -> 1.1.0
- SeasonHud: 2.0.1 -> 2.0.2
- SuperMartijn642's Core Lib: 1.1.20 -> 1.1.21

### Removed

- Legendary Tooltips [Neo/Forge]
- Connectivity
- Create: New Age
- Create: Ore Excavation

## 0.1.0 - 18-03-2026

Modpack cleanup and optimization: removed unused magic mods (Ars Nouveau, Occultism, Roots 4), orphaned libraries and utilities, and duplicate mods. Updated several mods to newer versions. Added performance mods (Entity Culling, MoreCulling, Chunk Sending), debug tools (spark, Observable), and quality of life improvements (Freecam, Just Zoom, Trash Cans, SeasonHud).

### Added

- Freecam
- spark
- Observable
- SeasonHud
- Just Zoom
- Trash Cans
- Simple Backups
- AllTheLeaks (Memory Leak Fix)
- Concurrent Chunk Management Engine
- Entity Culling Fabric/Forge
- MoreCulling
- Packet Fixer
- Connectivity
- Server Performance - Smooth Chunk Save[Forge/Fabric]
- Configured
- Leaky - Item Lag Fix[Forge/Fabric]
- Chunk Sending[Forge/Fabric]
- Respawning Structures[Forge/Fabric]
- Distant Horizons: A Level of Detail mod
    - Disabled by default due to missing `enabled` flag in config. Have to be enabled manually if needed.

### Changed

    - Neoforge: 21.1.219 -> 21.1.220
    - Accessorify: 2.3.6 -> 2.4.0-beta.5
- Aquaculture: 2.7.18 -> 2.7.19
- Create: Food: 2.1.0 -> 2.2.0a
- Create: Mobile Packages: 0.6.1 -> 0.7.0
- Create: Structures Arise: 173.46.45 -> 174.47.46
- FTB Quests (NeoForge): 2101.1.22 -> 2101.1.23
- JourneyMap: 6.0.0-beta.55 -> 6.0.0-beta.56
- Just Enough Items (JEI) -> 19.27.0.336 -> 19.27.0.340
- Little Big Redstone: 1.5.1-beta -> 1.5.2-beta
- Lootr (Forge & NeoForge): 1.11.36.116 -> 1.11.36.118
- Moderately Enough Effect Descriptions (MEED): 7.8.1 -> 7.9
- Modonomicon: 1.117.4 -> 1.120.1
- Mowzie's Mobs: 1.8.1 -> 1.8.2
    - ParCool! ~ Minecraft Parkour ~: 3.4.3.1NF -> 3.4.3.3-NF
- Petrol's Parts for Create: 1.2.5 -> 1.2.7
- Regions Unexplored: Skipped due to crash with 0.6+beta
    - Relics: -> 0.10.7.8 -> 0.11.8
    - Reliquified Artifacts: 0.9.7 -> 1.0
- Sophisticated Backpacks: 3.25.31.1560 -> 3.25.34.1581
- Sophisticated Core: 1.4.8.1520 -> 1.4.9.1256
- Sophisticated Item Actions: 0.3.4.85 -> 0.3.5.92
    - Subtle Effects: 1.13.2-hotfix.1 -> 1.14.0
- TrashSlot: 21.1.4 -> 21.1.6

### Removed

- Roots 4
- Better Spellcasting
- Citadel
- Citadel (Unofficial Port)
- Enchanted Book Redesign
- Fast Workbench
- Display Delight
- Occultism
- Ars Nouveau
- Ars Creo
- Ars Hex Unity
- Ars Occultas
- Ars Technica
- Quark
- Zeta
- Macaw's Quark
- Reliquified L_Ender 's Cataclysm
- Alex's Caves (Unofficial Port)
- L2 Complements
- TxniLib
- Cristel Lib
- SmartBrainLib (Forge/Farbic/Quilt)
- KubeJS Create
- KubeJS Tweaks
- L2 Library
