// ============================================================================
// [core/physicsAndLoop.js] 신비의 대륙 v2.0 — 물리 충돌, 세트/고유 효과, 에리크 & 세라피리아 보스 AI 루프
//  - 붉은 바이킹 전사 에리크 보스 AI (7초 주기 랜덤 패턴):
//    1) 3초간 도끼를 치켜들며 붉은 분노 이펙트 차징 후 플레이어에게 도끼 투사체 1발씩 총 3회 연속 발사
//    2) 5초간 발을 구르며 바닥에 붉은 돌진 궤적 인디케이터 표시 후 플레이어를 향해 초고속 돌진(접촉 시 큰 데미지)
//  - 해적들의 여왕 『해왕』 세라피리아 더 파이럿 보스 AI (7초 주기 랜덤 패턴, 페이즈 2 폭주 전환 연출 1회):
//    1) 5초간 투명화(피격 불가, 물보라 잔상 및 반투명 실루엣 연출)로 접근 후 근접 기습 + 맵 경계(Boundary) 내로 Clamp 텔레포트
//    2) 보스 주변 4개 유도 투사체 생성 후 3초간 천천히 유도 접근 (플레이어 공격 1회 적중 시 소멸 / 체력 30% 이하 시 동시에 돌진 1회)
//    3) 3초간 대기 후 플레이어를 향해 연속 3회 돌진 (접촉 시 큰 데미지)
// ============================================================================

// 포털 주변 통로는 열어두고 외곽 벽(나무 벽·실내 벽·암벽) 충돌 박스를 분할 생성하는 헬퍼
function addSegmentedHorizontalWall(list, y, h, portals, gapHalf = 62) {
  const nearPortals = (portals || [])
    .filter(pt => pt.y + pt.r + 28 >= y && pt.y - pt.r - 28 <= y + h)
    .sort((a, b) => a.x - b.x);
  let curX = 0;
  for (const pt of nearPortals) {
    const leftEnd = Math.max(0, pt.x - gapHalf);
    if (leftEnd > curX) {
      list.push({ x: curX, y, w: leftEnd - curX, h, kind: 'env_wall' });
    }
    curX = Math.max(curX, Math.min(900, pt.x + gapHalf));
  }
  if (curX < 900) {
    list.push({ x: curX, y, w: 900 - curX, h, kind: 'env_wall' });
  }
}

function addSegmentedVerticalWall(list, x, w, portals, gapHalf = 62) {
  const nearPortals = (portals || [])
    .filter(pt => pt.x + pt.r + 28 >= x && pt.x - pt.r - 28 <= x + w)
    .sort((a, b) => a.y - b.y);
  let curY = 0;
  for (const pt of nearPortals) {
    const topEnd = Math.max(0, pt.y - gapHalf);
    if (topEnd > curY) {
      list.push({ x, y: curY, w, h: topEnd - curY, kind: 'env_wall' });
    }
    curY = Math.max(curY, Math.min(600, pt.y + gapHalf));
  }
  if (curY < 600) {
    list.push({ x, y: curY, w, h: 600 - curY, kind: 'env_wall' });
  }
}

// 맵별 실내 벽, 해변가 깊은 물 속, 화단 경계, 숲 외곽 나무 벽 및 가구 충돌체를 통합 반환
function getZoneSolidColliders(z) {
  if (!z) return [];
  const colliders = Array.isArray(z.obstacles) ? [...z.obstacles] : [];
  const zid = z.id;
  const portals = z.portals || [];

  if (zid === 'home_interior' || zid === 'flower_villa') {
    // 실내(집 안 / 플라워 아일랜드 : 별장 안): 상단 웨인스코팅 벽면(0~118px) 및 좌·우·하단 실내 벽면 차단
    colliders.push({ x: 0, y: 0, w: 900, h: 118, kind: 'indoor_wall' });
    colliders.push({ x: 0, y: 566, w: 900, h: 34, kind: 'indoor_wall' });
    addSegmentedVerticalWall(colliders, 0, 28, portals, 64);
    addSegmentedVerticalWall(colliders, 872, 28, portals, 64);
  } else if (zid === 'oceanblue_town') {
    // 오션블루 타운: 상단 성벽/건물 외곽 및 하단 해변가의 깊은 바다(우측 부두 구역 제외) 진입 차단
    addSegmentedHorizontalWall(colliders, 0, 52, portals, 64);
    addSegmentedVerticalWall(colliders, 0, 30, portals, 64);
    addSegmentedVerticalWall(colliders, 870, 30, portals, 64);
    // 해변 남쪽 깊은 바닷물 (x: 0~672, y: 476~600)
    colliders.push({ x: 0, y: 476, w: 672, h: 124, kind: 'deep_water' });
    // 목조 부두 남단 아래 깊은 바닷물 (x: 672~900, y: 538~600)
    colliders.push({ x: 672, y: 538, w: 228, h: 62, kind: 'deep_water' });
    // 목조 부두 우측 범선 정박 수역 깊은 바닷물 (x: 772~900, y: 392~538)
    colliders.push({ x: 772, y: 392, w: 128, h: 146, kind: 'deep_water' });
  } else if (zid === 'coastal_road_1' || zid === 'coastal_road_2' || zid === 'coastal_road_3') {
    // 해변으로 향하는 길 1~3: 상단 해안 절벽/야자수 숲 경계 및 하단 해변 깊은 물 속(y >= 486) 진입 차단
    addSegmentedHorizontalWall(colliders, 0, 50, portals, 64);
    addSegmentedVerticalWall(colliders, 0, 30, portals, 64);
    addSegmentedVerticalWall(colliders, 870, 30, portals, 64);
    colliders.push({ x: 0, y: 486, w: 900, h: 114, kind: 'deep_water' });
  } else if (zid === 'flower_island_1' || zid === 'flower_island_2') {
    // 플라워 아일랜드 화단길 01~02: 상단 계단식 대형 화단(0~66px) 및 하단 계단식 화단·깊은 바다(442~600px) 진입 차단
    addSegmentedHorizontalWall(colliders, 0, 66, portals, 64);
    addSegmentedVerticalWall(colliders, 0, 30, portals, 64);
    addSegmentedVerticalWall(colliders, 870, 30, portals, 64);
    colliders.push({ x: 0, y: 442, w: 900, h: 158, kind: 'deep_water_and_flowerbed' });
  } else if (zid === 'minatomachi') {
    // 미나토마치 (일본풍 에도시대 항구 마을): 상단 담장 및 하단 해변 깊은 바다(우측 목조 부두 제외) 진입 차단
    addSegmentedHorizontalWall(colliders, 0, 52, portals, 64);
    addSegmentedVerticalWall(colliders, 0, 30, portals, 64);
    addSegmentedVerticalWall(colliders, 870, 30, portals, 64);
    // 방파제 남쪽 깊은 바닷물 (x: 0~648, y: 458~600)
    colliders.push({ x: 0, y: 458, w: 648, h: 142, kind: 'deep_water' });
    // 목조 부두 남단 아래 깊은 바닷물 (x: 648~900, y: 536~600)
    colliders.push({ x: 648, y: 536, w: 252, h: 64, kind: 'deep_water' });
    // 목조 부두 우측 범선 정박 수역 깊은 바닷물 (x: 766~900, y: 388~536)
    colliders.push({ x: 766, y: 388, w: 134, h: 148, kind: 'deep_water' });
  } else if (zid === 'pirate_ship_1' || zid === 'pirate_ship_2' || zid === 'pirate_queen_office' || zid === 'vs_pirate_queen') {
    // 해적의 대형 선박 내부 01~02 / 해적 여왕의 집무실 / vs 해적 여왕: 상·하단 선체 벽면(86px / 536px) 및 좌·우 격벽 차단
    addSegmentedHorizontalWall(colliders, 0, 86, portals, 64);
    addSegmentedHorizontalWall(colliders, 536, 64, portals, 64);
    addSegmentedVerticalWall(colliders, 0, 32, portals, 64);
    addSegmentedVerticalWall(colliders, 868, 32, portals, 64);
  } else if (zid === 'ragnar_room') {
    // 라그나르의 방: 상·하·좌·우 실내 암벽 차단
    addSegmentedHorizontalWall(colliders, 0, 78, portals, 64);
    addSegmentedHorizontalWall(colliders, 552, 48, portals, 64);
    addSegmentedVerticalWall(colliders, 0, 32, portals, 64);
    addSegmentedVerticalWall(colliders, 868, 32, portals, 64);
  } else {
    // 숲(집 앞, 포레스트 타운, 고블린/오크 숲), 동굴(비어 케이브), 해적 길목, 선박 내부: 외곽 나무 벽/암벽/선체 벽 차단
    addSegmentedHorizontalWall(colliders, 0, 54, portals, 64);
    addSegmentedHorizontalWall(colliders, 546, 54, portals, 64);
    addSegmentedVerticalWall(colliders, 0, 34, portals, 64);
    addSegmentedVerticalWall(colliders, 866, 34, portals, 64);
  }

  return colliders;
}

