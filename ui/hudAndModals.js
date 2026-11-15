function highlightClassCards(clsKey) {
  document.querySelectorAll('.class-card').forEach(c => {
    const isMatch = c.getAttribute('data-class') === clsKey;
    c.classList.toggle('border-indigo-500', isMatch);
    c.classList.toggle('bg-slate-950/90', isMatch);
    c.classList.toggle('border-slate-800', !isMatch);
    c.classList.toggle('bg-slate-950/60', !isMatch);
  });
  ['knight', 'mage', 'ranger'].forEach(k => {
    const btn = document.getElementById('quickClass' + k.charAt(0).toUpperCase() + k.slice(1));
    if (btn) {
      btn.className = k === clsKey
        ? 'px-1.5 py-0.5 rounded bg-indigo-600 text-white font-bold'
        : 'px-1.5 py-0.5 rounded text-slate-400 hover:text-white font-bold';
    }
  });
}

function changePlayerClassPreservingProgress(clsKey) {
  const c = CLASSES[clsKey] || CLASSES.knight;
  state.selectedClass = clsKey;
  const p = state.player;
  const lv = p.level;
  p.baseHp = c.hp + (lv - 1) * 34;
  p.baseMp = c.mp;
  p.baseAtk = c.atk + (lv - 1) * 7;
  p.baseDef = c.def + (lv - 1) * 3;
  p.baseSpd = c.spd;
  p.baseCrit = c.crit;
  const derived = getDerivedStats();
  p.hp = derived.maxHp;
  p.mp = derived.maxMp;
  highlightClassCards(clsKey);
  savePlayerProgress('클래스 변경');
  addLog(`✨ [클래스 전환] 진행도(Lv.${lv})를 유지한 채 ${c.name} 클래스로 변경했습니다.`);
}

function resetAllProgressToNewGame(clsKey, skipAutoSave = false) {
  const c = CLASSES[clsKey] || CLASSES.knight;
  state.selectedClass = clsKey;
  state.isTalkingToNpc = false;
  state.zoneId = 'home_interior';
  state.zones = createWorldZones();
  state.monsters = createInitialMonsters();
  state.kills = 0;
  state.bossDefeated = false;
  state.gameOver = false;
  state.playerDead = false;
  state.respawnTownId = 'forest_town';
  state.quest = { currentId: 1, progress: 0, allCompleted: false, talkedChiefQ6: false };
  state.questStates = createInitialQuestStates();

  const prevName = state.player?.name || '에이든';
  const prevGender = state.player?.gender || 'male';
  const prevCustom = Boolean(state.player?.customCreated);
  state.player = {
    name: prevName, gender: prevGender,
    customCreated: prevCustom,
    adventureStarted: false,
    x: 210, y: 300, r: 17,
    fx: 1, fy: 0,
    level: 1, exp: 0, expNext: 100, gold: 50, sp: 1,
    baseHp: c.hp, baseMp: c.mp, baseAtk: c.atk, baseDef: c.def, baseSpd: c.spd, baseCrit: c.crit,
    hp: c.hp, mp: c.mp,
    dodgeTimer: 0, invulnTimer: 0, animTick: 0,
    comboStep: 0, comboTimer: 0,
    hitCount: 0, hitComboDecay: 0,
    afterimages: [],
    skills: { basic_attack: 1, dodge: 1, heavy_attack: 1, magic_skill: 1, special_skill: 1 },
    equipment: { weapon: null, armor: null, accessory: null },
    inventory: [
      { ...ITEMS.warp_nearest_town, count: 1 },
      { ...ITEMS.potion_hp, count: 3 },
      { ...ITEMS.iron_blade, count: 1 }
    ]
  };
  state.projectiles = [];
  state.slashArcs = [];
  state.particles = [];
  state.effects = [];
  document.getElementById('resultModal').classList.add('hidden');
  document.getElementById('npcDialogBox').classList.add('hidden');
  highlightClassCards(clsKey);
  if (!skipAutoSave) {
    saveSync.allowResetOnce = true;
    savePlayerProgress('새 게임 초기화');
  }
  addLog(`🔄 [새 게임 초기화] Lv.1 ${c.name} 초기 상태로 리셋되었습니다.`);
}


// ============================================================================
// 8. DOM UI 동기화 & 모달 제어 (인벤토리/장비창 및 스킬 강화창)
// ============================================================================
function renderLogs() {
  const container = document.getElementById('combatLogList');
  container.innerHTML = state.logs.map(l => `<div class="leading-snug">${l}</div>`).join('');
}

function renderStartScreenPlayerStatus() {
  const p = state.player;
  const derived = getDerivedStats();
  const cls = CLASSES[state.selectedClass] || CLASSES.knight;
  const zName = state.zones[state.zoneId]?.name || '에메랄드 숲';

  renderStartStatusPreview();

  document.getElementById('statusLevelBadge').textContent = `Lv.${p.level}`;
  const nameEl = document.getElementById('statusCharName');
  if (nameEl) nameEl.textContent = p.name || '에이든';
  const genEl = document.getElementById('statusGenderBadge');
  if (genEl) {
    const isFem = p.gender === 'female';
    genEl.textContent = isFem ? '♀ 여성' : '♂ 남성';
    genEl.className = isFem
      ? 'px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-bold'
      : 'px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold';
  }
  document.getElementById('statusClassTitle').textContent = cls.name;
  renderCharSlotsBar();
  document.getElementById('statusExpLabel').textContent = `${p.exp} / ${p.expNext}`;
  document.getElementById('statusExpBar').style.width = `${Math.min(100, (p.exp / p.expNext) * 100)}%`;
  document.getElementById('statusGoldText').textContent = `${p.gold}G`;
  document.getElementById('statusSpText').textContent = `${p.sp} SP`;
  document.getElementById('statusZoneName').textContent = `📍 ${zName}`;
  document.getElementById('statusKills').textContent = `${state.kills}마리`;

  document.getElementById('statusStatHp').textContent = `${Math.round(p.hp)}/${derived.maxHp}`;
  document.getElementById('statusStatMp').textContent = `${Math.round(p.mp)}/${derived.maxMp}`;
  document.getElementById('statusStatAtk').textContent = `${derived.atk}`;
  document.getElementById('statusStatDef').textContent = `${derived.def}`;
  document.getElementById('statusStatSpd').textContent = `${Math.round(derived.spd)}`;
  document.getElementById('statusStatCrit').textContent = `${Math.round(derived.crit * 100)}%`;

  const w = p.equipment.weapon;
  const a = p.equipment.armor;
  const acc = p.equipment.accessory;
  document.getElementById('statusEquipWeapon').textContent = w ? w.name : '장착 없음';
  document.getElementById('statusEquipArmor').textContent = a ? a.name : '장착 없음';
  document.getElementById('statusEquipAccessory').textContent = acc ? acc.name : '장착 없음';

  const wDescEl = document.getElementById('statusEquipWeaponDesc');
  if (wDescEl) wDescEl.textContent = w ? w.desc : '장착된 무기가 없습니다.';
  const aDescEl = document.getElementById('statusEquipArmorDesc');
  if (aDescEl) aDescEl.textContent = a ? a.desc : '장착된 방어구가 없습니다.';
  const accDescEl = document.getElementById('statusEquipAccessoryDesc');
  if (accDescEl) accDescEl.textContent = acc ? acc.desc : '장착된 장신구가 없습니다.';

  // 스탯 하단: 현재 메인퀘스트 진행도 렌더링
  const mainQuests = QUESTS.filter(q => q.category === 'main');
  const totalMainCount = mainQuests.length || 20;
  const completedMainCount = mainQuests.filter(q => getQuestState(q.id).status === 'completed').length;
  const activeMain = mainQuests.find(q => getQuestState(q.id).status === 'active');
  const nextMain = mainQuests.find(q => getQuestState(q.id).status === 'unaccepted');

  const stepBadgeEl = document.getElementById('statusMainQuestStepBadge');
  const titleEl = document.getElementById('statusMainQuestTitle');
  const stateBadgeEl = document.getElementById('statusMainQuestStateBadge');
  const objEl = document.getElementById('statusMainQuestObj');
  const overallEl = document.getElementById('statusMainQuestOverall');
  const progTextEl = document.getElementById('statusMainQuestProgText');
  const barEl = document.getElementById('statusMainQuestBar');

  const overallPct = Math.round((completedMainCount / totalMainCount) * 100);
  if (overallEl) {
    overallEl.textContent = `전체 메인 클리어: ${completedMainCount} / ${totalMainCount}장 (${overallPct}%)`;
  }

  if (completedMainCount >= totalMainCount) {
    if (stepBadgeEl) stepBadgeEl.textContent = `전 ${totalMainCount}장 완료!`;
    if (titleEl) titleEl.textContent = '🏆 메인 1~20장 전 스토리 올클리어!';
    if (stateBadgeEl) {
      stateBadgeEl.textContent = '✅ 올클리어';
      stateBadgeEl.className = 'px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold shrink-0';
    }
    if (objEl) objEl.textContent = '모든 메인 퀘스트를 완수했습니다! 자유롭게 대륙과 섬을 모험하세요.';
    if (progTextEl) progTextEl.textContent = `${totalMainCount} / ${totalMainCount}`;
    if (barEl) barEl.style.width = '100%';
  } else if (activeMain) {
    const qs = getQuestState(activeMain.id);
    const curProg = Math.min(activeMain.targetCount, qs.progress);
    const isReady = curProg >= activeMain.targetCount;
    const pct = Math.max(0, Math.min(100, Math.round((curProg / Math.max(1, activeMain.targetCount)) * 100)));
    if (stepBadgeEl) stepBadgeEl.textContent = `메인 ${activeMain.num} / ${totalMainCount}장`;
    if (titleEl) titleEl.textContent = activeMain.title;
    if (stateBadgeEl) {
      stateBadgeEl.textContent = isReady ? '🎁 완료 보고 가능' : '🔥 진행 중';
      stateBadgeEl.className = isReady
        ? 'px-1.5 py-0.5 rounded bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 text-[10px] font-extrabold shrink-0 animate-pulse'
        : 'px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold shrink-0';
    }
    if (objEl) objEl.textContent = `목표: ${activeMain.objectiveLabel}`;
    if (progTextEl) progTextEl.textContent = `${curProg} / ${activeMain.targetCount}`;
    if (barEl) barEl.style.width = `${pct}%`;
  } else if (nextMain) {
    if (stepBadgeEl) stepBadgeEl.textContent = `메인 ${nextMain.num} / ${totalMainCount}장`;
    if (titleEl) titleEl.textContent = nextMain.title;
    if (stateBadgeEl) {
      stateBadgeEl.textContent = '❗ 수락 가능';
      stateBadgeEl.className = 'px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-extrabold shrink-0';
    }
    if (objEl) objEl.textContent = `${nextMain.conditionDesc} (${nextMain.giver})`;
    if (progTextEl) progTextEl.textContent = `0 / ${nextMain.targetCount}`;
    if (barEl) barEl.style.width = '0%';
  }
}

