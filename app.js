const $=s=>document.querySelector(s);
const PARTS={'胸':'#ff6b35','背中':'#4ade80','脚':'#60a5fa','肩':'#facc15','腕':'#c084fc','腹':'#f472b6','お尻':'#fb923c','全身・有酸素':'#22d3ee','その他':'#94a3b8'};const CATS=['すべて','自重','フリーウェイト','マシン','ケーブル'];
const DEFP={},DEFC={},DEFU={};EX.forEach(([n,p,c,u])=>{DEFP[n]=p;DEFC[n]=c;DEFU[n]=u});
const DEF=EX.map(e=>e[0]);
let db=JSON.parse(localStorage.getItem('wl')||'null')||{ex:[],logs:{}};db.ex=[...DEF,...(db.ex||[]).filter(e=>!DEF.includes(e))];db.part={...DEFP,...(db.part||{})};db.cat={...DEFC,...(db.cat||{})};db.unit={...DEFU,...(db.unit||{})};localStorage.setItem('wl',JSON.stringify(db));
const partOf=e=>db.part[e]||'その他';
const unitOf=e=>db.unit[e]||'kg';const catOf=e=>db.cat[e]||'その他';let fp=null,fc='すべて',fq='';
const fmtSet=(s,u=unitOf(s.ex))=>u==='sec'?`${s.r} 秒`+(s.w?` (+${s.w}kg)`:''):u==='min'?`${s.r} 分`:u==='bw'?(s.w?`${s.w} kg × `:'自重 × ')+`${s.r} 回`:`${s.w} kg × ${s.r} 回`;
function exList(){const q=fq.trim();const a=db.ex.filter(e=>(q?e.includes(q):partOf(e)===fp)&&(fc==='すべて'||catOf(e)===fc));return a.map(e=>`<button class="chip ${e===cur?'on':''}" onclick="pick('${e}')">${e}${unitOf(e)==='bw'?'<i class=tag>自重</i>':''}</button>`).join('')+(a.length?'':'<span class=empty>該当なし</span>')+'<button class="chip" onclick="addEx()">＋ 追加</button>'}
function filt(){$('#exl').innerHTML=exList()}
let said={};
const MAS=`<svg viewBox="0 0 64 64" width="52" height="52"><circle cx="32" cy="34" r="26" fill="#ffb38a"/><circle cx="14" cy="14" r="7" fill="#ffb38a"/><circle cx="50" cy="14" r="7" fill="#ffb38a"/><circle cx="23" cy="32" r="3.5" fill="#222"/><circle cx="41" cy="32" r="3.5" fill="#222"/><circle cx="17" cy="40" r="4" fill="#ff6b6b" opacity=".5"/><circle cx="47" cy="40" r="4" fill="#ff6b6b" opacity=".5"/><path d="M26 42q6 6 12 0" stroke="#222" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`;
function say(t){let m=$('#mascot');if(!m){m=document.createElement('div');m.id='mascot';document.body.appendChild(m)}m.innerHTML=`<div class="bub" onclick="this.remove()">${t}<span>×</span></div><div class="mface" onclick="say(suggest())">${MAS}</div>`;clearTimeout(say.t);say.t=setTimeout(()=>{const b=$('#mascot .bub');b&&b.remove()},6000)}
function suggest(){const t=new Date(today()+'T00:00');let best=null,bn=-1;Object.keys(PARTS).filter(p=>p!=='その他').forEach(p=>{const ks=Object.keys(db.logs).filter(k=>db.logs[k].some(s=>partOf(s.ex)===p)).sort();const n=ks.length?Math.round((t-new Date(ks.at(-1)+'T00:00'))/864e5):99;if(n>bn){bn=n;best=p}});return bn===0?'今日は全身バッチリ！えらい！🎉':`今日は<b>${best}</b>はどう？${bn>=99?'まだ記録がないよ':bn+'日空いてるよ'} 💪`}
let restEnd=0,restT=null;
function startRest(){restEnd=Date.now()+(db.rest||90)*1000;clearInterval(restT);restT=setInterval(tick,250);tick()}
function tick(){const el=$('#rest');const left=Math.ceil((restEnd-Date.now())/1000);if(!el)return;if(left<=0){clearInterval(restT);el.innerHTML='';if(restEnd){navigator.vibrate?.([200,100,200]);restEnd=0;say('休憩おわり！次のセットいこう 🔥')}return}el.innerHTML=`<div class="rest">⏱ 休憩 ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}<button onclick="restEnd+=30000">+30秒</button><button onclick="restEnd=Date.now()">スキップ</button></div>`}
function sinceHtml(){const t=new Date(today()+'T00:00');return Object.keys(PARTS).filter(p=>p!=='その他').map(p=>{const ks=Object.keys(db.logs).filter(k=>db.logs[k].some(s=>partOf(s.ex)===p)).sort();const n=ks.length?Math.round((t-new Date(ks.at(-1)+'T00:00'))/864e5):null;return `<span class="since" style="border-color:${PARTS[p]}">${p} <b>${n===null?'—':n===0?'今日':n+'日前'}</b></span>`}).join('')}
function copyPrev(){const ks=Object.keys(db.logs).filter(k=>k<today()&&db.logs[k].length).sort();if(!ks.length)return alert('前回の記録がありません');const k=ks.at(-1);if(!confirm(fmt(k)+' のメニュー（'+db.logs[k].length+'セット）を今日にコピーしますか？'))return;(db.logs[today()]=db.logs[today()]||[]).push(...db.logs[k].map(s=>({...s})));save();render()}
function csv(){let c='\ufeff日付,部位,種目,セット,重量kg,回数/秒/分,単位\n';Object.keys(db.logs).sort().forEach(k=>{const n={};db.logs[k].forEach(s=>{n[s.ex]=(n[s.ex]||0)+1;c+=`${k},${partOf(s.ex)},${s.ex},${n[s.ex]},${s.w},${s.r},${{sec:'秒',min:'分'}[unitOf(s.ex)]||'回'}\n`})});const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([c],{type:'text/csv'}));a.download='workout_'+today()+'.csv';a.click()}
const save=()=>localStorage.setItem('wl',JSON.stringify(db));
const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const fmt=k=>{const[y,m,d]=k.split('-');const w='日月火水木金土'[new Date(y,m-1,d).getDay()];return `${+m}月${+d}日(${w})`};
let tab='today',cur=db.cur||DEF[0],w=60,r=10,calM=new Date(),selDay=key(new Date());
const today=()=>key(new Date());
function prevOf(ex){const ks=Object.keys(db.logs).filter(k=>k<today()&&db.logs[k].some(s=>s.ex===ex)).sort();if(!ks.length)return null;const k=ks.at(-1);return{k,sets:db.logs[k].filter(s=>s.ex===ex)}}
function setsHtml(k,edit){const L=db.logs[k]||[];if(!L.length)return '<div class="empty">まだ記録がありません</div>';const g={};L.forEach((s,i)=>(g[s.ex]=g[s.ex]||[]).push([s,i]));
return Object.entries(g).map(([ex,a])=>`<div class="card"><h3>${ex}</h3>${a.map(([s,i],n)=>`<div class="set"><b>${n+1}</b><span>${fmtSet(s)}</span>${edit?`<button onclick="editSet('${k}',${i})">✏️</button><button onclick="delSet('${k}',${i})">🗑️</button>`:''}</div>`).join('')}</div>`).join('')}
function render(){document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===tab));
if(tab==='today'){$('#hdr').innerHTML=`今日のトレーニング<small>${fmt(today())}</small>`;const p=prevOf(cur);
if(!fp)fp=partOf(cur);const cp=fp,u=unitOf(cur);
$('#view').innerHTML=`<div class="since-row">${sinceHtml()}</div><div class="chips">${Object.keys(PARTS).map(p=>`<button class="chip pt ${p===cp?'on':''}" style="--c:${PARTS[p]}" onclick="pickPart('${p}')">${p}</button>`).join('')}</div><div class="chips">${CATS.map(c=>`<button class="chip cat ${c===fc?'on':''}" onclick="fc='${c}';render()">${c}</button>`).join('')}</div><input id="q" class="search" type="search" placeholder="🔍 種目を検索（例：カール）" value="${fq}" oninput="fq=this.value;filt()"><div class="chips wrap" id="exl">${exList()}</div>
<div class="card"><h3>${cur}</h3><div class="prev">${p?`前回 ${fmt(p.k)}：${p.sets.map(s=>fmtSet(s)).join(' / ')}`:'前回の記録なし'}${p?` <button class="mini" onclick="sameLast()">前回と同じ</button>`:''}</div>
<div class="step" ${u==='min'?'style=display:none':''}><button onclick="adj('w',-2.5)">−</button><div class="val">${u==='bw'&&!w?'自重':w}<small>${u==='bw'&&!w?'':' kg'}</small></div><button onclick="adj('w',2.5)">＋</button></div>
<div class="step"><button onclick="adj('r',-1)">−</button><div class="val">${r}<small> ${{sec:'秒',min:'分'}[u]||'回'}</small></div><button onclick="adj('r',1)">＋</button></div>
<div class="row2"><button class="big" id="rec" onclick="rec()">✓ 記録する</button><button class="big sub" onclick="again()">↻ 同じセット</button></div><div id="rest"></div></div>${setsHtml(today(),1)}<button class="big sub" onclick="copyPrev()">📄 前回のワークアウトをコピー</button>`;tick()}
else if(tab==='cal'){$('#hdr').innerHTML='カレンダー<small>トレーニングした日に●</small>';const y=calM.getFullYear(),m=calM.getMonth(),f=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate();
let c='日月火水木金土'.split('').map(x=>`<div class="w">${x}</div>`).join('')+'<div></div>'.repeat(f);
for(let d=1;d<=n;d++){const k=key(new Date(y,m,d));c+=`<div class="d ${k===today()?'today':''} ${k===selDay?'sel':''}" onclick="selDay='${k}';render()">${d}${db.logs[k]?.length?'<span>'+[...new Set(db.logs[k].map(s=>partOf(s.ex)))].map(p=>`<i class="dot" style="background:${PARTS[p]}"></i>`).join('')+'</span>':'<i class="nodot"></i>'}</div>`}
$('#view').innerHTML=`<div class="mnav"><button onclick="mv(-1)">‹</button><b>${y}年${m+1}月</b><button onclick="mv(1)">›</button></div><div class="cal">${c}</div><div class="legend">${Object.entries(PARTS).map(([p,c])=>`<span><i class="dot" style="background:${c}"></i>${p}</span>`).join('')}</div><h3 style="margin-top:16px">${fmt(selDay)}</h3>${setsHtml(selDay,1)}`}
else{$('#hdr').innerHTML='履歴<small>日ごとの記録 ・ 広告なし</small>';const ks=Object.keys(db.logs).filter(k=>db.logs[k].length).sort().reverse();
$('#view').innerHTML=ks.length?ks.map(k=>{const L=db.logs[k],ex=[...new Set(L.map(s=>s.ex))],vol=L.reduce((a,s)=>a+s.w*s.r,0);return `<div class="card" onclick="selDay='${k}';calM=new Date('${k}T00:00');go('cal')"><h3>${fmt(k)}</h3><div style="color:#8a90a0;font-size:14px">${ex.join('・')}<br>${L.length}セット ・ 総重量 ${vol.toLocaleString()} kg</div></div>`}).join('')+'<button class="big sub" onclick="csv()">⬇️ CSVエクスポート</button>':'<div class="empty">記録がまだありません</div>'}}
function go(t){tab=t;render();if(t==='today'&&!said.g){said.g=1;const h=new Date().getHours();say((h<11?'おはよう！':h<18?'こんにちは！':'こんばんは！')+'<br>'+suggest())}scrollTo(0,0)}
function pick(e){cur=e;db.cur=e;save();const u=unitOf(e);if(u!=='kg'){w=0;r=u==='sec'?30:u==='min'?20:10}const p=prevOf(e),t=(db.logs[today()]||[]).filter(s=>s.ex===e);const s=t.at(-1)||p?.sets.at(-1);if(s){w=s.w;r=s.r}render()}
function adj(k,d){if(k==='w')w=Math.max(0,Math.round((w+d)*10)/10);else{const u=unitOf(cur);r=Math.max(1,r+d*(u==='sec'?5:1))}render()}
function rec(){const best=Math.max(0,...Object.entries(db.logs).flatMap(([k,L])=>L.filter(s=>s.ex===cur).map(s=>s.w)));const pr=unitOf(cur)!=='min'&&best>0&&w>best;const n=(db.logs[today()]||[]).length;
const P=['ナイス！その調子 👍','いいね〜！','かっこいい！✨','つよい！💪','あと少し、がんばれ〜！'];setTimeout(()=>say(pr?`🏆 自己ベスト更新！${cur} ${w}kg！すごい！`:n===0?'今日の1セット目！えらい！':P[n%P.length]),0);(db.logs[today()]=db.logs[today()]||[]).push({ex:cur,w,r});save();render();navigator.vibrate?.(30);startRest()}
function pickPart(p){fp=p;fq='';render()}
function sameLast(){const p=prevOf(cur);const n=(db.logs[today()]||[]).filter(s=>s.ex===cur).length;const s=p.sets[Math.min(n,p.sets.length-1)];w=s.w;r=s.r;render()}
function again(){const t=(db.logs[today()]||[]).filter(s=>s.ex===cur).at(-1);if(t){w=t.w;r=t.r}rec()}
function delSet(k,i){if(confirm('このセットを削除しますか？')){db.logs[k].splice(i,1);save();render()}}
function editSet(k,i){const s=db.logs[k][i];sheet(`<h3>${s.ex} を編集</h3><div class="row2"><input id="ew" type="number" step="0.5" inputmode="decimal" value="${s.w}"><input id="er" type="number" inputmode="numeric" value="${s.r}"></div><div class="row2"><button class="big sub" onclick="closeS()">キャンセル</button><button class="big" onclick="db.logs['${k}'][${i}]={ex:'${s.ex}',w:+$('#ew').value,r:+$('#er').value};save();closeS();render()">保存</button></div>`)}
function addEx(dp){dp=dp||partOf(cur);sheet(`<h3>種目を追加</h3><input id="nx" placeholder="例：ブルガリアンスクワット"><select id="nc">${CATS.slice(1).map(c=>`<option>${c}</option>`).join('')}</select><select id="np">${Object.keys(PARTS).map(p=>`<option ${p===dp?'selected':''}>${p}</option>`).join('')}</select><div class="row2"><button class="big sub" onclick="closeS()">キャンセル</button><button class="big" onclick="const v=$('#nx').value.trim().replace(/['\"<>]/g,'');if(v){if(!db.ex.includes(v))db.ex.push(v);db.part[v]=$('#np').value;db.cat[v]=$('#nc').value;db.unit[v]={自重:'bw',その他:'kg'}[$('#nc').value]||'kg';fp=db.part[v];cur=v;save()}else if(!cur)cur=db.ex[0];closeS();render()">追加</button></div>`);$('#nx').focus()}
function sheet(h){$('#sheet').innerHTML=`<div>${h}</div>`;$('#sheet').classList.remove('hidden')}
function closeS(){$('#sheet').classList.add('hidden')}
$('#sheet').onclick=e=>{if(e.target.id==='sheet')closeS()};
function mv(d){calM=new Date(calM.getFullYear(),calM.getMonth()+d,1);render()}
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>go(b.dataset.t));
pick(cur);go('today');if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
