// ============================================================================
// 2. 2020s 모던 서브컬쳐 128×128 SD 도트 엔진 (블루아카이브/명일방주/산나비 감성 무광 시크 눈매 & 남/여 완벽 분리)
// ============================================================================
const hdSpriteCache = {};

function ensureCanvasGradSupport(ctx) {
  if (!ctx) return ctx;
  try {
    const testG = ctx.createLinearGradient && ctx.createLinearGradient(0, 0, 1, 1);
    if (testG && typeof testG.addColorStop === 'function') return ctx;
  } catch (e) {}
  return new Proxy(ctx, {
    get(target, prop) {
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
        return () => ({ addColorStop() {} });
      }
      const v = target[prop];
      return typeof v === 'function' ? v.bind(target) : v;
    },
    set(target, prop, val) {
      target[prop] = val;
      return true;
    }
  });
}

function createPixelSurface(size = 1024) {
  const off = document.createElement('canvas');
  off.width = size;
  off.height = size;
  const g = ensureCanvasGradSupport(off.getContext('2d'));
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  return { canvas: off, g };
}

// ============================================================================
// 고밀도 2D 도트 & 3D 입체 셀셰이딩 변환기 (512×512 캔버스 내 2×2 정밀 도트 그리드 스냅)
// - 내부 눈매/이목구비 선은 절대 뭉개지 않도록 보존하면서, 픽셀 그리드(2px 단위)와
//   다단계 입체 음영 팔레트 스냅을 적용해 "2D 도트인데 3D처럼 입체감이 느껴지는" 퀄리티 구현!
// ============================================================================
function applyHD3DPixelArtShader(canvas, pixelStep = 2) {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = ensureCanvasGradSupport(canvas.getContext('2d'));
  const imgData = ctx.getImageData(0, 0, w, h);
  const src = imgData.data;
  const out = ctx.createImageData(w, h);
  const dst = out.data;

  const gw = Math.floor(w / pixelStep);
  const gh = Math.floor(h / pixelStep);
  const aGrid = new Uint8Array(gw * gh);
  const rGrid = new Uint8Array(gw * gh);
  const gGrid = new Uint8Array(gw * gh);
  const bGrid = new Uint8Array(gw * gh);

  for (let gy = 0; gy < gh; gy++) {
    const py = gy * pixelStep + (pixelStep >> 1);
    for (let gx = 0; gx < gw; gx++) {
      const px = gx * pixelStep + (pixelStep >> 1);
      const idx = (py * w + px) * 4;
      const a = src[idx + 3];
      const gIdx = gy * gw + gx;
      if (a >= 90) {
        aGrid[gIdx] = 255;
        // 3D 셀셰이딩 다단계 색감 양자화 (부드러운 입체 음영 계조를 도트 톤으로 스냅)
        rGrid[gIdx] = Math.min(255, Math.round(src[idx] / 6) * 6);
        gGrid[gIdx] = Math.min(255, Math.round(src[idx + 1] / 6) * 6);
        bGrid[gIdx] = Math.min(255, Math.round(src[idx + 2] / 6) * 6);
      } else {
        aGrid[gIdx] = 0;
      }
    }
  }

  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      const gIdx = gy * gw + gx;
      if (aGrid[gIdx] === 0) continue;

      let r = rGrid[gIdx];
      let g = gGrid[gIdx];
      let b = bGrid[gIdx];

      // 최외곽 실루엣 픽셀에만 본래 색상을 어둡게 눌러준 컬러 도트 외곽선 적용 (검정 떡칠 방지)
      const isOuterEdge =
        gx === 0 || gx === gw - 1 || gy === 0 || gy === gh - 1 ||
        aGrid[gIdx - 1] === 0 || aGrid[gIdx + 1] === 0 ||
        aGrid[gIdx - gw] === 0 || aGrid[gIdx + gw] === 0;

      if (isOuterEdge) {
        r = Math.max(18, Math.floor(r * 0.32));
        g = Math.max(14, Math.floor(g * 0.30));
        b = Math.max(26, Math.floor(b * 0.38));
      }

      for (let dy = 0; dy < pixelStep; dy++) {
        const rowOffset = (gy * pixelStep + dy) * w;
        for (let dx = 0; dx < pixelStep; dx++) {
          const pIdx = (rowOffset + gx * pixelStep + dx) * 4;
          dst[pIdx] = r;
          dst[pIdx + 1] = g;
          dst[pIdx + 2] = b;
          dst[pIdx + 3] = 255;
        }
      }
    }
  }
  ctx.putImageData(out, 0, 0);
}

function drawRoundPart(g, cx, cy, rx, ry, rot, fillStyle, strokeStyle = '#231829', lw = 1.4) {
  g.save();
  g.translate(cx, cy);
  if (rot) g.rotate(rot);
  g.beginPath();
  g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  g.fillStyle = fillStyle;
  g.fill();
  if (strokeStyle && lw > 0) {
    g.strokeStyle = strokeStyle;
    g.lineWidth = lw;
    g.stroke();
  }
  g.restore();
}

function drawRoundedRectPath(g, x, y, w, h, r, fillStyle, strokeStyle = '#231829', lw = 1.4) {
  g.save();
  g.beginPath();
  g.roundRect(x, y, w, h, r);
  g.fillStyle = fillStyle;
  g.fill();
  if (strokeStyle && lw > 0) {
    g.strokeStyle = strokeStyle;
    g.lineWidth = lw;
    g.stroke();
  }
  g.restore();
}

// 색상 밝기 조절 헬퍼 (3D 입체 명암 생성용)
function shadeHexColor(hex, percent) {
  if (!hex || hex[0] !== '#' || hex.length < 7) return hex || '#334155';
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.max(0, Math.min(255, Math.round(r + (percent > 0 ? (255 - r) * percent : r * percent))));
  g = Math.max(0, Math.min(255, Math.round(g + (percent > 0 ? (255 - g) * percent : g * percent))));
  b = Math.max(0, Math.min(255, Math.round(b + (percent > 0 ? (255 - b) * percent : b * percent))));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