function updateAllUI() {
  const p = state.player;
  const derived = getDerivedStats();
  const cls = CLASSES[state.selectedClass] || CLASSES.knight;

  document.getElementById('hudLevelText').textContent = `Lv.${p.level}`;
  document.getElementById('hudClassName').textContent = cls.name.split(' ')[1] || cls.name;
  document.getElementById('hudHpText').textContent = `${Math.round(p.hp)}/${derived.maxHp}`;
  document.getElementById('hudHpBar').style.width = `${Math.min(100, (p.hp / derived.maxHp) * 100)}%`;

  document.getElementById('hudMpText').textContent = `${Math.round(p.mp)}/${derived.maxMp}`;
  document.getElementById('hudMpBar').style.width = `${Math.min(100, (p.mp / derived.maxMp) * 100)}%`;

  document.getElementById('hudExpText').textContent = `${p.exp}/${p.expNext}`;
  document.getElementById('hudExpBar').style.width = `${Math.min(100, (p.exp / p.expNext) * 100)}%`;

  document.getElementById('hudAtk').textContent = derived.atk;
  document.getElementById('hudDef').textContent = derived.def;
  document.getElementById('hudGold').textContent = `${p.gold}G`;
  document.getElementById('hudSp').textContent = `${p.sp} SP`;
  document.getElementById('headerSpBadge').textContent = `${p.sp} SP`;
  document.getElementById('modalSpBadge').textContent = `보유 SP: ${p.sp}`;
  document.getElementById('canvasZoneTitle').textContent = state.zones[state.zoneId].name;

  for (const sk of SKILL_KEYS) {
    const curLv = getClampedSkillLevel(p.skills[sk]);
    p.skills[sk] = curLv;
    const isMax = curLv >= MAX_SKILL_LEVEL;
    const el = document.getElementById(`skillLv_${sk}`);
    if (el) el.textContent = isMax ? `Lv.${curLv} MAX` : `Lv.${curLv}`;
    const mel = document.getElementById(`modalLv_${sk}`);
    if (mel) mel.textContent = isMax ? `Lv.${curLv} / ${MAX_SKILL_LEVEL} (MAX)` : `Lv.${curLv} / ${MAX_SKILL_LEVEL}`;
    const upBtn = document.getElementById(`upBtn_${sk}`);
    if (upBtn) {
      if (isMax) {
        upBtn.textContent = '✨ MAX 달성';
        upBtn.className = 'px-3 py-2 rounded-lg bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-extrabold shrink-0 cursor-not-allowed';
      } else if (p.sp > 0) {
        upBtn.textContent = '+ 스킬 강화';
        upBtn.className = 'px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shrink-0 transition';
      } else {
        upBtn.textContent = '+ 스킬 강화';
        upBtn.className = 'px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold shrink-0 transition';
      }
    }
  }

  const boss = state.monsters.find(m => m.zone === state.zoneId && m.isBoss && m.alive);
  const bossHud = document.getElementById('bossHudContainer');
  if (boss && bossHud) {
    bossHud.classList.remove('hidden');
    const nameEl = document.getElementById('bossNameLabel');
    const stateBadgeEl = document.getElementById('bossStateBadge');
    if (nameEl) {
      nameEl.textContent = `👑 Lv.${boss.lv} ${boss.name}`;
    }
    if (stateBadgeEl) {
      stateBadgeEl.textContent = '';
      stateBadgeEl.classList.add('hidden');
    }
    const hpLabelEl = document.getElementById('bossHpLabel');
    if (hpLabelEl) hpLabelEl.textContent = `${boss.hp} / ${boss.maxHp}`;
    const hpBarEl = document.getElementById('bossHpBar');
    if (hpBarEl) hpBarEl.style.width = `${Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100))}%`;
  } else if (bossHud) {
    bossHud.classList.add('hidden');
  }

  const zObj = state.zones[state.zoneId];
  const safeBadge = document.getElementById('safeZoneBadge');
  if (safeBadge) {
    if (zObj && zObj.isSafeZone) safeBadge.classList.remove('hidden');
    else safeBadge.classList.add('hidden');
  }

  const totalItems = p.inventory.reduce((s, i) => s + i.count, 0);
  document.getElementById('navInvBadge').textContent = totalItems;
  const warpCount = p.inventory.filter(i => i.type === 'warp').reduce((s, i) => s + i.count, 0);
  const warpBadge = document.getElementById('hudWarpScrollCount');
  if (warpBadge) warpBadge.textContent = `${warpCount}장`;
  renderQuestUI();
  renderStartScreenPlayerStatus();
  renderInventorySection();
}

