// ============================================================================
// [data/zones.js] 신비의 대륙 v2.0 — 전체 월드 구역(기존 12개 + 신규 15개 = 총 27개 구역) 및 항해 목적지 DB
// - AI 규칙 1 준수: 인게임 출력 텍스트 및 맵/포털/NPC 대사에 대괄호([]) 문장을 넣지 않음
// - AI 규칙 3 준수: 신 맵 목록의 괄호 설명((사냥존 Lv.13~15), (안전지대) 등)은 맵 이름(name)에 넣지 않음
// - 기타 업데이트 반영:
//   1) "포레스트 타운 시티" -> "포레스트 타운"으로 명칭 변경
//   2) "집 안" 맵 역시 마을로 취급하여 인근 사냥터("집 앞")에서 인근 마을 워프 주문서 사용 시 "집 안"으로 워프
//   3) "해변으로 향하는 길 1~3"은 포레스트 타운 인근 사냥터로 취급
// ============================================================================

// [세이렌의 섬 항해 기능 목적지 테이블]
const SAILING_DESTINATIONS = [
  {
    id: 'oceanblue_town',
    name: '🌊 오션블루 타운',
    targetZoneId: 'oceanblue_town',
    sx: 580,
    sy: 320,
    unlockQuestId: 'main_7',
    desc: '평화로운 해안 항구 마을 오션블루 타운으로 귀환합니다.'
  },
  {
    id: 'flower_island_1',
    name: '🌺 플라워 아일랜드 : 화단길 01',
    targetZoneId: 'flower_island_1',
    sx: 140,
    sy: 300,
    unlockQuestId: 'main_7',
    desc: '아름다운 꽃들이 만발한 휴양 섬 플라워 아일랜드로 항해합니다.'
  },
  {
    id: 'beer_cave_1',
    name: '🍺 비어 케이브 : 맥주 냄새가 나는 동굴 통로 01',
    targetZoneId: 'beer_cave_1',
    sx: 140,
    sy: 300,
    unlockQuestId: 'main_12',
    desc: '해적의 라이벌인 바이킹 부족의 본거지 비어 케이브로 항해합니다.'
  },
  {
    id: 'minatomachi',
    name: '⛩️ 타이리쿠쇼토노 오자토 「미나토마치」',
    targetZoneId: 'minatomachi',
    sx: 705,
    sy: 400,
    unlockQuestId: 'main_20',
    desc: '신피타이리쿠 군도의 거대한 섬 도시 구역 「미나토마치」로 항해합니다.'
  }
];