function collidesObstacle(x, y, r) {
  const z = state.zones[state.zoneId];
  if (!z) return false;
  const colliders = getZoneSolidColliders(z);
  for (const ob of colliders) {
    const cx = Math.max(ob.x, Math.min(x, ob.x + ob.w));
    const cy = Math.max(ob.y, Math.min(y, ob.y + ob.h));
    if (Math.hypot(x - cx, y - cy) < r) return true;
  }
  return false;
}

function resolveObstacleOverlap(entity) {
  const z = state.zones[state.zoneId];
  if (!z) return;
  const colliders = getZoneSolidColliders(z);
  for (const ob of colliders) {
    const cx = Math.max(ob.x, Math.min(entity.x, ob.x + ob.w));
    const cy = Math.max(ob.y, Math.min(entity.y, ob.y + ob.h));
    const dx = entity.x - cx;
    const dy = entity.y - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < entity.r) {
      if (dist < 0.01) {
        entity.y = ob.y - entity.r - 2;
      } else {
        const push = (entity.r - dist) + 1.5;
        entity.x += (dx / dist) * push;
        entity.y += (dy / dist) * push;
      }
    }
  }
}

function isRangedMonsterKind(kind) {
  return [
    'elite_mage', 'goblin_archer', 'goblin_shaman', 'orc_shaman',
    'pirate_gunner', 'pirate_bomber', 'viking_thrower', 'viking_runepriest',
    'black_robe_warlock', 'black_robe_marksman',
    'elite_pirate_sharpshooter', 'elite_pirate_cannoneer'
  ].includes(kind);
}

function isHeavyMonsterKind(kind) {
  return [
    'goblin_brute', 'orc_juggernaut',
    'pirate_brawler', 'viking_shieldbearer', 'viking_berserker',
    'black_robe_enforcer', 'elite_pirate_boatswain', 'elite_pirate_royalguard'
  ].includes(kind);
}

// 플레이어에게 보스/몬스터 피해를 적용하는 공통 함수 (무적, 수상한 펜던트, 바이킹 3세트 슈퍼 아머 반영)
function applyEnemyDamageToPlayer(rawAtk, monsterName, monsterLv, isBoss, customLogLabel = null) {
  const p = state.player;
  const derived = getDerivedStats();
  if (p.invulnTimer > 0) {
    if (p.dodgeTimer > 0) {
      addLog(`✨ [자이로 무적 회피 성공!] ${monsterName}의 공격을 완벽히 흘려보냈습니다!`);
    }
    return;
  }
  if (!isBoss && typeof trySuspiciousPendantEvade === 'function' && trySuspiciousPendantEvade(monsterLv, false)) {
    return;
  }
  const minDmgFloor = Math.max(1, Math.round(rawAtk * 0.18));
  const dmg = Math.max(minDmgFloor, Math.round(rawAtk) - derived.def);
  p.hp = Math.max(0, p.hp - dmg);
  // ★ 몬스터에게 피격 시 3초 동안 무적 시간 부여
  p.invulnTimer = 3.0;
  const hasSuperArmor = Boolean(derived.viking3Set && p.attackMotionTimer > 0);
  p.hitFlash = hasSuperArmor ? 0.08 : 0.22;
  if (!hasSuperArmor) {
    state.screenShake = isBoss ? 14 : 9;
  }
  updateRealtimeTelemetryUI();
  spawnParticles(p.x, p.y, isBoss ? 26 : 18, ['#f43f5e', '#fde047', '#ffffff'], 200, 5, 0.45);
  state.effects.push({
    kind: 'dmg_text',
    x: p.x,
    y: p.y - 24,
    text: hasSuperArmor ? `🛡️슈퍼아머 -${dmg}` : `❗-${dmg}`,
    color: hasSuperArmor ? '#fbbf24' : '#f43f5e',
    ttl: 0.65
  });
  addLog(customLogLabel || `❗ [피격] Lv.${monsterLv} ${monsterName}의 공격에 ${dmg} 피해를 입었습니다.${hasSuperArmor ? ' (바이킹 3세트 슈퍼 아머로 경직 무시!)' : ''}`);
  if (p.hp <= 0) {
    triggerPlayerDeath();
  }
}

// 보스 돌진 목표 방향 설정 헬퍼 (맵 이동 가능 경계 내부로 Clamp)
function lockBossDashTarget(m, targetX, targetY) {
  const clampedTx = Math.max(48, Math.min(852, targetX));
  const clampedTy = Math.max(48, Math.min(552, targetY));
  const dx = clampedTx - m.x;
  const dy = clampedTy - m.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  m.dashDirX = dx / len;
  m.dashDirY = dy / len;
  m.dashTx = Math.max(48, Math.min(852, m.x + m.dashDirX * Math.min(440, len + 95)));
  m.dashTy = Math.max(48, Math.min(552, m.y + m.dashDirY * Math.min(440, len + 95)));
}