function renderQuestUI() {
  const activeQuests = QUESTS.filter(q => getQuestState(q.id).status === 'active');
  const completedQuests = QUESTS.filter(q => getQuestState(q.id).status === 'completed');
  const readyQuests = activeQuests.filter(q => getQuestState(q.id).progress >= q.targetCount);

  const headerBadge = document.getElementById('headerQuestBadge');
  if (headerBadge) {
    if (readyQuests.length > 0) {
      headerBadge.textContent = `완료보고(${readyQuests.length})`;
    } else if (activeQuests.length > 0) {
      headerBadge.textContent = `진행중(${activeQuests.length})`;
    } else {
      headerBadge.textContent = `완료 ${completedQuests.length}/${QUESTS.length}`;
    }
  }

  const modalBadge = document.getElementById('modalQuestStatusBadge');
  if (modalBadge) {
    modalBadge.textContent = `진행 중: ${activeQuests.length}개 | 클리어 완료: ${completedQuests.length}개`;
  }

  const actCountEl = document.getElementById('activeQuestCountBadge');
  if (actCountEl) actCountEl.textContent = activeQuests.length;
  const compCountEl = document.getElementById('completedQuestCountBadge');
  if (compCountEl) compCountEl.textContent = completedQuests.length;

  const compSumEl = document.getElementById('completedRewardSummary');
  if (compSumEl) {
    const sumExp = completedQuests.reduce((s, qItem) => s + qItem.rewardExp, 0);
    const sumGold = completedQuests.reduce((s, qItem) => s + qItem.rewardGold, 0);
    compSumEl.textContent = `누적 클리어 보상 (${completedQuests.length}개 완료): +${sumExp} EXP / +${sumGold}G`;
  }

  // 카테고리 탭(메인 / 서브 / 전체) 하이라이트
  const catMode = state.questCategoryFilter || 'main';
  const catMap = { Main: 'main', Sub: 'sub', All: 'all' };
  Object.keys(catMap).forEach(k => {
    const btn = document.getElementById('questCat' + k);
    if (btn) {
      const isSel = catMode === catMap[k];
      btn.className = isSel
        ? 'px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-extrabold transition shadow'
        : 'px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold transition';
    }
  });

  // 상태 탭(전체 / 진행 중 / 클리어 완료) 하이라이트
  const fMode = state.questFilter || 'all';
  ['All', 'Active', 'Completed'].forEach(tab => {
    const tBtn = document.getElementById('questFilter' + tab);
    if (tBtn) {
      const activeTab = fMode === tab.toLowerCase();
      tBtn.className = activeTab
        ? 'px-2.5 py-1 rounded-lg bg-sky-600 text-white text-xs font-extrabold transition shadow'
        : 'px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-extrabold transition';
    }
  });

  const listContainer = document.getElementById('questModalListContainer');
  if (listContainer) {
    listContainer.innerHTML = '';

    // 퀘스트 창에는 현재 진행 중인 퀘스트(active)와 이미 완료한 퀘스트(completed)만 표시
    const filteredQuests = QUESTS.filter(item => {
      if (catMode === 'main' && item.category !== 'main') return false;
      if (catMode === 'sub' && item.category !== 'sub') return false;

      const qs = getQuestState(item.id);
      if (qs.status !== 'active' && qs.status !== 'completed') return false;
      if (fMode === 'completed') return qs.status === 'completed';
      if (fMode === 'active') return qs.status === 'active';
      return true;
    });

    if (filteredQuests.length === 0) {
      const emptyMsg = fMode === 'completed'
        ? '아직 이 분류에서 완료한 퀘스트가 없습니다.'
        : (fMode === 'active'
            ? '현재 진행 중인 퀘스트가 없습니다. 마을이나 필드의 NPC와 대화(Enter/F)하여 퀘스트를 수락해 보세요!'
            : '현재 진행 중이거나 완료한 퀘스트가 없습니다. NPC와 대화(Enter/F)하여 퀘스트를 시작해 보세요!');
      listContainer.innerHTML = `<div class="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-300 leading-relaxed">${emptyMsg}</div>`;
    }

    filteredQuests.forEach(item => {
      const qs = getQuestState(item.id);
      const isCompleted = qs.status === 'completed';
      const isActive = qs.status === 'active';
      const isReadyToTurnIn = isActive && qs.progress >= item.targetCount;
      const canAccept = qs.status === 'unaccepted' && isQuestPrerequisiteMet(item);
      const itemProg = isCompleted ? item.targetCount : qs.progress;

      let statusBadgeHtml = '';
      if (isCompleted) {
        statusBadgeHtml = `<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-extrabold">✅ 클리어 완료</span>`;
      } else if (isReadyToTurnIn) {
        statusBadgeHtml = `<span class="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[11px] font-extrabold animate-pulse">🎁 목표 달성! (${item.giver}에게 대화하여 완료)</span>`;
      } else if (isActive) {
        statusBadgeHtml = `<span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-extrabold">🔥 진행 중 (${itemProg}/${item.targetCount})</span>`;
      } else if (canAccept) {
        statusBadgeHtml = `<span class="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/50 text-[11px] font-extrabold">❗ 수락 가능 (${item.giver}와 대화 시 시작)</span>`;
      } else {
        statusBadgeHtml = `<span class="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px] font-bold">🔒 미해금 (${item.conditionDesc})</span>`;
      }

      const catBadgeHtml = item.category === 'main'
        ? `<span class="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold">👑 메인</span>`
        : `<span class="px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30 text-[10px] font-extrabold">🌿 서브</span>`;

      const card = document.createElement('div');
      card.className = `p-3.5 rounded-xl border ${
        isCompleted ? 'bg-emerald-950/25 border-emerald-500/50' :
        isActive ? 'bg-slate-950 border-2 border-amber-400 shadow-lg' :
        canAccept ? 'bg-slate-950 border border-sky-500/60' :
        'bg-slate-950/60 border-slate-800 opacity-75'
      } flex flex-col gap-1.5`;

      card.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-1.5">
            ${catBadgeHtml}
            ${statusBadgeHtml}
            <span class="text-xs sm:text-sm font-extrabold text-white">${item.title}</span>
          </div>
          <span class="text-xs font-mono font-bold text-amber-300">보상: EXP +${item.rewardExp} / 골드 +${item.rewardGold}G</span>
        </div>
        <p class="text-xs text-slate-200 leading-relaxed">${item.story}</p>
        <div class="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-800/80 text-[11px]">
          <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span class="text-sky-300 font-semibold">🎯 ${item.objectiveLabel}: <strong class="font-mono text-amber-300">${itemProg} / ${item.targetCount}</strong></span>
            <span class="text-slate-400">👤 NPC: ${item.giver}</span>
          </div>
          <span class="text-[11px] font-semibold ${canAccept ? 'text-sky-300' : (isReadyToTurnIn ? 'text-emerald-300' : 'text-slate-400')}">
            ${isCompleted ? '✔ 클리어 기록 보관됨' : (isReadyToTurnIn ? '▶ 해당 NPC에게 가서 Enter/F로 대화하세요!' : (isActive ? '▶ 사냥터에서 목표를 달성하세요' : item.conditionDesc))}
          </span>
        </div>
      `;
      listContainer.appendChild(card);
    });
  }
}

function updateRealtimeTelemetryUI() {
  const p = state.player;
  const derived = getDerivedStats();
  const hpPct = Math.max(0, Math.min(100, (p.hp / Math.max(1, derived.maxHp)) * 100));
  const mpPct = Math.max(0, Math.min(100, (p.mp / Math.max(1, derived.maxMp)) * 100));
  const expPct = Math.max(0, Math.min(100, (p.exp / Math.max(1, p.expNext)) * 100));

  document.getElementById('hudHpText').textContent = `${Math.round(p.hp)}/${derived.maxHp}`;
  document.getElementById('hudHpBar').style.width = `${hpPct}%`;
  document.getElementById('hudMpText').textContent = `${Math.round(p.mp)}/${derived.maxMp}`;
  document.getElementById('hudMpBar').style.width = `${mpPct}%`;
  document.getElementById('hudExpText').textContent = `${p.exp}/${p.expNext}`;
  document.getElementById('hudExpBar').style.width = `${expPct}%`;
  document.getElementById('hudLevelText').textContent = `Lv.${p.level}`;
  document.getElementById('hudAtk').textContent = derived.atk;
  document.getElementById('hudDef').textContent = derived.def;
  document.getElementById('hudGold').textContent = `${p.gold}G`;
  document.getElementById('hudSp').textContent = `${p.sp} SP`;
  document.getElementById('headerSpBadge').textContent = `${p.sp} SP`;

  const statusHpEl = document.getElementById('statusStatHp');
  if (statusHpEl) statusHpEl.textContent = `${Math.round(p.hp)}/${derived.maxHp}`;
  const statusMpEl = document.getElementById('statusStatMp');
  if (statusMpEl) statusMpEl.textContent = `${Math.round(p.mp)}/${derived.maxMp}`;

  const boss = state.monsters.find(m => m.zone === state.zoneId && m.isBoss && m.alive);
  const bossHud = document.getElementById('bossHudContainer');
  if (boss && bossHud) {
    bossHud.classList.remove('hidden');
    const nameEl = document.getElementById('bossNameLabel');
    const stateBadgeEl = document.getElementById('bossStateBadge');
    if (nameEl) {
      nameEl.textContent = `👑 Lv.${boss.lv} ${boss.name}`;
    }
    if (stateBadgeEl) {
      stateBadgeEl.textContent = '';
      stateBadgeEl.classList.add('hidden');
    }
    const hpLabelEl = document.getElementById('bossHpLabel');
    if (hpLabelEl) hpLabelEl.textContent = `${boss.hp} / ${boss.maxHp}`;
    const hpBarEl = document.getElementById('bossHpBar');
    if (hpBarEl) hpBarEl.style.width = `${Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100))}%`;
  } else if (bossHud) {
    bossHud.classList.add('hidden');
  }

  for (const sk of ['basic_attack', 'dodge', 'heavy_attack', 'magic_skill', 'special_skill']) {
    const ov = document.getElementById(`cdOverlay_${sk}`);
    const rem = state.cooldownLeft[sk];
    if (rem > 0.05) {
      ov.classList.remove('hidden');
      ov.textContent = `${rem.toFixed(1)}s`;
    } else {
      ov.classList.add('hidden');
    }
  }

  document.getElementById('teleJoyX').textContent = state.sensor.joyX.toFixed(2);
  document.getElementById('teleJoyY').textContent = state.sensor.joyY.toFixed(2);
  document.getElementById('teleGyroVal').textContent = `${state.sensor.gyroDeg.toFixed(1)} °/s`;
  document.getElementById('teleGyroBar').style.width = `${Math.min(100, (state.sensor.gyroDeg / 220) * 100)}%`;
  document.getElementById('teleAccelVal').textContent = `${state.sensor.accelG.toFixed(2)} G`;
  document.getElementById('teleAccelBar').style.width = `${Math.min(100, (state.sensor.accelG / 3.0) * 100)}%`;
  document.getElementById('teleLastAction').textContent = state.sensor.lastAction;
}

function getInventoryItemCategory(item) {
  if (!item) return 'general';
  const dbItem = (typeof ITEMS !== 'undefined' && item.id && ITEMS[item.id]) ? ITEMS[item.id] : item;
  const t = dbItem.type || item.type || '';
  const cat = dbItem.invCategory || item.invCategory || '';
  if (t === 'weapon' || t === 'armor' || t === 'accessory') return 'equip';
  if (t === 'consumable') return 'consumable';
  if (cat === 'important' || ['broken_goblin_weapon', 'important_photo', 'office_key', 'zephyr_ring'].includes(item.id)) {
    return 'important';
  }
  return 'general';
}

function renderInventorySection() {
  const p = state.player;
  for (const slot of ['weapon', 'armor', 'accessory']) {
    const eq = p.equipment[slot];
    const nameEl = document.getElementById(`equipName_${slot}`);
    const statEl = document.getElementById(`equipStat_${slot}`);
    if (nameEl) nameEl.textContent = eq ? eq.name : '장착 없음';
    if (statEl) statEl.textContent = eq ? eq.desc : '현재 장착된 장비가 없습니다.';
  }

  const curTab = state.invCategoryFilter || 'all';
  const counts = {
    all: p.inventory.length,
    equip: p.inventory.filter(i => getInventoryItemCategory(i) === 'equip').length,
    consumable: p.inventory.filter(i => getInventoryItemCategory(i) === 'consumable').length,
    general: p.inventory.filter(i => getInventoryItemCategory(i) === 'general').length,
    important: p.inventory.filter(i => getInventoryItemCategory(i) === 'important').length
  };

  const tabMeta = [
    { key: 'all',        label: `📋 전체 (${counts.all})` },
    { key: 'equip',      label: `⚔️ 장비템 (${counts.equip})` },
    { key: 'consumable', label: `🧪 회복템 (${counts.consumable})` },
    { key: 'general',    label: `📦 일반 아이템 (${counts.general})` },
    { key: 'important',  label: `🗝️ 중요 아이템 (${counts.important})` }
  ];
  tabMeta.forEach(({ key, label }) => {
    const tBtn = document.getElementById(`invTab_${key}`);
    if (tBtn) {
      tBtn.textContent = label;
      tBtn.className = (curTab === key)
        ? 'px-2.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-extrabold transition shadow'
        : 'px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition';
    }
  });

  const filteredItems = p.inventory.filter(item => {
    if (curTab === 'all') return true;
    return getInventoryItemCategory(item) === curTab;
  });

  const countLbl = document.getElementById('invCategoryCountLabel');
  if (countLbl) {
    const catNameMap = {
      all: '전체 아이템',
      equip: '장비템',
      consumable: '회복템',
      general: '일반 아이템',
      important: '중요 아이템'
    };
    countLbl.textContent = `${catNameMap[curTab] || '아이템'}: ${filteredItems.length}종`;
  }

  const grid = document.getElementById('inventoryGrid');
  if (!grid) return;
  grid.innerHTML = '';
  if (filteredItems.length === 0) {
    const emptyTextMap = {
      all: '현재 보유 중인 아이템이 없습니다.',
      equip: '보유 중인 장비템(무기·방어구·장신구)이 없습니다.',
      consumable: '보유 중인 회복템(물약·엘릭서)이 없습니다.',
      general: '보유 중인 일반 아이템(워프석·제작 및 교환 재료)이 없습니다.',
      important: '보유 중인 중요 아이템(퀘스트 핵심 아이템)이 없습니다.'
    };
    grid.innerHTML = `<div class="sm:col-span-2 py-8 px-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-400 text-center">${emptyTextMap[curTab] || '아이템이 없습니다.'}</div>`;
    return;
  }

  filteredItems.forEach(item => {
    const cat = getInventoryItemCategory(item);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/60 text-left transition flex flex-col justify-between gap-1.5';

    let actionLabel = '장착';
    let badgeTone = 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40';
    if (item.type === 'warp') {
      actionLabel = '🌀 워프 사용';
      badgeTone = 'bg-teal-600/30 text-teal-200 border-teal-500/40';
    } else if (item.type === 'consumable') {
      actionLabel = '🧪 회복 사용';
      badgeTone = 'bg-emerald-600/30 text-emerald-200 border-emerald-500/40';
    } else if (cat === 'important') {
      actionLabel = '🗝️ 중요 아이템';
      badgeTone = 'bg-amber-500/25 text-amber-200 border-amber-500/40';
    } else if (cat === 'general') {
      actionLabel = '📦 일반/재료';
      badgeTone = 'bg-sky-600/25 text-sky-200 border-sky-500/40';
    }

    btn.innerHTML = `
      <div class="w-full flex items-center justify-between gap-2">
        <div class="text-xs font-extrabold text-white truncate">${item.name} <span class="text-amber-400 font-mono">x${item.count}</span></div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${badgeTone}">
          ${actionLabel}
        </span>
      </div>
      <div class="w-full max-h-12 overflow-y-auto pr-1 text-[11px] text-slate-300 leading-snug">${item.desc}</div>
    `;
    btn.addEventListener('click', () => useOrEquipInventoryItem(item.id));
    grid.appendChild(btn);
  });
}

function useOrEquipInventoryItem(itemId) {
  if (!isGameViewVisible()) {
    addLog('🔒 [시작 화면 제한] 시작 창에서는 아이템을 사용하거나 장비를 변경할 수 없습니다. [▶ 선택한 캐릭터로 게임 시작] 후 이용해 주세요.');
    return;
  }
  const p = state.player;
  const idx = p.inventory.findIndex(i => i.id === itemId);
  if (idx === -1) return;
  const item = p.inventory[idx];
  const derived = getDerivedStats();

  if (item.type === 'quest' || item.type === 'material') {
    addLog(`📜 [${item.type === 'quest' ? '퀘스트 아이템' : '제작/교환 재료'}] ${item.name}: ${item.desc}`);
    return;
  }
  if (item.type === 'warp') {
    if (typeof useWarpItemToTown === 'function') {
      const ok = useWarpItemToTown(item);
      if (ok) {
        item.count -= 1;
        if (item.count <= 0) p.inventory.splice(idx, 1);
        closeModals();
        savePlayerProgress('워프 아이템 사용');
      }
    }
    return;
  }
  if (item.type === 'consumable') {
    p.hp = Math.min(derived.maxHp, p.hp + (item.healHp || 0));
    p.mp = Math.min(derived.maxMp, p.mp + (item.healMp || 0));
    spawnParticles(p.x, p.y, 20, ['#4ade80', '#38bdf8', '#ffffff'], 160, 5, 0.45);
    state.effects.push({ kind: 'dmg_text', x: p.x, y: p.y - 24, text: `+${item.healHp} HP`, color: '#4ade80', ttl: 0.75 });
    addLog(`🧪 [아이템 사용] ${item.name} 사용! (체력/마나 회복)`);
  } else {
    const prev = p.equipment[item.type];
    p.equipment[item.type] = { ...item, count: 1 };
    if (prev) addItemToInventory(prev.id, 1);
    const newDerived = getDerivedStats();
    p.hp = Math.min(newDerived.maxHp, p.hp + (item.hp || 0));
    addLog(`🛡️ [장비 장착] ${item.name} 장착 완료! (서버 자동 저장)`);
  }
  item.count -= 1;
  if (item.count <= 0) p.inventory.splice(idx, 1);
  soundFX.play('levelup');
  savePlayerProgress('장비/아이템 변경');
}

function showResultScreen(isVictory) {
  const modal = document.getElementById('resultModal');
  modal.classList.remove('hidden');
  const nearTownName = state.zones[state.respawnTownId || getNearestTownZone(state.zoneId)]?.name || '포레스트 타운';
  document.getElementById('resultBadge').textContent = isVictory ? '🏆 VICTORY! 보스 토벌 완료' : '💀 PLAYER DEFEATED (경험치 5% 감소)';
  document.getElementById('resultTitle').textContent = isVictory ? '오크 부족의 대장 발록 처치!' : '전투에서 쓰러졌습니다';
  document.getElementById('resultDesc').textContent = isVictory
    ? 'ESP32 센서 조작과 반격 타이밍으로 발록을 물리쳤습니다! (클리어 기록이 서버에 저장되었습니다)'
    : `사망 페널티로 경험치 5%(-${state.lastExpLost || 0} EXP)가 감소했습니다. [다시하기]를 누르면 인근 마을(${nearTownName})에서 즉시 부활하며, [게임 종료] 후 다시 시작해도 인근 마을에서 부활합니다.`;
  document.getElementById('resLevel').textContent = `Lv.${state.player.level} (EXP ${state.player.exp})`;
  document.getElementById('resKills').textContent = `${state.kills}마리`;
  document.getElementById('resGold').textContent = `${state.player.gold}G`;
  document.getElementById('resSensorCount').textContent = `${state.sensor.actionCount}회`;

  // 플레이어가 죽었을 때는 오직 [다시하기]와 [게임 종료] 버튼 2개만 표시!
  const closeBtn = document.getElementById('btnCloseResultModal');
  if (closeBtn) {
    if (isVictory) closeBtn.classList.remove('hidden');
    else closeBtn.classList.add('hidden');
  }
}

// 시작 화면 <-> 게임 화면 전환 및 모달 팝업(인벤토리/장비창, 스킬 강화창) 제어
function showMainView(viewName) {
  const vStart = document.getElementById('viewStart');
  const vGame = document.getElementById('viewGame');
  closeModals();
  if (viewName === 'start') {
    if (typeof keysDown !== 'undefined' && keysDown.clear) keysDown.clear();
    state.sensor.joyX = 0;
    state.sensor.joyY = 0;
    state.sensor.extJoyX = 0;
    state.sensor.extJoyY = 0;
    vStart.classList.remove('hidden');
    vStart.classList.add('flex');
    vGame.classList.add('hidden');
    vGame.classList.remove('flex');
  } else {
    vStart.classList.add('hidden');
    vStart.classList.remove('flex');
    vGame.classList.remove('hidden');
    vGame.classList.add('flex');
  }
  updateAllUI();
}

function toggleInventoryModal() {
  if (!isGameViewVisible()) {
    addLog('🔒 [시작 화면 제한] 인벤토리 및 아이템 사용은 [▶ 선택한 캐릭터로 게임 시작]을 눌러 게임에 입장한 뒤 이용할 수 있습니다.');
    return;
  }
  const invModal = document.getElementById('viewInventory');
  const skillModal = document.getElementById('skillUpgradeModal');
  const questModal = document.getElementById('questListModal');
  if (questModal) { questModal.classList.add('hidden'); questModal.classList.remove('flex'); }
  skillModal.classList.add('hidden');
  skillModal.classList.remove('flex');
  const isHidden = invModal.classList.contains('hidden');
  if (isHidden) {
    invModal.classList.remove('hidden');
    invModal.classList.add('flex');
    state.isModalOpen = true;
  } else {
    invModal.classList.add('hidden');
    invModal.classList.remove('flex');
    state.isModalOpen = false;
  }
  updateAllUI();
}

function toggleSkillUpgradeModal() {
  const invModal = document.getElementById('viewInventory');
  const skillModal = document.getElementById('skillUpgradeModal');
  const questModal = document.getElementById('questListModal');
  if (questModal) { questModal.classList.add('hidden'); questModal.classList.remove('flex'); }
  invModal.classList.add('hidden');
  invModal.classList.remove('flex');
  const isHidden = skillModal.classList.contains('hidden');
  if (isHidden) {
    skillModal.classList.remove('hidden');
    skillModal.classList.add('flex');
    state.isModalOpen = true;
  } else {
    skillModal.classList.add('hidden');
    skillModal.classList.remove('flex');
    state.isModalOpen = false;
  }
  updateAllUI();
}

function toggleQuestModal() {
  const questModal = document.getElementById('questListModal');
  const invModal = document.getElementById('viewInventory');
  const skillModal = document.getElementById('skillUpgradeModal');
  invModal.classList.add('hidden');
  invModal.classList.remove('flex');
  skillModal.classList.add('hidden');
  skillModal.classList.remove('flex');
  const isHidden = questModal.classList.contains('hidden');
  if (isHidden) {
    questModal.classList.remove('hidden');
    questModal.classList.add('flex');
    state.isModalOpen = true;
  } else {
    questModal.classList.add('hidden');
    questModal.classList.remove('flex');
    state.isModalOpen = false;
  }
  updateAllUI();
}


function renderCharSlotsBar() {
  const box = document.getElementById('charSlotsContainer');
  if (!box) return;
  if (!Array.isArray(state.charSlots) || state.charSlots.length === 0) {
    state.charSlots = [exportSavePayload(true)];
    state.activeSlotIdx = 0;
  } else {
    state.charSlots[state.activeSlotIdx] = exportSavePayload(true);
  }
  box.innerHTML = '';
  state.charSlots.forEach((slot, idx) => {
    const isCurrent = idx === state.activeSlotIdx;
    const isFem = slot.gender === 'female';
    const genBadge = isFem ? '♀ 여성' : '♂ 남성';
    const clsObj = CLASSES[slot.charClass] || CLASSES.knight;
    const clsIcon = slot.charClass === 'mage' ? '🔮' : (slot.charClass === 'ranger' ? '🏹' : '🛡️');

    const row = document.createElement('button');
    row.type = 'button';
    row.className = isCurrent
      ? 'w-full px-3 py-2 rounded-xl bg-indigo-950/80 border-2 border-indigo-400 text-left flex items-center justify-between transition shadow'
      : 'w-full px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between transition';

    row.innerHTML = `
      <div class="flex items-center gap-2 min-w-0">
        <span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold text-[10px]">Lv.${slot.level || 1}</span>
        <span class="text-xs font-extrabold text-white truncate">${escHtml(slot.charName || '에이든')}</span>
        <span class="px-1.5 py-0.2 rounded text-[10px] font-bold ${isFem ? 'bg-pink-500/20 text-pink-300' : 'bg-sky-500/20 text-sky-300'}">${genBadge}</span>
        <span class="text-[11px] font-semibold text-slate-300 truncate">${clsIcon} ${clsObj.name}</span>
      </div>
      <span class="px-2 py-0.5 rounded text-[10px] font-extrabold shrink-0 ${
        isCurrent ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
      }">
        ${isCurrent ? '✔ 선택됨' : '선택'}
      </span>
    `;

    row.addEventListener('click', () => {
      state.charSlots[state.activeSlotIdx] = exportSavePayload(false);
      state.activeSlotIdx = idx;
      applySavedPayload(state.charSlots[idx]);
      saveAllCharSlots();
      sendServerSave(true);
      addLog(`👤 [캐릭터 선택] "${slot.charName || '에이든'}" (Lv.${slot.level || 1} ${clsObj.name}) 캐릭터를 선택했습니다.`);
    });
    box.appendChild(row);
  });
}

function renderCreateCharPreview() {
  const pCanvas = document.getElementById('createCharPreviewCanvas');
  if (!pCanvas) return;
  const pCtx = pCanvas.getContext('2d');
  pCtx.imageSmoothingEnabled = true;
  pCtx.imageSmoothingQuality = 'high';
  pCtx.clearRect(0, 0, 1024, 1024);
  const f = state.createForm;
  const spr = getHD64Sprite(f.charClass, false, f.gender);
  pCtx.drawImage(spr, 48, 40, 928, 928);

  const clsObj = CLASSES[f.charClass] || CLASSES.knight;
  const lbl = document.getElementById('createPreviewLabel');
  if (lbl) lbl.textContent = `${f.gender === 'female' ? '♀ 여성' : '♂ 남성'} · ${clsObj.name}`;

  const btnMale = document.getElementById('btnSelectGenderMale');
  const btnFem = document.getElementById('btnSelectGenderFemale');
  if (btnMale && btnFem) {
    btnMale.className = f.gender === 'male'
      ? 'py-2 px-3 rounded-xl bg-sky-600 text-white font-extrabold border-2 border-sky-300 transition'
      : 'py-2 px-3 rounded-xl bg-slate-950 text-slate-300 font-bold border border-slate-700 hover:border-sky-400 transition';
    btnFem.className = f.gender === 'female'
      ? 'py-2 px-3 rounded-xl bg-pink-600 text-white font-extrabold border-2 border-pink-300 transition'
      : 'py-2 px-3 rounded-xl bg-slate-950 text-slate-300 font-bold border border-slate-700 hover:border-pink-400 transition';
  }

  ['knight', 'mage', 'ranger'].forEach(cKey => {
    const cBtn = document.getElementById(`btnSelectClass_${cKey}`);
    if (cBtn) {
      cBtn.className = f.charClass === cKey
        ? 'py-2 px-2 rounded-xl bg-indigo-600 text-white font-extrabold border-2 border-indigo-300 text-[11px] transition'
        : 'py-2 px-2 rounded-xl bg-slate-950 text-slate-300 font-bold border border-slate-700 text-[11px] transition';
    }
  });
}

function openCreateCharModal(replaceActive = false) {
  const modal = document.getElementById('createCharModal');
  if (!modal) return;
  state.createReplacesActive = Boolean(replaceActive);   // 마지막 캐릭터 삭제 직후에는 임시 기본 캐릭터 자리를 대체
  state.createForm = {
    name: state.charSlots.length === 0 ? '에이든' : `모험가${state.charSlots.length + 1}`,
    gender: 'male',
    charClass: state.selectedClass || 'knight'
  };
  const inp = document.getElementById('inputNewCharName');
  if (inp) inp.value = state.createForm.name;
  renderCreateCharPreview();
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  state.isModalOpen = true;
}

function confirmCreateNewCharacter() {
  const inp = document.getElementById('inputNewCharName');
  const rawName = Array.from((inp?.value || '').trim() || '에이든').slice(0, 6).join('');
  const newGender = state.createForm.gender || 'male';
  const newClass = state.createForm.charClass || 'knight';

  // [세이브 버그 수정] 이전에는 새 캐릭터 초기화 저장이 "기존 활성 슬롯"을 덮어써서 기존 캐릭터가 사라지고
  // 새 캐릭터가 중복으로 들어갔음. 새 캐릭터 전용 슬롯을 먼저 만들고 활성 슬롯으로 지정한 뒤 초기화한다.
  const replaceActive = Boolean(state.createReplacesActive) && Array.isArray(state.charSlots) && state.charSlots.length > 0;
  state.createReplacesActive = false;
  if (!replaceActive) {
    if (Array.isArray(state.charSlots) && state.charSlots.length > 0) {
      state.charSlots[state.activeSlotIdx] = exportSavePayload();   // 기존 캐릭터를 먼저 확정
    } else {
      state.charSlots = [];
    }
    state.charSlots.push(exportSavePayload());                      // 새 캐릭터 자리(임시)
    state.activeSlotIdx = state.charSlots.length - 1;
  }

  state.player.name = rawName;
  state.player.gender = newGender;
  state.player.customCreated = true;
  resetAllProgressToNewGame(newClass, true);
  state.player.name = rawName;
  state.player.gender = newGender;
  state.player.customCreated = true;

  saveAllCharSlots();
  savePlayerProgress(`새 캐릭터 생성 (${rawName})`);
  sendServerSave(true);   // 캐릭터 생성은 즉시 서버에 전송

  closeModals();
  soundFX.play('levelup');
  addLog(`✨ [새 캐릭터 생성 완료] ${newGender === 'female' ? '♀ 여성' : '♂ 남성'} ${CLASSES[newClass].name} "${rawName}" 캐릭터가 생성되었습니다!`);
  updateAllUI();
}

function deleteCurrentCharacterSlot() {
  const curName = state.player.name || '에이든';
  if (Array.isArray(state.charSlots) && state.charSlots.length > 1) {
    state.charSlots.splice(state.activeSlotIdx, 1);
    state.activeSlotIdx = Math.max(0, state.activeSlotIdx - 1);
    applySavedPayload(state.charSlots[state.activeSlotIdx]);
    saveAllCharSlots();
    savePlayerProgress(`캐릭터 삭제 (${curName})`);
    sendServerSave(true);
    soundFX.play('slash3');
    addLog(`🗑️ [캐릭터 삭제 완료] "${curName}" 캐릭터가 삭제되었습니다. 남은 캐릭터 슬롯으로 전환됩니다.`);
  } else {
    // 마지막 남은 캐릭터를 삭제한 경우: 슬롯을 초기화하고 즉시 새 캐릭터 생성 모달을 띄워 원하는 성별/직업으로 새로 만들 수 있게 함
    state.charSlots = [];
    state.activeSlotIdx = 0;
    localStorage.removeItem(SLOTS_STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    state.player.name = '에이든';
    state.player.gender = 'male';
    state.player.customCreated = false;
    saveSync.allowResetOnce = true;
    resetAllProgressToNewGame('knight', false);
    sendServerSave(true);
    soundFX.play('slash3');
    addLog(`🗑️ [캐릭터 삭제 완료] "${curName}" 캐릭터를 삭제했습니다. 새 캐릭터를 생성해 주세요!`);
    openCreateCharModal(true);
  }
  updateAllUI();
}

function openShopModal(merchantName = '상점 주인 루시', shopTownId = null) {
  closeModals();
  state.activeShopTownId = shopTownId || state.zoneId || 'forest_town';
  const shopModal = document.getElementById('shopModal');
  const createModal = document.getElementById('createCharModal');
  if (!shopModal) return;
  document.getElementById('shopModalTitle').textContent = `🏪 ${merchantName}의 워프 주문서 & 잡화 상점`;
  renderShopModal();
  shopModal.classList.remove('hidden');
  shopModal.classList.add('flex');
  state.isModalOpen = true;
  addLog(`🏪 [${merchantName} 상점 오픈] 골드로 인근 마을 워프 주문서와 물약·장비를 구매할 수 있습니다.`);
}

function renderShopModal() {
  const goldBadge = document.getElementById('shopGoldBadge');
  if (goldBadge) goldBadge.textContent = `💰 보유 골드: ${state.player.gold}G`;
  const grid = document.getElementById('shopItemsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const catalog = (typeof getShopCatalogForZone === 'function') ? getShopCatalogForZone(state.activeShopTownId || state.zoneId) : SHOP_CATALOG;
  catalog.forEach(itemId => {
    const tpl = ITEMS[itemId];
    if (!tpl) return;
    const owned = state.player.inventory.find(i => i.id === itemId)?.count || 0;
    const canAfford = state.player.gold >= (tpl.price || 100);
    const card = document.createElement('div');
    card.className = 'p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2';
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs sm:text-sm font-extrabold ${tpl.type === 'warp' ? 'text-teal-300' : 'text-white'}">${tpl.name}</span>
          <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300">보유: ${owned}개</span>
        </div>
        <p class="text-[11px] text-slate-300 mt-1 leading-snug">${tpl.desc}</p>
      </div>
      <div class="flex items-center justify-between pt-2 border-t border-slate-800/80">
        <span class="text-xs font-mono font-extrabold text-amber-400">가격: ${tpl.price}G</span>
        <button type="button" data-buy-item="${tpl.id}" class="px-3 py-1.5 rounded-lg ${
          canAfford
            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold'
            : 'bg-slate-800 text-slate-500 font-bold cursor-not-allowed'
        } text-xs transition">
          ${canAfford ? '💰 골드로 구매' : '골드 부족'}
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('[data-buy-item]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-buy-item');
      buyShopItem(id);
    });
  });
}

function buyShopItem(itemId) {
  const tpl = ITEMS[itemId];
  if (!tpl) return;
  const price = tpl.price || 100;
  if (state.player.gold < price) {
    addLog(`❗ [골드 부족] [${tpl.name}] 구매에 ${price}G가 필요합니다. (현재 보유: ${state.player.gold}G)`);
    return;
  }
  state.player.gold -= price;
  addItemToInventory(itemId, 1);
  soundFX.play('levelup');
  addLog(`🛒 [상점 구매 완료] ${price}G를 지불하고 [${tpl.name}] 1개를 구매했습니다!`);
  savePlayerProgress(`상점 구매: ${tpl.name}`);
  renderShopModal();
}

function closeModals() {
  const invModal = document.getElementById('viewInventory');
  const skillModal = document.getElementById('skillUpgradeModal');
  const questModal = document.getElementById('questListModal');
  const shopModal = document.getElementById('shopModal');
  const createModal = document.getElementById('createCharModal');
  const sailingModal = document.getElementById('sailingModal');
  const craftModal = document.getElementById('craftModal');
  invModal.classList.add('hidden');
  invModal.classList.remove('flex');
  skillModal.classList.add('hidden');
  skillModal.classList.remove('flex');
  if (questModal) {
    questModal.classList.add('hidden');
    questModal.classList.remove('flex');
  }
  if (shopModal) {
    shopModal.classList.add('hidden');
    shopModal.classList.remove('flex');
  }
  if (createModal) {
    createModal.classList.add('hidden');
    createModal.classList.remove('flex');
  }
  if (sailingModal) {
    sailingModal.classList.add('hidden');
    sailingModal.classList.remove('flex');
  }
  if (craftModal) {
    craftModal.classList.add('hidden');
    craftModal.classList.remove('flex');
  }
  state.isModalOpen = false;
}

// ============================================================================
// [세이렌의 섬 항해 UI 모달 제어] (메인 7장 클리어 이후 해금된 목적지 나열 및 항해 이동)
// ============================================================================
function isSailingDestinationUnlocked(dest) {
  if (!dest) return false;
  if (Array.isArray(state.unlockedSailing) && state.unlockedSailing.includes(dest.targetZoneId)) {
    return true;
  }
  if (dest.targetZoneId === 'oceanblue_town' || dest.targetZoneId === 'flower_island_1') {
    return getQuestState('main_7').status === 'completed';
  }
  if (dest.targetZoneId === 'beer_cave_1') {
    const q12 = getQuestState('main_12');
    return q12.status === 'active' || q12.status === 'completed';
  }
  if (dest.targetZoneId === 'minatomachi') {
    const q20 = getQuestState('main_20');
    return q20.status === 'active' || q20.status === 'completed';
  }
  return false;
}

function getActiveSailingDestinations() {
  const allDests = (typeof SAILING_DESTINATIONS !== 'undefined' && Array.isArray(SAILING_DESTINATIONS))
    ? SAILING_DESTINATIONS
    : [];
  const isNanami = state.activeSailNpcId === 'navigator_minato' || state.zoneId === 'minatomachi';
  if (isNanami) {
    // 미나토마치 항해사 나나미: 1. 미나토마치("귀환"), 2. 오션블루 타운("항해합니다") 두 개만 표시
    const minatoDest = allDests.find(d => d.id === 'minatomachi' || d.targetZoneId === 'minatomachi');
    const oceanDest = allDests.find(d => d.id === 'oceanblue_town' || d.targetZoneId === 'oceanblue_town');
    const res = [];
    if (minatoDest) {
      res.push({
        ...minatoDest,
        desc: '신피타이리쿠 군도의 거대한 섬 도시 구역 「미나토마치」로 귀환합니다.'
      });
    }
    if (oceanDest) {
      res.push({
        ...oceanDest,
        desc: '평화로운 해안 항구 마을 오션블루 타운으로 항해합니다.'
      });
    }
    return res;
  }
  return allDests;
}

function openSailingModal(npcId = null) {
  closeModals();
  state.activeSailNpcId = npcId || (state.zoneId === 'minatomachi' ? 'navigator_minato' : 'navigator_seiren');
  const modal = document.getElementById('sailingModal');
  if (!modal) return;
  renderSailingModal();
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  state.isModalOpen = true;
  const isNanami = state.activeSailNpcId === 'navigator_minato' || state.zoneId === 'minatomachi';
  addLog(isNanami
    ? '⛵ [항해사 나나미의 섬 항해] 이동할 목적지(1. 미나토마치 / 2. 오션블루 타운)를 선택해 출항하세요!'
    : '⛵ [세이렌의 섬 항해] 이동할 목적지를 마우스로 클릭하거나 숫자키(1~4) / Enter(F) 키를 눌러 출항하세요!');
}

function renderSailingModal() {
  const grid = document.getElementById('sailingDestinationsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const isNanami = state.activeSailNpcId === 'navigator_minato' || state.zoneId === 'minatomachi';
  const titleEl = document.getElementById('sailingModalTitle');
  const descEl = document.getElementById('sailingModalDesc');
  if (titleEl) {
    titleEl.textContent = isNanami
      ? '⛵ 항해사 나나미 — 섬 항해 목적지 선택'
      : '⛵ 항해사 세이렌 — 섬 항해 목적지 선택';
  }
  if (descEl) {
    descEl.textContent = isNanami
      ? '이동할 목적지 목록입니다. 클릭하거나 숫자키(1~2) / Enter(F)로 즉시 출항하세요.'
      : '지금까지 해금된 목적지 목록입니다. 클릭하거나 숫자키(1~4) / Enter(F)로 즉시 출항하세요.';
  }

  const destList = getActiveSailingDestinations();

  destList.forEach((dest, idx) => {
    const unlocked = isSailingDestinationUnlocked(dest);
    const isHere = state.zoneId === dest.targetZoneId;
    const card = document.createElement('div');
    card.className = `p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
      !unlocked
        ? 'bg-slate-950/60 border-slate-800 opacity-65'
        : (isHere ? 'bg-sky-950/40 border-2 border-sky-400' : 'bg-slate-950 border-slate-700 hover:border-sky-400')
    }`;

    const reqText = dest.unlockQuestId === 'main_7'
      ? '메인 7장 클리어 시 해금'
      : (dest.unlockQuestId === 'main_12' ? '메인 12장 수락 시 해금' : '메인 20장 수락 시 해금');

    card.innerHTML = `
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono text-[10px] font-extrabold">[${idx + 1}번]</span>
          <span class="text-xs sm:text-sm font-extrabold ${unlocked ? 'text-white' : 'text-slate-400'}">${dest.name}</span>
          ${isHere ? '<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">현재 위치</span>' : ''}
        </div>
        <p class="text-[11px] text-slate-300 mt-1">${unlocked ? dest.desc : `🔒 미해금 (${reqText})`}</p>
      </div>
      <button type="button" data-sail-dest="${dest.id}" ${!unlocked ? 'disabled' : ''} class="px-3.5 py-2 rounded-xl text-xs font-extrabold shrink-0 transition ${
        !unlocked
          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
          : 'bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-400 hover:to-teal-300 text-slate-950 shadow'
      }">
        ${!unlocked ? '🔒 미해금' : (isHere ? '⛵ 재정박' : '⛵ 출항하기')}
      </button>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('[data-sail-dest]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-sail-dest');
      sailToDestination(id);
    });
  });
}