function createWorldZones() {
  return {
    // =========================================================================
    // [1부 구역 1 ~ 12] 집 안 / 포레스트 타운 / 고블린·오크·발록 / 해변길 / 오션블루 타운
    // =========================================================================

    // [필드 1] 집 안 (안전지대 마을 판정 - 어머니 마리아 NPC)
    home_interior: {
      id: 'home_interior',
      name: '🏠 집 안',
      isSafeZone: true,
      isTown: true,
      nearestTownId: 'home_interior',
      bgPrimary: '#23170f',
      bgSecondary: '#2f1f14',
      accentColor: '#fbbf24',
      obstacles: [
        { x: 155, y: 82, w: 72, h: 72, kind: 'furniture_fireplace' },
        { x: 445, y: 82, w: 68, h: 68, kind: 'furniture_bookshelf' },
        { x: 650, y: 86, w: 72, h: 68, kind: 'furniture_bed' },
        { x: 455, y: 294, w: 80, h: 48, kind: 'villa_table' },
        { x: 48, y: 140, w: 34, h: 36, kind: 'potted_plant' },
        { x: 48, y: 495, w: 34, h: 36, kind: 'potted_plant' },
        { x: 768, y: 495, w: 34, h: 36, kind: 'potted_plant' }
      ],
      torches: [
        { x: 140, y: 185 }, { x: 420, y: 185 }, { x: 720, y: 220 }, { x: 720, y: 380 }
      ],
      npcs: [
        {
          id: 'mother_maria', name: '어머니 마리아', sprite: 'npc_mother', x: 310, y: 280,
          questRole: 'mother',
          lines: [
            '어머니 마리아: "언제나 몸 건강히 다녀오렴, 내 아들아. 다치면 집 안이나 마을 안전지대에서 푹 쉬어야 한단다."'
          ]
        }
      ],
      chests: [
        { id: 'c_home1', x: 180, y: 450, opened: false, item: 'potion_hp', gold: 50 }
      ],
      portals: [
        { x: 810, y: 300, r: 38, target: 'emerald_forest', sx: 130, sy: 300, label: '🚪 집 밖으로 나가기' }
      ]
    },

    // [필드 2] 집 앞 (인근 마을: 집 안)
    emerald_forest: {
      id: 'emerald_forest',
      name: '🌿 집 앞',
      isSafeZone: false,
      nearestTownId: 'home_interior',
      bgPrimary: '#0b2216',
      bgSecondary: '#102e1e',
      accentColor: '#4ade80',
      obstacles: [
        { x: 260, y: 90, w: 64, h: 64, kind: 'tree' },
        { x: 380, y: 445, w: 64, h: 64, kind: 'tree' },
        { x: 560, y: 110, w: 64, h: 64, kind: 'tree' }
      ],
      torches: [
        { x: 125, y: 240 }, { x: 775, y: 230 }, { x: 775, y: 370 }
      ],
      npcs: [],
      chests: [
        { id: 'c_f1', x: 290, y: 155, opened: false, item: 'potion_hp', gold: 50 },
        { id: 'c_f2', x: 680, y: 455, opened: false, item: 'guardian_plate', gold: 80 }
      ],
      portals: [
        { x: 80, y: 300, r: 36, target: 'home_interior', sx: 715, sy: 300, label: '⬅ 🏠 집 안' },
        { x: 815, y: 300, r: 38, target: 'forest_town', sx: 130, sy: 300, label: '🛡️ 포레스트 타운 ➔' }
      ]
    },

    // [필드 3] 포레스트 타운 (기타 업데이트: "포레스트 타운 시티" -> "포레스트 타운" 변경)
    forest_town: {
      id: 'forest_town',
      name: '🛡️ 포레스트 타운',
      isSafeZone: true,
      isTown: true,
      nearestTownId: 'forest_town',
      bgPrimary: '#132a1e',
      bgSecondary: '#1b3b2b',
      accentColor: '#34d399',
      obstacles: [
        { x: 200, y: 85, w: 68, h: 68, kind: 'house' },
        { x: 410, y: 85, w: 68, h: 68, kind: 'house' },
        { x: 615, y: 85, w: 68, h: 68, kind: 'house' },
        { x: 415, y: 350, w: 64, h: 64, kind: 'fountain' }
      ],
      torches: [
        { x: 185, y: 175 }, { x: 395, y: 175 }, { x: 600, y: 175 },
        { x: 360, y: 380 }, { x: 535, y: 380 }
      ],
      npcs: [
        {
          id: 'chief_edward', name: '포레스트 타운 촌장', sprite: 'npc_chief', x: 445, y: 225,
          questRole: 'chief',
          lines: [
            '포레스트 타운 촌장: "풍족하고 평화로운 안전지대 포레스트 타운에 오신 것을 환영하오! 이곳은 몬스터가 없으며 체력과 마나가 빠르게 회복된다오."'
          ]
        },
        {
          id: 'lady_elina', name: '아가씨 엘리나', sprite: 'npc_lady', x: 635, y: 255,
          questRole: 'lady',
          lines: [
            '아가씨 엘리나: "포레스트 타운에 다시 평화가 찾아오기를 매일 기도하고 있어요."'
          ]
        },
        {
          id: 'blacksmith_bron', name: '대장장이 브론', sprite: 'npc_blacksmith', x: 245, y: 245,
          questRole: 'blacksmith',
          lines: [
            '대장장이 브론: "강력한 고레벨 몬스터들을 상대하려면 인벤토리에서 좋은 무기와 갑주를 꼭 챙겨 입어야 한다네! 전리품 재료를 가져오면 특별한 장비를 제작하거나 교환해 주지!"'
          ]
        },
        {
          id: 'merchant_lucy', name: '상점 주인 루시', sprite: 'npc_merchant', x: 285, y: 425,
          questRole: 'merchant',
          shopTownId: 'forest_town',
          lines: [
            '상점 주인 루시: "어서 오세요 모험가님! 사냥터에서 인근 마을로 즉시 귀환할 수 있는 인근 마을 워프 주문서와 포레스트 타운 워프석, 물약을 골드로 판매하고 있어요!"'
          ]
        }
      ],
      chests: [
        { id: 'c_ft1', x: 225, y: 465, opened: false, item: 'potion_elixir', gold: 100 }
      ],
      portals: [
        { x: 75, y: 300, r: 36, target: 'emerald_forest', sx: 735, sy: 300, label: '⬅ 🌿 집 앞' },
        { x: 815, y: 155, r: 36, target: 'ancient_ruins', sx: 130, sy: 300, label: '🗡️ 고블린 전초기지 1구역 ➔' },
        { x: 815, y: 345, r: 36, target: 'orc_canyon_1', sx: 130, sy: 300, label: '🪓 오크 전투협곡 1구역 ➔' },
        { x: 445, y: 535, r: 38, target: 'coastal_road_1', sx: 130, sy: 300, label: '🏖️ 해변으로 향하는 길 1 ➔' }
      ]
    },

    // [필드 4] 고블린 전초기지 1구역
    ancient_ruins: {
      id: 'ancient_ruins',
      name: '🗡️ 고블린 전초기지 1구역',
      isSafeZone: false,
      nearestTownId: 'forest_town',
      bgPrimary: '#142013',
      bgSecondary: '#1c2d1a',
      accentColor: '#84cc16',
      obstacles: [
        { x: 265, y: 135, w: 60, h: 60, kind: 'tree' },
        { x: 555, y: 135, w: 60, h: 60, kind: 'pillar' },
        { x: 415, y: 420, w: 60, h: 60, kind: 'tree' }
      ],
      torches: [
        { x: 245, y: 125 }, { x: 535, y: 125 }, { x: 400, y: 405 }
      ],
      npcs: [
        {
          id: 'scout_lyra', name: '자경단 정찰병 라이라', sprite: 'npc_scout', x: 145, y: 170,
          questRole: 'scout',
          lines: [
            '정찰병 라이라: "이곳은 고블린 전초기지 1구역입니다! 동쪽으로 가면 고블린 심층 야영지 2구역이 이어집니다."'
          ]
        }
      ],
      chests: [
        { id: 'c_r1', x: 450, y: 95, opened: false, item: 'iron_blade', gold: 120 }
      ],
      portals: [
        { x: 75, y: 300, r: 38, target: 'forest_town', sx: 735, sy: 165, label: '⬅ 🛡️ 포레스트 타운' },
        { x: 815, y: 300, r: 38, target: 'goblin_depths', sx: 130, sy: 300, label: '🏹 고블린 심층 야영지 2구역 ➔' }
      ]
    },

    // [필드 5] 고블린 심층 야영지 2구역
    goblin_depths: {
      id: 'goblin_depths',
      name: '🏹 고블린 심층 야영지 2구역',
      isSafeZone: false,
      nearestTownId: 'forest_town',
      bgPrimary: '#1a2412',
      bgSecondary: '#243319',
      accentColor: '#a3e635',
      obstacles: [
        { x: 290, y: 160, w: 60, h: 60, kind: 'pillar' },
        { x: 580, y: 380, w: 60, h: 60, kind: 'pillar' }
      ],
      torches: [
        { x: 270, y: 150 }, { x: 560, y: 370 }, { x: 770, y: 220 }
      ],
      npcs: [],
      chests: [
        { id: 'c_gd1', x: 740, y: 295, opened: false, item: 'gyro_boots', gold: 160 }
      ],
      portals: [
        { x: 75, y: 300, r: 38, target: 'ancient_ruins', sx: 735, sy: 300, label: '⬅ 🗡️ 고블린 전초기지 1구역' }
      ]
    },

    // [필드 6] 오크 전투협곡 1구역
    orc_canyon_1: {
      id: 'orc_canyon_1',
      name: '🪓 오크 전투협곡 1구역',
      isSafeZone: false,
      nearestTownId: 'forest_town',
      bgPrimary: '#24140e',
      bgSecondary: '#301b13',
      accentColor: '#fb923c',
      obstacles: [
        { x: 270, y: 145, w: 60, h: 60, kind: 'pillar' },
        { x: 560, y: 145, w: 60, h: 60, kind: 'pillar' },
        { x: 415, y: 410, w: 60, h: 60, kind: 'pillar' }
      ],
      torches: [
        { x: 250, y: 135 }, { x: 540, y: 135 }, { x: 400, y: 395 }
      ],
      npcs: [],
      chests: [
        { id: 'c_oc1', x: 680, y: 505, opened: false, item: 'potion_elixir', gold: 160 }
      ],
      portals: [
        { x: 75, y: 300, r: 38, target: 'forest_town', sx: 735, sy: 345, label: '⬅ 🛡️ 포레스트 타운' },
        { x: 815, y: 300, r: 38, target: 'orc_stronghold_2', sx: 130, sy: 300, label: '🔥 오크 철혈 요새 2구역 ➔' }
      ]
    },

    // [필드 7] 오크 철혈 요새 2구역
    orc_stronghold_2: {
      id: 'orc_stronghold_2',
      name: '🔥 오크 철혈 요새 2구역',
      isSafeZone: false,
      nearestTownId: 'forest_town',
      bgPrimary: '#291010',
      bgSecondary: '#381515',
      accentColor: '#f87171',
      obstacles: [
        { x: 250, y: 130, w: 60, h: 60, kind: 'pillar' },
        { x: 580, y: 130, w: 60, h: 60, kind: 'pillar' },
        { x: 420, y: 410, w: 60, h: 60, kind: 'pillar' }
      ],
      torches: [
        { x: 235, y: 120 }, { x: 565, y: 120 }, { x: 780, y: 230 }, { x: 780, y: 370 }
      ],
      npcs: [],
      chests: [
        { id: 'c_os2', x: 450, y: 95, opened: false, item: 'potion_elixir', gold: 220 }
      ],
      portals: [
        { x: 75, y: 300, r: 38, target: 'orc_canyon_1', sx: 735, sy: 300, label: '⬅ 🪓 오크 전투협곡 1구역' },
        { x: 815, y: 300, r: 38, target: 'abyssal_altar', sx: 130, sy: 300, label: '🐉 발록의 제단 ➔' }
      ]
    },

    // [필드 8] 발록의 제단
    abyssal_altar: {
      id: 'abyssal_altar',
      name: '🐉 발록의 제단',
      isSafeZone: false,
      nearestTownId: 'forest_town',
      bgPrimary: '#21070c',
      bgSecondary: '#2e0a11',
      accentColor: '#f43f5e',
      obstacles: [
        { x: 220, y: 110, w: 60, h: 60, kind: 'pillar' },
        { x: 220, y: 430, w: 60, h: 60, kind: 'pillar' },
        { x: 660, y: 110, w: 60, h: 60, kind: 'pillar' },
        { x: 660, y: 430, w: 60, h: 60, kind: 'pillar' }
      ],
      torches: [
        { x: 205, y: 100 }, { x: 205, y: 420 }, { x: 645, y: 100 }, { x: 645, y: 420 }
      ],
      npcs: [],
      chests: [
        { id: 'c_b1', x: 165, y: 515, opened: false, item: 'potion_elixir', gold: 250 }
      ],
      portals: [
        { x: 75, y: 300, r: 38, target: 'orc_stronghold_2', sx: 735, sy: 300, label: '⬅ 🔥 오크 철혈 요새 2구역' }
      ]
    },

    // [필드 9] 해변으로 향하는 길 1 (기타 업데이트: 해변으로 향하는 길 1~3 모두 포레스트 타운 인근 사냥터로 취급)
    coastal_road_1: {
      id: 'coastal_road_1',
      name: '🏖️ 해변으로 향하는 길 1',
      isSafeZone: false,
      nearestTownId: 'forest_town',
      bgPrimary: '#0c2926',
      bgSecondary: '#113834',
      accentColor: '#2dd4bf',
      obstacles: [
        { x: 250, y: 120, w: 64, h: 64, kind: 'palm_tree' },
        { x: 560, y: 410, w: 64, h: 64, kind: 'palm_tree' }
      ],
      torches: [
        { x: 140, y: 220 }, { x: 760, y: 220 }
      ],
      npcs: [
        {
          id: 'guard_kyle', name: '해안 경비대원 카일', sprite: 'npc_guard_kyle', x: 155, y: 175,
          questRole: 'coastal_guard',
          lines: [
            '해안 경비대원 카일: "이 길은 포레스트 타운에서 오션블루 타운으로 이어지는 해변으로 향하는 길 1구역입니다! 해변길 1·2·3을 차례로 돌파해야 오션블루 타운에 닿을 수 있습니다."'
          ]
        }
      ],
      chests: [
        { id: 'c_cr1', x: 430, y: 110, opened: false, item: 'potion_hp', gold: 130 }
      ],
      portals: [
        { x: 75, y: 300, r: 38, target: 'forest_town', sx: 445, sy: 465, label: '⬅ 🛡️ 포레스트 타운' },
        { x: 815, y: 300, r: 38, target: 'coastal_road_2', sx: 130, sy: 300, label: '🌊 해변으로 향하는 길 2 ➔' }
      ]
    },

    // [필드 10] 해변으로 향하는 길 2 (기타 업데이트: 포레스트 타운 인근 사냥터로 취급)
    coastal_road_2: {
      id: 'coastal_road_2',
      name: '🌊 해변으로 향하는 길 2',
      isSafeZone: false,
      nearestTownId: 'forest_town',
      bgPrimary: '#0a2736',
      bgSecondary: '#0f3549',
      accentColor: '#38bdf8',
      obstacles: [
        { x: 290, y: 140, w: 60, h: 60, kind: 'pillar' },
        { x: 540, y: 390, w: 60, h: 60, kind: 'pillar' }
      ],
      torches: [
        { x: 270, y: 130 }, { x: 520, y: 380 }
      ],
      npcs: [],
      chests: [
        { id: 'c_cr2', x: 450, y: 425, opened: false, item: 'potion_elixir', gold: 180 }
      ],
      portals: [
        { x: 75, y: 300, r: 38, target: 'coastal_road_1', sx: 735, sy: 300, label: '⬅ 🏖️ 해변으로 향하는 길 1' },
        { x: 815, y: 300, r: 38, target: 'coastal_road_3', sx: 130, sy: 300, label: '🐚 해변으로 향하는 길 3 ➔' }
      ]
    },

    // [필드 11] 해변으로 향하는 길 3 (기타 업데이트: 포레스트 타운 인근 사냥터로 취급)
    coastal_road_3: {
      id: 'coastal_road_3',
      name: '🐚 해변으로 향하는 길 3',
      isSafeZone: false,
      nearestTownId: 'forest_town',
      bgPrimary: '#082c44',
      bgSecondary: '#0c3d5e',
      accentColor: '#7dd3fc',
      obstacles: [
        { x: 310, y: 135, w: 60, h: 60, kind: 'pillar' },
        { x: 570, y: 405, w: 60, h: 60, kind: 'pillar' }
      ],
      torches: [
        { x: 290, y: 125 }, { x: 775, y: 230 }, { x: 775, y: 370 }
      ],
      npcs: [],
      chests: [
        { id: 'c_cr3', x: 460, y: 100, opened: false, item: 'potion_elixir', gold: 240 }
      ],
      portals: [
        { x: 75, y: 300, r: 38, target: 'coastal_road_2', sx: 735, sy: 300, label: '⬅ 🌊 해변으로 향하는 길 2' },
        { x: 815, y: 300, r: 38, target: 'oceanblue_town', sx: 130, sy: 300, label: '🌊 오션블루 타운 ➔' }
      ]
    },

    // [필드 12] 오션블루 타운 (안전지대 마을 - 마리나, 세이렌(섬 항해), 상인 코랄, 오른쪽 포털 -> 해적들의 길목 01)
    oceanblue_town: {
      id: 'oceanblue_town',
      name: '🌊 오션블루 타운',
      isSafeZone: true,
      isTown: true,
      nearestTownId: 'oceanblue_town',
      bgPrimary: '#082f49',
      bgSecondary: '#0c4a6e',
      accentColor: '#38bdf8',
      obstacles: [
        { x: 230, y: 105, w: 68, h: 68, kind: 'ocean_house' },
        { x: 520, y: 105, w: 68, h: 68, kind: 'ocean_house' },
        { x: 430, y: 360, w: 64, h: 64, kind: 'ocean_fountain' }
      ],
      torches: [
        { x: 210, y: 195 }, { x: 500, y: 195 }, { x: 380, y: 390 }, { x: 550, y: 390 }
      ],
      npcs: [
        {
          id: 'mayor_marina', name: '오션블루 촌장 마리나', sprite: 'npc_marina', x: 455, y: 245,
          questRole: 'ocean_mayor',
          lines: [
            '오션블루 촌장 마리나: "적이 없는 평화로운 해안 도시 오션블루 타운에 오신 것을 환영합니다!"'
          ]
        },
        {
          id: 'navigator_seiren', name: '항해사 세이렌', sprite: 'npc_navigator', x: 645, y: 315,
          questRole: 'navigator',
          canSail: true,
          lines: [
            '항해사 세이렌: "시원한 바닷바람이 부는 오션블루 타운 항구입니다! 섬 항해가 필요하시면 언제든 말씀해 주세요!"'
          ]
        },
        {
          id: 'merchant_coral', name: '해안 상인 코랄', sprite: 'npc_coral', x: 285, y: 425,
          questRole: 'merchant',
          shopTownId: 'oceanblue_town',
          lines: [
            '해안 상인 코랄: "오션블루 잡화점에 오신 걸 환영해요! 포레스트 타운과 오션블루 타운 워프석, 물약을 골드로 구매해 보세요!"'
          ]
        }
      ],
      chests: [
        { id: 'c_ob1', x: 720, y: 475, opened: false, item: 'abyss_crown', gold: 300 }
      ],
      portals: [
        { x: 75, y: 300, r: 38, target: 'coastal_road_3', sx: 735, sy: 300, label: '⬅ 🐚 해변으로 향하는 길 3' },
        { x: 815, y: 300, r: 38, target: 'pirate_path_1', sx: 130, sy: 300, label: '🏴‍☠️ 해적들의 길목 01 ➔', unlockQuestId: 'main_16', unlockMode: 'active_or_completed' }
      ]
    },

    // =========================================================================
    // [2부 신규 구역 13 ~ 27] v2.0 '푸른 바다를 감싸는 어둠' 신 맵 15개
    // (AI 규칙 3 준수: 맵 이름에 (사냥존 Lv.13~15)나 (안전지대) 같은 괄호 문구를 넣지 않음)
    // =========================================================================

    // [필드 13] 플라워 아일랜드 : 화단길 01 (Lv.13~14 해적 출몰)
    flower_island_1: {
      id: 'flower_island_1',
      name: '🌺 플라워 아일랜드 : 화단길 01',
      isSafeZone: false,
      nearestTownId: 'oceanblue_town',
      bgPrimary: '#133829',
      bgSecondary: '#1b4d38',
      accentColor: '#f472b6',
      obstacles: [
        { x: 245, y: 145, w: 96, h: 52, kind: 'flowerbed' },
        { x: 535, y: 145, w: 96, h: 52, kind: 'flowerbed' },
        { x: 245, y: 370, w: 96, h: 52, kind: 'flowerbed' },
        { x: 535, y: 370, w: 96, h: 52, kind: 'flowerbed' }
      ],
      torches: [
        { x: 150, y: 210 }, { x: 750, y: 210 }
      ],
      npcs: [
        {
          id: 'seiren_flower', name: '항해사 세이렌', sprite: 'npc_navigator', x: 150, y: 185,
          questRole: 'navigator_flower',
          canSail: true,
          lines: [
            '항해사 세이렌: "여기가 아름다운 꽃들이 가득한 플라워 아일랜드입니다! 오션블루 타운이나 다른 섬으로 항해하려면 저에게 말씀해 주세요!"'
          ]
        }
      ],
      chests: [
        { id: 'c_fi1', x: 440, y: 95, opened: false, item: 'pirate_junk', gold: 220 }
      ],
      portals: [
        { x: 815, y: 300, r: 38, target: 'flower_island_2', sx: 130, sy: 300, label: '🌺 플라워 아일랜드 : 화단길 02 ➔' }
      ]
    },

    // [필드 14] 플라워 아일랜드 : 화단길 02 (Lv.14~15 해적 출몰 / 별장 안 연결)
    flower_island_2: {
      id: 'flower_island_2',
      name: '🌺 플라워 아일랜드 : 화단길 02',
      isSafeZone: false,
      nearestTownId: 'oceanblue_town',
      bgPrimary: '#163f2e',
      bgSecondary: '#205740',
      accentColor: '#fb7185',
      obstacles: [
        { x: 225, y: 145, w: 96, h: 52, kind: 'flowerbed' },
        { x: 545, y: 145, w: 96, h: 52, kind: 'flowerbed' },
        { x: 225, y: 370, w: 96, h: 52, kind: 'flowerbed' },
        { x: 545, y: 370, w: 96, h: 52, kind: 'flowerbed' }
      ],
      torches: [
        { x: 270, y: 125 }, { x: 760, y: 230 }
      ],
      npcs: [],
      chests: [
        { id: 'c_fi2', x: 430, y: 395, opened: false, item: 'pirate_cutlass', gold: 280 }
      ],
      portals: [
        { x: 75, y: 300, r: 38, target: 'flower_island_1', sx: 735, sy: 300, label: '⬅ 🌺 플라워 아일랜드 : 화단길 01' },
        { x: 815, y: 300, r: 38, target: 'flower_villa', sx: 140, sy: 300, label: '🏡 플라워 아일랜드 : 별장 안 ➔', unlockQuestId: 'main_8', unlockMode: 'completed' }
      ]
    },

    // [필드 15] 플라워 아일랜드 : 별장 안 (안전지대 / 어린남자 귀신 NPC)
    flower_villa: {
      id: 'flower_villa',
      name: '🏡 플라워 아일랜드 : 별장 안',
      isSafeZone: true,
      nearestTownId: 'oceanblue_town',
      bgPrimary: '#e6ccb2',
      bgSecondary: '#fff8f0',
      accentColor: '#f472b6',
      obstacles: [
        { x: 145, y: 82, w: 72, h: 72, kind: 'furniture_fireplace' },
        { x: 415, y: 82, w: 68, h: 68, kind: 'furniture_bookshelf' },
        { x: 665, y: 84, w: 76, h: 70, kind: 'furniture_bed' },
        { x: 255, y: 315, w: 84, h: 50, kind: 'villa_table' },
        { x: 575, y: 315, w: 84, h: 50, kind: 'flowerbed' },
        { x: 54, y: 145, w: 34, h: 36, kind: 'potted_plant' },
        { x: 805, y: 145, w: 34, h: 36, kind: 'potted_plant' },
        { x: 805, y: 485, w: 34, h: 36, kind: 'potted_plant' }
      ],
      torches: [
        { x: 150, y: 185 }, { x: 430, y: 185 }, { x: 710, y: 220 }
      ],
      npcs: [
        {
          id: 'ghost_boy_zephyr', name: '어린남자 귀신', sprite: 'npc_ghost_boy', x: 450, y: 285,
          questRole: 'ghost_boy',
          hideAfterQuestCompleted: 'main_19',
          lines: [
            '어린남자 귀신: "흑흑흑..... 누가..... 나 좀 도와줘....."'
          ]
        }
      ],
      chests: [
        { id: 'c_fv1', x: 210, y: 465, opened: false, item: 'potion_elixir', gold: 260 }
      ],
      portals: [
        { x: 75, y: 300, r: 38, target: 'flower_island_2', sx: 735, sy: 300, label: '⬅ 🌺 플라워 아일랜드 : 화단길 02' }
      ]
    },

    // [필드 16] 비어 케이브 : 맥주 냄새가 나는 동굴 통로 01 (Lv.16 바이킹 출몰 / 위쪽 포털 -> 에리크의 방)
    beer_cave_1: {
      id: 'beer_cave_1',
      name: '🍺 비어 케이브 : 맥주 냄새가 나는 동굴 통로 01',
      isSafeZone: false,
      nearestTownId: 'oceanblue_town',
      bgPrimary: '#26170c',
      bgSecondary: '#362112',
      accentColor: '#f59e0b',
      obstacles: [
        { x: 280, y: 150, w: 60, h: 60, kind: 'pillar' },
        { x: 580, y: 390, w: 60, h: 60, kind: 'pillar' }
      ],
      torches: [
        { x: 260, y: 140 }, { x: 560, y: 380 }
      ],
      npcs: [
        {
          id: 'seiren_beercave', name: '항해사 세이렌', sprite: 'npc_navigator', x: 135, y: 430,
          questRole: 'navigator_beercave',
          canSail: true,
          lines: [
            '항해사 세이렌: "동굴 안쪽에서 진한 맥주 냄새와 거친 바이킹들의 함성이 들려와요! 마을로 돌아가실 땐 저에게 말씀해 주세요!"'
          ]
        },
        {
          id: 'erik_npc', name: '에리크', sprite: 'npc_erik', x: 215, y: 185,
          questRole: 'viking_erik',
          lines: [
            '에리크: "이곳은 신성한 바이킹 부족이 관리하는 비어 케이브다! 약한 자는 발을 들일 수 없다!"'
          ]
        }
      ],
      chests: [
        { id: 'c_bc1', x: 460, y: 495, opened: false, item: 'potion_elixir', gold: 320 }
      ],
      portals: [
        { x: 450, y: 75, r: 38, target: 'erik_room', sx: 450, sy: 435, label: '⬆️ 🪓 에리크의 방', unlockQuestId: 'main_14', unlockMode: 'active_or_completed' },
        { x: 815, y: 300, r: 38, target: 'beer_cave_2', sx: 130, sy: 300, label: '🍺 맥주 냄새가 나는 동굴 통로 02 ➔' }
      ]
    },

    // [필드 17] 비어 케이브 : 맥주 냄새가 나는 동굴 통로 02 (Lv.17 바이킹 출몰)
    beer_cave_2: {
      id: 'beer_cave_2',
      name: '🍺 비어 케이브 : 맥주 냄새가 나는 동굴 통로 02',
      isSafeZone: false,
      nearestTownId: 'oceanblue_town',
      bgPrimary: '#29180b',
      bgSecondary: '#3b2310',
      accentColor: '#fbbf24',
      obstacles: [
        { x: 270, y: 140, w: 60, h: 60, kind: 'pillar' },
        { x: 560, y: 140, w: 60, h: 60, kind: 'pillar' },
        { x: 420, y: 415, w: 60, h: 60, kind: 'pillar' }
      ],
      torches: [
        { x: 250, y: 130 }, { x: 540, y: 130 }, { x: 400, y: 400 }
      ],
      npcs: [],
      chests: [
        { id: 'c_bc2', x: 450, y: 95, opened: false, item: 'viking_armor', gold: 360 }
      ],
      portals: [
        { x: 75, y: 300, r: 38, target: 'beer_cave_1', sx: 735, sy: 300, label: '⬅ 🍺 맥주 냄새가 나는 동굴 통로 01' },
        { x: 815, y: 300, r: 38, target: 'beer_cave_3', sx: 130, sy: 300, label: '🍺 맥주 냄새가 나는 동굴 통로 03 ➔' }
      ]
    },

    // [필드 18] 비어 케이브 : 맥주 냄새가 나는 동굴 통로 03 (Lv.18 바이킹 출몰 / 오른쪽 포털 -> 바이킹의 황제 라그나르의 방)
    beer_cave_3: {
      id: 'beer_cave_3',
      name: '🍺 비어 케이브 : 맥주 냄새가 나는 동굴 통로 03',
      isSafeZone: false,
      nearestTownId: 'oceanblue_town',
      bgPrimary: '#2d190a',
      bgSecondary: '#40240f',
      accentColor: '#f97316',
      obstacles: [
        { x: 300, y: 135, w: 60, h: 60, kind: 'pillar' },
        { x: 575, y: 405, w: 60, h: 60, kind: 'pillar' }
      ],
      torches: [
        { x: 280, y: 125 }, { x: 765, y: 225 }
      ],
      npcs: [],
      chests: [
        { id: 'c_bc3', x: 460, y: 500, opened: false, item: 'viking_battleaxe', gold: 400 }
      ],
      portals: [
        { x: 75, y: 300, r: 38, target: 'beer_cave_2', sx: 735, sy: 300, label: '⬅ 🍺 맥주 냄새가 나는 동굴 통로 02' },
        { x: 815, y: 300, r: 38, target: 'ragnar_room', sx: 140, sy: 300, label: '👑 바이킹의 황제 라그나르의 방 ➔', unlockQuestId: 'main_14', unlockMode: 'completed' }
      ]
    },

    // [필드 19] 에리크의 방 (Lv.19 보스: 붉은 바이킹 전사 에리크)
    erik_room: {
      id: 'erik_room',
      name: '🪓 에리크의 방',
      isSafeZone: false,
      nearestTownId: 'oceanblue_town',
      bgPrimary: '#2b0d0d',
      bgSecondary: '#3d1212',
      accentColor: '#ef4444',
      obstacles: [
        { x: 210, y: 110, w: 60, h: 60, kind: 'pillar' },
        { x: 660, y: 110, w: 60, h: 60, kind: 'pillar' }
      ],
      torches: [
        { x: 195, y: 100 }, { x: 645, y: 100 }, { x: 195, y: 440 }, { x: 645, y: 440 }
      ],
      npcs: [],
      chests: [
        { id: 'c_er1', x: 170, y: 505, opened: false, item: 'potion_elixir', gold: 450 }
      ],
      portals: [
        { x: 450, y: 535, r: 38, target: 'beer_cave_1', sx: 450, sy: 165, label: '⬇️ 🍺 맥주 냄새가 나는 동굴 통로 01' }
      ]
    },

    // [필드 20] 바이킹의 황제 라그나르의 방 (안전지대 / 라그나르 NPC)
    ragnar_room: {
      id: 'ragnar_room',
      name: '👑 바이킹의 황제 라그나르의 방',
      isSafeZone: true,
      nearestTownId: 'oceanblue_town',
      bgPrimary: '#291d12',
      bgSecondary: '#3b2a1a',
      accentColor: '#fbbf24',
      obstacles: [
        { x: 250, y: 100, w: 64, h: 64, kind: 'pillar' },
        { x: 590, y: 100, w: 64, h: 64, kind: 'pillar' }
      ],
      torches: [
        { x: 235, y: 185 }, { x: 575, y: 185 }, { x: 360, y: 390 }, { x: 540, y: 390 }
      ],
      npcs: [
        {
          id: 'emperor_ragnar', name: '라그나르', sprite: 'npc_ragnar', x: 455, y: 240,
          questRole: 'viking_emperor',
          lines: [
            '라그나르: "허허..... 바이킹의 긍지를 아는 용사여, 우리 바이킹 부족은 언제나 자네의 든든한 동맹일세!"'
          ]
        }
      ],
      chests: [
        { id: 'c_rg1', x: 700, y: 460, opened: false, item: 'viking_horn_ring', gold: 500 }
      ],
      portals: [
        { x: 75, y: 300, r: 38, target: 'beer_cave_3', sx: 735, sy: 300, label: '⬅ 🍺 맥주 냄새가 나는 동굴 통로 03' }
      ]
    },

    // [필드 21] 해적들의 길목 01 (Lv.19~20 검은 로브의 수상한 자들 4종 출몰 / 바이킹 니콜라스 NPC)
    pirate_path_1: {
      id: 'pirate_path_1',
      name: '🏴‍☠️ 해적들의 길목 01',
      isSafeZone: false,
      nearestTownId: 'oceanblue_town',
      bgPrimary: '#111827',
      bgSecondary: '#1f2937',
      accentColor: '#a855f7',
      obstacles: [
        { x: 280, y: 130, w: 60, h: 60, kind: 'pillar' },
        { x: 560, y: 400, w: 60, h: 60, kind: 'pillar' }
      ],
      torches: [
        { x: 260, y: 120 }, { x: 540, y: 390 }
      ],
      npcs: [
        {
          id: 'viking_nicholas', name: '니콜라스', sprite: 'npc_nicholas', x: 155, y: 185,
          questRole: 'viking_ally',
          lines: [
            '니콜라스: "오! 왔는가! 검은 로브를 뒤집어쓴 수상한 자들이 해적들의 뒤를 봐주고 있었네!"'
          ]
        }
      ],
      chests: [
        { id: 'c_pp1', x: 450, y: 95, opened: false, item: 'suspicious_rock', gold: 420 }
      ],
      portals: [
        { x: 75, y: 300, r: 38, target: 'oceanblue_town', sx: 735, sy: 300, label: '⬅ 🌊 오션블루 타운' },
        { x: 815, y: 300, r: 38, target: 'pirate_path_2', sx: 130, sy: 300, label: '🏴‍☠️ 해적들의 길목 02 ➔' }
      ]
    },

    // [필드 22] 해적들의 길목 02 (Lv.20~21 검은 로브의 수상한 자들 출몰 / 해적의 대형 선박 내부 01 연결)
    pirate_path_2: {
      id: 'pirate_path_2',
      name: '🏴‍☠️ 해적들의 길목 02',
      isSafeZone: false,
      nearestTownId: 'oceanblue_town',
      bgPrimary: '#0f172a',
      bgSecondary: '#1e293b',
      accentColor: '#c084fc',
      obstacles: [
        { x: 295, y: 145, w: 60, h: 60, kind: 'pillar' },
        { x: 575, y: 395, w: 60, h: 60, kind: 'pillar' }
      ],
      torches: [
        { x: 275, y: 135 }, { x: 760, y: 230 }
      ],
      npcs: [],
      chests: [
        { id: 'c_pp2', x: 460, y: 500, opened: false, item: 'suspicious_rock', gold: 460 }
      ],
      portals: [
        { x: 75, y: 300, r: 38, target: 'pirate_path_1', sx: 735, sy: 300, label: '⬅ 🏴‍☠️ 해적들의 길목 01' },
        { x: 815, y: 300, r: 38, target: 'pirate_ship_1', sx: 130, sy: 300, label: '🚢 해적의 대형 선박 내부 01 ➔', unlockQuestId: 'main_16', unlockMode: 'completed' }
      ]
    },

    // [필드 23] 해적의 대형 선박 내부 01 (Lv.22~23 상급 해적 4종 출몰 / 병사 탈라사 NPC)
    pirate_ship_1: {
      id: 'pirate_ship_1',
      name: '🚢 해적의 대형 선박 내부 01',
      isSafeZone: false,
      nearestTownId: 'oceanblue_town',
      bgPrimary: '#2b180e',
      bgSecondary: '#4e2e1b',
      accentColor: '#38bdf8',
      obstacles: [
        { x: 280, y: 135, w: 64, h: 64, kind: 'ship_mast_pillar' },
        { x: 560, y: 395, w: 64, h: 64, kind: 'ship_barrel_crate' }
      ],
      torches: [
        { x: 260, y: 125 }, { x: 540, y: 385 }
      ],
      npcs: [
        {
          id: 'soldier_thalassa', name: '탈라사', sprite: 'npc_thalassa', x: 155, y: 180,
          questRole: 'ocean_soldier',
          lines: [
            '탈라사: "안녕하세요 용사님! 저는 오션블루 타운의 병사 탈라사입니다! 이 선박 가장 깊은 곳에 해적 여왕 세라피리아의 집무실이 있습니다!"'
          ]
        }
      ],
      chests: [
        { id: 'c_ps1', x: 450, y: 115, opened: false, item: 'pirate_coat', gold: 520 }
      ],
      portals: [
        { x: 75, y: 300, r: 38, target: 'pirate_path_2', sx: 735, sy: 300, label: '⬅ 🏴‍☠️ 해적들의 길목 02' },
        { x: 815, y: 300, r: 38, target: 'pirate_ship_2', sx: 130, sy: 300, label: '🚢 해적의 대형 선박 내부 02 ➔' }
      ]
    },

    // [필드 24] 해적의 대형 선박 내부 02 (Lv.23~24 상급 해적 출몰 / 해적 여왕의 집무실 연결)
    pirate_ship_2: {
      id: 'pirate_ship_2',
      name: '🚢 해적의 대형 선박 내부 02',
      isSafeZone: false,
      nearestTownId: 'oceanblue_town',
      bgPrimary: '#2b180e',
      bgSecondary: '#4e2e1b',
      accentColor: '#0ea5e9',
      obstacles: [
        { x: 290, y: 140, w: 64, h: 64, kind: 'ship_barrel_crate' },
        { x: 575, y: 390, w: 64, h: 64, kind: 'ship_mast_pillar' }
      ],
      torches: [
        { x: 270, y: 130 }, { x: 760, y: 230 }
      ],
      npcs: [],
      chests: [
        { id: 'c_ps2', x: 460, y: 485, opened: false, item: 'pirate_compass', gold: 580 }
      ],
      portals: [
        { x: 75, y: 300, r: 38, target: 'pirate_ship_1', sx: 735, sy: 300, label: '⬅ 🚢 해적의 대형 선박 내부 01' },
        { x: 815, y: 300, r: 38, target: 'pirate_queen_office', sx: 140, sy: 300, label: '👑 해적 여왕의 집무실 ➔', unlockQuestId: 'main_17', unlockMode: 'completed' }
      ]
    },

    // [필드 25] 해적 여왕의 집무실 (안전지대 / 세라피리아 NPC / 오른쪽 포털 -> vs 해적 여왕)
    pirate_queen_office: {
      id: 'pirate_queen_office',
      name: '👑 해적 여왕의 집무실',
      isSafeZone: true,
      nearestTownId: 'oceanblue_town',
      bgPrimary: '#2d101e',
      bgSecondary: '#4c1d34',
      accentColor: '#f43f5e',
      obstacles: [
        { x: 220, y: 92, w: 68, h: 68, kind: 'furniture_bookshelf' },
        { x: 610, y: 92, w: 72, h: 68, kind: 'furniture_bed' },
        { x: 135, y: 435, w: 60, h: 60, kind: 'ship_barrel_crate' },
        { x: 705, y: 435, w: 60, h: 60, kind: 'ship_barrel_crate' }
      ],
      torches: [
        { x: 200, y: 185 }, { x: 600, y: 185 }, { x: 350, y: 390 }, { x: 550, y: 390 }
      ],
      npcs: [
        {
          id: 'queen_seraphiria_npc', name: '세라피리아', sprite: 'npc_seraphiria', x: 455, y: 245,
          questRole: 'pirate_queen',
          lines: [
            '세라피리아: "어머..... 내 방에 한 귀염둥이가 왔네...? 각오하는 게 좋을 거란다? 이 누나는 호락호락하지 않거든....."'
          ]
        }
      ],
      chests: [
        { id: 'c_pqo1', x: 450, y: 485, opened: false, item: 'potion_elixir', gold: 650 }
      ],
      portals: [
        { x: 75, y: 300, r: 38, target: 'pirate_ship_2', sx: 735, sy: 300, label: '⬅ 🚢 해적의 대형 선박 내부 02' },
        { x: 815, y: 300, r: 38, target: 'vs_pirate_queen', sx: 140, sy: 300, label: '⚔️ vs 해적 여왕 ➔', unlockQuestId: 'main_18', unlockMode: 'active_or_completed' }
      ]
    },

    // [필드 26] vs 해적 여왕 (Lv.27 보스: 해적들의 여왕 『해왕』 세라피리아 더 파이럿)
    vs_pirate_queen: {
      id: 'vs_pirate_queen',
      name: '⚔️ vs 해적 여왕',
      isSafeZone: false,
      nearestTownId: 'oceanblue_town',
      bgPrimary: '#2d101e',
      bgSecondary: '#4c1d34',
      accentColor: '#ec4899',
      obstacles: [
        { x: 220, y: 110, w: 60, h: 60, kind: 'ship_mast_pillar' },
        { x: 220, y: 430, w: 60, h: 60, kind: 'ship_barrel_crate' },
        { x: 660, y: 110, w: 60, h: 60, kind: 'ship_mast_pillar' },
        { x: 660, y: 430, w: 60, h: 60, kind: 'ship_barrel_crate' }
      ],
      torches: [
        { x: 205, y: 100 }, { x: 205, y: 420 }, { x: 645, y: 100 }, { x: 645, y: 420 }
      ],
      npcs: [],
      chests: [
        { id: 'c_vpq1', x: 165, y: 495, opened: false, item: 'potion_elixir', gold: 800 }
      ],
      portals: [
        { x: 75, y: 300, r: 38, target: 'pirate_queen_office', sx: 735, sy: 300, label: '⬅ 👑 해적 여왕의 집무실' }
      ]
    },

    // [필드 27] 신피타이리쿠 군도 — 타이리쿠쇼토노 오자토 「미나토마치」 (안전지대 / 밝은 일본풍 에도시대 항구 마을)
    minatomachi: {
      id: 'minatomachi',
      name: '⛩️ 타이리쿠쇼토노 오자토 「미나토마치」',
      isSafeZone: true,
      isTown: true,
      nearestTownId: 'minatomachi',
      bgPrimary: '#e2ceb0',
      bgSecondary: '#f3e5ab',
      accentColor: '#f43f5e',
      obstacles: [
        { x: 210, y: 92, w: 72, h: 72, kind: 'edo_machiya' },
        { x: 540, y: 92, w: 72, h: 72, kind: 'edo_machiya' },
        { x: 424, y: 155, w: 68, h: 68, kind: 'edo_torii' }
      ],
      torches: [
        { x: 195, y: 185 }, { x: 525, y: 185 }, { x: 375, y: 355 }, { x: 545, y: 355 }
      ],
      npcs: [
        {
          id: 'kirishima_npc', name: '키리시마', sprite: 'npc_kirishima', x: 458, y: 265,
          questRole: 'minatomachi_watcher',
          lines: [
            '키리시마: "음? 당신은 누구...? 아..... 여행자였군..... 하필 이 시국에 오다니... 구역 안에선 눈쇼핑 좀 하고 있으라고."'
          ]
        },
        {
          id: 'navigator_minato', name: '나나미', sprite: 'npc_navigator', x: 675, y: 325,
          questRole: 'navigator_minato',
          canSail: true,
          lines: [
            '나나미: "타이리쿠쇼토노 오자토의 항구 구역 「미나토마치」에 오신 것을 환영합니다! 저는 이곳의 항해사 나나미예요. 오션블루 타운으로 항해하시려면 말씀해 주세요!"'
          ]
        },
        {
          id: 'merchant_minato', name: '미나토마치 상인 호타루', sprite: 'npc_merchant', x: 265, y: 335,
          questRole: 'merchant',
          shopTownId: 'minatomachi',
          lines: [
            '미나토마치 상인 호타루: "신피타이리쿠 군도 「미나토마치」 상점에 오신 걸 환영합니다! 포레스트 타운, 오션블루 타운, 「미나토마치」 워프석과 비약을 모두 취급하고 있어요!"'
          ]
        }
      ],
      chests: [
        { id: 'c_mm1', x: 705, y: 465, opened: false, item: 'potion_elixir', gold: 1000 }
      ],
      portals: []
    }
  };
}
