document.getElementById('btnReturnToStart').addEventListener('click', () => {
  if (isGameViewVisible()) {
    savePlayerProgress('시작/상태창 이동');
    sendServerSave(true);
  }
  showMainView('start');
});
document.getElementById('btnOpenInventoryModal').addEventListener('click', () => toggleInventoryModal());
document.getElementById('btnOpenSkillModal').addEventListener('click', () => toggleSkillUpgradeModal());
document.getElementById('btnOpenQuestModal').addEventListener('click', () => toggleQuestModal());
document.getElementById('btnBackToGameFromInv').addEventListener('click', () => closeModals());
document.querySelectorAll('[data-inv-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.invCategoryFilter = btn.getAttribute('data-inv-tab') || 'all';
    renderInventorySection();
  });
});

document.getElementById('btnCloseSkillModal').addEventListener('click', () => closeModals());
document.getElementById('btnCloseQuestModal').addEventListener('click', () => closeModals());
document.getElementById('btnCloseShopModal').addEventListener('click', () => closeModals());
const btnCloseSailingEl = document.getElementById('btnCloseSailingModal');
if (btnCloseSailingEl) btnCloseSailingEl.addEventListener('click', () => closeModals());
const btnCloseCraftEl = document.getElementById('btnCloseCraftModal');
if (btnCloseCraftEl) btnCloseCraftEl.addEventListener('click', () => closeModals());

const btnDialogSailEl = document.getElementById('btnDialogOpenSailing');
if (btnDialogSailEl) {
  btnDialogSailEl.addEventListener('click', (e) => {
    e.stopPropagation();
    const meta = state.dialogMeta || {};
    const sailNpcId = meta.npcId || null;
    closeNpcDialog(true);
    if (meta.canCraft && typeof openCraftModal === 'function') {
      openCraftModal();
    } else if (typeof openSailingModal === 'function') {
      openSailingModal(sailNpcId);
    }
  });
}
const btnDialogCloseSailEl = document.getElementById('btnDialogCloseSailing');
if (btnDialogCloseSailEl) {
  btnDialogCloseSailEl.addEventListener('click', (e) => {
    e.stopPropagation();
    closeNpcDialog();
  });
}
document.getElementById('btnUseWarpScrollHud').addEventListener('click', () => {
  const warpItem = state.player.inventory.find(i => i.type === 'warp' && i.count > 0);
  if (warpItem) {
    useOrEquipInventoryItem(warpItem.id);
  } else {
    addLog('❗ [워프 주문서 없음] 보유한 워프 주문서가 없습니다! 마을의 상점 NPC(루시/코랄)에게 대화(Enter/F)하여 골드(100G)로 [📜 인근 마을 워프 주문서]를 구매하세요.');
  }
});

document.getElementById('btnQuestGoZone').addEventListener('click', () => {
  const q = getActiveQuest();
  if (!q) return;
  const targetZone = state.quest.progress >= q.targetCount ? q.turnInZoneId : q.zoneId;
  switchZone(targetZone, 220, 300);
});
document.getElementById('btnQuestCompleteNow').addEventListener('click', () => {
  completeCurrentQuest();
});

// 이전 버전 호환용 숨김 버튼 리스너
const PLAYER_SLOT_IDS = [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }, { id: 'p4' }];
document.getElementById('tabBtnStart').addEventListener('click', () => showMainView('start'));
document.getElementById('tabBtnGame').addEventListener('click', () => showMainView('game'));
document.getElementById('tabBtnInventory').addEventListener('click', () => toggleInventoryModal());
document.getElementById('tabBtnArch').addEventListener('click', () => closeModals());
document.getElementById('btnBackToGameFromArch').addEventListener('click', () => closeModals());
document.getElementById('btnAddConnectedUser').addEventListener('click', () => addLog('[1P 전용] 싱글플레이 모드입니다.'));
document.getElementById('btnRemoveConnectedUser').addEventListener('click', () => addLog('[1P 전용] 싱글플레이 모드입니다.'));
document.getElementById('btnToggleCoop').addEventListener('click', () => addLog('[1P 전용] 싱글플레이 모드입니다.'));

