// ============================================================================
// [core/combatAndQuests.js] 신비의 대륙 v2.0 — 전투·레벨·워프·조건부 맵 입장·다중 페이지 대사 & 항해 연동
//  - 메이플스토리 스타일 다중 페이지(한 문장씩 넘기기) NPC 대사창 시스템
//  - 메인 7장 클리어 후 세이렌 대화창 내 [⛵ 섬 항해 (Enter/F)] 및 [✕ 대화 종료 (ESC)] 버튼 활성화
//  - 메인 7~20장 중간 NPC 대화(midNpcId: 비어 케이브 세이렌, 해적 길목 니콜라스, 오션블루 세이렌) 연동
//  - 플레이어 만렙 Lv.30 제한 및 몬스터 처치 시 레벨 차이 1당 경험치/골드 10% 감소 공식
//  - 해적 3세트, 바이킹 3세트, 수상한 펜던트, 에리크의 붉은 가죽 갑옷, 해왕의 검 효과
//  - 집 앞 -> 집 안 귀환, 해변길 1~3 -> 포레스트 타운 귀환, 조건부 신 맵 포털 잠금
// ============================================================================

// 업데이트 메모장의 줄바꿈(\n) 기준으로 대사창 페이지를 분리하는 함수
function splitDialogTextToLines(rawText) {
  if (Array.isArray(rawText)) {
    const out = [];
    rawText.forEach(item => {
      String(item || '')
        .split(/\r?\n/)
        .map(s => s.trim())
        .filter(Boolean)
        .forEach(line => out.push(line));
    });
    return out.length > 0 ? out : ['...'];
  }
  const str = String(rawText || '').trim();
  if (!str) return ['...'];

  // 업데이트 메모장의 줄바꿈(\n)을 기준으로 각 줄을 별도의 대사창 페이지로 분리
  const lines = str
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  return lines.length > 0 ? lines : [str];
}

// 메이플스토리 스타일 다중 페이지 NPC 대화창 열기
function openNpcDialogPages(speakerTitle, linesInput, options = {}) {
  const rawLines = Array.isArray(linesInput) && linesInput.length > 0
    ? linesInput
    : splitDialogTextToLines(linesInput);

  const pages = rawLines.map(line => formatGenderDialog(line));
  if (options.rewardSuffix && pages.length > 0) {
    pages[pages.length - 1] = `${pages[pages.length - 1]} ${options.rewardSuffix}`;
  }

  state.isTalkingToNpc = true;
  state.dialogSpeaker = speakerTitle || '💬 NPC';
  state.dialogPages = pages.length > 0 ? pages : ['...'];
  state.dialogPageIdx = 0;
  state.dialogMeta = {
    canSail: Boolean(options.canSail),
    canCraft: Boolean(options.canCraft),
    npcId: options.npcId || null,
    npcName: options.npcName || ''
  };

  renderCurrentNpcDialogPage();
  const box = document.getElementById('npcDialogBox');
  if (box) box.classList.remove('hidden');
}

// 현재 페이지의 NPC 대사와 하단 안내/항해 버튼을 렌더링
function renderCurrentNpcDialogPage() {
  const pages = Array.isArray(state.dialogPages) && state.dialogPages.length > 0 ? state.dialogPages : ['...'];
  const idx = Math.max(0, Math.min(pages.length - 1, Number(state.dialogPageIdx || 0)));
  const total = pages.length;
  const isLastPage = idx >= total - 1;
  const meta = state.dialogMeta || {};

  const speakerEl = document.getElementById('npcDialogSpeaker');
  const pageBadgeEl = document.getElementById('npcDialogPageBadge');
  const textEl = document.getElementById('npcDialogText');
  const sailActionsEl = document.getElementById('npcSailingActions');
  const footerHintEl = document.getElementById('npcDialogFooterHint');
  const openSailBtn = document.getElementById('btnDialogOpenSailing');

  if (speakerEl) speakerEl.textContent = state.dialogSpeaker || '💬 대화';
  if (pageBadgeEl) pageBadgeEl.textContent = `대사 ${idx + 1} / ${total}`;
  if (textEl) textEl.textContent = pages[idx];

  // 마지막 대사 페이지에서 세이렌(섬 항해 가능) 또는 대장장이(장비 제작 가능) 버튼 표시
  if (sailActionsEl) {
    if (isLastPage && (meta.canSail || meta.canCraft)) {
      sailActionsEl.classList.remove('hidden');
      sailActionsEl.classList.add('flex');
      if (openSailBtn) {
        openSailBtn.innerHTML = meta.canSail
          ? '⛵ 섬 항해 (Enter / F)'
          : '🔨 장비 제작·교환소 열기 (Enter / F)';
      }
    } else {
      sailActionsEl.classList.add('hidden');
      sailActionsEl.classList.remove('flex');
    }
  }

  if (footerHintEl) {
    if (!isLastPage) {
      footerHintEl.textContent = `▶ [다음 대사 (${idx + 1}/${total})] Enter · F · Space · 대화창 클릭 시 다음 문장으로 넘어갑니다.`;
    } else if (meta.canSail) {
      footerHintEl.textContent = `⛵ [마지막 대사 (${total}/${total})] Enter · F 또는 [섬 항해] 클릭 시 목적지 선택 창이 열립니다. (ESC: 대화 종료)`;
    } else if (meta.canCraft) {
      footerHintEl.textContent = `🔨 [마지막 대사 (${total}/${total})] Enter · F 또는 [제작·교환소] 클릭 시 대장간이 열립니다. (ESC: 대화 종료)`;
    } else {
      footerHintEl.textContent = `✔ [대화 마침 (${total}/${total})] Enter · F · Space · 대화창 클릭 시 대화를 종료합니다.`;
    }
  }
}

// 대사창에서 Enter / F / 마우스 클릭 시 다음 문장으로 넘기거나 마지막 문장에서 기능 실행 후 닫기
function advanceOrCloseNpcDialog(triggeredByKeyOrBox = true) {
  if (!state.isTalkingToNpc) return;
  const pages = Array.isArray(state.dialogPages) ? state.dialogPages : [];
  if (state.dialogPageIdx < pages.length - 1) {
    state.dialogPageIdx += 1;
    soundFX.play('slash1');
    renderCurrentNpcDialogPage();
    return;
  }

  // 마지막 페이지에서 Enter / F를 누른 경우: 세이렌이면 섬 항해 창 오픈, 대장장이면 제작 창 오픈
  const meta = state.dialogMeta || {};
  if (triggeredByKeyOrBox && meta.canSail && typeof openSailingModal === 'function') {
    const sailNpcId = meta.npcId || null;
    closeNpcDialog(true);
    openSailingModal(sailNpcId);
    return;
  }
  if (triggeredByKeyOrBox && meta.canCraft && typeof openCraftModal === 'function') {
    closeNpcDialog(true);
    openCraftModal();
    return;
  }
  closeNpcDialog();
}

// NPC 대화창 완전히 닫기 및 월드 일시정지 해제
function closeNpcDialog(silent = false) {
  if (!state.isTalkingToNpc) return;
  state.isTalkingToNpc = false;
  state.dialogPages = [];
  state.dialogPageIdx = 0;
  state.dialogMeta = {};
  const box = document.getElementById('npcDialogBox');
  if (box) box.classList.add('hidden');
  const sailActions = document.getElementById('npcSailingActions');
  if (sailActions) {
    sailActions.classList.add('hidden');
    sailActions.classList.remove('flex');
  }
  if (!silent) {
    addLog('▶️ [NPC 대화 종료] 월드 일시정지가 해제되어 전투와 이동이 재개됩니다.');
  }
}

