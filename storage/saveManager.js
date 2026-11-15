// ============================================================================
// 세이브 데이터 직렬화 및 v1.0 ↔ v2.0 하위 호환 폴백(Fallback) 관리
//  - 기존 saves/<UUID>.json 및 Save_Datas/*.json 데이터 구조 100% 하위 호환 유지
//  - v2.0 신규 필드(만렙 30, 메인 퀘스트 7~20장, 항해 해금 목록, 세트/고유 효과 메타데이터 등)가
//    기존 세이브에 없더라도 안전한 기본값(fallback)으로 자동 보정
//  - 세이브 파일이나 로컬 세이브 키를 초기화/삭제하는 코드 일절 배제
// ============================================================================

// 구버전 세이브 내 개별 아이템 객체에 최신 ITEMS DB 속성(setKey, uniqueEffect 등)을 안전하게 보강
function hydrateSavedItem(rawItem) {
  if (!rawItem || typeof rawItem !== 'object') return null;
  const dbItem = (typeof ITEMS !== 'undefined' && rawItem.id && ITEMS[rawItem.id]) ? ITEMS[rawItem.id] : {};
  const count = Number.isFinite(Number(rawItem.count)) ? Math.max(1, Math.floor(Number(rawItem.count))) : 1;
  return {
    ...rawItem,
    ...dbItem,
    // DB에 정의된 최신 아이템 타입·인벤토리 탭 분류·세트 식별자·설명을 우선 반영
    type: dbItem.type || rawItem.type || 'quest',
    invCategory: dbItem.invCategory || rawItem.invCategory || undefined,
    setKey: rawItem.setKey || dbItem.setKey || undefined,
    uniqueEffect: rawItem.uniqueEffect || dbItem.uniqueEffect || undefined,
    targetZone: rawItem.targetZone || dbItem.targetZone || undefined,
    count
  };
}

// 퀘스트 진행 상태를 바탕으로 해금된 항해 목적지 목록을 안전하게 추론 (구버전 세이브 폴백용)
function inferUnlockedSailingFromQuests(questStates, existingList) {
  const set = new Set(['oceanblue_town']);
  if (Array.isArray(existingList)) {
    existingList.forEach(z => {
      if (typeof z === 'string' && z.trim()) set.add(z.trim());
    });
  }
  const qs = (questStates && typeof questStates === 'object') ? questStates : {};
  const isStartedOrDone = (qid) => qs[qid] && (qs[qid].status === 'active' || qs[qid].status === 'completed');

  if (isStartedOrDone('main_7') || isStartedOrDone('main_8') || isStartedOrDone('main_9')) {
    set.add('flower_island_1');
  }
  if (isStartedOrDone('main_10') || isStartedOrDone('main_11') || isStartedOrDone('main_12') || isStartedOrDone('main_13')) {
    set.add('flower_island_1');
    set.add('beer_cave_1');
  }
  if (isStartedOrDone('main_16') || isStartedOrDone('main_17') || isStartedOrDone('main_18')) {
    set.add('flower_island_1');
    set.add('beer_cave_1');
    set.add('pirate_path_1');
  }
  if (isStartedOrDone('main_19') || isStartedOrDone('main_20')) {
    set.add('flower_island_1');
    set.add('beer_cave_1');
    set.add('pirate_path_1');
    set.add('minatomachi');
  }
  return Array.from(set);
}

// 현재 게임 상태를 세이브 JSON 페이로드로 직렬화 (기존 필드 100% 보존 + v2.0 신규 필드 포함)
function exportSavePayload(preserveTimestamp = false) {
  const p = state.player;
  const openedChests = [];
  Object.values(state.zones).forEach(z => {
    z.chests.forEach(ch => {
      if (ch.opened) openedChests.push(ch.id);
    });
  });
  const existingSlot = (Array.isArray(state.charSlots) && state.charSlots[state.activeSlotIdx]) || null;
  const nowStr = (preserveTimestamp && existingSlot && existingSlot.lastSavedAt)
    ? existingSlot.lastSavedAt
    : new Date().toTimeString().split(' ')[0];
  const savedAtMs = (preserveTimestamp && existingSlot && Number(existingSlot.savedAtMs) > 0)
    ? Number(existingSlot.savedAtMs)
    : Date.now();
  return {
    charName: p.name || '에이든',
    gender: p.gender || 'male',
    charClass: state.selectedClass,
    customCreated: Boolean(p.customCreated),
    adventureStarted: Boolean(p.adventureStarted),
    level: getClampedPlayerLevel(p.level),
    maxPlayerLevel: MAX_PLAYER_LEVEL,
    exp: p.exp,
    expToNext: p.expNext,
    gold: p.gold,
    skillPoints: p.sp,
    baseMaxHp: p.baseHp,
    baseMaxMp: p.baseMp,
    baseAtk: p.baseAtk,
    baseDef: p.baseDef,
    baseSpeed: p.baseSpd,
    baseCrit: p.baseCrit,
    hp: Math.round(p.hp),
    mp: Math.round(p.mp),
    skillLevels: {
      basic_attack: getClampedSkillLevel(p.skills.basic_attack),
      dodge: getClampedSkillLevel(p.skills.dodge),
      heavy_attack: getClampedSkillLevel(p.skills.heavy_attack),
      magic_skill: getClampedSkillLevel(p.skills.magic_skill),
      special_skill: getClampedSkillLevel(p.skills.special_skill)
    },
    maxSkillLevel: MAX_SKILL_LEVEL,
    equipment: {
      weapon: p.equipment.weapon ? hydrateSavedItem(p.equipment.weapon) : null,
      armor: p.equipment.armor ? hydrateSavedItem(p.equipment.armor) : null,
      accessory: p.equipment.accessory ? hydrateSavedItem(p.equipment.accessory) : null
    },
    inventory: p.inventory.map(i => hydrateSavedItem(i)).filter(Boolean),
    currentZone: state.zoneId,
    playerX: Math.round(p.x),
    playerY: Math.round(p.y),
    openedChests,
    kills: state.kills,
    bossDefeated: state.bossDefeated,
    playerDead: Boolean(state.playerDead),
    respawnTownId: state.respawnTownId || 'forest_town',
    unlockedSailing: inferUnlockedSailingFromQuests(state.questStates, state.unlockedSailing),
    storyFlags: {
      ...(typeof createDefaultStoryFlags === 'function' ? createDefaultStoryFlags() : {}),
      ...(state.storyFlags || {})
    },
    quest: { ...state.quest },
    questStates: JSON.parse(JSON.stringify(state.questStates)),
    v: 2,
    savedAtMs,
    lastSavedAt: nowStr
  };
}

function isSlotUntouchedDefault(slot) {
  if (!slot || typeof slot !== 'object') return true;
  if (slot.customCreated || slot.adventureStarted) return false;
  const lv = Number(slot.level || 1);
  const exp = Number(slot.exp || 0);
  const kills = Number(slot.kills || 0);
  const gold = Number(slot.gold ?? 50);
  const sp = Number(slot.skillPoints ?? 1);
  const name = String(slot.charName || '에이든').trim();
  const gender = String(slot.gender || 'male').trim();
  const cls = String(slot.charClass || 'knight').trim();
  const zone = String(slot.currentZone || 'home_interior').trim();
  const px = Number(slot.playerX ?? 210);
  const py = Number(slot.playerY ?? 300);
  if (
    lv > 1 || exp > 0 || kills > 0 || gold !== 50 || sp !== 1 ||
    slot.bossDefeated || slot.playerDead ||
    name !== '에이든' || gender !== 'male' || cls !== 'knight' ||
    zone !== 'home_interior' || Math.abs(px - 210) > 5 || Math.abs(py - 300) > 5
  ) {
    return false;
  }
  if (slot.equipment && Object.values(slot.equipment).some(Boolean)) return false;
  if (Array.isArray(slot.openedChests) && slot.openedChests.length > 0) return false;
  if (slot.questStates && Object.values(slot.questStates).some(q => q && (q.status !== 'unaccepted' || Number(q.progress || 0) > 0))) {
    return false;
  }
  return true;
}

function hasMeaningfulProgress(bundle) {
  if (!bundle || typeof bundle !== 'object') return false;
  const slots = Array.isArray(bundle.slots) ? bundle.slots : [];
  if (slots.length === 0) return false;
  if (slots.length > 1) return true;
  return slots.some(s => !isSlotUntouchedDefault(s));
}

function savePlayerProgress(reason = '자동 저장') {
  const payload = exportSavePayload(false);
  state.lastSavedAt = payload.lastSavedAt;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    addLog('⚠️ 브라우저 저장 실패 (용량 초과 가능)');
  }
  saveAllCharSlots();   // 슬롯 갱신 + 브라우저 저장 + 서버 저장 요청까지 한 번에 처리
  sendServerSave();     // (디바운스로 묶이므로 중복 호출해도 한 번만 전송됨)
  renderSaveStatus();   // 실제 서버 저장 결과(완료/실패)를 배지에 표시
  updateAllUI();
}

