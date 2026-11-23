// Wrap the rendered board in a single landscape Letter PDF page.
function visionPdf(jpeg, width, height) {
 const image = Uint8Array.from(atob(jpeg.split(',')[1]), char => char.charCodeAt(0));
 const encoder = new TextEncoder();
 const parts = [];
 const offsets = [0];
 let length = 0;
 function add(value) {
   const bytes = typeof value === 'string' ? encoder.encode(value) : value;
   parts.push(bytes);
   length += bytes.length;
 }
 function object(...chunks) {
   const id = offsets.length;
   offsets.push(length);
   add(`${id} 0 obj\n`);
   chunks.forEach(add);
   add('\nendobj\n');
 }
 add('%PDF-1.4\n');
 object('<< /Type /Catalog /Pages 2 0 R >>');
 object('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
 object('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 792 612] /Resources << /XObject << /Board 4 0 R >> >> /Contents 5 0 R >>');
 object(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`, image, '\nendstream');
 const draw = 'q 756 0 0 576 18 18 cm /Board Do Q\n';
 object(`<< /Length ${draw.length} >>\nstream\n${draw}endstream`);
 const xref = length;
 add(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
 for (const offset of offsets.slice(1)) add(`${String(offset).padStart(10, '0')} 00000 n \n`);
 add(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
 return new Blob(parts, {type: 'application/pdf'});
}

async function downloadVisionPdf(board) {
 const canvas = document.createElement('canvas');
 canvas.width = 1575;
 canvas.height = 1200;
 const ctx = canvas.getContext('2d');
 const sheet = getComputedStyle(document.getElementById('vision-sheet'));
 const accent = sheet.getPropertyValue('--vision-accent').trim();
 const paper = sheet.getPropertyValue('--vision-paper').trim();
 const title = board.title.trim() || 'Untitled board';
 const cards = board.cards.slice();
 ctx.fillStyle = paper;
 ctx.fillRect(0, 0, canvas.width, canvas.height);
 ctx.strokeStyle = accent;
 ctx.lineWidth = 5;
 ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
 ctx.fillStyle = accent;
 ctx.font = 'italic bold 60px Georgia, serif';
 ctx.fillText(title, 56, 91, 1463);

 const gap = 20;
 const width = (1463 - 2 * gap) / 3;
 const height = 330;
 await Promise.all(cards.map(async (card, index) => {
   const x = 56 + (index % 3) * (width + gap);
   const y = 135 + Math.floor(index / 3) * (height + gap);
   ctx.fillStyle = '#fff';
   ctx.fillRect(x, y, width, height);
   ctx.strokeStyle = accent;
   ctx.lineWidth = 2;
   ctx.strokeRect(x, y, width, height);
   if (card.kind === 'photo') {
     const photo = new Image();
     photo.src = card.value;
     await photo.decode();
     const scale = Math.min((width - 20) / photo.naturalWidth, (height - 20) / photo.naturalHeight);
     const w = photo.naturalWidth * scale;
     const h = photo.naturalHeight * scale;
     ctx.drawImage(photo, x + (width - w) / 2, y + (height - h) / 2, w, h);
     return;
   }
   ctx.fillStyle = '#211433';
   ctx.font = '29px Georgia, serif';
   const rows = [''];
   let row = 0;
   for (const word of card.value.split(/\s+/)) {
     const next = rows[row] ? rows[row] + ' ' + word : word;
     if (rows[row] && ctx.measureText(next).width > width - 42) {
       rows.push(word);
       row++;
     } else {
       rows[row] = next;
     }
   }
   if (rows.length > 8) rows.splice(7, Infinity, rows.slice(7).join(' '));
   const lineHeight = 36;
   rows.forEach((line, i) => ctx.fillText(line, x + 21, y + 45 + i * lineHeight, width - 42));
 }));
 const blob = visionPdf(canvas.toDataURL('image/jpeg', .94), canvas.width, canvas.height);
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.download = `${title.replace(/[^\p{L}\p{N} -]+/gu, '').trim() || 'vision-board'}.pdf`;
 link.click();
 setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
