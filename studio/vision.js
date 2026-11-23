(() => {
 const key = 'luminaryVisionBoards';
 const byId = id => document.getElementById(id);
 const picker = byId('vision-boards');
 const title = byId('vision-title');
 const palette = byId('vision-palette');
 const status = byId('vision-status');
 const sheet = byId('vision-sheet');
 const photos = byId('vision-image');
 const makeBoard = () => ({title: 'My next chapter', palette: 'violet', cards: []});
 let boards = [];
 try {
   const saved = JSON.parse(localStorage.getItem(key));
   if (Array.isArray(saved)) boards = saved.filter(board =>
     board && typeof board.title === 'string' && Array.isArray(board.cards));
 } catch {
   status.textContent = 'Saved vision boards could not be opened.';
 }
 if (!boards.length) boards.push(makeBoard());
 let current = 0;
 const board = () => boards[current];

 function save() {
   try {
     localStorage.setItem(key, JSON.stringify(boards));
     status.textContent = 'Saved on this device.';
   } catch {
     status.textContent = 'Browser storage is full or unavailable. Print this board to keep a copy.';
   }
 }

 function updateHeading() {
   const name = board().title.trim() || 'Untitled board';
   byId('vision-sheet-title').textContent = name;
   picker.options[current].textContent = name;
 }

 function render() {
   picker.replaceChildren(...boards.map((item, index) => new Option(item.title, index)));
   picker.value = current;
   title.value = board().title;
   palette.value = board().palette;
   sheet.dataset.palette = palette.value;
   updateHeading();
   const cards = board().cards;
   byId('vision-empty').hidden = cards.length > 0;
   byId('vision-print').disabled = !cards.length;
   byId('vision-download').disabled = !cards.length;
   byId('vision-cards').replaceChildren(...cards.map((card, index) => {
     const tile = document.createElement('div');
     tile.className = 'vision-tile';
     const content = document.createElement(card.kind === 'photo' ? 'img' : 'p');
     if (card.kind === 'photo') {
       if (/^data:image\/jpeg;base64,/.test(card.value)) content.src = card.value;
       content.alt = 'Vision board photo';
     } else {
       content.textContent = card.value;
     }
     const actions = document.createElement('div');
     actions.className = 'vision-card-actions';
     for (const [label, offset] of [['Earlier', -1], ['Later', 1], ['Remove', 0]]) {
       const button = document.createElement('button');
       button.type = 'button';
       button.textContent = label;
       button.setAttribute('aria-label', label === 'Remove' ? `Remove card ${index + 1}` : `Move card ${index + 1} ${label.toLowerCase()}`);
       const target = index + offset;
       button.disabled = target < 0 || target >= cards.length;
       button.onclick = () => {
         const [removed] = cards.splice(index, 1);
         if (offset) cards.splice(target, 0, removed);
         render();
         save();
         const tiles = byId('vision-cards').children;
         const next = tiles[Math.min(target, tiles.length - 1)];
         (next?.querySelector('button:not(:disabled)') || byId('vision-note')).focus();
       };
       actions.append(button);
     }
     tile.append(content, actions);
     return tile;
   }));
 }

 function addCard(target, card) {
   if (!boards.includes(target)) return;
   if (target.cards.length >= 9) {
     status.textContent = 'This board is full. Remove a card or start a new board.';
     return;
   }
   target.cards.push(card);
   if (target === board()) render();
   save();
 }

 picker.onchange = () => {
   current = Number(picker.value);
   render();
 };
 byId('vision-new').onclick = () => {
   boards.push(makeBoard());
   current = boards.length - 1;
   render();
   save();
   title.focus();
 };
 title.oninput = () => {
   board().title = title.value;
   updateHeading();
   save();
 };
 palette.onchange = () => {
   sheet.dataset.palette = board().palette = palette.value;
   save();
 };
 byId('vision-note-form').onsubmit = event => {
   event.preventDefault();
   const input = byId('vision-note');
   const value = input.value.trim();
   if (!value) return;
   const count = board().cards.length;
   addCard(board(), {kind: 'note', value});
   if (board().cards.length > count) input.value = '';
 };
 photos.onchange = async () => {
   const file = photos.files[0];
   photos.value = '';
   if (!file) return;
   const target = board();
   const url = URL.createObjectURL(file);
   try {
     const image = new Image();
     image.src = url;
     await image.decode();
     const scale = Math.min(1, 720 / Math.max(image.naturalWidth, image.naturalHeight));
     const canvas = document.createElement('canvas');
     canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
     canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
     const ctx = canvas.getContext('2d');
     ctx.fillStyle = 'white';
     ctx.fillRect(0, 0, canvas.width, canvas.height);
     ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
     addCard(target, {kind: 'photo', value: canvas.toDataURL('image/jpeg', .79)});
   } catch {
     status.textContent = 'This photo could not be opened. Try a JPEG or PNG.';
   } finally {
     URL.revokeObjectURL(url);
   }
 };
 byId('vision-delete').onclick = () => {
   if (!window.confirm('Delete this vision board and its cards?')) return;
   boards.splice(current, 1);
   if (!boards.length) boards.push(makeBoard());
   current = Math.min(current, boards.length - 1);
   render();
   save();
 };
 byId('vision-print').onclick = () => window.print();
 byId('vision-download').onclick = async () => {
   const button = byId('vision-download');
   button.disabled = true;
   try {
     await downloadVisionPdf(board());
     status.textContent = 'Your PDF is ready.';
   } catch {
     status.textContent = 'The PDF could not be created. Try the print button.';
   } finally {
     button.disabled = !board().cards.length;
   }
 };
 render();
})();
