export function drawCover(canvas, photo, caption, layout, grade) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // Background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  // Layouts
  if (photo) {
    if (layout === 'grid4') {
        const sw = w / 2, sh = h / 2;
        ctx.drawImage(photo, 0, 0, sw, sh);
        ctx.drawImage(photo, sw, 0, sw, sh);
        ctx.drawImage(photo, 0, sh, sw, sh);
        ctx.drawImage(photo, sw, sh, sw, sh);
    } else if (layout === 'hero3') {
        ctx.drawImage(photo, 0, 0, w, h * 0.6);
        ctx.drawImage(photo, 0, h * 0.6, w/3, h * 0.4);
        ctx.drawImage(photo, w/3, h * 0.6, w/3, h * 0.4);
        ctx.drawImage(photo, 2*w/3, h * 0.6, w/3, h * 0.4);
    } else {
        ctx.drawImage(photo, 0, 0, w, h);
    }
  }

  // Grade
  if (grade === 'sunset') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(255, 120, 80, 0.4)');
    grad.addColorStop(1, 'rgba(200, 40, 120, 0.6)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (grade === 'neon') {
    ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.fillRect(0, 0, w, h);
  }

  // Halftone Title Block
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(w * 0.1, h * 0.8, w * 0.8, h * 0.15);
  ctx.fillStyle = '#000';
  ctx.font = 'bold 80px Anton';
  ctx.textAlign = 'center';
  ctx.fillText(caption.toUpperCase(), w / 2, h * 0.9);
}
