const places = [
  {id:'airport',name:'鳥取砂丘コナン空港',type:'transit',day:1,lat:35.5301,lng:134.1667,note:'羽田から到着。砂丘へはタクシーを想定。'},
  {id:'dunes',name:'鳥取砂丘',type:'sight',day:1,lat:35.5394,lng:134.2286,note:'1日目のメインスポット。空港からタクシーで移動。'},
  {id:'tottori',name:'鳥取駅',type:'transit',day:1,lat:35.4940,lng:134.2250,note:'スーパーはくとで三ノ宮へ。指定席は乗車1か月前から確認。'},
  {id:'sannomiya',name:'三ノ宮駅',type:'transit',day:1,lat:34.6947,lng:135.1955,note:'神戸側の移動拠点。レンタカー利用にも便利。'},
  {id:'rei',name:'神戸三宮東急REIホテル',type:'stay',day:1,lat:34.6959,lng:135.1979,note:'三ノ宮駅から近いホテル候補。',ref:'https://www.tokyuhotels.co.jp/kobesannomiya-r/'},
  {id:'awaji',name:'淡路島',type:'sight',day:2,lat:34.4382,lng:134.9142,note:'レンタカーで短縮観光。立ち寄り先は今後確定。'},
  {id:'naruto',name:'鳴門海峡',type:'sight',day:2,lat:34.2406,lng:134.6507,note:'淡路島から四国へ渡るルート。'},
  {id:'bokaiso',name:'ホテル望海荘',type:'stay',day:2,lat:34.3592,lng:134.1025,note:'2日目の宿。屋島からの景色と日の出を楽しめるホテル。',ref:'https://bokaiso.com/'},
  {id:'moriya',name:'本格手打もり家 高松本店',type:'food',day:3,lat:34.2609,lng:134.0356,note:'うどん巡りの候補店。営業状況を見て訪問順を決定。',ref:'https://mori-ya.jp/'},
  {id:'yamada',name:'うどん本陣 山田家 讃岐本店',type:'food',day:3,lat:34.3301,lng:134.1231,note:'牟礼の人気店。屋島方面から立ち寄りやすい候補。',ref:'http://yamada-ya.com/'},
  {id:'gamou',name:'がもううどん',type:'food',day:3,lat:34.3044,lng:133.9350,note:'坂出エリアの候補。売り切れ時間に注意。'},
  {id:'bakuka',name:'手打十段 うどんバカ一代',type:'food',day:3,lat:34.3348,lng:134.0603,note:'高松市街の候補。朝から立ち寄れる。'}
];

const days={
  1:{title:'鳥取から、旅が始まる。',date:'DAY 1',status:'公共交通',center:[35.12,134.70],zoom:8,route:['airport','dunes','tottori','sannomiya','rei'],schedule:[['朝','鳥取空港に到着','タクシーで砂丘へ','airport'],['午前','鳥取砂丘','観光・昼食','dunes'],['午後','スーパーはくと','鳥取から三ノ宮へ','tottori'],['夕方','三ノ宮に到着','ホテル候補を確認して神戸で夕食','rei']]},
  2:{title:'海を越えて、四国へ。',date:'DAY 2',status:'レンタカー',center:[34.48,134.68],zoom:8,route:['sannomiya','awaji','naruto','bokaiso'],schedule:[['午前','三ノ宮から出発','レンタカーで淡路島へ','sannomiya'],['昼頃','淡路島を観光','立ち寄り先は当日の状況で調整','awaji'],['午後','鳴門海峡を通過','四国・香川方面へ','naruto'],['夕方','ホテル望海荘','屋島の宿へ移動','bokaiso']]},
  3:{title:'うどんを巡って、神戸へ。',date:'DAY 3',status:'レンタカー',center:[34.38,134.48],zoom:8,route:['bokaiso','yamada','moriya','gamou','sannomiya'],schedule:[['朝','うどん巡りスタート','営業状況を見て候補店から選択','yamada'],['午前','うどん店を巡る','混雑や売り切れに合わせて順番を調整','moriya'],['午後','高松を出発','三ノ宮へ戻る','gamou'],['夕方','三ノ宮に到着','レンタカーを返却して帰路へ','sannomiya']]}
};