// 해당 NPC가 현재 섬 항해 기능을 제공할 수 있는 항해사인지 판정 (메인 7장 클리어 이후 활성화)
function canNpcOfferSailing(npc) {
  if (!npc) return false;
  const isNav = Boolean(npc.canSail || ['navigator_seiren', 'seiren_flower', 'seiren_beercave', 'navigator_minato'].includes(npc.id));
  if (!isNav) return false;
  const q7 = getQuestState('main_7');
  return q7 && q7.status === 'completed';
}

// ============================================================================
// 1. 신 맵 조건부 입장 판정 (퀘스트 진행 단계별 포털/항해 해금 규칙)
// ============================================================================
const ZONE_ENTRY_CONDITIONS = {
  flower_island_1:     { questId: 'main_7',  mode: 'completed',           reqText: '메인 7장 클리어' },
  flower_island_2:     { questId: 'main_7',  mode: 'completed',           reqText: '메인 7장 클리어' },
  flower_villa:        { questId: 'main_8',  mode: 'completed',           reqText: '메인 8장 클리어' },
  beer_cave_1:         { questId: 'main_12', mode: 'active_or_completed', reqText: '메인 12장 수락' },
  beer_cave_2:         { questId: 'main_12', mode: 'active_or_completed', reqText: '메인 12장 수락' },
  beer_cave_3:         { questId: 'main_12', mode: 'active_or_completed', reqText: '메인 12장 수락' },
  erik_room:           { questId: 'main_14', mode: 'active_or_completed', reqText: '메인 14장 수락' },
  ragnar_room:         { questId: 'main_14', mode: 'completed',           reqText: '메인 14장 클리어' },
  pirate_path_1:       { questId: 'main_16', mode: 'active_or_completed', reqText: '메인 16장 수락' },
  pirate_path_2:       { questId: 'main_16', mode: 'active_or_completed', reqText: '메인 16장 수락' },
  pirate_ship_1:       { questId: 'main_16', mode: 'completed',           reqText: '메인 16장 클리어' },
  pirate_ship_2:       { questId: 'main_16', mode: 'completed',           reqText: '메인 16장 클리어' },
  pirate_queen_office: { questId: 'main_17', mode: 'completed',           reqText: '메인 17장 클리어' },
  vs_pirate_queen:     { questId: 'main_18', mode: 'active_or_completed', reqText: '메인 18장 수락' },
  minatomachi:         { questId: 'main_20', mode: 'active_or_completed', reqText: '메인 20장 수락' }
};

function isQuestConditionSatisfied(questId, mode = 'completed') {
  if (!questId) return true;
  const qs = getQuestState(questId);
  if (mode === 'active_or_completed') {
    return qs.status === 'active' || qs.status === 'completed';
  }
  return qs.status === 'completed';
}

function isZoneEntryAllowed(targetZoneId) {
  const rule = ZONE_ENTRY_CONDITIONS[targetZoneId];
  if (!rule) return true;
  if (isQuestConditionSatisfied(rule.questId, rule.mode)) return true;
  if (Array.isArray(state.unlockedSailing) && state.unlockedSailing.includes(targetZoneId)) {
    return true;
  }
  return false;
}

function isPortalUnlocked(portal) {
  if (!portal) return false;
  if (portal.unlockQuestId) {
    const mode = portal.unlockMode || 'active_or_completed';
    if (!isQuestConditionSatisfied(portal.unlockQuestId, mode)) return false;
  }
  return isZoneEntryAllowed(portal.target);
}

function getZoneLockReason(targetZoneId, portal = null) {
  const rule = ZONE_ENTRY_CONDITIONS[targetZoneId];
  const questId = (portal && portal.unlockQuestId) || (rule && rule.questId);
  const mode = (portal && portal.unlockMode) || (rule && rule.mode) || 'completed';
  const qObj = QUESTS.find(q => q.id === questId);
  const qTitle = qObj ? qObj.title : (rule ? rule.reqText : '선행 퀘스트');
  const actionWord = mode === 'active_or_completed' ? '수락(진행)' : '클리어';
  return `${qTitle} ${actionWord} 후 입장 가능`;
}

