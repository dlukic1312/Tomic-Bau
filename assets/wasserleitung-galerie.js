/* Add the water-utility project only after all five approved files exist. */
(async () => {
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
  const available=await Promise.all(urls.map(url=>new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(true);img.onerror=()=>resolve(false);img.src=url;})));
  if(!available.every(Boolean))return;
  const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt)e.textContent=txt;return e;};
  const card=el('article','project water-project');card.dataset.category='Tiefbau';
  const photo=(i,hero=false)=>{
    const button=el('button',hero?'open-photo':'water-thumb');button.type='button';button.setAttribute('aria-label',labels[4+i]);
    const img=el('img');img.src=urls[i];img.alt=labels[4+i];img.loading='lazy';button.append(img);
    button.addEventListener('click',()=>{const dlg=document.querySelector('#lightbox');document.querySelector('#large').src=urls[i];document.querySelector('#large').alt=labels[4+i];document.querySelector('#largecap').textContent=labels[4+i];dlg.showModal();});
    return button;
  };
  card.append(photo(1,true));
  const body=el('div','project-body');body.append(el('span','eyebrow',labels[0]),el('h3','',labels[1]),el('p','',labels[2]));
  body.append(el('h4','water-photo-heading',labels[3]));
  const thumbs=el('div','water-thumbs');[0,2,3,4].forEach(i=>thumbs.append(photo(i)));body.append(thumbs);card.append(body);
  const selected=document.querySelector('.filter[aria-pressed="true"]')?.dataset.filter||'Alle';
  card.hidden=selected!=='Alle'&&selected!=='Tiefbau';
  gallery.prepend(card);
})();
