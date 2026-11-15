// 필드별 고퀄리티 배경 테마 렌더러 (포레스트 타운: 몽환적 숲속 마을 & 울창한 수풀의 긴장감 / 오션블루 타운: 청량한 중세 해안 항구 도시)
function renderZoneEnvironment(ctx, z, animClock) {
  const zid = z.id;
  const tSec = animClock * 0.001;

  if (zid === 'forest_town') {
    // 1. 몽환적인 에메랄드 숲 바닥 그라데이션
    const bgGrad = ctx.createRadialGradient(450, 300, 60, 450, 300, 540);
    bgGrad.addColorStop(0, '#1e4631');
    bgGrad.addColorStop(0.65, '#132e20');
    bgGrad.addColorStop(1, '#071710');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    // 부드러운 잔디 & 이끼 군락 패치
    const mossPatches = [
      [190, 210, 95, 55], [450, 240, 140, 75], [660, 230, 105, 60],
      [290, 430, 110, 65], [580, 420, 95, 55], [450, 380, 130, 70]
    ];
    ctx.fillStyle = 'rgba(52, 211, 153, 0.09)';
    for (const [mx, my, rx, ry] of mossPatches) {
      ctx.beginPath();
      ctx.ellipse(mx, my, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. 마을 광장 & 4개 포털을 잇는 이끼 낀 조약돌/통나무 길
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
    ctx.lineWidth = 46;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(75, 300);
    ctx.lineTo(445, 300);
    ctx.moveTo(445, 300);
    ctx.quadraticCurveTo(640, 240, 815, 155);
    ctx.moveTo(445, 300);
    ctx.quadraticCurveTo(640, 330, 815, 345);
    ctx.moveTo(445, 300);
    ctx.lineTo(445, 535);
    ctx.stroke();

    // 중앙 요정의 샘 광장 석조 원형 타일
    ctx.fillStyle = 'rgba(203, 213, 225, 0.16)';
    ctx.beginPath();
    ctx.ellipse(447, 345, 115, 78, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(110, 231, 183, 0.35)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 조약돌 디테일
    const cobbles = [
      [140, 298], [200, 304], [260, 296], [320, 302], [380, 299],
      [530, 268], [620, 230], [710, 192],
      [540, 318], [635, 332], [725, 340],
      [445, 430], [442, 475], [235, 175], [445, 175], [648, 175]
    ];
    ctx.fillStyle = 'rgba(226, 232, 240, 0.26)';
    for (const [cx, cy] of cobbles) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, 14, 8, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. 야생화 화단 & 몽환적으로 빛나는 요정 발광 버섯 군락
    const glowMushrooms = [
      [135, 195, '#38bdf8'], [150, 208, '#fde047'], [335, 185, '#34d399'],
      [555, 185, '#38bdf8'], [735, 245, '#a78bfa'], [748, 258, '#38bdf8'],
      [155, 435, '#34d399'], [172, 448, '#fde047'], [685, 455, '#38bdf8'],
      [702, 468, '#f472b6'], [355, 495, '#34d399'], [540, 495, '#38bdf8']
    ];
    for (let i = 0; i < glowMushrooms.length; i++) {
      const [gx, gy, col] = glowMushrooms[i];
      const pulse = 0.65 + 0.35 * Math.sin(tSec * 2.6 + i);
      ctx.save();
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.25 * pulse;
      ctx.beginPath();
      ctx.arc(gx, gy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(gx - 2, gy, 4, 6);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(gx, gy, 6, Math.PI, 0);
      ctx.fill();
      ctx.restore();
    }

    // 4. 외곽을 빽빽하게 둘러싼 원시림 수관(Canopy) & 수풀 속 정체불명의 안광 (뭐가 튀어나올지 조마조마한 긴장감!)
    ctx.save();
    const vig = ctx.createRadialGradient(450, 300, 255, 450, 300, 520);
    vig.addColorStop(0, 'rgba(2, 12, 8, 0)');
    vig.addColorStop(0.76, 'rgba(3, 18, 11, 0.50)');
    vig.addColorStop(1, 'rgba(1, 8, 5, 0.88)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    const borderTrees = [
      [30, 22, 44], [85, 18, 40], [140, 20, 42], [295, 16, 38], [350, 18, 40],
      [505, 16, 38], [560, 18, 40], [710, 20, 44], [770, 22, 42], [835, 24, 46], [885, 30, 44],
      [18, 85, 42], [22, 145, 40], [18, 205, 38], [18, 395, 40], [22, 460, 44], [25, 525, 46],
      [882, 75, 40], [880, 245, 42], [882, 435, 44], [878, 505, 46],
      [75, 578, 46], [140, 582, 44], [205, 578, 42], [275, 582, 44], [340, 580, 40],
      [555, 580, 40], [625, 582, 44], [695, 578, 46], [765, 582, 44], [835, 578, 48]
    ];
    for (let i = 0; i < borderTrees.length; i++) {
      const [tx, ty, tr] = borderTrees[i];
      const sway = Math.sin(tSec * 1.4 + i * 0.7) * 2.2;
      ctx.fillStyle = '#041f14';
      ctx.beginPath();
      ctx.arc(tx + sway, ty, tr + 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = i % 2 === 0 ? '#064e3b' : '#0f5132';
      ctx.beginPath();
      ctx.arc(tx + sway, ty, tr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = i % 3 === 0 ? '#15803d' : '#166534';
      ctx.beginPath();
      ctx.arc(tx - 6 + sway, ty - 5, tr * 0.68, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(74, 222, 128, 0.28)';
      ctx.beginPath();
      ctx.arc(tx - 10 + sway, ty - 9, tr * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // 어두운 숲 수풀 속에서 깜빡이며 지켜보는 정체불명의 눈빛들
    const lurkingEyes = [
      [26, 120, '#ef4444', 0.0], [875, 245, '#f59e0b', 1.3],
      [115, 572, '#ef4444', 2.4], [735, 574, '#facc15', 3.7],
      [320, 22, '#f97316', 4.8], [872, 470, '#ef4444', 5.5]
    ];
    for (const [ex, ey, ecol, phase] of lurkingEyes) {
      const blink = Math.sin(tSec * 1.8 + phase);
      if (blink > 0.15) {
        const alpha = Math.min(1, (blink - 0.15) * 1.4);
        ctx.save();
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle = ecol;
        ctx.shadowColor = ecol;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(ex - 4, ey, 2.6, 1.5, 0.15, 0, Math.PI * 2);
        ctx.ellipse(ex + 4, ey, 2.6, 1.5, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 5. 나뭇잎 사이로 쏟아지는 대각선 햇살(God-rays) & 반딧불이 입자
    ctx.globalCompositeOperation = 'screen';
    for (let r = 0; r < 4; r++) {
      const rx = 160 + r * 195 + Math.sin(tSec * 0.5 + r) * 18;
      const rayGrad = ctx.createLinearGradient(rx, 0, rx + 120, 520);
      rayGrad.addColorStop(0, 'rgba(167, 243, 208, 0.11)');
      rayGrad.addColorStop(0.6, 'rgba(52, 211, 153, 0.04)');
      rayGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(rx, 0);
      ctx.lineTo(rx + 65, 0);
      ctx.lineTo(rx + 210, 600);
      ctx.lineTo(rx + 115, 600);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 부유하는 숲속 반딧불이(Fireflies)
    for (let f = 0; f < 16; f++) {
      const fx = (f * 61 + Math.sin(tSec * 0.9 + f) * 28 + 50) % 840;
      const fy = (f * 43 + Math.cos(tSec * 1.1 + f * 0.7) * 22 + 60) % 520;
      const fa = 0.35 + 0.55 * Math.abs(Math.sin(tSec * 2.2 + f));
      ctx.fillStyle = f % 3 === 0 ? `rgba(110, 231, 183, ${fa})` : `rgba(253, 224, 71, ${fa})`;
      ctx.beginPath();
      ctx.arc(fx, fy, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  else if (zid === 'oceanblue_town') {
    // ================= [오션블루 타운: 시원하고 청량한 중세 해안 항구 도시] =================
    const plazaGrad = ctx.createLinearGradient(0, 0, 0, LOGICAL_H);
    plazaGrad.addColorStop(0, '#1e3a5f');
    plazaGrad.addColorStop(0.54, '#254b73');
    plazaGrad.addColorStop(0.66, '#d9b372'); // 금빛 모래사장
    plazaGrad.addColorStop(0.78, '#0ea5e9'); // 얕은 에메랄드 해변
    plazaGrad.addColorStop(0.90, '#0284c7'); // 청량한 오션블루
    plazaGrad.addColorStop(1.0, '#0369a1');  // 깊은 바다
    ctx.fillStyle = plazaGrad;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    // 중세 성곽 도시 조약돌 타일 패턴 & 중앙 나침반 모자이크 광장
    ctx.save();
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= LOGICAL_W; x += 45) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 365); ctx.stroke();
    }
    for (let y = 0; y <= 365; y += 35) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(LOGICAL_W, y); ctx.stroke();
    }

    // 분수대 주변 대형 해양 나침반(Compass Rose) 석조 모자이크
    ctx.save();
    ctx.translate(455, 295);
    ctx.fillStyle = 'rgba(240, 249, 255, 0.12)';
    ctx.beginPath();
    ctx.arc(0, 0, 95, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.35)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    for (let a = 0; a < 8; a++) {
      ctx.save();
      ctx.rotate((a * Math.PI) / 4);
      ctx.fillStyle = a % 2 === 0 ? 'rgba(251, 191, 36, 0.25)' : 'rgba(56, 189, 248, 0.22)';
      ctx.beginPath();
      ctx.moveTo(0, -88);
      ctx.lineTo(12, -20);
      ctx.lineTo(-12, -20);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // 중세 석조 방파제 성벽(Seawall Promenade) & 항구 계단
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 358, LOGICAL_W, 18);
    ctx.fillStyle = '#94a3b8';
    for (let bx = 8; bx < LOGICAL_W; bx += 48) {
      ctx.fillRect(bx, 360, 40, 12);
    }
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(405, 356, 100, 26);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    for (let sy = 361; sy <= 379; sy += 6) {
      ctx.beginPath(); ctx.moveTo(405, sy); ctx.lineTo(505, sy); ctx.stroke();
    }

    // 실시간으로 밀려오는 청량한 파도 & 하얀 파도 거품(Surf Foam) 애니메이션
    for (let w = 0; w < 3; w++) {
      const waveOffset = Math.sin(tSec * 2.1 + w * 1.4) * 8;
      const baseY = 472 + w * 38 + waveOffset;
      ctx.fillStyle = w === 0 ? 'rgba(56, 189, 248, 0.44)' : (w === 1 ? 'rgba(14, 165, 233, 0.54)' : 'rgba(2, 132, 199, 0.68)');
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      for (let x = 0; x <= LOGICAL_W; x += 45) {
        const cy = baseY + Math.sin(x * 0.025 + tSec * 2.4 + w) * 7;
        ctx.lineTo(x, cy);
      }
      ctx.lineTo(LOGICAL_W, LOGICAL_H);
      ctx.lineTo(0, LOGICAL_H);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.80)';
      ctx.lineWidth = w === 0 ? 3.2 : 2.2;
      ctx.beginPath();
      for (let x = 0; x <= LOGICAL_W; x += 30) {
        const cy = baseY + Math.sin(x * 0.025 + tSec * 2.4 + w) * 7;
        if (x === 0) ctx.moveTo(x, cy);
        else ctx.lineTo(x, cy);
      }
      ctx.stroke();
    }

    // 우측 목조 항구 부두(Wooden Pier) & 정박 중인 중세 범선(Sailing Ship) 선수
    ctx.fillStyle = '#78350f';
    ctx.fillRect(675, 374, 95, 165);
    ctx.fillStyle = '#92400e';
    for (let py = 380; py < 534; py += 12) {
      ctx.fillRect(679, py, 87, 8);
    }
    ctx.fillStyle = '#451a03';
    ctx.fillRect(682, 378, 10, 14);
    ctx.fillRect(756, 378, 10, 14);
    ctx.fillRect(682, 516, 10, 14);
    ctx.fillRect(756, 516, 10, 14);

    // 부두 위 오크통 & 무역 화물 상자 디테일
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#271409';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(686, 405, 22, 22, 4);
    ctx.roundRect(712, 412, 18, 18, 3);
    ctx.fill();
    ctx.stroke();
    // 부두와 배를 연결하는 계류 밧줄(Mooring Ropes)
    const shipBob = Math.sin(tSec * 1.8) * 3.0;
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(760, 386);
    ctx.quadraticCurveTo(780, 415, 795, 455 + shipBob);
    ctx.moveTo(760, 520);
    ctx.quadraticCurveTo(790, 515, 825, 495 + shipBob);
    ctx.stroke();
    // 512x512 초정밀 중세 대항해 범선(harbor_ship) 렌더링
    const shipSpr = getHD64Sprite('harbor_ship');
    ctx.drawImage(shipSpr, 742, 348 + shipBob, 152, 152);

    // 해변 조개껍질, 불가사리 & 바다 위 반짝이는 윤슬(Sea Sparkles)
    const shells = [[185, 425, '#fda4af'], [335, 442, '#fde047'], [545, 430, '#f472b6'], [615, 448, '#fef08a']];
    for (const [sx, sy, scol] of shells) {
      ctx.fillStyle = scol;
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let s = 0; s < 14; s++) {
      const sx = (s * 67 + 40) % 860;
      const sy = 485 + ((s * 37) % 95);
      const twinkle = Math.sin(tSec * 3.5 + s * 1.3);
      if (twinkle > 0.2) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(sx - 4, sy - 1, 8, 2);
        ctx.fillRect(sx - 1, sy - 4, 2, 8);
      }
    }
    ctx.restore();
  }
  else if (zid === 'flower_island_1' || zid === 'flower_island_2') {
    // ================= [플라워 아일랜드 : 화단길 01~02 — 만발한 형형색색 꽃화단과 에메랄드 해변 산책로] =================
    const bgGrad = ctx.createLinearGradient(0, 0, 0, LOGICAL_H);
    bgGrad.addColorStop(0, '#0f5132');
    bgGrad.addColorStop(0.18, '#15803d');
    bgGrad.addColorStop(0.76, '#166534');
    bgGrad.addColorStop(0.84, '#f3d59b'); // 따뜻한 산호 모래사장
    bgGrad.addColorStop(0.93, '#38bdf8'); // 투명한 에메랄드 바다
    bgGrad.addColorStop(1.0, '#0284c7');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    // 1) 상단·하단 화려한 대형 계단식 꽃화단(Grand Terraced Flowerbeds)
    const drawLongFlowerbedBand = (by, bh) => {
      ctx.save();
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.fillRect(0, by, LOGICAL_W, bh);
      ctx.strokeRect(0, by, LOGICAL_W, bh);

      ctx.fillStyle = '#14532d';
      ctx.fillRect(0, by + 5, LOGICAL_W, bh - 10);

      const palette = ['#f43f5e', '#fb7185', '#fbbf24', '#fde047', '#38bdf8', '#c084fc', '#f472b6', '#ffffff'];
      for (let fx = 18; fx < LOGICAL_W - 12; fx += 24) {
        for (let row = 0; row < 2; row++) {
          const fy = by + 15 + row * 20 + ((fx % 48 === 0) ? 3 : -2);
          const col = palette[(Math.floor(fx / 24) + row * 3) % palette.length];
          const sway = Math.sin(tSec * 2.2 + fx * 0.05 + row) * 1.8;
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(fx + sway, fy + 2, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(fx + sway, fy, 6.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(fx + sway, fy, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    };
    drawLongFlowerbedBand(12, 54);
    drawLongFlowerbedBand(442, 48);

    // 2) 화이트 대리석 & 파스텔 타일 중앙 화단 산책로(Flower Promenade)
    ctx.save();
    ctx.fillStyle = 'rgba(255, 251, 235, 0.88)';
    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(45, 248, 810, 104, 24);
    ctx.fill();
    ctx.stroke();

    // 산책로 위 장식 로즈 타일 문양
    for (let tx = 95; tx <= 805; tx += 70) {
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(tx, 300, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(251, 191, 36, 0.30)';
      ctx.beginPath();
      ctx.arc(tx, 300, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3) 잔디밭 곳곳의 원형 미니 화단 & 흩날리는 꽃잎(Floating Petals)
    const miniRings = [[145, 145], [405, 165], [735, 150], [160, 405], [410, 405], [735, 405]];
    for (const [rx, ry] of miniRings) {
      ctx.fillStyle = 'rgba(254, 242, 242, 0.30)';
      ctx.beginPath();
      ctx.arc(rx, ry, 24, 0, Math.PI * 2);
      ctx.fill();
      for (let a = 0; a < 6; a++) {
        const ang = (Math.PI * 2 * a) / 6 + tSec * 0.4;
        ctx.fillStyle = a % 2 === 0 ? '#f472b6' : '#fde047';
        ctx.beginPath();
        ctx.arc(rx + Math.cos(ang) * 16, ry + Math.sin(ang) * 16, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 바람에 흩날리는 핑크·골드 꽃잎 파티클
    for (let p = 0; p < 22; p++) {
      const px = (p * 53 + Math.floor(tSec * 36) + p * 17) % 880;
      const py = 75 + ((p * 41 + Math.floor(Math.sin(tSec * 1.7 + p) * 18)) % 360);
      ctx.fillStyle = p % 3 === 0 ? '#fde047' : (p % 2 === 0 ? '#f472b6' : '#fb7185');
      ctx.beginPath();
      ctx.ellipse(px, py, 4.2, 2.4, tSec + p, 0, Math.PI * 2);
      ctx.fill();
    }

    // 하단 산호 해변 파도 라인
    const waveY = 515 + Math.sin(tSec * 2.2) * 5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    for (let x = 0; x <= LOGICAL_W; x += 36) {
      const wy = waveY + Math.sin(x * 0.03 + tSec * 2.4) * 5;
      if (x === 0) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();
  }
  else if (zid === 'flower_villa') {
    // ================= [플라워 아일랜드 : 별장 안 — 햇살이 가득 들어오는 밝고 화사한 고급 휴양지 별장 실내] =================
    // 1) 밝고 따뜻한 허니 오크 마룻바닥(Warm Honey-Oak Parquet)
    const floorGrad = ctx.createLinearGradient(0, 118, 0, LOGICAL_H);
    floorGrad.addColorStop(0, '#e6ccb2');
    floorGrad.addColorStop(0.5, '#ddb892');
    floorGrad.addColorStop(1, '#c89f78');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    // 마룻바닥 나무결 라인 (밝은 브라운 톤)
    ctx.strokeStyle = 'rgba(156, 102, 68, 0.28)';
    ctx.lineWidth = 2;
    for (let y = 126; y < LOGICAL_H; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(LOGICAL_W, y); ctx.stroke();
    }
    for (let x = 60; x < LOGICAL_W; x += 90) {
      ctx.beginPath(); ctx.moveTo(x, 120); ctx.lineTo(x, LOGICAL_H); ctx.stroke();
    }

    // 2) 상단 아이보리·크림 웨인스코팅 벽면 & 대형 오션뷰 아치 창문 3개
    const wallGrad = ctx.createLinearGradient(0, 0, 0, 120);
    wallGrad.addColorStop(0, '#fffdf9');
    wallGrad.addColorStop(1, '#f5ebe0');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, LOGICAL_W, 120);

    // 벽면 웨인스코팅 몰딩 & 골드 하단 걸레받이
    ctx.strokeStyle = '#d5bdaf';
    ctx.lineWidth = 2;
    for (let wx = 24; wx < LOGICAL_W - 40; wx += 110) {
      ctx.strokeRect(wx, 14, 92, 92);
    }
    ctx.fillStyle = '#b08968';
    ctx.fillRect(0, 114, LOGICAL_W, 7);

    // 푸른 바다와 꽃 정원이 내다보이는 대형 채광창 2개 + 바닥에 쏟아지는 따스한 햇살(Sunbeams)
    for (const winX of [275, 535]) {
      ctx.fillStyle = '#7dd3fc';
      ctx.strokeStyle = '#b08968';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(winX, 18, 86, 74, 10);
      ctx.fill();
      ctx.stroke();
      // 창밖 수평선 & 흰 구름
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(winX + 2, 64, 82, 26);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(winX + 28, 38, 10, 0, Math.PI * 2);
      ctx.arc(winX + 40, 36, 12, 0, Math.PI * 2);
      ctx.fill();
      // 창살
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(winX + 43, 18); ctx.lineTo(winX + 43, 92);
      ctx.moveTo(winX, 55); ctx.lineTo(winX + 86, 55);
      ctx.stroke();

      // 마룻바닥으로 환하게 퍼지는 햇살 그라데이션
      const sunGrad = ctx.createLinearGradient(winX, 95, winX + 40, 290);
      sunGrad.addColorStop(0, 'rgba(254, 249, 195, 0.42)');
      sunGrad.addColorStop(1, 'rgba(254, 249, 195, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.moveTo(winX, 95);
      ctx.lineTo(winX + 86, 95);
      ctx.lineTo(winX + 135, 290);
      ctx.lineTo(winX - 25, 290);
      ctx.closePath();
      ctx.fill();
    }

    // 3) 별장 중앙 화사한 로즈·아이보리 실크 카페트(Luxury Villa Carpet)
    ctx.fillStyle = '#fff1f2';
    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(195, 200, 510, 235, 22);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(210, 214, 480, 207, 16);
    ctx.stroke();

    // 카페트 중앙 플라워 엠블럼 장식
    ctx.fillStyle = 'rgba(244, 114, 182, 0.22)';
    ctx.beginPath();
    ctx.arc(450, 318, 48, 0, Math.PI * 2);
    ctx.fill();
  }
    else if (zid === 'home_interior') {
    // 1) 따뜻한 오크 원목 마룻바닥 & 상단 목조 벽면(Wainscot Wall)
    ctx.fillStyle = '#2b1910';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    // 상단 실내 벽면
    const wallGrad = ctx.createLinearGradient(0, 0, 0, 118);
    wallGrad.addColorStop(0, '#3e2415');
    wallGrad.addColorStop(1, '#1e110a');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, LOGICAL_W, 118);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 114, LOGICAL_W, 6);

    // 창문 2개 (따뜻한 햇살이 들어오는 실내 창문)
    for (const wx of [310, 565]) {
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(wx, 24, 56, 62, 6);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(wx + 28, 24); ctx.lineTo(wx + 28, 86);
      ctx.moveTo(wx, 55); ctx.lineTo(wx + 56, 55);
      ctx.stroke();
      // 창문 너머로 비치는 부드러운 햇살
      ctx.fillStyle = 'rgba(254, 240, 138, 0.08)';
      ctx.beginPath();
      ctx.moveTo(wx, 86); ctx.lineTo(wx + 56, 86);
      ctx.lineTo(wx + 90, 220); ctx.lineTo(wx - 20, 220);
      ctx.closePath();
      ctx.fill();
    }

    // 마룻바닥 널빤지 결
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.42)';
    ctx.lineWidth = 2;
    for (let y = 120; y < LOGICAL_H; y += 34) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(LOGICAL_W, y); ctx.stroke();
    }

    // 2) 중앙 자수 양탄자(Hearth Rug) & 원목 식탁 세트
    ctx.fillStyle = 'rgba(153, 27, 27, 0.55)';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(220, 215, 380, 200, 16);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(232, 227, 356, 176, 12);
    ctx.stroke();

    // 티테이블 및 실내 화분은 물리 충돌이 적용되는 z.obstacles 오브젝트로 렌더링됨
  }
  else if (zid === 'coastal_road_1' || zid === 'coastal_road_2' || zid === 'coastal_road_3') {
    const cGrad = ctx.createLinearGradient(0, 0, 0, LOGICAL_H);
    cGrad.addColorStop(0, z.bgPrimary);
    cGrad.addColorStop(0.62, '#c29b61');
    cGrad.addColorStop(0.82, '#0ea5e9');
    cGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = cGrad;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    const waveY = 490 + Math.sin(tSec * 2.2) * 8;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.fillRect(0, waveY, LOGICAL_W, 120);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= LOGICAL_W; x += 40) {
      const wy = waveY + Math.sin(x * 0.03 + tSec * 2.5) * 6;
      if (x === 0) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();
  }
  else if (zid === 'orc_canyon_1' || zid === 'orc_stronghold_2' || zid === 'abyssal_altar') {
    const oGrad = ctx.createRadialGradient(450, 300, 60, 450, 300, 520);
    oGrad.addColorStop(0, z.bgSecondary);
    oGrad.addColorStop(1, z.bgPrimary);
    ctx.fillStyle = oGrad;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    ctx.save();
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.45)';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(140, 120); ctx.lineTo(290, 210); ctx.lineTo(420, 175);
    ctx.moveTo(580, 460); ctx.lineTo(710, 390); ctx.lineTo(810, 440);
    ctx.stroke();
    if (zid === 'abyssal_altar') {
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.38)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(450, 300, 145, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  else if (zid === 'minatomachi') {
    // ================= [타이리쿠쇼토노 오자토 「미나토마치」: 밝고 화사한 일본풍 에도시대 항구 마을 & 푸른 바다] =================
    // 1) 따스한 봄 햇살이 내리쬐는 에도시대 화강암·황토 판석 광장 & 남쪽 푸른 에도만 바다 그라데이션
    const edoGrad = ctx.createLinearGradient(0, 0, 0, LOGICAL_H);
    edoGrad.addColorStop(0.0, '#f3e5ab');   // 상단 햇살 비치는 에도 거리
    edoGrad.addColorStop(0.22, '#efe2c6');  // 밝은 회백/황토 석조 광장
    edoGrad.addColorStop(0.60, '#e2ceb0');  // 항구 방파제 앞 거리
    edoGrad.addColorStop(0.66, '#d4b483');  // 해안 모래·자갈 나루터
    edoGrad.addColorStop(0.75, '#38bdf8');  // 얕은 에메랄드빛 항구 바닷물
    edoGrad.addColorStop(0.88, '#0284c7');  // 청량한 코발트 블루 바다
    edoGrad.addColorStop(1.0, '#0369a1');   // 깊은 에도만 외해
    ctx.fillStyle = edoGrad;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    ctx.save();
    // 2) 에도시대 전통 석조 판석(Tatami-stone Grid) 포장도로 & 중앙 벚꽃 문양 원형 광장
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.14)';
    ctx.lineWidth = 1.2;
    for (let x = 0; x <= LOGICAL_W; x += 48) {
      ctx.beginPath(); ctx.moveTo(x, 55); ctx.lineTo(x, 378); ctx.stroke();
    }
    for (let y = 60; y <= 378; y += 36) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(LOGICAL_W, y); ctx.stroke();
    }

    // 동서대로 황토 포석 길 (키리시마·항해사·상인을 잇는 밝은 중앙 대로)
    ctx.fillStyle = 'rgba(254, 243, 199, 0.55)';
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.30)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(45, 250, 810, 84, 18);
    ctx.fill();
    ctx.stroke();

    // 광장 중앙 에도 가몬(벚꽃 문장) 석조 모자이크
    ctx.save();
    ctx.translate(458, 292);
    ctx.fillStyle = 'rgba(255, 241, 242, 0.65)';
    ctx.beginPath();
    ctx.arc(0, 0, 68, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.40)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    for (let a = 0; a < 5; a++) {
      ctx.save();
      ctx.rotate((a * Math.PI * 2) / 5);
      ctx.fillStyle = 'rgba(251, 113, 133, 0.32)';
      ctx.beginPath();
      ctx.ellipse(0, -34, 12, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // 3) 상단 에도시대 목조 담장 & 붉은 종이 제등(Chochin 홍등) 가로수길 & 만개한 벚꽃(Sakura) 수관
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 0, LOGICAL_W, 48);
    ctx.fillStyle = '#fffbeb';
    ctx.fillRect(0, 14, LOGICAL_W, 28);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    for (let wx = 0; wx < LOGICAL_W; wx += 45) {
      ctx.strokeRect(wx, 14, 45, 28);
    }
    // 기와 담장 지붕
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 8, LOGICAL_W, 9);

    // 상단 좌·우에 만개한 화사한 분홍 벚꽃 나무(Blooming Sakura Trees)
    const sakuraClusters = [
      [55, 34, 44], [115, 28, 38], [170, 32, 34],
      [355, 26, 36], [455, 24, 42], [510, 28, 34],
      [685, 28, 38], [750, 32, 44], [825, 30, 42], [875, 36, 38]
    ];
    for (let i = 0; i < sakuraClusters.length; i++) {
      const [sx, sy, sr] = sakuraClusters[i];
      const sway = Math.sin(tSec * 1.5 + i * 0.8) * 2.0;
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.arc(sx + sway, sy, sr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.arc(sx - 6 + sway, sy - 4, sr * 0.72, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff1f2';
      ctx.beginPath();
      ctx.arc(sx - 10 + sway, sy - 8, sr * 0.38, 0, Math.PI * 2);
      ctx.fill();
    }

    // 거리 곳곳에 걸린 에도 홍등(Red Chochin Lanterns)
    for (let lx = 90; lx <= 810; lx += 120) {
      const bob = Math.sin(tSec * 2.4 + lx * 0.02) * 1.5;
      ctx.fillStyle = 'rgba(251, 191, 36, 0.24)';
      ctx.beginPath();
      ctx.arc(lx, 56 + bob, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(lx, 56 + bob, 7, 9.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(lx - 2.5, 53 + bob, 5, 6);
    }

    // 4) 에도시대 성벽 양식 화강암 방파제(Ishigaki Seawall) & 목조 난간
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 376, LOGICAL_W, 20);
    ctx.fillStyle = '#cbd5e1';
    for (let bx = 6; bx < LOGICAL_W; bx += 46) {
      ctx.fillRect(bx, 379, 38, 13);
    }
    // 중앙 선착장 돌계단
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(410, 374, 96, 26);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    for (let sy = 379; sy <= 397; sy += 6) {
      ctx.beginPath(); ctx.moveTo(410, sy); ctx.lineTo(506, sy); ctx.stroke();
    }

    // 5) 햇살에 반짝이는 푸른 미나토마치 바다 & 우키요에풍 흰 파도 물결 애니메이션
    for (let w = 0; w < 3; w++) {
      const waveOffset = Math.sin(tSec * 2.0 + w * 1.3) * 7;
      const baseY = 458 + w * 40 + waveOffset;
      ctx.fillStyle = w === 0 ? 'rgba(56, 189, 248, 0.50)' : (w === 1 ? 'rgba(14, 165, 233, 0.62)' : 'rgba(2, 132, 199, 0.76)');
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      for (let x = 0; x <= LOGICAL_W; x += 40) {
        const cy = baseY + Math.sin(x * 0.028 + tSec * 2.3 + w) * 6.5;
        ctx.lineTo(x, cy);
      }
      ctx.lineTo(LOGICAL_W, LOGICAL_H);
      ctx.lineTo(0, LOGICAL_H);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.lineWidth = w === 0 ? 3.2 : 2.2;
      ctx.beginPath();
      for (let x = 0; x <= LOGICAL_W; x += 28) {
        const cy = baseY + Math.sin(x * 0.028 + tSec * 2.3 + w) * 6.5;
        if (x === 0) ctx.moveTo(x, cy);
        else ctx.lineTo(x, cy);
      }
      ctx.stroke();
    }

    // 6) 우측 에도시대 삼나무 목조 잔교 부두(Edo Wooden Pier) & 정박 중인 주인선/범선
    ctx.fillStyle = '#78350f';
    ctx.fillRect(650, 386, 115, 152);
    ctx.fillStyle = '#b45309';
    for (let py = 392; py < 532; py += 12) {
      ctx.fillRect(655, py, 105, 8);
    }
    // 부두 기둥 말뚝 & 등불
    ctx.fillStyle = '#451a03';
    ctx.fillRect(656, 388, 10, 14);
    ctx.fillRect(748, 388, 10, 14);
    ctx.fillRect(656, 520, 10, 14);
    ctx.fillRect(748, 520, 10, 14);

    const shipBob = Math.sin(tSec * 1.8) * 3.0;
    const shipSpr = getHD64Sprite('harbor_ship');
    ctx.drawImage(shipSpr, 745, 352 + shipBob, 148, 148);

    // 바다 윤슬(Sea Sparkles) & 봄바람에 흩날리는 벚꽃잎(Sakura Petals)
    for (let s = 0; s < 16; s++) {
      const sx = (s * 63 + 35) % 860;
      const sy = 468 + ((s * 39) % 110);
      if (Math.sin(tSec * 3.4 + s) > 0.15) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.90)';
        ctx.fillRect(sx - 4, sy - 1, 8, 2);
        ctx.fillRect(sx - 1, sy - 4, 2, 8);
      }
    }
    for (let p = 0; p < 24; p++) {
      const px = (p * 57 + Math.floor(tSec * 32) + p * 19) % 880;
      const py = 45 + ((p * 37 + Math.floor(Math.sin(tSec * 1.6 + p) * 16)) % 330);
      ctx.fillStyle = p % 3 === 0 ? '#fff1f2' : '#fda4af';
      ctx.beginPath();
      ctx.ellipse(px, py, 4.2, 2.3, tSec + p, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  else if (zid === 'pirate_ship_1' || zid === 'pirate_ship_2' || zid === 'pirate_queen_office' || zid === 'vs_pirate_queen') {
    // ================= [해적의 대형 선박 내부 01~02 / 해적 여왕의 집무실 / vs 해적 여왕 — 실제 대형 목조 범선 선실 내부] =================
    const isQueenRoom = (zid === 'pirate_queen_office' || zid === 'vs_pirate_queen');
    // 1) 중후한 마호가니·티크 원목 선박 갑판 마룻바닥(Mahogany Ship Deck Planks)
    const deckGrad = ctx.createLinearGradient(0, 80, 0, LOGICAL_H - 60);
    if (isQueenRoom) {
      deckGrad.addColorStop(0, '#3b1728');
      deckGrad.addColorStop(0.5, '#4c1d34');
      deckGrad.addColorStop(1, '#2d101e');
    } else {
      deckGrad.addColorStop(0, '#3e2415');
      deckGrad.addColorStop(0.5, '#4e2e1b');
      deckGrad.addColorStop(1, '#2b180e');
    }
    ctx.fillStyle = deckGrad;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    ctx.save();
    // 가로 갑판 널빤지 이음새 & 황동 대못(Deck Plank Seams & Studs)
    ctx.strokeStyle = 'rgba(20, 10, 5, 0.55)';
    ctx.lineWidth = 2;
    for (let y = 92; y < 536; y += 28) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(LOGICAL_W, y); ctx.stroke();
      for (let x = 45 + (y % 56); x < LOGICAL_W; x += 90) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 28); ctx.stroke();
        ctx.fillStyle = 'rgba(251, 191, 36, 0.28)';
        ctx.fillRect(x - 4, y + 4, 2, 2);
        ctx.fillRect(x + 3, y + 22, 2, 2);
      }
    }

    // 2) 상단·하단 곡선형 목조 선체 외벽(Ship Hull Bulkheads) & 늑골 기둥(Hull Ribs)
    const wallGradTop = ctx.createLinearGradient(0, 0, 0, 88);
    wallGradTop.addColorStop(0, '#1c1008');
    wallGradTop.addColorStop(0.7, '#321c10');
    wallGradTop.addColorStop(1, '#452615');
    ctx.fillStyle = wallGradTop;
    ctx.fillRect(0, 0, LOGICAL_W, 88);

    // 상단 난간 몰딩 & 황동 장식띠
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 82, LOGICAL_W, 8);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, 84, LOGICAL_W, 2.5);

    // 하단 선체 난간 벽면(Lower Ship Hull Bulwark)
    const wallGradBot = ctx.createLinearGradient(0, 536, 0, LOGICAL_H);
    wallGradBot.addColorStop(0, '#452615');
    wallGradBot.addColorStop(0.3, '#2b170d');
    wallGradBot.addColorStop(1, '#140b06');
    ctx.fillStyle = wallGradBot;
    ctx.fillRect(0, 536, LOGICAL_W, 64);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 534, LOGICAL_W, 7);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, 536, LOGICAL_W, 2);

    // 선체 외벽을 지탱하는 굵은 목조 늑골 기둥(Curved Timber Ribs)
    ctx.fillStyle = '#271409';
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 1.5;
    for (let rx = 55; rx < LOGICAL_W; rx += 130) {
      ctx.fillRect(rx, 0, 16, 88);
      ctx.strokeRect(rx, 0, 16, 88);
      ctx.fillRect(rx, 536, 16, 64);
      ctx.strokeRect(rx, 536, 16, 64);
    }

    if (isQueenRoom) {
      // ★ 해적 여왕의 집무실 / 결전 선장실: 대형 아치형 선미 오션뷰 창문(Grand Stern Cabin Windows) 3개
      for (const winX of [190, 410, 630]) {
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.roundRect(winX, 14, 84, 58, 12);
        ctx.fill();
        ctx.stroke();
        // 창밖 푸른 밤바다 수평선과 달빛 윤슬
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(winX + 2, 46, 80, 24);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(winX + 24, 52, 36, 3);
        // 금장 다이아몬드 창살
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(winX + 42, 14); ctx.lineTo(winX + 42, 72);
        ctx.moveTo(winX, 43); ctx.lineTo(winX + 84, 43);
        ctx.stroke();
        // 바닥에 드리우는 푸른 바다 달빛과 황금 샹들리에 광선
        const beamGrad = ctx.createLinearGradient(winX, 74, winX + 30, 230);
        beamGrad.addColorStop(0, 'rgba(125, 211, 252, 0.25)');
        beamGrad.addColorStop(1, 'rgba(125, 211, 252, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(winX, 74); ctx.lineTo(winX + 84, 74);
        ctx.lineTo(winX + 115, 230); ctx.lineTo(winX - 20, 230);
        ctx.closePath();
        ctx.fill();
      }

      // 선장실 중앙 화려한 진홍·황금 벨벳 카펫(Royal Captain's Carpet)
      const rugGrad = ctx.createLinearGradient(170, 190, 730, 430);
      rugGrad.addColorStop(0, '#881337');
      rugGrad.addColorStop(0.5, '#9f1239');
      rugGrad.addColorStop(1, '#4c0519');
      ctx.fillStyle = rugGrad;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(175, 195, 550, 230, 18);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(190, 208, 520, 204, 12);
      ctx.stroke();

      // 카펫 중앙 해적 여왕의 해왕 나침반 엠블럼
      ctx.save();
      ctx.translate(450, 310);
      ctx.strokeStyle = zid === 'vs_pirate_queen' ? 'rgba(56, 189, 248, 0.55)' : 'rgba(251, 191, 36, 0.40)';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.arc(0, 0, 64, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else {
      // ★ 해적의 대형 선박 내부 01~02 (포갑판 복도): 바다 밖이 보이는 황동 원형 현창(Brass Portholes) 4개
      for (const px of [135, 325, 585, 775]) {
        const seaShift = Math.sin(tSec * 2.0 + px * 0.01) * 3;
        // 현창 밖 바다
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(px, 42, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(px, 46 + seaShift, 18, 0, Math.PI);
        ctx.fill();
        // 황동 현창 프레임 & 리벳
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.arc(px, 42, 22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px - 22, 42); ctx.lineTo(px + 22, 42);
        ctx.moveTo(px, 20); ctx.lineTo(px, 64);
        ctx.stroke();
        // 현창에서 갑판으로 비치는 푸른 바닷빛
        const pGlow = ctx.createLinearGradient(px, 66, px + 20, 195);
        pGlow.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
        pGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = pGlow;
        ctx.beginPath();
        ctx.moveTo(px - 18, 66); ctx.lineTo(px + 18, 66);
        ctx.lineTo(px + 42, 195); ctx.lineTo(px - 32, 195);
        ctx.closePath();
        ctx.fill();
      }

      // 포갑판 상·하단 해적 함포(Pirate Ship Cannons) & 포탄 더미
      for (const cx of [225, 455, 685]) {
        // 상단 함포 대차 & 포신
        ctx.fillStyle = '#78350f';
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 1.5;
        ctx.fillRect(cx - 16, 78, 32, 24);
        ctx.strokeRect(cx - 16, 78, 32, 24);
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(cx - 9, 68, 18, 38, 5);
        ctx.fill();
        ctx.stroke();
        // 하단 함포 대차 & 포신
        ctx.fillStyle = '#78350f';
        ctx.fillRect(cx - 16, 514, 32, 24);
        ctx.strokeRect(cx - 16, 514, 32, 24);
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(cx - 9, 508, 18, 38, 5);
        ctx.fill();
        ctx.stroke();
      }

      // 갑판 중앙 대형 선창 통풍 격자 해치(Wooden Cargo Hatch Grating)
      ctx.fillStyle = '#1c1008';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(365, 235, 170, 130, 8);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#5c3419';
      ctx.lineWidth = 3;
      for (let gx = 385; gx < 525; gx += 22) {
        ctx.beginPath(); ctx.moveTo(gx, 239); ctx.lineTo(gx, 361); ctx.stroke();
      }
      for (let gy = 255; gy < 355; gy += 22) {
        ctx.beginPath(); ctx.moveTo(369, gy); ctx.lineTo(531, gy); ctx.stroke();
      }
    }
    ctx.restore();
  }
  else if (zid === 'beer_cave_1' || zid === 'beer_cave_2' || zid === 'beer_cave_3' || zid === 'erik_room' || zid === 'ragnar_room') {
    // ================= [비어 케이브 01~03 / 에리크의 방 / 라그나르의 방 — 거친 바이킹 암벽 동굴 & 대연회장] =================
    const cGrad = ctx.createRadialGradient(450, 300, 70, 450, 300, 520);
    cGrad.addColorStop(0, z.bgSecondary);
    cGrad.addColorStop(1, z.bgPrimary);
    ctx.fillStyle = cGrad;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    ctx.save();
    // 동굴 중앙 석조 통로 / 바이킹 홀 러그
    if (zid === 'ragnar_room' || zid === 'erik_room') {
      ctx.fillStyle = zid === 'erik_room' ? 'rgba(153, 27, 27, 0.38)' : 'rgba(180, 83, 9, 0.34)';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(150, 175, 600, 250, 16);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.24)';
      ctx.lineWidth = 54;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(75, 300);
      ctx.lineTo(815, 300);
      ctx.stroke();
    }

    // 상·하단 거친 동굴 암벽(Cavern Rock Formations — 초록 숲 원을 암벽으로 대체)
    for (let x = 25; x < 890; x += 58) {
      ctx.fillStyle = '#1c1917';
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 28, 0);
      ctx.lineTo(x - 14, 42 + (x % 12));
      ctx.lineTo(x + 12, 38 - (x % 10));
      ctx.lineTo(x + 28, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x - 28, LOGICAL_H);
      ctx.lineTo(x - 14, LOGICAL_H - 42 - (x % 12));
      ctx.lineTo(x + 12, LOGICAL_H - 38 + (x % 10));
      ctx.lineTo(x + 28, LOGICAL_H);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
  else if (zid === 'pirate_path_1' || zid === 'pirate_path_2') {
    // ================= [해적들의 길목 01~02 — 해안 암초 절벽 길 & 밤바다 파도] =================
    const pGrad = ctx.createLinearGradient(0, 0, 0, LOGICAL_H);
    pGrad.addColorStop(0, '#0f172a');
    pGrad.addColorStop(0.75, '#1e293b');
    pGrad.addColorStop(0.88, '#0c4a6e');
    pGrad.addColorStop(1, '#082f49');
    ctx.fillStyle = pGrad;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
    ctx.lineWidth = 52;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(75, 300);
    ctx.lineTo(815, 300);
    ctx.stroke();

    // 상단 해안 기암절벽 바위
    ctx.fillStyle = '#090d16';
    for (let x = 30; x < 880; x += 62) {
      ctx.beginPath();
      ctx.arc(x, 18, 30, 0, Math.PI * 2);
      ctx.fill();
    }
    // 하단 밤바다 파도 물결
    const waveY = 535 + Math.sin(tSec * 2.1) * 5;
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.65)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 0; x <= LOGICAL_W; x += 36) {
      const wy = waveY + Math.sin(x * 0.03 + tSec * 2.4) * 5;
      if (x === 0) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();
    ctx.restore();
  }
  else {
    const fGrad = ctx.createRadialGradient(450, 300, 80, 450, 300, 520);
    fGrad.addColorStop(0, z.bgSecondary);
    fGrad.addColorStop(1, z.bgPrimary);
    ctx.fillStyle = fGrad;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    ctx.strokeStyle = 'rgba(161, 98, 7, 0.25)';
    ctx.lineWidth = 44;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(75, 300);
    ctx.lineTo(815, 300);
    ctx.stroke();

    ctx.fillStyle = 'rgba(4, 24, 14, 0.65)';
    for (let x = 40; x < 880; x += 65) {
      ctx.beginPath();
      ctx.arc(x, 18, 34, 0, Math.PI * 2);
      ctx.arc(x, 582, 34, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
