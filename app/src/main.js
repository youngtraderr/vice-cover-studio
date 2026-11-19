import { drawCover, getLayoutPanels } from './cover.js';
import { runShot, loadCoverFonts } from './shots.js';

const canvas = document.getElementById('cover');
const photoInput = document.getElementById('photo');
const captionInput = document.getElementById('caption');
const layoutSelect = document.getElementById('layout');
const gradeSelect = document.getElementById('grade');
const grainCheck = document.getElementById('grain');
const vignetteCheck = document.getElementById('vignette');
const zoomInp = document.getElementById('zoom');
const panXInp = document.getElementById('panX');
const panYInp = document.getElementById('panY');
const resetBtn = document.getElementById('resetTransform');
const exportBtn = document.getElementById('export');
const exportAllBtn = document.getElementById('export-all');
const exportSizeSelect = document.getElementById('export-size');
const status = document.getElementById('status');
const pickPhotoBtn = document.getElementById('pick-photo');
const photoNameEl = document.getElementById('photo-name');
const panelLabel = document.getElementById('panel-label');

let photo = null;
let panels = [];
let selectedIndex = 0;
let dragState = null;

const EXPORT_SIZES = [
  { key: '1080x1080', w: 1080, h: 1080 },
  { key: '1080x1350', w: 1080, h: 1350 },
  { key: '1920x1080', w: 1920, h: 1080 },
];

async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function currentPanels() {
  return getLayoutPanels(layoutSelect.value, canvas.width, canvas.height);
}

function redraw() {
  drawCover(canvas, photo, captionInput.value, layoutSelect.value, gradeSelect.value, grainCheck.checked, vignetteCheck.checked, panels, selectedIndex);
}

function syncControls() {
  const p = panels[selectedIndex];
  panelLabel.textContent = panels.length ? `${selectedIndex + 1} of ${panels.length}` : '—';
  if (!p) return;
  zoomInp.value = String(p.zoom);
  panXInp.value = String(p.px);
  panYInp.value = String(p.py);
}

function updateFromControls() {
  const p = panels[selectedIndex];
  if (!p) return;
  p.zoom = parseFloat(zoomInp.value);
  p.px = parseFloat(panXInp.value);
  p.py = parseFloat(panYInp.value);
  redraw();
}

function resetSelected() {
  const p = panels[selectedIndex];
  if (!p) return;
  p.zoom = 1;
  p.px = 0;
  p.py = 0;
  zoomInp.value = '1';
  panXInp.value = '0';
  panYInp.value = '0';
  redraw();
}

function canvasPointFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
  };
}

function panelIndexAt(x, y) {
  for (let i = 0; i < panels.length; i++) {
    const p = panels[i];
    if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) return i;
  }
  return 0;
}

canvas.addEventListener('pointerdown', (e) => {
  const { x, y } = canvasPointFromEvent(e);
  const index = panelIndexAt(x, y);
  selectedIndex = index;
  const p = panels[index];
  if (p) {
    zoomInp.value = String(p.zoom);
    panXInp.value = String(p.px);
    panYInp.value = String(p.py);
  }
  dragState = {
    index,
    startX: x,
    startY: y,
    origX: p ? p.px : 0,
    origY: p ? p.py : 0,
  };
  canvas.setPointerCapture(e.pointerId);
  redraw();
});

canvas.addEventListener('pointermove', (e) => {
  if (!dragState) return;
  const { x, y } = canvasPointFromEvent(e);
  const p = panels[dragState.index];
  if (!p) return;
  const dx = x - dragState.startX;
  const dy = y - dragState.startY;
  p.px = dragState.origX + dx;
  p.py = dragState.origY + dy;
  zoomInp.value = String(p.zoom);
  panXInp.value = String(p.px);
  panYInp.value = String(p.py);
  redraw();
});

canvas.addEventListener('pointerup', () => { dragState = null; });
canvas.addEventListener('pointercancel', () => { dragState = null; });

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const { x, y } = canvasPointFromEvent(e);
  const index = panelIndexAt(x, y);
  selectedIndex = index;
  const p = panels[index];
  if (!p) return;
  const factor = Math.exp(-e.deltaY * 0.001);
  p.zoom = Math.min(10, Math.max(0.1, p.zoom * factor));
  zoomInp.value = String(p.zoom);
  panXInp.value = String(p.px);
  panYInp.value = String(p.py);
  redraw();
}, { passive: false });

photoInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  photoNameEl.textContent = file.name;
  photo = await loadImage(URL.createObjectURL(file));
  panels = currentPanels();
  selectedIndex = 0;
  redraw();
  syncControls();
});

pickPhotoBtn.addEventListener('click', () => photoInput.click());

layoutSelect.addEventListener('change', () => {
  panels = currentPanels();
  selectedIndex = 0;
  redraw();
  syncControls();
});

captionInput.addEventListener('input', redraw);
gradeSelect.addEventListener('change', redraw);
grainCheck.addEventListener('change', redraw);
vignetteCheck.addEventListener('change', redraw);
zoomInp.addEventListener('input', updateFromControls);
panXInp.addEventListener('input', updateFromControls);
panYInp.addEventListener('input', updateFromControls);
resetBtn.addEventListener('click', resetSelected);

function makeExportCanvas(sizeKey) {
  const size = EXPORT_SIZES.find((s) => s.key === sizeKey) || EXPORT_SIZES[0];
  const c = document.createElement('canvas');
  c.width = size.w;
  c.height = size.h;
  const ps = getLayoutPanels(layoutSelect.value, size.w, size.h);
  for (let i = 0; i < ps.length; i++) {
    const src = panels[i];
    if (src) {
      ps[i].px = src.px;
      ps[i].py = src.py;
      ps[i].zoom = src.zoom;
      if (src.tilt !== undefined) ps[i].tilt = src.tilt;
    }
  }
  drawCover(c, photo, captionInput.value, layoutSelect.value, gradeSelect.value, grainCheck.checked, vignetteCheck.checked, ps, selectedIndex);
  return c;
}

function exportCover() {
  const c = makeExportCanvas(exportSizeSelect.value);
  c.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cover-${exportSizeSelect.value}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
    status.textContent = `Saved cover-${exportSizeSelect.value}.png`;
  }, 'image/png');
}

function exportAll() {
  EXPORT_SIZES.forEach((size) => {
    const c = makeExportCanvas(size.key);
    c.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `cover-${size.key}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    }, 'image/png');
  });
}

exportBtn.addEventListener('click', exportCover);
exportAllBtn.addEventListener('click', exportAll);

async function loadSample(url, text) {
  photo = await loadImage(url);
  photoNameEl.textContent = `Sample photo: ${url.split('/').pop()}`;
  if (text) captionInput.value = text;
  panels = currentPanels();
  redraw();
  syncControls();
}

async function init() {
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (shot) {
    runShot(shot, params, async (url, text) => {
      photo = await loadImage(url);
      photoNameEl.textContent = `Sample photo: ${url.split('/').pop()}`;
      if (text) captionInput.value = text;
      panels = currentPanels();
      redraw();
      syncControls();
    });
  } else {
    await loadCoverFonts();
    await loadSample('samples/pier.jpg', 'Sunset Heist');
  }
}

init();