function escHtml(s) {
  return String(s).replace(/[&<>"'`]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c]));
}
function cleanName(s) {
  return String(s == null || s === '' ? '에이든' : s).replace(/[<>&"'`]/g, '').slice(0, 16) || '에이든';
}

// 구버전(v1.0) 및 신버전(v2.0) 세이브 데이터를 안전하게 마이그레이션 (누락 필드 기본값 폴백)
function migrateSave(d) {
  if (!d || typeof d !== 'object') return d;
  if (!d.v) d.v = 1;

  // 1) 플레이어 레벨 상한(Lv.30) 안전 보정 (경험치 및 스탯은 그대로 보존)
  d.level = getClampedPlayerLevel(d.level ?? 1);
  if (d.maxPlayerLevel == null) {
    d.maxPlayerLevel = MAX_PLAYER_LEVEL;
  }

  // 2) 스킬 레벨 상한(Lv.10) 보정 및 초과 SP 환급
  const defaultSkills = { basic_attack: 1, dodge: 1, heavy_attack: 1, magic_skill: 1, special_skill: 1 };
  const rawSkills = (d.skillLevels && typeof d.skillLevels === 'object') ? d.skillLevels : {};
  const normalizedSkills = { ...defaultSkills };
  let refundedSp = 0;
  SKILL_KEYS.forEach(k => {
    const rawLv = Number(rawSkills[k] ?? 1);
    const safeLv = (!Number.isFinite(rawLv) || rawLv < 1) ? 1 : Math.floor(rawLv);
    if (safeLv > MAX_SKILL_LEVEL) {
      refundedSp += (safeLv - MAX_SKILL_LEVEL);
      normalizedSkills[k] = MAX_SKILL_LEVEL;
    } else {
      normalizedSkills[k] = safeLv;
    }
  });
  d.skillLevels = normalizedSkills;
  if (refundedSp > 0) {
    d.skillPoints = Math.max(0, Number(d.skillPoints ?? 1)) + refundedSp;
  }
  if (d.maxSkillLevel == null) {
    d.maxSkillLevel = MAX_SKILL_LEVEL;
  }

  // 3) 장착 장비 및 인벤토리 아이템 최신 DB 속성 폴백 보강
  const rawEq = (d.equipment && typeof d.equipment === 'object') ? d.equipment : {};
  d.equipment = {
    weapon: rawEq.weapon ? hydrateSavedItem(rawEq.weapon) : null,
    armor: rawEq.armor ? hydrateSavedItem(rawEq.armor) : null,
    accessory: rawEq.accessory ? hydrateSavedItem(rawEq.accessory) : null
  };
  if (Array.isArray(d.inventory)) {
    d.inventory = d.inventory.map(item => hydrateSavedItem(item)).filter(Boolean);
  }

  // 4) 퀘스트 상태 테이블 폴백: 기존 클리어 내역(main_1~main_6, sub_1~sub_4)은 100% 보존하고
  //    새로 추가된 메인 7~20장(main_7~main_20)이 없으면 미수락(unaccepted) 기본값으로 추가
  const initialQs = createInitialQuestStates();
  const savedQs = (d.questStates && typeof d.questStates === 'object') ? d.questStates : {};
  Object.keys(savedQs).forEach(k => {
    if (initialQs[k] && savedQs[k] && typeof savedQs[k] === 'object') {
      initialQs[k] = {
        status: savedQs[k].status || 'unaccepted',
        progress: Math.max(0, Number(savedQs[k].progress || 0))
      };
    } else if (savedQs[k] && typeof savedQs[k] === 'object') {
      // 향후 확장 또는 커스텀 퀘스트 키도 손실 없이 유지
      initialQs[k] = { ...savedQs[k] };
    }
  });
  // [발록 처치 버그 자동 보정] 메인 5장(main_5) 진행 중 이미 발록을 처치해 전리품(용비늘 수호 갑주/심연 군주의 왕관) 또는
  // 발록의 제단 보물상자(c_b1)를 획득했는데 progress가 0으로 남아 있던 세이브를 즉시 완료 가능(progress: 1) 상태로 복구
  const hadBalrogKillEvidence = Boolean(
    d.bossDefeated ||
    (Array.isArray(d.openedChests) && d.openedChests.includes('c_b1')) ||
    (Array.isArray(d.inventory) && d.inventory.some(i => i && (i.id === 'dragonscale_armor' || i.id === 'abyss_crown'))) ||
    (d.equipment && ((d.equipment.armor && d.equipment.armor.id === 'dragonscale_armor') || (d.equipment.accessory && d.equipment.accessory.id === 'abyss_crown')))
  );
  if (initialQs.main_5 && initialQs.main_5.status === 'active' && initialQs.main_5.progress < 1 && hadBalrogKillEvidence) {
    initialQs.main_5.progress = 1;
    d.bossDefeated = true;
  }

  d.questStates = initialQs;

  // 5) 메인 퀘스트 진행 요약 객체(d.quest) 폴백 보정
  //    기존 v1.0 세이브에서 6장까지 완료해 allCompleted=true였던 경우, 20장이 미완료라면 7장부터 이어할 수 있도록 보정
  const defaultQuestMeta = {
    currentId: 1,
    progress: 0,
    allCompleted: false,
    talkedChiefQ6: false,
    talkedReneQ7: false,
    talkedBentenQ10: false,
    talkedRagnarQ15: false,
    talkedSeraphiriaQ18: false,
    talkedKenshinQ20: false
  };
  d.quest = { ...defaultQuestMeta, ...(d.quest && typeof d.quest === 'object' ? d.quest : {}) };
  const main6Done = d.questStates.main_6 && d.questStates.main_6.status === 'completed';
  const main20Done = d.questStates.main_20 && d.questStates.main_20.status === 'completed';
  if (main6Done && !main20Done) {
    d.quest.allCompleted = false;
    if (Number(d.quest.currentId || 1) <= 6) {
      d.quest.currentId = 7;
      d.quest.progress = 0;
    }
  }

  // 6) v2.0 항해 해금 목록 및 스토리 진행 플래그 기본값 폴백
  d.unlockedSailing = inferUnlockedSailingFromQuests(d.questStates, d.unlockedSailing);
  const baseFlags = typeof createDefaultStoryFlags === 'function' ? createDefaultStoryFlags() : {};
  const rawFlags = (d.storyFlags && typeof d.storyFlags === 'object') ? d.storyFlags : {};
  d.storyFlags = {
    ...baseFlags,
    ...rawFlags,
    flowerIslandUnlocked: Boolean(rawFlags.flowerIslandUnlocked || d.unlockedSailing.includes('flower_island_1')),
    beerCaveUnlocked: Boolean(rawFlags.beerCaveUnlocked || d.unlockedSailing.includes('beer_cave_1')),
    piratePathUnlocked: Boolean(rawFlags.piratePathUnlocked || d.unlockedSailing.includes('pirate_path_1')),
    minatomachiUnlocked: Boolean(rawFlags.minatomachiUnlocked || d.unlockedSailing.includes('minatomachi')),
    erikDefeated: Boolean(rawFlags.erikDefeated || (d.questStates.main_13 && d.questStates.main_13.status === 'completed')),
    seraphiriaDefeated: Boolean(rawFlags.seraphiriaDefeated || (d.questStates.main_18 && d.questStates.main_18.status === 'completed')),
    zephyrRingReceived: Boolean(rawFlags.zephyrRingReceived || (d.questStates.main_19 && (d.questStates.main_19.status === 'active' || d.questStates.main_19.status === 'completed')))
  };

  return d;
}

// 마이그레이션된 세이브 페이로드를 현재 런타임 state에 안전하게 적용
function applySavedPayload(data) {
  if (!data || typeof data !== 'object') return false;
  data = migrateSave(data);
  const clsKey = CLASSES[data.charClass] ? data.charClass : 'knight';
  state.selectedClass = clsKey;
  const c = CLASSES[clsKey];
  const p = state.player;

  p.name = cleanName(data.charName);
  p.gender = data.gender === 'female' ? 'female' : 'male';
  p.customCreated = Boolean(data.customCreated);
  p.adventureStarted = Boolean(data.adventureStarted);
  p.level = getClampedPlayerLevel(data.level || 1);
  p.exp = Number(data.exp || 0);
  p.expNext = Number(data.expToNext || 100);
  p.gold = Number(data.gold ?? 50);
  p.sp = Number(data.skillPoints ?? 1);

  p.baseHp = Number(data.baseMaxHp || (c.hp + (p.level - 1) * 34));
  p.baseMp = Number(data.baseMaxMp || c.mp);
  p.baseAtk = Number(data.baseAtk || (c.atk + (p.level - 1) * 7));
  p.baseDef = Number(data.baseDef || (c.def + (p.level - 1) * 3));
  p.baseSpd = Number(data.baseSpeed || c.spd);
  p.baseCrit = Number(data.baseCrit || c.crit);

  const fallbackSkills = { basic_attack: 1, dodge: 1, heavy_attack: 1, magic_skill: 1, special_skill: 1 };
  const mergedSkills = { ...fallbackSkills, ...(data.skillLevels || {}) };
  SKILL_KEYS.forEach(k => {
    mergedSkills[k] = getClampedSkillLevel(mergedSkills[k]);
  });
  p.skills = mergedSkills;
  if (data.equipment) {
    p.equipment = {
      weapon: data.equipment.weapon ? hydrateSavedItem(data.equipment.weapon) : null,
      armor: data.equipment.armor ? hydrateSavedItem(data.equipment.armor) : null,
      accessory: data.equipment.accessory ? hydrateSavedItem(data.equipment.accessory) : null
    };
  }
  if (Array.isArray(data.inventory)) {
    p.inventory = data.inventory.map(item => hydrateSavedItem(item)).filter(Boolean);
  }

  // v2.0 세트/공격 타이머 기본값 안전 초기화
  p.pirateSetCdTimer = Number(p.pirateSetCdTimer || 0);
  p.attackMotionTimer = Number(p.attackMotionTimer || 0);

  const derived = getDerivedStats();
  const wasDead = Boolean(data.playerDead) || (data.hp !== undefined && Number(data.hp) <= 0);
  state.playerDead = wasDead;
  state.respawnTownId = (data.respawnTownId && state.zones[data.respawnTownId])
    ? data.respawnTownId
    : getNearestTownZone(data.currentZone || 'forest_town');

  if (wasDead) {
    // 죽은 상태에서 다시 접속한 경우: 가장 가까운 안전지대(집 안 또는 마을)에서 부활 대기 상태로 세팅
    state.zoneId = state.respawnTownId;
    p.x = 310;
    p.y = 300;
    p.hp = derived.maxHp;
    p.mp = derived.maxMp;
  } else {
    p.hp = Math.max(1, Math.min(derived.maxHp, Number(data.hp || derived.maxHp)));
    p.mp = Math.max(0, Math.min(derived.maxMp, Number(data.mp ?? derived.maxMp)));
    if (data.currentZone && state.zones[data.currentZone]) {
      state.zoneId = data.currentZone;
    } else {
      state.zoneId = 'forest_town';
    }
    p.x = Number(data.playerX || 210);
    p.y = Number(data.playerY || 300);
  }

  if (Array.isArray(data.openedChests)) {
    const openedSet = new Set(data.openedChests);
    Object.values(state.zones).forEach(z => {
      z.chests.forEach(ch => {
        ch.opened = openedSet.has(ch.id);
      });
    });
  }

  state.kills = Number(data.kills || 0);
  state.bossDefeated = Boolean(data.bossDefeated);
  if (data.quest && typeof data.quest === 'object') {
    state.quest = {
      currentId: 1,
      progress: 0,
      allCompleted: false,
      talkedChiefQ6: false,
      talkedReneQ7: false,
      talkedBentenQ10: false,
      talkedRagnarQ15: false,
      talkedSeraphiriaQ18: false,
      talkedKenshinQ20: false,
      ...data.quest
    };
  }
  state.questStates = createInitialQuestStates();
  if (data.questStates && typeof data.questStates === 'object') {
    Object.keys(data.questStates).forEach(k => {
      if (state.questStates[k]) {
        state.questStates[k] = { ...state.questStates[k], ...data.questStates[k] };
      } else {
        state.questStates[k] = { ...data.questStates[k] };
      }
    });
  }

  // v2.0 항해 해금 목록 및 스토리 진행 플래그 복원
  state.unlockedSailing = inferUnlockedSailingFromQuests(state.questStates, data.unlockedSailing);
  state.storyFlags = {
    ...(typeof createDefaultStoryFlags === 'function' ? createDefaultStoryFlags() : {}),
    ...(data.storyFlags || {})
  };

  state.lastSavedAt = data.lastSavedAt || '불러오기 완료';

  const startBadge = document.getElementById('startSaveTimeBadge');
  const headerBadge = document.getElementById('headerSaveStatus');
  if (startBadge) startBadge.textContent = `💾 저장된 진행도 로드됨 (${state.lastSavedAt})`;
  if (headerBadge) headerBadge.textContent = `💾 세이브 로드됨 (${p.name} Lv.${p.level})`;

  highlightClassCards(clsKey);
  updateAllUI();
  return true;
}

function loadSavedProgressOnBoot() {
  if (loadAllCharSlotsOnBoot()) return true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (applySavedPayload(parsed)) {
        state.charSlots = [parsed];
        state.activeSlotIdx = 0;
        addLog(`💾 [이어하기 로드 완료] 저장된 Lv.${state.player.level} ${CLASSES[state.selectedClass].name} 데이터를 불러왔습니다!`);
        return true;
      }
    }
  } catch (err) {}
  return false;
}



function buildServerSaveBundle() {
  // 전송 시점의 최신 게임 상태를 활성 슬롯에 반영 (디바운스 대기 중 변경분 포함)
  if (Array.isArray(state.charSlots) && state.charSlots.length > 0) {
    state.activeSlotIdx = Math.max(0, Math.min(state.charSlots.length - 1, Number(state.activeSlotIdx || 0)));
    state.charSlots[state.activeSlotIdx] = exportSavePayload(false);
  }
  const slots = Array.isArray(state.charSlots)
    ? state.charSlots.map(slot => ({ ...slot })) : [];
  const activeSlotIdx = slots.length
    ? Math.max(0, Math.min(slots.length - 1, Number(state.activeSlotIdx || 0))) : 0;
  // 묶음 시각은 항상 증가 (시계가 흔들려도 같은 값이 두 번 나가지 않게)
  const savedAtMs = Math.max(Date.now(), saveSync.lastBundleMs + 1);
  saveSync.lastBundleMs = savedAtMs;
  const bundle = {
    v: 1,
    activeSlotIdx,
    slots,
    savedAtMs,
    lastSavedAt: new Date().toTimeString().split(' ')[0]
  };
  if (saveSync.allowResetOnce) {
    bundle.allowReset = true;
    saveSync.allowResetOnce = false;
  }
  return bundle;
}

// ============================================================================
// 서버 저장 파이프라인
//  - 모든 저장 요청은 sendServerSave() 로 모이고, 짧게 묶어서(디바운스) 한 번에 전송
//  - 한 번에 한 요청만 전송(in-flight) → 서버가 순서대로 처리, save_confirmed 를 받아야 "완료"
//  - 서버와 최초 동기화(saved_progress_sync) 전에는 전송하지 않음 (서버의 기존 세이브를 기본값으로 덮어쓰지 않기 위해)
//  - 응답이 없거나(5초) 실패하면 배지/로그로 알리고 자동 재시도, 브라우저(localStorage)에는 항상 먼저 저장
//  - baseRev: 마지막으로 확인한 서버 저장 버전. 다른 창이 더 최신으로 저장했다면 서버가 거부(conflict)
// ============================================================================
const SAVE_DEBOUNCE_MS = 600;
const SAVE_ACK_TIMEOUT_MS = 5000;
const SAVE_RETRY_MS = 3000;
const SAVE_SESSION_ID = (Date.now().toString(36) + Math.random().toString(36).slice(2, 12)).slice(0, 40);
const saveSync = {
  bootHadLocal: false,     // 페이지 로드 시점에 이 브라우저에 로컬 세이브가 있었는지
  initialSyncDone: false,  // 최초 서버 동기화 완료
  ready: false,            // 현재 연결에서 서버 동기화가 끝나 저장을 보낼 수 있음
  halted: false,           // 충돌로 자동 저장 중단
  allowResetOnce: false,   // 사용자가 명시적으로 캐릭터 초기화/삭제를 실행한 경우
  baseRev: 0,
  seq: 0,
  inFlight: null,          // { id }
  dirty: false,
  status: 'idle',          // idle | ok | error
  error: '',
  lastOkAt: '',
  failedBefore: false,
  manualPending: false,
  lastBundleMs: 0,
  debounceTimer: null,
  ackTimer: null,
  retryTimer: null
};
const SAVE_TONES = {
  ok:    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  warn:  'bg-amber-500/20 text-amber-300 border-amber-500/40',
  error: 'bg-rose-500/25 text-rose-200 border-rose-500/50'
};
const SAVE_GAME_TONES = {
  ok:    'bg-sky-500/20 text-sky-300',
  warn:  'bg-amber-500/20 text-amber-300',
  error: 'bg-rose-500/30 text-rose-200'
};

// 오프라인 싱글플레이 전용 모드 플래그 및 Save_Datas 폴더 직접 저장 시스템
// - 다운로드(Downloads) 폴더에 세이브 파일이 쌓이지 않도록,
//   선택한 게임 폴더 내 `Save_Datas` 하위 폴더를 자동 생성(`getDirectoryHandle('Save_Datas', { create: true })`)하거나
//   로컬 런처(`/api/save_datas`)를 통해 `./Save_Datas/` 폴더에 직접 .json 세이브 파일을 기록합니다.
const OFFLINE_SINGLEPLAYER_DEFAULT = true;
const SAVE_DATAS_FOLDER_NAME = 'Save_Datas';
const SAVE_HANDLE_DB_NAME = 'mystical_continent_save_handles_v1';
const SAVE_HANDLE_STORE = 'dir_handles';

const localFileSync = {
  handle: null,            // 개별 파일 핸들 (폴백용)
  dirHandle: null,         // Save_Datas 폴더 핸들 (FileSystemDirectoryHandle)
  rootDirName: '',
  fileName: '',
  localApiAvailable: false,
  writing: false,
  pendingWrite: false,
  lastFileSavedAt: ''
};

function wsIsOpen() {
  return Boolean(state.wsConnected && state.ws && state.ws.readyState === 1);
}

// IndexedDB에 Save_Datas 폴더 핸들을 반영구 저장하여 매번 폴더를 다시 고르지 않도록 지원
function openSaveHandleDb() {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') { resolve(null); return; }
    try {
      const req = indexedDB.open(SAVE_HANDLE_DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(SAVE_HANDLE_STORE)) {
          db.createObjectStore(SAVE_HANDLE_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

async function persistSaveDatasDirHandle(dirHandle, rootDirName = '') {
  const db = await openSaveHandleDb();
  if (!db) return;
  try {
    const tx = db.transaction(SAVE_HANDLE_STORE, 'readwrite');
    tx.objectStore(SAVE_HANDLE_STORE).put({ dirHandle, rootDirName }, 'save_datas_dir');
  } catch (e) {}
}

async function loadCachedSaveDatasDirHandle() {
  const db = await openSaveHandleDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(SAVE_HANDLE_STORE, 'readonly');
      const req = tx.objectStore(SAVE_HANDLE_STORE).get('save_datas_dir');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

async function probeLocalSaveDatasApi() {
  if (!IS_HTTP) return false;
  try {
    const res = await fetch('/api/save_datas/status', { method: 'GET', cache: 'no-store' });
    if (res && res.ok) {
      const data = await res.json();
      if (data && data.ok) {
        localFileSync.localApiAvailable = true;
        localFileSync.fileName = `${SAVE_DATAS_FOLDER_NAME}/`;
        updateLocalFileSyncBadge();
        return true;
      }
    }
  } catch (e) {}
  return false;
}

async function restoreCachedSaveDatasFolderOnBoot() {
  const apiOk = await probeLocalSaveDatasApi();
  if (apiOk) return true;
  const cached = await loadCachedSaveDatasDirHandle();
  if (!cached || !cached.dirHandle) return false;
  try {
    if (typeof cached.dirHandle.queryPermission === 'function') {
      const perm = await cached.dirHandle.queryPermission({ mode: 'readwrite' });
      if (perm === 'granted') {
        localFileSync.dirHandle = cached.dirHandle;
        localFileSync.rootDirName = cached.rootDirName || SAVE_DATAS_FOLDER_NAME;
        localFileSync.fileName = `${SAVE_DATAS_FOLDER_NAME}/`;
        updateLocalFileSyncBadge();
        renderSaveStatus();
        return true;
      }
    }
  } catch (e) {}
  return false;
}

// 사용자가 선택한 폴더가 Save_Datas 자체이면 그대로 쓰고, 게임 루트 폴더이면 그 안에 Save_Datas 폴더를 자동 생성!
async function ensureSaveDatasDirectory(userGesture = true) {
  if (localFileSync.dirHandle) {
    try {
      const perm = await localFileSync.dirHandle.queryPermission({ mode: 'readwrite' });
      if (perm === 'granted') return localFileSync.dirHandle;
      if (userGesture && typeof localFileSync.dirHandle.requestPermission === 'function') {
        const reqPerm = await localFileSync.dirHandle.requestPermission({ mode: 'readwrite' });
        if (reqPerm === 'granted') return localFileSync.dirHandle;
      }
    } catch (e) {
      localFileSync.dirHandle = null;
    }
  }

  const cached = await loadCachedSaveDatasDirHandle();
  if (cached && cached.dirHandle) {
    try {
      let perm = await cached.dirHandle.queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted' && userGesture && typeof cached.dirHandle.requestPermission === 'function') {
        perm = await cached.dirHandle.requestPermission({ mode: 'readwrite' });
      }
      if (perm === 'granted') {
        localFileSync.dirHandle = cached.dirHandle;
        localFileSync.rootDirName = cached.rootDirName || SAVE_DATAS_FOLDER_NAME;
        localFileSync.fileName = `${SAVE_DATAS_FOLDER_NAME}/`;
        updateLocalFileSyncBadge();
        return localFileSync.dirHandle;
      }
    } catch (e) {}
  }

  if (!userGesture || typeof window.showDirectoryPicker !== 'function') {
    return null;
  }

  addLog('📂 [폴더 지정 안내] 현재 게임(index.html)이 있는 폴더를 선택해 주세요! 선택하신 폴더 안에 자동으로 [Save_Datas] 폴더가 생성되며, 앞으로 다운로드 폴더 대신 Save_Datas에 세이브가 보관됩니다.');
  const pickedDir = await window.showDirectoryPicker({
    id: 'mystical_continent_game_root',
    mode: 'readwrite'
  });

  const saveDatasDir = (pickedDir.name === SAVE_DATAS_FOLDER_NAME)
    ? pickedDir
    : await pickedDir.getDirectoryHandle(SAVE_DATAS_FOLDER_NAME, { create: true });

  localFileSync.dirHandle = saveDatasDir;
  localFileSync.rootDirName = pickedDir.name || '';
  localFileSync.fileName = `${SAVE_DATAS_FOLDER_NAME}/`;
  await persistSaveDatasDirHandle(saveDatasDir, localFileSync.rootDirName);
  updateLocalFileSyncBadge();
  return saveDatasDir;
}

function updateLocalFileSyncBadge() {
  const badge = document.getElementById('localFileSyncBadge');
  const linkBtn = document.getElementById('btnLinkLocalSaveFile');
  if (!badge) return;
  const isLinked = Boolean(localFileSync.dirHandle || localFileSync.handle || localFileSync.localApiAvailable);
  if (isLinked) {
    const timePart = localFileSync.lastFileSavedAt ? ` (${localFileSync.lastFileSavedAt})` : '';
    const targetLabel = (localFileSync.dirHandle || localFileSync.localApiAvailable)
      ? `${SAVE_DATAS_FOLDER_NAME}/ 폴더`
      : localFileSync.fileName;
    badge.textContent = `📁 자동보관: ${targetLabel}${timePart}`;
    badge.title = `세이브 파일이 다운로드 폴더 대신 ${targetLabel}에 직접 저장됩니다${timePart}`;
    badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 max-w-[260px] sm:max-w-[320px] truncate whitespace-nowrap';
    if (linkBtn) {
      linkBtn.innerHTML = '<span>📁 Save_Datas 연동 중 ✓</span>';
      linkBtn.title = `현재 연동된 폴더: ${targetLabel} (클릭하여 폴더 재지정 가능)`;
      linkBtn.className = 'px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white font-extrabold text-[11px] border border-emerald-400/50 shadow transition flex items-center gap-1 whitespace-nowrap shrink-0';
    }
  } else {
    badge.textContent = '📁 Save_Datas 폴더(.json) 전용 보관';
    badge.title = '세이브 저장 시 게임 폴더 내 Save_Datas 폴더를 생성하여 직접 저장합니다';
    badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 max-w-[260px] sm:max-w-[320px] truncate whitespace-nowrap';
    if (linkBtn) {
      linkBtn.innerHTML = '<span>📁 Save_Datas 폴더 자동연동</span>';
      linkBtn.title = '게임 폴더를 지정하면 그 안에 Save_Datas 폴더를 자동으로 만들고 플레이 중 세이브를 실시간 저장합니다';
      linkBtn.className = 'px-2.5 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold text-[11px] border border-indigo-400/40 shadow transition flex items-center gap-1 whitespace-nowrap shrink-0';
    }
  }
}

async function writeBundleToLinkedLocalFile(explicitFileName = null) {
  if (!localFileSync.dirHandle && !localFileSync.handle && !localFileSync.localApiAvailable) return false;
  if (localFileSync.writing) {
    localFileSync.pendingWrite = true;
    return false;
  }
  localFileSync.writing = true;
  try {
    const bundle = buildServerSaveBundle();
    bundle.v = 2;
    const jsonText = JSON.stringify(bundle, null, 2);
    const activeChar = (bundle.slots && bundle.slots[bundle.activeSlotIdx]) || state.player;
    const safeName = cleanName(activeChar.charName || activeChar.name || '에이든').replace(/\s+/g, '_');
    const lv = Number(activeChar.level || state.player.level || 1);
    const autoFileName = `MysticalContinent_AutoSave_${safeName}.json`;
    const targetFileName = explicitFileName || autoFileName;

    // 1) 로컬 런처(/api/save_datas)가 실행 중인 경우 ./Save_Datas/ 폴더에 직접 기록
    if (localFileSync.localApiAvailable) {
      const res = await fetch('/api/save_datas/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: targetFileName, autoFileName, bundle })
      });
      if (res && res.ok) {
        localFileSync.lastFileSavedAt = bundle.lastSavedAt || new Date().toTimeString().split(' ')[0];
        localFileSync.fileName = `${SAVE_DATAS_FOLDER_NAME}/${targetFileName}`;
        updateLocalFileSyncBadge();
        renderSaveStatus();
        return true;
      }
    }

    // 2) 브라우저 File System Access API의 Save_Datas 폴더 핸들이 연동된 경우 Save_Datas/ 내부에 직접 파일 생성 및 쓰기
    if (localFileSync.dirHandle) {
      const fileHandle = await localFileSync.dirHandle.getFileHandle(targetFileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(jsonText);
      await writable.close();

      // 수동 스냅샷 저장 시 최신 AutoSave 파일도 함께 갱신
      if (explicitFileName && explicitFileName !== autoFileName) {
        const autoHandle = await localFileSync.dirHandle.getFileHandle(autoFileName, { create: true });
        const autoWritable = await autoHandle.createWritable();
        await autoWritable.write(jsonText);
        await autoWritable.close();
      }

      localFileSync.lastFileSavedAt = bundle.lastSavedAt || new Date().toTimeString().split(' ')[0];
      localFileSync.fileName = `${SAVE_DATAS_FOLDER_NAME}/${targetFileName}`;
      updateLocalFileSyncBadge();
      renderSaveStatus();
      return true;
    }

    // 3) 단일 파일 핸들 폴백
    if (localFileSync.handle) {
      const writable = await localFileSync.handle.createWritable();
      await writable.write(jsonText);
      await writable.close();
      localFileSync.lastFileSavedAt = bundle.lastSavedAt || new Date().toTimeString().split(' ')[0];
      updateLocalFileSyncBadge();
      renderSaveStatus();
      return true;
    }
    return false;
  } catch (err) {
    addLog(`⚠️ [Save_Datas 저장 실패] 권한이 해제되었거나 파일 쓰기에 실패했습니다: ${err && err.message ? err.message : err}`);
    localFileSync.dirHandle = null;
    localFileSync.handle = null;
    updateLocalFileSyncBadge();
    renderSaveStatus();
    return false;
  } finally {
    localFileSync.writing = false;
    if (localFileSync.pendingWrite) {
      localFileSync.pendingWrite = false;
      writeBundleToLinkedLocalFile();
    }
  }
}

async function exportSaveToJsonFile() {
  try {
    const bundle = buildServerSaveBundle();
    bundle.v = 2;
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const dateTag = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const activeChar = (bundle.slots && bundle.slots[bundle.activeSlotIdx]) || state.player;
    const safeName = cleanName(activeChar.charName || activeChar.name || '에이든').replace(/\s+/g, '_');
    const lv = Number(activeChar.level || state.player.level || 1);
    const filename = `MysticalContinent_Save_${safeName}_Lv${lv}_${dateTag}.json`;

    // 1순위: 로컬 런처(/api/save_datas)가 켜져 있으면 즉시 ./Save_Datas/ 폴더에 저장
    if (localFileSync.localApiAvailable || await probeLocalSaveDatasApi()) {
      const ok = await writeBundleToLinkedLocalFile(filename);
      if (ok) {
        soundFX.play('levelup');
        state.lastSavedAt = bundle.lastSavedAt;
        renderSaveStatus();
        addLog(`📥 [Save_Datas 저장 완료] 다운로드 폴더를 거치지 않고 "${SAVE_DATAS_FOLDER_NAME}/${filename}" 경로에 세이브 파일을 직접 보관했습니다!`);
        return;
      }
    }

    // 2순위: 브라우저 폴더 접근 API(showDirectoryPicker)로 선택한 폴더 내 Save_Datas 폴더 자동 생성 및 직접 저장 (다운로드 폴더 X)
    if (typeof window.showDirectoryPicker === 'function') {
      try {
        const dirHandle = await ensureSaveDatasDirectory(true);
        if (dirHandle) {
          const ok = await writeBundleToLinkedLocalFile(filename);
          if (ok) {
            soundFX.play('levelup');
            state.lastSavedAt = bundle.lastSavedAt;
            renderSaveStatus();
            addLog(`📥 [Save_Datas 폴더 저장 완료] 다운로드 폴더가 아닌 "${SAVE_DATAS_FOLDER_NAME}/${filename}"에 세이브 파일이 깔끔하게 보관되었습니다! (앞으로 자동 저장도 이 폴더에 동기화됩니다)`);
            return;
          }
        }
      } catch (dirErr) {
        if (dirErr && dirErr.name === 'AbortError') {
          addLog('📁 [저장 취소] 폴더 선택이 취소되었습니다.');
          return;
        }
      }
    }

    // 3순위: showSaveFilePicker 지원 시 원하는 위치에 직접 저장
    if (typeof window.showSaveFilePicker === 'function') {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'Mystical Continent JSON Save File',
            accept: { 'application/json': ['.json'] }
          }]
        });
        localFileSync.handle = handle;
        localFileSync.fileName = handle.name || filename;
        const ok = await writeBundleToLinkedLocalFile(filename);
        if (ok) {
          soundFX.play('levelup');
          state.lastSavedAt = bundle.lastSavedAt;
          renderSaveStatus();
          addLog(`📥 [세이브 파일 저장 완료] 지정하신 "${localFileSync.fileName}" 파일에 저장했습니다!`);
          return;
        }
      } catch (pickErr) {
        if (pickErr && pickErr.name === 'AbortError') return;
      }
    }

    // 4순위 폴백 (폴더 API 미지원 브라우저 전용)
    const jsonStr = JSON.stringify(bundle, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);

    soundFX.play('levelup');
    state.lastSavedAt = bundle.lastSavedAt;
    renderSaveStatus();
    addLog(`📥 [세이브 파일 저장 완료] "${filename}" 파일이 저장되었습니다.`);
  } catch (err) {
    addLog(`⚠️ [세이브 파일 저장 오류] ${err && err.message ? err.message : err}`);
  }
}

async function openImportSaveFromSaveDatas() {
  // Save_Datas 폴더 핸들이 있거나 showOpenFilePicker가 지원되면 Save_Datas 폴더를 기본 위치로 파일 열기 창 표시
  if (typeof window.showOpenFilePicker === 'function') {
    try {
      const pickerOpts = {
        multiple: false,
        types: [{
          description: 'Mystical Continent JSON Save File',
          accept: { 'application/json': ['.json'] }
        }]
      };
      if (localFileSync.dirHandle) {
        pickerOpts.startIn = localFileSync.dirHandle;
      }
      const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
      if (fileHandle) {
        const file = await fileHandle.getFile();
        const text = await file.text();
        importSaveFromJsonText(text, file.name);
        return;
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }
  const fileInput = document.getElementById('inputImportSaveFile');
  if (fileInput) {
    fileInput.value = '';
    fileInput.click();
  }
}

function importSaveFromJsonText(jsonText, sourceFileName = 'save.json') {
  try {
    const raw = JSON.parse(jsonText);
    const normalized = normalizeServerSaveData(raw);
    if (!normalized || !Array.isArray(normalized.slots) || normalized.slots.length === 0) {
      addLog(`❗ [불러오기 실패] "${sourceFileName}" 파일에서 유효한 Mystical Continent 캐릭터 슬롯 데이터를 찾지 못했습니다.`);
      return false;
    }
    const migratedSlots = normalized.slots.map(s => migrateSave({ ...s }));
    const targetIdx = Math.max(0, Math.min(migratedSlots.length - 1, Number(normalized.activeSlotIdx || 0)));

    state.charSlots = migratedSlots;
    state.activeSlotIdx = targetIdx;
    applySavedPayload(state.charSlots[state.activeSlotIdx]);

    const stamp = Date.now();
    localStorage.setItem(SLOTS_STORAGE_KEY, JSON.stringify({
      activeSlotIdx: state.activeSlotIdx,
      slots: state.charSlots,
      savedAtMs: stamp
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.charSlots[state.activeSlotIdx]));

    if (localFileSync.dirHandle || localFileSync.handle || localFileSync.localApiAvailable) {
      writeBundleToLinkedLocalFile();
    }
    if (wsWanted && wsIsOpen()) {
      sendServerSave(true);
    }

    renderCharSlotsBar();
    updateAllUI();
    renderSaveStatus();
    soundFX.play('levelup');
    const activeSlot = state.charSlots[state.activeSlotIdx];
    addLog(`📤 [세이브 파일 불러오기 성공] "${sourceFileName}"에서 캐릭터 슬롯 ${state.charSlots.length}개를 복원했습니다! (현재 선택: ${activeSlot.charName || '에이든'} Lv.${activeSlot.level || 1})`);
    return true;
  } catch (err) {
    addLog(`❗ [세이브 파일 파싱 오류] "${sourceFileName}" 파일이 올바른 JSON 형식이 아닙니다: ${err && err.message ? err.message : err}`);
    return false;
  }
}

async function linkLocalSaveFileForAutoSave() {
  if (typeof window.showDirectoryPicker === 'function') {
    try {
      // 기존 핸들을 초기화하여 새 폴더를 다시 선택할 수 있게 지원
      localFileSync.dirHandle = null;
      const dirHandle = await ensureSaveDatasDirectory(true);
      if (dirHandle) {
        const ok = await writeBundleToLinkedLocalFile();
        if (ok) {
          soundFX.play('levelup');
          addLog(`📁 [Save_Datas 폴더 자동연동 완료] 선택한 폴더 내에 "${SAVE_DATAS_FOLDER_NAME}" 폴더가 생성(연결)되었습니다! 이제 다운로드 폴더에 쌓이지 않고 "${SAVE_DATAS_FOLDER_NAME}/" 폴더에 세이브 파일이 자동 보관됩니다.`);
          return;
        }
      }
    } catch (err) {
      if (err && err.name === 'AbortError') {
        addLog('📁 [폴더 연동 취소] 폴더 선택을 취소했습니다.');
        return;
      }
    }
  }
  await exportSaveToJsonFile();
}

function renderSaveStatus() {
  const startBadge = document.getElementById('startSaveTimeBadge');
  const headerBadge = document.getElementById('headerSaveStatus');
  const gameBadge = document.getElementById('coopStatusBadge');
  let text = null, headerText = null, tone = 'ok', gameText = '💾 자동저장';
  const nowTime = state.lastSavedAt && state.lastSavedAt !== '초기 상태' ? state.lastSavedAt : '준비됨';

  if (!wsWanted && !wsIsOpen()) {
    if (localFileSync.dirHandle || localFileSync.handle || localFileSync.localApiAvailable) {
      const t = localFileSync.lastFileSavedAt || nowTime;
      text = `📁 파일+브라우저 자동저장 완료 (${t})`;
      headerText = `📁 파일+브라우저 저장 (${t})`;
      tone = 'ok';
      gameText = '📁 파일 자동저장 ✓';
    } else {
      text = `💻 오프라인 자동저장 완료 (${nowTime})`;
      headerText = `💻 오프라인 자동저장 (${nowTime})`;
      tone = 'ok';
      gameText = '💻 로컬 자동저장 ✓';
    }
  } else if (saveSync.halted) {
    text = `⛔ 서버 저장 중단: ${saveSync.error}`; headerText = text; tone = 'error'; gameText = '⛔ 서버 저장 중단';
  } else if (saveSync.status === 'error') {
    text = `⚠️ 서버 저장 실패: ${saveSync.error} (로컬 저장됨)`; headerText = '⚠️ 로컬 저장됨'; tone = 'warn'; gameText = '⚠️ 로컬 저장됨';
  } else if (saveSync.inFlight) {
    text = '💾 서버 저장 중...'; headerText = text; tone = 'warn'; gameText = '💾 저장 중...';
  } else if (saveSync.dirty) {
    const online = saveSync.ready && wsIsOpen();
    text = online ? '💾 서버 저장 대기 중...' : `💻 브라우저 자동저장됨 (${nowTime})`;
    headerText = text;
    tone = online ? 'warn' : 'ok';
    gameText = online ? '💾 저장 대기' : '💻 로컬 저장 ✓';
  } else if (saveSync.lastOkAt) {
    text = `💾 서버 저장 완료 ${saveSync.lastOkAt}`; headerText = text; gameText = '💾 서버 저장 ✓';
  } else if (saveSync.ready) {
    text = '💾 RPi4 서버 연결됨 · 자동저장 활성화'; headerText = text;
  }
  if (text === null) return;
  if (startBadge) {
    startBadge.textContent = text;
    startBadge.title = localFileSync.handle ? `연동 파일: ${localFileSync.fileName} (${text})` : text;
    startBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-mono border max-w-[280px] sm:max-w-[340px] truncate whitespace-nowrap ' + SAVE_TONES[tone];
  }
  if (headerBadge) {
    headerBadge.textContent = headerText || text;
    headerBadge.title = localFileSync.handle ? `연동 파일: ${localFileSync.fileName}` : `오프라인 싱글플레이 세이브 (ID ${USER_ID})`;
    headerBadge.className = 'hidden md:inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border max-w-[230px] xl:max-w-[290px] truncate whitespace-nowrap ' + SAVE_TONES[tone];
  }
  if (gameBadge) {
    gameBadge.textContent = gameText;
    gameBadge.className = 'text-[10px] px-1.5 py-0.2 rounded ' + SAVE_GAME_TONES[tone];
  }
}

function sendServerSave(immediate = false) {
  saveSync.dirty = true;
  if (saveSync.halted) { renderSaveStatus(); return; }
  clearTimeout(saveSync.debounceTimer);
  saveSync.debounceTimer = null;
  if (immediate) { flushServerSave(); return; }
  saveSync.debounceTimer = setTimeout(flushServerSave, SAVE_DEBOUNCE_MS);
  renderSaveStatus();
}

function flushServerSave(force = false) {
  clearTimeout(saveSync.debounceTimer);
  saveSync.debounceTimer = null;
  if (!saveSync.dirty || saveSync.halted || (!force && saveSync.inFlight)) return;
  if (!IS_HTTP) return;
  if (!saveSync.ready || !wsIsOpen()) { renderSaveStatus(); return; }   // 연결/동기화 후 자동 전송
  const bundle = buildServerSaveBundle();
  if (!bundle.slots.length) { saveSync.dirty = false; return; }
  const id = ++saveSync.seq;
  const packet = JSON.stringify({
    type: 'save_progress', saveId: id, baseRev: saveSync.baseRev,
    writer: SAVE_SESSION_ID, saveData: bundle,
    clientMeta: getClientDeviceMeta()
  });
  try {
    state.ws.send(packet);
  } catch (err) {
    markSaveFailed('전송 실패');
    return;
  }
  saveSync.dirty = false;
  saveSync.inFlight = { id };
  clearTimeout(saveSync.ackTimer);
  saveSync.ackTimer = setTimeout(() => {
    if (saveSync.inFlight && saveSync.inFlight.id === id) markSaveFailed('서버 응답 없음');
  }, SAVE_ACK_TIMEOUT_MS);
  renderSaveStatus();
}

function onSaveConfirmed(m) {
  const inf = saveSync.inFlight;
  if (!inf || (m.saveId != null && m.saveId !== inf.id)) return;   // 오래된 응답 무시
  clearTimeout(saveSync.ackTimer);
  clearTimeout(saveSync.retryTimer);
  saveSync.inFlight = null;
  if (m.userId) adoptServerUserId(m.userId);
  saveSync.baseRev = Math.max(0, Number(m.rev) || saveSync.baseRev);
  saveSync.status = 'ok';
  saveSync.error = '';
  saveSync.lastOkAt = m.lastSavedAt || new Date().toTimeString().split(' ')[0];
  state.lastSavedAt = saveSync.lastOkAt;
  if (saveSync.failedBefore) {
    saveSync.failedBefore = false;
    addLog('✅ [서버 저장 복구] 서버 저장이 다시 정상 동작합니다.');
  }
  if (saveSync.manualPending && !saveSync.dirty) {
    saveSync.manualPending = false;
    addLog(`✅ [서버 저장 확인] RPi 4 서버가 저장을 확인했습니다. (${saveSync.lastOkAt})`);
  }
  renderSaveStatus();
  if (saveSync.dirty) sendServerSave();
}

function markSaveFailed(reason, retry = true) {
  clearTimeout(saveSync.ackTimer);
  clearTimeout(saveSync.retryTimer);
  saveSync.inFlight = null;
  saveSync.dirty = true;
  saveSync.status = 'error';
  saveSync.error = reason;
  if (!saveSync.failedBefore) {
    saveSync.failedBefore = true;
    addLog(`⚠️ [서버 저장 실패] ${reason} — 브라우저에는 저장되어 있으며 서버 저장을 자동으로 재시도합니다.`);
  }
  renderSaveStatus();
  if (retry && !saveSync.halted) saveSync.retryTimer = setTimeout(flushServerSave, SAVE_RETRY_MS);
}

function haltServerSaves(message) {
  saveSync.halted = true;
  saveSync.inFlight = null;
  saveSync.status = 'error';
  saveSync.error = message;
  clearTimeout(saveSync.ackTimer);
  clearTimeout(saveSync.retryTimer);
  clearTimeout(saveSync.debounceTimer);
  addLog(`⛔ [서버 저장 중단] ${message}`);
  renderSaveStatus();
}

// 창을 닫거나 숨길 때: 마지막 상태를 브라우저에 저장하고 서버 전송(WebSocket + HTTP sendBeacon)을 즉시 실행
function flushServerSaveOnExit() {
  try {
    if (!wsWanted && !saveSync.halted) {
      saveAllCharSlots();
      return;
    }
    if (!IS_HTTP) return;
    const hadDirtyOrInFlight = Boolean(saveSync.dirty || saveSync.inFlight);
    if (saveSync.initialSyncDone && !saveSync.halted) {
      saveAllCharSlots();   // 동기화 완료 후에는 최신 상태를 로컬과 서버 대기열에 반영
    }
    if (hadDirtyOrInFlight || saveSync.dirty) {
      flushServerSave(true);
      if (saveSync.initialSyncDone && !saveSync.halted && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function' && typeof Blob !== 'undefined') {
        const bundle = buildServerSaveBundle();
        if (bundle.slots.length > 0) {
          const body = JSON.stringify({
            type: 'save_progress',
            saveId: ++saveSync.seq,
            baseRev: saveSync.baseRev,
            writer: SAVE_SESSION_ID,
            saveData: bundle,
            clientMeta: getClientDeviceMeta()
          });
          navigator.sendBeacon(`/api/save?user=${encodeURIComponent(USER_ID)}`, new Blob([body], { type: 'application/json' }));
        }
      }
    }
  } catch (err) {}
}
window.addEventListener('pagehide', flushServerSaveOnExit);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flushServerSaveOnExit();
});
window.addEventListener('beforeunload', (e) => {
  flushServerSaveOnExit();
  if (IS_HTTP && !saveSync.halted && saveSync.inFlight) {   // 서버 확인 전이면 한 번 더 확인
    e.preventDefault();
    e.returnValue = '';
  }
});

function saveAllCharSlots() {
  try {
    const currentPayload = exportSavePayload(false);
    if (!Array.isArray(state.charSlots) || state.charSlots.length === 0) {
      state.charSlots = [currentPayload];
      state.activeSlotIdx = 0;
    } else {
      state.activeSlotIdx = Math.max(0, Math.min(state.charSlots.length - 1, state.activeSlotIdx));
      state.charSlots[state.activeSlotIdx] = currentPayload;
    }
    localStorage.setItem(SLOTS_STORAGE_KEY, JSON.stringify({
      activeSlotIdx: state.activeSlotIdx,
      slots: state.charSlots,
      savedAtMs: currentPayload.savedAtMs || Date.now()
    }));
  } catch (err) {}
  if (localFileSync.dirHandle || localFileSync.handle || localFileSync.localApiAvailable) {
    writeBundleToLinkedLocalFile();
  }
  if (wsWanted || wsIsOpen()) {
    sendServerSave();
  } else {
    renderSaveStatus();
  }
}

function loadAllCharSlotsOnBoot() {
  try {
    const rawSlots = localStorage.getItem(SLOTS_STORAGE_KEY);
    if (rawSlots) {
      const parsed = JSON.parse(rawSlots);
      if (parsed && Array.isArray(parsed.slots) && parsed.slots.length > 0) {
        state.charSlots = parsed.slots;
        state.activeSlotIdx = Math.max(0, Math.min(parsed.slots.length - 1, Number(parsed.activeSlotIdx || 0)));
        applySavedPayload(state.charSlots[state.activeSlotIdx]);
        return true;
      }
    }
  } catch (err) {}
  return false;
}


// ===== Raspberry Pi 4 서버 연결 (세이브 동기화 + ESP32 입력 수신) =====
const WS_PORT = 8765;
const IS_HTTP = location.protocol === 'http:' || location.protocol === 'https:';
const USER_ID_STORAGE_KEY = 'aetherblade64_user_id_v1';
const USER_ID_COOKIE = 'aetherblade64_uid';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let USER_ID_PERSISTED = true;
let USER_ID_WAS_STORED = false;

function normalizeUuid(v) {
  return (typeof v === 'string' && UUID_RE.test(v.trim())) ? v.trim().toLowerCase() : null;
}

function persistUserId(id) {
  const clean = normalizeUuid(id);
  if (!clean) return false;
  try { if (localStorage.getItem(USER_ID_STORAGE_KEY) !== clean) localStorage.setItem(USER_ID_STORAGE_KEY, clean); } catch (e) {}
  try { document.cookie = `${USER_ID_COOKIE}=${clean}; max-age=315360000; path=/; SameSite=Lax`; } catch (e) {}
  try { if (typeof window !== 'undefined' && 'name' in window) window.name = `aetherblade64_uid:${clean}`; } catch (e) {}
  return true;
}

function buildDefaultWsUrl(uid) {
  const wsProto = location.protocol === 'https:' ? 'wss' : 'ws';
  const wsHost = (location.port === '8081' && location.hostname)
    ? `${location.hostname}:${WS_PORT}`
    : location.host;
  return `${wsProto}://${wsHost}/ws/client?user=${encodeURIComponent(uid)}`;
}

// 사용자 ID 규칙:
//  1) URL ?user= 파라미터  2) localStorage  3) 쿠키  4) window.name(같은 탭에서 도메인 변경 시 유지)
//  5) 모두 없을 때만 새로 생성하고, 서버에 기존 세이브가 있으면 saved_progress_sync 에서 기존 UUID를 자동 복원한다.
let USER_ID = (() => {
  const readUrlParam = () => {
    try {
      if (typeof location !== 'undefined' && location.search) {
        const p = new URLSearchParams(location.search);
        return normalizeUuid(p.get('user'));
      }
    } catch (e) {}
    return null;
  };
  const readStorage = () => { try { return normalizeUuid(localStorage.getItem(USER_ID_STORAGE_KEY)); } catch (e) { return null; } };
  const readCookie = () => {
    try {
      const m = document.cookie.match(/(?:^|;\s*)aetherblade64_uid=([^;]+)/);
      return m ? normalizeUuid(decodeURIComponent(m[1])) : null;
    } catch (e) { return null; }
  };
  const readWinName = () => {
    try {
      if (typeof window !== 'undefined' && typeof window.name === 'string' && window.name.startsWith('aetherblade64_uid:')) {
        return normalizeUuid(window.name.slice('aetherblade64_uid:'.length));
      }
    } catch (e) {}
    return null;
  };
  let id = readUrlParam() || readStorage() || readCookie() || readWinName();
  if (id) {
    USER_ID_WAS_STORED = true;
  } else {
    id = (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          return (c === 'x' ? r : (r & 3 | 8)).toString(16);
        });
    id = id.toLowerCase();
  }
  persistUserId(id);
  USER_ID_PERSISTED = readStorage() === id || readCookie() === id;
  return id;
})();
document.getElementById('wsUrlInput').value = buildDefaultWsUrl(USER_ID);

function adoptServerUserId(newId) {
  const clean = normalizeUuid(newId);
  if (!clean || clean === USER_ID) return false;
  USER_ID = clean;
  USER_ID_WAS_STORED = true;
  persistUserId(USER_ID);
  const inp = document.getElementById('wsUrlInput');
  if (inp) inp.value = buildDefaultWsUrl(USER_ID);
  return true;
}

function getWebglRendererSig() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext && (c.getContext('webgl') || c.getContext('experimental-webgl'));
    if (!gl || typeof gl.getExtension !== 'function') return '';
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    return dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
  } catch (e) {
    return '';
  }
}

