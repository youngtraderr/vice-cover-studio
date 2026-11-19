// Utility: return panel rectangles for a layout, each with default transforms.
export function getLayoutPanels(layout, w, h) {
  const panels = [];
  // grid4
  if (layout === 'grid4') {
    const sw = w / 2, sh = h / 2;
    panels.push({ x: 0, y: 0, w: sw, h: sh, px: 0, py: 0, zoom: 1 });
    panels.push({ x: sw, y: 0, w: sw, h: sh, px: 0, py: 0, zoom: 1 });
    panels.push({ x: 0, y: sh, w: sw, h: sh, px: 0, py: 0, zoom: 1 });
    panels.push({ x: sw, y: sh, w: sw, h: sh, px: 0, py: 0, zoom: 1 });
  }
  // grid9
  else if (layout === 'grid9') {
    const sw = w / 3, sh = h / 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        panels.push({ x: i * sw, y: j * sh, w: sw, h: sh, px: 0, py: 0, zoom: 1 });
      }
    }
  }
  // hero + three
  else if (layout === 'hero3') {
    const heroH = h * 0.6;
    const bottomH = h - heroH;
    const bottomW = w / 3;
    // hero panel
    panels.push({ x: 0, y: 0, w, h: heroH, px: 0, py: 0, zoom: 1 });
    // three bottom panels
    for (let i = 0; i < 3; i++) {
      panels.push({ x: i * bottomW, y: heroH, w: bottomW, h: bottomH, px: 0, py: 0, zoom: 1 });
    }
  }
  // full-bleed
  else if (layout === 'full') {
    panels.push({ x: 0, y: 0, w, h, px: 0, py: 0, zoom: 1 });
  }
  // tilted snapshot
  else {
    // single panel with tilt
    panels.push({ x: 0, y: 0, w, h, px: 0, py: 0, zoom: 1, tilt: 0.1 });
  }
  return panels;
}

// Draw cover with per-panel transforms and optional tilt.
export function drawCover(canvas, photo, caption, layout, grade, grain, vignette, panels, selectedIndex) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  const ps = panels && panels.length ? panels : getLayoutPanels(layout, w, h);

  // Mono grade uses filter on the whole canvas (since we can't easily apply per-panel).
  const monoFilter = grade === 'mono' ? 'grayscale(1) saturate(0)' : 'none';

  if (layout === 'tilted') {
    const p = ps[0];
    if (photo) {
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(p.tilt || 0);
      ctx.scale(p.zoom, p.zoom);
      ctx.translate(-p.px, -p.py);
      ctx.filter = monoFilter;
      ctx.drawImage(photo, -w / 2, -h / 2, w, h);
      ctx.filter = 'none';
      ctx.restore();
    }
  } else if (photo) {
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      ctx.save();
      if (i === selectedIndex) {
          ctx.strokeStyle = '#ff2e88';
          ctx.lineWidth = 10;
          ctx.strokeRect(p.x, p.y, p.w, p.h);
      }
      ctx.beginPath();
      ctx.rect(p.x, p.y, p.w, p.h);
      ctx.clip();
      ctx.filter = monoFilter;
      const scale = Math.max(p.w / photo.naturalWidth, p.h / photo.naturalHeight) * p.zoom;
      const dw = photo.naturalWidth * scale;
      const dh = photo.naturalHeight * scale;
      const left = p.x + p.w / 2 - dw / 2 + p.px;
      const top = p.y + p.h / 2 - dh / 2 + p.py;
      ctx.drawImage(photo, left, top, dw, dh);
      ctx.restore();
    }
  }

  // Apply colour grade overlays (after images)
  if (grade === 'sunset') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(255, 120, 80, 0.4)');
    grad.addColorStop(1, 'rgba(200, 40, 120, 0.6)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (grade === 'neon') {
    ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.fillRect(0, 0, w, h);
  } else if (grade === 'dusk') {
    ctx.fillStyle = 'rgba(0, 0, 50, 0.4)';
    ctx.fillRect(0, 0, w, h);
  }

  // Vignette
  if (vignette) {
    const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.7);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // Grain overlay (applies to final image)
  if (grain) {
    const imgData = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const rand = (Math.random() - 0.5) * 30;
      imgData.data[i] += rand;
      imgData.data[i + 1] += rand;
      imgData.data[i + 2] += rand;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // Halftone title block
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(w * 0.1, h * 0.8, w * 0.8, h * 0.15);
  ctx.fillStyle = '#000';
  ctx.font = 'bold 80px Anton';
  ctx.textAlign = 'center';
  ctx.fillText(caption.trim().toUpperCase(), w / 2, h * 0.9);
}