// ============================================================================
// [보스 전용 AI 1] 붉은 바이킹 전사 에리크 (Lv.19, 7초마다 랜덤 패턴 발동)
// ============================================================================
function stepErikBossAI(m, p, worldDt) {
  const dist = Math.hypot(p.x - m.x, p.y - m.y);
  const curSpd = m.spd * (m.enraged ? 1.25 : 1.0);
  if (m.patternCd == null) m.patternCd = 4.5;

  if (m.state === 'IDLE') {
    m.animPhase += worldDt * 3.0;
    if (dist < 620) m.state = 'CHASE';
    return false;
  }

  if (m.state === 'CHASE') {
    m.animPhase += worldDt * 5.6;
    m.patternCd -= worldDt;

    // 7초마다 2가지 특수 패턴 중 하나를 랜덤 발동
    if (m.patternCd <= 0) {
      m.patternCd = 7.0;
      const pickAxeThrow = Math.random() < 0.5;
      if (pickAxeThrow) {
        // 패턴 1: 3초 동안 도끼를 머리 위로 치켜들며 붉은 분노 이펙트 차징 후 도끼 투사체 1발씩 총 3번 발사
        m.state = 'ERIK_CHARGE_AXE';
        m.timer = 3.0;
        m.axesLeft = 3;
        m.axeShotTimer = 0;
        spawnParticles(m.x, m.y, 28, ['#ef4444', '#f97316', '#fde047'], 210, 5, 0.55);
        addLog('🪓 [에리크 분노 차징!] 에리크가 도끼를 머리 위로 치켜들며 붉은 분노 기운을 모읍니다! (3초 후 도끼 3연속 투척)');
      } else {
        // 패턴 2: 5초 동안 발을 구르며 바닥에 붉은 돌진 궤적 인디케이터 표시 후 맹돌진
        m.state = 'ERIK_CHARGE_DASH';
        m.timer = 5.0;
        lockBossDashTarget(m, p.x, p.y);
        state.screenShake = 8;
        spawnParticles(m.x, m.y, 32, ['#ef4444', '#fbbf24', '#ffffff'], 220, 5, 0.6);
        addLog('💢 [에리크 대지 구르기!] 에리크가 발을 구르며 바닥에 붉은 돌진 궤적을 조준합니다! (5초 후 초고속 돌진)');
      }
      return false;
    }

    // 평상시 플레이어 추격 및 근접 도끼 베기
    if (dist <= 95) {
      m.state = 'TELEGRAPH';
      m.timer = 0.65;
      m.tx = p.x;
      m.ty = p.y;
    } else {
      const dirX = (p.x - m.x) / Math.max(1, dist);
      const dirY = (p.y - m.y) / Math.max(1, dist);
      m.x = Math.max(40, Math.min(860, m.x + dirX * curSpd * worldDt));
      m.y = Math.max(40, Math.min(560, m.y + dirY * curSpd * worldDt));
    }
    return false;
  }

  // [에리크 패턴 1-A] 3초간 도끼 치켜들기 & 붉은 분노 오라 차징
  if (m.state === 'ERIK_CHARGE_AXE') {
    m.animPhase += worldDt * 9.0;
    m.timer -= worldDt;
    if (Math.random() < 0.45) {
      spawnParticles(m.x, m.y - 18, 2, ['#ef4444', '#fbbf24'], 120, 4, 0.35);
    }
    if (m.timer <= 0) {
      m.state = 'ERIK_FIRE_AXE';
      m.axesLeft = 3;
      m.axeShotTimer = 0;
    }
    return false;
  }

  // [에리크 패턴 1-B] 플레이어를 향해 도끼 투사체 1발씩 총 3번 순차 발사
  if (m.state === 'ERIK_FIRE_AXE') {
    m.axeShotTimer -= worldDt;
    if (m.axeShotTimer <= 0 && m.axesLeft > 0) {
      const ang = Math.atan2(p.y - m.y, p.x - m.x);
      const axeSpd = 395;
      state.projectiles.push({
        x: m.x + Math.cos(ang) * 24,
        y: m.y + Math.sin(ang) * 24,
        vx: Math.cos(ang) * axeSpd,
        vy: Math.sin(ang) * axeSpd,
        r: 13,
        dmg: Math.round(m.atk * 1.25),
        color: '#ef4444',
        ttl: 2.3,
        isEnemy: true,
        kind: 'erik_axe',
        sourceLv: m.lv,
        sourceIsBoss: true
      });
      soundFX.play('slash3');
      spawnParticles(m.x, m.y, 14, ['#ef4444', '#fde047', '#ffffff'], 180, 4, 0.35);
      m.axesLeft -= 1;
      m.axeShotTimer = 0.38;
      addLog(`🪓 [에리크 도끼 투척!] 회전하는 붉은 전투도끼가 날아옵니다! (${3 - m.axesLeft}/3발)`);
    }
    if (m.axesLeft <= 0 && m.axeShotTimer <= 0) {
      m.state = 'VULNERABLE';
      m.timer = 1.8;
    }
    return false;
  }

  // [에리크 패턴 2-A] 5초간 발을 구르며 바닥에 붉은 돌진 궤적 인디케이터 표시
  if (m.state === 'ERIK_CHARGE_DASH') {
    m.animPhase += worldDt * 11.0;
    m.timer -= worldDt;
    // 처음 4.1초 동안은 플레이어 위치를 따라 조준하고, 마지막 0.9초는 궤적을 고정하여 회피 여지 제공
    if (m.timer > 0.9) {
      lockBossDashTarget(m, p.x, p.y);
    }
    if (Math.random() < 0.4) {
      spawnParticles(m.x, m.y + 20, 2, ['#ef4444', '#f97316'], 110, 4, 0.3);
    }
    if (m.timer <= 0) {
      m.state = 'ERIK_DASHING';
      m.timer = 0.52;
      m.dashHit = false;
      soundFX.play('heavy');
      state.screenShake = 12;
      addLog('💥 [에리크 분노의 돌진!!] 에리크가 붉은 궤적을 따라 맹렬하게 돌진합니다!');
    }
    return false;
  }

  // [에리크 패턴 2-B] 궤적을 따라 초고속 돌진 (접촉 시 큰 데미지)
  if (m.state === 'ERIK_DASHING') {
    m.timer -= worldDt;
    const dashSpeed = 760;
    m.x = Math.max(44, Math.min(856, m.x + (m.dashDirX || 1) * dashSpeed * worldDt));
    m.y = Math.max(44, Math.min(556, m.y + (m.dashDirY || 0) * dashSpeed * worldDt));
    resolveObstacleOverlap(m);
    spawnParticles(m.x, m.y, 3, ['#ef4444', '#fde047'], 150, 4, 0.25);

    if (!m.dashHit && Math.hypot(p.x - m.x, p.y - m.y) <= m.r + p.r + 14) {
      m.dashHit = true;
      applyEnemyDamageToPlayer(
        Math.round(m.atk * 1.85),
        m.name,
        m.lv,
        true,
        `💥 [에리크 돌진 직격!] ${m.name}의 분노 돌진에 부딪혀 큰 피해를 입었습니다!`
      );
    }
    if (m.timer <= 0) {
      m.state = 'VULNERABLE';
      m.timer = 2.0;
    }
    return false;
  }

  // 기본 근접 예고 및 타격
  if (m.state === 'TELEGRAPH') {
    m.timer -= worldDt;
    if (m.timer <= 0) {
      m.state = 'ATTACK';
      m.timer = 0.28;
      state.effects.push({ kind: 'enemy_aoe', x: m.x, y: m.y, r: 120, ttl: 0.30, maxTtl: 0.30 });
      if (Math.hypot(p.x - m.x, p.y - m.y) <= 120 + p.r) {
        applyEnemyDamageToPlayer(m.atk, m.name, m.lv, true);
      }
    }
    return false;
  }

  if (m.state === 'ATTACK') {
    m.timer -= worldDt;
    if (m.timer <= 0) m.state = 'CHASE';
    return false;
  }

  if (m.state === 'VULNERABLE') {
    m.timer -= worldDt;
    if (m.timer <= 0) m.state = 'CHASE';
    return true;
  }

  return false;
}