const CACHED_GPU_SIG = getWebglRendererSig();

function getClientDeviceMeta() {
  const nav = (typeof navigator !== 'undefined' && navigator) ? navigator : {};
  const ua = String(nav.userAgent || '');
  const platform = String(nav.platform || '');
  const cores = Number(nav.hardwareConcurrency || 0);
  const mem = Number(nav.deviceMemory || 0);
  const lang = String(nav.language || '');
  const scr = (typeof window !== 'undefined' && window.screen)
    ? `${window.screen.width || 0}x${window.screen.height || 0}x${window.screen.colorDepth || 0}@${window.devicePixelRatio || 1}`
    : '';
  const tz = (() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; }
  })();
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
  const rawSig = [ua, platform, scr, cores, mem, lang, tz, CACHED_GPU_SIG].join('|');
  const hasAnySig = Boolean(ua || platform || scr || cores || mem || CACHED_GPU_SIG);
  return {
    deviceSig: hasAnySig ? rawSig.slice(0, 600) : '',
    isMobile,
    host: (typeof location !== 'undefined' && location.host) ? String(location.host) : ''
  };
}

function normalizeServerSaveData(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (Array.isArray(raw.slots)) return raw;
  if (raw.charName || raw.charClass || raw.level) {
    return {
      v: 1,
      activeSlotIdx: 0,
      slots: [raw],
      savedAtMs: Number(raw.savedAtMs || 0),
      lastSavedAt: raw.lastSavedAt || '',
      serverRev: raw.serverRev
    };
  }
  return null;
}