// ============================================================================
// 2. 센서/키보드 전투 액션 및 장비 세트·고유 효과 발동
// ============================================================================
function triggerSensorAction(actionKey, sourceLabel) {
  if (!isGameViewVisible() || state.gameOver || state.isModalOpen) return;

  if (state.isTalkingToNpc) {
    if (actionKey === 'interact' || actionKey === 'basic_attack') {
      advanceOrCloseNpcDialog(true);
    }
    return;
  }

  if (state.cooldownLeft[actionKey] > 0) return;

  const p = state.player;
  const derived = getDerivedStats();

  if (actionKey === 'magic_skill' && p.mp < 15) {
    addLog('[마나 부족] 3연발 화염구 발사에 마나 15가 필요합니다.');
    return;
  }
  if (actionKey === 'special_skill' && p.mp < 30) {
    addLog('[마나 부족] 아케인 마법진 소환에 마나 30이 필요합니다.');
    return;
  }

  state.cooldownLeft[actionKey] = COOLDOWNS[actionKey];
  state.sensor.lastAction = `${sourceLabel} ➔ ${actionKey}`;
  state.sensor.actionCount += 1;

  const aimAngle = Math.atan2(p.fy, p.fx);

  if (actionKey === 'dodge') {
    const dodgeLv = getClampedSkillLevel(p.skills.dodge);
    const invulnSec = +(0.52 + (dodgeLv - 1) * 0.025).toFixed(2);
    const mpBonus = 25 + (dodgeLv - 1) * 3;
    soundFX.play('dodge');
    state.sensor.gyroDeg = 195.0;
    state.sensor.roll = 42 * (p.fx >= 0 ? 1 : -1);
    p.dodgeTimer = 0.26;
    p.invulnTimer = invulnSec;

    const nearTelegraph = state.monsters.some(m =>
      m.zone === state.zoneId && m.alive &&
      ['TELEGRAPH', 'ERIK_CHARGE_AXE', 'ERIK_CHARGE_DASH', 'SERAPH_CHARGE_DASH'].includes(m.state) &&
      Math.hypot(m.x - p.x, m.y - p.y) <= 220
    );
    if (nearTelegraph) {
      state.bulletTimeTimer = 1.45;
      p.mp = Math.min(derived.maxMp, p.mp + mpBonus);
      state.screenShake = 8;
      spawnParticles(p.x, p.y, 32, ['#34d399', '#38bdf8', '#ffffff'], 240, 6, 0.6);
      state.effects.push({ kind: 'dmg_text', x: p.x, y: p.y - 32, text: `⚡ PERFECT DODGE! (MP+${mpBonus})`, color: '#34d399', ttl: 0.9 });
      addLog(`⚡ [저스트 회피 성공!] 자이로 급회전으로 적의 공격을 흘려보내 슬로우모션(Bullet-Time) 및 MP +${mpBonus} 회복이 발동합니다!`);
    } else {
      spawnParticles(p.x, p.y, 16, ['#34d399', '#38bdf8'], 150, 4, 0.35);
      addLog(`💨 [환영 회피 Lv.${dodgeLv}] 환영 잔상 대시! (${invulnSec}초 무적)`);
    }
  } else if (actionKey === 'basic_attack') {
    if (p.comboTimer > 0) {
      p.comboStep = (p.comboStep + 1) % 3;
    } else {
      p.comboStep = 0;
    }
    p.comboTimer = 0.95;
    p.attackMotionTimer = 0.36;

    const step = p.comboStep;
    const basicLv = getClampedSkillLevel(p.skills.basic_attack);
    const lvBonus = 1 + 0.20 * (basicLv - 1);
    const hasSeaKing = Boolean(derived.hasSeaKingSword);
    const clsColor = hasSeaKing ? '#0ea5e9' : (CLASSES[state.selectedClass] || CLASSES.knight).color;

    if (step === 0) {
      soundFX.play('slash1');
      state.slashArcs.push({
        x: p.x + p.fx * 10, y: p.y + p.fy * 10, angle: aimAngle, sweep: Math.PI * 0.85,
        radius: 70 + basicLv * 3, dir: 1,
        color: clsColor, coreColor: hasSeaKing ? '#e0f2fe' : '#ffffff', ttl: 0.18, maxTtl: 0.18
      });
      performMeleeHit(p.x, p.y, p.fx, p.fy, 74 + basicLv * 3, 1.0 * lvBonus, hasSeaKing ? '🌊 [해왕의 물결 1단]' : '⚔️ [1단 베기]', false, 95);
    } else if (step === 1) {
      soundFX.play('slash2');
      state.slashArcs.push({
        x: p.x + p.fx * 12, y: p.y + p.fy * 12, angle: aimAngle, sweep: Math.PI * 0.95,
        radius: 78 + basicLv * 3, dir: -1,
        color: hasSeaKing ? '#38bdf8' : '#fbbf24', coreColor: hasSeaKing ? '#ccfbf1' : '#ffffff', ttl: 0.20, maxTtl: 0.20
      });
      performMeleeHit(p.x, p.y, p.fx, p.fy, 82 + basicLv * 3, 1.30 * lvBonus, hasSeaKing ? '🌊 [해왕의 물결 2단]' : '⚔️ [2단 교차참]', false, 130);
    } else {
      soundFX.play('slash3');
      state.screenShake = 7;
      state.slashArcs.push({
        x: p.x, y: p.y, angle: aimAngle, sweep: Math.PI * 1.95,
        radius: 96 + basicLv * 4, dir: 1,
        color: hasSeaKing ? '#2dd4bf' : '#f43f5e', coreColor: hasSeaKing ? '#e0f2fe' : '#fde047', ttl: 0.26, maxTtl: 0.26
      });
      spawnParticles(
        p.x, p.y, 24,
        hasSeaKing ? ['#0ea5e9', '#38bdf8', '#2dd4bf', '#e0f2fe'] : ['#f43f5e', '#fbbf24', '#ffffff'],
        220, 5, 0.45
      );
      performMeleeHit(p.x, p.y, p.fx, p.fy, 98 + basicLv * 4, 1.80 * lvBonus, hasSeaKing ? '🌊 [해왕의 소용돌이 3단!]' : '🌪️ [3단 회전참!]', false, 210);
    }

    if (hasSeaKing) {
      triggerSeaKingWaveShards(aimAngle, derived);
    }
  } else if (actionKey === 'heavy_attack') {
    const heavyLv = getClampedSkillLevel(p.skills.heavy_attack);
    p.attackMotionTimer = 0.50;
    soundFX.play('heavy');
    state.sensor.accelG = 2.65;
    state.sensor.pitch = -35;
    state.screenShake = 14;
    const rad = 126 + (heavyLv - 1) * 6;
    state.effects.push({ kind: 'quake_crater', x: p.x, y: p.y, r: rad, ttl: 0.55, maxTtl: 0.55 });
    spawnParticles(p.x, p.y, 42, ['#f43f5e', '#f97316', '#fde047', '#ffffff'], 280, 6, 0.65);
    performMeleeHit(p.x, p.y, p.fx, p.fy, rad, 2.40 + 0.32 * (heavyLv - 1), '💥 [가속도 2.65G 대지 분쇄]', true, 280);
  } else if (actionKey === 'magic_skill') {
    const magicLv = getClampedSkillLevel(p.skills.magic_skill);
    p.attackMotionTimer = 0.35;
    soundFX.play('magic');
    state.sensor.touch0Active = true;
    setTimeout(() => { state.sensor.touch0Active = false; }, 300);
    p.mp = Math.max(0, p.mp - 15);
    const spreadAngles = [-0.22, 0, 0.22];
    spreadAngles.forEach(offset => {
      const ang = aimAngle + offset;
      state.projectiles.push({
        x: p.x + Math.cos(ang) * 20,
        y: p.y + Math.sin(ang) * 20,
        vx: Math.cos(ang) * 430,
        vy: Math.sin(ang) * 430,
        r: 12,
        dmg: Math.round(derived.atk * (1.40 + 0.25 * (magicLv - 1))),
        color: '#f97316',
        ttl: 1.5,
        isEnemy: false
      });
    });
    spawnParticles(p.x + p.fx * 20, p.y + p.fy * 20, 18, ['#f97316', '#fde047', '#c084fc'], 170, 5, 0.4);
    addLog('🔥 [터치 센서 T0] 3연발 확산 플라즈마 화염구 발사!');
  } else if (actionKey === 'special_skill') {
    const specLv = getClampedSkillLevel(p.skills.special_skill);
    p.attackMotionTimer = 0.55;
    soundFX.play('heavy');
    state.sensor.touch3Active = true;
    setTimeout(() => { state.sensor.touch3Active = false; }, 450);
    p.mp = Math.max(0, p.mp - 30);
    state.screenShake = 18;
    const rad = 190 + (specLv - 1) * 7;
    state.effects.push({ kind: 'arcane_circle', x: p.x, y: p.y, r: rad, ttl: 0.85, maxTtl: 0.85 });
    spawnParticles(p.x, p.y, 60, ['#c084fc', '#38bdf8', '#fde047', '#ffffff'], 340, 7, 0.8);
    performMeleeHit(p.x, p.y, p.fx, p.fy, rad, 3.20 + 0.42 * (specLv - 1), '✨ [터치 센서 T3 아케인 마법진]', true, 320);
  } else if (actionKey === 'interact') {
    handleWorldInteraction();
  }
}

function triggerSeaKingWaveShards(aimAngle, derived) {
  const p = state.player;
  const shardAngles = [-0.26, 0, 0.26];
  const shardDmg = Math.max(1, Math.round(derived.atk * 0.42));
  shardAngles.forEach(off => {
    const ang = aimAngle + off;
    state.projectiles.push({
      x: p.x + Math.cos(ang) * 24,
      y: p.y + Math.sin(ang) * 24,
      vx: Math.cos(ang) * 410,
      vy: Math.sin(ang) * 410,
      r: 9,
      dmg: shardDmg,
      color: '#38bdf8',
      ttl: 0.65,
      isEnemy: false,
      kind: 'wave_shard'
    });
  });
  spawnParticles(p.x + p.fx * 24, p.y + p.fy * 24, 14, ['#0ea5e9', '#38bdf8', '#2dd4bf', '#e0f2fe'], 185, 4, 0.35);
}

function tryTriggerPirateSetBurst(derived) {
  const p = state.player;
  if (!derived || !derived.pirate3Set) return;
  if ((p.pirateSetCdTimer || 0) > 0) return;
  const procChance = (typeof EQUIPMENT_SETS !== 'undefined' && EQUIPMENT_SETS.pirate)
    ? EQUIPMENT_SETS.pirate.procChance
    : 0.08;
  if (Math.random() >= procChance) return;

  p.pirateSetCdTimer = (typeof EQUIPMENT_SETS !== 'undefined' && EQUIPMENT_SETS.pirate)
    ? EQUIPMENT_SETS.pirate.cooldownSec
    : 10.0;
  const bulletCount = (typeof EQUIPMENT_SETS !== 'undefined' && EQUIPMENT_SETS.pirate)
    ? EQUIPMENT_SETS.pirate.bulletCount
    : 10;
  const burstDmg = Math.max(1, Math.round(derived.atk * 1.15));

  for (let i = 0; i < bulletCount; i++) {
    const ang = (Math.PI * 2 * i) / bulletCount;
    state.projectiles.push({
      x: p.x + Math.cos(ang) * 18,
      y: p.y + Math.sin(ang) * 18,
      vx: Math.cos(ang) * 360,
      vy: Math.sin(ang) * 360,
      r: 10,
      dmg: burstDmg,
      color: '#38bdf8',
      ttl: 1.25,
      isEnemy: false,
      kind: 'pirate_ring'
    });
  }
  spawnParticles(p.x, p.y, 28, ['#38bdf8', '#2dd4bf', '#fbbf24', '#ffffff'], 230, 5, 0.5);
  state.effects.push({
    kind: 'dmg_text',
    x: p.x,
    y: p.y - 38,
    text: '🏴‍☠️ 해적 3세트! 원형 포격 발사!',
    color: '#38bdf8',
    ttl: 0.95
  });
  addLog('🏴‍☠️ [해적 3세트 발동!] 공격 중 8% 확률이 터져 사방으로 원형 해적 투사체를 발사합니다! (쿨타임 10초)');
}