function sailToDestination(destId) {
  const destList = (typeof SAILING_DESTINATIONS !== 'undefined' && Array.isArray(SAILING_DESTINATIONS))
    ? SAILING_DESTINATIONS
    : [];
  const dest = destList.find(d => d.id === destId || d.targetZoneId === destId);
  if (!dest) return false;
  if (!isSailingDestinationUnlocked(dest)) {
    addLog(`🔒 [항해 미해금] 아직 "${dest.name}" 항로가 개방되지 않았습니다.`);
    return false;
  }

  closeModals();
  soundFX.play('levelup');
  switchZone(dest.targetZoneId, dest.sx || 150, dest.sy || 300, true);
  spawnParticles(state.player.x, state.player.y, 48, ['#38bdf8', '#2dd4bf', '#fde047', '#ffffff'], 260, 6, 0.75);
  state.effects.push({
    kind: 'dmg_text',
    x: state.player.x,
    y: state.player.y - 38,
    text: `⛵ 항해 도착! (${dest.name})`,
    color: '#38bdf8',
    ttl: 1.2
  });
  addLog(`⛵ [섬 항해 완료] ${(state.activeSailNpcId === 'navigator_minato') ? '나나미' : '세이렌'}의 배를 타고 "${dest.name}"에 도착했습니다!`);
  savePlayerProgress(`섬 항해: ${dest.name}`);
  return true;
}

