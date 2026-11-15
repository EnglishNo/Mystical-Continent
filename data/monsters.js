// [폴백 보호] 만약 브라우저 캐시 등으로 data/monsterStats.js가 먼저 로드되지 않았더라도 동일 스탯 보장
if (typeof MONSTER_STAT_TABLE === 'undefined') {
  window.MONSTER_STAT_TABLE = {
// ===========================================================================
  // [1부 구역 몬스터 스탯] (Lv.1 ~ Lv.12)
  // ===========================================================================

  // 1) 집 앞 (emerald_forest) — 슬라임 5마리 (Lv.1~2)
  m_s1:  { lv: 1,  hp: 95,   atk: 26,  def: 3,  spd: 80,  exp: 41,  gold: 23,  drop: 'potion_hp', bonusDrops: [] },
  m_s2:  { lv: 1,  hp: 95,   atk: 26,  def: 3,  spd: 80,  exp: 41,  gold: 23,  drop: 'potion_hp', bonusDrops: [] },
  m_s3:  { lv: 1,  hp: 105,  atk: 28,  def: 4,  spd: 82,  exp: 41,  gold: 23,  drop: 'potion_hp', bonusDrops: [] },
  m_s4:  { lv: 2,  hp: 125,  atk: 32,  def: 5,  spd: 86,  exp: 50,  gold: 27,  drop: 'potion_hp', bonusDrops: [] },
  m_s5:  { lv: 2,  hp: 125,  atk: 32,  def: 5,  spd: 86,  exp: 50,  gold: 27,  drop: 'potion_hp', bonusDrops: [] },

  // 2) 고블린 전초기지 1구역 (ancient_ruins) (Lv.3~4)
  m_g1:  { lv: 3,  hp: 185,  atk: 44,  def: 8,  spd: 108, exp: 72,  gold: 41,  drop: 'potion_hp', bonusDrops: [{ item: 'broken_goblin_weapon', chance: 0.65 }] },
  m_g2:  { lv: 3,  hp: 175,  atk: 46,  def: 7,  spd: 102, exp: 77,  gold: 43,  drop: 'potion_hp', bonusDrops: [{ item: 'broken_goblin_weapon', chance: 0.65 }] },
  m_g3:  { lv: 4,  hp: 245,  atk: 52,  def: 12, spd: 100, exp: 86,  gold: 50,  drop: 'potion_hp', bonusDrops: [{ item: 'broken_goblin_weapon', chance: 0.65 }] },
  m_g4:  { lv: 4,  hp: 215,  atk: 50,  def: 10, spd: 115, exp: 81,  gold: 47,  drop: 'potion_hp', bonusDrops: [{ item: 'broken_goblin_weapon', chance: 0.65 }] },
  m_g5:  { lv: 4,  hp: 205,  atk: 53,  def: 9,  spd: 98,  exp: 90,  gold: 54,  drop: 'potion_hp', bonusDrops: [{ item: 'broken_goblin_weapon', chance: 0.65 }] },

  // 3) 고블린 심층 야영지 2구역 (goblin_depths) (Lv.4~5)
  m_gd1: { lv: 4,  hp: 235,  atk: 54,  def: 11, spd: 106, exp: 90,  gold: 52,  drop: 'potion_hp', bonusDrops: [{ item: 'broken_goblin_weapon', chance: 0.70 }] },
  m_gd2: { lv: 5,  hp: 270,  atk: 58,  def: 13, spd: 104, exp: 104, gold: 61,  drop: 'potion_hp', bonusDrops: [{ item: 'broken_goblin_weapon', chance: 0.70 }] },
  m_gd3: { lv: 5,  hp: 315,  atk: 62,  def: 16, spd: 104, exp: 108, gold: 65,  drop: 'potion_hp', bonusDrops: [{ item: 'broken_goblin_weapon', chance: 0.70 }] },
  m_gd4: { lv: 5,  hp: 290,  atk: 60,  def: 14, spd: 118, exp: 104, gold: 63,  drop: 'potion_hp', bonusDrops: [{ item: 'broken_goblin_weapon', chance: 0.70 }] },

  // 4) 오크 전투협곡 1구역 (orc_canyon_1) (Lv.6~7)
  m_o1:  { lv: 6,  hp: 380,  atk: 72,  def: 19, spd: 105, exp: 135, gold: 81,  drop: 'potion_hp',     bonusDrops: [{ item: 'guardian_plate', chance: 0.12 }] },
  m_o2:  { lv: 6,  hp: 360,  atk: 76,  def: 18, spd: 118, exp: 149, gold: 86,  drop: 'potion_hp',     bonusDrops: [{ item: 'iron_blade', chance: 0.12 }] },
  m_o3:  { lv: 7,  hp: 400,  atk: 82,  def: 21, spd: 100, exp: 162, gold: 99,  drop: 'potion_elixir', bonusDrops: [] },
  m_o4:  { lv: 7,  hp: 465,  atk: 80,  def: 25, spd: 96,  exp: 171, gold: 104, drop: 'potion_hp',     bonusDrops: [{ item: 'guardian_plate', chance: 0.14 }] },

  // 5) 오크 철혈 요새 2구역 (orc_stronghold_2) (Lv.8~9)
  m_os1: { lv: 8,  hp: 500,  atk: 92,  def: 27, spd: 120, exp: 189, gold: 117, drop: 'potion_hp',     bonusDrops: [{ item: 'gyro_boots', chance: 0.12 }] },
  m_os2: { lv: 8,  hp: 480,  atk: 96,  def: 26, spd: 102, exp: 198, gold: 122, drop: 'potion_elixir', bonusDrops: [] },
  m_os3: { lv: 9,  hp: 600,  atk: 104, def: 33, spd: 100, exp: 225, gold: 140, drop: 'potion_elixir', bonusDrops: [{ item: 'guardian_plate', chance: 0.15 }] },
  m_os4: { lv: 9,  hp: 560,  atk: 102, def: 31, spd: 112, exp: 221, gold: 135, drop: 'potion_hp',     bonusDrops: [{ item: 'mithril_sword', chance: 0.10 }] },

  // 6) 발록의 제단 (abyssal_altar) — 1부 보스 발록 (Lv.12, 보스 체력 유지)
  boss:  { lv: 12, hp: 4200, atk: 142, def: 72, spd: 118, exp: 900, gold: 900, drop: 'potion_elixir', bonusDrops: [{ item: 'abyss_crown', chance: 0.50 }, { item: 'dragonscale_armor', chance: 0.35 }] },

  // 7) 해변으로 향하는 길 1~3 (coastal_road_1 ~ 3) (Lv.5~10)
  m_cr1_1: { lv: 5,  hp: 280,  atk: 62,  def: 14, spd: 108, exp: 108, gold: 63,  drop: 'potion_hp',     bonusDrops: [] },
  m_cr1_2: { lv: 5,  hp: 320,  atk: 66,  def: 17, spd: 104, exp: 113, gold: 68,  drop: 'potion_hp',     bonusDrops: [{ item: 'broken_goblin_weapon', chance: 0.50 }] },
  m_cr1_3: { lv: 6,  hp: 375,  atk: 74,  def: 19, spd: 110, exp: 135, gold: 81,  drop: 'potion_hp',     bonusDrops: [] },

  m_cr2_1: { lv: 7,  hp: 415,  atk: 84,  def: 22, spd: 105, exp: 158, gold: 95,  drop: 'potion_elixir', bonusDrops: [] },
  m_cr2_2: { lv: 8,  hp: 495,  atk: 94,  def: 27, spd: 118, exp: 185, gold: 113, drop: 'potion_hp',     bonusDrops: [{ item: 'gyro_boots', chance: 0.12 }] },
  m_cr2_3: { lv: 8,  hp: 470,  atk: 96,  def: 26, spd: 104, exp: 194, gold: 117, drop: 'potion_elixir', bonusDrops: [] },

  m_cr3_1: { lv: 9,  hp: 590,  atk: 106, def: 32, spd: 102, exp: 225, gold: 140, drop: 'potion_hp',     bonusDrops: [{ item: 'guardian_plate', chance: 0.15 }] },
  m_cr3_2: { lv: 10, hp: 640,  atk: 114, def: 35, spd: 120, exp: 252, gold: 158, drop: 'potion_hp',     bonusDrops: [{ item: 'iron_blade', chance: 0.15 }] },
  m_cr3_3: { lv: 10, hp: 610,  atk: 116, def: 34, spd: 106, exp: 261, gold: 167, drop: 'potion_elixir', bonusDrops: [] },

  // ===========================================================================
  // [2부 신규 구역 몬스터 스탯] v2.0 '푸른 바다를 감싸는 어둠' (Lv.13 ~ Lv.27)
  // ===========================================================================

  // 8) 플라워 아일랜드 : 화단길 01~02 (flower_island_1 ~ 2) (Lv.13~15)
  //    - 해적 세트 장비(10%), 해적 잡동사니(5%), 메인 9장 중요한 사진(15%, 천장 없음)
  m_fi1_1: { lv: 13, hp: 720,  atk: 145, def: 42, spd: 112, exp: 340, gold: 210, drop: 'potion_hp',     bonusDrops: [{ item: 'pirate_cutlass', chance: 0.10 }, { item: 'pirate_junk', chance: 0.05 }, { item: 'important_photo', chance: 0.15, questId: 'main_9' }] },
  m_fi1_2: { lv: 13, hp: 680,  atk: 148, def: 40, spd: 106, exp: 350, gold: 220, drop: 'potion_hp',     bonusDrops: [{ item: 'pirate_compass', chance: 0.10 }, { item: 'pirate_junk', chance: 0.05 }, { item: 'important_photo', chance: 0.15, questId: 'main_9' }] },
  m_fi1_3: { lv: 14, hp: 840,  atk: 156, def: 48, spd: 102, exp: 380, gold: 240, drop: 'potion_elixir', bonusDrops: [{ item: 'pirate_coat', chance: 0.10 },    { item: 'pirate_junk', chance: 0.05 }, { item: 'important_photo', chance: 0.15, questId: 'main_9' }] },
  m_fi1_4: { lv: 14, hp: 780,  atk: 152, def: 45, spd: 118, exp: 390, gold: 245, drop: 'potion_hp',     bonusDrops: [{ item: 'pirate_cutlass', chance: 0.10 }, { item: 'pirate_junk', chance: 0.05 }, { item: 'important_photo', chance: 0.15, questId: 'main_9' }] },

  m_fi2_1: { lv: 14, hp: 770,  atk: 154, def: 45, spd: 108, exp: 385, gold: 240, drop: 'potion_hp',     bonusDrops: [{ item: 'pirate_compass', chance: 0.10 }, { item: 'pirate_junk', chance: 0.05 }, { item: 'important_photo', chance: 0.15, questId: 'main_9' }] },
  m_fi2_2: { lv: 15, hp: 940,  atk: 164, def: 52, spd: 104, exp: 420, gold: 265, drop: 'potion_elixir', bonusDrops: [{ item: 'pirate_coat', chance: 0.10 },    { item: 'pirate_junk', chance: 0.05 }, { item: 'important_photo', chance: 0.15, questId: 'main_9' }] },
  m_fi2_3: { lv: 15, hp: 850,  atk: 166, def: 48, spd: 106, exp: 430, gold: 270, drop: 'potion_elixir', bonusDrops: [{ item: 'pirate_compass', chance: 0.10 }, { item: 'pirate_junk', chance: 0.05 }, { item: 'important_photo', chance: 0.15, questId: 'main_9' }] },
  m_fi2_4: { lv: 15, hp: 880,  atk: 162, def: 49, spd: 120, exp: 425, gold: 268, drop: 'potion_hp',     bonusDrops: [{ item: 'pirate_cutlass', chance: 0.10 }, { item: 'pirate_junk', chance: 0.05 }, { item: 'important_photo', chance: 0.15, questId: 'main_9' }] },

  // 9) 비어 케이브 : 맥주 냄새가 나는 동굴 통로 01~03 (beer_cave_1 ~ 3) (Lv.16~18)
  //    - 바이킹 세트 장비(5%)
  m_bc1_1: { lv: 16, hp: 980,  atk: 180, def: 55, spd: 110, exp: 480, gold: 300, drop: 'potion_hp',     bonusDrops: [{ item: 'viking_battleaxe', chance: 0.05 }] },
  m_bc1_2: { lv: 16, hp: 940,  atk: 184, def: 53, spd: 106, exp: 490, gold: 310, drop: 'potion_elixir', bonusDrops: [{ item: 'viking_horn_ring', chance: 0.05 }] },
  m_bc1_3: { lv: 16, hp: 1120, atk: 178, def: 60, spd: 100, exp: 500, gold: 315, drop: 'potion_elixir', bonusDrops: [{ item: 'viking_armor', chance: 0.05 }] },

  m_bc2_1: { lv: 17, hp: 1140, atk: 196, def: 60, spd: 120, exp: 540, gold: 340, drop: 'potion_hp',     bonusDrops: [{ item: 'viking_battleaxe', chance: 0.05 }] },
  m_bc2_2: { lv: 17, hp: 1080, atk: 200, def: 58, spd: 105, exp: 550, gold: 350, drop: 'potion_elixir', bonusDrops: [{ item: 'viking_horn_ring', chance: 0.05 }] },
  m_bc2_3: { lv: 17, hp: 1260, atk: 192, def: 65, spd: 102, exp: 560, gold: 355, drop: 'potion_elixir', bonusDrops: [{ item: 'viking_armor', chance: 0.05 }] },

  m_bc3_1: { lv: 18, hp: 1240, atk: 210, def: 64, spd: 112, exp: 600, gold: 380, drop: 'potion_hp',     bonusDrops: [{ item: 'viking_battleaxe', chance: 0.05 }] },
  m_bc3_2: { lv: 18, hp: 1180, atk: 214, def: 62, spd: 108, exp: 610, gold: 390, drop: 'potion_elixir', bonusDrops: [{ item: 'viking_horn_ring', chance: 0.05 }] },
  m_bc3_3: { lv: 18, hp: 1380, atk: 222, def: 68, spd: 122, exp: 625, gold: 400, drop: 'potion_elixir', bonusDrops: [{ item: 'viking_battleaxe', chance: 0.05 }] },
  m_bc3_4: { lv: 18, hp: 1220, atk: 218, def: 64, spd: 108, exp: 620, gold: 395, drop: 'potion_elixir', bonusDrops: [{ item: 'viking_armor', chance: 0.05 }] },

  // 10) 에리크의 방 (erik_room) — 보스 붉은 바이킹 전사 에리크 (Lv.19, 보스 체력 유지)
  boss_erik: { lv: 19, hp: 14500, atk: 242, def: 145, spd: 122, exp: 1800, gold: 1600, drop: 'potion_elixir', bonusDrops: [{ item: 'erik_red_leather_armor', chance: 0.10 }, { item: 'erik_red_beard', chance: 0.30 }] },

  // 11) 해적들의 길목 01~02 (pirate_path_1 ~ 2) (Lv.19~21)
  //     - 수상한 암석(15%)
  m_pp1_1: { lv: 19, hp: 1360, atk: 228, def: 68, spd: 120, exp: 680, gold: 430, drop: 'potion_hp',     bonusDrops: [{ item: 'suspicious_rock', chance: 0.15 }] },
  m_pp1_2: { lv: 19, hp: 1320, atk: 232, def: 66, spd: 106, exp: 695, gold: 440, drop: 'potion_elixir', bonusDrops: [{ item: 'suspicious_rock', chance: 0.15 }] },
  m_pp1_3: { lv: 20, hp: 1560, atk: 246, def: 74, spd: 104, exp: 730, gold: 465, drop: 'potion_elixir', bonusDrops: [{ item: 'suspicious_rock', chance: 0.15 }] },
  m_pp1_4: { lv: 20, hp: 1440, atk: 240, def: 70, spd: 112, exp: 720, gold: 460, drop: 'potion_hp',     bonusDrops: [{ item: 'suspicious_rock', chance: 0.15 }] },

  m_pp2_1: { lv: 20, hp: 1460, atk: 242, def: 70, spd: 122, exp: 735, gold: 465, drop: 'potion_hp',     bonusDrops: [{ item: 'suspicious_rock', chance: 0.15 }] },
  m_pp2_2: { lv: 21, hp: 1580, atk: 256, def: 74, spd: 108, exp: 780, gold: 495, drop: 'potion_elixir', bonusDrops: [{ item: 'suspicious_rock', chance: 0.15 }] },
  m_pp2_3: { lv: 21, hp: 1720, atk: 264, def: 78, spd: 106, exp: 795, gold: 510, drop: 'potion_elixir', bonusDrops: [{ item: 'suspicious_rock', chance: 0.15 }] },
  m_pp2_4: { lv: 21, hp: 1620, atk: 254, def: 75, spd: 114, exp: 785, gold: 500, drop: 'potion_hp',     bonusDrops: [{ item: 'suspicious_rock', chance: 0.15 }] },

  // 12) 해적의 대형 선박 내부 01~02 (pirate_ship_1 ~ 2) (Lv.22~24)
  //     - 해적 세트 장비(10%), 해적 잡동사니(10%), 메인 17장 집무실 열쇠(15%, 천장 없음)
  m_ps1_1: { lv: 22, hp: 1760, atk: 272, def: 80, spd: 116, exp: 860,  gold: 550, drop: 'potion_elixir', bonusDrops: [{ item: 'pirate_cutlass', chance: 0.10 }, { item: 'pirate_junk', chance: 0.10 }, { item: 'office_key', chance: 0.15, questId: 'main_17' }] },
  m_ps1_2: { lv: 22, hp: 1680, atk: 276, def: 78, spd: 112, exp: 875,  gold: 560, drop: 'potion_hp',     bonusDrops: [{ item: 'pirate_compass', chance: 0.10 }, { item: 'pirate_junk', chance: 0.10 }, { item: 'office_key', chance: 0.15, questId: 'main_17' }] },
  m_ps1_3: { lv: 23, hp: 1980, atk: 288, def: 86, spd: 106, exp: 930,  gold: 600, drop: 'potion_elixir', bonusDrops: [{ item: 'pirate_coat', chance: 0.10 },    { item: 'pirate_junk', chance: 0.10 }, { item: 'office_key', chance: 0.15, questId: 'main_17' }] },
  m_ps1_4: { lv: 23, hp: 1860, atk: 292, def: 82, spd: 124, exp: 945,  gold: 610, drop: 'potion_elixir', bonusDrops: [{ item: 'pirate_cutlass', chance: 0.10 }, { item: 'pirate_junk', chance: 0.10 }, { item: 'office_key', chance: 0.15, questId: 'main_17' }] },

  m_ps2_1: { lv: 23, hp: 1880, atk: 286, def: 84, spd: 118, exp: 935,  gold: 605, drop: 'potion_elixir', bonusDrops: [{ item: 'pirate_coat', chance: 0.10 },    { item: 'pirate_junk', chance: 0.10 }, { item: 'office_key', chance: 0.15, questId: 'main_17' }] },
  m_ps2_2: { lv: 24, hp: 1980, atk: 300, def: 86, spd: 114, exp: 990,  gold: 645, drop: 'potion_hp',     bonusDrops: [{ item: 'pirate_compass', chance: 0.10 }, { item: 'pirate_junk', chance: 0.10 }, { item: 'office_key', chance: 0.15, questId: 'main_17' }] },
  m_ps2_3: { lv: 24, hp: 2180, atk: 310, def: 92, spd: 108, exp: 1010, gold: 660, drop: 'potion_elixir', bonusDrops: [{ item: 'pirate_coat', chance: 0.10 },    { item: 'pirate_junk', chance: 0.10 }, { item: 'office_key', chance: 0.15, questId: 'main_17' }] },
  m_ps2_4: { lv: 24, hp: 2040, atk: 306, def: 88, spd: 126, exp: 1020, gold: 670, drop: 'potion_elixir', bonusDrops: [{ item: 'pirate_cutlass', chance: 0.10 }, { item: 'pirate_junk', chance: 0.10 }, { item: 'office_key', chance: 0.15, questId: 'main_17' }] },

  // 13) vs 해적 여왕 (vs_pirate_queen) — 최종 보스 『해왕』 세라피리아 더 파이럿 (Lv.27, 보스 체력 유지)
  boss_seraphiria: { lv: 27, hp: 26000, atk: 345, def: 205, spd: 132, exp: 3500, gold: 3200, drop: 'potion_elixir', bonusDrops: [{ item: 'sea_king_sword', chance: 0.10 }, { item: 'seraphiria_emblem', chance: 0.30 }] }
};
}
if (typeof applyMonsterStatConfig === 'undefined') {
  window.applyMonsterStatConfig = function(spawnObj) {
    const cfg = (typeof MONSTER_STAT_TABLE !== 'undefined' && MONSTER_STAT_TABLE[spawnObj.id]) || {};
    const hpVal = cfg.hp ?? spawnObj.hp ?? 100;
    return {
      ...spawnObj,
      lv: cfg.lv ?? spawnObj.lv ?? 1,
      hp: hpVal,
      maxHp: cfg.maxHp ?? hpVal,
      atk: cfg.atk ?? spawnObj.atk ?? 20,
      def: cfg.def ?? spawnObj.def ?? 0,
      spd: cfg.spd ?? spawnObj.spd ?? 100,
      exp: cfg.exp ?? spawnObj.exp ?? 30,
      gold: cfg.gold ?? spawnObj.gold ?? 20,
      drop: cfg.drop ?? spawnObj.drop ?? 'potion_hp',
      bonusDrops: Array.isArray(cfg.bonusDrops) ? cfg.bonusDrops.map(d => ({ ...d })) : (spawnObj.bonusDrops || [])
    };
  };
}

