// ============================================================================
// [data/items.js] 신비의 대륙 v2.0 — 클래스, 아이템(세트/고유 장비·재료·워프석), 마을별 상점 & 제작/교환 DB
// - AI 규칙 1 준수: 인게임 출력 설명(desc)에 대괄호([]) 문장을 넣지 않음
// - AI 규칙 2 준수: 신규 해적/바이킹 세트 및 보스 고유 장비를 기존 장비 대비 밸런스 있게 설계 및 명명
// - 기타 업데이트 반영: 마을 상점에서 다음 마을의 워프석은 판매하지 않도록 마을별 상점 카탈로그 분리
// ============================================================================

// [플레이어 3대 직업 기본 능력치 정의]
const CLASSES = {
  knight: { name: '가디언 나이트', hp: 240, mp: 90,  atk: 30, def: 14, spd: 205, crit: 0.18, color: '#38bdf8' },
  mage:   { name: '아케인 메이지', hp: 165, mp: 190, atk: 24, def: 7,  spd: 195, crit: 0.25, color: '#c084fc' },
  ranger: { name: '윈드 레인저',   hp: 190, mp: 125, atk: 27, def: 9,  spd: 245, crit: 0.35, color: '#4ade80' }
};

// [세트 효과 상수 정의]
const EQUIPMENT_SETS = {
  pirate: {
    id: 'pirate',
    name: '해적 세트',
    requiredCount: 3,
    procChance: 0.08,
    cooldownSec: 10.0,
    bulletCount: 10,
    desc: '3세트 효과: 공격 시 8% 확률로 원형 파도 탄환 다수 발사 (재사용 대기시간 10초)'
  },
  viking: {
    id: 'viking',
    name: '바이킹 세트',
    requiredCount: 3,
    atkMult: 1.20,
    defMult: 0.70,
    superArmorOnAttack: true,
    desc: '3세트 효과: 방어력이 30% 감소하는 대신 최종 공격력 20% 증가 및 공격 모션 중 피격 경직 무시(슈퍼 아머)'
  }
};

