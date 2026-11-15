function getHD64Sprite(type, flash = false, genderOverride = null) {
  const genderKey = genderOverride || ((typeof state !== 'undefined' && state.player && state.player.gender) ? state.player.gender : 'male');
  const isPlayerClass = (type === 'knight' || type === 'mage' || type === 'ranger');
  const isBossSprite = ['boss', 'boss_dragon', 'boss_balrog', 'boss_erik', 'boss_seraphiria'].includes(type);
  const cacheKey = `${type}_${isPlayerClass ? genderKey : 'fixed'}_${flash ? 1 : 0}_512v21`;
  if (hdSpriteCache[cacheKey]) return hdSpriteCache[cacheKey];

  // 512×512 고밀도 도트 버퍼로 렌더링하여 보스방(에리크/세라피리아/발록) 진입 시 동기 셰이더 렉/멈춤 현상을 원천 방지
  const size = 512;
  const scaleFactor = size / 128;
  const off = document.createElement('canvas');
  off.width = size;
  off.height = size;
  const g = ensureCanvasGradSupport(off.getContext('2d'));
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  g.save();
  g.scale(scaleFactor, scaleFactor);
  g.lineJoin = 'round';
  g.lineCap = 'round';

  // ================= [플레이어 3대 클래스 도트 스프라이트] =================
  if (type === 'knight') {
    const isFem = genderKey === 'female';
    drawSubcultureSDCharacter(g, {
      gender: genderKey,
      cupSize: 'C',
      eyeType: isFem ? 'rio_chic' : 'diluc_sharp',
      haloColor: isFem ? 'rgba(56, 189, 248, 0.75)' : null,
      hair: isFem ? '#fde047' : '#38bdf8',
      hairShade: isFem ? '#ca8a04' : '#0284c7',
      hairStyle: isFem ? 'long_wave' : 'sleek_layered',
      eye: '#2563eb',
      eyeLight: '#60a5fa',
      outfitMain: '#1e3a8a',
      outfitSub: '#3b82f6',
      trimGold: '#fbbf24',
      cape: '#dc2626',
      legStyle: 'stockings',
      headgear: 'crown',
      weapon: 'sword_shield'
    });
  }
  else if (type === 'mage') {
    const isFem = genderKey === 'female';
    drawSubcultureSDCharacter(g, {
      gender: genderKey,
      cupSize: 'D',
      eyeType: isFem ? 'aru_confident' : 'diluc_sharp',
      haloColor: isFem ? 'rgba(192, 132, 252, 0.8)' : null,
      hair: isFem ? '#f9a8d4' : '#e2e8f0',
      hairShade: isFem ? '#db2777' : '#64748b',
      hairStyle: isFem ? 'twintail' : 'sleek_layered',
      eye: '#9333ea',
      eyeLight: '#d8b4fe',
      outfitMain: '#4c1d95',
      outfitSub: '#a855f7',
      trimGold: '#f59e0b',
      cape: '#581c87',
      legStyle: 'stockings',
      headgear: 'witch_hat',
      weapon: 'staff'
    });
  }
  else if (type === 'ranger') {
    const isFem = genderKey === 'female';
    drawSubcultureSDCharacter(g, {
      gender: genderKey,
      cupSize: 'A',
      eyeType: isFem ? 'nonomi_soft' : 'xingqiu_clean',
      haloColor: isFem ? 'rgba(74, 222, 128, 0.75)' : null,
      hair: isFem ? '#6ee7b7' : '#fb923c',
      hairShade: isFem ? '#059669' : '#c2410c',
      hairStyle: isFem ? 'ponytail' : 'sleek_layered',
      eye: '#059669',
      eyeLight: '#6ee7b7',
      outfitMain: '#064e3b',
      outfitSub: '#10b981',
      trimGold: '#fbbf24',
      cape: '#166534',
      legStyle: 'thigh_boots',
      headgear: 'feather_hood',
      weapon: 'bow'
    });
  }
  // ================= [월드 NPC 도트 스프라이트 (1부 + 2부 전체)] =================
  else if (type === 'npc_mother') {
    drawSubcultureSDCharacter(g, {
      gender: 'female',
      cupSize: 'D',
      eyeType: 'nonomi_soft',
      hair: '#9a3412',
      hairShade: '#431407',
      hairStyle: 'braid_updo',
      eye: '#b45309',
      eyeLight: '#fcd34d',
      outfitMain: '#881337',
      outfitSub: '#fb7185',
      trimGold: '#fde68a',
      legStyle: 'long_gown',
      apron: true
    });
  }
  else if (type === 'npc_chief') {
    drawSubcultureSDCharacter(g, {
      gender: 'male',
      build: 'elder_gentleman',
      eyeType: 'diluc_sharp',
      maleOutfit: 'elder_vest',
      hair: '#f1f5f9',
      hairShade: '#94a3b8',
      eye: '#059669',
      eyeLight: '#6ee7b7',
      beard: 'elder_beard',
      outfitMain: '#064e3b',
      outfitSub: '#10b981',
      trimGold: '#fbbf24',
      pantsColor: '#0f172a',
      cape: '#115e59',
      headgear: 'elder_circlet',
      weapon: 'elder_staff'
    });
  }
  else if (type === 'npc_lady') {
    drawSubcultureSDCharacter(g, {
      gender: 'female',
      cupSize: 'C',
      eyeType: 'nonomi_soft',
      haloColor: 'rgba(125, 211, 252, 0.75)',
      hair: '#fef08a',
      hairShade: '#ca8a04',
      hairStyle: 'princess_curls',
      eye: '#0284c7',
      eyeLight: '#7dd3fc',
      outfitMain: '#1e40af',
      outfitSub: '#60a5fa',
      trimGold: '#fef08a',
      legStyle: 'long_gown',
      headgear: 'tiara_ribbon',
      weapon: 'prayer_fan'
    });
  }
  else if (type === 'npc_blacksmith') {
    drawSubcultureSDCharacter(g, {
      gender: 'male',
      build: 'muscular_middle',
      eyeType: 'diluc_sharp',
      maleOutfit: 'blacksmith_apron',
      skin: '#f3cfb3',
      skinMid: '#e2b492',
      skinShadow: '#c68b63',
      hair: '#334155',
      hairShade: '#0f172a',
      eye: '#d97706',
      eyeLight: '#fcd34d',
      beard: 'rugged_beard',
      outfitMain: '#27272a',
      outfitSub: '#92400e',
      trimGold: '#f59e0b',
      pantsColor: '#18181b',
      headgear: 'smith_bandana',
      weapon: 'forge_hammer'
    });
  }
  else if (type === 'npc_merchant') {
    drawSubcultureSDCharacter(g, {
      gender: 'female',
      cupSize: 'A',
      eyeType: 'nonomi_soft',
      haloColor: 'rgba(251, 191, 36, 0.75)',
      hair: '#fdba74',
      hairShade: '#c2410c',
      hairStyle: 'twintail',
      eye: '#059669',
      eyeLight: '#6ee7b7',
      outfitMain: '#065f46',
      outfitSub: '#34d399',
      trimGold: '#fbbf24',
      legStyle: 'stockings',
      headgear: 'merchant_beret',
      weapon: 'gold_pouch'
    });
  }
  else if (type === 'npc_scout') {
    drawSubcultureSDCharacter(g, {
      gender: 'female',
      cupSize: 'B',
      eyeType: 'rio_chic',
      hair: '#99f6e4',
      hairShade: '#0f766e',
      hairStyle: 'ponytail',
      eye: '#e11d48',
      eyeLight: '#fda4af',
      outfitMain: '#1f2937',
      outfitSub: '#f43f5e',
      trimGold: '#fbbf24',
      cape: '#881337',
      legStyle: 'hunter_leggings',
      headgear: 'scout_goggles',
      weapon: 'dual_daggers'
    });
  }
  else if (type === 'npc_guard_kyle') {
    drawSubcultureSDCharacter(g, {
      gender: 'male',
      build: 'muscular_middle',
      eyeType: 'diluc_sharp',
      maleOutfit: 'naval_double_breasted',
      hair: '#1e293b',
      hairShade: '#090d16',
      eye: '#0284c7',
      eyeLight: '#7dd3fc',
      beard: 'naval_stubble',
      outfitMain: '#172554',
      outfitSub: '#38bdf8',
      trimGold: '#fbbf24',
      pantsColor: '#f8fafc',
      cape: '#1e40af',
      headgear: 'naval_cap',
      weapon: 'halberd'
    });
  }
  else if (type === 'npc_marina') {
    drawSubcultureSDCharacter(g, {
      gender: 'female',
      cupSize: 'D',
      eyeType: 'rio_chic',
      haloColor: 'rgba(34, 211, 238, 0.8)',
      hair: '#67e8f9',
      hairShade: '#0891b2',
      hairStyle: 'long_wave',
      eye: '#0284c7',
      eyeLight: '#7dd3fc',
      outfitMain: '#0c4a6e',
      outfitSub: '#bae6fd',
      trimGold: '#fbbf24',
      cape: '#0284c7',
      legStyle: 'stockings',
      headgear: 'sea_tiara',
      weapon: 'sea_scepter'
    });
  }
  else if (type === 'npc_navigator') {
    drawSubcultureSDCharacter(g, {
      gender: 'female',
      cupSize: 'C',
      eyeType: 'aru_confident',
      hair: '#fb7185',
      hairShade: '#9f1239',
      hairStyle: 'pirate_waves',
      eye: '#d97706',
      eyeLight: '#fde047',
      outfitMain: '#1e1b4b',
      outfitSub: '#fb7185',
      trimGold: '#fbbf24',
      cape: '#4c0519',
      legStyle: 'hunter_leggings',
      headgear: 'tricorn_hat',
      weapon: 'spyglass'
    });
  }
  else if (type === 'npc_coral') {
    drawSubcultureSDCharacter(g, {
      gender: 'female',
      cupSize: 'B',
      eyeType: 'nonomi_soft',
      hair: '#fda4af',
      hairShade: '#e11d48',
      hairStyle: 'coral_waves',
      eye: '#0891b2',
      eyeLight: '#67e8f9',
      outfitMain: '#0e7490',
      outfitSub: '#38bdf8',
      trimGold: '#fde047',
      legStyle: 'tropical_sandals',
      headgear: 'seashell_pin',
      weapon: 'pearl_basket'
    });
  }
  // ================= [v2.0 신규 NPC 7인 도트 스프라이트] =================
  else if (type === 'npc_ghost_boy') {
    // 어린남자 귀신 제피르: 창백한 영혼 오라와 반투명 푸른빛 소년 실루엣
    const ghostAura = g.createRadialGradient(64, 68, 6, 64, 68, 46);
    ghostAura.addColorStop(0, 'rgba(165, 243, 252, 0.45)');
    ghostAura.addColorStop(0.6, 'rgba(139, 92, 246, 0.22)');
    ghostAura.addColorStop(1, 'rgba(139, 92, 246, 0)');
    g.fillStyle = ghostAura;
    g.beginPath();
    g.arc(64, 68, 46, 0, Math.PI * 2);
    g.fill();
    drawSubcultureSDCharacter(g, {
      gender: 'male',
      eyeType: 'xingqiu_clean',
      skin: '#e0f2fe',
      skinMid: '#bae6fd',
      skinShadow: '#7dd3fc',
      haloColor: 'rgba(125, 211, 252, 0.85)',
      hair: '#bae6fd',
      hairShade: '#0284c7',
      eye: '#38bdf8',
      eyeLight: '#e0f2fe',
      outfitMain: '#312e81',
      outfitSub: '#67e8f9',
      trimGold: '#c084fc',
      pantsColor: '#1e1b4b',
      cape: '#4c1d95'
    });
  }
  else if (type === 'npc_erik') {
    // 비어 케이브 붉은 바이킹 전사 에리크 NPC (보스 에리크와 통일감 있는 거친 붉은 수염 바이킹 전사 외형)
    drawSubcultureSDCharacter(g, {
      gender: 'male',
      build: 'viking_warrior',
      eyeType: 'diluc_sharp',
      hair: '#dc2626',
      hairShade: '#7f1d1d',
      eye: '#ef4444',
      eyeLight: '#fef08a',
      beard: 'viking_braid',
      outfitMain: '#7f1d1d',
      outfitSub: '#b91c1c',
      trimGold: '#fbbf24',
      pantsColor: '#1c1917',
      cape: '#450a0a',
      headgear: 'horned_helm',
      weapon: 'battleaxe',
      axeColor: '#dc2626'
    });
  }
  else if (type === 'npc_ragnar') {
    // 바이킹의 황제 라그나르 NPC (황금 뿔투구 왕관과 풍성한 금빛 땋은 수염을 지닌 바이킹 황제)
    drawSubcultureSDCharacter(g, {
      gender: 'male',
      build: 'viking_warrior',
      eyeType: 'diluc_sharp',
      hair: '#fbbf24',
      hairShade: '#b45309',
      eye: '#f59e0b',
      eyeLight: '#fef08a',
      beard: 'viking_braid',
      outfitMain: '#78350f',
      outfitSub: '#d97706',
      trimGold: '#fde047',
      pantsColor: '#1c1917',
      cape: '#991b1b',
      headgear: 'viking_crown',
      weapon: 'battleaxe',
      axeColor: '#f59e0b'
    });
  }
  else if (type === 'npc_nicholas') {
    // 해적들의 길목 동맹 바이킹 전사 니콜라스 NPC (거친 갈색 땋은 수염과 전투망치/도끼로 무장한 역전의 바이킹)
    drawSubcultureSDCharacter(g, {
      gender: 'male',
      build: 'viking_warrior',
      eyeType: 'diluc_sharp',
      hair: '#d97706',
      hairShade: '#78350f',
      eye: '#38bdf8',
      eyeLight: '#bae6fd',
      beard: 'viking_braid',
      outfitMain: '#1e3a8a',
      outfitSub: '#b45309',
      trimGold: '#fbbf24',
      pantsColor: '#0f172a',
      cape: '#1e293b',
      headgear: 'horned_helm',
      weapon: 'battleaxe',
      axeColor: '#64748b'
    });
  }
  else if (type === 'npc_thalassa') {
    // 해적의 대형 선박 내부 오션블루 병사 탈라사 NPC
    drawSubcultureSDCharacter(g, {
      gender: 'female',
      cupSize: 'B',
      eyeType: 'rio_chic',
      hair: '#38bdf8',
      hairShade: '#0369a1',
      hairStyle: 'ponytail',
      eye: '#0284c7',
      eyeLight: '#bae6fd',
      outfitMain: '#0c4a6e',
      outfitSub: '#38bdf8',
      trimGold: '#fbbf24',
      cape: '#1e3a8a',
      legStyle: 'thigh_boots',
      headgear: 'naval_cap',
      weapon: 'halberd'
    });
  }
  else if (type === 'npc_seraphiria') {
    // 해적 여왕의 집무실 세라피리아 NPC (성숙하고 글래머한 해적 여왕 '누님' 실루엣)
    drawSubcultureSDCharacter(g, {
      gender: 'female',
      cupSize: 'E',
      glamorous: true,
      eyeType: 'aru_confident',
      haloColor: 'rgba(244, 63, 94, 0.85)',
      hair: '#f43f5e',
      hairShade: '#881337',
      hairStyle: 'pirate_waves',
      eye: '#e11d48',
      eyeLight: '#fda4af',
      outfitMain: '#4c0519',
      outfitSub: '#e11d48',
      trimGold: '#fbbf24',
      cape: '#1e1b4b',
      legStyle: 'stockings',
      headgear: 'tricorn_hat',
      weapon: 'rapier'
    });
  }
  else if (type === 'npc_kirishima') {
    // 미나토마치 감시자 키리시마 NPC
    drawSubcultureSDCharacter(g, {
      gender: 'male',
      eyeType: 'diluc_sharp',
      maleOutfit: 'naval_double_breasted',
      hair: '#1e1b4b',
      hairShade: '#090d16',
      eye: '#e11d48',
      eyeLight: '#fda4af',
      outfitMain: '#1e1b4b',
      outfitSub: '#f472b6',
      trimGold: '#fbbf24',
      pantsColor: '#090d16',
      cape: '#31102f',
      headgear: 'eastern_band',
      weapon: 'katana'
    });
  }
  // ================= [전 몬스터 10종 1024×1024 하이엔드 도트/3D 일러스트 전면 개편] =================
  // - 슬라임: 말랑말랑하고 반투명한 젤리 질감 + 내부 마력 코어 & 기포 + 볼터치와 귀여운 표정
  // - 고블린 4종: 뾰족한 매부리코와 찢어진 입꼬리, 송곳니, 비열하게 치켜뜬 눈매, 병종별 디테일한 무장
  // - 오크 4종: 우람한 근육과 흉터, 거대한 하관과 부러진 엄니, 핏발 선 안광, 위압적인 중갑/도끼/주술 장비
  // - 보스 발록: 용암 혈관이 흐르는 악마 날개와 마그마 흉갑 코어, 화염 대검을 든 압도적 마왕 포스
  else if (type === 'slime') {
    // 1) 바닥 그림자 & 젤리 반사광
    drawRoundPart(g, 64, 108, 38, 9, 0, 'rgba(6, 78, 59, 0.38)', null, 0);

    // 2) 외곽 말랑한 젤리 바디 (물방울처럼 위가 살짝 솟은 귀여운 실루엣 + 3D 서브서피스 스캐터링 그라데이션)
    g.save();
    const slimeGrad = g.createRadialGradient(54, 62, 6, 64, 80, 42);
    slimeGrad.addColorStop(0, '#d1fae5');
    slimeGrad.addColorStop(0.35, '#34d399');
    slimeGrad.addColorStop(0.78, '#059669');
    slimeGrad.addColorStop(1, '#064e3b');
    g.fillStyle = slimeGrad;
    g.strokeStyle = '#022c22';
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(64, 42); // 정수리 탱글한 꼭지
    g.bezierCurveTo(88, 44, 104, 68, 100, 92);
    g.bezierCurveTo(96, 106, 32, 106, 28, 92);
    g.bezierCurveTo(24, 68, 40, 44, 64, 42);
    g.closePath();
    g.fill();
    g.stroke();

    // 3) 정수리 위 귀여운 젤리 방울 더듬이(Droplet Antenna)
    drawRoundPart(g, 64, 34, 5.5, 6.5, 0.15, '#6ee7b7', '#022c22', 1.4);
    drawRoundPart(g, 62.5, 32, 2.0, 2.5, 0, '#ffffff', null, 0);

    // 4) 반투명 젤리 내부에 떠 있는 신비한 마력 코어(Star Core) & 기포(Bubbles)
    const coreGrad = g.createRadialGradient(64, 78, 1, 64, 78, 12);
    coreGrad.addColorStop(0, '#fef08a');
    coreGrad.addColorStop(0.5, '#38bdf8');
    coreGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    g.fillStyle = coreGrad;
    g.beginPath();
    g.arc(64, 78, 12, 0, Math.PI * 2);
    g.fill();

    // 기포 방울 4개
    g.fillStyle = 'rgba(255, 255, 255, 0.45)';
    g.beginPath();
    g.arc(42, 82, 3.2, 0, Math.PI * 2);
    g.arc(47, 89, 1.8, 0, Math.PI * 2);
    g.arc(84, 78, 2.8, 0, Math.PI * 2);
    g.arc(79, 88, 1.6, 0, Math.PI * 2);
    g.fill();

    // 5) 하단 바닥면 투과광(Bounce Light) & 상단 대형 젤리 광택(Glossy Highlight)
    g.fillStyle = 'rgba(167, 243, 208, 0.42)';
    g.beginPath();
    g.ellipse(64, 96, 26, 5, 0, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = 'rgba(255, 255, 255, 0.78)';
    g.beginPath();
    g.ellipse(49, 55, 10, 5.2, -0.35, 0, Math.PI * 2);
    g.ellipse(39, 64, 3.2, 2.0, -0.35, 0, Math.PI * 2);
    g.fill();

    // 6) 귀엽고 말랑한 서브컬처 마물 표정 (발그레한 핑크 볼터치 + 또렷한 눈망울 + 귀여운 ㅅ자 고양이 입)
    g.fillStyle = 'rgba(244, 114, 182, 0.55)';
    g.beginPath();
    g.ellipse(44, 78, 5.2, 2.8, 0, 0, Math.PI * 2);
    g.ellipse(84, 78, 5.2, 2.8, 0, 0, Math.PI * 2);
    g.fill();

    // 왼쪽/오른쪽 눈
    for (const ex of [51, 77]) {
      g.fillStyle = '#064e3b';
      g.beginPath();
      g.ellipse(ex, 72, 4.2, 4.8, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#fef08a';
      g.beginPath();
      g.arc(ex, 73.5, 2.4, 0.1, Math.PI - 0.1);
      g.fill();
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.arc(ex - 1.3, 70.2, 1.5, 0, Math.PI * 2);
      g.fill();
    }

    // 귀여운 'ω' (고양이 입) 미소
    g.strokeStyle = '#022c22';
    g.lineWidth = 1.8;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(59, 77.5);
    g.quadraticCurveTo(61.5, 80.5, 64, 78);
    g.quadraticCurveTo(66.5, 80.5, 69, 77.5);
    g.stroke();
    g.restore();
  }
  else if (type === 'goblin' || type === 'goblin_archer' || type === 'goblin_brute' || type === 'goblin_shaman') {
    // ★ 고블린 4종: 교활하고 비열한 표정 (찌푸린 미간, 사악한 노란 파충류 눈, 매부리코, 삐죽 튀어나온 송곳니와 비열한 썩소!)
    const isArcher = type === 'goblin_archer';
    const isBrute = type === 'goblin_brute';
    const isShaman = type === 'goblin_shaman';
    const bodyW = isBrute ? 46 : 38;
    const armorCol = isShaman ? '#581c87' : (isBrute ? '#334155' : (isArcher ? '#7c2d12' : '#451a03'));

    drawRoundPart(g, 64, 112, 26, 7, 0, 'rgba(9, 13, 22, 0.45)', null, 0);

    // 1) 구부정하고 날렵한 다리 & 발톱 부츠
    drawRoundedRectPath(g, 48, 86, 10, 22, 4, '#4d7c0f', '#1a2e05', 1.5);
    drawRoundedRectPath(g, 70, 86, 10, 22, 4, '#3f6212', '#1a2e05', 1.5);
    drawRoundedRectPath(g, 46, 98, 13, 12, 4, '#271409', '#090d16', 1.5);
    drawRoundedRectPath(g, 69, 98, 13, 12, 4, '#271409', '#090d16', 1.5);

    // 2) 상체 가죽/철제 갑옷 & 해골 벨트
    const gArmorGrad = g.createLinearGradient(64 - bodyW / 2, 56, 64 + bodyW / 2, 92);
    gArmorGrad.addColorStop(0, shadeHexColor(armorCol, 0.28));
    gArmorGrad.addColorStop(0.5, armorCol);
    gArmorGrad.addColorStop(1, shadeHexColor(armorCol, -0.45));
    drawRoundedRectPath(g, 64 - bodyW / 2, 56, bodyW, 35, 10, gArmorGrad, '#18111c', 1.6);

    // X자 가죽 가슴 끈 & 해골 버클
    g.strokeStyle = '#92400e';
    g.lineWidth = 2.2;
    g.beginPath();
    g.moveTo(49, 58); g.lineTo(79, 86);
    g.moveTo(79, 58); g.lineTo(49, 86);
    g.stroke();
    drawRoundedRectPath(g, 44, 83, 40, 5, 2, '#271409', '#090d16', 1.2);
    drawRoundPart(g, 64, 85.5, 4.5, 4.0, 0, '#e2e8f0', '#1e293b', 1.2);

    // 붕대 감은 교활한 팔
    drawRoundPart(g, 40, 68, 5.5, 13, 0.25, '#65a30d', '#1a2e05', 1.4);
    drawRoundPart(g, 88, 68, 5.5, 13, -0.25, '#4d7c0f', '#1a2e05', 1.4);
    drawRoundedRectPath(g, 36, 70, 8, 6, 2, '#cbd5e1', '#475569', 1.1);
    drawRoundedRectPath(g, 84, 70, 8, 6, 2, '#cbd5e1', '#475569', 1.1);

    // 3) 양옆으로 길게 찢어진 칼날 귀(Notched Ears) & 금귀걸이
    g.save();
    g.fillStyle = '#65a30d';
    g.strokeStyle = '#1a2e05';
    g.lineWidth = 1.5;
    // 좌측 귀 (톱니 상처 디테일)
    g.beginPath();
    g.moveTo(42, 36);
    g.lineTo(14, 28);
    g.lineTo(22, 37);
    g.lineTo(17, 41);
    g.lineTo(43, 46);
    g.closePath();
    g.fill();
    g.stroke();
    // 우측 귀
    g.beginPath();
    g.moveTo(86, 36);
    g.lineTo(114, 28);
    g.lineTo(106, 37);
    g.lineTo(111, 41);
    g.lineTo(85, 46);
    g.closePath();
    g.fill();
    g.stroke();
    // 귀걸이 링
    drawRoundPart(g, 25, 41, 2.5, 2.5, 0, '#fbbf24', '#78350f', 1.0);
    g.restore();

    // 4) 비열한 역삼각형 고블린 두상 (광대가 튀어나오고 턱이 뾰족한 간교한 얼굴형)
    const gHeadGrad = g.createRadialGradient(56, 32, 4, 64, 40, 26);
    gHeadGrad.addColorStop(0, '#bef264');
    gHeadGrad.addColorStop(0.55, '#65a30d');
    gHeadGrad.addColorStop(1, '#365314');
    g.save();
    g.fillStyle = gHeadGrad;
    g.strokeStyle = '#1a2e05';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(42, 26);
    g.lineTo(39, 41); // 돌출된 광대
    g.lineTo(54, 55);
    g.lineTo(64, 58); // 뾰족하고 야비한 턱
    g.lineTo(74, 55);
    g.lineTo(89, 41);
    g.lineTo(86, 26);
    g.arc(64, 28, 22, 0, Math.PI, true);
    g.closePath();
    g.fill();
    g.stroke();

    // 눈 밑 다크서클 주름 & 비열하게 치켜올라간 사악한 눈(Yellow/Red Slit Eyes)
    const drawSneakyGoblinEye = (cx, cy, isLeft) => {
      // 다크서클 그늘
      g.fillStyle = 'rgba(26, 46, 5, 0.55)';
      g.beginPath();
      g.ellipse(cx, cy + 1.2, 5.5, 3.2, isLeft ? 0.25 : -0.25, 0, Math.PI * 2);
      g.fill();

      // 사악하게 찢어진 노란/보라 눈자위
      g.fillStyle = isShaman ? '#f0abfc' : '#fde047';
      g.strokeStyle = '#090d16';
      g.lineWidth = 1.3;
      g.beginPath();
      if (isLeft) {
        g.moveTo(cx - 5.2, cy - 2.2);
        g.lineTo(cx + 4.5, cy + 0.5);
        g.quadraticCurveTo(cx - 1, cy + 3.8, cx - 5.2, cy - 2.2);
      } else {
        g.moveTo(cx + 5.2, cy - 2.2);
        g.lineTo(cx - 4.5, cy + 0.5);
        g.quadraticCurveTo(cx + 1, cy + 3.8, cx + 5.2, cy - 2.2);
      }
      g.closePath();
      g.fill();
      g.stroke();

      // 붉은 테두리와 세로 파충류 슬릿 동공
      g.fillStyle = isShaman ? '#9333ea' : '#dc2626';
      g.beginPath();
      g.arc(cx, cy + 0.4, 2.1, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#090d16';
      g.fillRect(cx - 0.5, cy - 1.2, 1.0, 3.2);
      g.fillStyle = '#ffffff';
      g.fillRect(cx - 1.2, cy - 0.6, 0.9, 0.9);
    };
    drawSneakyGoblinEye(53, 38, true);
    drawSneakyGoblinEye(75, 38, false);

    // 미간 주름 & 길고 뾰족한 매부리코(Hooked Nose)
    g.strokeStyle = '#1a2e05';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(47, 33); g.lineTo(58, 37);
    g.moveTo(81, 33); g.lineTo(70, 37);
    g.stroke();

    g.fillStyle = '#4d7c0f';
    g.beginPath();
    g.moveTo(62, 37);
    g.lineTo(58, 45);
    g.lineTo(65, 46.5);
    g.lineTo(67, 43);
    g.closePath();
    g.fill();
    g.stroke();

    // ★ 비열하게 한쪽 입꼬리가 찢어져 올라간 썩소(Wicked Smirk) & 삐죽 나온 송곳니!
    g.fillStyle = '#18111c';
    g.beginPath();
    g.moveTo(52, 49);
    g.quadraticCurveTo(64, 52, 77, 46.5); // 오른쪽 입꼬리가 비열하게 치켜올라감
    g.quadraticCurveTo(66, 55.5, 52, 49);
    g.closePath();
    g.fill();
    g.stroke();

    // 뾰족한 송곳니 이빨들
    g.fillStyle = '#fef9c3';
    g.beginPath();
    g.moveTo(55, 50); g.lineTo(57, 46.5); g.lineTo(59, 50.5); g.closePath();
    g.moveTo(69, 48.5); g.lineTo(71.5, 44.5); g.lineTo(74, 48); g.closePath();
    g.fill();
    g.restore();

    // 5) 병종별 헤드기어 & 무기 디테일
    if (isArcher) {
      // 붉은 해적/산적 두건 & 독화살 활
      drawRoundedRectPath(g, 41, 18, 46, 10, 4, '#dc2626', '#450a0a', 1.4);
      drawRoundPart(g, 89, 22, 6, 3.5, 0.3, '#ef4444', '#450a0a', 1.2);
      g.save();
      g.strokeStyle = '#78350f';
      g.lineWidth = 3.5;
      g.beginPath();
      g.arc(94, 66, 22, -Math.PI * 0.45, Math.PI * 0.45);
      g.stroke();
      // 맹독이 발린 초록 화살촉
      g.strokeStyle = '#a16207';
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(84, 66); g.lineTo(114, 66);
      g.stroke();
      drawRoundPart(g, 114, 66, 4.5, 2.5, 0, '#22c55e', '#052e16', 1.1);
      g.restore();
    } else if (isBrute) {
      // 가시 박힌 강철 투구 & 대형 철퇴(Morningstar)
      drawRoundedRectPath(g, 40, 15, 48, 16, 6, '#475569', '#0f172a', 1.6);
      drawRoundPart(g, 44, 14, 4.5, 9, -0.4, '#cbd5e1', '#0f172a', 1.3);
      drawRoundPart(g, 84, 14, 4.5, 9, 0.4, '#cbd5e1', '#0f172a', 1.3);
      drawRoundedRectPath(g, 94, 34, 6, 54, 2, '#5c3419', '#1e130c', 1.4);
      drawRoundPart(g, 97, 28, 13, 13, 0, '#334155', '#0f172a', 1.6);
      drawRoundPart(g, 97, 13, 2.5, 5, 0, '#e2e8f0', '#0f172a', 1.0);
      drawRoundPart(g, 111, 28, 5, 2.5, 0, '#e2e8f0', '#0f172a', 1.0);
      drawRoundPart(g, 83, 28, 5, 2.5, 0, '#e2e8f0', '#0f172a', 1.0);
    } else if (isShaman) {
      // 고블린 주술사: 뿔 달린 짐승 해골 투구 & 저주 해골 지팡이
      drawRoundedRectPath(g, 41, 14, 46, 16, 7, '#f1f5f9', '#334155', 1.5);
      drawRoundPart(g, 36, 16, 8, 4, -0.5, '#cbd5e1', '#334155', 1.3);
      drawRoundPart(g, 92, 16, 8, 4, 0.5, '#cbd5e1', '#334155', 1.3);
      drawRoundPart(g, 55, 22, 3.5, 3.5, 0, '#a855f7', null, 0);
      drawRoundPart(g, 73, 22, 3.5, 3.5, 0, '#a855f7', null, 0);
      drawRoundedRectPath(g, 95, 24, 4.5, 68, 2, '#581c87', '#1e1b4b', 1.4);
      drawRoundPart(g, 97.2, 20, 10, 10, 0, '#c084fc', '#3b0764', 1.4);
      drawRoundPart(g, 97.2, 20, 4.5, 4.5, 0, '#ffffff', null, 0);
    } else {
      // 고블린 암살/납치병: 두건 & 독액이 뚝뚝 떨어지는 톱니 단검
      drawRoundedRectPath(g, 43, 17, 42, 11, 5, '#3f6212', '#1a2e05', 1.4);
      drawRoundedRectPath(g, 94, 40, 8, 36, 3, '#cbd5e1', '#1e293b', 1.5);
      drawRoundPart(g, 98, 46, 3.5, 8, 0, '#22c55e', null, 0); // 단검 독액
      drawRoundedRectPath(g, 90, 72, 16, 5, 2, '#78350f', '#1e130c', 1.3);
    }
  }
  else if (type === 'orc' || type === 'elite_orc' || type === 'orc_ranged' || type === 'orc_shaman' || type === 'orc_juggernaut' || type === 'orc_berserker') {
    // ★ 오크 4종: 우람한 근육질 거구, 험악하게 우거진 눈썹과 핏발 선 눈, 거대한 하관과 돌출된 야생 엄니(Tusks), 전투 흉터 & 워페인트!
    const isShaman = (type === 'orc_ranged' || type === 'orc_shaman');
    const isJugg = type === 'orc_juggernaut';
    const isBerserk = type === 'orc_berserker';
    const skinTop = isBerserk ? '#84cc16' : '#65a30d';
    const skinDark = '#2ec4b6' && '#27400b';
    const armorBase = isShaman ? '#4c1d95' : (isJugg ? '#1e293b' : (isBerserk ? '#7f1d1d' : '#78350f'));
    const pauldronCol = isShaman ? '#9333ea' : (isJugg ? '#64748b' : (isBerserk ? '#dc2626' : '#b45309'));

    drawRoundPart(g, 64, 114, 34, 8.5, 0, 'rgba(9, 13, 22, 0.52)', null, 0);

    // 1) 통나무처럼 굵고 튼튼한 하체 & 철제 각반 부츠
    drawRoundedRectPath(g, 43, 84, 16, 26, 5, '#365314', '#142404', 1.6);
    drawRoundedRectPath(g, 69, 84, 16, 26, 5, '#27400b', '#142404', 1.6);
    drawRoundedRectPath(g, 41, 96, 19, 15, 4, '#1e293b', '#090d16', 1.6);
    drawRoundedRectPath(g, 68, 96, 19, 15, 4, '#1e293b', '#090d16', 1.6);

    // 2) 압도적인 역삼각형 헐크 근육질 상체 & 흉터/갑주
    const oTorsoGrad = g.createLinearGradient(30, 48, 98, 92);
    oTorsoGrad.addColorStop(0, shadeHexColor(armorBase, 0.25));
    oTorsoGrad.addColorStop(0.5, armorBase);
    oTorsoGrad.addColorStop(1, shadeHexColor(armorBase, -0.5));
    drawRoundedRectPath(g, 32, 48, 64, 44, 14, oTorsoGrad, '#090d16', 1.8);

    // 굵직한 근육질 팔뚝 & 가시 철갑 건틀릿
    drawRoundPart(g, 26, 66, 10, 18, 0.18, skinTop, '#142404', 1.6);
    drawRoundPart(g, 102, 66, 10, 18, -0.18, '#3f6212', '#142404', 1.6);
    drawRoundedRectPath(g, 19, 70, 13, 12, 3, '#334155', '#090d16', 1.5);
    drawRoundedRectPath(g, 96, 70, 13, 12, 3, '#334155', '#090d16', 1.5);

    // 거대 스파이크 견장(Spiked Pauldrons)
    drawRoundPart(g, 28, 54, 15, 11, -0.2, pauldronCol, '#090d16', 1.6);
    drawRoundPart(g, 100, 54, 15, 11, 0.2, shadeHexColor(pauldronCol, -0.22), '#090d16', 1.6);
    // 견장 위 날카로운 강철 뿔
    drawRoundPart(g, 20, 44, 3.5, 8, -0.5, '#e2e8f0', '#0f172a', 1.3);
    drawRoundPart(g, 108, 44, 3.5, 8, 0.5, '#e2e8f0', '#0f172a', 1.3);

    // 해골 챔피언 벨트
    drawRoundedRectPath(g, 36, 82, 56, 8, 3, '#1e130c', '#090d16', 1.5);
    drawRoundPart(g, 64, 86, 7.5, 6.5, 0, '#fbbf24', '#78350f', 1.4);

    // 3) 험악하고 위압적인 오크 두상 (각진 광대와 거대한 하관, 붉은 워페인트 & 흉터)
    const oHeadGrad = g.createRadialGradient(56, 28, 4, 64, 38, 28);
    oHeadGrad.addColorStop(0, '#a3e635');
    oHeadGrad.addColorStop(0.55, '#4d7c0f');
    oHeadGrad.addColorStop(1, '#1a2e05');
    g.save();
    g.fillStyle = oHeadGrad;
    g.strokeStyle = '#142404';
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(40, 22);
    g.lineTo(36, 38);
    g.lineTo(38, 52); // 떡벌어진 험악한 하관 좌측
    g.lineTo(52, 57);
    g.lineTo(76, 57);
    g.lineTo(90, 52); // 떡벌어진 험악한 하관 우측
    g.lineTo(92, 38);
    g.lineTo(88, 22);
    g.arc(64, 24, 24, 0, Math.PI, true);
    g.closePath();
    g.fill();
    g.stroke();

    // 광전사/정예 오크의 붉은 전투 문신(War Paint) & 칼자국 흉터
    g.strokeStyle = isShaman ? '#c084fc' : '#dc2626';
    g.lineWidth = 2.4;
    g.beginPath();
    g.moveTo(46, 24); g.lineTo(52, 46);
    g.moveTo(82, 24); g.lineTo(76, 46);
    g.stroke();

    // 험악하게 찌푸린 두꺼운 근육 눈썹뼈 & 핏발 선 진홍빛 안광
    g.fillStyle = '#142404';
    g.beginPath();
    g.moveTo(42, 30); g.lineTo(61, 35); g.lineTo(61, 39); g.lineTo(42, 35); g.closePath();
    g.moveTo(86, 30); g.lineTo(67, 35); g.lineTo(67, 39); g.lineTo(86, 35); g.closePath();
    g.fill();

    for (const [ox, isL] of [[52, true], [76, false]]) {
      g.fillStyle = isShaman ? '#e879f9' : '#ef4444';
      g.beginPath();
      g.moveTo(ox - 5.5, 35);
      g.lineTo(ox + 5.5, 35);
      g.lineTo(ox + (isL ? 4 : -4), 39.5);
      g.lineTo(ox + (isL ? -4 : 4), 39.5);
      g.closePath();
      g.fill();
      g.fillStyle = '#fef08a';
      g.fillRect(ox - 1.5, 36, 3, 2.2);
    }

    // 큼직하고 험악한 들창코 & 콧구멍
    g.fillStyle = '#365314';
    drawRoundedRectPath(g, 58, 37, 12, 7, 3, '#365314', '#142404', 1.3);
    g.fillStyle = '#090d16';
    g.fillRect(60, 40.5, 2.5, 2.5);
    g.fillRect(65.5, 40.5, 2.5, 2.5);

    // ★ 으르렁거리는 거대한 아가리와 아래턱에서 솟아오른 대형 상아 엄니(Giant Tusks)!
    g.fillStyle = '#090d16';
    g.fillRect(46, 46, 36, 6);
    // 촘촘한 이빨
    g.fillStyle = '#e2e8f0';
    for (let tx = 53; tx <= 73; tx += 5) {
      g.fillRect(tx, 46.5, 3, 3.5);
    }
    // 좌우 거대 상아 엄니 (위쪽으로 날카롭게 솟구침)
    g.fillStyle = '#fef9c3';
    g.strokeStyle = '#451a03';
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(45, 52); g.lineTo(49, 39); g.lineTo(54, 52); g.closePath();
    g.moveTo(74, 52); g.lineTo(79, 39); g.lineTo(83, 52); g.closePath();
    g.fill();
    g.stroke();
    g.restore();

    // 4) 오크 병종별 투구 & 주무기
    if (isJugg) {
      // 중갑 방패병: 강철 바이저 투구 + 거대 성벽 타워 실드 + 분쇄 해머
      drawRoundedRectPath(g, 37, 12, 54, 18, 6, '#475569', '#090d16', 1.7);
      drawRoundedRectPath(g, 10, 44, 24, 48, 6, '#334155', '#090d16', 1.8);
      drawRoundedRectPath(g, 14, 50, 16, 36, 4, '#64748b', '#fbbf24', 1.3);
      drawRoundedRectPath(g, 98, 22, 8, 70, 3, '#475569', '#090d16', 1.6);
      drawRoundedRectPath(g, 88, 18, 26, 16, 4, '#94a3b8', '#090d16', 1.6);
    } else if (isShaman) {
      // 오크 흑마술사: 흑요석 뿔 왕관 & 심연의 마력구 지팡이
      drawRoundedRectPath(g, 39, 13, 50, 14, 5, '#3b0764', '#090d16', 1.5);
      drawRoundPart(g, 64, 12, 7, 7, 0, '#f43f5e', '#fbbf24', 1.3);
      drawRoundedRectPath(g, 98, 20, 6, 72, 3, '#4c1d95', '#090d16', 1.5);
      drawRoundPart(g, 101, 18, 13, 13, 0, '#a855f7', '#3b0764', 1.5);
      drawRoundPart(g, 101, 18, 6, 6, 0, '#fef08a', null, 0);
    } else if (isBerserk) {
      // 오크 광전사: 블랙 모호크 갈기 & 피 묻은 양손 쌍도끼
      drawRoundedRectPath(g, 58, 4, 12, 18, 4, '#dc2626', '#090d16', 1.4);
      drawRoundedRectPath(g, 98, 20, 6, 72, 3, '#78350f', '#090d16', 1.5);
      drawRoundPart(g, 104, 34, 18, 15, 0, '#ef4444', '#090d16', 1.6);
      drawRoundPart(g, 20, 48, 15, 13, 0, '#ef4444', '#090d16', 1.6);
    } else {
      // 오크 정예 도끼전사: 뿔 달린 워헬름 & 거대 양날 배틀액스
      drawRoundedRectPath(g, 39, 13, 50, 15, 5, '#78350f', '#090d16', 1.5);
      drawRoundPart(g, 35, 14, 9, 5, -0.5, '#fef08a', '#451a03', 1.4);
      drawRoundPart(g, 93, 14, 9, 5, 0.5, '#fef08a', '#451a03', 1.4);
      drawRoundedRectPath(g, 98, 20, 7, 72, 3, '#5c3419', '#090d16', 1.5);
      drawRoundPart(g, 104, 34, 19, 15, 0, '#cbd5e1', '#090d16', 1.6);
    }
  }
  else if (type === 'skeleton') {
    drawRoundedRectPath(g, 46, 62, 36, 36, 10, '#334155');
    drawRoundPart(g, 64, 40, 23, 21, 0, '#f1f5f9');
    g.fillStyle = '#0f172a';
    g.beginPath();
    g.arc(55, 40, 5.5, 0, Math.PI * 2);
    g.arc(73, 40, 5.5, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#38bdf8';
    g.beginPath();
    g.arc(55, 40, 2.2, 0, Math.PI * 2);
    g.arc(73, 40, 2.2, 0, Math.PI * 2);
    g.fill();
    drawRoundedRectPath(g, 92, 28, 10, 56, 4, '#94a3b8');
  }
  // ================= [v2.0 신규 몬스터 18종 + 신규 보스 2종 도트 스프라이트] =================
  else if (type.startsWith('pirate_') || type.startsWith('elite_pirate_')) {
    // 플라워 아일랜드 해적 5종 & 해적 대형 선박 상급 해적 4종
    const isElite = type.startsWith('elite_pirate_');
    const isGunner = type === 'pirate_gunner' || type === 'elite_pirate_sharpshooter';
    const isBomber = type === 'pirate_bomber' || type === 'elite_pirate_cannoneer';
    const isHeavyP = type === 'pirate_brawler' || type === 'elite_pirate_boatswain' || type === 'elite_pirate_royalguard';
    const isDuelist = type === 'pirate_duelist';

    const coatCol = isElite
      ? (isHeavyP ? '#4c0519' : (isGunner ? '#1e1b4b' : '#7f1d1d'))
      : (isHeavyP ? '#7c2d12' : (isGunner ? '#1e3a8a' : (isBomber ? '#374151' : '#991b1b')));
    const accentCol = isElite ? '#fbbf24' : '#38bdf8';

    drawRoundPart(g, 64, 113, 30, 8, 0, 'rgba(9, 13, 22, 0.48)', null, 0);
    // 해적 부츠 & 바지
    drawRoundedRectPath(g, 46, 84, 13, 25, 4, '#1e293b', '#090d16', 1.5);
    drawRoundedRectPath(g, 69, 84, 13, 25, 4, '#0f172a', '#090d16', 1.5);
    drawRoundedRectPath(g, 44, 96, 16, 14, 4, '#271409', '#090d16', 1.5);
    drawRoundedRectPath(g, 68, 96, 16, 14, 4, '#271409', '#090d16', 1.5);

    // 해적 선장/선원 코트 상체
    const bodyW = isHeavyP ? 54 : 44;
    const pGrad = g.createLinearGradient(64 - bodyW / 2, 50, 64 + bodyW / 2, 90);
    pGrad.addColorStop(0, shadeHexColor(coatCol, 0.25));
    pGrad.addColorStop(0.5, coatCol);
    pGrad.addColorStop(1, shadeHexColor(coatCol, -0.45));
    drawRoundedRectPath(g, 64 - bodyW / 2, 50, bodyW, 40, 11, pGrad, '#090d16', 1.7);

    // 줄무늬 이너 셔츠 & 해골 벨트
    drawRoundedRectPath(g, 56, 52, 16, 26, 3, '#f8fafc', '#1e293b', 1.2);
    g.fillStyle = '#0284c7';
    for (let sy = 56; sy <= 72; sy += 5) {
      g.fillRect(57, sy, 14, 2);
    }
    drawRoundedRectPath(g, 64 - bodyW / 2 + 2, 81, bodyW - 4, 7, 3, '#18181b', accentCol, 1.4);
    drawRoundPart(g, 64, 84.5, 5.5, 5.0, 0, '#fbbf24', '#090d16', 1.3);

    // 양팔
    drawRoundPart(g, 64 - bodyW / 2 - 5, 66, 7.5, 16, 0.2, coatCol, '#090d16', 1.5);
    drawRoundPart(g, 64 + bodyW / 2 + 5, 66, 7.5, 16, -0.2, shadeHexColor(coatCol, -0.2), '#090d16', 1.5);
    drawRoundPart(g, 64 - bodyW / 2 - 7, 78, 4.5, 4.5, 0, '#f3cfb3', '#451a03', 1.2);
    drawRoundPart(g, 64 + bodyW / 2 + 7, 78, 4.5, 4.5, 0, '#f3cfb3', '#451a03', 1.2);

    // 얼굴 & 애꾸눈 안대 & 콧수염
    drawRoundPart(g, 64, 36, 19, 18, 0, '#f3cfb3', '#271409', 1.6);
    // 오른쪽 눈 검은 해적 안대(Eyepatch)
    g.strokeStyle = '#090d16';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(46, 30); g.lineTo(82, 38);
    g.stroke();
    drawRoundPart(g, 71, 35, 5.5, 4.5, 0, '#090d16', '#334155', 1.2);
    // 왼쪽 매서운 눈
    drawRoundPart(g, 55, 35, 3.8, 3.2, 0, '#ffffff', '#090d16', 1.1);
    drawRoundPart(g, 55, 35, 1.8, 1.8, 0, isElite ? '#ef4444' : '#090d16', null, 0);
    // 비열한 해적 미소 & 수염
    g.fillStyle = '#271409';
    g.fillRect(54, 42, 20, 3);
    g.fillStyle = '#fef9c3';
    g.fillRect(57, 42.5, 4, 2);
    g.fillRect(66, 42.5, 4, 2);

    // 해적 삼각모(Tricorn) 또는 붉은 두건(Bandana)
    if (isElite || isDuelist || isGunner) {
      g.save();
      g.fillStyle = isElite ? '#18181b' : '#1e1b4b';
      g.strokeStyle = '#fbbf24';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(34, 24);
      g.lineTo(64, 7);
      g.lineTo(94, 24);
      g.closePath();
      g.fill();
      g.stroke();
      // 해골 엠블럼
      drawRoundPart(g, 64, 18, 4.5, 4.5, 0, '#f8fafc', '#090d16', 1.0);
      g.restore();
    } else {
      drawRoundedRectPath(g, 44, 17, 40, 10, 4, '#dc2626', '#450a0a', 1.5);
      drawRoundPart(g, 87, 22, 6, 3.5, 0.35, '#ef4444', '#450a0a', 1.2);
    }

    // 병종별 무기 (권총/소총, 폭탄/대포, 닻/할버드, 커틀러스)
    if (isGunner) {
      drawRoundedRectPath(g, 90, 58, 26, 7, 2.5, '#334155', '#090d16', 1.4);
      drawRoundedRectPath(g, 88, 63, 8, 11, 2, '#78350f', '#090d16', 1.3);
      drawRoundPart(g, 116, 61, 4, 4, 0, '#fbbf24', null, 0);
    } else if (isBomber) {
      drawRoundPart(g, 98, 56, 13, 13, 0, '#18181b', '#fbbf24', 1.5);
      drawRoundPart(g, 102, 42, 4.5, 4.5, 0, '#f97316', '#fde047', 1.1);
    } else if (isHeavyP) {
      drawRoundedRectPath(g, 96, 22, 7, 70, 3, '#475569', '#090d16', 1.6);
      drawRoundPart(g, 99.5, 28, 16, 12, 0, '#fbbf24', '#090d16', 1.6);
    } else {
      // 해적 곡도(Cutlass)
      g.save();
      g.fillStyle = '#e2e8f0';
      g.strokeStyle = '#090d16';
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(96, 72);
      g.quadraticCurveTo(114, 46, 102, 22);
      g.quadraticCurveTo(96, 46, 92, 72);
      g.closePath();
      g.fill();
      g.stroke();
      drawRoundedRectPath(g, 90, 70, 12, 5, 2, '#fbbf24', '#090d16', 1.3);
      g.restore();
    }
  }
  else if (type.startsWith('viking_')) {
    // 비어 케이브 바이킹 5종 (도끼전사, 투척병, 방패병, 광전사, 룬 주술사) — 거친 북방 전사 비주얼
    const isThrower = type === 'viking_thrower';
    const isShield = type === 'viking_shieldbearer';
    const isBerserk = type === 'viking_berserker';
    const isPriest = type === 'viking_runepriest';

    const armorCol = isBerserk ? '#991b1b' : (isPriest ? '#1e3a8a' : (isShield ? '#475569' : '#78350f'));
    const beardCol = isBerserk ? '#dc2626' : (isPriest ? '#e2e8f0' : '#d97706');
    const beardDark = isBerserk ? '#7f1d1d' : (isPriest ? '#94a3b8' : '#92400e');

    drawRoundPart(g, 64, 114, 33, 8.5, 0, 'rgba(9, 13, 22, 0.50)', null, 0);
    // 모피 각반 & 가죽 부츠
    drawRoundedRectPath(g, 44, 84, 15, 26, 4, '#451a03', '#090d16', 1.6);
    drawRoundedRectPath(g, 69, 84, 15, 26, 4, '#451a03', '#090d16', 1.6);
    drawRoundedRectPath(g, 42, 95, 18, 15, 4, '#271409', '#090d16', 1.6);
    drawRoundedRectPath(g, 68, 95, 18, 15, 4, '#271409', '#090d16', 1.6);

    // 우람한 바이킹 가죽/사슬 갑옷 상체 & 늑대 모피 어깨 칼라 & X자 가죽 하네스
    drawRoundPart(g, 64, 52, 35, 15, 0, '#44403c', '#090d16', 1.6);
    drawRoundedRectPath(g, 35, 49, 58, 42, 12, armorCol, '#090d16', 1.8);
    g.strokeStyle = '#271409';
    g.lineWidth = 3.2;
    g.beginPath();
    g.moveTo(41, 52); g.lineTo(85, 82);
    g.moveTo(87, 52); g.lineTo(43, 82);
    g.stroke();
    drawRoundedRectPath(g, 37, 81, 54, 7, 3, '#18181b', '#fbbf24', 1.4);
    drawRoundPart(g, 64, 84.5, 6, 5.5, 0, '#fbbf24', '#090d16', 1.3);

    // 근육질 양팔 & 가죽 토시
    drawRoundPart(g, 29, 65, 8.5, 16, 0.18, '#f3cfb3', '#451a03', 1.5);
    drawRoundPart(g, 99, 65, 8.5, 16, -0.18, '#e2b492', '#451a03', 1.5);
    drawRoundedRectPath(g, 24, 68, 10, 7, 2, '#451a03', '#fbbf24', 1.2);
    drawRoundedRectPath(g, 94, 68, 10, 7, 2, '#451a03', '#fbbf24', 1.2);

    // 얼굴 & 풍성한 세 갈래 땋은 바이킹 수염
    drawRoundPart(g, 64, 35, 19, 17, 0, '#f3cfb3', '#271409', 1.6);
    g.fillStyle = beardCol;
    g.strokeStyle = '#271409';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(46, 39);
    g.quadraticCurveTo(44, 52, 52, 60);
    g.lineTo(57, 55);
    g.lineTo(64, 63);
    g.lineTo(71, 55);
    g.lineTo(76, 60);
    g.quadraticCurveTo(84, 52, 82, 39);
    g.quadraticCurveTo(64, 44, 46, 39);
    g.closePath();
    g.fill();
    g.stroke();
    // 콧수염 & 수염 링
    drawRoundPart(g, 56, 42, 8, 3.5, -0.2, beardDark, '#271409', 1.1);
    drawRoundPart(g, 72, 42, 8, 3.5, 0.2, beardDark, '#271409', 1.1);
    drawRoundedRectPath(g, 61.5, 56, 5, 2.5, 1, '#fbbf24', '#271409', 0.9);

    // 매서운 눈 & 흉터
    drawRoundPart(g, 55, 34, 3.8, 2.5, 0.15, isBerserk ? '#ef4444' : '#fef08a', '#090d16', 1.1);
    drawRoundPart(g, 73, 34, 3.8, 2.5, -0.15, isBerserk ? '#ef4444' : '#fef08a', '#090d16', 1.1);

    // 양쪽에 날카로운 뿔이 솟은 바이킹 강철 코보호대 투구
    g.fillStyle = '#fef08a';
    g.strokeStyle = '#451a03';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(44, 20); g.quadraticCurveTo(28, 17, 25, 6); g.quadraticCurveTo(35, 10, 46, 15); g.closePath();
    g.fill(); g.stroke();
    g.beginPath();
    g.moveTo(84, 20); g.quadraticCurveTo(100, 17, 103, 6); g.quadraticCurveTo(93, 10, 82, 15); g.closePath();
    g.fill(); g.stroke();
    drawRoundedRectPath(g, 42, 12, 44, 15, 6, '#475569', '#090d16', 1.6);
    drawRoundedRectPath(g, 41, 23, 46, 4, 1.5, '#64748b', '#fbbf24', 1.2);
    drawRoundedRectPath(g, 61.5, 23, 5, 14, 1.5, '#94a3b8', '#090d16', 1.3);

    // 병종별 무기 (초승달 도끼날로 개선하여 잘림 방지)
    if (isShield) {
      drawRoundPart(g, 24, 68, 17, 17, 0, '#b45309', '#fbbf24', 2.0);
      drawRoundPart(g, 24, 68, 6, 6, 0, '#cbd5e1', '#090d16', 1.3);
      drawRoundedRectPath(g, 97, 24, 5.5, 64, 2.5, '#5c3419', '#090d16', 1.5);
      g.fillStyle = '#cbd5e1';
      g.strokeStyle = '#090d16';
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(101, 28); g.bezierCurveTo(116, 22, 119, 38, 112, 50); g.quadraticCurveTo(106, 44, 101, 41); g.closePath();
      g.fill(); g.stroke();
    } else if (isPriest) {
      drawRoundedRectPath(g, 97, 20, 5.5, 72, 2.5, '#451a03', '#090d16', 1.5);
      drawRoundPart(g, 99.8, 18, 11, 11, 0, '#38bdf8', '#e0f2fe', 1.5);
    } else {
      drawRoundedRectPath(g, 97, 22, 5.5, 68, 2.5, '#5c3419', '#090d16', 1.5);
      g.fillStyle = isBerserk ? '#ef4444' : '#e2e8f0';
      g.strokeStyle = '#fbbf24';
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(101, 26); g.bezierCurveTo(117, 19, 120, 38, 112, 52); g.quadraticCurveTo(106, 45, 101, 42); g.closePath();
      g.fill(); g.stroke();
      if (isThrower || isBerserk) {
        drawRoundedRectPath(g, 25.5, 28, 5.5, 58, 2.5, '#5c3419', '#090d16', 1.5);
        g.beginPath();
        g.moveTo(27, 32); g.bezierCurveTo(11, 25, 8, 44, 16, 56); g.quadraticCurveTo(22, 49, 27, 46); g.closePath();
        g.fill(); g.stroke();
      }
    }
  }
  else if (type.startsWith('black_robe_')) {
    // 해적들의 길목 검은 로브의 수상한 자들 4종 (암살자, 흑마술사, 집행자, 저격수)
    const isWarlock = type === 'black_robe_warlock';
    const isEnforcer = type === 'black_robe_enforcer';
    const isMarksman = type === 'black_robe_marksman';
    const glowCol = isWarlock ? '#c084fc' : (isEnforcer ? '#ef4444' : (isMarksman ? '#38bdf8' : '#a855f7'));

    drawRoundPart(g, 64, 113, 30, 8, 0, 'rgba(9, 13, 22, 0.55)', null, 0);

    // 검은 로브 하단 자락
    g.save();
    const robeGrad = g.createLinearGradient(34, 44, 94, 110);
    robeGrad.addColorStop(0, '#1e1b4b');
    robeGrad.addColorStop(0.5, '#0f172a');
    robeGrad.addColorStop(1, '#020617');
    g.fillStyle = robeGrad;
    g.strokeStyle = glowCol;
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(42, 46);
    g.lineTo(86, 46);
    g.lineTo(96, 108);
    g.quadraticCurveTo(64, 114, 32, 108);
    g.closePath();
    g.fill();
    g.stroke();

    // 깊은 검은 후드(Hood)와 어둠 속에서 빛나는 두 눈
    g.beginPath();
    g.moveTo(38, 46);
    g.quadraticCurveTo(36, 16, 64, 10);
    g.quadraticCurveTo(92, 16, 90, 46);
    g.closePath();
    g.fill();
    g.stroke();

    // 후드 안쪽 칠흑의 그림자
    drawRoundPart(g, 64, 34, 16, 14, 0, '#020617', '#1e1b4b', 1.2);
    // 빛나는 안광
    drawRoundPart(g, 57, 34, 3.8, 2.2, 0.15, glowCol, '#ffffff', 0.8);
    drawRoundPart(g, 71, 34, 3.8, 2.2, -0.15, glowCol, '#ffffff', 0.8);
    g.restore();

    // 무기 (흑마술 지팡이, 대검, 석궁, 암살 쌍단검)
    if (isWarlock) {
      drawRoundedRectPath(g, 96, 20, 5, 74, 2, '#3b0764', '#090d16', 1.4);
      drawRoundPart(g, 98.5, 18, 12, 12, 0, '#a855f7', '#f0abfc', 1.4);
    } else if (isEnforcer) {
      drawRoundedRectPath(g, 96, 16, 9, 78, 3, '#334155', '#ef4444', 1.6);
    } else if (isMarksman) {
      drawRoundedRectPath(g, 88, 56, 28, 7, 2.5, '#1e293b', '#38bdf8', 1.4);
    } else {
      drawRoundedRectPath(g, 94, 48, 5, 32, 2, '#c084fc', '#090d16', 1.4);
      drawRoundedRectPath(g, 29, 48, 5, 32, 2, '#c084fc', '#090d16', 1.4);
    }
  }
  else if (type === 'boss_erik') {
    // =========================================================================
    // [고밀도 보스 도트] 붉은 바이킹 전사 에리크 (Lv.19 보스)
    //  - NPC 에리크와 완벽한 통일감을 이루면서도 광전사의 투기와 쌍수 대형 전투도끼를 갖춘 보스 도트
    //  - 모든 도끼날과 뿔 좌표를 x: 7..121, y: 4..120 안전 영역 내부에 설계하여 잘림 현상 100% 해결!
    // =========================================================================
    const auraGrad = g.createRadialGradient(64, 113, 6, 64, 113, 52);
    auraGrad.addColorStop(0, 'rgba(239, 68, 68, 0.78)');
    auraGrad.addColorStop(0.55, 'rgba(245, 158, 11, 0.42)');
    auraGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    g.fillStyle = auraGrad;
    g.beginPath();
    g.ellipse(64, 113, 52, 12, 0, 0, Math.PI * 2);
    g.fill();

    // 1) 붉은 늑대 군주 망토(Crimson Wolf-Pelt Cloak)
    g.save();
    const cloakGrad = g.createLinearGradient(28, 46, 100, 108);
    cloakGrad.addColorStop(0, '#7f1d1d');
    cloakGrad.addColorStop(0.5, '#450a0a');
    cloakGrad.addColorStop(1, '#1c1917');
    g.fillStyle = cloakGrad;
    g.strokeStyle = '#090d16';
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(34, 48);
    g.bezierCurveTo(24, 68, 22, 92, 26, 108);
    g.lineTo(36, 104); g.lineTo(46, 109); g.lineTo(64, 105); g.lineTo(82, 109); g.lineTo(92, 104); g.lineTo(102, 108);
    g.bezierCurveTo(106, 92, 104, 68, 94, 48);
    g.closePath();
    g.fill();
    g.stroke();
    g.restore();

    // 2) 강인한 하체 & 철제 모피 군화
    drawRoundedRectPath(g, 43, 80, 17, 26, 5, '#1c1917', '#090d16', 1.8);
    drawRoundedRectPath(g, 68, 80, 17, 26, 5, '#1c1917', '#090d16', 1.8);
    drawRoundedRectPath(g, 41.5, 92, 20, 6, 2.5, '#57534e', '#090d16', 1.4);
    drawRoundedRectPath(g, 66.5, 92, 20, 6, 2.5, '#57534e', '#090d16', 1.4);
    drawRoundedRectPath(g, 42, 96, 19, 15, 4, '#271409', '#fbbf24', 1.5);
    drawRoundedRectPath(g, 67, 96, 19, 15, 4, '#271409', '#fbbf24', 1.5);

    // 3) 근육질 바이킹 흉갑 & X자 가죽 하네스 & 북방 늑대 모피 어깨 칼라
    const chestGrad = g.createLinearGradient(34, 46, 94, 86);
    chestGrad.addColorStop(0, '#b91c1c');
    chestGrad.addColorStop(0.5, '#991b1b');
    chestGrad.addColorStop(1, '#450a0a');
    drawRoundedRectPath(g, 34, 47, 60, 39, 11, chestGrad, '#fbbf24', 1.8);

    // 가슴 X자 가죽 벨트 & 황금 리벳
    g.strokeStyle = '#1c1917';
    g.lineWidth = 4.2;
    g.beginPath();
    g.moveTo(39, 50); g.lineTo(87, 81);
    g.moveTo(89, 50); g.lineTo(41, 81);
    g.stroke();
    g.strokeStyle = '#fbbf24';
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(39, 50); g.lineTo(87, 81);
    g.moveTo(89, 50); g.lineTo(41, 81);
    g.stroke();

    // 거친 북방 늑대 모피 어깨 칼라(Jagged Wolf Fur Mantle)
    g.fillStyle = '#44403c';
    g.strokeStyle = '#090d16';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(28, 48);
    g.quadraticCurveTo(64, 42, 100, 48);
    g.lineTo(97, 58); g.lineTo(89, 53); g.lineTo(82, 59); g.lineTo(73, 54);
    g.lineTo(64, 60);
    g.lineTo(55, 54); g.lineTo(46, 59); g.lineTo(39, 53); g.lineTo(31, 58);
    g.closePath();
    g.fill();
    g.stroke();

    // 양 어깨 스파이크 철제 견장 & 근육질 팔
    drawRoundPart(g, 33, 52, 10, 6.5, -0.2, '#475569', '#fbbf24', 1.5);
    drawRoundPart(g, 95, 52, 10, 6.5, 0.2, '#475569', '#fbbf24', 1.5);
    drawRoundPart(g, 29, 47, 3, 5, -0.45, '#f8fafc', '#090d16', 1.2);
    drawRoundPart(g, 99, 47, 3, 5, 0.45, '#f8fafc', '#090d16', 1.2);

    drawRoundPart(g, 31, 66, 8.5, 14, 0.15, '#e2b08a', '#422320', 1.5);
    drawRoundPart(g, 97, 66, 8.5, 14, -0.15, '#c58960', '#422320', 1.5);
    drawRoundedRectPath(g, 25.5, 67, 11, 8, 2.5, '#451a03', '#fbbf24', 1.3);
    drawRoundedRectPath(g, 91.5, 67, 11, 8, 2.5, '#451a03', '#fbbf24', 1.3);

    // 바이킹 챔피언 벨트 & 해골 룬 버클
    drawRoundedRectPath(g, 36, 79, 56, 7.5, 3, '#18181b', '#fbbf24', 1.6);
    drawRoundPart(g, 64, 82.8, 7.5, 6.0, 0, '#fbbf24', '#451a03', 1.5);
    drawRoundPart(g, 64, 82.8, 3.2, 3.2, 0, '#dc2626', null, 0);

    // 4) 에리크의 강인한 안면, 칼자국 흉터, 이글거리는 분노의 안광, 풍성한 3갈래 땋은 붉은 수염
    drawRoundPart(g, 64, 33, 20, 17, 0, '#f3cfb3', '#271409', 1.7);
    // 왼쪽 눈가 흉터
    g.strokeStyle = '#7f1d1d';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(50, 26); g.lineTo(56, 40);
    g.stroke();

    // 3갈래로 굵게 땋아 내린 진홍색 바이킹 수염(Braided Crimson Viking Beard)
    const erikBeardGrad = g.createLinearGradient(44, 38, 84, 65);
    erikBeardGrad.addColorStop(0, '#ef4444');
    erikBeardGrad.addColorStop(0.5, '#dc2626');
    erikBeardGrad.addColorStop(1, '#7f1d1d');
    g.fillStyle = erikBeardGrad;
    g.strokeStyle = '#450a0a';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(44.5, 36.5);
    g.quadraticCurveTo(42.5, 49, 49.5, 59.5);
    g.lineTo(54.5, 64.5);
    g.lineTo(58.5, 58.0);
    g.lineTo(64.0, 66.5);
    g.lineTo(69.5, 58.0);
    g.lineTo(73.5, 64.5);
    g.lineTo(78.5, 59.5);
    g.quadraticCurveTo(85.5, 49, 83.5, 36.5);
    g.quadraticCurveTo(75, 42.5, 64, 43.0);
    g.quadraticCurveTo(53, 42.5, 44.5, 36.5);
    g.closePath();
    g.fill();
    g.stroke();

    // 굵은 팔자 콧수염 & 황금 수염 링 3개
    g.fillStyle = '#dc2626';
    g.strokeStyle = '#450a0a';
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(64, 38.5);
    g.quadraticCurveTo(54, 37, 46.5, 44);
    g.quadraticCurveTo(55, 46, 64, 42.2);
    g.quadraticCurveTo(73, 46, 81.5, 44);
    g.quadraticCurveTo(74, 37, 64, 38.5);
    g.closePath();
    g.fill();
    g.stroke();

    drawRoundedRectPath(g, 51.8, 57.5, 5.4, 2.8, 1, '#fbbf24', '#451a03', 1.0);
    drawRoundedRectPath(g, 61.0, 59.5, 6.0, 3.0, 1, '#fbbf24', '#451a03', 1.0);
    drawRoundedRectPath(g, 70.8, 57.5, 5.4, 2.8, 1, '#fbbf24', '#451a03', 1.0);

    // 분노로 이글거리는 눈매 & 짙은 붉은 눈썹
    drawRoundPart(g, 54, 33, 4.4, 2.8, 0.18, '#fef08a', '#dc2626', 1.3);
    drawRoundPart(g, 74, 33, 4.4, 2.8, -0.18, '#fef08a', '#dc2626', 1.3);
    drawRoundPart(g, 54, 33, 1.8, 1.8, 0, '#ef4444', null, 0);
    drawRoundPart(g, 74, 33, 1.8, 1.8, 0, '#ef4444', null, 0);
    g.strokeStyle = '#450a0a';
    g.lineWidth = 2.4;
    g.beginPath();
    g.moveTo(48, 28); g.lineTo(59, 30.8);
    g.moveTo(80, 28); g.lineTo(69, 30.8);
    g.stroke();

    // 5) 코보호대(Nasal Bar)가 달린 강철 바이킹 뿔투구 (x: 24..104 내 완벽 수납)
    g.fillStyle = '#fef08a';
    g.strokeStyle = '#451a03';
    g.lineWidth = 1.7;
    g.beginPath();
    g.moveTo(43, 17); g.quadraticCurveTo(25, 14, 22, 4); g.quadraticCurveTo(33, 7, 45, 12); g.closePath();
    g.fill(); g.stroke();
    g.beginPath();
    g.moveTo(85, 17); g.quadraticCurveTo(103, 14, 106, 4); g.quadraticCurveTo(95, 7, 83, 12); g.closePath();
    g.fill(); g.stroke();

    drawRoundedRectPath(g, 41, 7, 46, 14, 6, '#334155', '#fbbf24', 1.7);
    drawRoundedRectPath(g, 40, 17.5, 48, 4.2, 1.8, '#64748b', '#fbbf24', 1.3);
    drawRoundedRectPath(g, 61.5, 17.5, 5.0, 16.5, 1.8, '#94a3b8', '#090d16', 1.3);

    // 6) 양손에 쥔 피의 쌍수 대형 초승달 전투도끼 (x: 7..121 안전 영역 안에 배치하여 절대 안 잘림!)
    // 우측 전투도끼 (도끼자루 x=101, 도끼날 우측 끝 x=120.5)
    drawRoundedRectPath(g, 98.5, 16, 5.5, 80, 2.5, '#451a03', '#090d16', 1.7);
    drawRoundPart(g, 101.2, 14, 3.8, 5.0, 0, '#fbbf24', '#090d16', 1.3);
    const rAxeGrad = g.createLinearGradient(102, 20, 120, 52);
    rAxeGrad.addColorStop(0, '#fca5a5');
    rAxeGrad.addColorStop(0.45, '#ef4444');
    rAxeGrad.addColorStop(1, '#7f1d1d');
    g.fillStyle = rAxeGrad;
    g.strokeStyle = '#fbbf24';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(103, 22);
    g.bezierCurveTo(118, 14, 121.5, 34, 115, 52);
    g.quadraticCurveTo(108, 44, 103, 40);
    g.closePath();
    g.fill();
    g.stroke();
    // 우측 도끼 안쪽 스파이크 날
    g.beginPath();
    g.moveTo(99, 26); g.lineTo(91, 31); g.lineTo(99, 36); g.closePath();
    g.fill(); g.stroke();

    // 좌측 전투도끼 (도끼자루 x=27, 도끼날 좌측 끝 x=7.5)
    drawRoundedRectPath(g, 24.0, 16, 5.5, 80, 2.5, '#451a03', '#090d16', 1.7);
    drawRoundPart(g, 26.8, 14, 3.8, 5.0, 0, '#fbbf24', '#090d16', 1.3);
    const lAxeGrad = g.createLinearGradient(26, 20, 8, 52);
    lAxeGrad.addColorStop(0, '#fca5a5');
    lAxeGrad.addColorStop(0.45, '#ef4444');
    lAxeGrad.addColorStop(1, '#7f1d1d');
    g.fillStyle = lAxeGrad;
    g.strokeStyle = '#fbbf24';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(25, 22);
    g.bezierCurveTo(10, 14, 6.5, 34, 13, 52);
    g.quadraticCurveTo(20, 44, 25, 40);
    g.closePath();
    g.fill();
    g.stroke();
    // 좌측 도끼 안쪽 스파이크 날
    g.beginPath();
    g.moveTo(29, 26); g.lineTo(37, 31); g.lineTo(29, 36); g.closePath();
    g.fill(); g.stroke();

    // 도끼자루를 꽉 쥔 양손 주먹
    drawRoundPart(g, 27.5, 72, 5.0, 4.2, 0, '#f3cfb3', '#422320', 1.3);
    drawRoundPart(g, 100.5, 72, 5.0, 4.2, 0, '#e2b08a', '#422320', 1.3);
  }
  else if (type === 'boss_seraphiria') {
    // =========================================================================
    // [고밀도 보스 도트] 해적들의 여왕 『해왕』 세라피리아 더 파이럿 (Lv.27 보스)
    //  - 성숙하고 글래머한 '누님' 캐릭터 속성에 맞춘 E컵 글래머 실루엣 & [해왕의 검] 오라
    // =========================================================================
    const seaAura = g.createRadialGradient(64, 112, 8, 64, 112, 56);
    seaAura.addColorStop(0, 'rgba(14, 165, 233, 0.72)');
    seaAura.addColorStop(0.5, 'rgba(236, 72, 153, 0.45)');
    seaAura.addColorStop(1, 'rgba(14, 165, 233, 0)');
    g.fillStyle = seaAura;
    g.beginPath();
    g.ellipse(64, 112, 56, 14, 0, 0, Math.PI * 2);
    g.fill();

    drawSubcultureSDCharacter(g, {
      gender: 'female',
      cupSize: 'E',
      glamorous: true,
      eyeType: 'aru_confident',
      haloColor: 'rgba(56, 189, 248, 0.90)',
      hair: '#f43f5e',
      hairShade: '#881337',
      hairStyle: 'pirate_waves',
      eye: '#e11d48',
      eyeLight: '#fda4af',
      outfitMain: '#31102f',
      outfitSub: '#e11d48',
      trimGold: '#fbbf24',
      cape: '#881337',
      legStyle: 'stockings',
      headgear: 'tricorn_hat',
      weapon: 'rapier'
    });

    // 오른손에 빛나는 전설 무기 [해왕의 검] 오라 보강 (몸통/바스트를 가리지 않도록 오른손 칼날 위치 x=77.4에 정확히 정렬)
    g.save();
    const swordGlow = g.createLinearGradient(77, 10, 84, 64);
    swordGlow.addColorStop(0, '#e0f2fe');
    swordGlow.addColorStop(0.5, '#38bdf8');
    swordGlow.addColorStop(1, '#0284c7');
    drawRoundedRectPath(g, 76.6, 11, 4.8, 52, 2.2, swordGlow, '#fbbf24', 1.3);
    g.restore();
  }
  else if (type === 'boss' || type === 'boss_dragon' || type === 'boss_balrog') {
    // =========================================================================
    // ★ 2024×2024 초거대 도트 최종 보스: [오크 부족의 대장 발록 — King of the Orcs]
    // - 기존의 동그란 검은 벌레 같은 두상과 타원형 스티커 뿔/엄니를 완전히 폐기!
    // - 오크들의 왕다운 험악하고 조각 같은 각진 하관, 눈을 가로지르는 칼자국 흉터,
    //   끝이 날카롭게 벼려진 흑철 금관과 거대한 곡선 마왕 뿔, 4개의 날카로운 상아 엄니,
    //   늑대 모피 대군주 망토, 해골 견장과 지옥불 파멸의 대검 + 피의 전투도끼 쌍수 무장으로 압도적 간지 구현!
    // =========================================================================

    // 0) 바닥 지옥불 패왕색 오라 & 심연 그림자
    const auraGrad = g.createRadialGradient(64, 114, 6, 64, 114, 54);
    auraGrad.addColorStop(0, 'rgba(251, 191, 36, 0.70)');
    auraGrad.addColorStop(0.45, 'rgba(220, 38, 38, 0.48)');
    auraGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
    g.fillStyle = auraGrad;
    g.beginPath();
    g.ellipse(64, 114, 54, 13, 0, 0, Math.PI * 2);
    g.fill();

    // 1) 전장을 지배하는 오크 대왕의 찢어진 핏빛 군주 망토(Tattered Warlord Cape) & 흑늑대 모피 칼라
    g.save();
    const capeGrad = g.createLinearGradient(64, 38, 64, 114);
    capeGrad.addColorStop(0, '#991b1b');
    capeGrad.addColorStop(0.55, '#450a0a');
    capeGrad.addColorStop(1, '#110202');
    g.fillStyle = capeGrad;
    g.strokeStyle = '#090d16';
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(28, 44);
    g.bezierCurveTo(10, 68, 8, 94, 14, 112);
    // 거칠게 찢어진 망토 하단 자락
    g.lineTo(28, 104);
    g.lineTo(38, 113);
    g.lineTo(52, 106);
    g.lineTo(64, 114);
    g.lineTo(76, 106);
    g.lineTo(90, 113);
    g.lineTo(100, 104);
    g.lineTo(114, 112);
    g.bezierCurveTo(120, 94, 118, 68, 100, 44);
    g.closePath();
    g.fill();
    g.stroke();

    // 어깨 뒤를 감싸는 거대한 야수 모피 칼라(Dark Beast Fur Mantle)
    g.fillStyle = '#1e293b';
    g.strokeStyle = '#090d16';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(22, 48);
    g.quadraticCurveTo(64, 34, 106, 48);
    g.lineTo(100, 58);
    g.quadraticCurveTo(64, 48, 28, 58);
    g.closePath();
    g.fill();
    g.stroke();
    g.restore();

    // 2) 강철 가시 워부츠 & 중갑 각반 하체
    drawRoundedRectPath(g, 39, 86, 19, 25, 5, '#1e293b', '#090d16', 1.8);
    drawRoundedRectPath(g, 70, 86, 19, 25, 5, '#0f172a', '#090d16', 1.8);
    drawRoundedRectPath(g, 37, 98, 22, 15, 4, '#27272a', '#fbbf24', 1.5);
    drawRoundedRectPath(g, 69, 98, 22, 15, 4, '#27272a', '#fbbf24', 1.5);

    // 3) 오크 대왕의 압도적인 근육질 흉곽 & 지옥불 룬 문신 & 흑철 하네스
    //    (오크 특유의 다크 올리브/잿빛 전투 피부 위에 타오르는 마그마 룬 문신과 대흉근/복근 조형!)
    const kingSkinGrad = g.createRadialGradient(56, 56, 6, 64, 68, 42);
    kingSkinGrad.addColorStop(0, '#65a30d');
    kingSkinGrad.addColorStop(0.5, '#3f6212');
    kingSkinGrad.addColorStop(1, '#1a2e05');
    drawRoundedRectPath(g, 28, 45, 72, 46, 15, kingSkinGrad, '#090d16', 2.0);

    // 대왕의 조각 같은 갑빠(대흉근) & 식스팩 근육 음영
    g.strokeStyle = '#142404';
    g.lineWidth = 2.0;
    g.beginPath();
    g.moveTo(64, 48); g.lineTo(64, 84);
    g.moveTo(36, 63); g.quadraticCurveTo(50, 68, 64, 62);
    g.moveTo(92, 63); g.quadraticCurveTo(78, 68, 64, 62);
    g.moveTo(46, 71); g.lineTo(82, 71);
    g.moveTo(48, 78); g.lineTo(80, 78);
    g.stroke();

    // 근육 위에서 붉게 타오르는 오크 대왕의 마그마 문신(Magma War-Runes)
    g.strokeStyle = '#ef4444';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(40, 53); g.lineTo(48, 60); g.lineTo(43, 66);
    g.moveTo(88, 53); g.lineTo(80, 60); g.lineTo(85, 66);
    g.stroke();

    // X자 흑철 사슬 갑주 하네스 & 중앙 지옥불 보석 코어
    g.strokeStyle = '#1e293b';
    g.lineWidth = 5.0;
    g.beginPath();
    g.moveTo(34, 48); g.lineTo(94, 84);
    g.moveTo(94, 48); g.lineTo(34, 84);
    g.stroke();
    g.strokeStyle = '#fbbf24';
    g.lineWidth = 1.3;
    g.beginPath();
    g.moveTo(34, 48); g.lineTo(94, 84);
    g.moveTo(94, 48); g.lineTo(34, 84);
    g.stroke();
    // 가슴 정중앙 마왕의 보주
    drawRoundPart(g, 64, 66, 8.5, 8.5, 0, '#18181b', '#fbbf24', 1.8);
    drawRoundPart(g, 64, 66, 5.5, 5.5, 0, '#ef4444', null, 0);
    drawRoundPart(g, 64, 66, 2.5, 2.5, 0, '#fef08a', null, 0);

    // 황금 늑대/해골 챔피언 워벨트(Champion War-Belt)
    drawRoundedRectPath(g, 31, 82, 66, 9, 3, '#18181b', '#fbbf24', 1.6);
    drawRoundPart(g, 64, 86.5, 9, 7.5, 0, '#fbbf24', '#451a03', 1.6);
    drawRoundPart(g, 61, 86, 2.0, 2.0, 0, '#ef4444', null, 0);
    drawRoundPart(g, 67, 86, 2.0, 2.0, 0, '#ef4444', null, 0);

    // 4) 좌우 초대형 악마 해골 견장(Demon-Skull Pauldrons) & 칼날 건틀릿 팔뚝
    //    (타원 스티커 대신 진짜 뾰족한 곡선 뿔이 솟아난 중갑 견장!)
    drawRoundPart(g, 21, 70, 10, 16, 0.18, '#3f6212', '#090d16', 1.8);
    drawRoundPart(g, 107, 70, 10, 16, -0.18, '#365314', '#090d16', 1.8);
    drawRoundedRectPath(g, 13, 72, 15, 13, 3.5, '#1e293b', '#fbbf24', 1.5);
    drawRoundedRectPath(g, 100, 72, 15, 13, 3.5, '#1e293b', '#fbbf24', 1.5);

    // 좌/우 해골 견장 본체
    drawRoundPart(g, 24, 54, 16, 12, -0.22, '#27272a', '#fbbf24', 1.8);
    drawRoundPart(g, 104, 54, 16, 12, 0.22, '#27272a', '#fbbf24', 1.8);
    // 견장에서 솟아오른 날카로운 강철 스파이크(Polygon Spikes)
    g.save();
    g.fillStyle = '#e2e8f0';
    g.strokeStyle = '#090d16';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(14, 50); g.lineTo(4, 34); g.lineTo(22, 45); g.closePath();
    g.moveTo(22, 46); g.lineTo(16, 30); g.lineTo(30, 44); g.closePath();
    g.moveTo(114, 50); g.lineTo(124, 34); g.lineTo(106, 45); g.closePath();
    g.moveTo(106, 46); g.lineTo(112, 30); g.lineTo(98, 44); g.closePath();
    g.fill();
    g.stroke();
    g.restore();

    // 5) ★ 오크들의 왕 발록의 험악하고 간지나는 조각상 두상!
    g.save();
    // 양옆으로 날카롭게 뻗은 오크 대왕의 전투 귀 & 황금 귀걸이
    g.fillStyle = '#3f6212';
    g.strokeStyle = '#090d16';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(39, 28); g.lineTo(20, 22); g.lineTo(26, 34); g.lineTo(40, 38); g.closePath();
    g.moveTo(89, 28); g.lineTo(108, 22); g.lineTo(102, 34); g.lineTo(88, 38); g.closePath();
    g.fill();
    g.stroke();

    // 각진 광대와 떡벌어진 사각 턱을 가진 정통 오크 대군주 얼굴형
    const fGrad = g.createRadialGradient(56, 26, 4, 64, 36, 28);
    fGrad.addColorStop(0, '#84cc16');
    fGrad.addColorStop(0.5, '#3f6212');
    fGrad.addColorStop(1, '#142404');
    g.fillStyle = fGrad;
    g.strokeStyle = '#090d16';
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(40, 18);
    g.lineTo(36, 34); // 튀어나온 강한 광대뼈
    g.lineTo(38, 49); // 떡벌어진 대왕의 사각 하관 좌측
    g.lineTo(50, 55);
    g.lineTo(78, 55);
    g.lineTo(90, 49); // 떡벌어진 사각 하관 우측
    g.lineTo(92, 34);
    g.lineTo(88, 18);
    g.closePath();
    g.fill();
    g.stroke();

    // 왼쪽 눈을 가로지르는 깊은 십자 칼자국 전투 흉터(Warlord Scar)
    g.strokeStyle = '#dc2626';
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(46, 21); g.lineTo(54, 43);
    g.moveTo(46, 26); g.lineTo(53, 25);
    g.stroke();

    // 매섭게 내려앉은 V자 근육 눈썹뼈 & 타오르는 진홍빛 패왕의 안광
    g.fillStyle = '#090d16';
    g.beginPath();
    g.moveTo(39, 25); g.lineTo(62, 31); g.lineTo(62, 35); g.lineTo(39, 30); g.closePath();
    g.moveTo(89, 25); g.lineTo(66, 31); g.lineTo(66, 35); g.lineTo(89, 30); g.closePath();
    g.fill();

    // 좌/우 패왕의 안광 (날카로운 사다리꼴 붉은 눈 + 황금 슬릿 동공 + 안광 잔상)
    for (const [ox, isL] of [[51, true], [77, false]]) {
      g.fillStyle = '#dc2626';
      g.beginPath();
      g.moveTo(ox - 6, 30.5);
      g.lineTo(ox + 6, 32.0);
      g.lineTo(ox + (isL ? 4.5 : -4.5), 36.2);
      g.lineTo(ox + (isL ? -4.5 : 4.5), 35.2);
      g.closePath();
      g.fill();
      g.fillStyle = '#fde047';
      g.fillRect(ox - 2.2, 31.8, 4.4, 3.0);
      g.fillStyle = '#ffffff';
      g.fillRect(ox - 0.8, 32.2, 1.6, 2.2);
    }

    // 강인한 콧대와 황금 워링(Septum Ring)
    drawRoundedRectPath(g, 58, 33, 12, 7.5, 3, '#27400b', '#090d16', 1.4);
    g.strokeStyle = '#fbbf24';
    g.lineWidth = 1.6;
    g.beginPath();
    g.arc(64, 41.5, 3.2, 0.1, Math.PI - 0.1);
    g.stroke();

    // ★ 으르렁거리는 오크 대왕의 입과 4개의 날카로운 곡선 상아 엄니(Sharp Curved Tusks — 타원 스티커 완전 폐기!)
    g.fillStyle = '#090d16';
    g.beginPath();
    g.roundRect(44, 43.5, 40, 7.5, 2.5);
    g.fill();
    // 악문 어금니
    g.fillStyle = '#e2e8f0';
    for (let tx = 52; tx <= 72; tx += 5) {
      g.fillRect(tx, 44.2, 3.5, 5.5);
    }

    // 좌/우 외곽 거대 상아 엄니 2개 + 안쪽 보조 송곳니 2개 (진짜 뾰족한 삼각 곡선!)
    g.fillStyle = '#fef9c3';
    g.strokeStyle = '#271409';
    g.lineWidth = 1.5;
    // 좌측 메인 대엄니 (황금 반지 장식 포함)
    g.beginPath();
    g.moveTo(41, 51);
    g.quadraticCurveTo(40, 39, 45.5, 35.5);
    g.quadraticCurveTo(49, 43, 49.5, 51);
    g.closePath();
    g.fill();
    g.stroke();
    // 우측 메인 대엄니
    g.beginPath();
    g.moveTo(87, 51);
    g.quadraticCurveTo(88, 39, 82.5, 35.5);
    g.quadraticCurveTo(79, 43, 78.5, 51);
    g.closePath();
    g.fill();
    g.stroke();
    // 안쪽 보조 송곳니 한 쌍
    g.beginPath();
    g.moveTo(50, 51); g.lineTo(52.5, 42); g.lineTo(55, 51); g.closePath();
    g.moveTo(73, 51); g.lineTo(75.5, 42); g.lineTo(78, 51); g.closePath();
    g.fill();
    g.stroke();

    // 6) ★ 오크 대왕의 흑철 금관(Jagged War-Crown) & 하늘을 찌르는 곡선 대왕 뿔(Sweeping Bull Horns)!
    // 좌측 거대 곡선 뿔 (베지어 곡선으로 끝이 면도날처럼 뾰족하게 솟구침!)
    const hornGradL = g.createLinearGradient(12, 4, 44, 22);
    hornGradL.addColorStop(0, '#fef08a');
    hornGradL.addColorStop(0.5, '#d97706');
    hornGradL.addColorStop(1, '#451a03');
    g.fillStyle = hornGradL;
    g.strokeStyle = '#090d16';
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(42, 22);
    g.bezierCurveTo(24, 22, 12, 14, 14, 3); // 뾰족한 뿔 끝
    g.bezierCurveTo(20, 10, 30, 12, 46, 13);
    g.closePath();
    g.fill();
    g.stroke();

    // 우측 거대 곡선 뿔
    const hornGradR = g.createLinearGradient(116, 4, 84, 22);
    hornGradR.addColorStop(0, '#fef08a');
    hornGradR.addColorStop(0.5, '#d97706');
    hornGradR.addColorStop(1, '#451a03');
    g.fillStyle = hornGradR;
    g.beginPath();
    g.moveTo(86, 22);
    g.bezierCurveTo(104, 22, 116, 14, 114, 3); // 뾰족한 뿔 끝
    g.bezierCurveTo(108, 10, 98, 12, 82, 13);
    g.closePath();
    g.fill();
    g.stroke();

    // 이마를 감싸는 흑철 & 황금 패왕의 왕관(War-King's Jagged Crown)
    g.fillStyle = '#18181b';
    g.strokeStyle = '#fbbf24';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(39, 22);
    g.lineTo(42, 11);
    g.lineTo(52, 16);
    g.lineTo(64, 6); // 왕관 중앙 첨탑
    g.lineTo(76, 16);
    g.lineTo(86, 11);
    g.lineTo(89, 22);
    g.closePath();
    g.fill();
    g.stroke();
    // 왕관 중앙 블러드 루비
    drawRoundPart(g, 64, 15, 4.2, 5.2, 0, '#ef4444', '#fde047', 1.2);
    g.restore();

    // 7) ★ 오크 대왕의 양손 무장: 오른손 [지옥불 파멸의 대검] + 왼손 [대군주의 피의 전투도끼]
    g.save();
    // [오른손: 지옥불 파멸의 톱니 대검 (Hellfire Doom-Greatsword)]
    drawRoundedRectPath(g, 104.5, 75, 6.5, 22, 2.5, '#451a03', '#090d16', 1.6);
    g.strokeStyle = '#fbbf24';
    g.lineWidth = 1.2;
    for (let hy = 79; hy <= 93; hy += 4.5) {
      g.beginPath(); g.moveTo(105, hy); g.lineTo(111, hy); g.stroke();
    }
    drawRoundPart(g, 107.8, 99.5, 4.8, 4.2, 0, '#fbbf24', '#090d16', 1.5);
    drawRoundPart(g, 107.8, 99.5, 2.2, 2.2, 0, '#ef4444', null, 0);

    const bSwordGrad = g.createLinearGradient(99, 4, 117, 73);
    bSwordGrad.addColorStop(0, '#fef08a');
    bSwordGrad.addColorStop(0.35, '#f97316');
    bSwordGrad.addColorStop(0.75, '#dc2626');
    bSwordGrad.addColorStop(1, '#450a0a');
    g.fillStyle = bSwordGrad;
    g.strokeStyle = '#090d16';
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(108, 2); // 예리한 대검 끝
    g.lineTo(117, 16);
    g.lineTo(114, 28);
    g.lineTo(117, 36); // 역날 톱니 디테일
    g.lineTo(115, 73);
    g.lineTo(101, 73);
    g.lineTo(99, 36);
    g.lineTo(102, 28);
    g.lineTo(99, 16);
    g.closePath();
    g.fill();
    g.stroke();
    // 대검 중앙 용암 룬 혈조
    drawRoundedRectPath(g, 105.5, 14, 5, 55, 2.5, '#ffffff', null, 0);
    // 해골 날개 코등이
    drawRoundedRectPath(g, 94, 71, 28, 6, 3, '#fbbf24', '#090d16', 1.6);
    drawRoundPart(g, 108, 74, 3.5, 3.5, 0, '#ef4444', '#090d16', 1.0);

    // [왼손: 대군주의 피의 전투도끼 (Warlord's Blood-Cleaver Battleaxe)]
    drawRoundedRectPath(g, 17, 24, 5.5, 70, 2.5, '#451a03', '#090d16', 1.6);
    // 거대한 초승달 도끼날
    const axeGrad = g.createLinearGradient(2, 26, 22, 58);
    axeGrad.addColorStop(0, '#f8fafc');
    axeGrad.addColorStop(0.45, '#94a3b8');
    axeGrad.addColorStop(1, '#dc2626');
    g.fillStyle = axeGrad;
    g.strokeStyle = '#090d16';
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(19, 30);
    g.bezierCurveTo(4, 22, 1, 44, 6, 60);
    g.quadraticCurveTo(14, 52, 19, 48);
    g.closePath();
    g.fill();
    g.stroke();
    drawRoundPart(g, 19.8, 22, 3.8, 5, 0, '#fbbf24', '#090d16', 1.3);
    g.restore();
  }
  // ================= [집 안(home_interior) 전용 1024×1024 실내 가구 스프라이트 3종] =================
  else if (type === 'furniture_fireplace') {
    // 따뜻하게 장작불이 타오르는 벽난로 & 선반 시계/촛대
    drawRoundPart(g, 64, 114, 48, 10, 0, 'rgba(0, 0, 0, 0.42)', null, 0);
    // 벽돌 몸체
    drawRoundedRectPath(g, 20, 28, 88, 84, 6, '#7c2d12', '#271409', 2.0);
    // 상단 굴뚝 & 원목 선반(Mantelpiece)
    drawRoundedRectPath(g, 38, 8, 52, 24, 4, '#5c3419', '#271409', 1.8);
    drawRoundedRectPath(g, 14, 26, 100, 10, 4, '#92400e', '#271409', 1.8);
    // 아치형 화구(Firebox)
    drawRoundedRectPath(g, 34, 52, 60, 58, 24, '#18111c', '#451a03', 2.0);
    // 타오르는 장작불(Crackling Fire)
    drawRoundedRectPath(g, 42, 96, 44, 8, 3, '#451a03', '#090d16', 1.4);
    drawRoundPart(g, 64, 82, 18, 20, 0, '#ea580c', null, 0);
    drawRoundPart(g, 64, 85, 12, 15, 0, '#fbbf24', null, 0);
    drawRoundPart(g, 64, 88, 6, 9, 0, '#fef08a', null, 0);
    // 선반 위 황금 촛대 & 탁상시계
    drawRoundPart(g, 64, 18, 7, 7, 0, '#fbbf24', '#451a03', 1.4);
    drawRoundPart(g, 64, 18, 4.5, 4.5, 0, '#fef3c7', null, 0);
  }
  else if (type === 'furniture_bookshelf') {
    // 고서적과 포션, 화분이 놓인 아늑한 원목 책장
    drawRoundPart(g, 64, 114, 46, 10, 0, 'rgba(0, 0, 0, 0.42)', null, 0);
    drawRoundedRectPath(g, 22, 16, 84, 96, 6, '#78350f', '#271409', 2.0);
    drawRoundedRectPath(g, 28, 22, 72, 82, 4, '#451a03', '#271409', 1.5);
    // 선반 3단
    g.fillStyle = '#92400e';
    g.fillRect(26, 48, 76, 6);
    g.fillRect(26, 76, 76, 6);
    // 1단 & 2단 알록달록한 마법 서적들과 포션병
    const bookCols = ['#ef4444', '#38bdf8', '#10b981', '#fbbf24', '#a855f7', '#f97316'];
    for (let i = 0; i < 6; i++) {
      drawRoundedRectPath(g, 31 + i * 10.5, 27 + (i % 2) * 3, 9, 21 - (i % 2) * 3, 2, bookCols[i], '#1e1b4b', 1.1);
      drawRoundedRectPath(g, 31 + i * 10.5, 55 + ((i + 1) % 2) * 3, 9, 21 - ((i + 1) % 2) * 3, 2, bookCols[5 - i], '#1e1b4b', 1.1);
    }
    // 하단 서랍장 손잡이
    drawRoundedRectPath(g, 28, 84, 34, 20, 3, '#92400e', '#271409', 1.4);
    drawRoundedRectPath(g, 66, 84, 34, 20, 3, '#92400e', '#271409', 1.4);
    drawRoundPart(g, 45, 94, 3, 3, 0, '#fbbf24', null, 0);
    drawRoundPart(g, 83, 94, 3, 3, 0, '#fbbf24', null, 0);
  }
  else if (type === 'furniture_bed') {
    // 어머니의 집 포근한 원목 침대 & 퀼트 이불 & 베개
    drawRoundPart(g, 64, 114, 48, 10, 0, 'rgba(0, 0, 0, 0.42)', null, 0);
    // 침대 헤드보드 & 프레임
    drawRoundedRectPath(g, 22, 16, 84, 28, 8, '#78350f', '#271409', 2.0);
    drawRoundedRectPath(g, 24, 34, 80, 78, 8, '#92400e', '#271409', 2.0);
    // 하얀 매트리스 & 푹신한 베개
    drawRoundedRectPath(g, 28, 36, 72, 70, 6, '#f8fafc', '#cbd5e1', 1.4);
    drawRoundedRectPath(g, 36, 38, 56, 18, 7, '#ffffff', '#94a3b8', 1.4);
    // 포근한 와인레드 & 골드 패치워크 이불
    drawRoundedRectPath(g, 28, 56, 72, 50, 6, '#be123c', '#4c0519', 1.6);
    drawRoundedRectPath(g, 28, 54, 72, 10, 4, '#fde68a', '#b45309', 1.3);
  }
  else if (type === 'flowerbed') {
    // 플라워 아일랜드 화단길 & 별장 장식용 화려한 대리석 꽃화단
    drawRoundPart(g, 64, 112, 54, 10, 0, 'rgba(0, 0, 0, 0.28)', null, 0);
    drawRoundedRectPath(g, 10, 44, 108, 60, 12, '#f8fafc', '#94a3b8', 2.0);
    drawRoundedRectPath(g, 16, 50, 96, 48, 9, '#15803d', '#064e3b', 1.6);
    const blooms = [
      [28, 62, '#f43f5e', '#fde047'], [46, 58, '#fbbf24', '#78350f'],
      [64, 64, '#ec4899', '#fef08a'], [82, 58, '#38bdf8', '#ffffff'],
      [98, 64, '#a855f7', '#fde047'], [36, 80, '#fb7185', '#ffffff'],
      [56, 82, '#fde047', '#ea580c'], [74, 80, '#f472b6', '#fef08a'],
      [92, 82, '#60a5fa', '#fef08a']
    ];
    for (const [bx, by, petalCol, coreCol] of blooms) {
      drawRoundPart(g, bx, by, 9.5, 8.5, 0, petalCol, '#064e3b', 1.1);
      drawRoundPart(g, bx, by, 3.8, 3.8, 0, coreCol, null, 0);
    }
  }
  else if (type === 'villa_table') {
    // 실내 원목 티테이블 & 꽃병/다과 세트
    drawRoundPart(g, 64, 108, 48, 12, 0, 'rgba(0, 0, 0, 0.32)', null, 0);
    drawRoundedRectPath(g, 28, 72, 10, 34, 3, '#5c3419', '#271409', 1.5);
    drawRoundedRectPath(g, 90, 72, 10, 34, 3, '#5c3419', '#271409', 1.5);
    drawRoundPart(g, 64, 68, 52, 26, 0, '#92400e', '#451a03', 2.0);
    drawRoundPart(g, 64, 66, 32, 16, 0, '#fffbeb', '#fcd34d', 1.3);
    drawRoundPart(g, 64, 56, 9, 12, 0, '#38bdf8', '#0284c7', 1.3);
    drawRoundPart(g, 60, 46, 6, 6, 0, '#f43f5e', '#fde047', 1.0);
    drawRoundPart(g, 68, 46, 6, 6, 0, '#fbbf24', '#ffffff', 1.0);
  }
  else if (type === 'potted_plant') {
    // 실내 화분 오브젝트
    drawRoundPart(g, 64, 112, 26, 8, 0, 'rgba(0, 0, 0, 0.32)', null, 0);
    drawRoundedRectPath(g, 38, 68, 52, 40, 8, '#b45309', '#451a03', 1.8);
    drawRoundPart(g, 64, 48, 32, 26, 0, '#16a34a', '#064e3b', 1.6);
    drawRoundPart(g, 48, 44, 16, 14, 0, '#4ade80', null, 0);
    drawRoundPart(g, 78, 44, 16, 14, 0, '#22c55e', null, 0);
    drawRoundPart(g, 64, 34, 10, 10, 0, '#f472b6', '#fde047', 1.2);
  }
  // ================= [512×512 하이엔드 배경 오브젝트] =================
  else if (type === 'harbor_ship') {
    const wakeGrad = g.createRadialGradient(64, 96, 8, 64, 96, 56);
    wakeGrad.addColorStop(0, 'rgba(2, 132, 199, 0.55)');
    wakeGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.25)');
    wakeGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    g.fillStyle = wakeGrad;
    g.beginPath();
    g.ellipse(64, 98, 56, 18, 0, 0, Math.PI * 2);
    g.fill();

    drawRoundedRectPath(g, 38, 22, 3.5, 62, 1.5, '#5c3419', '#271409', 1.2);
    drawRoundedRectPath(g, 88, 26, 3.5, 58, 1.5, '#5c3419', '#271409', 1.2);
    drawRoundedRectPath(g, 62, 10, 4.8, 74, 2, '#78350f', '#271409', 1.4);
    drawRoundedRectPath(g, 56, 18, 16, 5, 2, '#92400e', '#271409', 1.2);

    g.fillStyle = '#0284c7';
    g.strokeStyle = '#fbbf24';
    g.lineWidth = 1.1;
    g.beginPath();
    g.moveTo(66, 10);
    g.quadraticCurveTo(78, 7, 88, 12);
    g.quadraticCurveTo(77, 15, 66, 15);
    g.closePath();
    g.fill();
    g.stroke();

    const drawBillowedSail = (sx, sy, sw, sh, hasEmblem) => {
      g.save();
      drawRoundedRectPath(g, sx - 3, sy - 2, sw + 6, 3.2, 1.5, '#92400e', '#271409', 1.1);
      const sailGrad = g.createLinearGradient(sx, sy, sx + sw, sy + sh);
      sailGrad.addColorStop(0, '#ffffff');
      sailGrad.addColorStop(0.65, '#f8fafc');
      sailGrad.addColorStop(1, '#cbd5e1');
      g.fillStyle = sailGrad;
      g.strokeStyle = '#334155';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(sx, sy);
      g.lineTo(sx + sw, sy);
      g.quadraticCurveTo(sx + sw + 6, sy + sh * 0.5, sx + sw - 1, sy + sh);
      g.quadraticCurveTo(sx + sw * 0.5, sy + sh + 4, sx + 1, sy + sh);
      g.quadraticCurveTo(sx - 5, sy + sh * 0.5, sx, sy);
      g.closePath();
      g.fill();
      g.stroke();

      g.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      g.lineWidth = 0.9;
      for (let i = 1; i <= 3; i++) {
        const lx = sx + (sw * i) / 4;
        g.beginPath();
        g.moveTo(lx, sy + 1);
        g.quadraticCurveTo(lx - 2, sy + sh * 0.5, lx, sy + sh - 1);
        g.stroke();
      }

      if (hasEmblem) {
        const cx = sx + sw * 0.48;
        const cy = sy + sh * 0.52;
        g.fillStyle = '#0284c7';
        g.beginPath();
        g.arc(cx, cy, 7.5, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = '#fbbf24';
        g.lineWidth = 1.4;
        g.stroke();
        g.fillStyle = '#fde047';
        g.beginPath();
        g.moveTo(cx, cy - 5.5); g.lineTo(cx + 1.6, cy - 1.6); g.lineTo(cx + 5.5, cy);
        g.lineTo(cx + 1.6, cy + 1.6); g.lineTo(cx, cy + 5.5); g.lineTo(cx - 1.6, cy + 1.6);
        g.lineTo(cx - 5.5, cy); g.lineTo(cx - 1.6, cy - 1.6);
        g.closePath();
        g.fill();
      }
      g.restore();
    };

    drawBillowedSail(26, 36, 22, 24, false);
    drawBillowedSail(48, 22, 30, 17, false);
    drawBillowedSail(44, 41, 38, 28, true);

    g.save();
    g.fillStyle = '#f1f5f9';
    g.strokeStyle = '#334155';
    g.lineWidth = 1.3;
    g.beginPath();
    g.moveTo(88, 30);
    g.lineTo(112, 54);
    g.quadraticCurveTo(96, 62, 88, 60);
    g.closePath();
    g.fill();
    g.stroke();
    g.restore();

    g.strokeStyle = 'rgba(71, 85, 105, 0.65)';
    g.lineWidth = 0.9;
    g.beginPath();
    g.moveTo(64, 18); g.lineTo(14, 72);
    g.moveTo(64, 18); g.lineTo(39, 36);
    g.moveTo(64, 18); g.lineTo(90, 32);
    g.moveTo(56, 74); g.lineTo(62, 22);
    g.moveTo(72, 74); g.lineTo(66, 22);
    g.stroke();

    g.strokeStyle = '#271409';
    g.lineWidth = 1.5;
    g.fillStyle = '#78350f';
    g.beginPath();
    g.moveTo(26, 76);
    g.lineTo(4, 65);
    g.lineTo(6, 62);
    g.lineTo(30, 72);
    g.closePath();
    g.fill();
    g.stroke();
    drawRoundPart(g, 16, 74, 5.5, 3.5, -0.4, '#fbbf24', '#78350f', 1.1);

    const hullGrad = g.createLinearGradient(64, 66, 64, 98);
    hullGrad.addColorStop(0, '#92400e');
    hullGrad.addColorStop(0.55, '#78350f');
    hullGrad.addColorStop(1, '#451a03');
    g.fillStyle = hullGrad;
    g.strokeStyle = '#1e130c';
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(16, 72);
    g.lineTo(38, 72);
    g.lineTo(42, 76);
    g.lineTo(80, 76);
    g.lineTo(84, 64);
    g.lineTo(112, 64);
    g.quadraticCurveTo(116, 82, 104, 96);
    g.lineTo(30, 96);
    g.quadraticCurveTo(20, 86, 16, 72);
    g.closePath();
    g.fill();
    g.stroke();

    g.strokeStyle = 'rgba(24, 14, 7, 0.45)';
    g.lineWidth = 1.0;
    g.beginPath();
    g.moveTo(21, 82); g.lineTo(110, 82);
    g.moveTo(25, 89); g.lineTo(107, 89);
    g.stroke();

    g.fillStyle = '#0284c7';
    g.fillRect(26, 77, 84, 3.5);
    g.strokeStyle = '#fbbf24';
    g.lineWidth = 1.2;
    g.strokeRect(26, 77, 84, 3.5);

    for (let w = 0; w < 3; w++) {
      drawRoundedRectPath(g, 87 + w * 7.5, 68, 5, 6.5, 2, '#fde047', '#78350f', 1.0);
    }
    for (let c = 0; c < 4; c++) {
      drawRoundedRectPath(g, 36 + c * 13, 83.5, 4.5, 4.5, 1, '#1e293b', '#fbbf24', 1.0);
    }
    g.strokeStyle = '#fbbf24';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(26, 78); g.lineTo(26, 88);
    g.arc(26, 86, 3.5, 0.2, Math.PI - 0.2);
    g.stroke();

    g.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    g.lineWidth = 2.2;
    g.beginPath();
    g.moveTo(18, 96);
    g.quadraticCurveTo(40, 94, 64, 96.5);
    g.quadraticCurveTo(88, 99, 108, 95.5);
    g.stroke();
  }
  else if (type === 'tree') {
    drawRoundPart(g, 64, 112, 34, 10, 0, 'rgba(2, 6, 23, 0.42)', null, 0);
    drawRoundedRectPath(g, 51, 66, 26, 46, 8, '#5c3419', '#271409', 1.8);
    drawRoundedRectPath(g, 56, 70, 9, 40, 4, '#784522', null, 0);
    drawRoundPart(g, 48, 108, 12, 5.5, -0.2, '#15803d', '#064e3b', 1.4);
    drawRoundPart(g, 80, 108, 12, 5.5, 0.2, '#15803d', '#064e3b', 1.4);

    drawRoundPart(g, 64, 52, 46, 35, 0, '#064e3b', '#022c22', 1.8);
    drawRoundPart(g, 40, 56, 26, 23, 0, '#065f46', '#022c22', 1.5);
    drawRoundPart(g, 88, 56, 26, 23, 0, '#065f46', '#022c22', 1.5);
    drawRoundPart(g, 64, 38, 38, 29, 0, '#15803d', '#064e3b', 1.5);
    drawRoundPart(g, 48, 40, 22, 19, 0, '#16a34a', null, 0);
    drawRoundPart(g, 80, 40, 22, 19, 0, '#16a34a', null, 0);
    drawRoundPart(g, 64, 26, 28, 21, 0, '#22c55e', null, 0);
    drawRoundPart(g, 56, 21, 15, 11, 0, '#4ade80', null, 0);
    drawRoundPart(g, 42, 48, 3.2, 3.2, 0, '#fef08a', null, 0);
    drawRoundPart(g, 84, 44, 3.2, 3.2, 0, '#38bdf8', null, 0);
    drawRoundPart(g, 66, 24, 2.8, 2.8, 0, '#fde047', null, 0);
  }
  else if (type === 'palm_tree') {
    drawRoundPart(g, 64, 112, 28, 9, 0, 'rgba(2, 6, 23, 0.32)', null, 0);
    g.save();
    g.strokeStyle = '#451a03';
    g.lineWidth = 1.8;
    g.fillStyle = '#92400e';
    g.beginPath();
    g.moveTo(54, 112);
    g.quadraticCurveTo(48, 72, 62, 35);
    g.lineTo(73, 35);
    g.quadraticCurveTo(62, 72, 68, 112);
    g.closePath();
    g.fill();
    g.stroke();
    g.restore();
    drawRoundPart(g, 62, 39, 5, 5, 0, '#451a03', '#271409', 1.2);
    drawRoundPart(g, 71, 40, 5, 5, 0, '#451a03', '#271409', 1.2);
    drawRoundPart(g, 36, 34, 27, 9, -0.35, '#16a34a', '#065f46', 1.4);
    drawRoundPart(g, 92, 34, 27, 9, 0.35, '#16a34a', '#065f46', 1.4);
    drawRoundPart(g, 42, 22, 25, 8.5, -0.15, '#22c55e', '#15803d', 1.3);
    drawRoundPart(g, 86, 22, 25, 8.5, 0.15, '#22c55e', '#15803d', 1.3);
    drawRoundPart(g, 64, 18, 21, 7.5, 0, '#4ade80', null, 0);
  }
  else if (type === 'pillar') {
    drawRoundPart(g, 64, 112, 28, 9, 0, 'rgba(2, 6, 23, 0.42)', null, 0);
    drawRoundedRectPath(g, 39, 24, 50, 84, 7, '#475569', '#1e293b', 1.8);
    drawRoundedRectPath(g, 33, 16, 62, 15, 5, '#94a3b8', '#1e293b', 1.6);
    drawRoundedRectPath(g, 33, 98, 62, 15, 5, '#64748b', '#1e293b', 1.6);
    drawRoundedRectPath(g, 59, 42, 10, 36, 4, '#38bdf8', '#0284c7', 1.2);
    drawRoundPart(g, 46, 96, 10, 5.5, 0.2, '#16a34a', null, 0);
  }
  else if (type === 'chest_closed' || type === 'chest_open') {
    const opened = type === 'chest_open';
    drawRoundPart(g, 64, 106, 42, 10, 0, 'rgba(2, 6, 23, 0.45)', null, 0);
    drawRoundedRectPath(g, 24, 54, 80, 48, 8, '#92400e', '#271409', 2.0);
    g.strokeStyle = 'rgba(39, 20, 9, 0.5)';
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(26, 70); g.lineTo(102, 70);
    g.moveTo(26, 86); g.lineTo(102, 86);
    g.stroke();
    if (opened) {
      drawRoundedRectPath(g, 28, 46, 72, 16, 5, '#fef08a', '#ca8a04', 1.4);
      drawRoundPart(g, 48, 52, 7, 5, 0, '#38bdf8', '#0284c7', 1.0);
      drawRoundPart(g, 64, 50, 8, 6, 0, '#f43f5e', '#9f1239', 1.0);
      drawRoundPart(g, 80, 52, 7, 5, 0, '#34d399', '#059669', 1.0);
      drawRoundedRectPath(g, 24, 26, 80, 22, 8, '#b45309', '#271409', 2.0);
    } else {
      drawRoundedRectPath(g, 22, 38, 84, 24, 10, '#b45309', '#271409', 2.0);
    }
    drawRoundedRectPath(g, 32, opened ? 54 : 38, 10, opened ? 48 : 64, 2, '#fbbf24', '#78350f', 1.4);
    drawRoundedRectPath(g, 86, opened ? 54 : 38, 10, opened ? 48 : 64, 2, '#fbbf24', '#78350f', 1.4);
    drawRoundedRectPath(g, 55, 52, 18, 22, 5, '#fde047', '#78350f', 1.6);
    drawRoundPart(g, 64, 62, 2.8, 3.8, 0, '#271409', null, 0);
  }
  else if (type === 'portal') {
    drawRoundPart(g, 64, 64, 48, 48, 0, '#0284c7', null, 0);
    drawRoundPart(g, 64, 64, 34, 34, 0, '#38bdf8', null, 0);
    drawRoundPart(g, 64, 64, 18, 18, 0, '#e0f2fe', null, 0);
  }
  else if (type === 'house') {
    drawRoundPart(g, 64, 114, 54, 12, 0, 'rgba(2, 6, 23, 0.42)', null, 0);
    drawRoundedRectPath(g, 82, 14, 14, 28, 3, '#78350f', '#271409', 1.6);
    drawRoundedRectPath(g, 20, 48, 88, 64, 7, '#fef3c7', '#451a03', 1.8);
    g.fillStyle = '#78350f';
    g.fillRect(22, 48, 6, 64);
    g.fillRect(100, 48, 6, 64);
    g.fillRect(22, 76, 84, 5);
    drawRoundedRectPath(g, 52, 78, 24, 34, 7, '#451a03', '#271409', 1.5);
    drawRoundPart(g, 69, 95, 2.2, 2.2, 0, '#fbbf24', null, 0);
    drawRoundedRectPath(g, 28, 56, 18, 16, 4, '#38bdf8', '#451a03', 1.4);
    drawRoundedRectPath(g, 82, 56, 18, 16, 4, '#fde047', '#451a03', 1.4);
    drawRoundedRectPath(g, 26, 71, 22, 5, 2, '#15803d', '#064e3b', 1.2);
    drawRoundedRectPath(g, 80, 71, 22, 5, 2, '#15803d', '#064e3b', 1.2);
    g.save();
    g.fillStyle = '#991b1b';
    g.strokeStyle = '#450a0a';
    g.lineWidth = 2.2;
    g.beginPath();
    g.moveTo(10, 52);
    g.lineTo(64, 10);
    g.lineTo(118, 52);
    g.closePath();
    g.fill();
    g.stroke();
    drawRoundPart(g, 42, 34, 14, 5.5, -0.5, '#16a34a', null, 0);
    drawRoundPart(g, 88, 38, 12, 4.5, 0.5, '#22c55e', null, 0);
    drawRoundPart(g, 64, 34, 9, 9, 0, '#fde047', '#451a03', 1.5);
    g.restore();
  }
  else if (type === 'ocean_house') {
    drawRoundPart(g, 64, 114, 54, 12, 0, 'rgba(2, 6, 23, 0.38)', null, 0);
    drawRoundedRectPath(g, 20, 46, 88, 66, 7, '#f0f9ff', '#0c4a6e', 1.8);
    g.fillStyle = '#0284c7';
    g.fillRect(22, 46, 6, 66);
    g.fillRect(100, 46, 6, 66);
    drawRoundedRectPath(g, 24, 72, 80, 10, 4, '#0ea5e9', '#0369a1', 1.4);
    g.fillStyle = '#ffffff';
    g.fillRect(34, 72, 10, 10);
    g.fillRect(58, 72, 10, 10);
    g.fillRect(82, 72, 10, 10);
    drawRoundedRectPath(g, 52, 82, 24, 30, 6, '#1e3a8a', '#0f172a', 1.5);
    drawRoundPart(g, 36, 58, 8.5, 8.5, 0, '#38bdf8', '#0284c7', 1.5);
    drawRoundPart(g, 92, 58, 8.5, 8.5, 0, '#38bdf8', '#0284c7', 1.5);
    g.save();
    g.fillStyle = '#0369a1';
    g.strokeStyle = '#082f49';
    g.lineWidth = 2.2;
    g.beginPath();
    g.moveTo(10, 50);
    g.lineTo(64, 10);
    g.lineTo(118, 50);
    g.closePath();
    g.fill();
    g.stroke();
    drawRoundPart(g, 64, 32, 8.5, 8.5, 0, '#fbbf24', '#78350f', 1.4);
    g.restore();
  }
  else if (type === 'fountain' || type === 'ocean_fountain') {
    const isOcean = type === 'ocean_fountain';
    drawRoundPart(g, 64, 82, 50, 32, 0, isOcean ? '#e0f2fe' : '#cbd5e1', '#334155', 1.8);
    drawRoundPart(g, 64, 82, 40, 24, 0, isOcean ? '#0284c7' : '#0d9488', null, 0);
    drawRoundPart(g, 64, 80, 30, 17, 0, isOcean ? '#38bdf8' : '#2dd4bf', null, 0);
    drawRoundedRectPath(g, 54, 34, 20, 46, 8, '#f8fafc', '#475569', 1.6);
    drawRoundPart(g, 64, 28, 18, 13, 0, isOcean ? '#7dd3fc' : '#5eead4', '#0284c7', 1.4);
    drawRoundPart(g, 64, 18, 8, 10, 0, '#ffffff', null, 0);
  }
  else if (type === 'edo_machiya') {
    // ================= [미나토마치 전용: 일본풍 에도시대 기와지붕 목조 상가/여관(Edo Machiya)] =================
    drawRoundPart(g, 64, 114, 56, 12, 0, 'rgba(15, 23, 42, 0.34)', null, 0);
    // 1층 회벽(Shikkui) & 삼나무 기둥 및 격자창(Koshi)
    drawRoundedRectPath(g, 18, 48, 92, 64, 5, '#fffbeb', '#451a03', 1.8);
    g.fillStyle = '#78350f';
    g.fillRect(20, 48, 6, 64);
    g.fillRect(102, 48, 6, 64);
    g.fillRect(61, 48, 6, 64);
    g.fillRect(18, 76, 92, 5);
    // 2층 창호지 미닫이창(Shoji)
    drawRoundedRectPath(g, 29, 53, 28, 19, 2, '#fef3c7', '#78350f', 1.4);
    drawRoundedRectPath(g, 71, 53, 28, 19, 2, '#fef3c7', '#78350f', 1.4);
    g.strokeStyle = '#92400e';
    g.lineWidth = 1.1;
    g.beginPath();
    g.moveTo(43, 53); g.lineTo(43, 72);
    g.moveTo(85, 53); g.lineTo(85, 72);
    g.stroke();
    // 1층 출입문 & 남색 에도 노렌(Noren 포렴)
    drawRoundedRectPath(g, 48, 81, 32, 31, 3, '#451a03', '#271409', 1.5);
    for (let i = 0; i < 3; i++) {
      drawRoundedRectPath(g, 46 + i * 12.5, 78, 11, 16, 2, '#1e3a8a', '#f8fafc', 1.1);
      drawRoundPart(g, 51.5 + i * 12.5, 86, 2.8, 2.8, 0, '#f8fafc', null, 0);
    }
    // 좌·우 목조 세로 격자창
    drawRoundedRectPath(g, 25, 83, 18, 22, 2, '#d97706', '#451a03', 1.3);
    drawRoundedRectPath(g, 85, 83, 18, 22, 2, '#d97706', '#451a03', 1.3);
    // 처마 밑 붉은 종이 제등(Chochin 홍등) 2개
    drawRoundPart(g, 24, 56, 5.5, 7.5, 0, '#ef4444', '#7f1d1d', 1.2);
    drawRoundPart(g, 104, 56, 5.5, 7.5, 0, '#ef4444', '#7f1d1d', 1.2);
    drawRoundPart(g, 24, 56, 2.5, 4.0, 0, '#fef08a', null, 0);
    drawRoundPart(g, 104, 56, 2.5, 4.0, 0, '#fef08a', null, 0);
    // 에도시대 곡선형 흑기와 지붕(Kawara Roof) & 황금 샤치호코 용마루 장식
    g.save();
    const roofGrad = g.createLinearGradient(64, 10, 64, 52);
    roofGrad.addColorStop(0, '#334155');
    roofGrad.addColorStop(0.6, '#1e293b');
    roofGrad.addColorStop(1, '#0f172a');
    g.fillStyle = roofGrad;
    g.strokeStyle = '#090d16';
    g.lineWidth = 2.0;
    g.beginPath();
    g.moveTo(6, 50);
    g.quadraticCurveTo(34, 34, 42, 16);
    g.lineTo(86, 16);
    g.quadraticCurveTo(94, 34, 122, 50);
    g.quadraticCurveTo(64, 46, 6, 50);
    g.closePath();
    g.fill();
    g.stroke();
    drawRoundedRectPath(g, 38, 12, 52, 6, 3, '#475569', '#090d16', 1.4);
    drawRoundPart(g, 40, 11, 3.5, 5, -0.3, '#fbbf24', '#78350f', 1.1);
    drawRoundPart(g, 88, 11, 3.5, 5, 0.3, '#fbbf24', '#78350f', 1.1);
    g.restore();
  }
  else if (type === 'edo_torii') {
    // ================= [미나토마치 전용: 에도시대 항구 주홍색 대토리이(Grand Torii Gate) & 석등] =================
    drawRoundPart(g, 64, 110, 52, 11, 0, 'rgba(15, 23, 42, 0.30)', null, 0);
    // 좌·우 기둥 주춧돌(Kamebara)
    drawRoundedRectPath(g, 26, 96, 18, 14, 4, '#334155', '#0f172a', 1.6);
    drawRoundedRectPath(g, 84, 96, 18, 14, 4, '#334155', '#0f172a', 1.6);
    // 주홍색 기둥(Hashira)
    drawRoundedRectPath(g, 29, 22, 12, 78, 4, '#dc2626', '#7f1d1d', 1.8);
    drawRoundedRectPath(g, 87, 22, 12, 78, 4, '#dc2626', '#7f1d1d', 1.8);
    // 하단 가로보(Nuki) & 중앙 현판(Gakuzuka)
    drawRoundedRectPath(g, 16, 36, 96, 9, 3, '#dc2626', '#7f1d1d', 1.7);
    drawRoundedRectPath(g, 57, 22, 14, 22, 3, '#1e293b', '#fbbf24', 1.6);
    drawRoundPart(g, 64, 33, 3.5, 4.5, 0, '#fbbf24', null, 0);
    // 상단 곡선 카사기(Kasagi) 지붕보
    g.save();
    g.fillStyle = '#1e293b';
    g.strokeStyle = '#090d16';
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(8, 16);
    g.quadraticCurveTo(64, 23, 120, 16);
    g.lineTo(116, 25);
    g.quadraticCurveTo(64, 29, 12, 25);
    g.closePath();
    g.fill();
    g.stroke();
    drawRoundedRectPath(g, 14, 22, 100, 6, 2, '#ef4444', '#7f1d1d', 1.4);
    // 시메나와(금줄)와 하얀 종이 장식(Shide)
    g.strokeStyle = '#d97706';
    g.lineWidth = 3.0;
    g.beginPath();
    g.moveTo(35, 46);
    g.quadraticCurveTo(64, 53, 93, 46);
    g.stroke();
    for (const sx of [48, 64, 80]) {
      drawRoundedRectPath(g, sx - 2.5, 48, 5, 9, 1, '#ffffff', '#cbd5e1', 0.9);
    }
    g.restore();
  }
  else if (type === 'ship_barrel_crate') {
    // ================= [해적 선박 내부 전용: 럼주 오크통 & 해적 화약 상자 & 포탄 더미] =================
    drawRoundPart(g, 64, 112, 48, 11, 0, 'rgba(0, 0, 0, 0.45)', null, 0);
    // 뒤쪽 목재 화약 상자(Pirate Cargo Crate)
    drawRoundedRectPath(g, 18, 36, 56, 62, 6, '#78350f', '#271409', 2.0);
    g.strokeStyle = '#451a03';
    g.lineWidth = 2.2;
    g.strokeRect(23, 41, 46, 52);
    g.beginPath();
    g.moveTo(23, 41); g.lineTo(69, 93);
    g.moveTo(69, 41); g.lineTo(23, 93);
    g.stroke();
    // 앞쪽 철제 테두리 럼주 오크통(Rum Barrel)
    drawRoundPart(g, 78, 74, 28, 34, 0, '#92400e', '#271409', 2.0);
    drawRoundedRectPath(g, 52, 58, 52, 6, 2, '#334155', '#090d16', 1.4);
    drawRoundedRectPath(g, 52, 82, 52, 6, 2, '#334155', '#090d16', 1.4);
    drawRoundPart(g, 78, 70, 4.5, 4.5, 0, '#fbbf24', '#451a03', 1.2);
    // 바닥에 쌓인 검은 철제 포탄(Cannonballs) 3개
    drawRoundPart(g, 34, 100, 9, 9, 0, '#1e293b', '#090d16', 1.5);
    drawRoundPart(g, 48, 102, 9, 9, 0, '#1e293b', '#090d16', 1.5);
    drawRoundPart(g, 41, 90, 9, 9, 0, '#334155', '#090d16', 1.5);
  }
  else if (type === 'ship_mast_pillar') {
    // ================= [해적 선박 내부 전용: 대형 목조 마스트 기둥 & 밧줄 & 황동 선박 램프] =================
    drawRoundPart(g, 64, 112, 36, 10, 0, 'rgba(0, 0, 0, 0.48)', null, 0);
    // 마스트 하단 팔각 받침대
    drawRoundedRectPath(g, 32, 94, 64, 18, 5, '#451a03', '#1c1917', 1.8);
    // 굵은 원목 마스트 기둥
    const mastGrad = g.createLinearGradient(40, 12, 88, 100);
    mastGrad.addColorStop(0, '#92400e');
    mastGrad.addColorStop(0.5, '#78350f');
    mastGrad.addColorStop(1, '#451a03');
    drawRoundedRectPath(g, 40, 12, 48, 86, 6, mastGrad, '#1c1917', 2.0);
    // 상·하단 철제 밴드와 황동 리벳
    drawRoundedRectPath(g, 37, 22, 54, 8, 3, '#334155', '#090d16', 1.5);
    drawRoundedRectPath(g, 37, 78, 54, 8, 3, '#334155', '#090d16', 1.5);
    // 기둥 허리에 감긴 굵은 항해용 밧줄(Coiled Rigging Rope)
    for (let ry = 46; ry <= 62; ry += 5) {
      drawRoundedRectPath(g, 38, ry, 52, 5.5, 2.5, '#d97706', '#78350f', 1.2);
    }
    // 마스트에 걸린 따뜻한 황동 선박 램프(Ship Lantern)
    drawRoundedRectPath(g, 86, 36, 14, 4, 2, '#334155', '#090d16', 1.2);
    drawRoundPart(g, 96, 48, 9, 11, 0, 'rgba(251, 191, 36, 0.38)', null, 0);
    drawRoundedRectPath(g, 91, 41, 10, 14, 3, '#fef08a', '#b45309', 1.4);
  }


  else {
    // 미정의 스프라이트 키에 대한 안전한 기본 캐릭터 폴백
    drawSubcultureSDCharacter(g, {
      gender: 'male',
      eyeType: 'diluc_sharp',
      hair: '#38bdf8',
      hairShade: '#0284c7',
      outfitMain: '#1e293b',
      outfitSub: '#38bdf8',
      trimGold: '#fbbf24'
    });
  }

  g.restore();

  // 캔버스에 고밀도 2D 도트 & 3D 입체 셰이더 적용 (2×2 도트 픽셀 그리드)
  applyHD3DPixelArtShader(off, 2);

  if (flash) {
    g.save();
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = 'rgba(255, 255, 255, 0.85)';
    g.fillRect(0, 0, size, size);
    g.restore();
  }

  hdSpriteCache[cacheKey] = off;
  return off;
}