document.getElementById('btnManualSaveHeader').addEventListener('click', () => {
  savePlayerProgress('수동 저장');
  soundFX.play('levelup');
  if (wsWanted && wsIsOpen()) {
    saveSync.manualPending = true;
    sendServerSave(true);
    addLog('💾 [수동 저장 완료] 브라우저 로컬 저장소 및 RPi 4 서버에 현재 진행도를 저장했습니다.');
  } else if (localFileSync.dirHandle || localFileSync.handle || localFileSync.localApiAvailable) {
    writeBundleToLinkedLocalFile();
    addLog(`💾 [수동 저장 완료] 브라우저 및 Save_Datas 폴더(${localFileSync.fileName})에 즉시 저장했습니다!`);
  } else {
    addLog('💾 [수동 저장 완료] 현재 진행도를 브라우저에 즉시 저장했습니다. 영구 파일로 보관하려면 [📥 세이브 파일 저장 (.json)]을 누르세요!');
  }
});

// 오프라인 세이브 파일(.json) 다운로드 / 불러오기 / 실시간 파일 연동 이벤트 리스너
['btnExportSaveStart', 'btnExportSaveHeader'].forEach(btnId => {
  const el = document.getElementById(btnId);
  if (el) el.addEventListener('click', () => exportSaveToJsonFile());
});

['btnImportSaveStart', 'btnImportSaveHeader'].forEach(btnId => {
  const el = document.getElementById(btnId);
  if (el) {
    el.addEventListener('click', () => openImportSaveFromSaveDatas());
  }
});

const inputImportEl = document.getElementById('inputImportSaveFile');
if (inputImportEl) {
  inputImportEl.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || '');
      importSaveFromJsonText(text, file.name);
    };
    reader.onerror = () => {
      addLog(`❗ [파일 읽기 실패] "${file.name}" 파일을 읽는 도중 오류가 발생했습니다.`);
    };
    reader.readAsText(file, 'utf-8');
  });
}

const btnLinkFileEl = document.getElementById('btnLinkLocalSaveFile');
if (btnLinkFileEl) {
  btnLinkFileEl.addEventListener('click', () => linkLocalSaveFileForAutoSave());
}

    document.getElementById('btnOpenCreateCharModal').addEventListener('click', () => openCreateCharModal());
document.getElementById('btnCloseCreateCharModal').addEventListener('click', () => closeModals());
document.getElementById('btnDeleteCharSlot').addEventListener('click', () => deleteCurrentCharacterSlot());
document.getElementById('btnSelectGenderMale').addEventListener('click', () => {
  state.createForm.gender = 'male';
  renderCreateCharPreview();
});
document.getElementById('btnSelectGenderFemale').addEventListener('click', () => {
  state.createForm.gender = 'female';
  renderCreateCharPreview();
});
document.querySelectorAll('[data-create-class]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.createForm.charClass = btn.getAttribute('data-create-class');
    renderCreateCharPreview();
  });
});
document.getElementById('btnConfirmCreateChar').addEventListener('click', () => confirmCreateNewCharacter());

document.getElementById('btnResetProgress').addEventListener('click', () => {
  resetAllProgressToNewGame(state.selectedClass);
  soundFX.play('slash3');
});

// 게임 시작 버튼: 죽은 상태(게임 종료 후 재시작 또는 웹 서버 재접속)라면 인근 마을에서 부활된 상태로 시작!
document.getElementById('btnStartAdventure').addEventListener('click', () => {
  const derived = getDerivedStats();
  if (state.playerDead || state.player.hp <= 0) {
    const targetTown = state.respawnTownId || getNearestTownZone(state.zoneId);
    state.playerDead = false;
    state.gameOver = false;
    state.player.hp = derived.maxHp;
    state.player.mp = derived.maxMp;
    switchZone(targetTown, 310, 300);
    showMainView('game');
    addLog(`✨ [인근 마을 부활 시작] 안전지대 [${state.zones[targetTown].name}]에서 부활된 상태로 게임을 시작합니다!`);
    return;
  }
  state.gameOver = false;
  state.player.adventureStarted = true;
  savePlayerProgress('게임 시작');
  sendServerSave(true);
  showMainView('game');
  addLog(`▶ [이어하기 시작] Lv.${state.player.level} ${CLASSES[state.selectedClass].name} 캐릭터로 게임을 진행합니다!`);
});

