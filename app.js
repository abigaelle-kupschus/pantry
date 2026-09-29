const LOC=["Placard","Frigo","Congélo","Garage"],KEY="garde-manger-v1";
let items=[],flt="Tout",eid=null;
try{items=JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){items=[]}
const $=id=>document.getElementById(id);
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(items))}catch(e){}};
const days=d=>d?Math.ceil((new Date(d+"T00:00:00")-new Date().setHours(0,0,0,0))/864e5):null;
const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
$("fl").innerHTML=LOC.map(l=>`<option>${l}</option>`).join("");
function render(){
  const q=$("q").value.trim().toLowerCase();
  const soon=i=>{const n=days(i.d);return n!==null&&n<=7};
  $("chips").innerHTML=["Tout",...LOC,"Bientôt périmé"].map(c=>`<button class="chip" aria-pressed="${c===flt}" data-c="${c}">${c}</button>`).join("");
  let v=items.filter(i=>i.n.toLowerCase().includes(q)&&(flt==="Tout"||(flt==="Bientôt périmé"?soon(i):i.l===flt)));
  $("sub").textContent=items.length?`${items.length} produit${items.length>1?"s":""} en stock`:"Ajoute ton premier produit";
  if(!v.length){$("list").innerHTML=`<div class="empty">${items.length?"Aucun produit ne correspond.":"Ton garde-manger est vide.<br>Appuie sur « Ajouter » pour commencer."}</div>`;return}
  const g={};v.sort((a,b)=>a.n.localeCompare(b.n,"fr")).forEach(i=>(g[i.l]=g[i.l]||[]).push(i));
  $("list").innerHTML=LOC.filter(l=>g[l]).map(l=>`${flt==="Tout"||flt==="Bientôt périmé"?`<div class="grp">${l}</div>`:""}`+g[l].map(i=>{
    const n=days(i.d);let t="";
    if(n!==null)t=n<0?`<span class="tag b">périmé</span>`:n<=3?`<span class="tag w">${n===0?"aujourd'hui":n+" j"}</span>`:"";
    return `<div class="row"><button class="info" data-e="${i.id}"><div class="nm">${esc(i.n)}${t}</div><div class="meta">${i.d?"avant le "+new Date(i.d).toLocaleDateString("fr-FR"):"sans date"}</div></button><div class="qty"><button data-m="${i.id}" aria-label="Moins">−</button><span>${i.q}</span><button data-p="${i.id}" aria-label="Plus">+</button></div></div>`}).join("")).join("");
}
function open_(id){
  eid=id;const i=items.find(x=>x.id===id);
  $("dt").textContent=i?"Modifier":"Nouveau produit";
  $("fn").value=i?i.n:"";$("fq").value=i?i.q:1;$("fl").value=i?i.l:(LOC.includes(flt)?flt:"Placard");$("fd").value=i?i.d||"":"";
  $("fdel").hidden=!i;$("dlg").showModal();if(!i)$("fn").focus();
}
$("add").onclick=()=>open_(null);
$("fno").onclick=()=>$("dlg").close();
$("fdel").onclick=()=>{items=items.filter(x=>x.id!==eid);save();render();$("dlg").close()};
$("fok").onclick=()=>{
  const n=$("fn").value.trim();if(!n){$("fn").focus();return}
  const o={n,q:Math.max(1,+$("fq").value||1),l:$("fl").value,d:$("fd").value};
  if(eid)Object.assign(items.find(x=>x.id===eid),o);else items.push({id:Date.now()+""+Math.random().toString(36).slice(2,6),...o});
  save();render();$("dlg").close();
};
$("fn").addEventListener("keydown",e=>{if(e.key==="Enter")$("fok").click()});
$("q").oninput=render;
document.addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;const d=b.dataset;
  if(d.c){flt=d.c;render()}
  else if(d.e)open_(d.e);
  else if(d.p){items.find(x=>x.id===d.p).q++;save();render()}
  else if(d.m){const i=items.find(x=>x.id===d.m);if(i.q>1)i.q--;else if(confirm("Retirer « "+i.n+" » du stock ?"))items=items.filter(x=>x!==i);save();render()}
});
$("exp").onclick=async()=>{const j=JSON.stringify(items);try{await navigator.clipboard.writeText(j);alert("Sauvegarde copiée. Colle-la dans une note pour la garder.")}catch(e){prompt("Copie ce texte et garde-le dans une note :",j)}};
$("imp").onclick=()=>{const t=prompt("Colle ta sauvegarde ici :");if(!t)return;try{const a=JSON.parse(t);if(Array.isArray(a)&&confirm("Remplacer le stock actuel ?")){items=a;save();render()}}catch(e){alert("Sauvegarde illisible.")}};
render();