// ============================================================================
// [보스 전용 AI 2] 해적들의 여왕 『해왕』 세라피리아 더 파이럿 (Lv.27, 7초마다 랜덤 패턴 발동)
// ============================================================================
function clampInsideMapBoundary(x, y, margin = 52) {
  return {
    x: Math.max(margin, Math.min(900 - margin, x)),
    y: Math.max(margin, Math.min(600 - margin, y))
  };
}


// 세라피리아 유도탄 1발 발사 헬퍼 (2초에 1발씩 최대 4발 순차 발사, 이속 1.1배 = 145.2, 플레이어 공격으로 소멸되지 않음)
function fireSingleSeraphHomingOrb(m, p, shotIdx) {
  const baseAng = Math.atan2(p.y - m.y, p.x - m.x);
  const offsetAng = ((shotIdx - 1) - 1.5) * 0.24;
  const ang = baseAng + offsetAng;
  const ox = Math.max(40, Math.min(860, m.x + Math.cos(ang) * 48));
  const oy = Math.max(40, Math.min(560, m.y + Math.sin(ang) * 48));
  const orbSpd = 145.2; // 기존 132 대비 1.1배 속도

  state.projectiles.push({
    x: ox,
    y: oy,
    vx: Math.cos(ang) * orbSpd,
    vy: Math.sin(ang) * orbSpd,
    r: 12,
    dmg: Math.round(m.atk * 1.12),
    color: '#ec4899',
    ttl: 3.0,
    isEnemy: true,
    homingSpeed: orbSpd,
    destroyableByAttack: false,
    kind: 'seraph_homing_orb',
    sourceLv: m.lv,
    sourceIsBoss: true
  });
  soundFX.play('magic');
  spawnParticles(ox, oy, 18, ['#ec4899', '#38bdf8', '#ffffff'], 180, 4, 0.45);
  addLog(`🔮 [세라피리아 유도 수구 발사 (${shotIdx}/4)!] 세라피리아가 플레이어를 유도 추적하는 심해 유도탄을 발사했습니다!`);
}