// ============================================================================
// [data/monsters.js] 신비의 대륙 v2.0 — 전 구역 몬스터 월드 스폰 배치 DB
//  - 몬스터의 상세 스탯(lv, hp, atk, spd, exp, gold) 및 드랍률(drop, bonusDrops)은
//    [data/monsterStats.js]의 MONSTER_STAT_TABLE에 모듈화되어 있습니다.
//  - 이 파일은 각 몬스터의 소속 구역(zone), 스폰 좌표(x, y), 외형(kind), 패턴(pattern)만 관리합니다.
// ============================================================================

function createInitialMonsters() {
  const rawSpawns = [
    // [1부 구역 몬스터 스폰 배치]
    { id: 'm_s1', name: '집 앞 초원 슬라임', kind: 'slime', faction: 'slime', zone: 'emerald_forest', x: 350, y: 195, animPhase: 0.2, r: 19, pattern: 'melee', isBoss: false },
    { id: 'm_s2', name: '집 앞 초원 슬라임', kind: 'slime', faction: 'slime', zone: 'emerald_forest', x: 490, y: 275, animPhase: 1.4, r: 19, pattern: 'melee', isBoss: false },
    { id: 'm_s3', name: '집 앞 푸른 슬라임', kind: 'slime', faction: 'slime', zone: 'emerald_forest', x: 440, y: 410, animPhase: 2.5, r: 19, pattern: 'melee', isBoss: false },
    { id: 'm_s4', name: '집 앞 왕방울 슬라임', kind: 'slime', faction: 'slime', zone: 'emerald_forest', x: 625, y: 205, animPhase: 3.6, r: 19, pattern: 'melee', isBoss: false },
    { id: 'm_s5', name: '집 앞 왕방울 슬라임', kind: 'slime', faction: 'slime', zone: 'emerald_forest', x: 655, y: 380, animPhase: 4.8, r: 19, pattern: 'melee', isBoss: false },

    { id: 'm_g1', name: '고블린 단검 납치병', kind: 'goblin', faction: 'goblin', zone: 'ancient_ruins', x: 280, y: 235, animPhase: 0.5, r: 20, pattern: 'melee', isBoss: false },
    { id: 'm_g2', name: '고블린 독화살 궁수', kind: 'goblin_archer', faction: 'goblin', zone: 'ancient_ruins', x: 430, y: 195, animPhase: 1.7, r: 20, pattern: 'ranged_arrow', isBoss: false },
    { id: 'm_g3', name: '고블린 중갑 돌격병', kind: 'goblin_brute', faction: 'goblin', zone: 'ancient_ruins', x: 360, y: 400, animPhase: 2.9, r: 22, pattern: 'heavy_slam', isBoss: false },
    { id: 'm_g4', name: '고블린 단검 암살병', kind: 'goblin', faction: 'goblin', zone: 'ancient_ruins', x: 580, y: 290, animPhase: 4.1, r: 20, pattern: 'melee', isBoss: false },
    { id: 'm_g5', name: '고블린 주술사', kind: 'goblin_shaman', faction: 'goblin', zone: 'ancient_ruins', x: 685, y: 385, animPhase: 5.0, r: 20, pattern: 'shaman_bolt', isBoss: false },

    { id: 'm_gd1', name: '정예 고블린 저격수', kind: 'goblin_archer', faction: 'goblin', zone: 'goblin_depths', x: 290, y: 250, animPhase: 0.4, r: 20, pattern: 'ranged_arrow', isBoss: false },
    { id: 'm_gd2', name: '고블린 대주술사', kind: 'goblin_shaman', faction: 'goblin', zone: 'goblin_depths', x: 450, y: 210, animPhase: 1.6, r: 21, pattern: 'shaman_bolt', isBoss: false },
    { id: 'm_gd3', name: '고블린 철퇴 분쇄병', kind: 'goblin_brute', faction: 'goblin', zone: 'goblin_depths', x: 480, y: 410, animPhase: 2.8, r: 23, pattern: 'heavy_slam', isBoss: false },
    { id: 'm_gd4', name: '고블린 친위 대장', kind: 'goblin', faction: 'goblin', zone: 'goblin_depths', x: 675, y: 290, animPhase: 3.9, r: 21, pattern: 'melee', isBoss: false },

    { id: 'm_o1', name: '오크 부족 도끼전사', kind: 'elite_orc', faction: 'orc', zone: 'orc_canyon_1', x: 290, y: 240, animPhase: 0.8, r: 24, pattern: 'melee', isBoss: false },
    { id: 'm_o2', name: '오크 피의 광전사', kind: 'orc_berserker', faction: 'orc', zone: 'orc_canyon_1', x: 450, y: 390, animPhase: 2.1, r: 24, pattern: 'melee', isBoss: false },
    { id: 'm_o3', name: '오크 흑마술사', kind: 'orc_shaman', faction: 'orc', zone: 'orc_canyon_1', x: 590, y: 210, animPhase: 3.4, r: 23, pattern: 'dark_bolt', isBoss: false },
    { id: 'm_o4', name: '오크 중갑 방패병', kind: 'orc_juggernaut', faction: 'orc', zone: 'orc_canyon_1', x: 685, y: 370, animPhase: 4.9, r: 26, pattern: 'heavy_slam', isBoss: false },

    { id: 'm_os1', name: '철혈 오크 광전사', kind: 'orc_berserker', faction: 'orc', zone: 'orc_stronghold_2', x: 310, y: 240, animPhase: 0.7, r: 24, pattern: 'melee', isBoss: false },
    { id: 'm_os2', name: '철혈 오크 대주술사', kind: 'orc_shaman', faction: 'orc', zone: 'orc_stronghold_2', x: 470, y: 195, animPhase: 1.9, r: 23, pattern: 'dark_bolt', isBoss: false },
    { id: 'm_os3', name: '오크 강철 분쇄자', kind: 'orc_juggernaut', faction: 'orc', zone: 'orc_stronghold_2', x: 520, y: 400, animPhase: 3.1, r: 27, pattern: 'heavy_slam', isBoss: false },
    { id: 'm_os4', name: '발록 친위 오크대장', kind: 'elite_orc', faction: 'orc', zone: 'orc_stronghold_2', x: 695, y: 295, animPhase: 4.4, r: 25, pattern: 'melee', isBoss: false },

    { id: 'boss', name: '오크 부족의 대장 발록', kind: 'boss_dragon', faction: 'orc', bossType: 'balrog', zone: 'abyssal_altar', x: 540, y: 300, animPhase: 0.0, r: 42, pattern: 'flame_breath', isBoss: true, enraged: false, patIdx: 0 },

    { id: 'm_cr1_1', name: '해안 고블린 명궁수', kind: 'goblin_archer', faction: 'goblin', zone: 'coastal_road_1', x: 310, y: 220, animPhase: 0.3, r: 20, pattern: 'ranged_arrow', isBoss: false },
    { id: 'm_cr1_2', name: '해안 고블린 돌격병', kind: 'goblin_brute', faction: 'goblin', zone: 'coastal_road_1', x: 470, y: 365, animPhase: 1.5, r: 22, pattern: 'heavy_slam', isBoss: false },
    { id: 'm_cr1_3', name: '해안 오크 정찰병', kind: 'elite_orc', faction: 'orc', zone: 'coastal_road_1', x: 650, y: 270, animPhase: 2.7, r: 24, pattern: 'melee', isBoss: false },

    { id: 'm_cr2_1', name: '암초 고블린 주술사', kind: 'goblin_shaman', faction: 'goblin', zone: 'coastal_road_2', x: 290, y: 260, animPhase: 0.9, r: 21, pattern: 'shaman_bolt', isBoss: false },
    { id: 'm_cr2_2', name: '해안 오크 광전사', kind: 'orc_berserker', faction: 'orc', zone: 'coastal_road_2', x: 480, y: 220, animPhase: 2.2, r: 24, pattern: 'melee', isBoss: false },
    { id: 'm_cr2_3', name: '해안 오크 흑마술사', kind: 'orc_shaman', faction: 'orc', zone: 'coastal_road_2', x: 660, y: 345, animPhase: 3.5, r: 23, pattern: 'dark_bolt', isBoss: false },

    { id: 'm_cr3_1', name: '심해 오크 강철방패병', kind: 'orc_juggernaut', faction: 'orc', zone: 'coastal_road_3', x: 310, y: 270, animPhase: 1.1, r: 26, pattern: 'heavy_slam', isBoss: false },
    { id: 'm_cr3_2', name: '파도학살 오크 광전사', kind: 'orc_berserker', faction: 'orc', zone: 'coastal_road_3', x: 510, y: 210, animPhase: 2.4, r: 25, pattern: 'melee', isBoss: false },
    { id: 'm_cr3_3', name: '심해 오크 대주술사', kind: 'orc_shaman', faction: 'orc', zone: 'coastal_road_3', x: 675, y: 350, animPhase: 3.8, r: 24, pattern: 'dark_bolt', isBoss: false },

    // [2부 신규 구역 몬스터 스폰 배치]
    { id: 'm_fi1_1', name: '해적 갑판 칼잡이', kind: 'pirate_raider', faction: 'pirate', zone: 'flower_island_1', x: 310, y: 250, animPhase: 0.4, r: 22, pattern: 'melee', isBoss: false },
    { id: 'm_fi1_2', name: '해적 단총 저격수', kind: 'pirate_gunner', faction: 'pirate', zone: 'flower_island_1', x: 460, y: 340, animPhase: 1.6, r: 21, pattern: 'ranged_arrow', isBoss: false },
    { id: 'm_fi1_3', name: '해적 닻 분쇄병', kind: 'pirate_brawler', faction: 'pirate', zone: 'flower_island_1', x: 590, y: 250, animPhase: 2.8, r: 24, pattern: 'heavy_slam', isBoss: false },
    { id: 'm_fi1_4', name: '해적 쌍검 돌격병', kind: 'pirate_duelist', faction: 'pirate', zone: 'flower_island_1', x: 680, y: 340, animPhase: 3.9, r: 22, pattern: 'melee', isBoss: false },

    { id: 'm_fi2_1', name: '해적 단총 저격수', kind: 'pirate_gunner', faction: 'pirate', zone: 'flower_island_2', x: 290, y: 255, animPhase: 0.7, r: 21, pattern: 'ranged_arrow', isBoss: false },
    { id: 'm_fi2_2', name: '해적 닻 분쇄병', kind: 'pirate_brawler', faction: 'pirate', zone: 'flower_island_2', x: 450, y: 245, animPhase: 1.9, r: 24, pattern: 'heavy_slam', isBoss: false },
    { id: 'm_fi2_3', name: '해적 화약 투척수', kind: 'pirate_bomber', faction: 'pirate', zone: 'flower_island_2', x: 520, y: 345, animPhase: 3.1, r: 22, pattern: 'shaman_bolt', isBoss: false },
    { id: 'm_fi2_4', name: '해적 쌍검 돌격병', kind: 'pirate_duelist', faction: 'pirate', zone: 'flower_island_2', x: 675, y: 295, animPhase: 4.3, r: 22, pattern: 'melee', isBoss: false },

    { id: 'm_bc1_1', name: '바이킹 도끼보병', kind: 'viking_axeman', faction: 'viking', zone: 'beer_cave_1', x: 350, y: 240, animPhase: 0.5, r: 24, pattern: 'melee', isBoss: false },
    { id: 'm_bc1_2', name: '바이킹 맥주통 투척병', kind: 'viking_thrower', faction: 'viking', zone: 'beer_cave_1', x: 510, y: 380, animPhase: 1.7, r: 23, pattern: 'ranged_arrow', isBoss: false },
    { id: 'm_bc1_3', name: '바이킹 강철방패병', kind: 'viking_shieldbearer', faction: 'viking', zone: 'beer_cave_1', x: 675, y: 260, animPhase: 2.9, r: 26, pattern: 'heavy_slam', isBoss: false },

    { id: 'm_bc2_1', name: '바이킹 성난 광전사', kind: 'viking_berserker', faction: 'viking', zone: 'beer_cave_2', x: 300, y: 250, animPhase: 0.8, r: 24, pattern: 'melee', isBoss: false },
    { id: 'm_bc2_2', name: '바이킹 북풍 주술사', kind: 'viking_runepriest', faction: 'viking', zone: 'beer_cave_2', x: 470, y: 210, animPhase: 2.0, r: 23, pattern: 'dark_bolt', isBoss: false },
    { id: 'm_bc2_3', name: '바이킹 강철방패병', kind: 'viking_shieldbearer', faction: 'viking', zone: 'beer_cave_2', x: 660, y: 360, animPhase: 3.3, r: 26, pattern: 'heavy_slam', isBoss: false },

    { id: 'm_bc3_1', name: '바이킹 도끼보병', kind: 'viking_axeman', faction: 'viking', zone: 'beer_cave_3', x: 290, y: 250, animPhase: 0.6, r: 24, pattern: 'melee', isBoss: false },
    { id: 'm_bc3_2', name: '바이킹 맥주통 투척병', kind: 'viking_thrower', faction: 'viking', zone: 'beer_cave_3', x: 460, y: 380, animPhase: 1.8, r: 23, pattern: 'ranged_arrow', isBoss: false },
    { id: 'm_bc3_3', name: '바이킹 성난 광전사', kind: 'viking_berserker', faction: 'viking', zone: 'beer_cave_3', x: 600, y: 220, animPhase: 3.0, r: 25, pattern: 'melee', isBoss: false },
    { id: 'm_bc3_4', name: '바이킹 북풍 주술사', kind: 'viking_runepriest', faction: 'viking', zone: 'beer_cave_3', x: 695, y: 365, animPhase: 4.2, r: 23, pattern: 'dark_bolt', isBoss: false },

    { id: 'boss_erik', name: '붉은 바이킹 전사 에리크', kind: 'boss_erik', faction: 'viking', bossType: 'erik', zone: 'erik_room', x: 450, y: 240, animPhase: 0.0, r: 38, pattern: 'erik_axe_throw', isBoss: true, enraged: false, patIdx: 0, patternCooldown: 7.0 },

    { id: 'm_pp1_1', name: '검은 로브의 단검자객', kind: 'black_robe_assassin', faction: 'shadow_cult', zone: 'pirate_path_1', x: 310, y: 230, animPhase: 0.4, r: 22, pattern: 'melee', isBoss: false },
    { id: 'm_pp1_2', name: '검은 로브의 암흑마도사', kind: 'black_robe_warlock', faction: 'shadow_cult', zone: 'pirate_path_1', x: 470, y: 380, animPhase: 1.6, r: 22, pattern: 'dark_bolt', isBoss: false },
    { id: 'm_pp1_3', name: '검은 로브의 사슬처형자', kind: 'black_robe_enforcer', faction: 'shadow_cult', zone: 'pirate_path_1', x: 610, y: 220, animPhase: 2.8, r: 25, pattern: 'heavy_slam', isBoss: false },
    { id: 'm_pp1_4', name: '검은 로브의 그림자사수', kind: 'black_robe_marksman', faction: 'shadow_cult', zone: 'pirate_path_1', x: 695, y: 365, animPhase: 4.0, r: 22, pattern: 'ranged_arrow', isBoss: false },

    { id: 'm_pp2_1', name: '검은 로브의 단검자객', kind: 'black_robe_assassin', faction: 'shadow_cult', zone: 'pirate_path_2', x: 295, y: 245, animPhase: 0.9, r: 22, pattern: 'melee', isBoss: false },
    { id: 'm_pp2_2', name: '검은 로브의 암흑마도사', kind: 'black_robe_warlock', faction: 'shadow_cult', zone: 'pirate_path_2', x: 465, y: 205, animPhase: 2.1, r: 22, pattern: 'dark_bolt', isBoss: false },
    { id: 'm_pp2_3', name: '검은 로브의 사슬처형자', kind: 'black_robe_enforcer', faction: 'shadow_cult', zone: 'pirate_path_2', x: 525, y: 395, animPhase: 3.3, r: 25, pattern: 'heavy_slam', isBoss: false },
    { id: 'm_pp2_4', name: '검은 로브의 그림자사수', kind: 'black_robe_marksman', faction: 'shadow_cult', zone: 'pirate_path_2', x: 690, y: 295, animPhase: 4.5, r: 22, pattern: 'ranged_arrow', isBoss: false },

    { id: 'm_ps1_1', name: '상급 해적 갑판장', kind: 'elite_pirate_boatswain', faction: 'pirate_elite', zone: 'pirate_ship_1', x: 310, y: 235, animPhase: 0.5, r: 24, pattern: 'melee', isBoss: false },
    { id: 'm_ps1_2', name: '상급 해적 쌍권총사수', kind: 'elite_pirate_sharpshooter', faction: 'pirate_elite', zone: 'pirate_ship_1', x: 470, y: 380, animPhase: 1.7, r: 23, pattern: 'ranged_arrow', isBoss: false },
    { id: 'm_ps1_3', name: '상급 해적 중포병', kind: 'elite_pirate_cannoneer', faction: 'pirate_elite', zone: 'pirate_ship_1', x: 615, y: 220, animPhase: 2.9, r: 26, pattern: 'heavy_slam', isBoss: false },
    { id: 'm_ps1_4', name: '세라피리아 친위 검객', kind: 'elite_pirate_royalguard', faction: 'pirate_elite', zone: 'pirate_ship_1', x: 695, y: 365, animPhase: 4.1, r: 24, pattern: 'melee', isBoss: false },

    { id: 'm_ps2_1', name: '상급 해적 갑판장', kind: 'elite_pirate_boatswain', faction: 'pirate_elite', zone: 'pirate_ship_2', x: 295, y: 240, animPhase: 0.8, r: 24, pattern: 'melee', isBoss: false },
    { id: 'm_ps2_2', name: '상급 해적 쌍권총사수', kind: 'elite_pirate_sharpshooter', faction: 'pirate_elite', zone: 'pirate_ship_2', x: 465, y: 205, animPhase: 2.0, r: 23, pattern: 'ranged_arrow', isBoss: false },
    { id: 'm_ps2_3', name: '상급 해적 중포병', kind: 'elite_pirate_cannoneer', faction: 'pirate_elite', zone: 'pirate_ship_2', x: 525, y: 395, animPhase: 3.2, r: 26, pattern: 'heavy_slam', isBoss: false },
    { id: 'm_ps2_4', name: '세라피리아 친위 검객', kind: 'elite_pirate_royalguard', faction: 'pirate_elite', zone: 'pirate_ship_2', x: 690, y: 295, animPhase: 4.4, r: 24, pattern: 'melee', isBoss: false },

    { id: 'boss_seraphiria', name: '해적들의 여왕 『해왕』 세라피리아 더 파이럿', kind: 'boss_seraphiria', faction: 'pirate_elite', bossType: 'seraphiria', zone: 'vs_pirate_queen', x: 540, y: 300, animPhase: 0.0, r: 40, pattern: 'stealth_ambush', isBoss: true, enraged: false, phase2Triggered: false, stealthed: false, stealthTimer: 0, dashComboLeft: 0, patIdx: 0, patternCooldown: 7.0 }
  ];

  const statApplier = typeof applyMonsterStatConfig === 'function' ? applyMonsterStatConfig : (x => x);
  return rawSpawns.map(sp => statApplier({
    ...sp,
    sx: sp.x,
    sy: sp.y,
    vx: 0,
    vy: 0,
    state: 'IDLE',
    timer: 0,
    alive: true,
    flash: 0
  }));
}
