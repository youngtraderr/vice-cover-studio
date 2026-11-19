export function drawCover(canvas, photo, caption, layout) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  if (photo) {
    if (layout === 'grid4') {
        const sw = w / 2;
        const sh = h / 2;
        ctx.drawImage(photo, 0, 0, sw, sh);
        ctx.drawImage(photo, sw, 0, sw, sh);
        ctx.drawImage(photo, 0, sh, sw, sh);
        ctx.drawImage(photo, sw, sh, sw, sh);
    } else {
        ctx.drawImage(photo, 0, 0, w, h);
    }
  }

  // Neon gradient
  const grad = ctx.createLinearGradient(0, h * 0.7, 0, h);
  grad.addColorStop(0, 'rgba(255, 0, 255, 0)');
  grad.addColorStop(1, 'rgba(0, 255, 255, 0.5)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Caption
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 80px Anton';
  ctx.textAlign = 'center';
  ctx.fillText(caption, w / 2, h - 50);
}