document.getElementById('npcDialogBox').addEventListener('click', () => {
  advanceOrCloseNpcDialog(false);
});

document.getElementById('quickClassKnight').addEventListener('click', () => changePlayerClassPreservingProgress('knight'));
document.getElementById('quickClassMage').addEventListener('click', () => changePlayerClassPreservingProgress('mage'));
document.getElementById('quickClassRanger').addEventListener('click', () => changePlayerClassPreservingProgress('ranger'));

document.querySelectorAll('.class-card').forEach(card => {
  card.addEventListener('click', () => {
    const cls = card.getAttribute('data-class');
    changePlayerClassPreservingProgress(cls);
  });
});

canvas.addEventListener('pointerdown', (e) => {
  if (state.isTalkingToNpc) {
    advanceOrCloseNpcDialog(false);
    return;
  }
  if (state.isModalOpen) return;
  const rect = canvas.getBoundingClientRect();
  const mx = ((e.clientX - rect.left) / rect.width) * LOGICAL_W;
  const my = ((e.clientY - rect.top) / rect.height) * LOGICAL_H;
  const dx = mx - state.player.x;
  const dy = my - state.player.y;
  const dist = Math.hypot(dx, dy);
  if (dist > 4) {
    state.player.fx = dx / dist;
    state.player.fy = dy / dist;
  }
  triggerSensorAction('basic_attack', 'CANVAS_CLICK');
});

document.getElementById('btnCanvasOpenQuest').addEventListener('click', () => toggleQuestModal());
document.getElementById('questCatMain').addEventListener('click', () => { state.questCategoryFilter = 'main'; renderQuestUI(); });
document.getElementById('questCatSub').addEventListener('click', () => { state.questCategoryFilter = 'sub'; renderQuestUI(); });
document.getElementById('questCatAll').addEventListener('click', () => { state.questCategoryFilter = 'all'; renderQuestUI(); });
document.getElementById('questFilterAll').addEventListener('click', () => { state.questFilter = 'all'; renderQuestUI(); });
document.getElementById('questFilterActive').addEventListener('click', () => { state.questFilter = 'active'; renderQuestUI(); });
document.getElementById('questFilterCompleted').addEventListener('click', () => { state.questFilter = 'completed'; renderQuestUI(); });
document.getElementById('compatBtnQAll').addEventListener('click', () => { state.questFilter = 'all'; renderQuestUI(); });
document.getElementById('compatBtnQComp').addEventListener('click', () => { state.questFilter = 'completed'; renderQuestUI(); });
document.getElementById('compatBtnQAct').addEventListener('click', () => { state.questFilter = 'active'; renderQuestUI(); });

document.getElementById('btnZoneHome').addEventListener('click', () => switchZone('home_interior', 220, 300));
document.getElementById('btnZoneForest').addEventListener('click', () => switchZone('emerald_forest', 200, 300));
document.getElementById('btnZoneForestTown').addEventListener('click', () => switchZone('forest_town', 280, 300));
document.getElementById('btnZoneRuins').addEventListener('click', () => switchZone('ancient_ruins', 140, 300));
document.getElementById('btnZoneOrcCanyon').addEventListener('click', () => switchZone('orc_canyon_1', 140, 300));
document.getElementById('btnZoneBoss').addEventListener('click', () => switchZone('abyssal_altar', 140, 300));
document.getElementById('btnZoneCoastal1').addEventListener('click', () => switchZone('coastal_road_1', 140, 300));
document.getElementById('btnZoneOceanTown').addEventListener('click', () => switchZone('oceanblue_town', 260, 300));
document.getElementById('compatBtnHome').addEventListener('click', () => switchZone('home_interior', 220, 300));
document.getElementById('compatBtnRuins2').addEventListener('click', () => switchZone('ancient_ruins', 140, 300));
document.getElementById('compatBtnBoss2').addEventListener('click', () => switchZone('abyssal_altar', 140, 300));
document.getElementById('compatBtnCloseQ').addEventListener('click', () => closeModals());
document.getElementById('compatBtnForest').addEventListener('click', () => switchZone('emerald_forest', 200, 300));
document.getElementById('compatBtnRuins').addEventListener('click', () => switchZone('ancient_ruins', 140, 300));
document.getElementById('compatBtnBoss').addEventListener('click', () => switchZone('abyssal_altar', 140, 300));
document.getElementById('compatBtnSave').addEventListener('click', () => savePlayerProgress('수동 저장'));