function trySuspiciousPendantEvade(monsterLv = 1, isBoss = false) {
  if (isBoss) return false;
  const derived = getDerivedStats();
  if (!derived.hasSuspiciousPendant) return false;
  const p = state.player;
  const lvDiff = Math.max(0, Number(monsterLv || 1) - Number(p.level || 1));
  const evadeChance = Math.max(0, 0.10 - lvDiff * 0.02);
  if (evadeChance <= 0) return false;
  if (Math.random() < evadeChance) {
    spawnParticles(p.x, p.y, 16, ['#c084fc', '#38bdf8', '#ffffff'], 170, 4, 0.4);
    state.effects.push({
      kind: 'dmg_text',
      x: p.x,
      y: p.y - 28,
      text: `🔮 펜던트 회피! (${Math.round(evadeChance * 100)}%)`,
      color: '#c084fc',
      ttl: 0.75
    });
    addLog(`🔮 [수상한 펜던트 발동!] 신비한 암석의 힘으로 일반 몬스터(Lv.${monsterLv})의 공격을 회피했습니다!`);
    return true;
  }
  return false;
}

function performMeleeHit(originX, originY, fx, fy, radius, mult, label, isHeavyCounter, knockbackForce = 120) {
  const p = state.player;
  const derived = getDerivedStats();
  const cx = originX + (radius < 100 ? fx * 26 : 0);
  const cy = originY + (radius < 100 ? fy * 26 : 0);

  let hitAny = false;
  state.monsters.forEach(m => {
    if (m.zone === state.zoneId && m.alive) {
      if (m.stealthed) return;
      const dist = Math.hypot(m.x - cx, m.y - cy);
      if (dist <= radius + m.r) {
        hitAny = true;
        const isCrit = Math.random() < derived.crit;
        const monsterDef = Number(m.def || 0);
        const effAtk = Math.max(Math.round(derived.atk * 0.22), derived.atk - monsterDef);
        let dmg = Math.max(1, Math.round(effAtk * mult * (isCrit ? 1.55 : 1.0)));
        let isCounterHit = false;

        if (isHeavyCounter && m.isBoss && m.state === 'VULNERABLE') {
          dmg = Math.round(dmg * 2.5);
          isCounterHit = true;
          m.state = 'CHASE';
          state.screenShake = 22;
          addLog(`⚡ [2.5배 보스 카운터 작렬!!] ${m.name}에게 ${dmg} 극대 피해!`);
        } else {
          addLog(`${label} ➔ [Lv.${m.lv} ${m.name}]에게 ${dmg}${isCrit ? ' (치명타!)' : ''} 피해!`);
        }

        m.hp = Math.max(0, m.hp - dmg);
        m.flash = 0.18;

        // 보스 페이즈 2 전환 연출 (세라피리아는 전용 폭주 기운 방출 연출 재생)
        if (m.isBoss && !m.enraged && m.hp > 0 && (m.hp / m.maxHp) <= 0.5) {
          m.enraged = true;
          m.phase2TransitionDone = true;
          state.screenShake = 22;
          if (m.kind === 'boss_seraphiria') {
            state.effects.push({ kind: 'seraphiria_phase2_burst', x: m.x, y: m.y, r: 210, ttl: 1.15, maxTtl: 1.15 });
            spawnParticles(m.x, m.y, 65, ['#ec4899', '#38bdf8', '#a855f7', '#ffffff'], 340, 7, 0.9);
            addLog('🌊 [페이즈 2 전환 연출!] 『해왕』 세라피리아가 심해의 폭주 기운을 방출하며 2페이즈에 돌입합니다!');
          } else {
            spawnParticles(m.x, m.y, 50, ['#f43f5e', '#fde047', '#ffffff'], 300, 7, 0.8);
            addLog(`🔥 [보스 광폭화 돌입!!] ${m.name}의 공격 속도와 패턴이 대폭 강화됩니다!`);
          }
        }

        const nx = (m.x - originX) / Math.max(1, dist);
        const ny = (m.y - originY) / Math.max(1, dist);
        const kb = m.isBoss ? knockbackForce * 0.22 : knockbackForce * 0.65;
        m.vx = nx * kb;
        m.vy = ny * kb;

        p.hitCount += 1;
        p.hitComboDecay = 3.0;

        spawnParticles(m.x, m.y, isCounterHit ? 35 : 16, isCounterHit ? ['#fde047', '#f43f5e', '#ffffff'] : ['#f43f5e', '#fbbf24', '#ffffff'], 220, 5, 0.45);
        state.effects.push({
          kind: 'dmg_text',
          x: m.x + (Math.random() * 16 - 8),
          y: m.y - 24,
          text: isCounterHit ? `⚡COUNTER -${dmg}!` : (isCrit ? `💥CRIT -${dmg}!` : `-${dmg}`),
          color: isCounterHit ? '#fde047' : (isCrit ? '#fb923c' : '#ffffff'),
          ttl: 0.65
        });

        if (m.hp <= 0) {
          onMonsterDefeated(m);
        }
      }
    }
  });

  // 세라피리아 유도 투사체 등 플레이어 공격 1회 적중 시 소멸 가능한 투사체 격추 판정
  state.projectiles = state.projectiles.filter(proj => {
    if (proj.isEnemy && proj.destroyableByAttack) {
      const pDist = Math.hypot(proj.x - cx, proj.y - cy);
      if (pDist <= radius + proj.r + 12) {
        spawnParticles(proj.x, proj.y, 14, ['#38bdf8', '#ec4899', '#ffffff'], 160, 4, 0.35);
        state.effects.push({ kind: 'dmg_text', x: proj.x, y: proj.y - 14, text: '💥유도탄 격추!', color: '#38bdf8', ttl: 0.5 });
        return false;
      }
    }
    return true;
  });

  if (hitAny) {
    soundFX.play('hit');
    state.hitStopTimer = 0.028;
    tryTriggerPirateSetBurst(derived);
  }
}

// ============================================================================
// 3. 레벨 차이 보상 공식(Lv당 10% 감소), 만렙 Lv.30 제한, 귀환/워프 로직
// ============================================================================
function calculateMonsterKillReward(m, playerLevel = state.player.level, derived = getDerivedStats()) {
  const baseExp = Math.max(0, Number(m.exp || 0));
  const baseGold = Math.max(0, Number(m.gold || 0));
  const lvDiff = Math.abs(Number(playerLevel || 1) - Number(m.lv || 1));

  const levelMult = Math.max(0, +(1 - lvDiff * 0.10).toFixed(2));
  const bonusMult = (derived && derived.expGoldBonusMult) ? derived.expGoldBonusMult : 1.0;

  const finalExp = Math.max(0, Math.round(baseExp * levelMult * bonusMult));
  const finalGold = Math.max(0, Math.round(baseGold * levelMult * bonusMult));

  return {
    exp: finalExp,
    gold: finalGold,
    lvDiff,
    penaltyPct: Math.min(100, lvDiff * 10),
    seaKingBonus: bonusMult > 1.0
  };
}

