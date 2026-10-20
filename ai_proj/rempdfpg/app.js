(() => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js';
  // Opening index.html directly from disk is supported: avoid worker/CORS restrictions on file://.
  if (window.location.protocol === 'file:') pdfjsLib.disableWorker = true;
  const $ = (id) => document.getElementById(id);
  const hero = $('hero'), editor = $('editor'), dropzone = $('dropzone'), input = $('file-input'), grid = $('page-grid');
  const selected = new Set();
  let sourceBytes = null, sourceName = 'document.pdf', pageTotal = 0;

  function showToast(message) { const el = $('toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 3500); }
  function formatBytes(bytes) { if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`; return `${(bytes / 1024 / 1024).toFixed(1)} MB`; }
  function updateControls() {
    $('selected-count').textContent = selected.size;
    $('page-count').textContent = `${pageTotal} ${pageTotal === 1 ? 'page' : 'pages'}`;
    $('download').disabled = selected.size === 0 || selected.size === pageTotal;
    document.querySelectorAll('.page-card').forEach((card) => card.classList.toggle('selected', selected.has(Number(card.dataset.page))));
  }
  async function loadFile(file) {
    if (!file || file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) { showToast('Please choose a PDF file.'); return; }
    try {
      sourceName = file.name;
      sourceBytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: sourceBytes.slice(0) }).promise;
      pageTotal = pdf.numPages; selected.clear(); grid.innerHTML = '';
      $('file-meta').textContent = `${sourceName} · ${formatBytes(file.size)}`;
      $('download').textContent = 'Download edited PDF ↓';
      for (let i = 1; i <= pageTotal; i++) await renderPage(pdf, i);
      hero.classList.add('hidden'); $('how-it-works').classList.add('hidden'); editor.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' }); updateControls();
    } catch (error) { console.error(error); showToast('This PDF could not be opened. It may be password protected or damaged.'); }
  }
  async function renderPage(pdf, number) {
    const page = await pdf.getPage(number), viewport = page.getViewport({ scale: 0.58 });
    const card = document.createElement('button'); card.className = 'page-card'; card.dataset.page = number; card.type = 'button';
    card.innerHTML = `<span class="page-number">${String(number).padStart(2, '0')}</span><span class="page-check">✓</span><span class="canvas-wrap"></span><span class="page-label">Page ${number}</span>`;
    const canvas = document.createElement('canvas'); canvas.width = viewport.width; canvas.height = viewport.height; card.querySelector('.canvas-wrap').appendChild(canvas); grid.appendChild(card);
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    card.addEventListener('click', () => { selected.has(number) ? selected.delete(number) : selected.add(number); updateControls(); });
  }
  input.addEventListener('change', () => loadFile(input.files[0]));
  $('change-file').addEventListener('click', () => input.click());
  ['dragenter', 'dragover'].forEach(type => dropzone.addEventListener(type, e => { e.preventDefault(); dropzone.classList.add('dragging'); }));
  ['dragleave', 'drop'].forEach(type => dropzone.addEventListener(type, e => { e.preventDefault(); dropzone.classList.remove('dragging'); }));
  dropzone.addEventListener('drop', e => loadFile(e.dataTransfer.files[0]));
  $('select-all').addEventListener('click', () => { for (let i = 1; i <= pageTotal; i++) selected.add(i); updateControls(); });
  $('clear-all').addEventListener('click', () => { selected.clear(); updateControls(); });
  $('download').addEventListener('click', async () => {
    if (!sourceBytes || !selected.size || selected.size === pageTotal) return;
    const button = $('download'); button.disabled = true; button.textContent = 'Preparing PDF…';
    try {
      const source = await PDFLib.PDFDocument.load(sourceBytes), output = await PDFLib.PDFDocument.create();
      const keep = Array.from({ length: source.getPageCount() }, (_, i) => i).filter(i => !selected.has(i + 1));
      const pages = await output.copyPages(source, keep); pages.forEach(page => output.addPage(page));
      const bytes = await output.save(); const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = sourceName.replace(/\.pdf$/i, '') + '-edited.pdf'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000); showToast('Your edited PDF has been downloaded.');
    } catch (error) { console.error(error); showToast('Could not create the edited PDF.'); }
    button.disabled = false; button.textContent = 'Download edited PDF ↓'; updateControls();
  });
})();