document.getElementById('skillBtn_basic_attack').addEventListener('click', () => triggerSensorAction('basic_attack', 'BTN_GPIO33'));
document.getElementById('skillBtn_dodge').addEventListener('click', () => triggerSensorAction('dodge', 'GYRO_MPU6050'));
document.getElementById('skillBtn_heavy_attack').addEventListener('click', () => triggerSensorAction('heavy_attack', 'ACCEL_MPU6050'));
document.getElementById('skillBtn_magic_skill').addEventListener('click', () => triggerSensorAction('magic_skill', 'TOUCH_T0'));
document.getElementById('skillBtn_special_skill').addEventListener('click', () => triggerSensorAction('special_skill', 'TOUCH_T3'));
document.getElementById('skillBtn_interact').addEventListener('click', () => triggerSensorAction('interact', 'JOY_SW'));

document.getElementById('btnSimGyroDodge').addEventListener('click', () => triggerSensorAction('dodge', 'VIRTUAL_GYRO'));
document.getElementById('btnSimAccelHeavy').addEventListener('click', () => triggerSensorAction('heavy_attack', 'VIRTUAL_ACCEL'));
document.getElementById('btnSimTouchMagic').addEventListener('click', () => triggerSensorAction('magic_skill', 'VIRTUAL_T0'));
document.getElementById('btnSimTouchSpecial').addEventListener('click', () => triggerSensorAction('special_skill', 'VIRTUAL_T3'));
document.getElementById('btnSimAttack').addEventListener('click', () => triggerSensorAction('basic_attack', 'VIRTUAL_BTN'));
document.getElementById('btnSimInteract').addEventListener('click', () => triggerSensorAction('interact', 'VIRTUAL_SW'));

document.getElementById('btnQuickPotion').addEventListener('click', () => {
  const pot = state.player.inventory.find(i => i.type === 'consumable');
  if (pot) useOrEquipInventoryItem(pot.id);
  else addLog('[인벤토리] 사용 가능한 회복 물약이 없습니다.');
});

['basic_attack', 'dodge', 'heavy_attack', 'magic_skill', 'special_skill'].forEach(sk => {
  document.getElementById(`upBtn_${sk}`).addEventListener('click', () => {
    const curLv = getClampedSkillLevel(state.player.skills[sk]);
    state.player.skills[sk] = curLv;
    const korName = SKILL_LABELS[sk] || sk;
    if (curLv >= MAX_SKILL_LEVEL) {
      addLog(`✨ [최대 레벨 도달] "${korName}" 스킬은 이미 최고 레벨(Lv.${MAX_SKILL_LEVEL} MAX)입니다! 다른 스킬을 강화해 보세요.`);
      updateAllUI();
      return;
    }
    if (state.player.sp > 0) {
      state.player.sp -= 1;
      state.player.skills[sk] = Math.min(MAX_SKILL_LEVEL, curLv + 1);
      soundFX.play('levelup');
      spawnParticles(state.player.x, state.player.y, 24, ['#fde047', '#34d399', '#ffffff'], 190, 5, 0.5);
      const nextLv = state.player.skills[sk];
      addLog(`⬆️ [스킬 강화] "${korName}" 스킬이 Lv.${nextLv}/${MAX_SKILL_LEVEL}${nextLv >= MAX_SKILL_LEVEL ? ' (MAX!)' : ''}(으)로 강화되었습니다!`);
      savePlayerProgress('스킬 강화');
    } else {
      addLog('[스킬 포인트 부족] 몬스터를 처치하고 레벨을 올려 SP를 획득하세요.');
    }
  });
});

