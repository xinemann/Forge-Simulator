const RAR=[{n:"Comum",c:"#9e9e9e",w:60},{n:"Incomum",c:"#4caf50",w:25},{n:"Raro",c:"#2196f3",w:10},{n:"Épico",c:"#9c27b0",w:4},{n:"Lendário",c:"#ffb300",w:1}];
const SW=[
 {n:"Espada de Cobre",r:0,d:12,u:5,c:["#ff9a3c","#b4510f","#6b2a05"]},
 {n:"Espada de Ferro",r:1,d:20,u:9,c:["#e4e4e4","#8d9199","#4a3b2a"]},
 {n:"Espada de Aço",r:1,d:28,u:12,c:["#d3e6f7","#7f9bb5","#33404d"]},
 {n:"Espada de Prata",r:2,d:40,u:16,c:["#ffffff","#b9c4d0","#2f5f9e"]},
 {n:"Espada de Diamante",r:2,d:55,u:20,c:["#c8fbff","#4fc3d9","#1b5f77"]},
 {n:"Espada Obsidiana",r:3,d:75,u:26,c:["#e8c9ff","#9b59d6","#4a1d78"]},
 {n:"Espada do Sol",r:4,d:120,u:40,c:["#ffe28a","#f5a623","#a02d0f"]}
];
const BOOSTS=[
 {k:"power",n:"Martelo reforçado",i:"wip",d:"+1 de força por toque",base:150,max:10},
 {k:"auto",n:"Aprendiz de ferreiro",i:"wip",d:"+1 martelada por segundo",base:250,max:10},
 {k:"luck",n:"Brasa dourada",i:"wip",d:"Mais chance de raridade alta",base:200,max:10}
];
const KEY="forja-clicker-v1";
let S={coins:1000,level:1,xp:0,cur:0,found:[0],b:{power:0,auto:0,luck:0}};
try{const r=localStorage.getItem(KEY);if(r)S=Object.assign(S,JSON.parse(r))}catch(e){}
const $=id=>document.getElementById(id);
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const need=()=>40+(S.level-1)*20;
const cost=b=>Math.round(b.base*Math.pow(1.6,S.b[b.k]));

function sword(c,id,big){
  const f=c?`url(#g${id})`:"#000",h=c?c[2]:"#000",st=c?"#000":"none";
  const g=c?`<defs><linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient></defs>`:"";
  return `<svg viewBox="0 0 100 100">${g}<g transform="translate(50 50) rotate(-45) scale(${big?1.2:1.15}) translate(-50 -48)" stroke="${st}" stroke-width="1" stroke-linejoin="round"><polygon points="50,4 57,13 57,62 43,62 43,13" fill="${f}"/>${c?'<path d="M50 14V60" stroke="#0007" stroke-width="1"/>':""}<rect x="34" y="62" width="32" height="8" rx="3" fill="${h}"/><rect x="46" y="70" width="8" height="16" fill="${h}"/><circle cx="50" cy="90" r="5" fill="${h}"/></g></svg>`;
}

function roll(){
  const luck=S.b.luck*0.35+S.level*0.04;
  const w=RAR.map((r,i)=>SW.some(s=>s.r===i)?r.w*(1+luck*i):0);
  let t=w.reduce((a,b)=>a+b,0)*Math.random(),ri=0;
  for(let i=0;i<w.length;i++){t-=w[i];if(t<=0){ri=i;break}}
  const pool=SW.map((s,i)=>s.r===ri?i:-1).filter(i=>i>=0);
  return pool[Math.floor(Math.random()*pool.length)];
}

function toast(t){const e=$("toast");e.textContent=t;e.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("on"),2200)}

function addXp(p){
  S.xp+=p;S.coins+=p;
  if(S.xp>=need()){
    S.xp-=need();
    const s=SW[S.cur],reward=s.d*3;
    S.coins+=reward;S.level++;
    if(!S.found.includes(S.cur))S.found.push(S.cur);
    toast(`${s.n} forjada! +${reward} moedas`);
    S.cur=roll();
    renderAll();
  }
  save();
}

function tap(e){
  const p=1+S.b.power;
  addXp(p);
  const card=$("anvil");
  card.classList.remove("hit");void card.offsetWidth;card.classList.add("hit");
  const r=card.getBoundingClientRect(),x=(e.clientX-r.left)||r.width/2,y=(e.clientY-r.top)||r.height/2;
  const s=document.createElement("span");s.className="pop";s.textContent="+"+p;
  s.style.left=(x-10)+"px";s.style.top=(y-20)+"px";card.appendChild(s);
  setTimeout(()=>s.remove(),700);
  renderTop();
}

function renderTop(){
  $("coins").textContent=Math.floor(S.coins);
  $("xpTxt").textContent=`${S.xp}/${need()}`;
  $("lvlTxt").textContent=`Nível ${S.level}`;
  $("xpBar").style.width=(S.xp/need()*100)+"%";
}
function renderForja(){
  const s=SW[S.cur],r=RAR[s.r];
  $("mainSword").innerHTML=sword(s.c,"m",true);
  $("swName").textContent=s.n;
  const b=$("swRar");b.textContent=r.n;b.style.background=r.c;
  $("anvil").style.borderColor=r.c;
  $("slots").innerHTML=BOOSTS.map(b=>S.b[b.k]>0?`<div class="slot"><span>${b.i}</span>Nv. ${S.b[b.k]}</div>`:`<div class="slot"></div>`).join("");
}
function renderShop(){
  $("shop").innerHTML=BOOSTS.map(b=>{
    const lv=S.b[b.k],full=lv>=b.max,c=cost(b);
    return `<div class="item"><div class="ico">${b.i}</div><div class="grow"><h3>${b.n}</h3><p>${b.d}<br>Nível ${lv}/${b.max}</p></div><button class="buy" data-b="${b.k}" ${full||S.coins<c?"disabled":""}>${full?"Máx.":"$ "+c}</button></div>`;
  }).join("");
}
function renderList(){
  $("colTitle").textContent=`Coleção (${S.found.length}/${SW.length})`;
  $("list").innerHTML=SW.map((s,i)=>{
    const ok=S.found.includes(i),col=RAR[s.r].c;
    return `<div class="item" style="border-color:${col}">${sword(ok?s.c:null,"l"+i)}<div class="grow"><h3>${ok?s.n:"Não Descoberta"}</h3><p>Dano: ${ok?s.d:"???"}<br>Durabilidade: ${ok?s.u:"???"}</p></div></div>`;
  }).join("");
}
function renderAll(){renderTop();renderForja();renderShop();renderList()}

$("anvil").addEventListener("pointerdown",tap);
$("shop").addEventListener("click",e=>{
  const k=e.target.dataset.b;if(!k)return;
  const b=BOOSTS.find(x=>x.k===k),c=cost(b);
  if(S.coins<c||S.b[k]>=b.max)return;
  S.coins-=c;S.b[k]++;save();renderAll();
});
$("nav").addEventListener("click",e=>{
  const bt=e.target.closest("button");if(!bt)return;
  document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("on",x===bt));
  document.querySelectorAll(".screen").forEach(x=>x.classList.toggle("on",x.id==="s-"+bt.dataset.s));
  renderShop();renderList();
});
setInterval(()=>{if(S.b.auto>0){addXp(S.b.auto);renderTop()}},1000);
renderAll();