// [게임 내 전체 아이템 도감]
const ITEMS = {
  // 1. 워프 주문서 & 마을별 귀환 워프석
  warp_nearest_town: {
    id: 'warp_nearest_town',
    name: '📜 인근 마을 워프 주문서',
    type: 'warp',
    warpTarget: 'nearest',
    price: 100,
    desc: '사용 시 현재 위치에서 가장 가까운 안전지대 마을(집 안 포함)로 즉시 텔레포트합니다.'
  },
  warp_forest_town: {
    id: 'warp_forest_town',
    name: '🌲 포레스트 타운 워프석',
    type: 'warp',
    warpTarget: 'forest_town',
    price: 150,
    desc: '사용 시 안전지대 포레스트 타운으로 즉시 텔레포트합니다.'
  },
  warp_oceanblue_town: {
    id: 'warp_oceanblue_town',
    name: '🌊 오션블루 타운 워프석',
    type: 'warp',
    warpTarget: 'oceanblue_town',
    price: 250,
    desc: '사용 시 안전지대 오션블루 타운으로 즉시 텔레포트합니다.'
  },
  warp_minatomachi: {
    id: 'warp_minatomachi',
    name: '⛩️ 미나토마치 워프석',
    type: 'warp',
    warpTarget: 'minatomachi',
    price: 400,
    desc: '사용 시 신피타이리쿠 군도의 안전지대 타이리쿠쇼토노 오자토 「미나토마치」로 즉시 텔레포트합니다.'
  },

  // 2. 회복 소비 아이템
  potion_hp: {
    id: 'potion_hp',
    name: '생명의 비약',
    type: 'consumable',
    healHp: 95,
    healMp: 0,
    price: 80,
    desc: '체력을 즉시 95 회복합니다.'
  },
  potion_elixir: {
    id: 'potion_elixir',
    name: '고대 엘릭서',
    type: 'consumable',
    healHp: 200,
    healMp: 120,
    price: 200,
    desc: '체력 200, 마나 120을 회복합니다.'
  },

  // 3. 기존 1~6장 장비 아이템 (Lv.1 ~ Lv.12 구간)
  iron_blade: {
    id: 'iron_blade',
    name: '룬 강철검',
    type: 'weapon',
    atk: 14,
    crit: 0.06,
    price: 300,
    desc: '공격력 +14, 치명타율 +6%'
  },
  mithril_sword: {
    id: 'mithril_sword',
    name: '성기사단 미스릴 대검',
    type: 'weapon',
    atk: 26,
    crit: 0.09,
    price: 600,
    desc: '공격력 +26, 치명타율 +9%'
  },
  guardian_plate: {
    id: 'guardian_plate',
    name: '수호자의 갑주',
    type: 'armor',
    def: 10,
    hp: 75,
    price: 350,
    desc: '방어력 +10, 최대 체력 +75'
  },
  dragonscale_armor: {
    id: 'dragonscale_armor',
    name: '용비늘 수호 갑주',
    type: 'armor',
    def: 18,
    hp: 140,
    price: 750,
    desc: '방어력 +18, 최대 체력 +140'
  },
  gyro_boots: {
    id: 'gyro_boots',
    name: '질풍의 자이로 각반',
    type: 'accessory',
    spd: 38,
    crit: 0.10,
    price: 500,
    desc: '이동속도 +38, 치명타율 +10%'
  },
  abyss_crown: {
    id: 'abyss_crown',
    name: '심연 군주의 왕관',
    type: 'accessory',
    atk: 32,
    hp: 120,
    crit: 0.15,
    price: 1200,
    desc: '공격력 +32, 최대 체력 +120, 치명타율 +15%'
  },

  // 4. 신규 v2.0 해적 세트 장비 (Lv.13~24 구간 / 3세트 착용 시 8% 확률 원형 탄막 발사, 쿨타임 10초)
  pirate_cutlass: {
    id: 'pirate_cutlass',
    name: '칠해 약탈자의 커틀러스',
    type: 'weapon',
    setKey: 'pirate',
    atk: 38,
    crit: 0.12,
    price: 1100,
    desc: '공격력 +38, 치명타율 +12% (해적 세트 무기: 3세트 착용 시 공격마다 8% 확률로 원형 투사체 발사, 재사용 대기시간 10초)'
  },
  pirate_coat: {
    id: 'pirate_coat',
    name: '검은 파도 선장의 코트',
    type: 'armor',
    setKey: 'pirate',
    def: 24,
    hp: 190,
    price: 1150,
    desc: '방어력 +24, 최대 체력 +190 (해적 세트 방어구: 3세트 착용 시 공격마다 8% 확률로 원형 투사체 발사, 재사용 대기시간 10초)'
  },
  pirate_compass: {
    id: 'pirate_compass',
    name: '심해 해적단의 해골 나침반',
    type: 'accessory',
    setKey: 'pirate',
    atk: 20,
    spd: 28,
    crit: 0.12,
    price: 1050,
    desc: '공격력 +20, 이동속도 +28, 치명타율 +12% (해적 세트 장신구: 3세트 착용 시 공격마다 8% 확률로 원형 투사체 발사, 재사용 대기시간 10초)'
  },

  // 5. 신규 v2.0 바이킹 세트 장비 (Lv.16~19 구간 / 3세트 착용 시 방어력 -30%, 공격력 +20%, 공격 중 슈퍼 아머)
  viking_battleaxe: {
    id: 'viking_battleaxe',
    name: '발할라 광전사의 전투도끼',
    type: 'weapon',
    setKey: 'viking',
    atk: 48,
    crit: 0.14,
    price: 1500,
    desc: '공격력 +48, 치명타율 +14% (바이킹 세트 무기: 3세트 착용 시 방어력 30% 감소·공격력 20% 증가 및 공격 중 피격 경직 무시)'
  },
  viking_armor: {
    id: 'viking_armor',
    name: '서리늑대 전사의 중갑',
    type: 'armor',
    setKey: 'viking',
    def: 30,
    hp: 240,
    price: 1550,
    desc: '방어력 +30, 최대 체력 +240 (바이킹 세트 방어구: 3세트 착용 시 방어력 30% 감소·공격력 20% 증가 및 공격 중 피격 경직 무시)'
  },
  viking_horn_ring: {
    id: 'viking_horn_ring',
    name: '북해 투사의 뿔 반지',
    type: 'accessory',
    setKey: 'viking',
    atk: 30,
    hp: 110,
    crit: 0.12,
    price: 1450,
    desc: '공격력 +30, 최대 체력 +110, 치명타율 +12% (바이킹 세트 장신구: 3세트 착용 시 방어력 30% 감소·공격력 20% 증가 및 공격 중 피격 경직 무시)'
  },

  // 6. 신규 v2.0 특수 장신구 & 보스 고유 장비 (에리크 / 세라피리아)
  suspicious_pendant: {
    id: 'suspicious_pendant',
    name: '수상한 펜던트',
    type: 'accessory',
    def: 15,
    hp: 150,
    spd: 24,
    evadeBaseChance: 0.10,
    evadePenaltyPerLvDiff: 0.02,
    price: 1650,
    desc: '방어력 +15, 최대 체력 +150, 이동속도 +24 (보스를 제외한 일반 몬스터 공격을 10% 확률로 회피하며 몬스터와의 레벨 차이 1당 회피 확률 2% 감소)'
  },
  erik_red_leather_armor: {
    id: 'erik_red_leather_armor',
    name: '에리크의 붉은 가죽 갑옷',
    type: 'armor',
    setKey: 'viking',
    def: 36,
    hp: 290,
    atk: 16,
    spdPerTenBaseAtkPct: 0.01,
    maxSpdBonusPct: 0.50,
    price: 2400,
    desc: '방어력 +36, 최대 체력 +290, 공격력 +16 (바이킹 세트 방어구 취급 / 기본 공격력 10당 이동속도 1% 증가, 최대 50% 제한)'
  },
  sea_king_sword: {
    id: 'sea_king_sword',
    name: '해왕의 검',
    type: 'weapon',
    setKey: 'pirate',
    atk: 68,
    crit: 0.18,
    bonusExpGoldMult: 0.20,
    waveSplashAttack: true,
    price: 3500,
    desc: '공격력 +68, 치명타율 +18% (해적 세트 무기 취급 / 장착 중 몬스터 처치 시 경험치·골드 획득량 +20% 증가 및 일반 공격 시 물결 이펙트와 파편 추가 타격 발동)'
  },

  // 7. 일반 아이템(제작/교환 재료) 및 중요 아이템(메인 퀘스트 핵심 아이템)
  broken_goblin_weapon: {
    id: 'broken_goblin_weapon',
    name: '고블린의 부서진 무기',
    type: 'quest',
    invCategory: 'important',
    desc: '마을 자경단 무장을 위해 포레스트 타운 촌장이 요청한 부서진 무기입니다.'
  },
  pirate_junk: {
    id: 'pirate_junk',
    name: '해적 잡동사니',
    type: 'material',
    invCategory: 'general',
    desc: '플라워 아일랜드와 해적 선박 내부의 해적들에게서 얻을 수 있는 재료입니다. 10개를 모으면 해적 세트 장비를 제작할 수 있습니다.'
  },
  suspicious_rock: {
    id: 'suspicious_rock',
    name: '수상한 암석',
    type: 'material',
    invCategory: 'general',
    desc: '해적들의 길목에 출몰하는 검은 로브의 수상한 자들에게서 얻을 수 있는 암석입니다. 10개를 모으면 수상한 펜던트를 제작할 수 있습니다.'
  },
  erik_red_beard: {
    id: 'erik_red_beard',
    name: '에리크의 붉은 수염',
    type: 'material',
    invCategory: 'general',
    desc: '붉은 바이킹 전사 에리크에게서 얻을 수 있는 전리품입니다. 3개를 모으면 대장간에서 에리크의 붉은 가죽 갑옷으로 교환할 수 있습니다.'
  },
  seraphiria_emblem: {
    id: 'seraphiria_emblem',
    name: '세라피리아의 증표',
    type: 'material',
    invCategory: 'general',
    desc: '해적 여왕 세라피리아에게서 얻을 수 있는 여왕의 증표입니다. 3개를 모으면 대장간에서 해왕의 검으로 교환할 수 있습니다.'
  },
  important_photo: {
    id: 'important_photo',
    name: '중요한 사진',
    type: 'quest',
    invCategory: 'important',
    desc: '플라워 아일랜드 별장 안의 어린남자 귀신이 애타게 찾고 있는 누나의 사진입니다.'
  },
  office_key: {
    id: 'office_key',
    name: '집무실 열쇠',
    type: 'quest',
    invCategory: 'important',
    desc: '해적의 대형 선박 내부 상급 해적들이 소지하고 있던 해적 여왕의 집무실 열쇠입니다.'
  },
  zephyr_ring: {
    id: 'zephyr_ring',
    name: '제피르의 반지',
    type: 'quest',
    invCategory: 'important',
    desc: '오션블루 타운의 촌장 마리나가 남동생 제피르에게 주었던 소중한 유품 반지입니다.'
  }
};