document.getElementById('btnToggleAudio').addEventListener('click', (e) => {
  soundFX.enabled = !soundFX.enabled;
  e.currentTarget.textContent = soundFX.enabled ? '🔊 효과음 ON' : '🔇 효과음 OFF';
});

// [다시하기] 버튼: 즉시 인근 마을에서 부활!
document.getElementById('btnRestartGame').addEventListener('click', () => {
  revivePlayerAtNearestTown();
});
// [게임 종료] 버튼: 시작창으로 돌아가며, 다시 게임 시작 버튼을 누르면 인근 마을에서 부활하여 시작!
document.getElementById('btnQuitOnDeath').addEventListener('click', () => {
  document.getElementById('resultModal').classList.add('hidden');
  state.playerDead = true;
  state.respawnTownId = state.respawnTownId || getNearestTownZone(state.zoneId);
  savePlayerProgress('사망 후 시작창 이동 (재시작 시 인근 마을 부활)');
  showMainView('start');
  addLog('🚪 [시작 화면으로 이동] 다시 [게임 시작]을 누르면 인근 안전지대 마을에서 부활하여 시작됩니다.');
});
document.getElementById('compatBtnRestartOld').addEventListener('click', () => {
  revivePlayerAtNearestTown();
});
document.getElementById('btnCloseResultModal').addEventListener('click', () => {
  document.getElementById('resultModal').classList.add('hidden');
});


const joyPad = document.getElementById('virtualJoystickPad');
const joyKnob = document.getElementById('virtualJoystickKnob');
let joyDragging = false;

function updateVirtualJoystick(clientX, clientY) {
  if (state.isTalkingToNpc || state.isModalOpen) return;
  const rect = joyPad.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const maxR = rect.width / 2 - 12;
  let dx = clientX - cx;
  let dy = clientY - cy;
  const dist = Math.hypot(dx, dy);
  if (dist > maxR) {
    dx = (dx / dist) * maxR;
    dy = (dy / dist) * maxR;
  }
  joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
  state.sensor.joyX = dx / maxR;
  state.sensor.joyY = dy / maxR;
  state.sensor.source = 'VIRTUAL_JOY';
}

function resetVirtualJoystick() {
  joyDragging = false;
  joyKnob.style.transform = 'translate(0px, 0px)';
  state.sensor.joyX = 0;
  state.sensor.joyY = 0;
}

joyPad.addEventListener('pointerdown', (e) => {
  joyDragging = true;
  joyPad.setPointerCapture(e.pointerId);
  updateVirtualJoystick(e.clientX, e.clientY);
});
joyPad.addEventListener('pointermove', (e) => {
  if (joyDragging) updateVirtualJoystick(e.clientX, e.clientY);
});
joyPad.addEventListener('pointerup', resetVirtualJoystick);
joyPad.addEventListener('pointercancel', resetVirtualJoystick);

