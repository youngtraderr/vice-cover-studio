// Fixed scenes for screenshots: ?shot=editor shows the page with a sample photo; ?shot=cover shows the cover alone.
// `photo` picks the sample (samples/<photo>.jpg) and `caption` the words. window.__shotReady is set once the fonts and
// the photo have loaded and the cover has painted twice.

/** Resolves once Anton and Pacifico are usable by the canvas (fallback resolution included). */
export async function loadCoverFonts() {
  const wanted = ['80px Anton', '40px Pacifico'];
  if (!document.fonts || !document.fonts.load) return;
  await Promise.all(wanted.map((spec) => document.fonts.load(spec).catch(() => [])));
  await document.fonts.ready;
}

export async function runShot(shot, query, load) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  await loadCoverFonts();
  await load(`samples/${query.get('photo') ?? 'pier'}.jpg`, query.get('caption') ?? 'Sunset Heist');
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
