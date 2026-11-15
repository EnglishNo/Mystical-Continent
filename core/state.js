const SLOTS_STORAGE_KEY = 'aetherblade64_char_slots_v1';
// ============================================================================
// 4. 게임 상태 & 세이브 호환 상태 관리 시스템 (v2.0 확장 포함)
// ============================================================================
const STORAGE_KEY = 'aetherblade64_rpi4_save_v1';

// 스킬 및 플레이어 최대 레벨 상수 (v2.0: 플레이어 만렙 Lv.30 제한)
const MAX_SKILL_LEVEL = 10;
const MAX_PLAYER_LEVEL = 30;
const SKILL_KEYS = ['basic_attack', 'dodge', 'heavy_attack', 'magic_skill', 'special_skill'];
const SKILL_LABELS = {
  basic_attack: '룬 슬래시',
  dodge: '환영 회피',
  heavy_attack: '대지 분쇄',
  magic_skill: '화염구 발사',
  special_skill: '아케인 노바'
};

// 스킬 레벨 안전 범위 보정 (1 ~ 10)
function getClampedSkillLevel(lv) {
  const n = Number(lv);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(MAX_SKILL_LEVEL, Math.floor(n));
}

// 플레이어 레벨 안전 범위 보정 (1 ~ 30)
function getClampedPlayerLevel(lv) {
  const n = Number(lv);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(MAX_PLAYER_LEVEL, Math.floor(n));
}

// 행동별 기본 쿨타임 (초)
const COOLDOWNS = {
  basic_attack: 0.28,
  interact: 0.25,
  dodge: 1.00,
  heavy_attack: 2.80,
  magic_skill: 3.50,
  special_skill: 7.00
};

// 전체 퀘스트 초기 상태 테이블 생성 (메인 1~20장 및 서브 퀘스트 모두 미수락으로 초기화)
function createInitialQuestStates() {
  const map = {};
  QUESTS.forEach(q => {
    map[q.id] = { status: 'unaccepted', progress: 0 };
  });
  return map;
}

// v2.0 신규 스토리 진행 플래그 기본값 생성 (구버전 세이브 폴백용)
function createDefaultStoryFlags() {
  return {
    flowerIslandUnlocked: false,
    beerCaveUnlocked: false,
    piratePathUnlocked: false,
    minatomachiUnlocked: false,
    erikDefeated: false,
    seraphiriaDefeated: false,
    zephyrRingReceived: false
  };
}

// 전역 게임 상태 객체
const state = {
  selectedClass: 'knight',
  zoneId: 'home_interior',
  questFilter: 'all',
  zones: createWorldZones(),
  monsters: createInitialMonsters(),
  isTalkingToNpc: false,
  isModalOpen: false,
  lastSavedAt: '초기 상태',
  charSlots: [],
  activeSlotIdx: 0,
  createForm: { name: '에이든', gender: 'male', charClass: 'knight' },
  player: {
    name: '에이든', gender: 'male',
    x: 210, y: 300, r: 17,
    fx: 1, fy: 0,
    level: 1, exp: 0, expNext: 100, gold: 50, sp: 1,
    baseHp: 240, baseMp: 90, baseAtk: 30, baseDef: 14, baseSpd: 205, baseCrit: 0.18,
    hp: 240, mp: 90,
    dodgeTimer: 0, invulnTimer: 0, animTick: 0,
    comboStep: 0, comboTimer: 0,
    hitCount: 0, hitComboDecay: 0,
    // v2.0 세트/고유 효과 제어용 타이머 (해적 3세트 쿨타임 10초, 바이킹 3세트 공격 모션 경직 무시)
    pirateSetCdTimer: 0,
    attackMotionTimer: 0,
    afterimages: [],
    skills: { basic_attack: 1, dodge: 1, heavy_attack: 1, magic_skill: 1, special_skill: 1 },
    equipment: { weapon: null, armor: null, accessory: null },
    inventory: [
      { ...ITEMS.warp_nearest_town, count: 1 },
      { ...ITEMS.potion_hp, count: 3 },
      { ...ITEMS.iron_blade, count: 1 }
    ]
  },
  cooldownLeft: { basic_attack: 0, interact: 0, dodge: 0, heavy_attack: 0, magic_skill: 0, special_skill: 0 },
  sensor: {
    source: 'LOCAL_SIM',
    joyX: 0, joyY: 0,
    extJoyX: 0, extJoyY: 0,
    gyroDeg: 0, accelG: 1.0,
    pitch: 0, roll: 0,
    touch0Active: false, touch3Active: false,
    lastAction: '대기 중',
    actionCount: 0
  },
  projectiles: [],
  slashArcs: [],
  particles: [],
  effects: [],
  screenShake: 0,
  hitStopTimer: 0,
  bulletTimeTimer: 0,
  logs: ['[Mystical Continent v2.0 오프라인 싱글플레이] 푸른 바다를 감싸는 어둠 업데이트가 적용되었습니다!'],
  kills: 0,
  bossDefeated: false,
  gameOver: false,
  playerDead: false,
  respawnTownId: 'forest_town',
  lastExpLost: 0,
  questCategoryFilter: 'main',
  invCategoryFilter: 'all',
  // v2.0 항해 해금 목록 및 스토리 진행 플래그 (구버전 세이브 로드 시 안전하게 기본값으로 복원)
  unlockedSailing: ['oceanblue_town'],
  storyFlags: createDefaultStoryFlags(),
  quest: {
    currentId: 1,
    progress: 0,
    allCompleted: false,
    talkedChiefQ6: false,
    talkedReneQ7: false,
    talkedBentenQ10: false,
    talkedRagnarQ15: false,
    talkedSeraphiriaQ18: false,
    talkedKenshinQ20: false
  },
  questStates: createInitialQuestStates(),
  ws: null,
  wsConnected: false
};

