// ============================================================================
// [graphics/characterRenderer.js] 512×512 2.5D 입체 도트 캐릭터 & NPC 렌더러
//  - 남녀 캐릭터 체형(A~E컵 글래머 누님 체형 및 거친 바이킹 전사 근육질 체형 포함),
//    헤어스타일, 복식, 헤드기어, 무장 및 셀 셰이딩 입체 음영 렌더링
// ============================================================================
function drawSubcultureSDCharacter(g, cfg) {
  const gender = cfg.gender || 'male';
  const isFemale = gender === 'female';
  const cupSize = cfg.cupSize || 'C'; // 'A' | 'B' | 'C' | 'D' | 'E'
  const isGlamorous = Boolean(cfg.glamorous || cupSize === 'E');
  const isViking = Boolean(
    cfg.build === 'viking_warrior' ||
    cfg.headgear === 'horned_helm' ||
    cfg.headgear === 'viking_crown'
  );
  const eyeType = cfg.eyeType || (isFemale ? 'rio_chic' : 'diluc_sharp');
  const skin = cfg.skin || (isFemale ? '#fff2e8' : (isViking ? '#f3cfb3' : '#fce3d2'));
  const skinMid = cfg.skinMid || (isFemale ? '#f7d6c4' : (isViking ? '#e2b08a' : '#f0c4a8'));
  const skinShadow = cfg.skinShadow || (isFemale ? '#e0a890' : (isViking ? '#c58960' : '#d49876'));
  const skinDeep = '#9c5a49';
  const skinLine = '#422320';
  const clothLine = '#191424';
  const hair = cfg.hair || '#38bdf8';
  const hairShade = cfg.hairShade || shadeHexColor(hair, -0.32);
  const hairDeep = shadeHexColor(hair, -0.55);
  const hairLight = shadeHexColor(hair, 0.45);
  const eyeColor = cfg.eye || '#2563eb';
  const eyeLight = cfg.eyeLight || shadeHexColor(eyeColor, 0.48);
  const eyeDark = shadeHexColor(eyeColor, -0.55);
  const outfitMain = cfg.outfitMain || '#1e293b';
  const outfitMainDark = shadeHexColor(outfitMain, -0.42);
  const outfitMainLight = shadeHexColor(outfitMain, 0.28);
  const outfitSub = cfg.outfitSub || '#38bdf8';
  const outfitSubDark = shadeHexColor(outfitSub, -0.35);
  const outfitSubLight = shadeHexColor(outfitSub, 0.35);
  const trimGold = cfg.trimGold || '#fbbf24';
  const capeColor = cfg.cape;
  const hairStyle = cfg.hairStyle || (isFemale ? 'long_wave' : 'sleek_layered');

  // =========================================================================
  // 캐릭터 체형 프로파일 정의 (어깨·허리·스커트 비율 및 상체 실루엣 설정)
  // =========================================================================
  const bodyProfiles = {
    'A': { shoulderW: 10.4, waistW: 7.4, hipW: 13.5, torsoY: 49, waistY: 64, legY: 78, bustLiftY: 55.5, bustDepth: 0.0, sideCurve: 0.0 },
    'B': { shoulderW: 10.8, waistW: 7.5, hipW: 14.2, torsoY: 49, waistY: 64, legY: 78, bustLiftY: 56.2, bustDepth: 1.4, sideCurve: 0.8 },
    'C': { shoulderW: 11.0, waistW: 7.5, hipW: 15.2, torsoY: 49, waistY: 65, legY: 79, bustLiftY: 57.0, bustDepth: 2.8, sideCurve: 1.8 },
    'D': { shoulderW: 11.3, waistW: 7.1, hipW: 16.8, torsoY: 49, waistY: 65, legY: 79, bustLiftY: 57.8, bustDepth: 4.8, sideCurve: 3.4 },
    'E': { shoulderW: 11.6, waistW: 6.6, hipW: 18.4, torsoY: 48.5, waistY: 65.5, legY: 79.5, bustLiftY: 58.4, bustDepth: 6.5, sideCurve: 4.9 }
  };
  const bp = bodyProfiles[cupSize] || bodyProfiles['C'];

  // 0. 3D 바닥 그림자
  g.fillStyle = 'rgba(9, 13, 22, 0.32)';
  g.beginPath();
  g.ellipse(64, 114, isViking ? 26 : 23, 6.0, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'rgba(9, 13, 22, 0.55)';
  g.beginPath();
  g.ellipse(64, 114, isViking ? 16 : 14, 3.8, 0, 0, Math.PI * 2);
  g.fill();

  // 1. 헤일로(Halo)
  if (cfg.haloColor) {
    g.save();
    g.strokeStyle = cfg.haloColor;
    g.lineWidth = 1.5;
    g.beginPath();
    g.ellipse(64, 4.5, 13, 3.0, 0, 0, Math.PI * 2);
    g.stroke();
    g.restore();
  }

  // 2. 망토 / 코트 뒷자락
  if (capeColor) {
    g.save();
    const capeDark = shadeHexColor(capeColor, -0.48);
    const capeGrad = g.createLinearGradient(34, 48, 94, 108);
    capeGrad.addColorStop(0, capeColor);
    capeGrad.addColorStop(0.55, shadeHexColor(capeColor, -0.22));
    capeGrad.addColorStop(1, capeDark);
    g.fillStyle = capeGrad;
    g.strokeStyle = clothLine;
    g.lineWidth = 1.5;
    const capeSpread = isViking ? 5 : (isGlamorous ? 3 : 0);
    g.beginPath();
    g.moveTo(49 - capeSpread * 0.5, 50);
    g.bezierCurveTo(36 - capeSpread, 70, 33 - capeSpread, 92, 36 - capeSpread, 106);
    g.quadraticCurveTo(64, 111, 92 + capeSpread, 106);
    g.bezierCurveTo(95 + capeSpread, 92, 92 + capeSpread, 70, 79 + capeSpread * 0.5, 50);
    g.closePath();
    g.fill();
    g.stroke();

    g.fillStyle = 'rgba(9, 13, 22, 0.28)';
    g.beginPath();
    g.moveTo(53, 56); g.lineTo(44 - capeSpread * 0.5, 105); g.lineTo(52, 106); g.closePath();
    g.moveTo(75, 56); g.lineTo(76, 106); g.lineTo(84 + capeSpread * 0.5, 105); g.closePath();
    g.fill();

    g.strokeStyle = trimGold;
    g.lineWidth = 1.1;
    g.beginPath();
    g.moveTo(39 - capeSpread, 103.5);
    g.quadraticCurveTo(64, 107.5, 89 + capeSpread, 103.5);
    g.stroke();
    g.restore();
  }

  // 3. 후면 헤어
  g.save();
  const backHairGrad = g.createLinearGradient(40, 20, 88, 96);
  backHairGrad.addColorStop(0, hairShade);
  backHairGrad.addColorStop(0.5, hairDeep);
  backHairGrad.addColorStop(1, '#0f172a');
  g.fillStyle = backHairGrad;
  g.strokeStyle = clothLine;
  g.lineWidth = 1.5;

  if (isFemale) {
    if (hairStyle === 'long_wave' || hairStyle === 'pirate_waves' || hairStyle === 'coral_waves' || hairStyle === 'princess_curls') {
      const waveWiden = isGlamorous ? 4 : 0;
      g.beginPath();
      g.moveTo(43, 27);
      g.bezierCurveTo(31 - waveWiden, 46, 29 - waveWiden, 74, 36 - waveWiden, 98);
      g.lineTo(42 - waveWiden * 0.5, 90);
      g.lineTo(46, 98);
      g.quadraticCurveTo(64, 103, 82, 98);
      g.lineTo(86 + waveWiden * 0.5, 90);
      g.lineTo(92 + waveWiden, 98);
      g.bezierCurveTo(99 + waveWiden, 74, 97 + waveWiden, 46, 85, 27);
      g.closePath();
      g.fill();
      g.stroke();
      g.fillStyle = hair;
      g.beginPath();
      g.moveTo(43, 34);
      g.bezierCurveTo(35 - waveWiden * 0.6, 52, 34 - waveWiden * 0.6, 72, 38 - waveWiden * 0.5, 92);
      g.bezierCurveTo(41, 74, 41, 54, 46, 38);
      g.closePath();
      g.fill();
      if (isGlamorous) {
        g.beginPath();
        g.moveTo(85, 34);
        g.bezierCurveTo(93 + waveWiden * 0.6, 52, 94 + waveWiden * 0.6, 72, 90 + waveWiden * 0.5, 92);
        g.bezierCurveTo(87, 74, 87, 54, 82, 38);
        g.closePath();
        g.fill();
      }
    } else if (hairStyle === 'twintail') {
      const ttLeftGrad = g.createLinearGradient(20, 28, 42, 85);
      ttLeftGrad.addColorStop(0, hairLight);
      ttLeftGrad.addColorStop(0.4, hair);
      ttLeftGrad.addColorStop(1, hairShade);
      g.fillStyle = ttLeftGrad;
      g.beginPath();
      g.moveTo(44, 26);
      g.bezierCurveTo(24, 28, 16, 56, 22, 84);
      g.lineTo(28, 78);
      g.lineTo(32, 85);
      g.bezierCurveTo(34, 62, 38, 44, 46, 34);
      g.closePath();
      g.fill();
      g.stroke();

      const ttRightGrad = g.createLinearGradient(84, 28, 108, 85);
      ttRightGrad.addColorStop(0, hair);
      ttRightGrad.addColorStop(0.6, hairShade);
      ttRightGrad.addColorStop(1, hairDeep);
      g.fillStyle = ttRightGrad;
      g.beginPath();
      g.moveTo(84, 26);
      g.bezierCurveTo(104, 28, 112, 56, 106, 84);
      g.lineTo(100, 78);
      g.lineTo(96, 85);
      g.bezierCurveTo(94, 62, 90, 44, 82, 34);
      g.closePath();
      g.fill();
      g.stroke();

      drawRoundPart(g, 43, 28, 4, 2.8, -0.35, outfitSub, clothLine, 1.2);
      drawRoundPart(g, 85, 28, 4, 2.8, 0.35, outfitSubDark, clothLine, 1.2);
    } else if (hairStyle === 'ponytail') {
      const ptGrad = g.createLinearGradient(74, 21, 102, 76);
      ptGrad.addColorStop(0, hair);
      ptGrad.addColorStop(0.6, hairShade);
      ptGrad.addColorStop(1, hairDeep);
      g.fillStyle = ptGrad;
      g.beginPath();
      g.moveTo(74, 21);
      g.bezierCurveTo(95, 22, 105, 48, 97, 76);
      g.lineTo(90, 70);
      g.lineTo(86, 76);
      g.bezierCurveTo(88, 52, 82, 36, 72, 28);
      g.closePath();
      g.fill();
      g.stroke();
      drawRoundPart(g, 76, 23, 4, 3, 0.2, outfitSub, clothLine, 1.2);
    } else if (hairStyle === 'braid_updo') {
      g.beginPath();
      g.arc(64, 27, 21, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.fillStyle = hair;
      g.beginPath();
      g.moveTo(77, 38);
      g.bezierCurveTo(89, 48, 88, 66, 82, 76);
      g.quadraticCurveTo(75, 68, 74, 42);
      g.closePath();
      g.fill();
      g.stroke();
    }
  } else if (isViking) {
    // 바이킹 전사의 거친 장발 뒷머리 갈기
    g.fillStyle = hairShade;
    g.beginPath();
    g.moveTo(41, 28);
    g.lineTo(35, 50);
    g.lineTo(42, 48);
    g.lineTo(45, 54);
    g.lineTo(83, 54);
    g.lineTo(86, 48);
    g.lineTo(93, 50);
    g.lineTo(87, 28);
    g.closePath();
    g.fill();
    g.stroke();
  } else {
    g.beginPath();
    g.moveTo(45, 30);
    g.lineTo(43, 44);
    g.lineTo(85, 44);
    g.lineTo(83, 30);
    g.closePath();
    g.fill();
    g.stroke();
  }
  g.restore();

  // 4. 하체 및 각반/부츠 렌더링
  if (isFemale) {
    const legStyle = cfg.legStyle || 'thigh_boots';
    if (legStyle === 'long_gown') {
      g.save();
      const gownGrad = g.createLinearGradient(40, bp.waistY, 88, 111);
      gownGrad.addColorStop(0, outfitMainLight);
      gownGrad.addColorStop(0.45, outfitMain);
      gownGrad.addColorStop(1, outfitMainDark);
      g.fillStyle = gownGrad;
      g.strokeStyle = clothLine;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(64 - bp.waistW, bp.waistY);
      g.bezierCurveTo(64 - bp.hipW - 4, bp.waistY + 12, 38, 98, 40, 111);
      g.quadraticCurveTo(64, 115, 88, 111);
      g.bezierCurveTo(90, 98, 64 + bp.hipW + 4, bp.waistY + 12, 64 + bp.waistW, bp.waistY);
      g.closePath();
      g.fill();
      g.stroke();

      g.fillStyle = 'rgba(9, 13, 22, 0.28)';
      g.beginPath();
      g.moveTo(64 + bp.waistW * 0.6, bp.waistY + 2);
      g.lineTo(78, 111);
      g.lineTo(88, 111);
      g.bezierCurveTo(89, 98, 64 + bp.hipW + 3, bp.waistY + 12, 64 + bp.waistW, bp.waistY);
      g.closePath();
      g.fill();

      const panelGrad = g.createLinearGradient(52, bp.waistY, 76, 111);
      panelGrad.addColorStop(0, cfg.apron ? '#ffffff' : outfitSubLight);
      panelGrad.addColorStop(0.6, cfg.apron ? '#f1f5f9' : outfitSub);
      panelGrad.addColorStop(1, cfg.apron ? '#cbd5e1' : outfitSubDark);
      g.fillStyle = panelGrad;
      g.beginPath();
      g.moveTo(64 - bp.waistW * 0.65, bp.waistY + 1);
      g.lineTo(51, 111);
      g.quadraticCurveTo(64, 113, 77, 111);
      g.lineTo(64 + bp.waistW * 0.65, bp.waistY + 1);
      g.closePath();
      g.fill();
      g.strokeStyle = trimGold;
      g.lineWidth = 1.1;
      g.stroke();
      g.restore();
    } else {
      const thighW = cupSize === 'E' ? 11.4 : (cupSize === 'D' ? 10.6 : (cupSize === 'C' ? 9.8 : (cupSize === 'B' ? 9.2 : 8.6)));
      const leftLegX = (isGlamorous ? 56.6 : 57.2) - thighW * 0.5;
      const rightLegX = (isGlamorous ? 71.4 : 70.8) - thighW * 0.5;

      g.save();
      const makeThighGrad = (lx) => {
        const tg = g.createLinearGradient(lx, bp.legY, lx + thighW, bp.legY);
        tg.addColorStop(0, '#ffffff');
        tg.addColorStop(0.25, skin);
        tg.addColorStop(0.7, skinMid);
        tg.addColorStop(1, skinShadow);
        return tg;
      };

      g.fillStyle = makeThighGrad(leftLegX);
      g.strokeStyle = skinLine;
      g.lineWidth = 1.35;
      g.beginPath();
      g.roundRect(leftLegX, bp.legY - 2, thighW, 34, thighW * 0.45);
      g.fill();
      g.stroke();

      g.fillStyle = makeThighGrad(rightLegX);
      g.beginPath();
      g.roundRect(rightLegX, bp.legY - 2, thighW, 34, thighW * 0.45);
      g.fill();
      g.stroke();

      g.fillStyle = skinDeep;
      g.globalAlpha = 0.45;
      g.fillRect(leftLegX + 0.8, bp.legY - 1, thighW - 1.6, 4.5);
      g.fillRect(rightLegX + 0.8, bp.legY - 1, thighW - 1.6, 4.5);
      g.globalAlpha = 1.0;

      if (legStyle === 'stockings') {
        const stGradL = g.createLinearGradient(leftLegX, bp.legY + 8, leftLegX + thighW, bp.legY + 8);
        stGradL.addColorStop(0, isGlamorous ? '#4c0519' : '#334155');
        stGradL.addColorStop(0.4, '#1e1b2e');
        stGradL.addColorStop(1, '#090d16');
        g.fillStyle = stGradL;
        g.beginPath();
        g.roundRect(leftLegX, bp.legY + 7.5, thighW, 24.5, 3.5);
        g.fill();

        const stGradR = g.createLinearGradient(rightLegX, bp.legY + 8, rightLegX + thighW, bp.legY + 8);
        stGradR.addColorStop(0, isGlamorous ? '#4c0519' : '#334155');
        stGradR.addColorStop(0.4, '#1e1b2e');
        stGradR.addColorStop(1, '#090d16');
        g.fillStyle = stGradR;
        g.beginPath();
        g.roundRect(rightLegX, bp.legY + 7.5, thighW, 24.5, 3.5);
        g.fill();

        g.fillStyle = trimGold;
        g.fillRect(leftLegX, bp.legY + 7.5, thighW, 2.0);
        g.fillRect(rightLegX, bp.legY + 7.5, thighW, 2.0);
        if (isGlamorous) {
          // 글래머 누님 캐릭터 전용 가터벨트 스트랩 디테일
          g.strokeStyle = '#191424';
          g.lineWidth = 1.3;
          g.beginPath();
          g.moveTo(leftLegX + thighW * 0.5, bp.legY);
          g.lineTo(leftLegX + thighW * 0.5, bp.legY + 8);
          g.moveTo(rightLegX + thighW * 0.5, bp.legY);
          g.lineTo(rightLegX + thighW * 0.5, bp.legY + 8);
          g.stroke();
          drawRoundPart(g, leftLegX + thighW * 0.5, bp.legY + 7.5, 1.8, 1.4, 0, trimGold, null, 0);
          drawRoundPart(g, rightLegX + thighW * 0.5, bp.legY + 7.5, 1.8, 1.4, 0, trimGold, null, 0);
        }
      } else if (legStyle === 'hunter_leggings') {
        g.fillStyle = '#291d1a';
        g.strokeStyle = clothLine;
        g.lineWidth = 1.3;
        g.beginPath();
        g.roundRect(leftLegX - 0.3, bp.legY + 8, thighW + 0.6, 24, 3.5);
        g.roundRect(rightLegX - 0.3, bp.legY + 8, thighW + 0.6, 24, 3.5);
        g.fill();
        g.stroke();
        g.fillStyle = trimGold;
        g.fillRect(leftLegX, bp.legY + 10, thighW, 2);
        g.fillRect(rightLegX, bp.legY + 10, thighW, 2);
      } else if (legStyle === 'tropical_sandals') {
        g.fillStyle = outfitMain;
        g.beginPath();
        g.roundRect(leftLegX, 103, thighW, 8, 3);
        g.roundRect(rightLegX, 103, thighW, 8, 3);
        g.fill();
      } else {
        g.fillStyle = outfitMain;
        g.strokeStyle = clothLine;
        g.lineWidth = 1.3;
        g.beginPath();
        g.roundRect(leftLegX - 0.3, bp.legY + 10, thighW + 0.6, 22, 3.5);
        g.roundRect(rightLegX - 0.3, bp.legY + 10, thighW + 0.6, 22, 3.5);
        g.fill();
        g.stroke();
        g.fillStyle = trimGold;
        g.fillRect(leftLegX, bp.legY + 11, thighW, 2);
        g.fillRect(rightLegX, bp.legY + 11, thighW, 2);
      }

      // 하이웨이스트 A라인 / 글래머 코르셋 스커트 렌더링
      const skirtGrad = g.createLinearGradient(64 - bp.hipW, bp.waistY, 64 + bp.hipW, bp.legY + 3);
      skirtGrad.addColorStop(0, outfitMainLight);
      skirtGrad.addColorStop(0.45, outfitMain);
      skirtGrad.addColorStop(1, outfitMainDark);
      g.fillStyle = skirtGrad;
      g.strokeStyle = clothLine;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(64 - bp.waistW, bp.waistY);
      g.bezierCurveTo(64 - bp.hipW * 0.96, bp.waistY + 3.5, 64 - bp.hipW, bp.legY - 1, 64 - bp.hipW + 1, bp.legY + (isGlamorous ? 0.5 : 2));
      g.quadraticCurveTo(64, bp.legY + (isGlamorous ? 2.5 : 4.5), 64 + bp.hipW - 1, bp.legY + (isGlamorous ? 0.5 : 2));
      g.bezierCurveTo(64 + bp.hipW, bp.legY - 1, 64 + bp.hipW * 0.96, bp.waistY + 3.5, 64 + bp.waistW, bp.waistY);
      g.closePath();
      g.fill();
      g.stroke();

      g.fillStyle = 'rgba(9, 13, 22, 0.26)';
      g.beginPath();
      g.moveTo(64 - bp.waistW * 0.35, bp.waistY + 2);
      g.lineTo(64 - bp.hipW * 0.55, bp.legY + 1.5);
      g.lineTo(64 - bp.hipW * 0.25, bp.legY + 2.0);
      g.closePath();
      g.moveTo(64 + bp.waistW * 0.25, bp.waistY + 2);
      g.lineTo(64 + bp.hipW * 0.25, bp.legY + 2.0);
      g.lineTo(64 + bp.hipW * 0.65, bp.legY + 1.5);
      g.closePath();
      g.fill();

      g.fillStyle = trimGold;
      g.fillRect(64 - bp.waistW, bp.waistY - 0.5, bp.waistW * 2, isGlamorous ? 2.8 : 2.2);
      if (isGlamorous) {
        drawRoundPart(g, 64, bp.waistY + 0.8, 2.6, 2.2, 0, outfitSub, clothLine, 1.0);
      }
      g.restore();
    }
  } else {
    const pantsColor = cfg.pantsColor || '#1e293b';
    const pantsLight = shadeHexColor(pantsColor, 0.22);
    const pantsDark = shadeHexColor(pantsColor, -0.38);
    const bootColor = cfg.bootColor || '#0f172a';
    const legW = isViking ? 13.5 : 11.5;
    const lLegX = isViking ? 48.5 : 51;
    const rLegX = isViking ? 66.0 : 65.5;

    const pGradL = g.createLinearGradient(lLegX, 75, lLegX + legW, 75);
    pGradL.addColorStop(0, pantsLight);
    pGradL.addColorStop(0.5, pantsColor);
    pGradL.addColorStop(1, pantsDark);
    const pGradR = g.createLinearGradient(rLegX, 75, rLegX + legW, 75);
    pGradR.addColorStop(0, pantsLight);
    pGradR.addColorStop(0.5, pantsColor);
    pGradR.addColorStop(1, pantsDark);

    drawRoundedRectPath(g, lLegX, 75, legW, 25, 3.5, pGradL, clothLine, 1.5);
    drawRoundedRectPath(g, rLegX, 75, legW, 25, 3.5, pGradR, clothLine, 1.5);
    g.fillStyle = 'rgba(9, 13, 22, 0.38)';
    g.fillRect(lLegX + 0.5, 75, legW - 1, 4);
    g.fillRect(rLegX + 0.5, 75, legW - 1, 4);

    drawRoundedRectPath(g, lLegX - 0.5, 96, legW + 1, 15, 3.5, bootColor, clothLine, 1.5);
    drawRoundedRectPath(g, rLegX - 0.5, 96, legW + 1, 15, 3.5, bootColor, clothLine, 1.5);
    if (isViking) {
      // 바이킹 모피 각반 & 가죽 스트랩 부츠
      drawRoundedRectPath(g, lLegX - 1, 93, legW + 2, 5, 2, '#57534e', clothLine, 1.2);
      drawRoundedRectPath(g, rLegX - 1, 93, legW + 2, 5, 2, '#57534e', clothLine, 1.2);
    }
    g.fillStyle = 'rgba(255, 255, 255, 0.22)';
    g.fillRect(lLegX + 2, 100, 3, 7);
    g.fillRect(rLegX + 2, 100, 3, 7);
    g.fillStyle = trimGold;
    g.fillRect(lLegX + 0.5, 97, legW - 1, 2);
    g.fillRect(rLegX + 0.5, 97, legW - 1, 2);
  }

  // 5. 양팔 및 소매 렌더링
  g.save();
  if (isFemale) {
    const lShX = 64 - bp.shoulderW + 0.5;
    const rShX = 64 + bp.shoulderW - 0.5;
    const leftArmGrad = g.createLinearGradient(lShX - 6, 50, lShX + 2, 70);
    leftArmGrad.addColorStop(0, '#ffffff');
    leftArmGrad.addColorStop(0.4, skin);
    leftArmGrad.addColorStop(1, skinShadow);
    const rightArmGrad = g.createLinearGradient(rShX - 2, 50, rShX + 6, 70);
    rightArmGrad.addColorStop(0, skin);
    rightArmGrad.addColorStop(0.5, skinMid);
    rightArmGrad.addColorStop(1, skinShadow);

    // 좌측 팔
    g.fillStyle = leftArmGrad;
    g.strokeStyle = skinLine;
    g.lineWidth = 1.35;
    g.beginPath();
    g.moveTo(lShX + 2, 49.5);
    g.lineTo(lShX - 2.5, 50.5);
    g.quadraticCurveTo(lShX - 6.8, 59, lShX - 5.5, 69);
    g.arc(lShX - 2.8, 69, 2.7, Math.PI, 0, true);
    g.quadraticCurveTo(lShX - 0.2, 61, lShX + 2.5, 55);
    g.closePath();
    g.fill();
    g.stroke();

    // 우측 팔
    g.fillStyle = rightArmGrad;
    g.beginPath();
    g.moveTo(rShX - 2, 49.5);
    g.lineTo(rShX + 2.5, 50.5);
    g.quadraticCurveTo(rShX + 6.8, 59, rShX + 5.5, 69);
    g.arc(rShX + 2.8, 69, 2.7, 0, Math.PI, false);
    g.quadraticCurveTo(rShX + 0.2, 61, rShX - 2.5, 55);
    g.closePath();
    g.fill();
    g.stroke();

    // 퍼프/오프숄더 소매
    g.fillStyle = outfitMain;
    g.strokeStyle = clothLine;
    g.lineWidth = 1.3;
    g.beginPath();
    g.moveTo(lShX + 2.5, isGlamorous ? 51 : 49);
    g.lineTo(lShX - 2.5, isGlamorous ? 52 : 50.5);
    g.lineTo(lShX - 4.8, 58.2);
    g.lineTo(lShX + 1.5, 58.8);
    g.closePath();
    g.fill();
    g.stroke();

    g.beginPath();
    g.moveTo(rShX - 2.5, isGlamorous ? 51 : 49);
    g.lineTo(rShX + 2.5, isGlamorous ? 52 : 50.5);
    g.lineTo(rShX + 4.8, 58.2);
    g.lineTo(rShX - 1.5, 58.8);
    g.closePath();
    g.fill();
    g.stroke();
  } else if (isViking) {
    // 바이킹 전사의 굵고 강인한 근육질 양팔 & 가죽/강철 리스트가드
    drawRoundPart(g, 39.5, 60, 6.8, 13.5, 0.16, skinMid, skinLine, 1.5);
    drawRoundPart(g, 88.5, 60, 6.8, 13.5, -0.16, skinShadow, skinLine, 1.5);
    // 이두박근 근육 음영선
    g.strokeStyle = skinDeep;
    g.lineWidth = 1.2;
    g.beginPath();
    g.arc(40.5, 57, 3.5, 0.3, Math.PI - 0.3);
    g.moveTo(84.5, 57);
    g.arc(87.5, 57, 3.5, 0.3, Math.PI - 0.3);
    g.stroke();
    // 징 박힌 가죽 토시(Bracers)
    drawRoundedRectPath(g, 34.5, 63, 9.5, 7.5, 2.5, '#451a03', clothLine, 1.4);
    drawRoundedRectPath(g, 84.0, 63, 9.5, 7.5, 2.5, '#451a03', clothLine, 1.4);
    drawRoundPart(g, 39.2, 66.8, 1.5, 1.5, 0, trimGold, null, 0);
    drawRoundPart(g, 88.8, 66.8, 1.5, 1.5, 0, trimGold, null, 0);
    // 묵직한 주먹
    drawRoundPart(g, 39.0, 72.0, 4.8, 4.4, 0, skin, skinLine, 1.3);
    drawRoundPart(g, 89.0, 72.0, 4.8, 4.4, 0, skinMid, skinLine, 1.3);
  } else {
    const lSleeve = g.createLinearGradient(36, 50, 48, 70);
    lSleeve.addColorStop(0, outfitMainLight);
    lSleeve.addColorStop(0.5, outfitMain);
    lSleeve.addColorStop(1, outfitMainDark);
    const rSleeve = g.createLinearGradient(80, 50, 92, 70);
    rSleeve.addColorStop(0, outfitMain);
    rSleeve.addColorStop(1, outfitMainDark);

    drawRoundPart(g, 43, 61, 5.2, 13, 0.14, lSleeve, clothLine, 1.5);
    drawRoundPart(g, 85, 61, 5.2, 13, -0.14, rSleeve, clothLine, 1.5);
    g.strokeStyle = trimGold;
    g.lineWidth = 1.3;
    g.beginPath();
    g.moveTo(39, 68); g.lineTo(44, 69);
    g.moveTo(89, 68); g.lineTo(84, 69);
    g.stroke();
    drawRoundPart(g, 41.5, 71.5, 4.0, 4.0, 0, skin, skinLine, 1.2);
    drawRoundPart(g, 86.5, 71.5, 4.0, 4.0, 0, skinMid, skinLine, 1.2);
  }
  g.restore();

  // 6. 상체 의상 및 코트/블라우스 입체 음영 렌더링
  drawRoundedRectPath(g, 60.2, 43.5, 7.6, 8.0, 2.5, skinShadow, skinLine, 1.2);
  g.fillStyle = skinDeep;
  g.beginPath();
  g.moveTo(60.5, 44.2);
  g.lineTo(67.5, 44.2);
  g.lineTo(64, 48.5);
  g.closePath();
  g.fill();

  if (isFemale) {
    g.save();
    // 1) 하이웨이스트 허리단(Corset) 베이스
    const corsetGrad = g.createLinearGradient(64 - bp.shoulderW, 55, 64 + bp.shoulderW, bp.waistY);
    corsetGrad.addColorStop(0, outfitMainLight);
    corsetGrad.addColorStop(0.5, outfitMain);
    corsetGrad.addColorStop(1, outfitMainDark);
    g.fillStyle = corsetGrad;
    g.strokeStyle = clothLine;
    g.lineWidth = 1.45;
    g.beginPath();
    g.moveTo(64 - bp.shoulderW, bp.torsoY);
    g.lineTo(64 + bp.shoulderW, bp.torsoY);
    g.lineTo(64 + bp.waistW, bp.waistY);
    g.lineTo(64 - bp.waistW, bp.waistY);
    g.closePath();
    g.fill();
    g.stroke();

    // 글래머 누님 코르셋 금장 레이싱 디테일
    if (isGlamorous) {
      g.strokeStyle = trimGold;
      g.lineWidth = 1.0;
      g.beginPath();
      g.moveTo(61.5, 59.5); g.lineTo(66.5, 61.5);
      g.moveTo(66.5, 59.5); g.lineTo(61.5, 61.5);
      g.moveTo(61.8, 62.2); g.lineTo(66.2, 64.0);
      g.moveTo(66.2, 62.2); g.lineTo(61.8, 64.0);
      g.stroke();
    }

    // 2) 상의 블라우스/뷔스티에 그라데이션 및 입체 곡면 처리
    const bTopY = bp.torsoY;
    const bBotY = bp.bustLiftY + bp.bustDepth; // E컵: 64.9, D컵: 62.6, C컵: 59.8, B컵: 57.6, A컵: 55.5
    const bSideW = 9.0 + bp.sideCurve;         // E컵: 13.9, D컵: 12.4, C컵: 10.8, B컵: 9.8, A컵: 9.0

    // (a) 상의 하단 드리움 그림자
    if (cupSize !== 'A') {
      const castH = 1.2 + bp.bustDepth * 0.48;
      g.fillStyle = 'rgba(9, 13, 22, 0.48)';
      g.beginPath();
      g.moveTo(64 - bSideW + 1.2, bBotY - 1.2);
      g.bezierCurveTo(64 - bSideW * 0.45, bBotY + castH, 64 + bSideW * 0.45, bBotY + castH, 64 + bSideW - 1.2, bBotY - 1.2);
      g.closePath();
      g.fill();
    }

    // (b) 블라우스/뷔스티에 전면 곡면
    const blouseGrad = g.createLinearGradient(64, bTopY, 64, bBotY + 1);
    if (isGlamorous) {
      blouseGrad.addColorStop(0, outfitSubLight);
      blouseGrad.addColorStop(0.45, outfitSub);
      blouseGrad.addColorStop(1, outfitMainDark);
    } else {
      blouseGrad.addColorStop(0, '#ffffff');
      blouseGrad.addColorStop(0.55, '#f8fafc');
      blouseGrad.addColorStop(0.85, outfitSubLight);
      blouseGrad.addColorStop(1, outfitSub);
    }

    g.fillStyle = blouseGrad;
    g.beginPath();
    g.moveTo(64 - 8.5, bTopY);
    g.lineTo(64 + 8.5, bTopY);
    if (cupSize === 'A') {
      g.lineTo(64 + 7.8, bBotY);
      g.lineTo(64 - 7.8, bBotY);
    } else if (cupSize === 'E' || cupSize === 'D') {
      // 풍만한 더블 라운드 W형 글래머 바스트 실루엣
      g.bezierCurveTo(64 + bSideW + 1.4, bTopY + 3.2, 64 + bSideW + 0.8, bBotY - 0.2, 64 + bSideW * 0.48, bBotY + 0.4);
      g.quadraticCurveTo(64, bBotY - 1.4, 64 - bSideW * 0.48, bBotY + 0.4);
      g.bezierCurveTo(64 - bSideW - 0.8, bBotY - 0.2, 64 - bSideW - 1.4, bTopY + 3.2, 64 - 8.5, bTopY);
    } else {
      g.bezierCurveTo(64 + bSideW + 0.8, bTopY + 3.5, 64 + bSideW, bBotY - 0.4, 64 + bSideW * 0.55, bBotY);
      g.quadraticCurveTo(64, bBotY + 0.6, 64 - bSideW * 0.55, bBotY);
      g.bezierCurveTo(64 - bSideW, bBotY - 0.4, 64 - bSideW - 0.8, bTopY + 3.5, 64 - 8.5, bTopY);
    }
    g.closePath();
    g.fill();

    // D~E컵 3D 입체 볼륨 광택(Spherical Bust Volume Highlight)
    if (cupSize === 'D' || cupSize === 'E') {
      const rSpan = cupSize === 'E' ? 5.6 : 4.5;
      const lBustX = 64 - bSideW * 0.42;
      const rBustX = 64 + bSideW * 0.42;
      const bustCenterY = (bTopY + bBotY) * 0.52;
      for (const bx of [lBustX, rBustX]) {
        const bGlow = g.createRadialGradient(bx - 0.8, bustCenterY - 1.2, 0.6, bx, bustCenterY, rSpan);
        bGlow.addColorStop(0, 'rgba(255, 255, 255, 0.52)');
        bGlow.addColorStop(0.6, 'rgba(255, 255, 255, 0.12)');
        bGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        g.fillStyle = bGlow;
        g.beginPath();
        g.arc(bx, bustCenterY, rSpan, 0, Math.PI * 2);
        g.fill();
      }
    }

    // (c) 상의 하단 외곽선
    if (cupSize !== 'A') {
      g.strokeStyle = clothLine;
      g.lineWidth = cupSize === 'E' ? 1.65 : (cupSize === 'D' ? 1.5 : (cupSize === 'C' ? 1.3 : 1.1));
      g.lineCap = 'round';

      // 좌측 바깥 하단 오픈 라인
      g.beginPath();
      g.moveTo(64 - bSideW + 0.2, bBotY - 3.2);
      g.quadraticCurveTo(64 - bSideW * 0.68, bBotY + 0.6, 64 - 1.8, bBotY - (cupSize === 'E' ? 1.0 : 0.1));
      g.stroke();

      // 우측 바깥 하단 오픈 라인
      g.beginPath();
      g.moveTo(64 + bSideW - 0.2, bBotY - 3.2);
      g.quadraticCurveTo(64 + bSideW * 0.68, bBotY + 0.6, 64 + 1.8, bBotY - (cupSize === 'E' ? 1.0 : 0.1));
      g.stroke();
    }

    // 3) 어깨 양옆을 감싸는 세련된 크롭 볼레로 재킷 라펠
    g.fillStyle = outfitMain;
    g.strokeStyle = clothLine;
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(64 - bp.shoulderW, bp.torsoY);
    g.lineTo(64 - (isGlamorous ? 8.2 : 7.5), bp.torsoY);
    g.lineTo(64 - bSideW + 0.8, bBotY - 2.6);
    g.lineTo(64 - bp.shoulderW + 1.0, bBotY - 3.4);
    g.closePath();
    g.fill();
    g.stroke();

    g.beginPath();
    g.moveTo(64 + bp.shoulderW, bp.torsoY);
    g.lineTo(64 + (isGlamorous ? 8.2 : 7.5), bp.torsoY);
    g.lineTo(64 + bSideW - 0.8, bBotY - 2.6);
    g.lineTo(64 + bp.shoulderW - 1.0, bBotY - 3.4);
    g.closePath();
    g.fill();
    g.stroke();

    // 4) 넥라인 및 글래머 클리비지(Cleavage) 입체 음영 장식
    const neckSpan = isGlamorous ? 7.2 : 5.0;
    const neckDepth = isGlamorous ? 7.2 : (cupSize === 'D' ? 5.2 : 3.4);
    const chestSkinGrad = g.createLinearGradient(64, bp.torsoY, 64, bp.torsoY + neckDepth);
    chestSkinGrad.addColorStop(0, skin);
    chestSkinGrad.addColorStop(0.7, skinMid);
    chestSkinGrad.addColorStop(1, skinShadow);
    g.fillStyle = chestSkinGrad;
    g.strokeStyle = clothLine;
    g.lineWidth = 1.15;
    g.beginPath();
    g.moveTo(64 - neckSpan, bp.torsoY);
    if (isGlamorous || cupSize === 'D') {
      // 깊게 파인 하트형 스위트하트 데콜테 라인
      g.quadraticCurveTo(64 - neckSpan * 0.45, bp.torsoY + neckDepth, 64, bp.torsoY + neckDepth - 1.2);
      g.quadraticCurveTo(64 + neckSpan * 0.45, bp.torsoY + neckDepth, 64 + neckSpan, bp.torsoY);
    } else {
      g.quadraticCurveTo(64, bp.torsoY + neckDepth, 64 + neckSpan, bp.torsoY);
    }
    g.closePath();
    g.fill();
    g.stroke();

    // D~E컵 가슴골(Cleavage) Y자 입체 셰이딩 & 상단 곡선 하이라이트
    if (cupSize === 'D' || cupSize === 'E') {
      g.strokeStyle = skinDeep;
      g.lineWidth = cupSize === 'E' ? 1.45 : 1.15;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(64 - 2.6, bp.torsoY + 2.8);
      g.quadraticCurveTo(64, bp.torsoY + 4.4, 64, bp.torsoY + (cupSize === 'E' ? 8.2 : 6.2));
      g.moveTo(64 + 2.6, bp.torsoY + 2.8);
      g.quadraticCurveTo(64, bp.torsoY + 4.4, 64, bp.torsoY + (cupSize === 'E' ? 8.2 : 6.2));
      g.stroke();

      // 데콜테 볼륨 하이라이트
      g.fillStyle = 'rgba(255, 255, 255, 0.55)';
      g.beginPath();
      g.ellipse(61.4, bp.torsoY + 3.0, 1.8, 1.0, -0.2, 0, Math.PI * 2);
      g.ellipse(66.6, bp.torsoY + 3.0, 1.8, 1.0, 0.2, 0, Math.PI * 2);
      g.fill();
    }

    // 목선 슬림 벨벳 초커 & 루비 펜던트
    g.strokeStyle = clothLine;
    g.lineWidth = 1.25;
    g.beginPath();
    g.moveTo(60.0, 47.2);
    g.quadraticCurveTo(64, 48.1, 68.0, 47.2);
    g.stroke();
    if (isGlamorous) {
      drawRoundPart(g, 64, 48.5, 1.8, 2.0, 0, trimGold, clothLine, 0.8);
      drawRoundPart(g, 64, 48.5, 1.0, 1.2, 0, '#e11d48', null, 0);
    }
    g.restore();
  } else if (isViking) {
    // =========================================================================
    // ★ 거친 바이킹 전사 전용 근육질 상체, 북방 늑대 모피 망토 칼라, 징 박힌 가죽 갑옷
    // =========================================================================
    g.save();
    const coatGrad = g.createLinearGradient(40, 47, 88, 76);
    coatGrad.addColorStop(0, outfitMainLight);
    coatGrad.addColorStop(0.45, outfitMain);
    coatGrad.addColorStop(1, outfitMainDark);
    g.fillStyle = coatGrad;
    g.strokeStyle = clothLine;
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(40, 48);
    g.lineTo(88, 48);
    g.lineTo(79, 76);
    g.lineTo(49, 76);
    g.closePath();
    g.fill();
    g.stroke();

    // 근육질 가슴 갑옷 판 & X자 전사 가죽 하네스
    const harnessGrad = g.createLinearGradient(48, 50, 80, 75);
    harnessGrad.addColorStop(0, outfitSubLight);
    harnessGrad.addColorStop(0.5, outfitSub);
    harnessGrad.addColorStop(1, outfitSubDark);
    drawRoundedRectPath(g, 48, 51, 32, 23, 4, harnessGrad, clothLine, 1.4);

    // 거친 X자 가죽 가슴 스트랩 & 강철 리벳
    g.strokeStyle = '#271409';
    g.lineWidth = 3.4;
    g.beginPath();
    g.moveTo(46, 50); g.lineTo(78, 74);
    g.moveTo(82, 50); g.lineTo(50, 74);
    g.stroke();
    g.strokeStyle = trimGold;
    g.lineWidth = 1.3;
    g.beginPath();
    g.moveTo(46, 50); g.lineTo(78, 74);
    g.moveTo(82, 50); g.lineTo(50, 74);
    g.stroke();

    // 어깨를 덮는 거친 북방 늑대 모피 칼라(Jagged Wolf-Fur Mantle)
    g.fillStyle = cfg.build === 'elder_gentleman' ? '#78350f' : '#44403c';
    g.strokeStyle = '#1c1917';
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(35, 48);
    g.quadraticCurveTo(64, 44, 93, 48);
    g.lineTo(91, 56);
    g.lineTo(85, 53);
    g.lineTo(80, 57);
    g.lineTo(73, 53);
    g.lineTo(64, 58);
    g.lineTo(55, 53);
    g.lineTo(48, 57);
    g.lineTo(43, 53);
    g.lineTo(37, 56);
    g.closePath();
    g.fill();
    g.stroke();

    // 양 어깨 강철 스파이크 견장(Spiked Viking Pauldrons)
    drawRoundPart(g, 40, 50, 7.5, 4.5, -0.2, '#475569', clothLine, 1.4);
    drawRoundPart(g, 88, 50, 7.5, 4.5, 0.2, '#475569', clothLine, 1.4);
    drawRoundPart(g, 36, 47, 2.2, 3.8, -0.4, '#e2e8f0', clothLine, 1.1);
    drawRoundPart(g, 92, 47, 2.2, 3.8, 0.4, '#e2e8f0', clothLine, 1.1);

    // 묵직한 바이킹 챔피언 벨트 & 황금 룬 버클
    drawRoundedRectPath(g, 48, 71.5, 32, 5.5, 2, '#1c1917', trimGold, 1.3);
    drawRoundPart(g, 64, 74.2, 4.8, 4.0, 0, trimGold, '#451a03', 1.3);
    drawRoundPart(g, 64, 74.2, 2.0, 2.0, 0, '#dc2626', null, 0);
    g.restore();
  } else {
    // 일반 남성 상체
    g.save();
    const coatGrad = g.createLinearGradient(45, 49, 83, 76);
    coatGrad.addColorStop(0, outfitMainLight);
    coatGrad.addColorStop(0.45, outfitMain);
    coatGrad.addColorStop(1, outfitMainDark);
    g.fillStyle = coatGrad;
    g.strokeStyle = clothLine;
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(45, 49);
    g.lineTo(83, 49);
    g.lineTo(77, 76);
    g.lineTo(51, 76);
    g.closePath();
    g.fill();
    g.stroke();

    g.fillStyle = 'rgba(9, 13, 22, 0.30)';
    g.beginPath();
    g.moveTo(71, 49);
    g.lineTo(83, 49);
    g.lineTo(77, 76);
    g.lineTo(68, 76);
    g.closePath();
    g.fill();

    g.fillStyle = '#f8fafc';
    g.strokeStyle = clothLine;
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(57, 48.5);
    g.lineTo(71, 48.5);
    g.lineTo(68, 55);
    g.lineTo(60, 55);
    g.closePath();
    g.fill();
    g.stroke();

    if (cfg.maleOutfit === 'blacksmith_apron') {
      const apGrad = g.createLinearGradient(52, 55, 76, 76);
      apGrad.addColorStop(0, outfitSubLight);
      apGrad.addColorStop(0.5, outfitSub);
      apGrad.addColorStop(1, outfitSubDark);
      drawRoundedRectPath(g, 52, 55, 24, 21, 3, apGrad, clothLine, 1.3);
      g.strokeStyle = trimGold;
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(53, 50); g.lineTo(73, 74);
      g.moveTo(75, 50); g.lineTo(55, 74);
      g.stroke();
    } else if (cfg.maleOutfit === 'naval_double_breasted') {
      g.strokeStyle = trimGold;
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(56, 51); g.lineTo(64, 59); g.lineTo(72, 51);
      g.stroke();
      for (let by = 58; by <= 70; by += 6) {
        drawRoundPart(g, 58, by, 1.5, 1.5, 0, trimGold, null, 0);
        drawRoundPart(g, 70, by, 1.5, 1.5, 0, trimGold, null, 0);
      }
    } else if (cfg.maleOutfit === 'elder_vest') {
      const vGrad = g.createLinearGradient(55, 54, 73, 75);
      vGrad.addColorStop(0, outfitSubLight);
      vGrad.addColorStop(0.5, outfitSub);
      vGrad.addColorStop(1, outfitSubDark);
      g.fillStyle = vGrad;
      g.fillRect(55, 54, 18, 21);
      g.strokeStyle = trimGold;
      g.lineWidth = 1.2;
      g.strokeRect(55, 54, 18, 21);
      drawRoundPart(g, 64, 54, 2.8, 2.8, 0, trimGold, clothLine, 1.0);
    } else {
      g.fillStyle = outfitSub;
      g.beginPath();
      g.moveTo(54, 50);
      g.lineTo(64, 62);
      g.lineTo(74, 50);
      g.lineTo(70, 50);
      g.lineTo(64, 57);
      g.lineTo(58, 50);
      g.closePath();
      g.fill();

      g.strokeStyle = trimGold;
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(64, 55);
      g.lineTo(64, 75);
      g.stroke();

      g.strokeStyle = '#090d16';
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(50, 51);
      g.lineTo(75, 73);
      g.stroke();
      drawRoundPart(g, 64, 54, 2.6, 2.6, 0, trimGold, clothLine, 1.0);
    }

    drawRoundPart(g, 45, 50, 5.5, 3.2, -0.15, trimGold, clothLine, 1.2);
    drawRoundPart(g, 83, 50, 5.5, 3.2, 0.15, trimGold, clothLine, 1.2);
    g.fillStyle = '#090d16';
    g.fillRect(51, 73.5, 26, 3);
    g.fillStyle = trimGold;
    g.fillRect(61, 72.8, 6, 4.4);
    g.restore();
  }

  // 7. 얼굴 윤곽 및 눈매 렌더링
  g.save();
  drawRoundPart(g, 44, 34.5, 3.0, 4.2, -0.08, skin, skinLine, 1.2);
  drawRoundPart(g, 84, 34.5, 3.0, 4.2, 0.08, skinMid, skinLine, 1.2);

  const face3DGrad = g.createRadialGradient(56, 28, 4, 64, 32, 23);
  face3DGrad.addColorStop(0, '#ffffff');
  face3DGrad.addColorStop(0.28, skin);
  face3DGrad.addColorStop(0.75, skinMid);
  face3DGrad.addColorStop(1, skinShadow);
  g.fillStyle = face3DGrad;
  g.strokeStyle = skinLine;
  g.lineWidth = 1.5;
  g.beginPath();
  if (isViking) {
    // 바이킹 전사의 강인하고 각진 하관
    g.moveTo(44.5, 24);
    g.lineTo(44.5, 38);
    g.lineTo(52, 46.5);
    g.lineTo(64, 48.5);
    g.lineTo(76, 46.5);
    g.lineTo(83.5, 38);
    g.lineTo(83.5, 24);
    g.arc(64, 24, 19.5, 0, Math.PI, true);
  } else {
    g.moveTo(45, 24);
    g.bezierCurveTo(44.5, 36.5, 50, 44.5, 64, 47);
    g.bezierCurveTo(78, 44.5, 83.5, 36.5, 83, 24);
    g.arc(64, 24, 19, 0, Math.PI, true);
  }
  g.closePath();
  g.fill();
  g.stroke();

  g.fillStyle = skinShadow;
  g.globalAlpha = 0.45;
  g.beginPath();
  g.moveTo(45, 25);
  g.quadraticCurveTo(64, 30, 83, 25);
  g.lineTo(83, 20);
  g.lineTo(45, 20);
  g.closePath();
  g.fill();
  g.globalAlpha = 1.0;

  if (isFemale) {
    g.fillStyle = isGlamorous ? 'rgba(244, 63, 94, 0.34)' : 'rgba(244, 114, 182, 0.28)';
    g.beginPath();
    g.ellipse(49.8, 38.8, 3.6, 1.7, -0.1, 0, Math.PI * 2);
    g.ellipse(78.2, 38.8, 3.6, 1.7, 0.1, 0, Math.PI * 2);
    g.fill();
  } else if (isViking) {
    // 바이킹 전사의 왼쪽 눈과 뺨을 가로지르는 거친 칼자국 흉터(Battle Scar)
    g.strokeStyle = '#7f1d1d';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(51.5, 28.5);
    g.lineTo(56.5, 41.5);
    g.stroke();
    g.strokeStyle = 'rgba(127, 29, 29, 0.65)';
    g.lineWidth = 0.9;
    g.beginPath();
    g.moveTo(50.5, 31.5); g.lineTo(54.2, 30.8);
    g.moveTo(52.2, 38.5); g.lineTo(56.2, 37.8);
    g.stroke();
  }

  const drawModernSubcultureEye = (cx, cy, isLeft) => {
    g.save();
    if (isFemale) {
      // 아치형 상단 눈매 (글래머 누님 캐릭터는 눈꼬리가 더욱 고혹적으로 올라감)
      const outerLift = isGlamorous ? -1.3 : (eyeType === 'aru_confident' ? -0.9 : (eyeType === 'nonomi_soft' ? 0.5 : -0.2));
      const eyeH = isGlamorous ? 3.7 : (eyeType === 'rio_chic' ? 3.8 : 4.1);

      // 1) 맑은 흰자위
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.moveTo(cx - 4.5, cy - 0.6 + (isLeft ? outerLift : 0));
      g.quadraticCurveTo(cx, cy - 2.6, cx + 4.5, cy - 0.6 + (!isLeft ? outerLift : 0));
      g.bezierCurveTo(cx + 4.2, cy + eyeH, cx - 4.2, cy + eyeH, cx - 4.5, cy - 0.6 + (isLeft ? outerLift : 0));
      g.closePath();
      g.fill();

      // 2) 홍채
      g.save();
      g.clip();
      g.fillStyle = eyeDark;
      g.beginPath();
      g.ellipse(cx, cy + 0.6, 3.4, 3.7, 0, 0, Math.PI * 2);
      g.fill();

      g.fillStyle = eyeColor;
      g.beginPath();
      g.ellipse(cx, cy + 1.2, 3.1, 3.0, 0, 0, Math.PI * 2);
      g.fill();

      g.fillStyle = eyeLight;
      g.beginPath();
      g.arc(cx, cy + 1.2, 2.6, 0.12, Math.PI - 0.12);
      g.fill();

      g.fillStyle = '#090d16';
      g.beginPath();
      g.moveTo(cx, cy - 0.5);
      g.lineTo(cx + 1.15, cy + 0.8);
      g.lineTo(cx, cy + 2.2);
      g.lineTo(cx - 1.15, cy + 0.8);
      g.closePath();
      g.fill();

      g.fillStyle = '#ffffff';
      g.fillRect(cx - 2.4, cy - 0.6, 1.5, 1.2);
      g.fillRect(cx + 1.2, cy + 1.6, 0.9, 0.8);
      g.restore();

      // 3) 유려한 아치형 상단 속눈썹
      g.fillStyle = '#1e1420';
      g.beginPath();
      g.moveTo(cx - 5.2, cy - 0.5 + (isLeft ? outerLift : 0));
      g.quadraticCurveTo(cx, cy - 3.4, cx + 5.2, cy - 0.5 + (!isLeft ? outerLift : 0));
      g.quadraticCurveTo(cx, cy - 1.6, cx - 5.2, cy - 0.5 + (isLeft ? outerLift : 0));
      g.closePath();
      g.fill();
    } else {
      const isSharp = eyeType !== 'xingqiu_clean';
      const eyeH = isViking ? 2.3 : (isSharp ? 2.5 : 3.0);
      const slant = isViking ? -1.1 : (isSharp ? -0.7 : -0.2);

      g.fillStyle = '#ffffff';
      g.beginPath();
      g.moveTo(cx - 4.5, cy - 0.8 + (isLeft ? slant : 0));
      g.lineTo(cx + 4.5, cy - 0.8 + (!isLeft ? slant : 0));
      g.lineTo(cx + 3.8, cy + eyeH);
      g.lineTo(cx - 3.8, cy + eyeH);
      g.closePath();
      g.fill();

      g.save();
      g.clip();
      g.fillStyle = eyeDark;
      g.beginPath();
      g.ellipse(cx, cy + 0.5, 2.7, 2.6, 0, 0, Math.PI * 2);
      g.fill();

      g.fillStyle = eyeColor;
      g.beginPath();
      g.ellipse(cx, cy + 1.0, 2.4, 2.0, 0, 0, Math.PI * 2);
      g.fill();

      g.fillStyle = eyeLight;
      g.fillRect(cx - 1.6, cy + 1.3, 3.2, 1.0);

      g.fillStyle = '#090d16';
      g.beginPath();
      g.moveTo(cx, cy - 0.5);
      g.lineTo(cx + 0.9, cy + 0.7);
      g.lineTo(cx, cy + 1.9);
      g.lineTo(cx - 0.9, cy + 0.7);
      g.closePath();
      g.fill();

      g.fillStyle = '#ffffff';
      g.fillRect(cx - 1.8, cy - 0.2, 1.1, 0.9);
      g.restore();

      g.fillStyle = '#18111c';
      g.beginPath();
      if (isLeft) {
        g.moveTo(cx - 5.0, cy - 0.9 + slant);
        g.lineTo(cx + 4.4, cy - 1.3);
        g.lineTo(cx + 4.4, cy - 0.3);
        g.lineTo(cx - 4.6, cy - 0.1 + slant);
      } else {
        g.moveTo(cx - 4.4, cy - 1.3);
        g.lineTo(cx + 5.0, cy - 0.9 + slant);
        g.lineTo(cx + 4.6, cy - 0.1 + slant);
        g.lineTo(cx - 4.4, cy - 0.3);
      }
      g.closePath();
      g.fill();
    }
    g.restore();
  };
  drawModernSubcultureEye(54.2, 35.0, true);
  drawModernSubcultureEye(73.8, 35.0, false);

  // 글래머 누님 캐릭터 눈물점(Beauty Mark) 디테일
  if (isFemale && isGlamorous) {
    g.fillStyle = '#271409';
    g.beginPath();
    g.arc(77.4, 38.2, 0.85, 0, Math.PI * 2);
    g.fill();
  }

  // 코 하이라이트 & 음영
  g.fillStyle = '#ffffff';
  g.fillRect(63.5, 34.8, 0.9, 2.4);
  g.fillStyle = skinDeep;
  g.fillRect(63.6, 37.8, 1.1, 1.0);

  // 입매 & 바이킹 풍성한 수염
  if (cfg.beard === 'elder_beard' || cfg.beard === 'rugged_beard' || cfg.beard === 'viking_braid') {
    const isElder = cfg.beard === 'elder_beard' && !isViking;
    const bMain = isElder ? '#f1f5f9' : hair;
    const bShade = isElder ? '#cbd5e1' : hairShade;
    const bStroke = isElder ? '#475569' : clothLine;

    // 1) 턱 전체를 감싸며 가슴 위까지 내려오는 풍성한 바이킹 턱수염(Full Viking Beard)
    const beardGrad = g.createLinearGradient(48, 39, 80, 60);
    beardGrad.addColorStop(0, bMain);
    beardGrad.addColorStop(0.55, bShade);
    beardGrad.addColorStop(1, hairDeep);
    g.fillStyle = beardGrad;
    g.strokeStyle = bStroke;
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(46.5, 37.5);
    g.quadraticCurveTo(44.5, 47, 51.0, 55.5);
    g.lineTo(55.5, 59.5);
    g.lineTo(59.0, 55.0);
    g.lineTo(64.0, 61.5);
    g.lineTo(69.0, 55.0);
    g.lineTo(72.5, 59.5);
    g.lineTo(77.0, 55.5);
    g.quadraticCurveTo(83.5, 47, 81.5, 37.5);
    g.quadraticCurveTo(75.5, 43.0, 64.0, 43.5);
    g.quadraticCurveTo(52.5, 43.0, 46.5, 37.5);
    g.closePath();
    g.fill();
    g.stroke();

    // 2) 굵은 팔자 콧수염(Handlebar Viking Mustache)
    g.fillStyle = bMain;
    g.strokeStyle = bStroke;
    g.lineWidth = 1.3;
    g.beginPath();
    g.moveTo(64, 39.2);
    g.quadraticCurveTo(55, 38.0, 48.5, 44.5);
    g.quadraticCurveTo(56, 46.2, 64, 42.8);
    g.quadraticCurveTo(72, 46.2, 79.5, 44.5);
    g.quadraticCurveTo(73, 38.0, 64, 39.2);
    g.closePath();
    g.fill();
    g.stroke();

    // 3) 수염 결 라인 & 황금 바이킹 수염 링(Gold Beard Rings)
    g.strokeStyle = hairDeep;
    g.lineWidth = 1.0;
    g.beginPath();
    g.moveTo(55, 45); g.lineTo(55.5, 56);
    g.moveTo(61, 45); g.lineTo(62.5, 58);
    g.moveTo(67, 45); g.lineTo(65.5, 58);
    g.moveTo(73, 45); g.lineTo(72.5, 56);
    g.stroke();

    drawRoundedRectPath(g, 53.2, 53.5, 4.6, 2.4, 1, trimGold, clothLine, 0.9);
    drawRoundedRectPath(g, 61.5, 55.5, 5.0, 2.5, 1, trimGold, clothLine, 0.9);
    drawRoundedRectPath(g, 70.2, 53.5, 4.6, 2.4, 1, trimGold, clothLine, 0.9);

    // 굳게 다문 입술/치아 포인트
    g.fillStyle = '#ffffff';
    g.fillRect(61.0, 42.4, 6.0, 1.5);
  } else if (cfg.beard === 'naval_stubble') {
    g.fillStyle = hairShade;
    g.beginPath();
    g.moveTo(58.5, 44.5);
    g.quadraticCurveTo(64, 48.5, 69.5, 44.5);
    g.closePath();
    g.fill();
    g.strokeStyle = '#7c2d12';
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(61, 41.8);
    g.quadraticCurveTo(64, 42.8, 67, 41.5);
    g.stroke();
  } else if (isFemale && isGlamorous) {
    // 글래머 누님 캐릭터의 매혹적인 루즈 립(Glossy Rouge Lips)
    g.fillStyle = '#e11d48';
    g.beginPath();
    g.moveTo(60.8, 41.9);
    g.quadraticCurveTo(64, 40.9, 67.2, 41.9);
    g.quadraticCurveTo(64, 43.9, 60.8, 41.9);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(255, 255, 255, 0.65)';
    g.fillRect(63.2, 42.1, 1.8, 0.7);
  } else {
    g.strokeStyle = isFemale ? '#b84a52' : '#7c3f34';
    g.lineWidth = 1.25;
    g.lineCap = 'round';
    g.beginPath();
    if (eyeType === 'rio_chic' || eyeType === 'diluc_sharp') {
      g.moveTo(61.8, 42.0);
      g.quadraticCurveTo(64, 42.6, 66.2, 41.9);
    } else {
      g.moveTo(61.5, 41.7);
      g.quadraticCurveTo(64, 43.0, 66.5, 41.7);
    }
    g.stroke();
  }
  g.restore();

  // 8. 앞머리 & 옆머리
  g.save();
  const topHair3D = g.createRadialGradient(54, 14, 4, 64, 24, 28);
  topHair3D.addColorStop(0, hairLight);
  topHair3D.addColorStop(0.35, hair);
  topHair3D.addColorStop(0.8, hairShade);
  topHair3D.addColorStop(1, hairDeep);
  g.fillStyle = topHair3D;
  g.strokeStyle = clothLine;
  g.lineWidth = 1.45;
  g.lineJoin = 'round';

  if (isFemale) {
    g.beginPath();
    g.moveTo(44.5, 20);
    g.bezierCurveTo(40, 28, 40.5, 38, 44.5, 45.5);
    g.bezierCurveTo(46.2, 39, 46.8, 32, 47.2, 26);
    g.closePath();
    g.fill();
    g.stroke();

    g.beginPath();
    g.moveTo(83.5, 20);
    g.bezierCurveTo(88, 28, 87.5, 38, 83.5, 45.5);
    g.bezierCurveTo(81.8, 39, 81.2, 32, 80.8, 26);
    g.closePath();
    g.fill();
    g.stroke();

    g.beginPath();
    g.arc(64, 24, 20.5, Math.PI * 0.96, Math.PI * 2.04);
    g.lineTo(83, 29);
    g.quadraticCurveTo(78, 29.5, 75, 24.5);
    g.quadraticCurveTo(72, 29.2, 67.5, 29.5);
    g.quadraticCurveTo(65.5, 25, 64, 23.5);
    g.quadraticCurveTo(62.5, 25, 60.5, 29.5);
    g.quadraticCurveTo(56, 29.2, 53, 24.5);
    g.quadraticCurveTo(50, 29.5, 45, 29);
    g.closePath();
    g.fill();
    g.stroke();
  } else if (cfg.build === 'elder_gentleman' && !isViking) {
    g.beginPath();
    g.arc(64, 23.5, 20.2, Math.PI * 0.98, Math.PI * 2.02);
    g.lineTo(83, 28.5);
    g.quadraticCurveTo(74, 19.5, 64, 21.5);
    g.quadraticCurveTo(54, 19.5, 45, 28.5);
    g.closePath();
    g.fill();
    g.stroke();
  } else {
    g.beginPath();
    g.arc(64, 24, 20.5, Math.PI * 0.95, Math.PI * 2.05);
    g.lineTo(83.5, 30);
    g.quadraticCurveTo(79, 28.5, 76, 24);
    g.quadraticCurveTo(72, 29, 68, 29.2);
    g.quadraticCurveTo(65.5, 24.5, 63.5, 23.5);
    g.quadraticCurveTo(60, 29, 55.5, 29.2);
    g.quadraticCurveTo(52, 25, 49.5, 24.5);
    g.quadraticCurveTo(47, 28.5, 44.5, 30);
    g.closePath();
    g.fill();
    g.stroke();
  }

  // 눈썹 (바이킹은 굵고 거친 눈썹)
  g.strokeStyle = (cfg.build === 'elder_gentleman' && !isViking) ? '#cbd5e1' : hairDeep;
  g.lineWidth = isViking ? 2.2 : 1.25;
  g.lineCap = 'round';
  g.beginPath();
  if (isViking) {
    g.moveTo(49.0, 29.2); g.lineTo(58.5, 31.4);
    g.moveTo(79.0, 29.2); g.lineTo(69.5, 31.4);
  } else if (!isFemale || eyeType === 'rio_chic' || eyeType === 'aru_confident') {
    g.moveTo(50.2, 30.2); g.lineTo(57.8, 31.0);
    g.moveTo(77.8, 30.2); g.lineTo(70.2, 31.0);
  } else {
    g.moveTo(50.5, 30.6); g.quadraticCurveTo(54.2, 29.6, 57.8, 30.7);
    g.moveTo(70.2, 30.7); g.quadraticCurveTo(73.8, 29.6, 77.5, 30.6);
  }
  g.stroke();

  if (!isViking) {
    g.fillStyle = 'rgba(255, 255, 255, 0.55)';
    g.fillRect(51, 15.5, 5, 2);
    g.fillRect(58, 14.5, 3, 2);
    g.fillRect(67, 14.5, 3, 2);
    g.fillRect(72, 15.5, 5, 2);
  }
  g.restore();

  // 9. 헤드기어 & 무기 소품
  if (cfg.headgear === 'crown') {
    drawRoundedRectPath(g, 54, 6, 20, 6.5, 2, '#fbbf24', clothLine, 1.3);
    drawRoundPart(g, 64, 9, 2.8, 2.8, 0, '#38bdf8', null, 0);
  } else if (cfg.headgear === 'witch_hat') {
    g.save();
    g.fillStyle = '#3b0764';
    g.strokeStyle = clothLine;
    g.lineWidth = 1.5;
    g.beginPath();
    g.ellipse(64, 13, 27, 5.5, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.beginPath();
    g.moveTo(48, 13);
    g.quadraticCurveTo(63, -3, 78, 4);
    g.lineTo(79, 13);
    g.closePath();
    g.fill();
    g.stroke();
    g.fillStyle = '#fbbf24';
    g.fillRect(50, 9.5, 26, 2.8);
    g.restore();
  } else if (cfg.headgear === 'feather_hood') {
    drawRoundPart(g, 79, 11, 3.8, 10, 0.42, '#fef08a', clothLine, 1.2);
    drawRoundPart(g, 83, 13, 3.0, 8, 0.58, '#4ade80', clothLine, 1.2);
  } else if (cfg.headgear === 'merchant_beret') {
    drawRoundPart(g, 71, 11, 13, 6, 0.18, '#10b981', clothLine, 1.3);
    drawRoundPart(g, 77, 7.5, 2.8, 2.8, 0, '#fbbf24', clothLine, 1.0);
  } else if (cfg.headgear === 'smith_bandana') {
    drawRoundedRectPath(g, 45, 16, 38, 4.5, 2, '#dc2626', clothLine, 1.3);
  } else if (cfg.headgear === 'elder_circlet') {
    drawRoundedRectPath(g, 48, 15, 32, 3.8, 2, '#fbbf24', clothLine, 1.2);
    drawRoundPart(g, 64, 16.8, 3.2, 3.2, 0, '#10b981', clothLine, 1.0);
  } else if (cfg.headgear === 'tiara_ribbon') {
    drawRoundPart(g, 44.5, 19, 4, 2.8, -0.4, '#38bdf8', clothLine, 1.1);
    drawRoundPart(g, 83.5, 19, 4, 2.8, 0.4, '#38bdf8', clothLine, 1.1);
    drawRoundedRectPath(g, 55, 7.5, 18, 5, 2.5, '#f8fafc', clothLine, 1.2);
    drawRoundPart(g, 64, 10, 2.6, 2.6, 0, '#38bdf8', null, 0);
  } else if (cfg.headgear === 'scout_goggles') {
    drawRoundedRectPath(g, 47, 14.5, 34, 5, 2, '#451a03', clothLine, 1.2);
    drawRoundPart(g, 55.5, 17, 4, 3, 0, '#38bdf8', clothLine, 1.1);
    drawRoundPart(g, 72.5, 17, 4, 3, 0, '#38bdf8', clothLine, 1.1);
  } else if (cfg.headgear === 'naval_cap') {
    drawRoundedRectPath(g, 46, 7, 36, 8.5, 3, '#1e3a8a', clothLine, 1.4);
    drawRoundedRectPath(g, 44, 14, 40, 3.2, 1.5, '#fbbf24', clothLine, 1.2);
    drawRoundPart(g, 64, 10.8, 2.8, 2.8, 0, '#fef08a', null, 0);
  } else if (cfg.headgear === 'sea_tiara') {
    drawRoundedRectPath(g, 52, 6.5, 24, 6.5, 3, '#fbbf24', clothLine, 1.3);
    drawRoundPart(g, 64, 9.5, 3.5, 3.5, 0, '#06b6d4', null, 0);
  } else if (cfg.headgear === 'tricorn_hat') {
    g.save();
    // 해적 여왕의 화려한 금장 삼각모(Pirate Queen Tricorn Hat) & 진홍색 깃털
    g.fillStyle = '#1e1b4b';
    g.strokeStyle = '#fbbf24';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(35, 18);
    g.quadraticCurveTo(48, 5, 64, 3.5);
    g.quadraticCurveTo(80, 5, 93, 18);
    g.quadraticCurveTo(64, 14, 35, 18);
    g.closePath();
    g.fill();
    g.stroke();
    drawRoundPart(g, 83, 9.5, 5.5, 9.5, 0.45, '#f43f5e', clothLine, 1.2);
    drawRoundPart(g, 64, 11.5, 3.2, 3.2, 0, '#fbbf24', clothLine, 1.0);
    drawRoundPart(g, 64, 11.5, 1.6, 1.6, 0, '#e11d48', null, 0);
    g.restore();
  } else if (cfg.headgear === 'seashell_pin') {
    drawRoundPart(g, 47, 18, 5, 4, -0.3, '#fda4af', clothLine, 1.1);
    drawRoundPart(g, 50.5, 19.2, 2.2, 2.2, 0, '#ffffff', null, 0);
  } else if (cfg.headgear === 'horned_helm') {
    // ★ 거친 바이킹 전사의 코보호대(Nasal Guard) 강철 뿔투구
    g.save();
    // 좌·우 상향 곡선 바이킹 뿔
    g.fillStyle = '#fef08a';
    g.strokeStyle = '#451a03';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(45, 16);
    g.quadraticCurveTo(30, 14, 27, 4);
    g.quadraticCurveTo(36, 7, 46, 11);
    g.closePath();
    g.fill();
    g.stroke();

    g.beginPath();
    g.moveTo(83, 16);
    g.quadraticCurveTo(98, 14, 101, 4);
    g.quadraticCurveTo(92, 7, 82, 11);
    g.closePath();
    g.fill();
    g.stroke();

    // 투구 돔 & 황금 리벳 테두리 + 강철 코보호대(Nasal Bar)
    drawRoundedRectPath(g, 43, 7, 42, 12, 6, '#334155', clothLine, 1.5);
    drawRoundedRectPath(g, 42, 16.5, 44, 3.8, 1.5, '#64748b', '#fbbf24', 1.2);
    drawRoundedRectPath(g, 62.2, 16.5, 3.6, 17.5, 1.5, '#64748b', clothLine, 1.2);
    for (const rx of [48, 56, 72, 80]) {
      drawRoundPart(g, rx, 18.4, 1.2, 1.2, 0, '#fbbf24', null, 0);
    }
    g.restore();
  } else if (cfg.headgear === 'viking_crown') {
    // ★ 바이킹 황제 라그나르의 거대 황금 뿔 투구 왕관
    g.save();
    g.fillStyle = '#fef08a';
    g.strokeStyle = '#451a03';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(45, 15);
    g.quadraticCurveTo(28, 13, 25, 3);
    g.quadraticCurveTo(35, 6, 46, 10);
    g.closePath();
    g.fill();
    g.stroke();

    g.beginPath();
    g.moveTo(83, 15);
    g.quadraticCurveTo(100, 13, 103, 3);
    g.quadraticCurveTo(93, 6, 82, 10);
    g.closePath();
    g.fill();
    g.stroke();

    drawRoundedRectPath(g, 44, 6.5, 40, 11.5, 4, '#fbbf24', clothLine, 1.5);
    drawRoundedRectPath(g, 62.2, 16, 3.6, 16, 1.5, '#fbbf24', clothLine, 1.2);
    drawRoundPart(g, 64, 12, 3.5, 3.5, 0, '#ef4444', clothLine, 1.0);
    g.restore();
  } else if (cfg.headgear === 'eastern_band') {
    drawRoundedRectPath(g, 45, 15, 38, 4.2, 2, '#1e1b4b', '#f472b6', 1.2);
    drawRoundPart(g, 78, 17, 3.2, 3.2, 0, '#f472b6', null, 0);
  }

  // ★ 캐릭터의 실제 양손 위치(lHandX, rHandX, handY)에 무기와 방패를 정확히 밀착!
  const lHandX = isFemale ? (64 - bp.shoulderW - 2.2) : (isViking ? 39.0 : 41.5);
  const rHandX = isFemale ? (64 + bp.shoulderW + 2.2) : (isViking ? 89.0 : 86.5);
  const handY = isFemale ? 69.0 : 71.5;

  if (cfg.weapon === 'sword_shield') {
    g.save();
    const sx = rHandX + 1.2;
    drawRoundedRectPath(g, sx - 2.3, handY - 7, 4.6, 14, 1.8, '#78350f', clothLine, 1.3);
    g.strokeStyle = '#fbbf24';
    g.lineWidth = 1.0;
    g.beginPath();
    g.moveTo(sx - 2.0, handY - 3.5); g.lineTo(sx + 2.0, handY - 3.5);
    g.moveTo(sx - 2.0, handY);       g.lineTo(sx + 2.0, handY);
    g.moveTo(sx - 2.0, handY + 3.5); g.lineTo(sx + 2.0, handY + 3.5);
    g.stroke();
    drawRoundPart(g, rHandX + 0.5, handY, 3.0, 2.5, 0, skin, skinLine, 1.1);
    drawRoundPart(g, sx, handY + 8.5, 3.2, 3.0, 0, '#fbbf24', clothLine, 1.3);
    drawRoundPart(g, sx, handY + 8.5, 1.4, 1.4, 0, '#ef4444', null, 0);

    const bladeTop = handY - 52;
    const bladeBot = handY - 8;
    const bladeGrad = g.createLinearGradient(sx - 3.5, bladeTop, sx + 3.5, bladeBot);
    bladeGrad.addColorStop(0, '#ffffff');
    bladeGrad.addColorStop(0.5, '#e2e8f0');
    bladeGrad.addColorStop(1, '#64748b');
    g.fillStyle = bladeGrad;
    g.strokeStyle = clothLine;
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(sx, bladeTop - 6);
    g.lineTo(sx + 3.6, bladeTop + 2);
    g.lineTo(sx + 3.3, bladeBot);
    g.lineTo(sx - 3.3, bladeBot);
    g.lineTo(sx - 3.6, bladeTop + 2);
    g.closePath();
    g.fill();
    g.stroke();
    g.strokeStyle = '#38bdf8';
    g.lineWidth = 1.1;
    g.beginPath();
    g.moveTo(sx, bladeTop + 1);
    g.lineTo(sx, bladeBot - 3);
    g.stroke();

    drawRoundedRectPath(g, sx - 7.5, bladeBot - 1.5, 15, 4.2, 2, '#fbbf24', clothLine, 1.3);
    drawRoundPart(g, sx, bladeBot + 0.6, 2.0, 2.0, 0, '#2563eb', clothLine, 0.9);
    g.restore();

    const shX = lHandX - 9.5;
    const shY = handY - 14;
    const shdGrad = g.createLinearGradient(shX, shY, shX + 15, shY + 21);
    shdGrad.addColorStop(0, '#60a5fa');
    shdGrad.addColorStop(0.5, '#2563eb');
    shdGrad.addColorStop(1, '#1e3a8a');
    drawRoundedRectPath(g, shX, shY, 15, 21, 5, shdGrad, clothLine, 1.5);
    drawRoundPart(g, shX + 7.5, shY + 10.5, 3.2, 3.2, 0, '#fbbf24', null, 0);
  } else if (cfg.weapon === 'staff') {
    const stX = rHandX + 0.5;
    drawRoundedRectPath(g, stX - 2, 24, 4, 64, 2, '#78350f', clothLine, 1.4);
    drawRoundPart(g, rHandX, handY, 2.8, 2.4, 0, skin, skinLine, 1.1);
    drawRoundPart(g, stX, 20, 8.5, 8.5, 0, '#c084fc', clothLine, 1.4);
    drawRoundPart(g, stX, 20, 4, 4, 0, '#ffffff', null, 0);
  } else if (cfg.weapon === 'bow') {
    const bx = rHandX - 1.0;
    g.save();
    g.strokeStyle = '#a16207';
    g.lineWidth = 3.0;
    g.beginPath();
    g.arc(bx, handY - 6, 18, -Math.PI * 0.45, Math.PI * 0.45);
    g.stroke();
    g.strokeStyle = '#e2e8f0';
    g.lineWidth = 1.1;
    g.beginPath();
    g.moveTo(bx + 2, handY - 23);
    g.lineTo(bx + 2, handY + 11);
    g.stroke();
    drawRoundPart(g, rHandX, handY, 2.8, 2.4, 0, skin, skinLine, 1.1);
    g.restore();
  } else if (cfg.weapon === 'elder_staff') {
    const stX = rHandX + 1.0;
    drawRoundedRectPath(g, stX - 2, 26, 4, 70, 2, '#713f12', clothLine, 1.4);
    drawRoundPart(g, rHandX, handY, 3.0, 2.5, 0, skin, skinLine, 1.1);
    drawRoundPart(g, stX, 22, 8, 8, 0, '#10b981', clothLine, 1.4);
    drawRoundPart(g, stX, 22, 3.5, 3.5, 0, '#a7f3d0', null, 0);
  } else if (cfg.weapon === 'forge_hammer') {
    const hx = rHandX + 4.5;
    drawRoundedRectPath(g, hx - 2.3, 24, 4.6, 66, 2, '#451a03', clothLine, 1.4);
    drawRoundedRectPath(g, hx - 11, 22, 22, 14, 3.5, '#475569', '#fbbf24', 1.5);
    drawRoundedRectPath(g, hx - 8, 24.5, 16, 9, 2, '#94a3b8', null, 0);
    drawRoundPart(g, rHandX, handY, 3.6, 3.0, 0, skin, skinLine, 1.1);
  } else if (cfg.weapon === 'dual_daggers') {
    for (const dx of [lHandX - 0.5, rHandX + 0.5]) {
      drawRoundedRectPath(g, dx - 1.8, handY - 6, 3.6, 9, 1.2, '#78350f', clothLine, 1.2);
      drawRoundPart(g, dx, handY - 7, 2.2, 2.2, 0, '#fbbf24', clothLine, 1.0);
      drawRoundedRectPath(g, dx - 4.2, handY + 2, 8.4, 2.6, 1.2, '#fbbf24', clothLine, 1.1);
      drawRoundedRectPath(g, dx - 2.0, handY + 4.5, 4.0, 14, 2, '#38bdf8', clothLine, 1.3);
      drawRoundPart(g, dx, handY - 1, 2.6, 2.2, 0, skin, skinLine, 1.0);
    }
  } else if (cfg.weapon === 'halberd') {
    const hx = rHandX + 1.5;
    drawRoundedRectPath(g, hx - 1.9, 18, 3.8, 80, 2, '#475569', clothLine, 1.4);
    drawRoundPart(g, rHandX, handY, 3.2, 2.6, 0, skin, skinLine, 1.1);
    drawRoundedRectPath(g, hx - 4, 10, 8.5, 15, 2.5, '#e2e8f0', clothLine, 1.4);
    drawRoundedRectPath(g, hx - 9.5, 15, 7.5, 7.5, 2, '#38bdf8', clothLine, 1.2);
  } else if (cfg.weapon === 'spyglass') {
    drawRoundedRectPath(g, rHandX - 1, handY - 4, 13, 5.5, 2.5, '#f59e0b', clothLine, 1.3);
    drawRoundedRectPath(g, rHandX + 9, handY - 5.5, 4.5, 8.5, 2, '#fef08a', clothLine, 1.2);
    drawRoundPart(g, rHandX, handY, 2.6, 2.2, 0, skin, skinLine, 1.0);
  } else if (cfg.weapon === 'pearl_basket') {
    drawRoundedRectPath(g, rHandX - 3, handY - 3, 13, 10, 3.5, '#f43f5e', clothLine, 1.3);
    drawRoundPart(g, rHandX + 3.5, handY, 3.5, 3.5, 0, '#ffffff', null, 0);
  } else if (cfg.weapon === 'gold_pouch') {
    drawRoundPart(g, rHandX + 1.5, handY + 1, 6.0, 7.0, 0, '#fbbf24', clothLine, 1.3);
    drawRoundedRectPath(g, rHandX - 1.5, handY - 6, 6, 3.0, 1.5, '#f59e0b', clothLine, 1.1);
  } else if (cfg.weapon === 'prayer_fan') {
    g.save();
    g.translate(rHandX + 1.5, handY - 1);
    g.fillStyle = '#ffffff';
    g.strokeStyle = '#38bdf8';
    g.lineWidth = 1.3;
    g.beginPath();
    g.moveTo(0, 4);
    g.arc(0, 4, 9.5, -Math.PI * 0.85, -Math.PI * 0.15);
    g.closePath();
    g.fill();
    g.stroke();
    g.strokeStyle = '#fbbf24';
    g.lineWidth = 0.9;
    g.beginPath();
    g.moveTo(0, 4); g.lineTo(-4.5, -3.5);
    g.moveTo(0, 4); g.lineTo(0, -5);
    g.moveTo(0, 4); g.lineTo(4.5, -3.5);
    g.stroke();
    g.restore();
  } else if (cfg.weapon === 'sea_scepter') {
    const stX = rHandX + 0.5;
    drawRoundedRectPath(g, stX - 2, 28, 4, 64, 2, '#fbbf24', clothLine, 1.4);
    drawRoundPart(g, rHandX, handY, 2.8, 2.4, 0, skin, skinLine, 1.1);
    drawRoundPart(g, stX, 24, 9, 9, 0, '#0ea5e9', clothLine, 1.4);
    drawRoundPart(g, stX, 24, 4, 4, 0, '#e0f2fe', null, 0);
  } else if (cfg.weapon === 'battleaxe') {
    // ★ 거친 바이킹 전사의 대형 초승달 전투도끼 (얼굴을 가리지 않고 바깥쪽으로 날렵하게 뻗음!)
    g.save();
    const axX = rHandX + 5.0; // ~94
    drawRoundedRectPath(g, axX - 2.3, 18, 4.6, 76, 2, '#451a03', clothLine, 1.5);
    drawRoundPart(g, axX, 16, 3.2, 4.5, 0, '#fbbf24', clothLine, 1.2);

    const axeGrad = g.createLinearGradient(axX, 22, axX + 20, 48);
    axeGrad.addColorStop(0, '#f8fafc');
    axeGrad.addColorStop(0.5, cfg.axeColor || '#dc2626');
    axeGrad.addColorStop(1, '#7f1d1d');
    g.fillStyle = axeGrad;
    g.strokeStyle = '#fbbf24';
    g.lineWidth = 1.4;
    // 우측 대칭 초승달 주 도끼날 (x: 94..116, 절대 안 잘림!)
    g.beginPath();
    g.moveTo(axX + 1.5, 24);
    g.bezierCurveTo(axX + 18, 17, axX + 23, 35, axX + 14, 50);
    g.quadraticCurveTo(axX + 7, 43, axX + 1.5, 40);
    g.closePath();
    g.fill();
    g.stroke();

    // 반대쪽 보조 스파이크 날
    g.beginPath();
    g.moveTo(axX - 1.5, 27);
    g.lineTo(axX - 9.5, 32);
    g.lineTo(axX - 1.5, 37);
    g.closePath();
    g.fill();
    g.stroke();

    drawRoundPart(g, rHandX + 1.5, handY, 3.8, 3.0, 0, skin, skinLine, 1.2);
    g.restore();
  } else if (cfg.weapon === 'katana') {
    const kx = rHandX + 1.2;
    drawRoundedRectPath(g, kx - 1.8, handY - 7, 3.6, 13, 1.5, '#1e1b4b', '#f472b6', 1.2);
    drawRoundedRectPath(g, kx - 5.5, handY - 8.5, 11, 2.6, 1.2, '#fbbf24', clothLine, 1.2);
    drawRoundedRectPath(g, kx - 1.8, handY - 54, 3.6, 46, 1.8, '#f8fafc', '#334155', 1.3);
    drawRoundPart(g, rHandX, handY, 2.8, 2.4, 0, skin, skinLine, 1.1);
  } else if (cfg.weapon === 'rapier') {
    const rx = rHandX + 1.2;
    drawRoundedRectPath(g, rx - 2.0, handY - 6, 4.0, 12, 1.5, '#be123c', '#fbbf24', 1.2);
    drawRoundPart(g, rx, handY - 7, 6.5, 4.0, 0, '#fbbf24', clothLine, 1.3);
    drawRoundedRectPath(g, rx - 1.6, handY - 56, 3.2, 48, 1.5, '#38bdf8', '#e0f2fe', 1.3);
    drawRoundPart(g, rHandX, handY, 2.8, 2.4, 0, skin, skinLine, 1.1);
  }
}