function checkAndProcessLevelUp() {
  const p = state.player;
  if (p.level >= MAX_PLAYER_LEVEL) {
    p.level = MAX_PLAYER_LEVEL;
    return false;
  }
  let leveled = false;
  while (p.level < MAX_PLAYER_LEVEL && p.exp >= p.expNext) {
    p.exp -= p.expNext;
    p.level += 1;
    p.expNext = Math.round(p.expNext * 1.35);
    p.baseHp += 34;
    p.baseAtk += 7;
    p.baseDef += 3;
    p.sp += 1;
    const derived = getDerivedStats();
    p.hp = derived.maxHp;
    p.mp = derived.maxMp;
    leveled = true;
    soundFX.play('levelup');
    const maxTag = p.level >= MAX_PLAYER_LEVEL ? ' (MAX!)' : '';
    state.effects.push({
      kind: 'dmg_text',
      x: p.x,
      y: p.y - 48,
      text: `🎉 LEVEL UP! Lv.${p.level}${maxTag}`,
      color: '#fde047',
      ttl: 1.2
    });
    addLog(`🎉 레벨 업! Lv.${p.level}${maxTag} 달성! (체력/공격력/방어력 상승 & SP +1)`);
  }
  return leveled;
}

function isQuestPrerequisiteMet(q) {
  if (!q) return false;
  if (state.player.level < (q.prereqMinLevel || 1)) return false;
  if (q.prereqQuestId) {
    const pre = state.questStates[q.prereqQuestId];
    if (!pre || pre.status !== 'completed') return false;
  }
  return true;
}

function getQuestState(qId) {
  if (!state.questStates[qId]) {
    state.questStates[qId] = { status: 'unaccepted', progress: 0 };
  }
  return state.questStates[qId];
}

function getActiveQuest() {
  const activeMain = QUESTS.find(q => q.category === 'main' && getQuestState(q.id).status === 'active');
  if (activeMain) return activeMain;
  const activeSub = QUESTS.find(q => q.category === 'sub' && getQuestState(q.id).status === 'active');
  if (activeSub) return activeSub;
  const availMain = QUESTS.find(q => q.category === 'main' && getQuestState(q.id).status === 'unaccepted' && isQuestPrerequisiteMet(q));
  if (availMain) return availMain;
  return QUESTS[0];
}

function getNearestTownZone(fromZoneId) {
  if (fromZoneId === 'home_interior' || fromZoneId === 'emerald_forest') {
    return 'home_interior';
  }
  if (['coastal_road_1', 'coastal_road_2', 'coastal_road_3', 'forest_town', 'ancient_ruins', 'goblin_depths', 'orc_canyon_1', 'orc_stronghold_2', 'abyssal_altar'].includes(fromZoneId)) {
    return 'forest_town';
  }
  if (fromZoneId === 'minatomachi') {
    return 'minatomachi';
  }
  const zoneObj = state.zones && state.zones[fromZoneId];
  if (zoneObj && zoneObj.nearestTownId && state.zones[zoneObj.nearestTownId]) {
    return zoneObj.nearestTownId;
  }
  if (zoneObj && zoneObj.isTown) {
    return fromZoneId;
  }
  return 'forest_town';
}

function useWarpItemToTown(item) {
  if (!item) return false;
  const targetAttr = item.warpTarget || item.targetZone || 'nearest';
  const destTown = (targetAttr === 'nearest')
    ? getNearestTownZone(state.zoneId)
    : targetAttr;

  if (!state.zones[destTown]) {
    addLog(`❗ [워프 실패] 대상 마을(${destTown}) 정보를 찾을 수 없습니다.`);
    return false;
  }
  if (!isZoneEntryAllowed(destTown)) {
    const lockMsg = getZoneLockReason(destTown);
    addLog(`🔒 [워프 제한] 아직 [${state.zones[destTown].name}] 구역이 해금되지 않았습니다. (${lockMsg})`);
    return false;
  }

  const spawnCoords = {
    home_interior:  { x: 310, y: 300 },
    forest_town:    { x: 320, y: 300 },
    oceanblue_town: { x: 320, y: 300 },
    minatomachi:    { x: 320, y: 300 }
  };
  const sp = spawnCoords[destTown] || { x: 320, y: 300 };

  soundFX.play('levelup');
  switchZone(destTown, sp.x, sp.y, true);
  spawnParticles(state.player.x, state.player.y, 45, ['#2dd4bf', '#38bdf8', '#fde047', '#ffffff'], 260, 6, 0.75);
  state.effects.push({
    kind: 'dmg_text',
    x: state.player.x,
    y: state.player.y - 36,
    text: `🌀 워프 성공! (${state.zones[destTown].name})`,
    color: '#2dd4bf',
    ttl: 1.1
  });
  addLog(`🌀 [워프 성공] [${item.name}]을(를) 사용하여 안전지대 [${state.zones[destTown].name}](으)로 이동했습니다!`);
  savePlayerProgress('워프 아이템 사용');
  return true;
}

function triggerPlayerDeath() {
  const p = state.player;
  p.hp = 0;
  const expLoss = p.exp > 0 ? Math.max(1, Math.round(p.exp * 0.05)) : 0;
  p.exp = Math.max(0, p.exp - expLoss);
  state.lastExpLost = expLoss;
  state.gameOver = true;
  state.playerDead = true;
  state.respawnTownId = getNearestTownZone(state.zoneId);
  const townName = state.zones[state.respawnTownId]?.name || '포레스트 타운';
  addLog(`💀 [전투 불능] 플레이어가 쓰러졌습니다! 경험치 5%(-${expLoss} EXP)가 감소했으며, 부활 시 인근 안전지대 [${townName}]에서 시작합니다.`);
  updateRealtimeTelemetryUI();
  savePlayerProgress(`사망 (EXP -${expLoss})`);
  showResultScreen(false);
}

function revivePlayerAtNearestTown() {
  const derived = getDerivedStats();
  const targetTown = state.respawnTownId || getNearestTownZone(state.zoneId);
  state.gameOver = false;
  state.playerDead = false;
  state.player.hp = derived.maxHp;
  state.player.mp = derived.maxMp;
  state.projectiles = [];
  state.slashArcs = [];
  document.getElementById('resultModal').classList.add('hidden');
  switchZone(targetTown, 310, 300, true);
  addLog(`✨ [안전지대 부활] [${state.zones[targetTown].name}]에서 체력과 마나를 모두 회복하고 부활했습니다!`);
  savePlayerProgress('인근 마을 부활');
}

function grantExpAndGold(expAmount, goldAmount, reasonText) {
  const p = state.player;
  p.exp += Math.max(0, Number(expAmount || 0));
  p.gold += Math.max(0, Number(goldAmount || 0));
  const leveled = checkAndProcessLevelUp();
  savePlayerProgress(leveled ? `${reasonText} & Lv.${p.level}` : reasonText);
}

function formatGenderDialog(text) {
  if (!text) return '';
  const isFem = (state.player?.gender || 'male') === 'female';
  let out = String(text);
  if (isFem) {
    out = out
      .replace(/우리 아들/g, '우리 딸')
      .replace(/내 아들아/g, '내 딸아')
      .replace(/마리아 부인의 아들이군/g, '마리아 부인의 딸이군')
      .replace(/형아\/누나/g, '누나')
      .replace(/형아\.+/g, '누나...............');
  } else {
    out = out.replace(/형아\/누나/g, '형아');
  }
  return out;
}