// 키보드 단축키: I (인벤토리/장비창), P (스킬 강화창), ESC (모달/대화 닫기)
const keysDown = new Set();
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
  const k = e.key.toLowerCase();
  if (!isGameViewVisible()) {
    if (k === 'escape' && state.isModalOpen) closeModals();
    keysDown.clear();
    state.sensor.joyX = 0;
    state.sensor.joyY = 0;
    return;
  }
  keysDown.add(k);

  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'enter'].includes(k)) {
    e.preventDefault();
  }

  if (k === 'escape') {
    if (state.isModalOpen) closeModals();
    if (state.isTalkingToNpc) closeNpcDialog();
    return;
  }
  if (k === 'i') {
    toggleInventoryModal();
    return;
  }
  if (k === 'p') {
    toggleSkillUpgradeModal();
    return;
  }
  if (k === 'j') {
    toggleQuestModal();
    return;
  }

  if (state.isTalkingToNpc) {
    if (k === 'enter' || k === 'f' || k === ' ') {
      advanceOrCloseNpcDialog(true);
    }
    return;
  }

  // 세이렌 섬 항해 모달이 열려 있을 때 숫자키(1~4) 또는 Enter/F로 즉시 항해 지원
  const sailingModalEl = document.getElementById('sailingModal');
  if (sailingModalEl && !sailingModalEl.classList.contains('hidden')) {
    const dests = (typeof getActiveSailingDestinations === 'function')
      ? getActiveSailingDestinations()
      : ((typeof SAILING_DESTINATIONS !== 'undefined' && Array.isArray(SAILING_DESTINATIONS)) ? SAILING_DESTINATIONS : []);
    if (['1', '2', '3', '4'].includes(k)) {
      const targetDest = dests[Number(k) - 1];
      if (targetDest && typeof sailToDestination === 'function') {
        sailToDestination(targetDest.id);
      }
      return;
    }
    if (k === 'enter' || k === 'f') {
      const unlockedDests = dests.filter(d => typeof isSailingDestinationUnlocked === 'function' && isSailingDestinationUnlocked(d));
      const preferred = unlockedDests.find(d => d.targetZoneId !== state.zoneId) || unlockedDests[0];
      if (preferred && typeof sailToDestination === 'function') {
        sailToDestination(preferred.id);
      }
      return;
    }
  }

  if (state.isModalOpen) return;

  if (k === 'enter' || k === 'f') {
    triggerSensorAction('interact', 'KEY_INTERACT');
  } else if (k === ' ' || k === 'j') {
    triggerSensorAction('basic_attack', '1P_KEY_ATK');
  } else if (k === 'shift' || k === 'k') {
    triggerSensorAction('dodge', '1P_KEY_DODGE');
  } else if (k === 'q' || k === 'l') {
    triggerSensorAction('heavy_attack', '1P_KEY_HEAVY');
  } else if (k === 'e' || k === 'u') {
    triggerSensorAction('magic_skill', '1P_KEY_T0');
  } else if (k === 'r') {
    triggerSensorAction('special_skill', '1P_KEY_T3');
  }
  syncKeyboardJoystick();
});

window.addEventListener('keyup', (e) => {
  keysDown.delete(e.key.toLowerCase());
  syncKeyboardJoystick();
});

function syncKeyboardJoystick() {
  if (joyDragging) return;
  if (!isGameViewVisible() || state.isTalkingToNpc || state.isModalOpen) {
    state.sensor.joyX = 0;
    state.sensor.joyY = 0;
    joyKnob.style.transform = 'translate(0px, 0px)';
    return;
  }
  let kx = 0, ky = 0;
  if (keysDown.has('a') || keysDown.has('arrowleft')) kx -= 1;
  if (keysDown.has('d') || keysDown.has('arrowright')) kx += 1;
  if (keysDown.has('w') || keysDown.has('arrowup')) ky -= 1;
  if (keysDown.has('s') || keysDown.has('arrowdown')) ky += 1;
  const mag = Math.hypot(kx, ky);
  state.sensor.joyX = mag > 0 ? kx / mag : 0;
  state.sensor.joyY = mag > 0 ? ky / mag : 0;
  joyKnob.style.transform = `translate(${state.sensor.joyX * 22}px, ${state.sensor.joyY * 22}px)`;
}


window.onload = () => {
  try { saveSync.bootHadLocal = Boolean(localStorage.getItem(SLOTS_STORAGE_KEY) || localStorage.getItem(STORAGE_KEY)); } catch (e) {}
  const loaded = loadSavedProgressOnBoot();
  if (!loaded) {
    state.charSlots = [exportSavePayload(true)];
    state.activeSlotIdx = 0;
  }
  saveSync.initialSyncDone = true;
  setWsUi(false, '오프라인 1P');
  restoreCachedSaveDatasFolderOnBoot();
  updateLocalFileSyncBadge();
  renderSaveStatus();
  renderLogs();
  updateAllUI();
  requestAnimationFrame(mainLoop);
};


const inputNewCharNameEl = document.getElementById('inputNewCharName');
if (inputNewCharNameEl) {
  inputNewCharNameEl.addEventListener('input', () => {
    const chars = Array.from(inputNewCharNameEl.value);
    if (chars.length > 6) {
      inputNewCharNameEl.value = chars.slice(0, 6).join('');
    }
  });
}