// ============================================================================
// [대장장이 브론의 세트 장비 제작 & 보스 전리품 교환소 UI]
// ============================================================================
function openCraftModal() {
  closeModals();
  const modal = document.getElementById('craftModal');
  if (!modal) return;
  renderCraftModal();
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  state.isModalOpen = true;
  addLog('🔨 [대장장이 브론 제작/교환소] 해적 잡동사니, 수상한 암석, 에리크의 붉은 수염, 세라피리아의 증표로 장비를 제작·교환할 수 있습니다.');
}

function renderCraftModal() {
  const grid = document.getElementById('craftRecipesGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const recipes = (typeof CRAFT_RECIPES !== 'undefined' && Array.isArray(CRAFT_RECIPES)) ? CRAFT_RECIPES : [];
  recipes.forEach(rc => {
    const resultItem = ITEMS[rc.resultItemId];
    const matItem = ITEMS[rc.materialItemId];
    if (!resultItem || !matItem) return;

    const ownedMat = state.player.inventory.find(i => i.id === rc.materialItemId)?.count || 0;
    const canCraft = ownedMat >= rc.materialCount;

    const card = document.createElement('div');
    card.className = 'p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2';
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs sm:text-sm font-extrabold text-amber-300">${resultItem.name}</span>
          <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-bold text-sky-300">${rc.category === 'exchange' ? '보스 교환' : '재료 제작'}</span>
        </div>
        <p class="text-[11px] text-slate-300 mt-1 leading-snug">${resultItem.desc}</p>
      </div>
      <div class="flex items-center justify-between pt-2 border-t border-slate-800/80">
        <span class="text-[11px] font-mono font-bold ${canCraft ? 'text-emerald-300' : 'text-slate-400'}">
          재료: ${matItem.name} (${ownedMat}/${rc.materialCount})
        </span>
        <button type="button" data-craft-id="${rc.id}" class="px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
          canCraft
            ? 'bg-orange-500 hover:bg-orange-400 text-slate-950'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }">
          ${canCraft ? (rc.category === 'exchange' ? '🎁 교환하기' : '🔨 제작하기') : '재료 부족'}
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('[data-craft-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-craft-id');
      craftOrExchangeItem(id);
    });
  });
}