// NPC로부터 퀘스트 수락 (다중 페이지 대사창 지원)
function acceptQuestFromNpc(q, npcName, npcObj = null) {
  const qs = getQuestState(q.id);
  qs.status = 'active';
  qs.progress = 0;

  if (q.id === 'main_3') {
    const bw = state.player.inventory.find(i => i.id === 'broken_goblin_weapon');
    if (bw) qs.progress = Math.min(q.targetCount, bw.count);
  } else if (q.id === 'main_5' && state.bossDefeated) {
    qs.progress = 1;
  } else if (q.id === 'main_6' && state.zoneId === 'oceanblue_town') {
    qs.progress = 1;
  } else if (q.id === 'main_9') {
    const photo = state.player.inventory.find(i => i.id === 'important_photo');
    if (photo) qs.progress = Math.min(q.targetCount, photo.count);
  } else if (q.id === 'main_17') {
    const keyItem = state.player.inventory.find(i => i.id === 'office_key');
    if (keyItem) qs.progress = Math.min(q.targetCount, keyItem.count);
  } else if (q.id === 'main_19') {
    if (!state.player.inventory.some(i => i.id === 'zephyr_ring')) {
      addItemToInventory('zephyr_ring', 1);
    }
    state.storyFlags.zephyrRingReceived = true;
    addLog('💍 [퀘스트 아이템 수령] 마리나에게서 [제피르의 반지]를 건네받았습니다!');
  }

  if (['main_7', 'main_10', 'main_11', 'main_12', 'main_15', 'main_19', 'main_20'].includes(q.id)) {
    qs.progress = 1;
  }

  if (q.id === 'main_12' && !state.unlockedSailing.includes('beer_cave_1')) {
    state.unlockedSailing.push('beer_cave_1');
    state.storyFlags.beerCaveUnlocked = true;
    addLog('⛵ [섬 항해 목적지 해금] 세이렌의 섬 항해 목록에 "🍺 비어 케이브"가 추가되었습니다!');
  }
  if (q.id === 'main_16') {
    state.storyFlags.piratePathUnlocked = true;
    addLog('🔓 [신규 지역 해금] 오션블루 타운 동쪽 포털을 통해 "🏴‍☠️ 해적들의 길목 01"로 이동할 수 있습니다!');
  }
  if (q.id === 'main_14') {
    addLog('🔓 [보스방 해금] 비어 케이브 통로 01 북쪽 포털을 통해 "🪓 에리크의 방"에 입장할 수 있습니다!');
  }
  if (q.id === 'main_18') {
    addLog('🔓 [결전 지역 해금] 해적 여왕의 집무실 동쪽 포털을 통해 "⚔️ vs 해적 여왕" 결전장에 입장할 수 있습니다!');
  }
  if (q.id === 'main_20' && !state.unlockedSailing.includes('minatomachi')) {
    state.unlockedSailing.push('minatomachi');
    state.storyFlags.minatomachiUnlocked = true;
    addLog('⛵ [신규 대륙 항해 해금] 세이렌의 섬 항해 목록에 "⛩️ 타이리쿠쇼토노 오자토 「미나토마치」"가 추가되었습니다!');
  }

  soundFX.play('levelup');
  spawnParticles(state.player.x, state.player.y, 28, ['#38bdf8', '#fde047', '#ffffff'], 210, 5, 0.6);
  state.effects.push({
    kind: 'dmg_text',
    x: state.player.x,
    y: state.player.y - 42,
    text: `📜 퀘스트 수락: ${q.title}`,
    color: '#38bdf8',
    ttl: 1.15
  });

  const dialogLines = Array.isArray(q.startDialogLines) && q.startDialogLines.length > 0
    ? q.startDialogLines
    : q.startDialog;
  openNpcDialogPages(`❗ ${npcName} — 새로운 퀘스트 수락`, dialogLines, {
    canSail: canNpcOfferSailing(npcObj),
    npcId: npcObj ? npcObj.id : q.giverId,
    npcName
  });

  addLog(`📜 [퀘스트 수락] ${npcName}에게서 "${q.title}" 퀘스트를 받았습니다! (목표: ${q.objectiveLabel})`);
  savePlayerProgress(`${q.title} 수락`);
}

// 퀘스트 완료 및 보상 지급 (다중 페이지 대사창 지원)
function completeQuestById(qId, npcName = '', npcObj = null) {
  const q = QUESTS.find(item => item.id === qId);
  if (!q) return;
  const qs = getQuestState(q.id);
  if (qs.status !== 'active' || qs.progress < q.targetCount) {
    addLog(`[퀘스트 미달성] "${q.title}" 목표를 먼저 달성한 뒤 해당 NPC와 대화하세요 (${qs.progress}/${q.targetCount}).`);
    return;
  }

  const consumeQuestItem = (itemId, countNeeded) => {
    const idx = state.player.inventory.findIndex(i => i.id === itemId);
    if (idx !== -1) {
      state.player.inventory[idx].count -= countNeeded;
      if (state.player.inventory[idx].count <= 0) {
        state.player.inventory.splice(idx, 1);
      }
    }
  };
  if (q.id === 'main_3') consumeQuestItem('broken_goblin_weapon', 10);
  if (q.id === 'main_9') consumeQuestItem('important_photo', 1);
  if (q.id === 'main_17') consumeQuestItem('office_key', 1);
  if (q.id === 'main_19') consumeQuestItem('zephyr_ring', 1);

  qs.status = 'completed';
  qs.progress = q.targetCount;

  if (q.id === 'main_7') {
    if (!state.unlockedSailing.includes('flower_island_1')) {
      state.unlockedSailing.push('flower_island_1');
    }
    state.storyFlags.flowerIslandUnlocked = true;
    addLog('⛵ [세이렌의 섬 항해 해금!] 이제 세이렌의 대사창에서 [⛵ 섬 항해] 버튼(또는 Enter/F)을 눌러 "🌺 플라워 아일랜드"로 이동할 수 있습니다!');
  } else if (q.id === 'main_8') {
    addLog('🔓 [안전지대 해금] 플라워 아일랜드 화단길 02 동쪽 포털을 통해 "🏡 플라워 아일랜드 : 별장 안"에 입장할 수 있습니다!');
  } else if (q.id === 'main_14') {
    state.storyFlags.erikDefeated = true;
    addLog('🔓 [황제의 방 해금] 비어 케이브 통로 03 동쪽 포털을 통해 "👑 바이킹의 황제 라그나르의 방"에 입장할 수 있습니다!');
  } else if (q.id === 'main_16') {
    addLog('🔓 [대형 선박 해금] 해적들의 길목 02 동쪽 포털을 통해 "🚢 해적의 대형 선박 내부 01"에 진입할 수 있습니다!');
  } else if (q.id === 'main_17') {
    addLog('🔓 [집무실 해금] 해적의 대형 선박 내부 02 동쪽 포털을 통해 "👑 해적 여왕의 집무실"에 입장할 수 있습니다!');
  } else if (q.id === 'main_18') {
    state.storyFlags.seraphiriaDefeated = true;
  } else if (q.id === 'main_19') {
    addLog('✨ [제피르의 성불] 어린남자 귀신 제피르가 누나의 반지를 받고 평안히 성불했습니다.');
  } else if (q.id === 'main_20') {
    state.quest.allCompleted = true;
  }

  soundFX.play('levelup');
  spawnParticles(state.player.x, state.player.y, 45, ['#fde047', '#34d399', '#38bdf8', '#ffffff'], 280, 6, 0.85);
  state.effects.push({
    kind: 'dmg_text',
    x: state.player.x,
    y: state.player.y - 44,
    text: `🎁 퀘스트 완료! +${q.rewardExp} EXP / +${q.rewardGold}G`,
    color: '#34d399',
    ttl: 1.25
  });

  const completeLines = Array.isArray(q.completeDialogLines) && q.completeDialogLines.length > 0
    ? q.completeDialogLines
    : q.completeDialog;
  openNpcDialogPages(`🎁 ${npcName || q.giver} — 퀘스트 클리어!`, completeLines, {
    canSail: canNpcOfferSailing(npcObj) || q.id === 'main_7',
    npcId: npcObj ? npcObj.id : q.turnInNpcId,
    npcName: npcName || q.giver,
    rewardSuffix: `(보상 지급: 경험치 +${q.rewardExp} / 골드 +${q.rewardGold}G)`
  });

  addLog(`🎊 [퀘스트 완료!] "${q.title}" 클리어! 경험치 +${q.rewardExp}, 골드 +${q.rewardGold}G 획득!`);
  grantExpAndGold(q.rewardExp, q.rewardGold, `${q.title} 완료`);
  updateAllUI();
}

