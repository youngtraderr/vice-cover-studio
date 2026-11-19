import { drawCover, getLayoutPanels } from './cover.js';

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const layoutSelect = document.getElementById('layout');
const gradeSelect = document.getElementById('grade');
const grainCheck = document.getElementById('grain');
const vignetteCheck = document.getElementById('vignette');
const zoomInp = document.getElementById('zoom');
const panXInp = document.getElementById('panX');
const panYInp = document.getElementById('panY');
const resetBtn = document.getElementById('resetTransform');

let photo = null;
let panels = [];
let selectedIndex = 0;

async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function redraw() {
  drawCover(canvas, photo, captionInput.value, layoutSelect.value, gradeSelect.value, grainCheck.checked, vignetteCheck.checked, panels, selectedIndex);
}

// Click to select panel
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  for (let i = 0; i < panels.length; i++) {
    const p = panels[i];
    if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) {
      selectedIndex = i;
      zoomInp.value = panels[i].zoom;
      panXInp.value = panels[i].px;
      panYInp.value = panels[i].py;
      redraw();
      break;
    }
  }
});

function updateTransform() {
  if (panels[selectedIndex]) {
    panels[selectedIndex].zoom = parseFloat(zoomInp.value);
    panels[selectedIndex].px = parseFloat(panXInp.value);
    panels[selectedIndex].py = parseFloat(panYInp.value);
    redraw();
  }
}

zoomInp.addEventListener('input', updateTransform);
panXInp.addEventListener('input', updateTransform);
panYInp.addEventListener('input', updateTransform);

resetBtn.addEventListener('click', () => {
  panels[selectedIndex].zoom = 1;
  panels[selectedIndex].px = 0;
  panels[selectedIndex].py = 0;
  zoomInp.value = 1;
  panXInp.value = 0;
  panYInp.value = 0;
  redraw();
});

document.getElementById('photo').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  photo = await loadImage(URL.createObjectURL(file));
  panels = getLayoutPanels(layoutSelect.value, canvas.width, canvas.height);
  redraw();
});

layoutSelect.addEventListener('change', () => {
  panels = getLayoutPanels(layoutSelect.value, canvas.width, canvas.height);
  selectedIndex = 0;
  redraw();
});

captionInput.addEventListener('input', redraw);
gradeSelect.addEventListener('change', redraw);
grainCheck.addEventListener('change', redraw);
vignetteCheck.addEventListener('change', redraw);

document.getElementById('export').addEventListener('click', () => {
  const data = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = data;
  a.download = 'vice-cover.png';
  a.click();
});

// Init
panels = getLayoutPanels(layoutSelect.value, canvas.width, canvas.height);
redraw();
