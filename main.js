// ═══════════════════════════════════════════════════════════════════════════════
// Tamaño de fuentes de texto en (pt)
// ═══════════════════════════════════════════════════════════════════════════════
const PDF_TITLE_PT  = 17;   // título siempre 14pt
const PDF_MSG1_PT   = 8;   // mensaje 1 siempre 10pt
const PDF_MSG2_PT   = 6;    // mensaje 2 siempre 7pt
const PDF_NUM_PT    = 9;    // tamaño fijo para números en PDF

// ═══════════════════════════════════════════════════════════════════════════════
// Estado
// ═══════════════════════════════════════════════════════════════════════════════
let bgImageData = null;
let boletasData = [];
let generatedNumbers = [];
let selectedDirHandle = null;
let lastWinners = [];
let selectedFont = 'helvetica';
let selectedFontCSS = 'Arial';

const fsaSupported = 'showDirectoryPicker' in window;
if (!fsaSupported) {
  document.getElementById('apiWarning').style.display = 'block';
  const fp = document.getElementById('folderPickerRow');
  fp.style.opacity = '.5'; fp.style.pointerEvents = 'none';
  document.getElementById('folderPath').textContent = 'Descarga automática activa';
}

const today = new Date();
document.getElementById('fecha').value = today.toISOString().split('T')[0];
const exp = new Date(today); exp.setDate(exp.getDate() + 1);
document.getElementById('expiracion').value = exp.toISOString().split('T')[0];

// ═══════════════════════════════════════════════════════════════════════════════
// Funciones auxiliares
// ═══════════════════════════════════════════════════════════════════════════════
function syncRange(el) {
  document.getElementById('numCountVal').textContent = el.value;
  document.getElementById('numCountDisp').textContent = el.value;
  updateLivePreview();
}
function syncColor(inId, hexId) {
  document.getElementById(hexId).textContent = document.getElementById(inId).value.toUpperCase();
  updateLivePreview();
}
function hexToRgb(hex) {
  return { r:parseInt(hex.slice(1,3),16), g:parseInt(hex.slice(3,5),16), b:parseInt(hex.slice(5,7),16) };
}
function getDateTimeStr() {
  const n=new Date(), p=v=>String(v).padStart(2,'0');
  return `${n.getFullYear()}${p(n.getMonth()+1)}${p(n.getDate())}_${p(n.getHours())}${p(n.getMinutes())}${p(n.getSeconds())}`;
}
function fmtDate(s) {
  if (!s) return '';
  return new Date(s+'T12:00:00').toLocaleDateString('es-CO',{year:'numeric',month:'long',day:'numeric'});
}
function showToast(msg, type='info') {
  const t=document.getElementById('toast');
  t.textContent=msg; t.className=`toast ${type} show`;
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),4000);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Vista previa en vivo
// ═══════════════════════════════════════════════════════════════════════════════
function updateLivePreview() {
  const titulo    = document.getElementById('titulo').value.trim() || 'TÍTULO DE LA RIFA';
  const tituloBold= document.getElementById('tituloBold').checked;
  const fecha     = fmtDate(document.getElementById('fecha').value) || 'Fecha del sorteo';
  const waNumer   = document.getElementById('whatsapp').value.trim();
  const whatsapp  = waNumer ? `Whatsapp: ${waNumer}` : '';
  const msg1      = document.getElementById('msg1').value.trim();
  const msg2      = document.getElementById('msg2').value.trim();
  const cT        = document.getElementById('cTitulo').value;
  const cN        = document.getElementById('cNumeros').value;
  const cL        = document.getElementById('cLineas').value;
  const precio    = parseFloat(document.getElementById('precio').value||5).toFixed(2);
  const numCount  = parseInt(document.getElementById('numCount').value) || 4;
  const fontCSS   = selectedFontCSS;
  const fontW     = tituloBold ? 'bold' : 'normal';

  const numRowsHTML = [];
  for (let i=0;i<sampleNums.length;i+=2) {
    const pair=sampleNums.slice(i,i+2);
    numRowsHTML.push(`<div class="bp-numrow">${pair.map(n=>`<div class="bp-num" style="color:${cN};border-color:${cN}">${String(n).padStart(2,'0')}</div>`).join('')}</div>`);
  }

  const mainMsgs=[{text:msg1},{text:msg2}].filter(m=>m.text);
  const hasAnyMsg=mainMsgs.length>0||whatsapp;
  const bgStyle=bgImageData
    ?`background-image:url(${bgImageData});background-size:cover;background-position:center;`
    :`background:#16161e;`;

  document.getElementById('liveBoleta').innerHTML=`
    <div style="position:relative;overflow:hidden;">
      <div style="position:absolute;inset:0;${bgStyle}"></div>
      <div class="bp-wrap" style="color:${cT};position:relative;z-index:1;">
        <div class="bp-hdr" style="border-color:${cL}">
          <div class="bp-title" style="font-family:'${fontCSS}',sans-serif;font-weight:${fontW};">${titulo}</div>
          <div class="bp-hdr-right">
            <div class="bp-id">#0001</div>
            <div class="bp-fecha-hdr">${fecha}</div>
          </div>
        </div>
        <div class="bp-body">
          <div class="bp-nums">${numRowsHTML.join('')}</div>
          <div class="bp-right" style="border-color:${cL};background:rgba(255,255,255,0.96);border-radius:4px;margin:4px 0;">
            <div class="bp-qr" style="width:100%;height:auto;aspect-ratio:1;background:transparent;font-size:38px;display:flex;align-items:center;justify-content:center;">▦</div>
          </div>
        </div>
        ${hasAnyMsg?`
        <div class="bp-msgs-wrap" style="border-color:${cL}">
          ${mainMsgs.length?`
          <div class="bp-msgs">
            ${mainMsgs.map(m=>`<div>${m.text}</div>`).join('')}
          </div>`:''}
          ${whatsapp?`<div class="bp-wa" style="color:${cT}">${whatsapp}</div>`:''}
        </div>`:''}
        <div class="bp-footer" style="border-color:${cL}">
          <div class="bp-legal">La Boleta se anulará si presenta borrones o enmendaduras. Se paga al portador.</div>
          <div class="bp-precio-footer" style="color:${cN}">$${precio}</div>
        </div>
      </div>
    </div>`;
}

