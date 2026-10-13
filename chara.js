// ===== キャラクター（形・色・表示） =====
const SHAPES={
しずく:'M40 6C52 6 58 22 66 36C74 50 70 66 40 66C10 66 6 50 14 36C22 22 28 6 40 6Z',
まる:'M40 12C60 12 71 28 71 44C71 60 58 66 40 66C22 66 9 60 9 44C9 28 20 12 40 12Z',
しかく:'M24 12H56Q70 12 70 26V52Q70 66 56 66H24Q10 66 10 52V26Q10 12 24 12Z',
ほし:'M40 4L50 26L74 28L56 44L62 66L40 55L18 66L24 44L6 28L30 26Z',
ハート:'M40 66C14 50 4 36 10 22C16 9 34 9 40 22C46 9 64 9 70 22C76 36 66 50 40 66Z',
くも:'M18 66C6 66 4 52 13 47C9 35 22 27 31 32C35 18 55 18 58 32C68 27 79 39 71 48C79 54 73 66 62 66Z'};
const COLORS={ミント:'#4fe0b6',スカイ:'#5ab8ff',ピンク:'#ff8ac6',オレンジ:'#ff9a4d',パープル:'#a98bff',イエロー:'#ffd84d',レッド:'#ff5f5f',ホワイト:'#e9eef5'};
const chara=()=>({shape:'しずく',color:'#4fe0b6',hide:false,...(db.chara||{})});
function mix(h,t,a){const p=x=>parseInt(h.slice(x,x+2),16),q=x=>parseInt(t.slice(x,x+2),16);return '#'+[1,3,5].map(i=>Math.round(p(i)+(q(i)-p(i))*a).toString(16).padStart(2,'0')).join('')}
let gid=0;
function masSvg(o){const c={...chara(),...(o||{})},id='sg'+(gid++),d=SHAPES[c.shape]||SHAPES.しずく,star=c.shape==='ほし';
return `<svg viewBox="0 0 80 72" width="62" height="56" class="slime"><defs><radialGradient id="${id}" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="${mix(c.color,'#ffffff',.6)}"/><stop offset=".55" stop-color="${c.color}"/><stop offset="1" stop-color="${mix(c.color,'#000000',.35)}"/></radialGradient></defs><ellipse cx="40" cy="68" rx="26" ry="3.5" fill="#000" opacity=".35" class="shadow"/><g class="body"><path d="${d}" fill="url(#${id})" fill-opacity=".93" stroke="${star?`url(#${id})`:mix(c.color,'#ffffff',.7)}" stroke-opacity="${star?1:.5}" stroke-width="${star?7:1}" stroke-linejoin="round"/><ellipse cx="29" cy="25" rx="6" ry="3.5" fill="#fff" opacity=".75" transform="rotate(-30 29 25)"/><circle cx="23" cy="33" r="1.8" fill="#fff" opacity=".7"/><g class="eyes"><ellipse cx="32" cy="42" rx="3" ry="4.2" fill="#123"/><ellipse cx="48" cy="42" rx="3" ry="4.2" fill="#123"/><circle cx="33" cy="40.5" r="1.1" fill="#fff"/><circle cx="49" cy="40.5" r="1.1" fill="#fff"/></g><ellipse cx="26" cy="49" rx="3.6" ry="2" fill="#ff8fa3" opacity=".55"/><ellipse cx="54" cy="49" rx="3.6" ry="2" fill="#ff8fa3" opacity=".55"/><path d="M36 50q4 4 8 0" stroke="#123" stroke-width="2" fill="none" stroke-linecap="round"/></g></svg><i class="sp s1">✦</i><i class="sp s2">✧</i><i class="sp s3">✦</i><i class="z">z</i>`}
function refreshMascot(){const f=$('#mascot .mface');if(f)f.innerHTML=masSvg();const m=$('#mascot');if(m)m.style.display=chara().hide?'none':'';const a=$('#chat .mface');if(a)a.innerHTML=masSvg()}
function setChara(o){db.chara={...chara(),...o};save();refreshMascot();const pv=$('#cpv');if(pv)pv.innerHTML=masSvg();const cs=$('#cs');if(cs)cs.innerHTML=charaOpts()}
function charaOpts(){const c=chara();return `<div class="shp">${Object.keys(SHAPES).map(s=>`<button class="${s===c.shape?'on':''}" onclick="setChara({shape:'${s}'})"><span class="mface">${masSvg({shape:s})}</span>${s}</button>`).join('')}</div><div class="cols">${Object.entries(COLORS).map(([n,h])=>`<button title="${n}" class="${h===c.color?'on':''}" style="background:${h}" onclick="setChara({color:'${h}'})"></button>`).join('')}<label class="cpick" style="background:${c.color}">🎨<input type="color" value="${c.color}" oninput="setChara({color:this.value})"></label></div>`}
function charaSheet(){const c=chara();sheet(`<h3>🎨 キャラクター</h3><div class="cpvw"><span id="cpv" class="mface">${masSvg()}</span></div><div id="cs">${charaOpts()}</div>${persOpts()}<label class="tgl"><input type="checkbox" ${c.hide?'checked':''} onchange="setChara({hide:this.checked});say(this.checked?'':'また会えたね！','happy')"> キャラクターを表示しない</label><p class="note">非表示にしても、ヘッダーの💬からチャットを使えます。</p><button class="big" onclick="closeS()">OK</button>`)}
// ===== チャット =====
let chatLog=JSON.parse(sessionStorage.getItem('chat')||'[]'),flow=null;
const CH0=['今日何する？','メニューを作って','記録の仕方','今日のkcal','今週何回やった？','キャラを変えたい','話し方を変えたい'];
function openChat(){let c=$('#chat');if(!c){c=document.createElement('div');c.id='chat';document.body.appendChild(c)}c.className='';
c.innerHTML=`<div class="cbox"><div class="chd"><span class="mface">${masSvg()}</span><b>トレーニング相棒</b><button onclick="closeChat()">×</button></div><div class="cmsgs" id="cmsgs"></div><div class="chips" id="cchips"></div><form class="cin" onsubmit="event.preventDefault();const v=$('#ctx').value.trim();if(v){$('#ctx').value='';send(v)}"><input id="ctx" placeholder="メッセージを入力…" autocomplete="off"><button>送信</button></form></div>`;
c.onclick=e=>{if(e.target.id==='chat')closeChat()};if(!chatLog.length)bot(line('tap')+'<br>使い方の説明や、メニュー作りもできるよ ✨',CH0);else drawChat()}
function closeChat(){$('#chat')?.classList.add('hidden')}
function drawChat(){const m=$('#cmsgs');if(!m)return;m.innerHTML=chatLog.map(x=>`<div class="msg ${x.u?'me':'bot'}">${x.t}</div>`).join('');m.scrollTop=1e9;const last=chatLog.at(-1);$('#cchips').innerHTML=(last&&!last.u&&last.c||CH0).map(c=>`<button class="chip" onclick="send(this.textContent)">${c}</button>`).join('');sessionStorage.setItem('chat',JSON.stringify(chatLog.slice(-60)))}
function bot(t,c){chatLog.push({t,c});drawChat();const a=$('#chat .mface');if(a){a.className='mface';void a.offsetWidth;a.className='mface talk'}mood('talk')}
function send(t){chatLog.push({u:1,t:t.replace(/[<>]/g,'')});drawChat();setTimeout(()=>reply(t),280)}
const HOW={記録:['記録の仕方','「今日」タブで部位→種目を選び、＋−で重さと回数を合わせて「✓ 記録する」。同じ内容なら「↻ 同じセット」で1タップ！✏️で修正、🗑️で削除できるよ。前回の値も自動で入るよ。'],
カレンダー:['カレンダー','「カレンダー」タブでトレーニングした日に部位ごとの色の●がつくよ。日付をタップするとその日の記録が見られるよ。'],
履歴:['履歴','「履歴」タブで日ごとのセット数・総重量・時間・消費kcal（目安）が見られるよ。タップでその日の詳細へ。'],
CSV:['CSV','「履歴」タブの一番下「⬇️ CSVエクスポート」でExcelで開けるCSVを保存できるよ。'],
カロリー:['カロリー','⚙️設定で体重を入れると、MET値×体重×時間で消費kcalの目安を出すよ。セットごと・日ごとに表示されるよ。'],
休憩:['休憩タイマー','セットを記録すると休憩タイマーが自動でスタート！+30秒やスキップもできるよ。長さは⚙️設定で変えられるよ。「タイマー開始」と言ってくれたら今すぐ始めるね。'],
メニュー:['メニュー','「メニュー」タブで目的・経験・週の回数からおすすめメニューを作れるよ。並べ替え・入れ替え・セット数変更もOK。「このメニューで始める」で今日のチェックリストになるよ。ここで「メニューを作って」と言っても作れるよ！'],
キャラ:['キャラ変更','⚙️設定か「キャラを変えたい」で形（まる・しかく・ほし・ハート・しずく・くも）と色を選べるよ。非表示にもできるよ。']};
const has=(t,...k)=>k.some(x=>t.includes(x));
function weekCount(){const d=new Date(),s=new Date(d);s.setDate(d.getDate()-((d.getDay()+6)%7));const k0=key(s);return Object.keys(db.logs).filter(k=>k>=k0&&k<=today()&&db.logs[k].length).length}
function findEx(t){return db.ex.filter(e=>t.includes(e)).sort((a,b)=>b.length-a.length)[0]||Object.keys(PARTS)&&db.ex.find(e=>e.length>=3&&t.includes(e.slice(0,3)))}
function reply(raw){const t=raw.trim();
if(flow&&has(t,'キャンセル','やめ'))return flow=null,bot('OK、やめておくね。',CH0);
if(flow)return menuFlow(t);
let m=t.match(/^▶ (.+)で始める$/);if(m){const mm=db.menus.find(x=>x.name===m[1]);if(mm){closeChat();return startMenu(mm.id)}}
if(has(t,'メニュー')&&has(t,'作','つく','提案','考え')){flow={s:0,d:{}};return bot('いいね！メニューを一緒に作ろう 💪<br>まず、目的は？',['筋肉アップ','ダイエット','健康維持・体力づくり'])}
if(has(t,'タイマー')&&has(t,'開始','スタート','始め','かけて')){startRest();go('today');return bot(line('restStart')+`<br>⏱ ${db.rest||90}秒`)}
if(has(t,'開いて','開く','見せて','移動','行きたい')){const tb=has(t,'カレンダー')?'cal':has(t,'履歴')?'hist':has(t,'メニュー')?'menu':has(t,'今日','記録')?'today':has(t,'設定')?'set':null;if(tb){if(tb==='set'){closeChat();settings()}else{closeChat();go(tb)}return bot('開いたよ！')}}
const pn=Object.keys(PERS).find(p=>t.includes(p))||(t.includes('関西')?'関西ノリ':t.includes('お姉さん')?'お姉さん応援':t.includes('鬼')?'鬼教官':null);if(pn){setPersona(pn);return bot(`話し方を「${pn}」にしたよ！<br>${line('sample')}`,['話し方を変えたい','今日何する？'])}
if(has(t,'話し方','口調','しゃべり方'))return bot('どの話し方がいい？',Object.keys(PERS));
const SA={星:'ほし',スター:'ほし',丸:'まる',四角:'しかく',雲:'くも',雫:'しずく',水滴:'しずく',はーと:'ハート'},sh=Object.keys(SHAPES).find(s=>t.includes(s))||SA[Object.keys(SA).find(a=>t.includes(a))],cn={ミント:'ミント',緑:'ミント',水色:'スカイ',スカイ:'スカイ',青:'スカイ',ピンク:'ピンク',オレンジ:'オレンジ',紫:'パープル',パープル:'パープル',黄:'イエロー',イエロー:'イエロー',赤:'レッド',レッド:'レッド',白:'ホワイト',ホワイト:'ホワイト'},col=Object.keys(cn).find(c=>t.includes(c));
if(sh||col){setChara({...(sh?{shape:sh}:{}),...(col?{color:COLORS[cn[col]]}:{})});return bot(`じゃーん！${sh||''}${sh&&col?'・':''}${col?cn[col]:''}になったよ。どう？`,['まる','ほし','ハート','ピンク','スカイ','もっと細かく選ぶ'])}
if(has(t,'もっと細かく','キャラを変','キャラ変','見た目','着せ替え','色を変','形を変')){if(has(t,'もっと细かく','もっと細かく')){closeChat();charaSheet();return}return bot('どの形にする？色の名前でもOKだよ（例：「ハートのピンク」）',[...Object.keys(SHAPES),'もっと細かく選ぶ'])}
if(has(t,'ベスト','PR','最高','MAX','マックス')){const e=findEx(t);if(!e){const ex=[...new Set(Object.values(db.logs).flat().map(s=>s.ex))].slice(0,6);return bot('どの種目の自己ベスト？',ex.length?ex.map(x=>x+'の自己ベスト'):['ベンチプレスの自己ベスト'])}
const L=Object.entries(db.logs).flatMap(([k,a])=>a.filter(s=>s.ex===e).map(s=>({...s,k})));if(!L.length)return bot(`${e}はまだ記録がないみたい。最初の1セット、やってみよう！`);const u=unitOf(e),b=L.reduce((a,s)=>(u==='kg'?(s.w>a.w||s.w===a.w&&s.r>a.r):s.r>a.r)?s:a);return bot(`🏆 ${e}の自己ベストは <b>${fmtSet(b)}</b>（${fmt(b.k)}）だよ！`)}
if(has(t,'kcal','カロリー','消費')&&!has(t,'使い方','とは','仕組み','どうやって')){if(!bodyW())return bot('体重が未設定だから計算できないよ。⚙️設定で体重を入れてね！',['設定を開いて']);const k=(db.logs[today()]||[]).reduce((a,s)=>a+kcal(s),0);return bot(`今日の消費は 約<b>${Math.round(k)} kcal</b>（目安）だよ 🔥`)}
if(has(t,'今週','何回','回数')&&!has(t,'使い方'))return bot(`今週は <b>${weekCount()}日</b> トレーニングしたよ！${weekCount()>=2?'いいペース！':'少しずつ続けよう 🌱'}`);
if(has(t,'何する','なにする','おすすめ','何やる','どこ鍛え','今日は何'))return bot(suggest(),['メニューを作って','今日のkcal']);
const hk=has(t,'CSV','エクスポート','書き出')?'CSV':has(t,'カレンダー')?'カレンダー':has(t,'履歴')?'履歴':has(t,'カロリー','kcal')?'カロリー':has(t,'休憩','タイマー')?'休憩':has(t,'メニュー')?'メニュー':has(t,'キャラ','形','色')?'キャラ':has(t,'記録','使い方','どうやって','入力')?'記録':null;
if(hk)return bot(wrap(`<b>${HOW[hk][0]}</b>：${HOW[hk][1]}`),Object.values(HOW).map(x=>x[0]+'の使い方').filter(x=>!x.startsWith(HOW[hk][0])).slice(0,5));
if(has(t,'ありがと','すごい','かわいい'))return mood('happy'),bot('えへへ、ありがとう！一緒にがんばろうね ✨');
if(has(t,'こんにち','おはよ','こんばん','やあ','はじめ'))return bot('やっほー！今日もいい1日にしよう 💪',CH0);
bot(line('unknown'),CH0)}
function menuFlow(t){const d=flow.d;
if(flow.s===0){d.goal=['筋肉アップ','ダイエット','健康維持・体力づくり'].find(g=>t.includes(g.slice(0,2)))||'健康維持・体力づくり';flow.s=1;return bot(`「${d.goal}」だね！経験はどのくらい？`,['初心者','中級者','上級者'])}
if(flow.s===1){d.level=['初心者','中級者','上級者'].find(x=>t.includes(x.slice(0,2)))||'初心者';flow.s=2;return bot('週に何回くらいできそう？',['1','2','3','4','5'])}
if(flow.s===2){d.days=Math.min(6,Math.max(1,parseInt(t.replace(/[０-９]/g,c=>c.charCodeAt(0)-65248))||2));flow.s=3;return bot(`週${d.days}回だね。どこでやる？`,['ジム','自宅','プール'])}
if(flow.s===3){d.place=has(t,'自宅','家')?'自宅':has(t,'プール')?'プール':'ジム';flow.s=4;return bot('年代を教えて（スキップもOK）',['10代','20代','30代','40代','50代','60代','70代以上','スキップ'])}
if(flow.s===4){const a=parseInt(t);d.age=a?a+5:(db.prof?.age||'');flow.s=5;return bot('性別は？（スキップもOK）',['男性','女性','スキップ'])}
if(flow.s===5){d.sex=['男性','女性'].find(x=>t.includes(x))||'';flow=null;
const ms=genMenus({goal:d.goal,place:d.place,level:d.level,days:d.days,age:d.age});db.menus=db.menus||[];
ms.forEach(m=>db.menus.push({...m,id:uid(),name:m.name}));db.prof={...(db.prof||{}),...(d.age?{age:d.age}:{}),...(d.sex?{sex:d.sex}:{})};save();mood('happy');
return bot(`できたよ！${ms.length}つのメニューを保存したよ 🎉<br>${ms.map(m=>`<div class="cm"><b>${m.name}</b><br>${m.items.map(x=>`${x.ex} ${x.sets}×${tgt(x)}`).join('、')}</div>`).join('')}<small>※一般的な目安です。体調に合わせて無理せずにね。</small>`,[...ms.map(m=>`▶ ${m.name}で始める`),'メニュータブを開いて'])}}
