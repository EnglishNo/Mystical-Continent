// ============================================================================
// 7. 64×64 HD 픽셀 아트 렌더러 & 시작 화면 상태 프리뷰 렌더러
// ============================================================================
const canvas = document.getElementById('gameCanvas');
const ctx = ensureCanvasGradSupport(canvas.getContext('2d'));
ctx.imageSmoothingEnabled = false;

const imuCanvas = document.getElementById('imuBoardCanvas');
const ictx = imuCanvas.getContext('2d');

const statusPreviewCanvas = document.getElementById('statusPreviewCanvas');
const spctx = statusPreviewCanvas.getContext('2d');
spctx.imageSmoothingEnabled = true;
spctx.imageSmoothingQuality = 'high';

function renderStartStatusPreview() {
  spctx.clearRect(0, 0, 1024, 1024);
  const spr = getHD64Sprite(state.selectedClass);
  spctx.drawImage(spr, 48, 40, 928, 928);
}

const LOGICAL_W = 900;
const LOGICAL_H = 600;
let frameDomBadges = [];

// 캔버스 내부가 아닌 브라우저 네이티브 HTML DOM 벡터 폰트 레이어(#canvasDomLabels)에 배지를 등록하여 흐림 현상을 0%로 원천 제거!
function drawCanvasPill(c, text, x, y, textColor = '#ffffff', borderColor = '#334155', bgColor = '#05070e') {
  const clampedX = Math.max(68, Math.min(LOGICAL_W - 68, x));
  const clampedY = Math.max(18, Math.min(LOGICAL_H - 14, y));
  frameDomBadges.push({
    text,
    xPct: (clampedX / LOGICAL_W) * 100,
    yPct: (clampedY / LOGICAL_H) * 100,
    textColor,
    borderColor,
    bgColor
  });
}

function syncDomLabelsToScreen() {
  const layer = document.getElementById('canvasDomLabels');
  if (!layer) return;
  // #gameCanvas의 실제 화면 표시 영역과 정확히 일치하도록 위치/크기 동기화
  layer.style.left = `${canvas.offsetLeft}px`;
  layer.style.top = `${canvas.offsetTop}px`;
  layer.style.width = `${canvas.clientWidth}px`;
  layer.style.height = `${canvas.clientHeight}px`;

  layer.innerHTML = frameDomBadges.map(b => `
    <div style="left:${b.xPct.toFixed(2)}%; top:${b.yPct.toFixed(2)}%; transform:translate(-50%, -50%); color:${b.textColor}; border-color:${b.borderColor}; background-color:#05070e;"
         class="absolute px-2 py-0.5 rounded-md border text-[11px] sm:text-xs font-extrabold tracking-tight leading-none whitespace-nowrap shadow-md">
      ${b.text}
    </div>
  `).join('');
}