function completeCurrentQuest() {
  const readyQ = QUESTS.find(q => {
    const qs = getQuestState(q.id);
    return qs.status === 'active' && qs.progress >= q.targetCount;
  });
  if (readyQ) {
    completeQuestById(readyQ.id, readyQ.giver);
  } else {
    addLog('[안내] 완료 조건을 달성한 진행 중 퀘스트가 없습니다. 조건을 만족한 뒤 해당 NPC와 대화하세요.');
  }
}

function onMonsterDefeated(m) {
  m.alive = false;
  m.timer = m.isBoss ? 9999 : 3.2;
  state.kills += 1;

  const p = state.player;
  const derived = getDerivedStats();

  const reward = calculateMonsterKillReward(m, p.level, derived);
  p.gold += reward.gold;
  p.exp += reward.exp;

  // 2) 몬스터 아이템 드랍 처리:
  //    - 체력/마나 회복 소비 아이템(potion_hp, potion_elixir 등)은 20% 확률로 드랍
  //    - bonusDrops / dropTable에 등록된 신규 세트 장비, 재료, 퀘스트 아이템(중요한 사진, 집무실 열쇠 등)을 모두 판정
  const droppedNames = [];
  if (m.drop && ITEMS[m.drop]) {
    const baseItem = ITEMS[m.drop];
    const baseChance = baseItem.type === 'consumable' ? 0.20 : 1.0;
    if (Math.random() < baseChance) {
      addItemToInventory(m.drop, 1);
      droppedNames.push(baseItem.name);
    }
  }

  const extraDrops = [
    ...(Array.isArray(m.bonusDrops) ? m.bonusDrops : []),
    ...(Array.isArray(m.dropTable) ? m.dropTable : [])
  ];

  extraDrops.forEach(entry => {
    if (!entry) return;
    const itemId = entry.item || entry.itemId;
    if (!itemId || !ITEMS[itemId]) return;

    // 퀘스트 전용 드랍 아이템(중요한 사진: 메인 9장, 집무실 열쇠: 메인 17장)은 해당 퀘스트 진행 중(active)일 때 15% 확률로 드랍 (천장 없음)
    const linkedQuestId = entry.questId || (itemId === 'important_photo' ? 'main_9' : (itemId === 'office_key' ? 'main_17' : null));
    if (linkedQuestId) {
      const lqs = getQuestState(linkedQuestId);
      if (lqs.status !== 'active') return;
      const alreadyOwned = state.player.inventory.some(i => i.id === itemId && i.count >= 1);
      if (alreadyOwned) return;
    }

    const chance = Number(entry.chance ?? 0.15);
    if (Math.random() < chance) {
      addItemToInventory(itemId, 1);
      droppedNames.push(ITEMS[itemId].name);
    }
  });

  spawnParticles(m.x, m.y, 40, ['#fde047', '#f43f5e', '#a855f7', '#4ade80'], 260, 6, 0.7);
  const diffNote = reward.penaltyPct > 0 ? ` (레벨차 -${reward.penaltyPct}%)` : '';
  const seaKingNote = reward.seaKingBonus ? ' (해왕의 검 +20%)' : '';
  const dropNote = droppedNames.length > 0 ? `, [${droppedNames.join(', ')}] 획득!` : '';
  addLog(`🏆 [처치] Lv.${m.lv} ${m.name} 처치! +${reward.exp} EXP, +${reward.gold}G${diffNote}${seaKingNote}${dropNote}`);

  const isGoblinKind = m.kind.startsWith('goblin');
  const isOrcKind = m.kind === 'elite_orc' || m.kind.startsWith('orc_');
  const isHeavyKind = ['goblin_brute', 'orc_juggernaut'].includes(m.kind);
  const isCoastalZone = state.zoneId.startsWith('coastal_road_');
  const isFlowerPirate = m.kind.startsWith('pirate_') && state.zoneId.startsWith('flower_island_');
  const isBeerViking = m.kind.startsWith('viking_') && state.zoneId.startsWith('beer_cave_');
  const isBlackRobe = m.kind.startsWith('black_robe_');
  const isBalrogBoss = Boolean(
    m.id === 'boss' ||
    m.bossType === 'balrog' ||
    m.kind === 'boss_balrog' ||
    m.kind === 'boss_dragon' ||
    m.kind === 'boss'
  );

  QUESTS.forEach(q => {
    const qs = getQuestState(q.id);
    if (qs.status !== 'active' || qs.progress >= q.targetCount) return;

    let matched = false;
    if (q.targetType === 'slime_kill' && m.kind === 'slime') matched = true;
    else if (q.targetType === 'goblin_kill' && isGoblinKind) matched = true;
    else if (q.targetType === 'broken_weapon' && isGoblinKind) matched = true;
    else if (q.targetType === 'orc_kill' && isOrcKind) matched = true;
    else if (q.targetType === 'balrog_kill' && isBalrogBoss) matched = true;
    else if (q.targetType === 'sub_goblin_kill' && isGoblinKind) matched = true;
    else if (q.targetType === 'sub_heavy_kill' && isHeavyKind) matched = true;
    else if (q.targetType === 'sub_coastal_kill' && isCoastalZone) matched = true;
    else if (q.targetType === 'sub_sea_orc_kill' && isCoastalZone && isOrcKind) matched = true;
    else if ((q.targetType === 'pirate_kill' || q.targetType === 'flower_pirate_kill') && isFlowerPirate) matched = true;
    else if (q.targetType === 'collect_important_photo' || q.targetType === 'important_photo') {
      const photoItem = state.player.inventory.find(i => i.id === 'important_photo');
      if (photoItem && photoItem.count > 0) {
        qs.progress = Math.min(q.targetCount, photoItem.count);
        matched = true;
      }
    }
    else if (q.targetType === 'viking_kill' && isBeerViking) matched = true;
    else if (q.targetType === 'erik_kill' && m.kind === 'boss_erik') matched = true;
    else if (q.targetType === 'black_robe_kill' && isBlackRobe) matched = true;
    else if (q.targetType === 'collect_office_key' || q.targetType === 'office_key') {
      const keyItem = state.player.inventory.find(i => i.id === 'office_key');
      if (keyItem && keyItem.count > 0) {
        qs.progress = Math.min(q.targetCount, keyItem.count);
        matched = true;
      }
    }
    else if (q.targetType === 'seraphiria_kill' && m.kind === 'boss_seraphiria') matched = true;

    if (matched) {
      if (!['collect_important_photo', 'important_photo', 'collect_office_key', 'office_key'].includes(q.targetType)) {
        qs.progress = Math.min(q.targetCount, qs.progress + 1);
      }
      state.effects.push({
        kind: 'dmg_text',
        x: state.player.x,
        y: state.player.y - 44,
        text: `📜 ${q.title} (${qs.progress}/${q.targetCount})`,
        color: '#38bdf8',
        ttl: 0.95
      });
      if (qs.progress >= q.targetCount) {
        soundFX.play('levelup');
        addLog(`✨ [퀘스트 목표 달성!] "${q.title}" (${qs.progress}/${q.targetCount}) 달성! [${q.giver}]에게 돌아가 대화하세요!`);
      }
    }
  });

  const leveled = checkAndProcessLevelUp();

  if (m.isBoss) {
    soundFX.play('levelup');
    const bossHud = document.getElementById('bossHudContainer');
    if (bossHud) bossHud.classList.add('hidden');
    if (isBalrogBoss) {
      state.bossDefeated = true;
      addLog('👑 [보스 토벌 완료!] 오크 부족의 대장 발록을 물리쳤습니다! 포레스트 타운의 촌장님께 돌아가 보고하세요!');
    } else if (m.kind === 'boss_erik') {
      state.storyFlags.erikDefeated = true;
      addLog('🪓 [보스 토벌 완료!] 붉은 바이킹 전사 에리크를 꺾었습니다! 비어 케이브 통로 01의 에리크에게 돌아가 대화하세요!');
    } else if (m.kind === 'boss_seraphiria') {
      state.storyFlags.seraphiriaDefeated = true;
      addLog('👑 [해적 여왕 토벌 완료!] 해적들의 여왕 『해왕』 세라피리아 더 파이럿을 물리쳤습니다! 오션블루 타운의 촌장 마리나에게 돌아가 보고하세요!');
    }
  }

  savePlayerProgress(leveled ? `Lv.${p.level} 레벨업` : '몬스터 처치');
}