function craftOrExchangeItem(recipeId) {
  const recipes = (typeof CRAFT_RECIPES !== 'undefined' && Array.isArray(CRAFT_RECIPES)) ? CRAFT_RECIPES : [];
  const rc = recipes.find(r => r.id === recipeId);
  if (!rc) return;
  const matIdx = state.player.inventory.findIndex(i => i.id === rc.materialItemId);
  const owned = matIdx !== -1 ? state.player.inventory[matIdx].count : 0;
  const matName = ITEMS[rc.materialItemId]?.name || rc.materialItemId;
  const resName = ITEMS[rc.resultItemId]?.name || rc.resultItemId;

  if (owned < rc.materialCount) {
    addLog(`❗ [재료 부족] [${resName}] 제작에 [${matName}] ${rc.materialCount}개가 필요합니다. (현재 보유: ${owned}개)`);
    return;
  }

  state.player.inventory[matIdx].count -= rc.materialCount;
  if (state.player.inventory[matIdx].count <= 0) {
    state.player.inventory.splice(matIdx, 1);
  }
  addItemToInventory(rc.resultItemId, 1);
  soundFX.play('levelup');
  addLog(`🔨 [제작/교환 성공!] [${matName}] ${rc.materialCount}개를 사용하여 [${resName}] 1개를 획득했습니다!`);
  savePlayerProgress(`장비 제작: ${resName}`);
  renderCraftModal();
  updateAllUI();
}