// [마을별 상점 판매 목록]
// 규칙: 마을 상점에서 다음 마을의 워프석은 판매하지 않음
// - 포레스트 타운: 포레스트 타운 워프석만 판매
// - 오션블루 타운: 포레스트 타운 워프석, 오션블루 타운 워프석 판매
// - 타이리쿠쇼토노 오자토 「미나토마치」: 포레스트 타운, 오션블루 타운, 미나토마치 워프석 모두 판매
const SHOP_CATALOG_BY_TOWN = {
  forest_town: [
    'warp_nearest_town',
    'warp_forest_town',
    'potion_hp',
    'potion_elixir',
    'mithril_sword',
    'dragonscale_armor'
  ],
  oceanblue_town: [
    'warp_nearest_town',
    'warp_forest_town',
    'warp_oceanblue_town',
    'potion_hp',
    'potion_elixir',
    'mithril_sword',
    'dragonscale_armor'
  ],
  minatomachi: [
    'warp_nearest_town',
    'warp_forest_town',
    'warp_oceanblue_town',
    'warp_minatomachi',
    'potion_hp',
    'potion_elixir',
    'mithril_sword',
    'dragonscale_armor'
  ]
};

// 기본 상점 카탈로그 (포레스트 타운 기본값, getShopCatalogForZone 함수로 현재 마을에 맞게 조회)
const SHOP_CATALOG = SHOP_CATALOG_BY_TOWN.forest_town;