function stepSeraphiriaBossAI(m, p, worldDt) {
  const dist = Math.hypot(p.x - m.x, p.y - m.y);
  if (m.patternCd == null) m.patternCd = 4.5;

  // 레거시 상태 호환: 과거 SERAPH_STEALTH 상태로 저장된 경우 CHASE + stealthTimer로 전환
  if (m.state === 'SERAPH_STEALTH') {
    m.state = 'CHASE';
    if (!m.stealthTimer || m.stealthTimer <= 0) {
      m.stealthTimer = m.timer && m.timer > 0 ? m.timer : 16.0;
      m.stealthTpTimer = 4.0;
    }
  }

  // 체력 50% 이하 도달 시 페이즈 2 폭주 전환 연출 1회 재생
  if (!m.phase2TransitionDone && m.hp > 0 && (m.hp / m.maxHp) <= 0.50) {
    m.phase2TransitionDone = true;
    m.enraged = true;
    state.screenShake = 22;
    state.effects.push({ kind: 'seraphiria_phase2_burst', x: m.x, y: m.y, r: 220, ttl: 1.2, maxTtl: 1.2 });
    spawnParticles(m.x, m.y, 65, ['#ec4899', '#38bdf8', '#a855f7', '#ffffff'], 340, 7, 0.9);
    addLog('🌊 [페이즈 2 전환 연출!] 『해왕』 세라피리아가 심해의 폭주 기운을 방출하며 2페이즈에 돌입합니다!');
  }

  if (m.state === 'IDLE') {
    m.animPhase += worldDt * 3.2;
    if (dist < 650) m.state = 'CHASE';
    return false;
  }

  // ==========================================================================
  // [세라피리아 은신 버프 타이머]
  // - 16초간 투명화 유지 (피격 불가 + 이동속도 1.2배)
  // - 은신 중 4초마다 플레이어 주변(맵 이동 가능 영역 Clamp)으로 텔레포트
  // - 은신 중 플레이어와 근접 시 은신을 풀지 않고 평소처럼 기본 근접 공격 수행
  // ==========================================================================
  if ((m.stealthTimer || 0) > 0) {
    m.stealthed = true;
    m.stealthTimer -= worldDt;
    m.stealthTpTimer = (m.stealthTpTimer ?? 4.0) - worldDt;
    m.rippleTick = (m.rippleTick ?? 0) - worldDt;

    if (m.rippleTick <= 0) {
      m.rippleTick = 0.22;
      state.effects.push({ kind: 'water_ripple', x: m.x, y: m.y + 18, r: 28, ttl: 0.48, maxTtl: 0.48 });
      spawnParticles(m.x, m.y + 14, 3, ['#38bdf8', '#e0f2fe'], 70, 3, 0.3);
    }

    // 은신 유지 중 정확히 4초마다 플레이어 주변으로 순간이동
    if (m.stealthTpTimer <= 0 && m.stealthTimer > 0.15) {
      m.stealthTpTimer = 4.0;
      state.effects.push({ kind: 'water_ripple', x: m.x, y: m.y, r: 38, ttl: 0.45, maxTtl: 0.45 });

      const tpAngle = Math.random() * Math.PI * 2;
      const tpDist = 78 + Math.random() * 26;
      const clamped = clampInsideMapBoundary(
        p.x + Math.cos(tpAngle) * tpDist,
        p.y + Math.sin(tpAngle) * tpDist,
        52
      );
      m.x = clamped.x;
      m.y = clamped.y;
      resolveObstacleOverlap(m);
      const afterClamp = clampInsideMapBoundary(m.x, m.y, 48);
      m.x = afterClamp.x;
      m.y = afterClamp.y;

      soundFX.play('dodge');
      state.effects.push({ kind: 'water_ripple', x: m.x, y: m.y, r: 44, ttl: 0.55, maxTtl: 0.55 });
      spawnParticles(m.x, m.y, 24, ['#38bdf8', '#a855f7', '#e0f2fe'], 195, 5, 0.45);
      addLog(`🌀 [세라피리아 은신 텔레포트!] 투명화 중인 세라피리아가 4초 주기로 플레이어 주변에 순간이동했습니다! (남은 은신: ${Math.ceil(m.stealthTimer)}초)`);
    }

    if (m.stealthTimer <= 0) {
      m.stealthTimer = 0;
      m.stealthed = false;
      state.effects.push({ kind: 'water_ripple', x: m.x, y: m.y, r: 46, ttl: 0.55, maxTtl: 0.55 });
      spawnParticles(m.x, m.y, 26, ['#38bdf8', '#ec4899', '#ffffff'], 210, 5, 0.45);
      addLog('🌫️ [세라피리아 은신 종료!] 16초가 경과하여 세라피리아의 투명화가 해제되었습니다!');
    }
  } else {
    m.stealthed = false;
  }

  // ==========================================================================
  // [세라피리아 유도탄 순차 발사 타이머]
  // - 유도탄 패턴 발동 시 한꺼번에 4발을 쏘지 않고, 2초에 1발씩 최대 4발을 순차 발사
  // ==========================================================================
  if ((m.homingShotsLeft || 0) > 0) {
    m.homingShotTimer = (m.homingShotTimer ?? 0) - worldDt;
    if (m.homingShotTimer <= 0) {
      const shotIdx = 5 - m.homingShotsLeft;
      fireSingleSeraphHomingOrb(m, p, shotIdx);
      m.homingShotsLeft -= 1;
      m.homingShotTimer = m.homingShotsLeft > 0 ? 2.0 : 0;
    }
  }

  const curDist = Math.hypot(p.x - m.x, p.y - m.y);
  const curSpd = m.spd * (m.enraged ? 1.28 : 1.0) * (m.stealthed ? 1.2 : 1.0);

  if (m.state === 'CHASE') {
    m.animPhase += worldDt * (m.stealthed ? 7.6 : 6.0);

    // 은신 중이거나 유도탄 순차 발사 중이 아닐 때만 다음 특수 패턴 쿨타임 차감
    if (!m.stealthed && !(m.homingShotsLeft > 0)) {
      m.patternCd -= worldDt;
    }

    if (!m.stealthed && !(m.homingShotsLeft > 0) && m.patternCd <= 0) {
      m.patternCd = 7.0;
      const roll = Math.random();
      if (roll < 0.34) {
        // 패턴 1: 16초간 투명화 은신 (이동속도 1.2배 · 4초마다 플레이어 주변 텔레포트 · 근접 시 평소처럼 일반 공격)
        m.stealthed = true;
        m.stealthTimer = 16.0;
        m.stealthTpTimer = 4.0;
        m.rippleTick = 0;
        m.patternCd = 7.0;
        spawnParticles(m.x, m.y, 28, ['#38bdf8', '#a855f7', '#e0f2fe'], 200, 5, 0.5);
        addLog('🌫️ [세라피리아 안개 은신!] 세라피리아가 16초간 투명화(이속 1.2배 · 피격 불가) 상태로 전환합니다! (은신 중 4초마다 텔레포트하며 근접 시 평소처럼 공격)');
      } else if (roll < 0.67) {
        // 패턴 2: 유도탄을 2초에 1발씩 최대 4발 순차 발사 (이속 1.1배 · 공격으로 파괴 불가)
        m.homingShotsLeft = 4;
        m.homingShotTimer = 0; // 즉시 1발 발사 후, 2초 간격으로 2·3·4발째 발사
        m.patternCd = 7.0;

        if ((m.hp / m.maxHp) <= 0.30) {
          lockBossDashTarget(m, p.x, p.y);
          m.state = 'SERAPH_CHARGE_DASH';
          m.dashesTotal = 1;
          m.dashesLeft = 1;
          m.timer = 1.5;
          m.dashHit = false;
          addLog('🌊 [해왕의 유도탄 + 광폭 돌진!] 체력이 30% 이하인 세라피리아가 유도탄 발사와 함께 돌진을 준비합니다!');
        } else {
          addLog('🔮 [세라피리아 유도 수구 패턴 개시!] 세라피리아가 2초에 1발씩(최대 4발) 심해 유도탄을 발사합니다!');
        }
        return false;
      } else {
        // 패턴 3: 1.5초 대기 후 돌진 (총 3회 반복)
        m.state = 'SERAPH_CHARGE_DASH';
        m.timer = 1.5;
        m.dashesTotal = 3;
        m.dashesLeft = 3;
        lockBossDashTarget(m, p.x, p.y);
        spawnParticles(m.x, m.y, 30, ['#ec4899', '#f43f5e', '#fde047'], 220, 5, 0.55);
        addLog('⚡ [세라피리아 해왕 돌진 준비!] 세라피리아가 해왕의 검을 겨누며 돌진 궤적을 조준합니다!');
        return false;
      }
    }

    // 평상시 및 은신 중 플레이어와 근접(105px 이내)하면 평소처럼 근접 공격(TELEGRAPH -> ATTACK) 수행
    if (curDist <= 105) {
      m.state = 'TELEGRAPH';
      m.timer = 0.60;
      m.tx = p.x;
      m.ty = p.y;
    } else {
      const dirX = (p.x - m.x) / Math.max(1, curDist);
      const dirY = (p.y - m.y) / Math.max(1, curDist);
      m.x = Math.max(48, Math.min(852, m.x + dirX * curSpd * worldDt));
      m.y = Math.max(48, Math.min(552, m.y + dirY * curSpd * worldDt));
      resolveObstacleOverlap(m);
    }
    return false;
  }

  // [세라피리아 패턴 3-A] 1.5초간 돌진 궤적 조준
  if (m.state === 'SERAPH_CHARGE_DASH') {
    m.animPhase += worldDt * 10.0;
    m.timer -= worldDt;
    if (m.timer > 0.45) {
      lockBossDashTarget(m, p.x, p.y);
    }
    if (Math.random() < 0.45) {
      spawnParticles(m.x, m.y, 2, ['#ec4899', '#38bdf8'], 130, 4, 0.3);
    }
    if (m.timer <= 0) {
      const totalDashes = m.dashesTotal || 3;
      const curDashIdx = totalDashes - (m.dashesLeft || 1) + 1;
      m.state = 'SERAPH_TRIPLE_DASHING';
      m.timer = 0.42;
      m.dashHit = false;
      soundFX.play('heavy');
      state.screenShake = 12;
      addLog(`⚡ [세라피리아 해왕 돌진 (${curDashIdx}/${totalDashes})!] 세라피리아가 검광과 함께 돌진합니다!`);
    }
    return false;
  }

  // [세라피리아 패턴 3-B] 1회 돌진 수행 후, 남은 횟수가 있으면 다시 1.5초 조준(SERAPH_CHARGE_DASH)으로 전환 (총 3번)
  if (m.state === 'SERAPH_TRIPLE_DASHING') {
    m.timer -= worldDt;
    const dashSpeed = 810;
    const nextPos = clampInsideMapBoundary(
      m.x + (m.dashDirX || 1) * dashSpeed * worldDt,
      m.y + (m.dashDirY || 0) * dashSpeed * worldDt,
      48
    );
    m.x = nextPos.x;
    m.y = nextPos.y;
    resolveObstacleOverlap(m);
    spawnParticles(m.x, m.y, 3, ['#ec4899', '#38bdf8', '#ffffff'], 160, 4, 0.25);

    if (!m.dashHit && Math.hypot(p.x - m.x, p.y - m.y) <= m.r + p.r + 14) {
      m.dashHit = true;
      applyEnemyDamageToPlayer(
        Math.round(m.atk * 1.75),
        m.name,
        m.lv,
        true,
        `💥 [세라피리아 해왕 돌진 피격!] 세라피리아의 초고속 돌진에 휩쓸려 큰 피해를 입었습니다!`
      );
    }

    if (m.timer <= 0) {
      m.dashesLeft = (m.dashesLeft || 1) - 1;
      if (m.dashesLeft > 0) {
        m.state = 'SERAPH_CHARGE_DASH';
        m.timer = 1.5;
        lockBossDashTarget(m, p.x, p.y);
        spawnParticles(m.x, m.y, 20, ['#ec4899', '#f43f5e', '#fde047'], 180, 4, 0.45);
      } else {
        m.state = 'VULNERABLE';
        m.timer = 2.1;
      }
    }
    return false;
  }

  // 기본 근접 예고 및 타격 (평상시 및 은신 중 동일하게 작동, 은신 중에도 투명화 유지!)
  if (m.state === 'TELEGRAPH') {
    m.timer -= worldDt;
    if (m.timer <= 0) {
      m.state = 'ATTACK';
      m.timer = 0.28;
      soundFX.play('slash2');
      state.effects.push({ kind: 'enemy_aoe', x: m.x, y: m.y, r: 125, ttl: 0.30, maxTtl: 0.30 });
      if (Math.hypot(p.x - m.x, p.y - m.y) <= 125 + p.r) {
        applyEnemyDamageToPlayer(
          m.atk,
          m.name,
          m.lv,
          true,
          m.stealthed
            ? `⚔️ [은신 근접 베기!] 은신 중인 세라피리아가 근접 거리에서 해왕의 검을 휘둘렀습니다!`
            : null
        );
      }
    }
    return false;
  }

  if (m.state === 'ATTACK') {
    m.timer -= worldDt;
    if (m.timer <= 0) m.state = 'CHASE';
    return false;
  }

  if (m.state === 'VULNERABLE') {
    m.timer -= worldDt;
    if (m.timer <= 0) m.state = 'CHASE';
    return true;
  }

  return false;
}