function renderCanvas(nowMs) {
  const z = state.zones[state.zoneId];
  const p = state.player;
  const animClock = state.isTalkingToNpc ? 0 : nowMs;
  frameDomBadges = [];

  ctx.save();
  // 1800x1200 (2배 고해상도 버퍼)에 맞춰 2x 스케일링 적용 -> 도트 그래픽 선명도 2배 향상
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (state.screenShake > 0 && !state.isTalkingToNpc) {
    const sx = (Math.random() - 0.5) * state.screenShake * 1.5;
    const sy = (Math.random() - 0.5) * state.screenShake * 1.5;
    ctx.translate(sx, sy);
  }

  renderZoneEnvironment(ctx, z, animClock);

  if (state.bulletTimeTimer > 0) {
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
  }

  for (const ef of state.effects) {
    if (ef.kind === 'quake_crater') {
      ctx.save();
      ctx.translate(ef.x, ef.y);
      const alpha = ef.ttl / ef.maxTtl;
      ctx.strokeStyle = `rgba(249, 115, 22, ${alpha})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, ef.r * (1.1 - alpha * 0.25), 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * ef.r, Math.sin(a) * ef.r);
        ctx.stroke();
      }
      ctx.restore();
    } else if (ef.kind === 'arcane_circle') {
      ctx.save();
      ctx.translate(ef.x, ef.y);
      ctx.rotate(animClock * 0.004);
      const alpha = ef.ttl / ef.maxTtl;
      ctx.strokeStyle = `rgba(192, 132, 252, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, ef.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, ef.r * 0.72, 0, Math.PI * 2);
      ctx.stroke();
      for (let t = 0; t < 2; t++) {
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = t * (Math.PI / 3) + (i * Math.PI * 2) / 3;
          const px = Math.cos(a) * ef.r * 0.85;
          const py = Math.sin(a) * ef.r * 0.85;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.restore();
    } else if (ef.kind === 'enemy_aoe') {
      ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
      ctx.beginPath();
      ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI * 2);
      ctx.fill();
    } else if (ef.kind === 'water_ripple') {
      ctx.save();
      const alpha = Math.max(0, ef.ttl / (ef.maxTtl || 0.5));
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.75})`;
      ctx.fillStyle = `rgba(186, 230, 253, ${alpha * 0.22})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.ellipse(ef.x, ef.y, ef.r * (1.25 - alpha * 0.3), ef.r * 0.55 * (1.25 - alpha * 0.3), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (ef.kind === 'seraphiria_phase2_burst') {
      ctx.save();
      const alpha = Math.max(0, ef.ttl / (ef.maxTtl || 1.2));
      const curR = ef.r * (1.15 - alpha * 0.55);
      ctx.strokeStyle = `rgba(236, 72, 153, ${alpha * 0.9})`;
      ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.22})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(ef.x, ef.y, curR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  // 1) 바닥 조명(횃불 광원) 및 바닥 포털 마법진, 보스 바닥 전조 장판(궤적/원형 장판) 선렌더링
  for (const torch of (z.torches || [])) {
    const flicker = 28 + Math.sin(animClock * 0.012 + torch.x) * 4;
    const grad = ctx.createRadialGradient(torch.x, torch.y, 2, torch.x, torch.y, flicker * 2.2);
    grad.addColorStop(0, 'rgba(251, 191, 36, 0.42)');
    grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(torch.x, torch.y, flicker * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const portal of z.portals) {
    const unlocked = (typeof isPortalUnlocked === 'function') ? isPortalUnlocked(portal) : true;
    ctx.save();
    ctx.translate(Math.round(portal.x), Math.round(portal.y));
    ctx.rotate(animClock * (unlocked ? 0.003 : 0.001));
    ctx.strokeStyle = unlocked ? '#38bdf8' : '#f43f5e';
    ctx.lineWidth = 3.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, portal.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = unlocked ? 'rgba(56, 189, 248, 0.25)' : 'rgba(244, 63, 94, 0.18)';
    ctx.beginPath();
    ctx.arc(Math.round(portal.x), Math.round(portal.y), portal.r - 4, 0, Math.PI * 2);
    ctx.fill();

    const pLabel = unlocked ? portal.label : `🔒 ${portal.label}`;
    drawCanvasPill(ctx, pLabel, portal.x, portal.y - portal.r - 14, unlocked ? '#fde047' : '#fda4af', unlocked ? '#38bdf8' : '#f43f5e');
  }

  // 몬스터 바닥 궤적 및 원형 전조 장판 (오브젝트/캐릭터 발밑에 깔리도록 먼저 렌더링)
  for (const m of state.monsters) {
    if (m.zone !== state.zoneId || !m.alive) continue;
    const mx = Math.round(m.x), my = Math.round(m.y);

    if ((m.state === 'ERIK_CHARGE_DASH' || m.state === 'SERAPH_CHARGE_DASH') && m.dashTx != null && m.dashTy != null) {
      ctx.save();
      const ang = Math.atan2(m.dashTy - my, m.dashTx - mx);
      const distLen = Math.hypot(m.dashTx - mx, m.dashTy - my);
      ctx.translate(mx, my);
      ctx.rotate(ang);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([10, 6]);
      ctx.fillRect(0, -28, distLen, 56);
      ctx.strokeRect(0, -28, distLen, 56);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(254, 240, 138, 0.75)';
      ctx.beginPath();
      ctx.moveTo(distLen, 0);
      ctx.lineTo(distLen - 22, -18);
      ctx.lineTo(distLen - 22, 18);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(mx, my);
    if (m.state === 'TELEGRAPH') {
      const r = m.isBoss ? 146 : (['goblin_brute', 'orc_juggernaut'].includes(m.kind) ? 94 : 76);
      ctx.fillStyle = 'rgba(244, 63, 94, 0.26)';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (m.state === 'ERIK_CHARGE_AXE') {
      const pulseR = m.r + 22 + Math.sin(animClock * 0.015) * 6;
      const rageGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, pulseR);
      rageGrad.addColorStop(0, 'rgba(239, 68, 68, 0.55)');
      rageGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = rageGrad;
      ctx.beginPath();
      ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (m.state === 'VULNERABLE') {
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, m.r + 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (m.isBoss && m.enraged) {
      ctx.strokeStyle = m.kind === 'boss_seraphiria' ? 'rgba(236, 72, 153, 0.78)' : 'rgba(244, 63, 94, 0.65)';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.arc(0, 0, m.r + 10, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 2) Y-정렬(Depth Sorting) 레이어:
  // 캐릭터(플레이어·NPC·몬스터)가 오브젝트 위에 있으면(y가 작으면) 오브젝트 밑(뒤)에 그려지고,
  // 오브젝트 밑에 있으면(y가 크면) 오브젝트 위(앞)에 그려지도록 sortY 기준 오름차순 렌더링
  const ySortedDrawables = [];

  for (const torch of (z.torches || [])) {
    ySortedDrawables.push({
      sortY: torch.y + 7,
      draw: () => {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(torch.x - 3, torch.y, 6, 14);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(torch.x - 4, torch.y - 6, 8, 7);
      }
    });
  }

  for (const ob of z.obstacles) {
    ySortedDrawables.push({
      sortY: ob.y + ob.h * 0.5,
      draw: () => {
        const spr = getHD64Sprite(ob.kind || 'pillar');
        ctx.drawImage(spr, ob.x - 8, ob.y - 10, ob.w + 16, ob.h + 20);
      }
    });
  }

  for (const chest of z.chests) {
    ySortedDrawables.push({
      sortY: chest.y,
      draw: () => {
        const cSpr = getHD64Sprite(chest.opened ? 'chest_open' : 'chest_closed');
        ctx.drawImage(cSpr, Math.round(chest.x - 24), Math.round(chest.y - 26), 48, 48);
        drawCanvasPill(ctx, chest.opened ? '상자 열림' : '🎁 보물상자 (F)', chest.x, chest.y - 28, chest.opened ? '#94a3b8' : '#fde047', '#f59e0b');
      }
    });
  }

  for (const npc of z.npcs) {
    if (npc.hideAfterQuestCompleted && getQuestState(npc.hideAfterQuestCompleted).status === 'completed') continue;
    ySortedDrawables.push({
      sortY: npc.y,
      draw: () => {
        const spr = getHD64Sprite(npc.sprite || 'mage');
        ctx.drawImage(spr, Math.round(npc.x - 39), Math.round(npc.y - 42), 78, 78);

        const hasTurnIn = QUESTS.some(q => {
          const qs = getQuestState(q.id);
          return qs.status === 'active' && qs.progress >= q.targetCount && q.turnInNpcId === npc.id;
        });
        const hasAvailable = QUESTS.some(q => {
          const qs = getQuestState(q.id);
          return qs.status === 'unaccepted' && q.giverId === npc.id && isQuestPrerequisiteMet(q);
        });

        let npcLabel = `💬 ${npc.name} (Enter/F)`;
        let npcTextColor = '#fde047';
        let npcBorder = '#f59e0b';
        const canSailNow = (typeof canNpcOfferSailing === 'function') && canNpcOfferSailing(npc);
        if (npc.questRole === 'merchant') {
          npcLabel = `🏪 [워프/잡화 상점] ${npc.name} (Enter/F)`;
          npcTextColor = '#a7f3d0';
          npcBorder = '#10b981';
        } else if (hasTurnIn) {
          npcLabel = `🎁 [완료 보고] ${npc.name} (F)`;
          npcTextColor = '#34d399';
          npcBorder = '#10b981';
        } else if (hasAvailable) {
          npcLabel = `❗ [퀘스트 수락] ${npc.name} (F)`;
          npcTextColor = '#38bdf8';
          npcBorder = '#0284c7';
        } else if (canSailNow) {
          npcLabel = `⛵ [섬 항해 가능] ${npc.name} (Enter/F)`;
          npcTextColor = '#7dd3fc';
          npcBorder = '#0ea5e9';
        } else if (npc.questRole === 'blacksmith') {
          npcLabel = `🔨 [장비 제작/교환] ${npc.name} (Enter/F)`;
          npcTextColor = '#fdba74';
          npcBorder = '#f97316';
        }
        drawCanvasPill(ctx, npcLabel, npc.x, npc.y - 50, npcTextColor, npcBorder);
      }
    });
  }

  for (const m of state.monsters) {
    if (m.zone !== state.zoneId || !m.alive) continue;
    ySortedDrawables.push({
      sortY: m.y,
      draw: () => {
        const mx = Math.round(m.x), my = Math.round(m.y);
        ctx.save();
        ctx.translate(mx, my);

        const gentleBob = Math.round(Math.sin(m.animPhase) * 2.0);
        const spr = getHD64Sprite(m.kind, m.flash > 0);
        const drawW = m.isBoss ? 144 : 74;
        const drawH = m.isBoss ? 144 : 74;

        if ((m.homingShotsLeft || 0) > 0) {
          for (let i = 0; i < m.homingShotsLeft; i++) {
            const orbAng = animClock * 0.004 + (Math.PI * 2 * i) / Math.max(1, m.homingShotsLeft);
            const ox = Math.cos(orbAng) * 52;
            const oy = Math.sin(orbAng) * 34 - 10;
            ctx.fillStyle = 'rgba(236, 72, 153, 0.85)';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(ox, oy, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        }

        if (m.stealthed) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.52)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(0, drawH / 2 - 8, 34, 10, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.save();
          ctx.globalAlpha = 0.22;
          if (p.x < m.x) ctx.scale(-1, 1);
          ctx.drawImage(spr, -drawW / 2, -drawH / 2 + gentleBob, drawW, drawH);
          ctx.restore();
          ctx.restore();
          drawCanvasPill(ctx, `Lv.${m.lv} ${m.name}`, mx, my - drawH / 2 - 22, '#fda4af', '#475569');
          return;
        }

        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath();
        ctx.ellipse(0, drawH / 2 - 6, drawW * 0.34, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        if (p.x < m.x) ctx.scale(-1, 1);
        const liftY = m.state === 'ERIK_CHARGE_AXE' ? -8 : 0;
        ctx.drawImage(spr, -drawW / 2, -drawH / 2 + gentleBob + liftY, drawW, drawH);
        ctx.restore();

        const bw = m.isBoss ? 96 : 52;
        const ratio = Math.max(0, m.hp / m.maxHp);
        ctx.fillStyle = '#090d16';
        ctx.fillRect(-bw / 2, -drawH / 2 - 10, bw, 7);
        ctx.fillStyle = m.isBoss ? '#f43f5e' : (m.lv >= 6 ? '#a855f7' : '#10b981');
        ctx.fillRect(-bw / 2 + 1, -drawH / 2 - 9, Math.round((bw - 2) * ratio), 5);
        ctx.restore();

        drawCanvasPill(ctx, `Lv.${m.lv} ${m.name}`, mx, my - drawH / 2 - 22, m.isBoss ? '#fda4af' : '#f8fafc', '#475569');
      }
    });
  }

  ySortedDrawables.push({
    sortY: p.y,
    draw: () => {
      const pSpr = getHD64Sprite(state.selectedClass);
      for (const aft of p.afterimages) {
        ctx.save();
        ctx.globalAlpha = (aft.ttl / 0.22) * 0.55;
        ctx.drawImage(pSpr, Math.round(aft.x - 34), Math.round(aft.y - 34), 68, 68);
        ctx.restore();
      }

      const px = Math.round(p.x), py = Math.round(p.y);
      ctx.save();
      ctx.translate(px, py);
      if (p.invulnTimer > 0) {
        ctx.strokeStyle = p.dodgeTimer > 0 ? '#34d399' : '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      const walkBob = Math.round(Math.sin(p.animTick) * 2.0);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 22, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      if (p.invulnTimer > 0 && p.dodgeTimer <= 0) {
        ctx.globalAlpha = (Math.floor(animClock / 95) % 2 === 0) ? 0.45 : 0.95;
      }
      if (p.fx < 0) ctx.scale(-1, 1);
      const pRenderSpr = getHD64Sprite(state.selectedClass, (p.hitFlash || 0) > 0);
      ctx.drawImage(pRenderSpr, -38, -40 + walkBob, 76, 76);
      ctx.restore();

      const pDerived = getDerivedStats();
      const pHpRatio = Math.max(0, Math.min(1, p.hp / Math.max(1, pDerived.maxHp)));
      const pBarW = 54;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(-pBarW / 2, -46, pBarW, 6);
      ctx.fillStyle = pHpRatio > 0.5 ? '#22c55e' : (pHpRatio > 0.25 ? '#f59e0b' : '#f43f5e');
      ctx.fillRect(-pBarW / 2 + 1, -45, Math.round((pBarW - 2) * pHpRatio), 4);
      ctx.restore();

      drawCanvasPill(ctx, `Lv.${p.level} (${Math.round(p.hp)}/${pDerived.maxHp})`, px, py - 58, '#38bdf8', '#0284c7');
    }
  });

  ySortedDrawables.sort((a, b) => a.sortY - b.sortY);
  for (const item of ySortedDrawables) {
    item.draw();
  }

  for (const arc of state.slashArcs) {
    ctx.save();
    ctx.translate(arc.x, arc.y);
    const progress = 1 - arc.ttl / arc.maxTtl;
    const startA = arc.angle - (arc.sweep / 2) * arc.dir;
    const endA = arc.angle + (arc.sweep / 2) * arc.dir;
    ctx.globalAlpha = Math.min(1, (arc.ttl / arc.maxTtl) * 1.4);

    ctx.strokeStyle = arc.color;
    ctx.lineWidth = 14 * (1 - progress * 0.4);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, arc.radius, Math.min(startA, endA), Math.max(startA, endA));
    ctx.stroke();

    ctx.strokeStyle = arc.coreColor;
    ctx.lineWidth = 5 * (1 - progress * 0.5);
    ctx.beginPath();
    ctx.arc(0, 0, arc.radius, Math.min(startA, endA), Math.max(startA, endA));
    ctx.stroke();
    ctx.restore();
  }

  for (const proj of state.projectiles) {
    ctx.save();
    ctx.fillStyle = proj.color || '#f97316';
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  for (const pt of state.particles) {
    ctx.fillStyle = pt.color;
    ctx.globalAlpha = Math.max(0, pt.ttl / pt.maxTtl);
    ctx.fillRect(Math.round(pt.x), Math.round(pt.y), pt.size, pt.size);
  }
  ctx.globalAlpha = 1.0;

  for (const ef of state.effects) {
    if (ef.kind === 'dmg_text') {
      const ex = Math.round(ef.x);
      const ey = Math.round(ef.y - (0.65 - ef.ttl) * 28);
      drawCanvasPill(ctx, ef.text, ex, ey, ef.color || '#fde047', '#fbbf24');
    }
  }

  if (state.isTalkingToNpc) {
    ctx.fillStyle = 'rgba(5, 7, 14, 0.48)';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
  }

  ctx.save();
  const mmX = LOGICAL_W - 132, mmY = 12, mmW = 120, mmH = 80;
  ctx.fillStyle = 'rgba(9, 13, 22, 0.88)';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.fillRect(mmX, mmY, mmW, mmH);
  ctx.strokeRect(mmX, mmY, mmW, mmH);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(mmX + (p.x / LOGICAL_W) * mmW - 2, mmY + (p.y / LOGICAL_H) * mmH - 2, 5, 5);
  for (const m of state.monsters) {
    if (m.zone === state.zoneId && m.alive) {
      ctx.fillStyle = m.isBoss ? '#f43f5e' : '#fbbf24';
      ctx.fillRect(mmX + (m.x / LOGICAL_W) * mmW - 2, mmY + (m.y / LOGICAL_H) * mmH - 2, m.isBoss ? 6 : 4, m.isBoss ? 6 : 4);
    }
  }
  ctx.restore();

  ctx.restore();
  syncDomLabelsToScreen();
}

function renderImuBoard() {
  ictx.clearRect(0, 0, imuCanvas.width, imuCanvas.height);
  const cx = imuCanvas.width / 2;
  const cy = imuCanvas.height / 2 + 4;

  const tiltX = state.sensor.joyX * 0.35 + (state.sensor.roll * Math.PI) / 180;
  const tiltY = state.sensor.joyY * 0.35 + (state.sensor.pitch * Math.PI) / 180;

  ictx.save();
  ictx.translate(cx, cy);
  ictx.scale(1, 0.65 + Math.sin(tiltY) * 0.18);
  ictx.rotate(tiltX * 0.6);

  ictx.fillStyle = '#0f5132';
  ictx.strokeStyle = '#34d399';
  ictx.lineWidth = 2;
  ictx.fillRect(-52, -32, 104, 64);
  ictx.strokeRect(-52, -32, 104, 64);

  ictx.fillStyle = '#64748b';
  ictx.fillRect(-44, -22, 34, 30);
  ictx.fillStyle = '#e2e8f0';
  ictx.font = 'bold 8px monospace';
  ictx.fillText('ESP32', -39, -4);

  const imuActive = state.sensor.gyroDeg > 80 || state.sensor.accelG > 1.6;
  ictx.fillStyle = imuActive ? '#f43f5e' : '#1e293b';
  ictx.strokeStyle = '#38bdf8';
  ictx.fillRect(-2, -20, 26, 22);
  ictx.strokeRect(-2, -20, 26, 22);
  ictx.fillStyle = '#38bdf8';
  ictx.fillText('MPU', 2, -6);

  ictx.fillStyle = state.sensor.touch0Active ? '#c084fc' : '#3b0764';
  ictx.fillRect(28, -24, 18, 18);
  ictx.fillStyle = '#ffffff';
  ictx.fillText('T0', 32, -12);

  ictx.fillStyle = state.sensor.touch3Active ? '#818cf8' : '#1e1b4b';
  ictx.fillRect(28, 2, 18, 18);
  ictx.fillStyle = '#ffffff';
  ictx.fillText('T3', 32, 14);

  ictx.restore();
}