const typeLabel={stay:'ホテル',food:'うどん',sight:'観光',transit:'交通'};
const map=L.map('map',{zoomControl:false}).setView(days[1].center,days[1].zoom);
L.control.zoom({position:'bottomright'}).addTo(map);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
const markerLayer=L.layerGroup().addTo(map);let routeLayer;let selectedDay=1;let category='all';

function icon(type){return L.divIcon({className:'',html:`<div class="pin pin-${type}"><i></i></div>`,iconSize:[28,28],iconAnchor:[14,28]})}
function navUrl(place){return `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&travelmode=driving`}
function openPlace(place){document.querySelector('#sheetType').textContent=typeLabel[place.type];document.querySelector('#sheetName').textContent=place.name;document.querySelector('#sheetNote').textContent=place.note;document.querySelector('#navigateLink').href=navUrl(place);const ref=document.querySelector('#referenceLink');ref.href=place.ref||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;ref.textContent=place.ref?'公式・参考':'地図で見る';document.querySelector('#placeSheet').classList.add('open');document.querySelector('#placeSheet').setAttribute('aria-hidden','false')}
function renderMap(){markerLayer.clearLayers();if(routeLayer)routeLayer.remove();const visible=places.filter(p=>(p.day===selectedDay||p.id==='sannomiya')&&(category==='all'||p.type===category));visible.forEach(p=>L.marker([p.lat,p.lng],{icon:icon(p.type),title:p.name}).addTo(markerLayer).on('click',()=>openPlace(p)));const route=days[selectedDay].route.map(id=>{const p=places.find(x=>x.id===id);return[p.lat,p.lng]});routeLayer=L.polyline(route,{color:'#d64c3f',weight:4,opacity:.9,dashArray:'8 8'}).addTo(map);map.flyTo(days[selectedDay].center,days[selectedDay].zoom,{duration:.65})}
function renderSchedule(){const d=days[selectedDay];document.querySelector('#dayTitle').textContent=d.title;document.querySelector('#scheduleTitle').textContent=d.date;document.querySelector('#dayStatus').textContent=d.status;document.querySelector('#timeline').innerHTML=d.schedule.map(([time,title,note,id])=>`<div class="timeline-item"><span class="time">${time}</span><i class="timeline-dot"></i><div class="timeline-copy"><strong>${title}</strong><small>${note}</small></div><button class="route-button" data-place="${id}" aria-label="${title}への経路" title="経路を開く">↗</button></div>`).join('');document.querySelectorAll('.route-button').forEach(b=>b.addEventListener('click',()=>window.open(navUrl(places.find(p=>p.id===b.dataset.place)),'_blank','noopener')))}
document.querySelectorAll('.day-tab').forEach(b=>b.addEventListener('click',()=>{selectedDay=Number(b.dataset.day);document.querySelectorAll('.day-tab').forEach(x=>x.classList.toggle('active',x===b));renderMap();renderSchedule()}));
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));renderMap()}));
document.querySelector('#sheetClose').addEventListener('click',()=>{document.querySelector('#placeSheet').classList.remove('open');document.querySelector('#placeSheet').setAttribute('aria-hidden','true')});
document.querySelector('#locateButton').addEventListener('click',()=>map.locate({setView:true,maxZoom:14}));map.on('locationfound',e=>L.circleMarker(e.latlng,{radius:8,color:'#fff',weight:3,fillColor:'#3273a8',fillOpacity:1}).addTo(map).bindPopup('現在地').openPopup());map.on('locationerror',()=>alert('現在地を取得できませんでした。端末の位置情報設定を確認してください。'));
renderMap();renderSchedule();
