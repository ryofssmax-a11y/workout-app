// ===== 設定・カロリー =====
const MET={'クロール':8.3,'平泳ぎ':5.3,'背泳ぎ':4.8,'バタフライ':13.8,'水中ウォーキング(前歩き)':4.5,'水中ウォーキング(後ろ歩き)':4.5,'水中ウォーキング(横歩き)':4.5,'アクアジョギング':9.8,'ビート板キック':6,'水中スクワット':5.3,'水中もも上げ':5.3,'アクアビクス':5.5,'水中ストレッチ':2.5,'自由遊泳':6,
'ランニング(トレッドミル)':8.3,'エアロバイク':6.8,'クロストレーナー':5,'ローイングマシン':7,'バーピー':8,'ジャンピングジャック':7.7,'縄跳び':11.8,'ウォールシット':3.5,'プランク':3.8,'サイドプランク':3.8,'ケトルベルスイング':9.8,'クリーン':6,'スナッチ':6,'ファーマーズウォーク':6,'ジャンプスクワット':8,'マウンテンクライマー':8,
'デッドリフト':6,'バーベルスクワット':6,'フロントスクワット':6,'ベンチプレス':6,'スモウデッドリフト':6,'ルーマニアンデッドリフト':6};
function metOf(e){if(MET[e])return MET[e];const c=catOf(e),p=partOf(e);if(p==='腹')return 2.8;return {自重:3.8,フリーウェイト:5,マシン:3.5,ケーブル:3.5,プール:5}[c]||4}
function hours(s){const u=unitOf(s.ex);return u==='min'||u==='swim'?s.r/60:u==='sec'?s.r/3600:(s.r*3.5+30)/3600}
const bodyW=()=>+(db.prof?.weight)||0;
function kcal(s){const W=bodyW();if(!W)return null;return Math.round(metOf(s.ex)*(W+(unitOf(s.ex)==='bw'?0:0))*hours(s)*10)/10}
function kcalTxt(s){const k=kcal(s);return k==null?'':(k>=10?Math.round(k):k)+'kcal'}
function kcalDay(k){const L=db.logs[k]||[];if(!L.length)return'';if(!bodyW())return `<div class="kday" onclick="event.stopPropagation();settings()">🔥 体重を設定すると消費カロリー（目安）を表示します ›</div>`;const t=L.reduce((a,s)=>a+kcal(s),0);return `<div class="kday">🔥 約 ${Math.round(t)} kcal <small>（目安）</small></div>`}
const gear=()=>`<button class="chatb" onclick="openChat()" aria-label="チャット">💬</button><button class="gear" onclick="settings()" aria-label="設定">⚙️</button>`;
function settings(){const p=db.prof||{};sheet(`<h3>⚙️ プロフィール・設定</h3><div class="form"><label>年齢<input id="pa" type="number" inputmode="numeric" value="${p.age||''}" placeholder="例：35"></label><label>性別<select id="ps">${['','男性','女性','その他'].map(x=>`<option ${x===p.sex?'selected':''}>${x}</option>`).join('')}</select></label><label>身長 (cm)<input id="ph" type="number" inputmode="decimal" value="${p.height||''}" placeholder="例：170"></label><label>体重 (kg)<input id="pw" type="number" inputmode="decimal" value="${p.weight||''}" placeholder="例：65"></label><label>休憩タイマー (秒)<input id="pr" type="number" inputmode="numeric" value="${db.rest||90}"></label></div><button class="big sub" onclick="charaSheet()">🎨 キャラクターの形・色・表示</button><label class="tgl"><input type="checkbox" ${chara().hide?"checked":""} onchange="setChara({hide:this.checked})"> キャラクターを表示しない</label><p class="note">消費カロリーはMET値×体重×時間で計算した目安です。</p><div class="row2"><button class="big sub" onclick="closeS()">閉じる</button><button class="big" onclick="saveProf()">保存</button></div>`)}
function saveProf(){db.prof={age:+$('#pa').value||'',sex:$('#ps').value,height:+$('#ph').value||'',weight:+$('#pw').value||''};db.rest=+$('#pr').value||90;save();closeS();render();say(bodyW()?'保存したよ！カロリーの目安も出せるようになったよ 🔥':'保存したよ！')}
// ===== プラン（今日やるメニュー） =====
function planHtml(){const P=db.plan;if(!P||P.k!==today())return'';const L=db.logs[today()]||[];let all=0,dn=0;
const rows=P.items.map((it,i)=>{const done=Math.min(it.sets,L.filter(s=>s.ex===it.ex&&s.t>=P.t).length);all+=it.sets;dn+=done;return `<div class="pi ${done>=it.sets?'ok':''}"><span onclick="pick('${it.ex}')"><b>${it.ex}</b><small>${it.sets}セット × ${tgt(it)}・休憩${it.rest}秒</small></span><em>${done}/${it.sets}</em><button onclick="planDo(${i})" ${done>=it.sets?'disabled':''}>✓</button></div>`}).join('');
return `<div class="card plan"><h3>📋 ${P.name} <small>${dn}/${all}</small><button class="mini" onclick="db.plan=null;save();render()">終了</button></h3><div class="pbar"><i style="width:${all?dn/all*100:0}%"></i></div>${rows}</div>`}
const tgt=it=>{const u=unitOf(it.ex);return u==='sec'?it.reps+'秒':u==='min'||u==='swim'?it.reps+'分':it.reps+'回'};
function planDo(i){const it=db.plan.items[i];cur=it.ex;db.cur=it.ex;const u=unitOf(it.ex),p=prevOf(it.ex),t=(db.logs[today()]||[]).filter(s=>s.ex===it.ex).at(-1),s=t||p?.sets.at(-1);w=u==='kg'?(s?s.w:w):(s&&u==='bw'?s.w:0);r=it.reps;dd=0;rec.rest=it.rest;rec();
const P=db.plan,L=db.logs[today()];if(P.items.every(x=>L.filter(s=>s.ex===x.ex&&s.t>=P.t).length>=x.sets))setTimeout(()=>say(`🎉 「${P.name}」完了！おつかれさま！`,'happy'),50)}
function startMenu(id){const m=db.menus.find(x=>x.id===id);db.plan={k:today(),t:Date.now(),name:m.name,items:m.items.map(x=>({...x}))};save();go('today');say(`「${m.name}」スタート！✓ボタンでサクッと記録してね`)}
// ===== メニュー作成 =====
let gen=null,editId=null,mf=null;
const POOL={gym:{chest:['チェストプレス','ベンチプレス','ダンベルプレス'],back:['ラットプルダウン','シーテッドロー','ダンベルロー'],legs:['レッグプレス','バーベルスクワット','ブルガリアンスクワット'],ham:['レッグカール','ルーマニアンデッドリフト','ルーマニアンデッドリフト'],sh:['マシンショルダープレス','ダンベルショルダープレス','ダンベルショルダープレス'],lat:['サイドレイズ','サイドレイズ','サイドレイズ'],bi:['ダンベルカール','ダンベルカール','バーベルカール'],tri:['トライセプスプレスダウン','トライセプスプレスダウン','ライイングトライセプスエクステンション'],glute:['アブダクション','ヒップスラスト','ヒップスラスト'],abs:['アブドミナル','プランク','ハンギングレッグレイズ'],fly:['ペックフライ','ダンベルフライ','インクラインダンベルプレス'],row2:['マシンロー','バーベルロー','バーベルロー'],ext:['レッグエクステンション','レッグエクステンション','レッグエクステンション'],cardio:['エアロバイク','クロストレーナー','ランニング(トレッドミル)']},
home:{chest:['膝つき腕立て伏せ','腕立て伏せ','デクラインプッシュアップ'],back:['バックエクステンション','斜め懸垂','懸垂'],legs:['スクワット','ランジ','ブルガリアンスクワット'],ham:['ヒップリフト','ヒップリフト','ヒップリフト'],sh:['パイクプッシュアップ','パイクプッシュアップ','パイクプッシュアップ'],tri:['ベンチディップス','ベンチディップス','ダイヤモンドプッシュアップ'],glute:['クラムシェル','ドンキーキック','ドンキーキック'],abs:['クランチ','プランク','レッグレイズ'],calf:['カーフレイズ','カーフレイズ','カーフレイズ'],cardio:['ステップアップ','ジャンピングジャック','バーピー']}};
function genMenus(o){const age=+o.age||30,old=age>=60,lv={初心者:0,中級者:1,上級者:2}[o.level],g=o.goal;
let sets=[2,3,4][lv],reps=10,rest=90,sec=[20,30,45][lv];
if(g==='筋肉アップ'){reps=lv===2?8:10;rest=lv?120:90}else if(g==='ダイエット'){reps=15;rest=45}else{sets=Math.min(sets,3)-(lv?0:0);reps=12;rest=60}
if(old){sets=Math.min(sets,2+(lv>1));rest+=30;sec=Math.min(sec,30)}
const avoid=old?['バーピー','ジャンプスクワット','バーベルスクワット','ルーマニアンデッドリフト','懸垂','ハンギングレッグレイズ','マウンテンクライマー','ジャンピングジャック']:[];
const home=g==='自宅だけ',P=home?POOL.home:POOL.gym;
const pk=k=>{let l=P[k]||POOL.gym[k];let e=l[lv];if(avoid.includes(e))e=l.find(x=>!avoid.includes(x))||l[0];return e};
const it=(e,s=sets,rp)=>({ex:e,sets:s,reps:rp??(unitOf(e)==='sec'?sec:reps),rest});
const cmin=g==='ダイエット'?20:15,card=k=>({ex:pk('cardio'),sets:1,reps:home?20:cmin,rest:60});
const fix=m=>{m.items.forEach(x=>{if(unitOf(x.ex)==='sec')x.reps=sec});return m};
const out=[];
if(g==='プール中心'){const sw=lv?'クロール':'平泳ぎ';out.push({name:'プール 基本メニュー',items:[['水中ウォーキング(前歩き)',10],['水中ウォーキング(後ろ歩き)',5],['水中ウォーキング(横歩き)',5],['水中もも上げ',5],['水中スクワット',5],['水中ストレッチ',5]]});
out.push({name:'プール しっかりメニュー',items:[['水中ウォーキング(前歩き)',10],['アクアジョギング',lv?10:5],[sw,lv?20:10],['ビート板キック',5],['水中ストレッチ',5]]});if(lv&&!old)out.push({name:'スイム中心メニュー',items:[['水中ウォーキング(前歩き)',5],['クロール',15],['平泳ぎ',10],['背泳ぎ',5],['水中ストレッチ',5]]});
out.forEach(m=>m.items=m.items.map(([e,mn])=>({ex:e,sets:1,reps:mn,rest:60})));return out}
const full={name:(home?'自宅 ':'')+'全身メニュー',items:[it(pk('legs')),it(pk('chest')),it(pk('back')),it(pk('sh')),it(pk(home?'ham':'glute')),it(pk('abs'))]};
if(g!=='筋肉アップ')full.items.push(card());out.push(full);
if(home){out.push({name:'自宅 下半身＋体幹',items:[it(pk('legs')),it('ワイドスクワット'),it(pk('ham')),it(pk('glute')),it(pk('calf')),it('プランク'),it(old?'クランチ':'ロシアンツイスト')]});if(+o.days>=3)out.push({name:'自宅 上半身',items:[it(pk('chest')),it(pk('back')),it(pk('sh')),it(pk('tri')),it('スーパーマン'),it('クランチ')]})}
else if(+o.days>=4&&g==='筋肉アップ'&&lv){out.push({name:'3分割① 胸・肩・三頭',items:[it(pk('chest')),it(pk('fly')),it(pk('sh')),it(pk('lat')),it(pk('tri'))]},{name:'3分割② 背中・二頭',items:[it(pk('back')),it(pk('row2')),it('フェイスプル'),it(pk('bi')),it('ハンマーカール')]},{name:'3分割③ 脚・お尻・腹',items:[it(pk('legs')),it(pk('ham')),it(pk('ext')),it(pk('glute')),it(pk('abs'))]})}
else if(+o.days>=2){out.push({name:'上半身の日',items:[it(pk('chest')),it(pk('back')),it(pk('sh')),it(pk('bi')),it(pk('tri'))]},{name:'下半身＋体幹の日',items:[it(pk('legs')),it(pk('ham')),it(pk('ext')),it(pk('glute')),it(pk('abs'))].concat(g!=='筋肉アップ'?[card()]:[])})}
return out.map(fix)}
const SEL=(id,arr,v)=>`<select id="${id}">${arr.map(x=>`<option ${String(x)===String(v)?'selected':''}>${x}</option>`).join('')}</select>`;
function menuView(){$('#hdr').innerHTML=gear()+'メニュー<small>目的に合わせて自動作成・編集できます</small>';db.menus=db.menus||[];
if(editId){const m=db.menus.find(x=>x.id===editId);if(m)return menuEdit(m);editId=null}
const p=db.prof||{};mf=mf||{goal:'筋肉アップ',level:'初心者',days:2};
$('#view').innerHTML=`<div class="card"><h3>✨ メニューを作る</h3><div class="form">
<label>目的${SEL('mg',['筋肉アップ','ダイエット','健康維持・体力づくり','自宅だけ','プール中心'],mf.goal)}</label>
<label>経験${SEL('ml',['初心者','中級者','上級者'],mf.level)}</label>
<label>週の回数${SEL('md',[1,2,3,4,5,6],mf.days)}</label>
<label>年齢<input id="ma" type="number" inputmode="numeric" value="${p.age||''}" placeholder="例：35"></label>
<label>性別${SEL('mx',['','男性','女性','その他'],p.sex||'')}</label></div>
<button class="big" onclick="doGen()">メニューを作成</button><p class="note">※ 一般的な目安です。医療的なアドバイスではありません。持病・ケガがある方や体調に不安がある方は医師に相談し、痛みを感じたら中止してください。</p></div>
${gen?`<h3>おすすめメニュー（${gen.length}件）</h3>`+gen.map((m,i)=>`<div class="card">${menuCard(m)}<div class="row2"><button class="big sub" onclick="saveGen(${i},1)">保存して編集</button><button class="big" onclick="saveGen(${i})">保存</button></div></div>`).join(''):''}
<h3>保存したメニュー</h3>${db.menus.length?db.menus.map(m=>`<div class="card">${menuCard(m)}<div class="row2"><button class="big sub" onclick="editId='${m.id}';render()">✏️ 編集</button><button class="big" onclick="startMenu('${m.id}')">▶ このメニューで始める</button></div></div>`).join(''):'<div class="empty">まだありません。上で作成するか、空のメニューから作れます。</div>'}
<button class="big sub" onclick="newMenu()">＋ 空のメニューを作る</button>`}
function menuCard(m){return `<h3>${m.name}</h3>${m.items.map(x=>`<div class="mi"><i class="dot" style="background:${PARTS[partOf(x.ex)]}"></i>${x.ex}<small>${x.sets}×${tgt(x)}</small></div>`).join('')}`}
function doGen(){mf={goal:$('#mg').value,level:$('#ml').value,days:$('#md').value};db.prof={...(db.prof||{}),age:+$('#ma').value||db.prof?.age||'',sex:$('#mx').value};save();gen=genMenus({...mf,age:db.prof.age});render();say(`${gen.length}つ作ったよ！気に入ったら保存してね ✨`)}
const uid=()=>Math.random().toString(36).slice(2,9);
function saveGen(i,ed){const m={...gen[i],id:uid(),items:gen[i].items.map(x=>({...x}))};db.menus.push(m);save();if(ed)editId=m.id;render();if(!ed)say('保存したよ！')}
function newMenu(){const m={id:uid(),name:'マイメニュー',items:[]};db.menus.push(m);save();editId=m.id;render()}
function menuEdit(m){edM=m;
$('#view').innerHTML=`<div class="card"><label class="form">メニュー名<input value="${m.name}" onchange="edM.name=this.value.replace(/[<>&\x27\x22]/g,'');save()"></label></div>
${m.items.map((x,i)=>`<div class="card ei"><div class="eh"><b>${i+1}. ${x.ex}</b><span><button onclick="mvIt(${i},-1)" ${i?'':'disabled'}>↑</button><button onclick="mvIt(${i},1)" ${i<m.items.length-1?'':'disabled'}>↓</button><button onclick="swapIt(${i})">🔁</button><button onclick="rmIt(${i})">🗑️</button></span></div>
<div class="ec">${sm(i,'sets','セット',1)}${sm(i,'reps',{sec:'秒',min:'分',swim:'分'}[unitOf(x.ex)]||'回',unitOf(x.ex)==='sec'?5:1)}${sm(i,'rest','休憩秒',15)}</div></div>`).join('')}
<button class="big sub" onclick="swapIt(-1)">＋ 種目を追加</button>
<div class="row2"><button class="big sub" onclick="if(confirm('このメニューを削除しますか？')){db.menus=db.menus.filter(x=>x.id!=='${m.id}');editId=null;save();render()}">削除</button><button class="big sub" onclick="editId=null;render()">完了</button></div>
<button class="big" onclick="startMenu('${m.id}')">▶ このメニューで始める</button>`;edM=m}
let edM=null;
const sm=(i,k,l,st)=>`<div class="sm"><small>${l}</small><div><button onclick="chIt(${i},'${k}',-${st})">−</button><b>${edM0(i,k)}</b><button onclick="chIt(${i},'${k}',${st})">＋</button></div></div>`;
const edM0=(i,k)=>db.menus.find(x=>x.id===editId).items[i][k];
function chIt(i,k,d){const it=edM.items[i];it[k]=Math.max(k==='rest'?0:1,it[k]+d);save();render()}
function mvIt(i,d){const a=edM.items;[a[i],a[i+d]]=[a[i+d],a[i]];save();render()}
function rmIt(i){edM.items.splice(i,1);save();render()}
function swapIt(i){swapI=i;sheet(`<h3>${i<0?'種目を追加':'種目を入れ替え'}</h3><input id="sq" type="search" placeholder="🔍 検索（例：プレス、プール）" oninput="swl()"><div id="swl" class="swl"></div><button class="big sub" onclick="closeS()">キャンセル</button>`);swl()}
let swapI=-1;
function swl(){const q=($('#sq')?.value||'').trim();$('#swl').innerHTML=db.ex.filter(e=>!q||e.includes(q)||partOf(e).includes(q)||catOf(e).includes(q)).slice(0,80).map(e=>`<button class="chip" onclick="swapTo('${e}')"><i class="dot" style="background:${PARTS[partOf(e)]};display:inline-block;margin-right:6px"></i>${e}</button>`).join('')}
function swapTo(e){const u=unitOf(e),rp=u==='sec'?30:u==='min'||u==='swim'?10:10;if(swapI<0)edM.items.push({ex:e,sets:u==='min'||u==='swim'?1:3,reps:rp,rest:60});else{const it=edM.items[swapI];it.ex=e;it.reps=rp;if(u==='min'||u==='swim')it.sets=1}save();closeS();render()}