let wsRetry = 0, wsTimer = null, wsWanted = false, lastExtInputMs = 0, pingTimer = null;

function setWsUi(connected, text) {
  document.getElementById('wsStatusDot').className =
    'w-2 h-2 rounded-full ' + (connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500');
  document.getElementById('wsStatusText').textContent = text;
}

function isGameViewVisible() {
  return !document.getElementById('viewGame').classList.contains('hidden');
}

const WS_HANDLERS = {
  // 사용자별 서버 세이브와 이 브라우저의 캐릭터 슬롯을 동기화
  saved_progress_sync(m) {
    // 다른 기기에서 공유된 UUID로 접근했을 때 서버가 즉시 새 전용 UUID로 분리(forceNewUser)한 경우
    if (m && m.forceNewUser && m.userId) {
      adoptServerUserId(m.userId);
      try {
        // 세이브 키 초기화 방지 (하위 호환 유지)
        // 세이브 키 초기화 방지 (하위 호환 유지)
      } catch (e) {}
      saveSync.bootHadLocal = false;
      saveSync.dirty = false;
      saveSync.baseRev = 0;
      saveSync.initialSyncDone = true;
      saveSync.ready = true;
      clearTimeout(saveSync.debounceTimer);
      state.charSlots = [];
      state.activeSlotIdx = 0;
      state.player.name = '에이든';
      state.player.gender = 'male';
      state.player.customCreated = false;
      resetAllProgressToNewGame('knight', true);
      state.charSlots = [exportSavePayload(true)];
      renderCharSlotsBar();
      updateAllUI();
      renderSaveStatus();
      addLog(`👤 [개별 세이브 분리] 이 기기 전용 독립 계정(ID ${USER_ID.slice(0, 8)})으로 설정되었습니다. 나만의 캐릭터로 플레이하세요!`);
      return;
    }

    const adoptedFromServer = Boolean(m && m.userId && adoptServerUserId(m.userId));
    const serverData = normalizeServerSaveData(m && m.saveData);
    const serverRev = serverData ? Math.max(0, Number(serverData.serverRev) || 0) : 0;
    if (m.loadError) addLog('⚠️ [서버 세이브] 서버의 세이브 파일을 읽지 못했습니다. (서버 saves/ 폴더의 .bak / backups 확인)');

    // 재연결 동기화: 진행 중인 게임 상태는 건드리지 않고, 저장 기준 버전만 확인
    if (saveSync.initialSyncDone) {
      if (serverData && serverData.lastWriter && serverData.lastWriter !== SAVE_SESSION_ID && serverRev !== saveSync.baseRev) {
        haltServerSaves('다른 창/기기에서 더 최신 저장이 있습니다. 이 창을 새로고침(F5)하세요.');
        return;
      }
      saveSync.baseRev = serverRev;
      saveSync.ready = true;
      if (saveSync.dirty) sendServerSave(true);
      renderSaveStatus();
      return;
    }

    let localSave = null;
    try {
      const rawSlots = localStorage.getItem(SLOTS_STORAGE_KEY);
      if (rawSlots) {
        const parsed = JSON.parse(rawSlots);
        if (parsed && Array.isArray(parsed.slots)) {
          const times = parsed.slots.map(slot => Number(slot && slot.savedAtMs || 0));
          localSave = {
            activeSlotIdx: Number(parsed.activeSlotIdx || 0),
            slots: parsed.slots,
            savedAtMs: Math.max(Number(parsed.savedAtMs || 0), times.length ? Math.max(...times) : 0)
          };
        }
      }
      if (!localSave) {
        const oldPayload = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        if (oldPayload) localSave = {
          activeSlotIdx: 0, slots: [oldPayload], savedAtMs: Number(oldPayload.savedAtMs || 0)
        };
      }
    } catch (e) {}

    const serverSlotTimes = (serverData && Array.isArray(serverData.slots))
      ? serverData.slots.map(s => Number(s && s.savedAtMs || 0))
      : [];
    const serverTime = serverData
      ? Math.max(Number(serverData.savedAtMs || 0), serverSlotTimes.length ? Math.max(...serverSlotTimes) : 0)
      : 0;
    const localTime = localSave ? Number(localSave.savedAtMs || 0) : 0;
    const localHasProg = hasMeaningfulProgress(localSave);
    const serverHasProg = hasMeaningfulProgress(serverData);

    // 서버 세이브가 존재할 때:
    //  1) 새 도메인 접속 등으로 서버에서 기존 UUID를 복원받았거나(adoptedFromServer)
    //  2) 부팅 시 로컬 세이브가 없었거나(!saveSync.bootHadLocal || !localSave)
    //  3) 로컬 세이브가 아무 진행 없는 초기 기본 캐릭터(!localHasProg)이거나
    //  4) 구버전 서버 세이브(serverTime === 0)에 진행 데이터가 있거나, 서버 타임스탬프가 로컬 이상이면 서버 데이터를 사용!
    const useServer = Boolean(serverData && Array.isArray(serverData.slots) && serverData.slots.length > 0) && (
      adoptedFromServer ||
      !saveSync.bootHadLocal ||
      !localSave ||
      !localHasProg ||
      (serverHasProg && serverTime === 0) ||
      serverTime >= localTime
    );
    if (useServer) {
      state.charSlots = Array.isArray(serverData.slots) ? serverData.slots : [];
      state.activeSlotIdx = state.charSlots.length
        ? Math.max(0, Math.min(state.charSlots.length - 1, Number(serverData.activeSlotIdx || 0))) : 0;
      saveSync.dirty = false;   // 동기화 전에 쌓인 기본 상태 저장 요청은 버림 (서버 세이브를 덮어쓰지 않도록)
      clearTimeout(saveSync.debounceTimer);
      try {
        if (state.charSlots.length) {
          applySavedPayload(state.charSlots[state.activeSlotIdx]);
          const syncStamp = serverTime || Date.now();
          localStorage.setItem(SLOTS_STORAGE_KEY, JSON.stringify({
            activeSlotIdx: state.activeSlotIdx, slots: state.charSlots, savedAtMs: syncStamp
          }));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state.charSlots[state.activeSlotIdx]));
          renderCharSlotsBar();
          addLog(`💾 [RPi 4 사용자별 서버 저장] 캐릭터 슬롯(${state.charSlots.length}개)을 서버에서 불러왔습니다! (ID ${USER_ID.slice(0, 8)})`);
        } else {
          // 세이브 키 초기화 방지 (하위 호환 유지)
          // 세이브 키 초기화 방지 (하위 호환 유지)
        }
      } catch (e) {
        addLog('⚠️ [서버 세이브] 불러온 데이터를 브라우저에 기록하지 못했습니다: ' + e);
      }
    } else if (localSave && localHasProg) {
      saveSync.dirty = true;    // 이 브라우저에서 오프라인 중 실제로 더 진행한 저장본이 있으면 서버로 올려 보존
    }
    saveSync.baseRev = serverRev;
    saveSync.initialSyncDone = true;
    saveSync.ready = true;
    if (saveSync.dirty) sendServerSave(true);
    renderSaveStatus();
  },
  save_confirmed(m) {
    onSaveConfirmed(m);
  },
  save_failed(m) {
    const inf = saveSync.inFlight;
    if (!inf || (m.saveId != null && m.saveId !== inf.id)) return;
    const reason = String(m.reason || 'unknown');
    const msg = String(m.message || reason).slice(0, 120);
    if (reason === 'conflict') {
      haltServerSaves('다른 창/기기에서 더 최신 저장이 있습니다. 이 창을 새로고침(F5)하세요.');
      return;
    }
    markSaveFailed(msg, reason !== 'invalid' && reason !== 'empty_rejected');
  },
  // ESP32 → Pi → 브라우저: 조이스틱/기울기 (약 50Hz)
  sensor_axis(m) {
    state.sensor.extJoyX = Math.max(-1, Math.min(1, +m.joyX || 0));
    state.sensor.extJoyY = Math.max(-1, Math.min(1, +m.joyY || 0));
    // 서버가 검증한 IMU/터치 수치 → 텔레메트리 패널
    if (m.gyroDeg != null)  state.sensor.gyroDeg = +m.gyroDeg || 0;
    if (m.accelG != null)   state.sensor.accelG  = Math.max(1.0, +m.accelG || 1.0);
    if (m.touch0 != null)   state.sensor.touch0Active = !!m.touch0;
    if (m.touch3 != null)   state.sensor.touch3Active = !!m.touch3;
    if (state.sensor.extJoyX || state.sensor.extJoyY) state.sensor.source = 'ESP32_JOY';
    lastExtInputMs = performance.now();
  },
  // ESP32 → Pi → 브라우저: 버튼/제스처 이벤트
  pong(m) {   // 노트북 ↔ 파이 왕복 지연
    const rtt = Math.round(performance.now() - m.t);
    if (state.wsConnected) setWsUi(true, `RPi 4 연결됨 · ${rtt}ms`);
  },
  sensor_event(m) {
    if (!isGameViewVisible()) return;
    if (!Object.prototype.hasOwnProperty.call(COOLDOWNS, m.action)) return;
    state.sensor.source = 'ESP32';
    triggerSensorAction(m.action, 'ESP32_' + String(m.src || m.action).toUpperCase());
  }
};

