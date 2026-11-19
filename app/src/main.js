import { drawCover } from './cover.js';

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const layoutSelect = document.getElementById('layout');
let photo = null;

async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function redraw() {
  drawCover(canvas, photo, captionInput.value, layoutSelect.value);
}

document.getElementById('photo').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  photo = await loadImage(URL.createObjectURL(file));
  redraw();
});

captionInput.addEventListener('input', redraw);
layoutSelect.addEventListener('change', redraw);

document.getElementById('export').addEventListener('click', () => {
  const data = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = data;
  a.download = 'vice-cover.png';
  a.click();
});

redraw();