// Conectar todos los campos de entrada a la vista previa en tiempo real
function wireInputs() {
  const ids=['titulo','fecha','expiracion','whatsapp','msg1','msg2',
             'tituloBold','cTitulo','cNumeros','cLineas','precio','numCount'];
  ids.forEach(id=>{
    const el=document.getElementById(id);
    if(el){ el.addEventListener('input',updateLivePreview); el.addEventListener('change',updateLivePreview); }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Imagen de Fondo
// ═══════════════════════════════════════════════════════════════════════════════
function handleImageUpload(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const maxD=1200; let w=img.width, h=img.height;
      if (w>maxD||h>maxD) { const r=Math.min(maxD/w,maxD/h); w=Math.round(w*r); h=Math.round(h*r); }
      const cvs=document.createElement('canvas'); cvs.width=w; cvs.height=h;
      cvs.getContext('2d').drawImage(img,0,0,w,h);
      bgImageData=cvs.toDataURL('image/jpeg',.82);
      const pv=document.getElementById('imgPreview'); pv.src=bgImageData; pv.style.display='block';
      document.querySelector('.upload-text').textContent='✓ '+file.name;
      updateLivePreview();
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Carpeta de guardado
// ═══════════════════════════════════════════════════════════════════════════════
async function selectFolder() {
  if (!fsaSupported) return;
  try {
    selectedDirHandle = await window.showDirectoryPicker({mode:'readwrite'});
    document.getElementById('folderPath').textContent = selectedDirHandle.name;
    document.getElementById('folderPath').classList.remove('placeholder');
    document.getElementById('folderBadge').textContent='✓';
    document.getElementById('folderBadge').className='folder-badge ok';
    document.getElementById('folderPickerRow').classList.add('selected');
    showToast(`📁 ${selectedDirHandle.name}`,'success');
  } catch(e) { if(e.name!=='AbortError') showToast('No se pudo acceder a la carpeta','error'); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Generador QR
// ═══════════════════════════════════════════════════════════════════════════════
const _qrDiv = document.createElement('div');
_qrDiv.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:256px;height:256px;';
document.body.appendChild(_qrDiv);

function makeQR(text, sizePx) {
  sizePx = sizePx || 256;
  try {
    _qrDiv.innerHTML = '';
    new QRCode(_qrDiv, {
      text: text,
      width: sizePx,
      height: sizePx,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
    const canvas = _qrDiv.querySelector('canvas');
    if (canvas) return canvas.toDataURL('image/png');
    const img = _qrDiv.querySelector('img');
    if (img && img.src) return img.src;
    return null;
  } catch(e) {
    console.error('QR generation failed:', e);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Validacion
// ═══════════════════════════════════════════════════════════════════════════════
function validate() {
  if (!document.getElementById('titulo').value.trim()) { showToast('El título es requerido','error'); return false; }
  if (!document.getElementById('fecha').value) { showToast('La fecha del sorteo es requerida','error'); return false; }
  if (!bgImageData) { showToast('Debe seleccionar una imagen de fondo','error'); return false; }
  const p=parseFloat(document.getElementById('precio').value);
  if (isNaN(p)||p<=0) { showToast('El precio debe ser mayor a 0','error'); return false; }
  const c=parseInt(document.getElementById('cantBoletas').value);
  if (isNaN(c)||c<1) { showToast('Cantidad mínima: 1','error'); return false; }
  const r=Math.ceil(c/15)*15;
  if (r!==c) { document.getElementById('cantBoletas').value=r; showToast(`Cantidad ajustada a ${r}`,'info'); }
  return true;
}

function buildPool(total, perB) {
  const needed=total*perB;
  if (needed>9999) { showToast('Demasiadas boletas para esa cantidad de números.','error'); return null; }
  const all=Array.from({length:9999},(_,i)=>i+1);
  for (let i=all.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [all[i],all[j]]=[all[j],all[i]]; }
  return all.slice(0,needed);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Generador de boletas
// ═══════════════════════════════════════════════════════════════════════════════
async function generarBoletas() {
  if (!validate()) return;
  const ov=document.getElementById('genOverlay'); ov.classList.add('active');
  document.getElementById('genText').textContent='Preparando datos...';
  await new Promise(r=>setTimeout(r,50));

  const titulo    = document.getElementById('titulo').value.trim();
  const tituloBold= document.getElementById('tituloBold').checked;
  const fecha     = document.getElementById('fecha').value;
  const expir     = document.getElementById('expiracion').value;
  const waNumer   = document.getElementById('whatsapp').value.trim();
  const whatsapp  = waNumer ? `Whatsapp: ${waNumer}` : '';
  const msg1      = document.getElementById('msg1').value.trim();
  const msg2      = document.getElementById('msg2').value.trim();
  const cT        = document.getElementById('cTitulo').value;
  const cN        = document.getElementById('cNumeros').value;
  const cL        = document.getElementById('cLineas').value;
  const precio    = parseFloat(document.getElementById('precio').value).toFixed(2);
  const cant      = parseInt(document.getElementById('cantBoletas').value);
  const numCount  = parseInt(document.getElementById('numCount').value);
  const font      = selectedFont;

  const fechaFmt = fmtDate(fecha);
  const expirFmt = fmtDate(expir);

  boletasData=[]; generatedNumbers=[];
  const pool = buildPool(cant, numCount);
  if (!pool) { ov.classList.remove('active'); return; }

  for (let i=0;i<cant;i++) {
    const nums = pool.slice(i*numCount, i*numCount+numCount);
    generatedNumbers.push(nums);
    boletasData.push({ titulo, tituloBold, font, fontCSS: selectedFontCSS,
      fecha:fechaFmt, expir:expirFmt, whatsapp, waNumer,
      msg1, msg2, cT, cN, cL, precio, nums, id:String(i+1).padStart(4,'0') });
  }

  renderPreview(boletasData);
  document.getElementById('genText').textContent='Generando PDF...';
  await new Promise(r=>setTimeout(r,50));
  await generatePDF(boletasData);
  ov.classList.remove('active');
  document.getElementById('btnGanador').disabled=false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Vista previa
// ═══════════════════════════════════════════════════════════════════════════════
function renderPreview(boletas) {
  document.getElementById('emptyState').style.display='none';
  const grid=document.getElementById('boletasGrid');
  grid.style.display='grid'; grid.innerHTML='';

  boletas.slice(0,15).forEach(b => {
    const el=document.createElement('div');
    el.className='boleta-preview';

    const numRowsHTML=[];
    for (let i=0;i<b.nums.length;i+=2) {
      const pair=b.nums.slice(i,i+2);
      numRowsHTML.push(`<div class="bp-numrow">${pair.map(n=>`<div class="bp-num" style="color:${b.cN};border-color:${b.cN}">${String(n).padStart(2,'0')}</div>`).join('')}</div>`);
    }
    const mainMsgs=[
      {text:b.msg1},
      {text:b.msg2}
    ].filter(m=>m.text);
    const hasAnyMsg = mainMsgs.length > 0 || b.whatsapp;
    const titleStyle = `font-family:'${b.fontCSS||selectedFontCSS}',sans-serif;font-weight:${b.tituloBold?'bold':'normal'};`;

    el.innerHTML=`
      ${bgImageData?`<div class="bp-bg" style="background-image:url(${bgImageData})"></div><div class="bp-overlay"></div>`:''}
      <div class="bp-wrap" style="color:${b.cT}">
        <div class="bp-hdr" style="border-color:${b.cL}">
          <div class="bp-title" style="${titleStyle}">${b.titulo}</div>
          <div class="bp-hdr-right">
            <div class="bp-id">#${b.id}</div>
            <div class="bp-fecha-hdr">${b.fecha}</div>
          </div>
        </div>
        <div class="bp-body">
          <div class="bp-nums">${numRowsHTML.join('')}</div>
          <div class="bp-right" style="border-color:${b.cL}">
            <div class="bp-qr">▦</div>
          </div>
        </div>
        ${hasAnyMsg ? `
        <div class="bp-msgs-wrap" style="border-color:${b.cL}">
          ${mainMsgs.length ? `
          <div class="bp-msgs">
            ${mainMsgs.map(m=>`<div>${m.text}</div>`).join('')}
          </div>` : ''}
          ${b.whatsapp ? `<div class="bp-wa" style="color:${b.cT}">${b.whatsapp}</div>` : ''}
        </div>` : ''}
        <div class="bp-footer" style="border-color:${b.cL}">
          <div class="bp-legal">La Boleta se anulará si presenta borrones o enmendaduras. Se paga al portador.</div>
          <div class="bp-precio-footer" style="color:${b.cN}">$${b.precio}</div>
        </div>
      </div>`;
    grid.appendChild(el);
  });

  document.getElementById('statsRow').style.display='flex';
  document.getElementById('statBoletas').textContent=boletas.length;
  document.getElementById('statPaginas').textContent=boletas.length/15;
  document.getElementById('statNums').textContent=document.getElementById('numCount').value;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Renderizador de texto en canvas
// ═══════════════════════════════════════════════════════════════════════════════
const _textCanvas = document.createElement('canvas');
const _textCtx = _textCanvas.getContext('2d');

function renderTextToPNG(text, fontCSS, ptSize, weight, color, align, maxWidthPx) {
  const SCALE = 4;
  const PX_PER_PT = 96 / 72;
  const pxSize = ptSize * PX_PER_PT * SCALE;
  const fontStr = `${weight} ${pxSize}px '${fontCSS}',sans-serif`;

  _textCtx.font = fontStr;
  const metrics = _textCtx.measureText(text);
  const textW = Math.min(metrics.width, (maxWidthPx || 99999) * SCALE);

  // Usar el ascenso y descenso reales del glifo para una altura ajustada
  const ascent  = metrics.actualBoundingBoxAscent  || pxSize * 0.75;
  const descent = metrics.actualBoundingBoxDescent || pxSize * 0.25;
  const textH   = ascent + descent;

  const PAD = 2; // Padding minimo para los glifos
  _textCanvas.width  = Math.ceil(textW) + PAD * 2;
  _textCanvas.height = Math.ceil(textH) + PAD * 2;

  _textCtx.clearRect(0, 0, _textCanvas.width, _textCanvas.height);
  _textCtx.font = fontStr;
  _textCtx.fillStyle = color;
  _textCtx.textBaseline = 'alphabetic';
  _textCtx.textAlign = 'left';

  if (maxWidthPx) {
    _textCtx.save();
    _textCtx.beginPath();
    _textCtx.rect(0, 0, _textCanvas.width, _textCanvas.height);
    _textCtx.clip();
  }
  // Dibuja a PAD desde la izquierda + PAD desde arriba para que los descendentes no se recorten
  _textCtx.fillText(text, PAD, ascent + PAD);
  if (maxWidthPx) _textCtx.restore();

  const dataUrl = _textCanvas.toDataURL('image/png');
  const PX_TO_MM = 25.4 / (96 * SCALE);
  return {
    dataUrl,
    widthMM:  (_textCanvas.width  - PAD * 2) * PX_TO_MM,
    heightMM: (_textCanvas.height - PAD * 2) * PX_TO_MM
  };
}

function pdfText(pdf, text, fontCSS, ptSize, weight, color, xMM, yMM, opts) {
  if (!text) return;
  opts = opts || {};
  const align = opts.align || 'left';
  const maxWidthMM = opts.maxWidthMM || null;
  const maxWidthPx = maxWidthMM ? maxWidthMM * (96/25.4) : null;

  const { dataUrl, widthMM, heightMM } = renderTextToPNG(text, fontCSS, ptSize, weight, color, align, maxWidthPx);

  let drawX = xMM;
  if (align === 'center') drawX = xMM - widthMM / 2;
  else if (align === 'right') drawX = xMM - widthMM;

  // yMM se considera la coordenada superior del bloque de texto
  pdf.addImage(dataUrl, 'PNG', drawX, yMM, widthMM, heightMM, undefined, 'FAST');
  return widthMM;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Generacion del PDF
// ═══════════════════════════════════════════════════════════════════════════════
async function generatePDF(boletas) {
  const {jsPDF}=window.jspdf;
  const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:[210,290]});
  const pageW=210,pageH=290,cols=3,rows=5;
  const padX=3.5,padY=3.5,gapX=2,gapY=2;
  const bW=(pageW-padX*2-gapX*(cols-1))/cols;
  const bH=(pageH-padY*2-gapY*(rows-1))/rows;

  const pages=[];
  for (let i=0;i<boletas.length;i+=15) pages.push(boletas.slice(i,i+15));

  for (let pi=0;pi<pages.length;pi++) {
    if (pi>0) pdf.addPage();
    const page=pages[pi];
    if (bgImageData) {
      pdf.addImage(bgImageData,'JPEG',0,0,pageW,pageH,undefined,'FAST');
    } else { pdf.setFillColor(15,15,22); pdf.rect(0,0,pageW,pageH,'F'); }

    pdf.setDrawColor(180,180,180); pdf.setLineWidth(.15);
    for (let r=1;r<rows;r++) { const cy=padY+r*(bH+gapY)-gapY/2; pdf.setLineDash([1,1],0); pdf.line(padX,cy,pageW-padX,cy); }
    for (let c=1;c<cols;c++) { const cx=padX+c*(bW+gapX)-gapX/2; pdf.setLineDash([1,1],0); pdf.line(cx,padY,cx,pageH-padY); }
    pdf.setLineDash([],0);

    for (let bi=0;bi<page.length;bi++) {
      const b=page[bi],col=bi%cols,row=Math.floor(bi/cols);
      drawBoleta(pdf,b,padX+col*(bW+gapX),padY+row*(bH+gapY),bW,bH);
    }
  }

  const dt=getDateTimeStr();
  const base=(document.getElementById('titulo').value.trim()||'boletas')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_\- ]/g,'').trim().replace(/\s+/g,'_');
  await savePDF(pdf,`${base}_${dt}.pdf`);
}

async function savePDF(pdf, fileName) {
  if (fsaSupported && selectedDirHandle) {
    try {
      const fh=await selectedDirHandle.getFileHandle(fileName,{create:true});
      const wr=await fh.createWritable();
      await wr.write(pdf.output('blob')); await wr.close();
      showToast(`✓ Guardado: ${fileName}`,'success'); return;
    } catch(e) { showToast('No se pudo guardar en carpeta, descargando...','error'); }
  }
  pdf.save(fileName);
  showToast(`✓ Descargado: ${fileName}`,'success');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Dibujar una sola boleta
// ═══════════════════════════════════════════════════════════════════════════════
function drawBoleta(pdf, b, x, y, w, h) {
  const CT = b.cT;
  const CN = b.cN;
  const CL_rgb = hexToRgb(b.cL);

  // Fondo
  if (bgImageData) {
    pdf.addImage(bgImageData,'JPEG',x,y,w,h,undefined,'FAST');
  } else { pdf.setFillColor(22,22,34); pdf.rect(x,y,w,h,'F'); }

  pdf.setDrawColor(CL_rgb.r,CL_rgb.g,CL_rgb.b); pdf.setLineWidth(.38);
  pdf.rect(x,y,w,h,'S');

  // Alturas de zona
  const hdrH   = 9;
  const legalH = 5.5;
  const mainMsgs = [b.msg1, b.msg2].filter(Boolean);
  const hasWa = !!b.whatsapp;
  const msgLineH  = 3.8;
  const msgPadTop = 2.0;
  const msgPadBot = 1.5;
  const waH = hasWa ? msgLineH : 0;
  const msgH = (mainMsgs.length > 0 || hasWa)
    ? msgPadTop + mainMsgs.length * msgLineH + waH + msgPadBot : 0;

  const midH   = h - hdrH - msgH - legalH;
  const midY   = y + hdrH;
  const msgY   = midY + midH +1.5;
  const legalY = msgY + msgH -1;

  // Font config
  const fCSS  = b.fontCSS || selectedFontCSS || 'Arial';  const fBold = b.tituloBold ? 'bold' : 'normal';

  // HEADER
  const hdrRightX = x + w - 1.5;

  // Título: reducir tamaño desde PDF_TITLE_PT si es demasiado ancho
  const titleMaxW = w - 33;
  const titleCenterX = x + (w - 30) / 2;
  let tSz = PDF_TITLE_PT;
  for (let attempt = 0; attempt < 20 && tSz > 6; attempt++) {
    const { widthMM } = renderTextToPNG(b.titulo.toUpperCase(), fCSS, tSz, fBold, CT, 'left', null);
    if (widthMM <= titleMaxW) break;
    tSz = Math.max(6, tSz - 0.5);
  }

  // Todos los valores yMM ahora se colocan en la parte superior del texto
  const PT_TO_MM = 25.4 / 72;

  pdfText(pdf, `#${b.id}`, fCSS, 5, 'normal', CT, hdrRightX, y + 1.2, {align:'right'});
  pdfText(pdf, b.fecha, fCSS, 4.5, 'normal', CT, hdrRightX, y + 4.2, {align:'right', maxWidthMM: 28});

  // Título centrado verticalmente en el header, yMM = arriba del texto
  const { heightMM: titleH } = renderTextToPNG(b.titulo.toUpperCase(), fCSS, tSz, fBold, CT, 'left', null);
  const titleY = y + (hdrH - titleH) / 2;
  pdfText(pdf, b.titulo.toUpperCase(), fCSS, tSz, fBold, CT, titleCenterX, titleY, {align:'center', maxWidthMM: titleMaxW});

  pdf.setDrawColor(CL_rgb.r,CL_rgb.g,CL_rgb.b); pdf.setLineWidth(.22);
  pdf.line(x, y+hdrH, x+w, y+hdrH);

  // Columna QR
  const qrColW = 28;
  const qrColX = x + w - qrColW;

  pdf.setFillColor(255,255,255); pdf.setGState(new pdf.GState({opacity:1}));
  pdf.rect(qrColX, midY, qrColW, midH + 1, 'F');
  pdf.setDrawColor(CL_rgb.r,CL_rgb.g,CL_rgb.b); pdf.setLineWidth(.2);
  pdf.line(qrColX, midY, qrColX, midY+midH);

  const qrPad = 0.40;
  const maxQRW = qrColW - qrPad * 2;
  const maxQRH = midH  - qrPad * 2;
  const qrSize = Math.min(maxQRW, maxQRH);
  const qrX    = qrColX + (qrColW - qrSize) / 2;
  const qrY    = midY   + (midH   - qrSize) / 2+0.5;

  const qrContent = `Numero:${b.nums.join(',')}-Fecha:${b.fecha}-Whatsapp:${b.waNumer||''}`;
  const qrURL = makeQR(qrContent, 2048);
  if (qrURL) {
    pdf.addImage(qrURL, 'PNG', qrX, qrY, qrSize, qrSize);
  } else {
    pdf.setFillColor(230,230,230); pdf.rect(qrX, qrY, qrSize, qrSize, 'F');
    pdfText(pdf, 'QR', fCSS, 6, 'normal', '#808080', qrX+qrSize/2, qrY+qrSize/2, {align:'center'});
  }

  // ── NÚMEROS — tamaño FIJO (PDF_NUM_PT), centrado perfecto dentro de la caja ─
  const numZoneW  = qrColX - x;
  const numsPerRow = 2;
  const rowCount   = Math.ceil(b.nums.length / numsPerRow);
  const cellGap    = 2.5;  // gap entre celdas en mm

  // Padding interno fijo: 5px top/bottom, 10px left/right → mm (96dpi)
  const PX_TO_MM_CELL = 25.4 / 96;
  const cellPadX = 10 * PX_TO_MM_CELL;  // ~2.65 mm cada lado
  const cellPadY =  5 * PX_TO_MM_CELL;  // ~1.32 mm arriba y abajo

  // Renderizar "00" para obtener dimensiones reales del PNG
  const numSample = renderTextToPNG('00', fCSS, PDF_NUM_PT, 'bold', b.cN, 'left', null);
  const numImgW = numSample.widthMM;
  const numImgH = numSample.heightMM;

  // Tamaño de caja = imagen real + padding
  const cellW = numImgW + cellPadX * 2;
  const cellH = numImgH + cellPadY * 2;

  // Centrar el grid en la zona de números
  const outerPadX = 2;
  const outerPadY = 2;
  const availW = numZoneW - outerPadX * 2;
  const availH = midH - outerPadY * 2;
  const totalGridW = numsPerRow * cellW + (numsPerRow - 1) * cellGap;
  const totalGridH = rowCount * cellH + (rowCount - 1) * cellGap;
  const gridStartX = x + outerPadX + (availW - totalGridW) / 2;
  const gridStartY = midY + outerPadY + (availH - totalGridH) / 2;

  for (let ni = 0; ni < b.nums.length; ni++) {
    const nc = ni % numsPerRow;
    const nr = Math.floor(ni / numsPerRow);
    const bx = gridStartX + nc * (cellW + cellGap);
    const by = gridStartY + nr * (cellH + cellGap);

    // Fondo semitransparente
    pdf.setFillColor(255,255,255); pdf.setGState(new pdf.GState({opacity:.42}));
    pdf.roundedRect(bx, by, cellW, cellH, 1.2, 1.2, 'F');
    pdf.setGState(new pdf.GState({opacity:1}));
    // Borde
    pdf.setDrawColor(CL_rgb.r, CL_rgb.g, CL_rgb.b); pdf.setLineWidth(.24);
    pdf.roundedRect(bx, by, cellW, cellH, 1.2, 1.2, 'S');

    // Renderizar el número real y obtener sus dimensiones exactas
    const numStr = String(b.nums[ni]).padStart(2,'0');
    const { dataUrl, widthMM, heightMM } = renderTextToPNG(numStr, fCSS, PDF_NUM_PT, 'bold', b.cN, 'left', null);

    // Centrado perfecto: imagen colocada en el centro exacto de la caja
    const imgX = bx + (cellW - widthMM) / 2;
    const imgY = by + (cellH - heightMM) / 2;
    pdf.addImage(dataUrl, 'PNG', imgX, imgY, widthMM, heightMM, undefined, 'FAST');
  }

  // MENSAJES — tamaños FIJOS
  if (mainMsgs.length > 0 || hasWa) {
    pdf.setDrawColor(CL_rgb.r,CL_rgb.g,CL_rgb.b); pdf.setLineWidth(.16);
    pdf.line(x, msgY, x+w, msgY);

    const msgPadX = 2;
    const maxMsgW = w - msgPadX*2;

    // Tamaños FIJOS: msg1=10pt, msg2=7pt — yMM ahora esta en el tope del texto
    const fixedMsgSizes = [PDF_MSG1_PT, PDF_MSG2_PT];
    // Calcular la altura total de las líneas del mensaje para centrar el bloque verticalmente
    const msgHeights = mainMsgs.map((msg, idx) =>
      renderTextToPNG(msg, fCSS, fixedMsgSizes[idx] || PDF_MSG2_PT, 'normal', CT, 'left', null).heightMM
    );
    const totalMsgBlockH = msgHeights.reduce((a, h) => a + h, 0) + (mainMsgs.length - 1) * 1.0;
    const mainZoneH = msgH - msgPadBot - waH - msgPadTop;
    let curY = msgY + msgPadTop + Math.max(0, (mainZoneH - totalMsgBlockH) / 2);

    mainMsgs.forEach((msg, idx) => {
      pdfText(pdf, msg, fCSS, fixedMsgSizes[idx] || PDF_MSG2_PT, 'bold', CT,
        x + w/2, curY, {align:'center', maxWidthMM: maxMsgW});
      curY += msgHeights[idx] + 1.0;
    });

    if (hasWa) {
      const { heightMM: waTextH } = renderTextToPNG(b.whatsapp, fCSS, 7, 'normal', CT, 'left', null);
      const waY = msgY + msgH - msgPadBot - waTextH;
      pdfText(pdf, b.whatsapp, fCSS, 7, 'Normal', CT,
        x + w - msgPadX, waY, {align:'right', maxWidthMM: maxMsgW});
    }
  }

  // LEGAL + PRECIO
  pdf.setDrawColor(CL_rgb.r,CL_rgb.g,CL_rgb.b); pdf.setLineWidth(.12);
  pdf.line(x, legalY, x+w, legalY);

  const precioStr = `$${b.precio} USD`;
  const { heightMM: precioH } = renderTextToPNG(precioStr, fCSS, 5, 'bold', b.cN, 'left', null);
  const precioY = legalY + (legalH - precioH) / 2;
  pdfText(pdf, precioStr, fCSS, 5, 'bold', b.cN, x+w-1.5, precioY, {align:'right'});

  const precioWMM = renderTextToPNG(precioStr, fCSS, 5, 'bold', b.cN, 'left', null).widthMM + 3;
  const legalMaxW = w - 4 - precioWMM;
  const legal = 'La Boleta se anulará si presenta tachones, borrones o enmendaduras. Se paga al portador.';

  const legalWords = legal.split(' ');
  const legalLines = [];
  let line = '';
  legalWords.forEach(word => {
    const test = line ? line+' '+word : word;
    const { widthMM } = renderTextToPNG(test, fCSS, 5, 'normal', CT, 'left', null);
    if (widthMM > legalMaxW && line) { legalLines.push(line); line = word; }
    else line = test;
  });
  if (line) legalLines.push(line);

  const lLineH = renderTextToPNG('A', fCSS, 5, 'normal', CT, 'left', null).heightMM + 0.6;
  const totalLH = legalLines.length * lLineH;
  let lY = legalY + (legalH - totalLH) / 2;
  legalLines.forEach(l => {
    pdfText(pdf, l, fCSS, 5, 'normal', CT, x+2, lY, {align:'left'});
    lY += lLineH;
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// GANADORES
// ═══════════════════════════════════════════════════════════════════════════════
function seleccionarGanador() {
  if (!generatedNumbers.length) { showToast('Primero genera las boletas','error'); return; }
  const total=generatedNumbers.length;
  const idx=Array.from({length:total},(_,i)=>i);
  for(let i=idx.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[idx[i],idx[j]]=[idx[j],idx[i]];}
  const places=[{label:'1er Puesto',cls:'gold',emoji:'🥇'},{label:'2do Puesto',cls:'silver',emoji:'🥈'},{label:'3er Puesto',cls:'bronze',emoji:'🥉'}];
  lastWinners=idx.slice(0,Math.min(3,total)).map((wi,i)=>({wi,nums:generatedNumbers[wi],id:String(wi+1).padStart(4,'0'),place:places[i]}));
  document.getElementById('winnerCards').innerHTML=lastWinners.map(w=>`
    <div class="winner-card ${w.place.cls}">
      <div class="winner-info">
        <div class="winner-boleta-id">Boleta #${w.id} — ${w.place.label}</div>
        <div class="winner-nums">${w.nums.map(n=>String(n).padStart(2,'0')).join(' · ')}</div>
      </div>
    </div>`).join('');
  document.getElementById('winnerModal').classList.add('active');
}

async function descargarGanadoresPDF() {
  if (!lastWinners.length) return;
  const {jsPDF}=window.jspdf;
  const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const W=210,H=297;
  const PAD=14;

  pdf.setFillColor(10,10,15);
  pdf.rect(0,0,W,H,'F');

  const titulo=document.getElementById('titulo').value.trim()||'RIFA';
  const fechaSorteo=fmtDate(document.getElementById('fecha').value);
  const waNumer=document.getElementById('whatsapp').value.trim();
  const ahora=new Date();
  const generadoStr=ahora.toLocaleDateString('es-CO',{year:'numeric',month:'long',day:'numeric'})
    +' '+ahora.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'});

  pdf.setDrawColor(240,192,64); pdf.setLineWidth(1.2);
  pdf.line(PAD,12,W-PAD,12);

  pdf.setFont('helvetica','bold'); pdf.setFontSize(28);
  pdf.setTextColor(240,192,64);
  pdf.text('GANADORES DEL SORTEO', W/2, 24, {align:'center'});

  pdf.setFont('helvetica','normal'); pdf.setFontSize(12);
  pdf.setTextColor(200,200,220);
  pdf.text(titulo.toUpperCase(), W/2, 33, {align:'center'});

  pdf.setFontSize(8); pdf.setTextColor(110,110,130);
  pdf.text(`Sorteo: ${fechaSorteo}   ·   Generado: ${generadoStr}`, W/2, 40, {align:'center'});

  pdf.setDrawColor(240,192,64); pdf.setLineWidth(0.4);
  pdf.line(PAD,45,W-PAD,45);

  const cc=[
    {r:240,g:192,b:64,  name:'1er Puesto', medal:'01'},
    {r:168,g:168,b:184, name:'2do Puesto', medal:'02'},
    {r:205,g:127,b:50,  name:'3er Puesto', medal:'03'}
  ];
  const cardH   = 64;
  const cardGap = 6;
  const cardY0  = 50;
  const cardW   = W - PAD*2;

  const qrSize  = 48;
  const qrPad   = 3;
  const boxSize = qrSize + qrPad*2;
  const boxX    = PAD + cardW - boxSize - 4;
  const textAreaW = boxX - PAD - 8;

  lastWinners.forEach((w,i) => {
    const cy = cardY0 + i*(cardH+cardGap);
    const c  = cc[i];

    pdf.setFillColor(18,18,28);
    pdf.roundedRect(PAD, cy, cardW, cardH, 3, 3, 'F');
    pdf.setDrawColor(c.r,c.g,c.b);
    pdf.setLineWidth(0.7);
    pdf.roundedRect(PAD, cy, cardW, cardH, 3, 3, 'S');

    pdf.setFillColor(c.r,c.g,c.b);
    pdf.roundedRect(PAD, cy, 4, cardH, 2, 2, 'F');

    const tx = PAD + 10;

    pdf.setFont('helvetica','bold'); pdf.setFontSize(20);
    pdf.setTextColor(c.r,c.g,c.b);
    pdf.text(c.name.toUpperCase(), tx, cy+16);

    pdf.setFont('helvetica','normal'); pdf.setFontSize(8);
    pdf.setTextColor(130,130,150);
    pdf.text(`Boleta #${w.id}`, tx, cy+25);

    pdf.setDrawColor(c.r,c.g,c.b); pdf.setLineWidth(0.2);
    pdf.setLineDash([1,1],0);
    pdf.line(tx, cy+29, tx+textAreaW-4, cy+29);
    pdf.setLineDash([],0);

    pdf.setFont('helvetica','normal'); pdf.setFontSize(7);
    pdf.setTextColor(110,110,130);
    pdf.text('Números ganadores:', tx, cy+36);

    pdf.setFont('helvetica','bold'); pdf.setFontSize(16);
    pdf.setTextColor(c.r,c.g,c.b);
    const numsStr = w.nums.map(n=>String(n).padStart(2,'0')).join('  ·  ');
    pdf.text(numsStr, tx, cy+48);

    if (waNumer) {
      pdf.setFont('helvetica','normal'); pdf.setFontSize(7.5);
      pdf.setTextColor(130,130,150);
      pdf.text(`WhatsApp: ${waNumer}`, tx, cy+57);
    }

    const boxY = cy + (cardH - boxSize) / 2;

    pdf.setFillColor(255,255,255);
    pdf.setGState(new pdf.GState({opacity:1}));
    pdf.roundedRect(boxX, boxY, boxSize, boxSize, 2, 2, 'F');

    pdf.setDrawColor(c.r,c.g,c.b); pdf.setLineWidth(0.5);
    pdf.roundedRect(boxX, boxY, boxSize, boxSize, 2, 2, 'S');

    const qrContent = [
      w.place.label,
      `Boleta:#${w.id}`,
      `Nums:${w.nums.join(',')}`,
      `Sorteo:${fechaSorteo}`,
      waNumer ? `WA:${waNumer}` : ''
    ].filter(Boolean).join('|');

    const qrUrl = makeQR(qrContent, 512);

    if (qrUrl) {
      pdf.addImage(qrUrl, 'PNG', boxX+qrPad, boxY+qrPad, qrSize, qrSize);
    } else {
      pdf.setFont('helvetica','bold'); pdf.setFontSize(7);
      pdf.setTextColor(80,80,80);
      pdf.text('QR no disponible', boxX+boxSize/2, boxY+boxSize/2, {align:'center'});
    }
  });

  const footerY = H - 14;
  pdf.setDrawColor(60,60,80); pdf.setLineWidth(0.3);
  pdf.line(PAD, footerY-4, W-PAD, footerY-4);
  pdf.setFont('helvetica','italic'); pdf.setFontSize(7);
  pdf.setTextColor(70,70,90);
  pdf.text('Documento generado automáticamente — Escanea el QR de cada tarjeta para verificar los datos del ganador.', W/2, footerY, {align:'center'});

  await savePDF(pdf, `Ganadores_${getDateTimeStr()}.pdf`);
}

function closeModal(){document.getElementById('winnerModal').classList.remove('active');}
document.getElementById('winnerModal').addEventListener('click',e=>{if(e.target===document.getElementById('winnerModal'))closeModal();});

// Init
wireInputs();
updateLivePreview();