function connectWs() {
  const url = document.getElementById('wsUrlInput').value.trim();
  wsWanted = true;
  clearTimeout(wsTimer);
  saveSync.ready = false;                                       // 새 연결에서 서버 동기화가 끝나기 전에는 저장 전송 안 함
  if (saveSync.inFlight) markSaveFailed('서버 재연결', false);   // 재연결 동기화 후 자동 재전송
  if (state.ws) { state.ws.onclose = null; try { state.ws.close(); } catch (e) {} }
  setWsUi(false, '연결 시도 중...');
  let ws;
  try { ws = new WebSocket(url); }
  catch (e) { setWsUi(false, '주소 오류'); return; }
  state.ws = ws;
  let wsOpened = false;
  ws.onopen = () => {
    wsOpened = true;
    wsRetry = 0;
    state.wsConnected = true;
    setWsUi(true, 'RPi 4 서버 연결됨');
    clearInterval(pingTimer);
    pingTimer = setInterval(() => {
      if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'ping', t: performance.now() }));
    }, 2000);
    addLog(`[네트워크] Raspberry Pi 4 서버(${url.split('?')[0]})에 연결되었습니다! (사용자 ID ${USER_ID.slice(0, 8)})`);
    ws.send(JSON.stringify({
      type: 'load_user_save',
      clientMeta: {
        idWasStored: USER_ID_WAS_STORED,
        hadLocalSave: saveSync.bootHadLocal,
        localHasProgress: hasMeaningfulProgress({ slots: state.charSlots }),
        ...getClientDeviceMeta()
      }
    }));
  };
  ws.onmessage = (ev) => {
    let m;
    try { m = JSON.parse(ev.data); } catch (e) { return; }
    const h = WS_HANDLERS[m && m.type];
    if (h) h(m);
  };
  ws.onclose = () => {
    if (state.ws !== ws) return;          // 이미 새 연결로 교체된 이전 연결
    state.wsConnected = false;
    clearInterval(pingTimer);
    state.sensor.extJoyX = 0; state.sensor.extJoyY = 0;   // 연결이 끊기면 캐릭터가 계속 걷지 않도록
    saveSync.ready = false;
    if (saveSync.inFlight) markSaveFailed('서버 연결 끊김', false);   // 재연결 후 동기화되면 자동 재전송
    setWsUi(false, wsOpened ? '재연결 대기...' : '서버 연결 실패 (재시도 중)');
    renderSaveStatus();
    if (wsWanted) wsTimer = setTimeout(connectWs, Math.min(10000, 500 * 2 ** wsRetry++));
  };
  ws.onerror = () => {};   // 항상 onclose가 뒤따름
}
document.getElementById('btnConnectWs').addEventListener('click', () => { wsRetry = 0; connectWs(); });

// ESP32 입력이 0.5초 이상 끊기면 조이스틱을 0으로 (안전장치)
setInterval(() => {
  if (lastExtInputMs && performance.now() - lastExtInputMs > 500) {
    state.sensor.extJoyX = 0; state.sensor.extJoyY = 0; lastExtInputMs = 0;
  }
}, 200);

// 게임 화면 플레이 중 캐릭터 좌표/체력/마나 변동 시 3초마다 주기적 자동 저장 (오프라인 로컬 및 연동 파일 즉시 반영)
let lastAutoSnap = '';
setInterval(() => {
  if (saveSync.halted || !isGameViewVisible() || state.gameOver) return;
  if (wsWanted && !saveSync.initialSyncDone) return;
  const p = state.player;
  const snap = `${state.zoneId}:${Math.round(p.x)}:${Math.round(p.y)}:${Math.round(p.hp)}:${Math.round(p.mp)}:${p.level}:${p.exp}:${p.gold}:${state.kills}`;
  if (lastAutoSnap && snap !== lastAutoSnap) {
    saveAllCharSlots();
  }
  lastAutoSnap = snap;
}, 3000);