function addItemToInventory(itemId, count) {
  const tpl = ITEMS[itemId];
  if (!tpl) return;
  const existing = state.player.inventory.find(i => i.id === itemId);
  if (existing) existing.count += count;
  else state.player.inventory.push({ ...tpl, count });
}

// ============================================================================
// 4. 월드 상호작용 (조건부 포털 입장, 보물상자, NPC 다중 페이지 대사 & 섬 항해 연동)
// ============================================================================
function handleWorldInteraction() {
  if (!isGameViewVisible()) return;
  if (state.isTalkingToNpc) {
    advanceOrCloseNpcDialog(true);
    return;
  }

  const p = state.player;
  const z = state.zones[state.zoneId];

  // 1) 포털 상호작용
  for (const portal of z.portals) {
    if (Math.hypot(p.x - portal.x, p.y - portal.y) <= portal.r + 45) {
      if (!isPortalUnlocked(portal)) {
        const lockReason = getZoneLockReason(portal.target, portal);
        const targetName = state.zones[portal.target]?.name || portal.label;
        state.effects.push({
          kind: 'dmg_text',
          x: portal.x,
          y: portal.y - 28,
          text: `🔒 ${lockReason}`,
          color: '#f43f5e',
          ttl: 1.1
        });
        addLog(`🔒 [입장 조건 미충족] "${targetName}" 구역은 [${lockReason}] 조건이 필요합니다!`);
        return;
      }
      soundFX.play('levelup');
      switchZone(portal.target, portal.sx, portal.sy);
      return;
    }
  }

  // 2) 보물상자 상호작용
  for (const chest of z.chests) {
    if (!chest.opened && Math.hypot(p.x - chest.x, p.y - chest.y) <= 60) {
      chest.opened = true;
      p.gold += chest.gold;
      addItemToInventory(chest.item, 1);
      soundFX.play('levelup');
      spawnParticles(chest.x, chest.y, 30, ['#fde047', '#38bdf8', '#ffffff'], 200, 5, 0.6);
      state.effects.push({ kind: 'dmg_text', x: chest.x, y: chest.y - 24, text: `🎁 +${ITEMS[chest.item].name}`, color: '#fde047', ttl: 0.9 });
      addLog(`🎁 [보물상자 개봉] ${ITEMS[chest.item].name} 및 ${chest.gold}G 획득!`);
      savePlayerProgress('보물상자 획득');
      return;
    }
  }

  // 3) NPC 상호작용
  for (const npc of z.npcs) {
    if (npc.hideAfterQuestCompleted && getQuestState(npc.hideAfterQuestCompleted).status === 'completed') {
      continue;
    }
    if (Math.hypot(p.x - npc.x, p.y - npc.y) <= 75) {
      if (npc.questRole === 'merchant') {
        openShopModal(npc.name, npc.shopTownId || state.zoneId);
        return;
      }

      // 1순위: 완료 보고 가능한 진행 중(active) 퀘스트
      const turnInQuest = QUESTS.find(q => {
        const qs = getQuestState(q.id);
        return qs.status === 'active' && qs.progress >= q.targetCount && q.turnInNpcId === npc.id;
      });
      if (turnInQuest) {
        completeQuestById(turnInQuest.id, npc.name, npc);
        return;
      }

      // 2순위: 새로 수락 가능한 퀘스트
      const availableQuest = QUESTS.find(q => {
        const qs = getQuestState(q.id);
        return qs.status === 'unaccepted' && q.giverId === npc.id && isQuestPrerequisiteMet(q);
      });
      if (availableQuest) {
        acceptQuestFromNpc(availableQuest, npc.name, npc);
        return;
      }

      // 3순위: 진행 중(active)인 퀘스트의 중간 대화 NPC (메인 15장 세이렌, 메인 16장 니콜라스, 메인 20장 세이렌)
      const midQuest = QUESTS.find(q => {
        const qs = getQuestState(q.id);
        return qs.status === 'active' && q.midNpcId === npc.id && (q.midDialogLines || q.midDialog);
      });
      if (midQuest) {
        const midLines = Array.isArray(midQuest.midDialogLines) && midQuest.midDialogLines.length > 0
          ? midQuest.midDialogLines
          : midQuest.midDialog;
        openNpcDialogPages(`💬 ${npc.name} — ${midQuest.title}`, midLines, {
          canSail: canNpcOfferSailing(npc),
          npcId: npc.id,
          npcName: npc.name
        });
        addLog(`💬 [퀘스트 진행 대화] ${npc.name}와(과) "${midQuest.title}" 진행 대화를 나눕니다.`);
        return;
      }

      // 4순위: 일반 대화 (세이렌은 마지막 페이지에 [섬 항해] 버튼, 대장장이 브론은 [제작·교환소] 버튼 표시)
      openNpcDialogPages(`💬 ${npc.name}`, npc.lines, {
        canSail: canNpcOfferSailing(npc),
        canCraft: npc.questRole === 'blacksmith',
        npcId: npc.id,
        npcName: npc.name
      });
      addLog(`⏸️ [NPC ${npc.name} 대화 중] Enter / F 또는 대화창 클릭으로 대사를 넘길 수 있습니다.`);
      return;
    }
  }
  addLog('[상호작용 안내] 포털, 보물상자, 또는 NPC 가까이 이동한 뒤 Enter(또는 F) 키를 누르세요.');
}

function switchZone(targetZoneId, sx = 120, sy = 300, forceAllow = false) {
  if (!state.zones[targetZoneId]) return false;
  if (!forceAllow && !isZoneEntryAllowed(targetZoneId)) {
    const lockReason = getZoneLockReason(targetZoneId);
    const targetName = state.zones[targetZoneId]?.name || targetZoneId;
    state.effects.push({
      kind: 'dmg_text',
      x: state.player.x,
      y: state.player.y - 32,
      text: `🔒 ${lockReason}`,
      color: '#f43f5e',
      ttl: 1.1
    });
    addLog(`🔒 [입장 조건 미충족] "${targetName}" 구역은 [${lockReason}] 조건 달성 후에 입장할 수 있습니다!`);
    return false;
  }

  state.zoneId = targetZoneId;
  state.player.x = sx;
  state.player.y = sy;
  closeNpcDialog(true);
  state.projectiles = [];
  state.slashArcs = [];
  state.monsters = createInitialMonsters();
  spawnParticles(sx, sy, 25, ['#38bdf8', '#c084fc', '#ffffff'], 180, 5, 0.5);

  const q6State = getQuestState('main_6');
  if (q6State.status === 'active' && targetZoneId === 'oceanblue_town') {
    q6State.progress = 1;
    addLog('🌊 [오션블루 타운 도착!] 메인 6장 목표 달성! [오션블루 촌장 마리나]와 대화(Enter/F)하여 퀘스트를 완료하세요!');
  }

  const zObj = state.zones[targetZoneId];
  addLog(`📍 [지역 이동] ${zObj.name}${zObj.isSafeZone ? ' (🛡️ 적이 없는 안전지대 - HP/MP 자동 회복)' : ''}(으)로 진입했습니다!`);
  savePlayerProgress('지역 이동');
  return true;
}