// ============================================================================
// 메인 시뮬레이션 루프
// ============================================================================
function stepSimulation(rawDt) {
  if (!isGameViewVisible() || state.gameOver || state.isTalkingToNpc || state.isModalOpen) return;

  if (state.hitStopTimer > 0) {
    state.hitStopTimer = Math.max(0, state.hitStopTimer - rawDt);
    return;
  }

  let worldDt = rawDt;
  if (state.bulletTimeTimer > 0) {
    state.bulletTimeTimer = Math.max(0, state.bulletTimeTimer - rawDt);
    worldDt = rawDt * 0.38;
  }

  const p = state.player;
  const derived = getDerivedStats();

  if (state.screenShake > 0) state.screenShake = Math.max(0, state.screenShake - rawDt * 38);
  if (p.comboTimer > 0) p.comboTimer = Math.max(0, p.comboTimer - rawDt);
  if (p.pirateSetCdTimer > 0) p.pirateSetCdTimer = Math.max(0, p.pirateSetCdTimer - rawDt);
  if (p.attackMotionTimer > 0) p.attackMotionTimer = Math.max(0, p.attackMotionTimer - rawDt);
  if (p.hitComboDecay > 0) {
    p.hitComboDecay = Math.max(0, p.hitComboDecay - rawDt);
    if (p.hitComboDecay === 0) p.hitCount = 0;
  }

  for (const k of Object.keys(state.cooldownLeft)) {
    if (state.cooldownLeft[k] > 0) {
      state.cooldownLeft[k] = Math.max(0, state.cooldownLeft[k] - rawDt);
    }
  }

  if (p.dodgeTimer > 0) {
    p.dodgeTimer = Math.max(0, p.dodgeTimer - rawDt);
    p.afterimages.push({ x: p.x, y: p.y, ttl: 0.22 });
  }
  p.afterimages = p.afterimages.filter(a => {
    a.ttl -= rawDt;
    return a.ttl > 0;
  });

  if (p.invulnTimer > 0) p.invulnTimer = Math.max(0, p.invulnTimer - rawDt);
  if (p.hitFlash > 0) p.hitFlash = Math.max(0, p.hitFlash - rawDt);

  // 안전지대(마을/집 안/별장 안 등)에서만 자동 회복되며, 사냥존 내에서는 마나 자동회복이 일어나지 않음
  const curZoneObj = state.zones[state.zoneId];
  if (curZoneObj && curZoneObj.isSafeZone) {
    p.hp = Math.min(derived.maxHp, p.hp + 32 * rawDt);
    p.mp = Math.min(derived.maxMp, p.mp + 22 * rawDt);
  }

  state.sensor.gyroDeg = Math.max(0, state.sensor.gyroDeg - 320 * rawDt);
  state.sensor.accelG = Math.max(1.0, state.sensor.accelG - 2.6 * rawDt);
  state.sensor.pitch *= 0.88;
  state.sensor.roll *= 0.88;

  const useExt = state.sensor.joyX === 0 && state.sensor.joyY === 0;
  const jx = useExt ? state.sensor.extJoyX : state.sensor.joyX;
  const jy = useExt ? state.sensor.extJoyY : state.sensor.joyY;
  const mag = Math.hypot(jx, jy);
  if (mag >= 0.14) {
    const normX = jx / mag;
    const normY = jy / mag;
    p.fx = normX;
    p.fy = normY;
    const dashBoost = p.dodgeTimer > 0 ? 2.55 : 1.0;
    const nx = Math.max(26, Math.min(874, p.x + normX * derived.spd * dashBoost * Math.min(1, mag) * rawDt));
    const ny = Math.max(26, Math.min(574, p.y + normY * derived.spd * dashBoost * Math.min(1, mag) * rawDt));
    if (!collidesObstacle(nx, p.y, p.r)) p.x = nx;
    if (!collidesObstacle(p.x, ny, p.r)) p.y = ny;
    p.animTick += rawDt * 7.5;
  }
  resolveObstacleOverlap(p);

  const z = state.zones[state.zoneId];
  const nearInteractable =
    z.portals.some(pt => Math.hypot(p.x - pt.x, p.y - pt.y) <= pt.r + 45) ||
    z.chests.some(ch => !ch.opened && Math.hypot(p.x - ch.x, p.y - ch.y) <= 60) ||
    z.npcs.some(np => !(np.hideAfterQuestCompleted && getQuestState(np.hideAfterQuestCompleted).status === 'completed') && Math.hypot(p.x - np.x, p.y - np.y) <= 68);
  const hintBanner = document.getElementById('portalHintBanner');
  if (nearInteractable && !state.isTalkingToNpc) hintBanner.classList.remove('hidden');
  else hintBanner.classList.add('hidden');

  // 플레이어 투사체가 파괴 가능한 적 유도탄(세라피리아 유도탄)과 충돌하면 둘 다 소멸 처리
  const destroyedEnemyOrbs = new Set();
  state.projectiles.forEach(pProj => {
    if (!pProj.isEnemy) {
      state.projectiles.forEach(eProj => {
        if (eProj.isEnemy && eProj.destroyableByAttack && !destroyedEnemyOrbs.has(eProj)) {
          if (Math.hypot(pProj.x - eProj.x, pProj.y - eProj.y) <= pProj.r + eProj.r + 4) {
            destroyedEnemyOrbs.add(eProj);
            pProj.ttl = -1;
            spawnParticles(eProj.x, eProj.y, 12, ['#38bdf8', '#ec4899', '#ffffff'], 150, 4, 0.3);
            state.effects.push({ kind: 'dmg_text', x: eProj.x, y: eProj.y - 12, text: '💥유도탄 상쇄!', color: '#38bdf8', ttl: 0.45 });
          }
        }
      });
    }
  });

  state.projectiles = state.projectiles.filter(proj => {
    if (destroyedEnemyOrbs.has(proj) || proj.ttl <= 0) return false;
    const dt = proj.isEnemy ? worldDt : rawDt;

    if (proj.isEnemy && proj.homingSpeed) {
      const angToPlayer = Math.atan2(p.y - proj.y, p.x - proj.x);
      proj.vx = Math.cos(angToPlayer) * proj.homingSpeed;
      proj.vy = Math.sin(angToPlayer) * proj.homingSpeed;
    }

    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;
    proj.ttl -= dt;

    if (Math.random() < 0.5) {
      state.particles.push({
        x: proj.x, y: proj.y,
        vx: (Math.random() - 0.5) * 28, vy: (Math.random() - 0.5) * 28,
        size: 3, color: proj.color || '#fbbf24', ttl: 0.15, maxTtl: 0.15
      });
    }

    if (proj.isEnemy) {
      if (Math.hypot(p.x - proj.x, p.y - proj.y) <= proj.r + p.r) {
        applyEnemyDamageToPlayer(proj.dmg, proj.kind === 'erik_axe' ? '에리크의 투척 도끼' : '적 탄환', proj.sourceLv || 1, Boolean(proj.sourceIsBoss));
        return false;
      }
    } else {
      for (const m of state.monsters) {
        if (m.zone === state.zoneId && m.alive && !m.stealthed) {
          if (Math.hypot(m.x - proj.x, m.y - proj.y) <= proj.r + m.r) {
            const mDef = Number(m.def || 0);
            const actualProjDmg = Math.max(Math.round(proj.dmg * 0.22), Math.round(proj.dmg - mDef * 0.85));
            m.hp = Math.max(0, m.hp - actualProjDmg);
            m.flash = 0.16;
            p.hitCount += 1;
            p.hitComboDecay = 3.0;
            const hitColors = proj.kind === 'wave_shard' || proj.kind === 'pirate_ring'
              ? ['#0ea5e9', '#38bdf8', '#e0f2fe']
              : ['#f97316', '#fde047', '#ffffff'];
            spawnParticles(m.x, m.y, 16, hitColors, 180, 5, 0.4);
            state.effects.push({
              kind: 'dmg_text',
              x: m.x,
              y: m.y - 20,
              text: proj.kind === 'wave_shard' ? `🌊-${actualProjDmg}` : (proj.kind === 'pirate_ring' ? `🏴‍☠️-${actualProjDmg}` : `🔥-${actualProjDmg}`),
              color: proj.kind === 'wave_shard' || proj.kind === 'pirate_ring' ? '#38bdf8' : '#fb923c',
              ttl: 0.55
            });
            if (proj.kind !== 'pirate_ring' && typeof tryTriggerPirateSetBurst === 'function') {
              tryTriggerPirateSetBurst(derived);
            }
            if (m.hp <= 0) onMonsterDefeated(m);
            return false;
          }
        }
      }
    }
    return proj.ttl > 0 && proj.x > 0 && proj.x < 900 && proj.y > 0 && proj.y < 600;
  });

  let bossVulnerableActive = false;
  const zoneMonsters = state.monsters.filter(m => m.zone === state.zoneId);

  for (const m of zoneMonsters) {
    if (!m.alive) {
      m.timer -= worldDt;
      if (m.timer <= 0 && !m.isBoss) {
        m.alive = true;
        m.hp = m.maxHp;
        m.x = m.sx;
        m.y = m.sy;
        m.vx = 0;
        m.vy = 0;
        m.state = 'IDLE';
      }
      continue;
    }
    if (m.flash > 0) m.flash = Math.max(0, m.flash - rawDt);

    if (Math.hypot(m.vx, m.vy) > 2) {
      m.x = Math.max(32, Math.min(868, m.x + m.vx * worldDt));
      m.y = Math.max(32, Math.min(568, m.y + m.vy * worldDt));
      m.vx *= Math.pow(0.05, worldDt);
      m.vy *= Math.pow(0.05, worldDt);
    } else {
      m.vx = 0;
      m.vy = 0;
    }

    // ★ v2.0 보스 에리크 전용 AI
    if (m.kind === 'boss_erik') {
      if (stepErikBossAI(m, p, worldDt)) bossVulnerableActive = true;
      continue;
    }

    // ★ v2.0 보스 세라피리아 전용 AI
    if (m.kind === 'boss_seraphiria') {
      if (stepSeraphiriaBossAI(m, p, worldDt)) bossVulnerableActive = true;
      continue;
    }

    // 일반 몬스터 및 1부 보스 발록 AI
    const dist = Math.hypot(p.x - m.x, p.y - m.y);
    const isRangedKind = isRangedMonsterKind(m.kind);
    const isHeavyKind = isHeavyMonsterKind(m.kind);
    const detectR = m.isBoss ? 620 : (360 + m.lv * 10);
    const atkR = m.isBoss ? 120 : (isRangedKind ? 240 : (isHeavyKind ? (p.r + m.r + 18) : (p.r + m.r + 12)));
    const curSpd = m.spd * (m.enraged ? 1.32 : 1.0);

    if (m.state === 'IDLE') {
      m.animPhase += worldDt * 3.0;
      if (dist < detectR) m.state = 'CHASE';
    } else if (m.state === 'CHASE') {
      m.animPhase += worldDt * 5.6;
      if (dist <= atkR) {
        m.state = 'TELEGRAPH';
        if (m.isBoss) {
          const patterns = ['flame_breath', 'abyss_charge', 'meteor_nova'];
          m.pattern = patterns[m.patIdx % patterns.length];
          m.patIdx += 1;
          m.timer = m.enraged ? 0.72 : 0.90;
        } else {
          m.timer = isRangedKind ? 0.52 : (isHeavyKind ? 0.45 : 0.34);
        }
        m.tx = p.x;
        m.ty = p.y;
      } else {
        let dirX = (p.x - m.x) / Math.max(1, dist);
        let dirY = (p.y - m.y) / Math.max(1, dist);
        for (const other of zoneMonsters) {
          if (other !== m && other.alive) {
            const od = Math.hypot(m.x - other.x, m.y - other.y);
            const minSep = m.r + other.r - 4;
            if (od > 0.1 && od < minSep) {
              dirX += ((m.x - other.x) / od) * 0.28;
              dirY += ((m.y - other.y) / od) * 0.28;
            }
          }
        }
        const dirLen = Math.max(0.01, Math.hypot(dirX, dirY));
        const mnx = Math.max(32, Math.min(868, m.x + (dirX / dirLen) * curSpd * worldDt));
        const mny = Math.max(32, Math.min(568, m.y + (dirY / dirLen) * curSpd * worldDt));
        if (!collidesObstacle(mnx, m.y, m.r)) m.x = mnx;
        if (!collidesObstacle(m.x, mny, m.r)) m.y = mny;
        resolveObstacleOverlap(m);
      }
    } else if (m.state === 'TELEGRAPH') {
      if (!isRangedKind && dist > p.r + m.r - 2) {
        const lx = (p.x - m.x) / Math.max(1, dist);
        const ly = (p.y - m.y) / Math.max(1, dist);
        m.x = Math.max(32, Math.min(868, m.x + lx * curSpd * 0.55 * worldDt));
        m.y = Math.max(32, Math.min(568, m.y + ly * curSpd * 0.55 * worldDt));
      }
      m.timer -= worldDt;
      if (m.timer <= 0) {
        m.state = 'ATTACK';
        m.timer = 0.26;
        const nowDist = Math.hypot(p.x - m.x, p.y - m.y);

        if (isRangedKind) {
          const baseAng = Math.atan2(p.y - m.y, p.x - m.x);
          const spreads = ['goblin_archer', 'pirate_gunner', 'viking_thrower', 'black_robe_marksman', 'elite_pirate_sharpshooter'].includes(m.kind)
            ? [0]
            : (['goblin_shaman', 'pirate_bomber', 'viking_runepriest'].includes(m.kind) ? [-0.14, 0.14] : [-0.20, 0, 0.20]);
          const projSpd = Math.min(420, 265 + m.lv * 8);
          const projColor = m.color || '#f43f5e';
          spreads.forEach(off => {
            state.projectiles.push({
              x: m.x, y: m.y,
              vx: Math.cos(baseAng + off) * projSpd,
              vy: Math.sin(baseAng + off) * projSpd,
              r: 9,
              dmg: m.atk,
              color: projColor,
              ttl: 2.2,
              isEnemy: true,
              sourceLv: m.lv,
              sourceIsBoss: Boolean(m.isBoss)
            });
          });
        } else {
          const hitR = m.isBoss ? 146 : (isHeavyKind ? 94 : 76);
          state.effects.push({ kind: 'enemy_aoe', x: m.x, y: m.y, r: hitR, ttl: 0.30, maxTtl: 0.30 });
          if (m.isBoss) {
            state.screenShake = 12;
            const bulletCount = m.enraged ? 12 : 8;
            for (let b = 0; b < bulletCount; b++) {
              const bang = (Math.PI * 2 * b) / bulletCount + (m.patIdx * 0.25);
              state.projectiles.push({
                x: m.x, y: m.y,
                vx: Math.cos(bang) * (m.enraged ? 250 : 215),
                vy: Math.sin(bang) * (m.enraged ? 250 : 215),
                r: 10,
                dmg: Math.round(m.atk * 0.85),
                color: '#f43f5e',
                ttl: 2.4,
                isEnemy: true,
                sourceLv: m.lv,
                sourceIsBoss: true
              });
            }
          }
          if (nowDist <= hitR + p.r) {
            const rawAtk = m.isBoss && m.enraged ? Math.round(m.atk * 1.30) : m.atk;
            applyEnemyDamageToPlayer(rawAtk, m.name, m.lv, Boolean(m.isBoss));
          }
        }
      }
    } else if (m.state === 'ATTACK') {
      m.timer -= worldDt;
      if (m.timer <= 0) {
        if (m.isBoss) {
          m.state = 'VULNERABLE';
          m.timer = m.enraged ? 1.90 : 2.40;
        } else {
          m.state = 'CHASE';
        }
      }
    } else if (m.state === 'VULNERABLE') {
      bossVulnerableActive = true;
      m.timer -= worldDt;
      if (m.timer <= 0) m.state = 'CHASE';
    }
  }

  const banner = document.getElementById('bossCounterBanner');
  if (banner) banner.classList.add('hidden');

  state.slashArcs = state.slashArcs.filter(arc => {
    arc.ttl -= rawDt;
    return arc.ttl > 0;
  });
  state.particles = state.particles.filter(pt => {
    pt.x += pt.vx * rawDt;
    pt.y += pt.vy * rawDt;
    pt.vy += 180 * rawDt;
    pt.ttl -= rawDt;
    return pt.ttl > 0;
  });
  state.effects = state.effects.filter(ef => {
    ef.ttl -= rawDt;
    return ef.ttl > 0;
  });
}

let lastFrameTs = performance.now();
function mainLoop(now) {
  requestAnimationFrame(mainLoop);
  const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTs) / 1000));
  lastFrameTs = now;
  try {
    stepSimulation(dt);
    renderCanvas(now);
    renderImuBoard();
    updateRealtimeTelemetryUI();
  } catch (err) {
    console.error('[mainLoop Error]', err);
  }
}