// 착용 중인 장비의 세트 개수 및 고유 효과 보유 여부를 판정
function getActiveSetStatus(equipment = state.player.equipment) {
  const counts = { pirate: 0, viking: 0 };
  let hasSuspiciousPendant = false;
  let hasErikArmor = false;
  let hasSeaKingSword = false;

  if (equipment && typeof equipment === 'object') {
    Object.values(equipment).forEach(rawItem => {
      if (!rawItem) return;
      // 구버전 세이브 아이템에 setKey/uniqueEffect 필드가 없더라도 ITEMS DB에서 안전하게 참조
      const dbItem = (typeof ITEMS !== 'undefined' && rawItem.id && ITEMS[rawItem.id]) ? ITEMS[rawItem.id] : rawItem;
      const setKey = rawItem.setKey || (dbItem && dbItem.setKey) || null;
      const itemId = rawItem.id || (dbItem && dbItem.id) || '';

      if (setKey && counts[setKey] !== undefined) {
        counts[setKey] += 1;
      }
      if (itemId === 'suspicious_pendant') hasSuspiciousPendant = true;
      if (itemId === 'erik_red_leather_armor') hasErikArmor = true;
      if (itemId === 'sea_king_sword') hasSeaKingSword = true;
    });
  }

  return {
    pirateCount: counts.pirate,
    vikingCount: counts.viking,
    pirate3Set: counts.pirate >= 3,
    viking3Set: counts.viking >= 3,
    hasSuspiciousPendant,
    hasErikArmor,
    hasSeaKingSword
  };
}

// 착용 장비·세트 효과·고유 효과를 모두 반영한 최종 전투 능력치 계산
function getDerivedStats() {
  const p = state.player;
  const eqs = Object.values(p.equipment || {}).filter(Boolean).map(e => {
    const dbItem = (typeof ITEMS !== 'undefined' && e.id && ITEMS[e.id]) ? ITEMS[e.id] : {};
    return { ...dbItem, ...e };
  });
  const setStatus = getActiveSetStatus(p.equipment);

  const maxHp = p.baseHp + eqs.reduce((s, e) => s + (e.hp || 0), 0);
  const maxMp = p.baseMp + (p.level - 1) * 15;
  let atk = p.baseAtk + eqs.reduce((s, e) => s + (e.atk || 0), 0);
  let def = p.baseDef + eqs.reduce((s, e) => s + (e.def || 0), 0);
  let spd = p.baseSpd + eqs.reduce((s, e) => s + (e.spd || 0), 0);
  const crit = Math.min(0.85, p.baseCrit + eqs.reduce((s, e) => s + (e.crit || 0), 0));

  // [바이킹 3세트 효과] 방어력 30% 감소, 공격력 20% 증가, 공격 모션 도중 경직 무시
  if (setStatus.viking3Set) {
    atk = Math.round(atk * 1.20);
    def = Math.max(0, Math.round(def * 0.70));
  }

  // [에리크의 붉은 가죽 갑옷 고유 효과] 기본 공격력(baseAtk) 10당 이동속도 1% 증가 (최대 50%)
  let erikSpdBonusPct = 0;
  if (setStatus.hasErikArmor) {
    erikSpdBonusPct = Math.min(0.50, Math.floor(Math.max(0, Number(p.baseAtk || 0)) / 10) * 0.01);
    spd = Math.round(spd * (1 + erikSpdBonusPct));
  }

  // [해왕의 검 고유 효과] 몬스터 처치 시 경험치·골드 획득량 20% 증가
  const expGoldBonusMult = setStatus.hasSeaKingSword ? 1.20 : 1.0;

  return {
    maxHp,
    maxMp,
    atk,
    def,
    spd,
    crit,
    erikSpdBonusPct,
    expGoldBonusMult,
    ...setStatus
  };
}

// 파티클 이펙트 스폰 헬퍼
function spawnParticles(x, y, count, colors, speedMax = 190, sizeMax = 5, ttlMax = 0.55) {
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 30 + Math.random() * speedMax;
    state.particles.push({
      x, y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd - 25,
      size: 2 + Math.floor(Math.random() * sizeMax),
      color: colors[Math.floor(Math.random() * colors.length)],
      ttl: 0.2 + Math.random() * ttlMax,
      maxTtl: ttlMax
    });
  }
}

// 하단 전투/시스템 로그 기록
function addLog(msg) {
  state.logs.unshift(msg);
  if (state.logs.length > 18) state.logs.pop();
  renderLogs();
}
