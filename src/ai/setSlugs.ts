/**
 * Mapping of human-readable set names to all their Poketrace API slug variations.
 * The AI sees the set names (keys) and searchCard queries all associated slugs (values).
 */
export const SET_SLUG_MAP: Record<string, string[]> = {
  // === SCARLET & VIOLET ERA ===
  "Scarlet & Violet Base Set": ["scarlet-violet", "sv-scarlet", "sv01-scarlet", "sv01-scarlet-and-violet-base-set"],
  "Paldea Evolved": ["paldea-evolved", "sv02-paldea", "sv02-paldea-evolved"],
  "Obsidian Flames": ["obsidian-flames", "sv03-obsidian", "sv03-obsidian-flames"],
  "Paradox Rift": ["paradox-rift", "sv04-paradox", "sv04-paradox-rift"],
  "Temporal Forces": ["temporal-forces", "sv05-temporal", "sv05-temporal-forces"],
  "Twilight Masquerade": ["twilight-masquerade", "sv06-twilight", "sv06-twilight-masquerade"],
  "Stellar Crown": ["stellar-crown", "sv07-stellar-crown"],
  "Surging Sparks": ["surging-sparks", "sv08-surging", "sv08-surging-sparks"],
  "Journey Together": ["journey-together", "journey-together-additionals", "sv09-journey-together"],
  "Destined Rivals": ["destined-rivals", "destined-rivals-additionals", "sv10-destined", "sv10-destined-rivals"],
  "Paldean Fates": ["paldean-fates", "sv-paldean", "sv-paldean-fates"],
  "Prismatic Evolutions": ["prismatic-evolutions", "prismatic-evolutions-additionals", "sv-prismatic", "sv-prismatic-evolutions"],
  "Shrouded Fable": ["shrouded-fable", "sv-shrouded-fable"],
  "151": ["151", "sv-scarlet-and-violet-151"],
  "Black Bolt": ["black-bolt", "black-bolt-additionals", "sv-black", "sv-black-bolt"],
  "White Flare": ["white-flare", "white-flare-additionals", "sv-white", "sv-white-flare"],
  "Scarlet & Violet Energies": ["scarlet-violet-energies", "sve-scarlet-and-violet-energies"],
  "Scarlet & Violet Products": ["scarlet-violet-products"],
  "SV Black Star Promos": ["sv-black-star-promos", "sv-scarlet-and-violet-promo-cards"],

  // === SWORD & SHIELD ERA ===
  "Sword & Shield Base Set": ["sword-shield", "swsh-sword", "swsh01-sword", "swsh01-sword-and-shield-base-set"],
  "Rebel Clash": ["rebel-clash", "swsh02-rebel", "swsh02-rebel-clash"],
  "Darkness Ablaze": ["darkness-ablaze", "swsh03-darkness", "swsh03-darkness-ablaze"],
  "Vivid Voltage": ["vivid-voltage", "swsh04-vivid", "swsh04-vivid-voltage"],
  "Battle Styles": ["battle-styles", "swsh05-battle-styles"],
  "Chilling Reign": ["chilling-reign", "swsh06-chilling", "swsh06-chilling-reign"],
  "Evolving Skies": ["evolving-skies", "swsh07-evolving-skies"],
  "Fusion Strike": ["fusion-strike", "swsh08-fusion", "swsh08-fusion-strike"],
  "Brilliant Stars": ["brilliant-stars", "swsh09-brilliant", "swsh09-brilliant-stars", "swsh09-brilliant-stars-trainer-gallery"],
  "Astral Radiance": ["astral-radiance", "swsh10-astral", "swsh10-astral-radiance", "swsh10-astral-radiance-trainer-gallery"],
  "Lost Origin": ["lost-origin", "swsh11-lost", "swsh11-lost-origin", "swsh11-lost-origin-trainer-gallery"],
  "Silver Tempest": ["silver-tempest", "swsh12-silver", "swsh12-silver-tempest", "swsh12-silver-tempest-trainer-gallery"],
  "Champions Path": ["champions-path"],
  "Shining Fates": ["shining-fates", "shining-fates-shiny-vault"],
  "Hidden Fates": ["hidden-fates", "hidden-fates-shiny-vault"],
  "Crown Zenith": ["crown-zenith", "crown-zenith-galarian-gallery"],
  "Pokemon GO": ["pokemon-go"],
  "Celebrations": ["celebrations", "celebrations-classic-collection"],
  "SWSH Black Star Promos": ["swsh-black-star-promos", "swsh-sword-and-shield-promo-cards"],

  // === SUN & MOON ERA ===
  "Sun & Moon Base Set": ["sun-moon", "sm-base", "sm-base-set"],
  "Guardians Rising": ["guardians-rising", "sm-guardians", "sm-guardians-rising"],
  "Burning Shadows": ["burning-shadows", "sm-burning-shadows"],
  "Crimson Invasion": ["crimson-invasion", "sm-crimson-invasion"],
  "Ultra Prism": ["ultra-prism", "sm-ultra-prism"],
  "Forbidden Light": ["forbidden-light", "sm-forbidden-light"],
  "Celestial Storm": ["celestial-storm", "sm-celestial-storm"],
  "Lost Thunder": ["lost-thunder", "sm-lost", "sm-lost-thunder"],
  "Team Up": ["team-up", "sm-team", "sm-team-up"],
  "Unbroken Bonds": ["unbroken-bonds", "sm-unbroken-bonds"],
  "Unified Minds": ["unified-minds", "sm-unified", "sm-unified-minds"],
  "Cosmic Eclipse": ["cosmic-eclipse", "sm-cosmic", "sm-cosmic-eclipse"],
  "Dragon Majesty": ["dragon-majesty"],
  "Detective Pikachu": ["detective-pikachu"],
  "Shining Legends": ["shining-legends"],
  "SM Black Star Promos": ["sm-black-star-promos", "sm-promos"],
  "SM Trainer Kit Alolan Sandslash & Ninetales": ["sm-trainer", "sm-trainer-kit-alolan-sandslash-alolan-ninetales", "sm-trainer-kit-alolan-sandslash-and-alolan-ninetales"],
  "SM Trainer Kit Lycanroc & Alolan Raichu": ["sm-trainer-kit-lycanroc-alolan-raichu", "sm-trainer-kit-lycanroc-and-alolan-raichu"],

  // === XY ERA ===
  "XY Base Set": ["xy", "xy-base-set"],
  "Ancient Origins": ["ancient-origins", "xy-ancient-origins"],
  "BREAKpoint": ["breakpoint", "xy-breakpoint"],
  "BREAKthrough": ["breakthrough", "xy-breakthrough"],
  "Evolutions": ["evolutions", "xy-evolutions"],
  "Fates Collide": ["fates-collide", "xy-fates-collide"],
  "Flashfire": ["flashfire", "xy-flashfire"],
  "Furious Fists": ["furious-fists", "xy-furious-fists"],
  "Phantom Forces": ["phantom-forces", "xy-phantom-forces"],
  "Primal Clash": ["xy-primal", "xy-primal-clash"],
  "Roaring Skies": ["roaring-skies", "xy-roaring-skies"],
  "Steam Siege": ["steam-siege", "xy-steam-siege"],
  "Generations": ["generations", "generations-code", "generations-radiant-collection"],
  "Double Crisis": ["double-crisis"],
  "Kalos Starter Set": ["kalos-starter-set", "xy-kalos-starter-set"],
  "XY Black Star Promos": ["xy-black-star-promos", "xy-promos"],
  "XY Trainer Kits": ["xy-trainer-kit", "xy-trainer-kit-bisharp-and-wigglytuff", "xy-trainer-kit-bisharp-wigglytuff", "xy-trainer-kit-latias-and-latios", "xy-trainer-kit-latias-latios", "xy-trainer-kit-pikachu-libre-and-suicune", "xy-trainer-kit-pikachu-libre-suicune", "xy-trainer-kit-sylveon-and-noivern"],

  // === BLACK & WHITE ERA ===
  "Black & White": ["black-and-white", "black-white"],
  "Black & White Promos": ["black-and-white-promos", "bw-black-star-promos"],
  "Boundaries Crossed": ["boundaries-crossed"],
  "Dark Explorers": ["dark-explorers"],
  "Dragons Exalted": ["dragons-exalted"],
  "Emerging Powers": ["emerging-powers"],
  "Legendary Treasures": ["legendary-treasures", "legendary-treasures-radiant-collection", "legendary-treasures-zapdos"],
  "Next Destinies": ["next-destinies"],
  "Noble Victories": ["noble-victories", "noble-victories-zweilous"],
  "Plasma Blast": ["plasma-blast", "plasma-blast-eelektrik", "plasma-blast-machoke"],
  "Plasma Freeze": ["plasma-freeze"],
  "Plasma Storm": ["plasma-storm"],
  "Dragon Vault": ["dragon-vault"],
  "BW Trainer Kits": ["bw-trainer-kit", "bw-trainer-kit-excadrill-and-zoroark"],

  // === DIAMOND & PEARL / PLATINUM / HGSS ERA ===
  "Diamond & Pearl": ["diamond-and-pearl", "diamond-pearl"],
  "Diamond & Pearl Promos": ["diamond-and-pearl-promos", "dp-black-star-promos"],
  "Great Encounters": ["great-encounters"],
  "Majestic Dawn": ["majestic-dawn"],
  "Legends Awakened": ["legends-awakened"],
  "Stormfront": ["stormfront", "stormfront-bidoof"],
  "Mysterious Treasures": ["mysterious-treasures"],
  "Secret Wonders": ["secret-wonders"],
  "Rising Rivals": ["rising-rivals"],
  "Supreme Victors": ["supreme-victors"],
  "Arceus": ["arceus", "arceus-wormadam"],
  "Platinum": ["platinum", "platinum-cranidos", "platinum-drapion-lvx", "platinum-fall", "platinum-life-herb", "platinum-lombre", "platinum-memory-berry", "platinum-monferno", "platinum-platinum", "platinum-pluspower", "platinum-pokemon-rescue", "platinum-probopass", "platinum-spring", "platinum-torterra", "platinum-vigoroth", "platinum-vulpix-shiny"],
  "HeartGold SoulSilver": ["heartgold-soulsilver"],
  "HGSS Promos": ["hgss-black-star-promos", "hgss-promos"],
  "Unleashed": ["unleashed"],
  "Undaunted": ["undaunted"],
  "Triumphant": ["triumphant"],
  "Call of Legends": ["call-of", "call-of-legends"],
  "DP Trainer Kit": ["dp-trainer-kit-manaphy-and-lucario"],
  "HGSS Trainer Kit": ["hgss-trainer-kit-gyarados-and-raichu", "hs-trainer-kit"],

  // === EX ERA ===
  "Ruby & Sapphire": ["ruby-and", "ruby-and-sapphire", "ex-ruby-sapphire"],
  "Sandstorm": ["sandstorm", "ex-sandstorm", "sandstorm-aerodactyl-ex", "sandstorm-aggron-ex", "sandstorm-anorith", "sandstorm-armaldo", "sandstorm-cacnea", "sandstorm-cacturne", "sandstorm-dusclops", "sandstorm-fearow", "sandstorm-flareon", "sandstorm-gardevoir-ex", "sandstorm-lileep", "sandstorm-linoone", "sandstorm-ludicolo", "sandstorm-lunatone", "sandstorm-mawile", "sandstorm-nuzleaf", "sandstorm-pelipper", "sandstorm-raichu-ex", "sandstorm-sableye", "sandstorm-shiftry", "sandstorm-solrock", "sandstorm-typhlosion-ex", "sandstorm-vigoroth", "sandstorm-wailord-ex", "sandstorm-wingull", "sandstorm-wynaut", "sandstorm-zangoose"],
  "Dragon (EX)": ["dragon", "ex-dragon"],
  "Team Magma vs Team Aqua": ["team-magma-vs-team-aqua", "ex-team-magma-vs-team-aqua"],
  "Hidden Legends": ["hidden-legends", "ex-hidden-legends"],
  "FireRed & LeafGreen": ["firered-and-leafgreen", "ex-firered-leafgreen"],
  "Team Rocket Returns": ["team-rocket-returns", "ex-team-rocket-returns"],
  "Deoxys": ["deoxys", "deoxys-duskull", "ex-deoxys"],
  "Emerald": ["emerald", "emerald-sceptile", "ex-emerald"],
  "Unseen Forces": ["unseen-forces", "ex-unseen-forces"],
  "Delta Species": ["delta-species", "ex-delta-species"],
  "Legend Maker": ["legend-maker", "ex-legend-maker"],
  "Holon Phantoms": ["holon-phantoms", "holon-phantoms-torkoal", "ex-holon-phantoms"],
  "Crystal Guardians": ["crystal-guardians", "ex-crystal-guardians"],
  "Dragon Frontiers": ["dragon-frontiers", "ex-dragon-frontiers"],
  "Power Keepers": ["power-keepers", "power-keepers-slaking", "ex-power-keepers"],
  "EX Battle Stadium": ["ex-battle-stadium"],
  "EX Trainer Kits": ["ex-trainer-kit", "ex-trainer-kit-1-latias-and-latios", "ex-trainer-kit-2", "ex-trainer-kit-2-plusle-and-minun"],

  // === WOTC / CLASSIC ERA ===
  "Base Set": ["base-set"],
  "Base Set Shadowless": ["base-set-shadowless"],
  "Base Set 2": ["base-set-2"],
  "Jungle": ["jungle"],
  "Fossil": ["fossil"],
  "Team Rocket": ["team-rocket", "team-rocket-porygon"],
  "Gym Heroes": ["gym-heroes"],
  "Gym Challenge": ["gym-challenge"],
  "Neo Genesis": ["neo-genesis"],
  "Neo Discovery": ["neo-discovery"],
  "Neo Revelation": ["neo-revelation"],
  "Neo Destiny": ["neo-destiny"],
  "Legendary Collection": ["legendary-collection"],
  "Expedition Base Set": ["expedition", "expedition-base-set", "expedition-expedition"],
  "Aquapolis": ["aquapolis"],
  "Skyridge": ["skyridge", "skyridge-aerodactyl", "skyridge-buried-fossil", "skyridge-celebi", "skyridge-charizard", "skyridge-farfetchd", "skyridge-golem", "skyridge-heracross", "skyridge-ho-oh", "skyridge-miracle", "skyridge-mirage-stadium", "skyridge-misdreavus", "skyridge-moltres", "skyridge-nidoran", "skyridge-omanyte", "skyridge-omastar", "skyridge-pikachu", "skyridge-raikou", "skyridge-skyridge", "skyridge-vaporeon", "skyridge-yanma"],
  "Wizards Black Star Promos": ["wizards-black-star-promos", "wotc-promo"],
  "Southern Islands": ["southern-islands"],

  // === MEGA EVOLUTION ERA (JP/SPECIAL) ===
  "Mega Evolution": ["mega-evolution", "mega-evolution-additionals", "mega-evolution-energies", "mega-evolution-products", "me01-mega-evolution", "mee-mega-evolution-energies", "me-mega-evolution-promo", "mep-black-star-promos"],
  "Ascended Heroes": ["ascended-heroes", "ascended-heroes-additionals", "me-ascended", "me-ascended-heroes"],
  "Phantasmal Flames": ["phantasmal-flames", "phantasmal-flames-additionals", "me02-phantasmal-flames"],
  "Perfect Order": ["me03-perfect-order"],
  "Brilliant Fantasy": ["brilliant-fantasy"],

  // === SPECIAL / PROMOS / PRODUCTS ===
  "Battle Academy": ["battle-academy", "battle-academy-2020", "battle-academy-2022", "battle-academy-2024"],
  "Trading Card Game Classic": ["trading-card-game-classic", "pokemon-trading-card-game-classic-blastoise-suicune-ex-deck", "pokemon-trading-card-game-classic-charizard-ho-oh-ex-deck", "pokemon-trading-card-game-classic-venusaur-lugia-ex-deck"],
  "Trick or Trade": ["trick-or", "trick-or-trade", "trick-or-trade-2023", "trick-or-trade-2024", "trick-or-trade-booster-bundle", "trick-or-trade-booster-bundle-2023", "trick-or-trade-booster-bundle-2024"],
  "McDonald's Promos": ["mcdonalds-promos", "mcdonalds-promos-2011", "mcdonalds-promos-2012", "mcdonalds-promos-2014", "mcdonalds-promos-2015", "mcdonalds-promos-2016", "mcdonalds-promos-2017", "mcdonalds-promos-2018", "mcdonalds-promos-2019", "mcdonalds-promos-2022", "mcdonalds-promos-2023", "mcdonalds-promos-2024", "mcdonalds-collection-2011", "mcdonalds-collection-2012", "mcdonalds-collection-2013", "mcdonalds-collection-2014", "mcdonalds-collection-2015", "mcdonalds-collection-2016", "mcdonalds-collection-2017", "mcdonalds-collection-2018", "mcdonalds-collection-2019", "mcdonalds-collection-2019-2", "mcdonalds-collection-2022", "mcdonalds-collection-2024", "mcdonalds-collection-25th-anniversary", "mcdonalds-25th-anniversary-promos", "mcdonald-s-collection-2018-2", "mcdonalds-match-battle-2023"],
  "World Championship Decks": ["world-championship", "world-championship-decks", "wcd-2004", "wcd-2005", "wcd-2006", "wcd-2007", "wcd-2008", "wcd-2009", "wcd-2010", "wcd-2011", "wcd-2012", "wcd-2013", "wcd-2014", "wcd-2015", "wcd-2016", "wcd-2017", "wcd-2018", "wcd-2019", "wcd-2022", "wcd-2023", "wcd-2024"],
  "POP Series": ["pop-series", "pop-series-1", "pop-series-2", "pop-series-3", "pop-series-4", "pop-series-5", "pop-series-6", "pop-series-7", "pop-series-8", "pop-series-9"],
  "Play! Pokemon Prize Packs": ["prize-pack", "prize-pack-series-cards", "play-pokemon-prize-pack-series-one", "play-pokemon-prize-pack-series-two", "play-pokemon-prize-pack-series-three", "play-pokemon-prize-pack-series-four", "play-pokemon-prize-pack-series-five", "play-pokemon-prize-pack-series-six", "play-pokemon-prize-pack-series-seven", "play-pokemon-prize-pack-series-eight"],
  "Nintendo Black Star Promos": ["nintendo-black-star-promos", "nintendo-promos"],
  "Alternate Art Promos": ["alternate-art-promos"],
  "Best of Game Cards": ["best-of-game-cards-promos", "best-of-promos"],
  "Burger King Promos": ["burger-king-promos", "burger-king-dp-promos-2008", "burger-king-platinum-promos-2009"],
  "Deck Exclusives": ["deck-exclusives", "deck-exclusives-hawlucha", "deck-exclusives-indeedee", "deck-exclusives-rabsca", "deck-exclusives-skeledirge", "deck-exclusives-togekiss"],
  "My First Battle": ["my-first-battle"],
  "Pokemon Rumble": ["pokemon-rumble", "rumble"],
  "Pokemon Products": ["pokemon-products"],
  "Legendary Modern Decks 2026": ["legendary-modern-decks-2026"],
  "First Partner Pack": ["first-partner-pack", "first-partner-collection-2026"],
  "Poke Card Creator Pack": ["poke-card-creator-pack"],

  // === OTHER / MISC ===
  "Blister Exclusives": ["blister-exclusives"],
  "Countdown Calendar Promos": ["countdown-calendar-promos"],
  "E-Reader Sample Cards": ["e-reader-sample-cards"],
  "Futsal Promos": ["futsal-promos"],
  "Jumbo Cards": ["jumbo-cards"],
  "Kids WB Promos": ["kids-wb-promos"],
  "League & Championship Cards": ["league-and", "league-and-championship-cards"],
  "Master Strategy Deck Building Sets": ["master-strategy-deck-building-sets"],
  "Miscellaneous Cards": ["miscellaneous-cards", "miscellaneous-cards-and-products"],
  "Pikachu World Collection": ["pikachu-world-collection", "pikachu-world-collection-promos"],
  "Player Placement Promos": ["player-placement-trainer-promos"],
  "Professor Program Promos": ["professor-program", "professor-program-promos"],
  "W Promos": ["w-promos"],
  "Southeast Asia Promos": ["southeast-asia-promos"],
  "Promos": ["promos"],
  "Unknown": ["unknown"],
  "Ninja Spinner": ["ninja-spinner"],
  "Raid Battle": ["raid-battle"],
  "Winterspell": ["winterspell"],
  "Maze of Muertos": ["maze-of-muertos"],
  "TMNT": ["teenage-mutant-ninja-turtles", "commander-teenage-mutant-ninja-turtles"],
  "Extra Booster One Piece": ["extra-booster-one-piece-heroines-edition"],
  "30th Anniversary (Chinese)": ["30th-anniversary-celebration-simplified-chinese"],
  "Ash vs Team Rocket Deck Kit": ["ash-vs-team-rocket-deck-kit-jp-exclusive"],
  "Beginning Set": ["beginning-set-pikachu", "beginning-set-plus"],

  // === JAPANESE EXCLUSIVE ===
  "Japan City": ["japan-city"],
  "Japan Clash": ["japan-clash"],
  "Japan Fighting": ["japan-fighting"],
  "Japan Rocket": ["japan-rocket"],
}

/**
 * Given a set name (as shown to the AI), return all Poketrace API slugs to query.
 * Falls back to treating the input as a raw slug if not found in the map.
 */
export function getSlugsForSet(setName: string): string[] {
  // Direct lookup by set name
  if (SET_SLUG_MAP[setName]) {
    return SET_SLUG_MAP[setName]
  }

  // Case-insensitive lookup
  const lower = setName.toLowerCase()
  for (const [name, slugs] of Object.entries(SET_SLUG_MAP)) {
    if (name.toLowerCase() === lower) {
      return slugs
    }
  }

  // Fallback: treat input as a raw slug
  return [setName]
}