function getShopCatalogForZone(zoneId) {
  if (zoneId === 'minatomachi') return SHOP_CATALOG_BY_TOWN.minatomachi;
  if (zoneId === 'oceanblue_town') return SHOP_CATALOG_BY_TOWN.oceanblue_town;
  return SHOP_CATALOG_BY_TOWN.forest_town;
}

// [대장간 제작 및 보스 전리품 교환 레시피 목록]
const CRAFT_RECIPES = [
  {
    id: 'craft_pirate_cutlass',
    resultItemId: 'pirate_cutlass',
    materialItemId: 'pirate_junk',
    materialCount: 10,
    category: 'craft',
    desc: '해적 잡동사니 10개로 칠해 약탈자의 커틀러스(해적 세트 무기)를 제작합니다.'
  },
  {
    id: 'craft_pirate_coat',
    resultItemId: 'pirate_coat',
    materialItemId: 'pirate_junk',
    materialCount: 10,
    category: 'craft',
    desc: '해적 잡동사니 10개로 검은 파도 선장의 코트(해적 세트 방어구)를 제작합니다.'
  },
  {
    id: 'craft_pirate_compass',
    resultItemId: 'pirate_compass',
    materialItemId: 'pirate_junk',
    materialCount: 10,
    category: 'craft',
    desc: '해적 잡동사니 10개로 심해 해적단의 해골 나침반(해적 세트 장신구)을 제작합니다.'
  },
  {
    id: 'craft_suspicious_pendant',
    resultItemId: 'suspicious_pendant',
    materialItemId: 'suspicious_rock',
    materialCount: 10,
    category: 'craft',
    desc: '수상한 암석 10개로 수상한 펜던트(일반 몬스터 공격 회피 장신구)를 제작합니다.'
  },
  {
    id: 'exchange_erik_armor',
    resultItemId: 'erik_red_leather_armor',
    materialItemId: 'erik_red_beard',
    materialCount: 3,
    category: 'exchange',
    desc: '에리크의 붉은 수염 3개로 에리크의 붉은 가죽 갑옷(보스 고유 방어구)을 교환합니다.'
  },
  {
    id: 'exchange_sea_king_sword',
    resultItemId: 'sea_king_sword',
    materialItemId: 'seraphiria_emblem',
    materialCount: 3,
    category: 'exchange',
    desc: '세라피리아의 증표 3개로 해왕의 검(보스 고유 무기)을 교환합니다.'
  }
];
