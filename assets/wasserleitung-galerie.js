/* Compact responsive five-photo gallery. */
(() => {
  const gallery=document.querySelector('.projects');
  if(!gallery)return;
  const names=['01-leitungsgraben','02-baustellenuebersicht','03-rohrdetail','04-bagger','05-unterstuetzung'];
  const urls=names.map(n=>'assets/wasserleitung-'+n+'.webp');
  const lang=document.documentElement.lang;
  const labels={
    de:['Tiefbau','Tiefbauarbeiten für eine Wasserleitung','Erdarbeiten, Herstellung von Leitungsgräben und maschinelle Unterstützung bei der Verlegung einer Wasserleitung.','Weitere Aufnahmen','Leitungsgraben mit Wasserleitung','Baustellenübersicht mit CAT-Bagger','Detailaufnahme der Wasserleitung','Kompaktbagger auf der Baustelle','Maschinelle Unterstützung bei der Rohrverlegung'],
    en:['Civil works','Civil works for a water main','Excavation, preparation of utility trenches and machinery support during water pipe installation.','More photos','Trench with water pipe','Site overview with CAT excavator','Water pipe detail','Compact excavator on site','Machinery support during pipe installation'],
    fr:['Terrassement','Terrassement pour une conduite d’eau','Terrassement, réalisation de tranchées et assistance mécanique lors de la pose d’une conduite d’eau.','Autres photos','Tranchée avec conduite d’eau','Vue du chantier avec pelle CAT','Détail de la conduite d’eau','Mini-pelle sur le chantier','Assistance mécanique à la pose de la conduite'],
    hr:['Niskogradnja','Zemljani radovi za vodovod','Zemljani radovi, izrada rovova i strojna pomoć pri polaganju vodovodne cijevi.','Više fotografija','Rov s vodovodnom cijevi','Pregled gradilišta s CAT bagerom','Detalj vodovodne cijevi','Kompaktni bager na gradilištu','Strojna pomoć pri polaganju cijevi']
  }[lang]||['Tiefbau','Tiefbauarbeiten für eine Wasserleitung','Erdarbeiten, Herstellung von Leitungsgräben und maschinelle Unterstützung bei der Verlegung einer Wasserleitung.','Weitere Aufnahmen','Leitungsgraben mit Wasserleitung','Baustellenübersicht mit CAT-Bagger','Detailaufnahme der Wasserleitung','Kompaktbagger auf der Baustelle','Maschinelle Unterstützung bei der Rohrverlegung'];
  const ui=({de:['Alle 5 Bilder ansehen','Vorheriges Bild','Nächstes Bild','Schließen','Bild'],en:['View all 5 photos','Previous photo','Next photo','Close','Photo'],fr:['Voir les 5 photos','Photo précédente','Photo suivante','Fermer','Photo'],hr:['Pogledaj svih 5 fotografija','Prethodna fotografija','Sljedeća fotografija','Zatvori','Fotografija']})[lang]||['Alle 5 Bilder ansehen','Vorheriges Bild','Nächstes Bild','Schließen','Bild'];
  const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt)e.textContent=txt;return e;};
  const card=el('article','project water-project');card.dataset.category='Tiefbau';
  const order=[1,0,2,3,4];
  let index=0,trigger=null,touchX=null;
  const dlg=el('dialog','water-gallery');dlg.setAttribute('aria-label',labels[1]);
  const toolbar=el('div','water-toolbar');
  const close=el('button','water-close','×');close.type='button';close.setAttribute('aria-label',ui[3]);toolbar.append(el('strong','water-title',labels[1]),close);
  const stage=el('div','water-stage');const large=el('img','water-large');
  const prev=el('button','water-prev','‹');prev.type='button';prev.setAttribute('aria-label',ui[1]);
  const next=el('button','water-next','›');next.type='button';next.setAttribute('aria-label',ui[2]);stage.append(large,prev,next);
  const caption=el('p','water-caption');caption.setAttribute('aria-live','polite');
  const thumbs=el('div','water-strip');
  const buttons=order.map((n,i)=>{const b=el('button','water-thumb');b.type='button';b.setAttribute('aria-label',labels[4+n]);const img=el('img');img.alt='';img.dataset.src=urls[n];b.append(img);b.addEventListener('click',()=>show(i));thumbs.append(b);return b;});
  dlg.append(toolbar,stage,caption,thumbs);document.body.append(dlg);
  function show(i){index=(i+order.length)%order.length;const n=order[index];large.src=urls[n];large.alt=labels[4+n];caption.textContent=ui[4]+' '+(index+1)+' / '+order.length+' · '+labels[4+n];buttons.forEach((b,j)=>b.setAttribute('aria-current',String(j===index)));}
  function open(e){trigger=e.currentTarget;buttons.forEach(b=>{const img=b.firstElementChild;if(!img.src)img.src=img.dataset.src;});show(0);dlg.showModal();close.focus();}
  close.addEventListener('click',()=>dlg.close());prev.addEventListener('click',()=>show(index-1));next.addEventListener('click',()=>show(index+1));
  dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close();});dlg.addEventListener('close',()=>trigger?.focus());
  dlg.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(index+(e.key==='ArrowLeft'?-1:1));}});
  stage.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;},{passive:true});
  stage.addEventListener('touchend',e=>{if(touchX===null)return;const dx=e.changedTouches[0].clientX-touchX;touchX=null;if(Math.abs(dx)>55)show(index+(dx<0?1:-1));},{passive:true});
  const cover=el('button','open-photo water-cover');cover.type='button';cover.setAttribute('aria-label',ui[0]);const img=el('img');img.src=urls[1];img.alt=labels[5];img.loading='lazy';cover.append(img);cover.addEventListener('click',open);card.append(cover);
  const body=el('div','project-body');body.append(el('span','eyebrow',labels[0]),el('h3','',labels[1]),el('p','',labels[2]));
  const more=el('button','water-more',ui[0]+' ↗');more.type='button';more.addEventListener('click',open);body.append(more);card.append(body);
  const selected=document.querySelector('.filter[aria-pressed="true"]')?.dataset.filter||'Alle';card.hidden=selected!=='Alle'&&selected!=='Tiefbau';gallery.append(card);
})();
