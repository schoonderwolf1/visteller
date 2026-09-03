/* Visdata, illustraties en kleine helpers. Puur functioneel, geen state. */

const VISSEN = [
{n:'Baars', lat:'Perca fluviatilis', foto:'./photos/baars.webp',
 vorm:{top:20,bot:14,px:32,pw:6,ft:20,fh:14,head:.30,kop:1,snout:.14,bx:50,mond:.5,mondK:3,
   dorsaal:[[30,56,15,'stekel'],[60,86,10,'zacht']], aars:[[68,86,9]], pect:[36,-2,13,7]},
 kl:{b:'#7A9440',b2:'#5A7430',bu:'#EDE7C0',f:'#E2703A',s:'#3B4F1E'}, patroon:'strepen', pc:'#3A4A1C',
 oog:{r:5.2,kl:'#E8B23A'},
 max:40, feit:{groot:'tot 40 cm',eet:'kleine visjes, wormen en waterinsecten',
   waar:'sloten, kanalen, plassen — graag bij rietkragen en steigers',
   wist:'Zijn eerste rugvin heeft echte stekels. Baarzen jagen samen in groepjes.'}},
{n:'Snoek', lat:'Esox lucius', foto:'./photos/snoek.webp',
 vorm:{top:11,bot:9,px:52,pw:5,ft:18,fh:11,head:.38,kop:.5,snout:.04,bx:62,mond:.92,mondK:1.6,oogX:.5,oogY:.55,
   dorsaal:[[70,92,12,'zacht']], aars:[[72,92,10]], pect:[34,-1,11,6]},
 kl:{b:'#5F7E48',b2:'#44603A',bu:'#E6EBC8',f:'#8B9A50',s:'#33461F'}, patroon:'bonen', pc:'#D8E5A6',
 oog:{r:4.2,kl:'#E0C24A'},
 max:130, feit:{groot:'tot 130 cm — langer dan jij!',eet:'andere vissen, soms een kikker',
   waar:'stil water tussen de waterplanten',
   wist:'Hij ligt roerloos stil en schiet er dan bliksemsnel op af. Pas op: heel scherpe tandjes.'}},
{n:'Snoekbaars', lat:'Sander lucioperca', foto:'./photos/snoekbaars.webp',
 vorm:{top:13,bot:11,px:38,pw:5,ft:19,fh:12,head:.34,kop:.72,snout:.08,bx:56,mond:.7,mondK:2.2,oogX:.46,oogY:.5,
   dorsaal:[[30,58,12,'stekel'],[62,88,9,'zacht']], aars:[[68,88,9]], pect:[35,-1,11,6]},
 kl:{b:'#ADAD84',b2:'#8C8C68',bu:'#F1F1E4',f:'#93936B',s:'#65654A'}, patroon:'strepen', pc:'#78784E',
 oog:{r:5.4,kl:'#DFD9B0'},
 max:90, feit:{groot:'tot 90 cm',eet:'vooral visjes',
   waar:'diep, troebel water in kanalen en rivieren',
   wist:'Zijn ogen glinsteren als van een kat: hij ziet uitstekend in het donker en jaagt in de schemer.'}},
{n:'Blankvoorn', lat:'Rutilus rutilus', foto:'./photos/blankvoorn.webp',
 vorm:{top:15,bot:13,px:36,pw:6,ft:19,fh:13,head:.26,kop:1.05,snout:.16,bx:52,mond:.42,mondK:2.4,
   dorsaal:[[42,62,13,'zacht']], aars:[[64,80,9]], pect:[32,0,11,6]},
 kl:{b:'#C9D3D9',b2:'#A5B2BA',bu:'#F7F9FA',f:'#C0483A',s:'#7A868C'}, patroon:'schubben', pc:'#9AA6AC',
 oog:{r:5,kl:'#D9563E'},
 max:35, feit:{groot:'tot 35 cm',eet:'insectjes, slakjes en waterplantjes',
   waar:'bijna overal — de vis die je het vaakst vangt',
   wist:'Rode oogjes en rode buikvinnen. Ze zwemmen in grote scholen van honderden vissen.'}},
{n:'Ruisvoorn', lat:'Scardinius erythrophthalmus', foto:'./photos/ruisvoorn.webp',
 vorm:{top:17,bot:15,px:38,pw:6,ft:19,fh:14,head:.25,kop:1.05,snout:.3,bx:52,mond:.4,mondK:-1.4,oogY:.44,
   dorsaal:[[48,66,13,'zacht']], aars:[[66,82,9]], pect:[32,0,11,6]},
 kl:{b:'#DDB151',b2:'#B98D33',bu:'#F8E7BC',f:'#C63A2A',s:'#8E6E28'}, patroon:'schubben', pc:'#B08830',
 oog:{r:4.8,kl:'#E0C24A'},
 max:40, feit:{groot:'tot 40 cm',eet:'insecten die op het water vallen, en plantjes',
   waar:'ondiep, plantenrijk water',
   wist:'Zijn mondje wijst naar boven, want hij eet van het wateroppervlak. Zijn vinnen zijn vuurrood.'}},
{n:'Karper', lat:'Cyprinus carpio', foto:'./photos/karper.webp',
 vorm:{top:18,bot:17,px:36,pw:9,ft:19,fh:15,head:.30,kop:.92,snout:.06,bx:54,mond:.45,mondK:3.6,oogY:.34,
   dorsaal:[[38,74,9,'zacht']], aars:[[78,92,9]], pect:[32,1,13,7]},
 kl:{b:'#C08B3E',b2:'#9A6C2A',bu:'#EFD9A8',f:'#8A6A33',s:'#6F4E1B'}, patroon:'grofschub', pc:'#8E6524',
 oog:{r:4.4,kl:'#C8A24A'}, baard:1,
 max:100, feit:{groot:'tot 100 cm en zwaarder dan jij',eet:'slakjes, wormen en mosseltjes van de bodem',
   waar:'plassen, sloten en vijvers',
   wist:'Met twee baarddraadjes bij zijn mond voelt hij eten in de modder. Een karper kan 40 jaar oud worden.'}},
{n:'Brasem', lat:'Abramis brama', foto:'./photos/brasem.webp',
 vorm:{top:26,bot:24,px:34,pw:6,ft:20,fh:16,head:.23,kop:1.15,snout:.1,bx:50,mond:.4,mondK:3,oogY:.3,
   dorsaal:[[54,70,17,'zacht']], aars:[[54,92,15]], pect:[31,2,15,7]},
 kl:{b:'#AFA79C',b2:'#8E8579',bu:'#EEEAE2',f:'#6E6A66',s:'#66605A'}, patroon:'schubben', pc:'#8F8779',
 oog:{r:4.2,kl:'#C9C2B4'},
 max:70, feit:{groot:'tot 70 cm',eet:'zuigt kleine diertjes uit de modder',
   waar:'troebel, dieper water in kanalen en meren',
   wist:'Heel hoog en zo plat als een pannenkoek. Zijn aarsvin is extra lang.'}},
{n:'Kolblei', lat:'Blicca bjoerkna', foto:'./photos/kolblei.webp',
 vorm:{top:22,bot:21,px:34,pw:6,ft:19,fh:15,head:.23,kop:1.12,snout:.12,bx:50,mond:.4,mondK:2.8,oogY:.32,
   dorsaal:[[52,68,16,'zacht']], aars:[[54,90,13]], pect:[31,2,14,7]},
 kl:{b:'#C7CED3',b2:'#A3ADB4',bu:'#F3F6F7',f:'#8E9BA2',s:'#79838A'}, patroon:'schubben', pc:'#A5AFB5',
 oog:{r:6,kl:'#E2E7EA'},
 max:35, feit:{groot:'tot 35 cm',eet:'kleine bodemdiertjes',
   waar:'kanalen en sloten, vaak samen met brasems',
   wist:'Lijkt op een brasem, maar heeft veel grotere ogen en oranje plekjes waar de vinnen beginnen.'}},
{n:'Zeelt', lat:'Tinca tinca', foto:'./photos/zeelt.webp',
 vorm:{top:16,bot:15,px:40,pw:6.5,ft:15,fh:14,rondstaart:1,head:.27,kop:.95,snout:.12,bx:56,mond:.4,mondK:2.6,oogY:.34,
   dorsaal:[[48,66,11,'rond']], aars:[[70,86,9,'rond']], pect:[34,1,12,8]},
 kl:{b:'#5A7434',b2:'#40561F',bu:'#C9CE7E',f:'#42582A',s:'#2F4118'}, patroon:'fijn', pc:'#43571F',
 oog:{r:3.2,kl:'#C6452C'}, baard:.6,
 max:60, feit:{groot:'tot 60 cm',eet:'slakjes en insectenlarven van de bodem',
   waar:'dichtbegroeide, warme sloten en vijvers',
   wist:'Piepklein rood oogje en dikke ronde vinnen. Hij zit onder een laag slijm, dus hij glibbert weg.'}},
{n:'Paling', lat:'Anguilla anguilla', foto:'./photos/paling.webp',
 vorm:{aal:1},
 kl:{b:'#44543F',b2:'#2E3A2C',bu:'#D9CF88',f:'#3D4C40',s:'#222C24'},
 oog:{r:3.4,kl:'#D8CE8C'},
 max:120, feit:{groot:'tot 120 cm',eet:'wormen, visjes en kreeftjes — vooral \'s nachts',
   waar:'in de modder van sloten, kanalen en rivieren',
   wist:'Palingen worden geboren in de zee bij Amerika en zwemmen duizenden kilometers naar Nederland.'}},
{n:'Winde', lat:'Leuciscus idus', foto:'./photos/winde.webp',
 vorm:{top:14,bot:12,px:38,pw:6,ft:19,fh:13,head:.27,kop:1,snout:.14,bx:54,mond:.42,mondK:2.4,
   dorsaal:[[44,64,12,'zacht']], aars:[[66,84,9]], pect:[33,0,11,6]},
 kl:{b:'#BCC8CE',b2:'#98A5AC',bu:'#F2F5F6',f:'#D9B551',s:'#7A858B'}, patroon:'schubben', pc:'#9DA9AF',
 oog:{r:4.6,kl:'#D6C777'},
 max:70, feit:{groot:'tot 70 cm',eet:'insecten, slakken en kleine visjes',
   waar:'stromend water: grote rivieren en de IJssel',
   wist:'Een snelle zwemmer met gelige vinnen. Aan de hengel vecht hij hard.'}},
{n:'Alver', lat:'Alburnus alburnus', foto:'./photos/alver.webp',
 vorm:{top:11,bot:10,px:38,pw:5,ft:16,fh:10,head:.26,kop:1,snout:.24,bx:54,mond:.38,mondK:-1,oogY:.42,
   dorsaal:[[46,62,11,'zacht']], aars:[[64,80,9]], pect:[32,0,10,5]},
 kl:{b:'#D5DDE0',b2:'#B4BEC3',bu:'#FAFBFC',f:'#B6C0C4',s:'#8A9498'}, patroon:'schubben', pc:'#AEB8BD',
 oog:{r:4.4,kl:'#DCE2E4'},
 max:15, feit:{groot:'tot 15 cm — een kleintje',eet:'insectjes aan het wateroppervlak',
   waar:'in de bovenste laag van rivieren en havens',
   wist:'Hij glinstert als zilverpapier en springt soms uit het water. Snoeken vinden hem heerlijk.'}}
];

const GRIJS = {b:'#D3DEDB',b2:'#C0CFCB',bu:'#EAF1EF',f:'#C8D6D2',s:'#A9BCB8'};

const BADGES = [
{id:'v1',teken:'1',kl:'#F0A81E',label:'Je eerste vis'},
{id:'v10',teken:'10',kl:'#F0A81E',label:'10 vissen gevangen'},
{id:'v25',teken:'25',kl:'#F0A81E',label:'25 vissen gevangen'},
{id:'v50',teken:'50',kl:'#F0A81E',label:'50 vissen gevangen'},
{id:'s3',teken:'3',kl:'#2F7D4F',label:'3 verschillende soorten'},
{id:'s5',teken:'5',kl:'#2F7D4F',label:'5 verschillende soorten'},
{id:'s12',teken:'12',kl:'#2F7D4F',label:'Alle 12 soorten!'},
{id:'snoek',teken:'Sn',kl:'#D9482F',label:'Je eerste snoek'},
{id:'groot',teken:'40',kl:'#D9482F',label:'Een vis van 40 cm of meer'},
{id:'dag3',teken:'3d',kl:'#1E7A8C',label:'3 keer gaan vissen'},
{id:'plek3',teken:'3p',kl:'#1E7A8C',label:'3 visplekken ontdekt'}
];

/* ---------- tekenen ---------- */
const L = 100;
function vloei(P){
  const n=P.length; let d='M'+P[0][0].toFixed(1)+','+P[0][1].toFixed(1);
  for(let i=0;i<n;i++){
    const p0=P[(i-1+n)%n],p1=P[i],p2=P[(i+1)%n],p3=P[(i+2)%n];
    const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6];
    const c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
    d+='C'+c1[0].toFixed(1)+','+c1[1].toFixed(1)+' '+c2[0].toFixed(1)+','+c2[1].toFixed(1)+' '+p2[0].toFixed(1)+','+p2[1].toFixed(1);
  }
  return d+'Z';
}
function punten(v){
  const top=v.top,bot=v.bot,px=v.px,pw=v.pw,hx=(v.head||.28)*L,kop=v.kop==null?1:v.kop,
    sn=v.snout==null?.12:v.snout,bx=v.bx==null?px+12:v.bx,ach=L-px;
  return [[0,-top*sn],[hx*.34,-top*.42*kop],[hx*.92,-top*.80*kop],[px,-top],
    [px+ach*.34,-top*.86],[px+ach*.70,-(top*.40+pw*.45)],[L-4,-pw*1.05],[L,-pw],
    [L,pw],[L-4,pw*1.05],[px+ach*.70,bot*.40+pw*.45],[px+ach*.34,bot*.84],
    [bx,bot],[hx*.92,bot*.76],[hx*.32,bot*.40],[0,top*sn*.7]];
}
function opRomp(v,x,onder){
  const P=punten(v).filter(p=>onder?p[1]>=0:p[1]<=0).sort((a,b)=>a[0]-b[0]);
  for(let i=0;i<P.length-1;i++){
    if(x>=P[i][0]&&x<=P[i+1][0]){
      const t=(x-P[i][0])/(P[i+1][0]-P[i][0]||1);
      return P[i][1]+(P[i+1][1]-P[i][1])*t;
    }
  }
  return onder?v.pw:-v.pw;
}
function staartPad(v){
  const pw=v.pw,ft=v.ft,fh=v.fh,x=L-2;
  if(v.rondstaart) return 'M'+x+','+(-pw)+' C'+(x+ft*1.35)+','+(-fh)+' '+(x+ft*1.35)+','+fh+' '+x+','+pw+' Z';
  return 'M'+x+','+(-pw)
   +'C'+(x+ft*.35)+','+(-pw*1.35)+' '+(x+ft*.72)+','+(-fh*.72)+' '+(x+ft)+','+(-fh)
   +'C'+(x+ft*.66)+','+(-fh*.34)+' '+(x+ft*.46)+','+(-fh*.14)+' '+(x+ft*.36)+',0'
   +'C'+(x+ft*.46)+','+(fh*.14)+' '+(x+ft*.66)+','+(fh*.34)+' '+(x+ft)+','+fh
   +'C'+(x+ft*.72)+','+(fh*.72)+' '+(x+ft*.35)+','+(pw*1.35)+' '+x+','+pw+' Z';
}
function vinPad(v,x0,x1,h,onder,srt){
  const r=onder?1:-1,y0=opRomp(v,x0,onder),y1=opRomp(v,x1,onder),w=x1-x0;
  const yt=((y0+y1)/2)+r*h;
  if(srt==='rond') return 'M'+x0+','+y0+' C'+(x0+w*.1)+','+(yt*1.05)+' '+(x1-w*.1)+','+(yt*1.05)+' '+x1+','+y1+' Z';
  if(srt==='stekel'){
    let d='M'+x0+','+y0.toFixed(1),n=7;
    for(let i=0;i<=n;i++){
      const t=i/n,x=x0+w*t;
      const env=Math.pow(Math.sin(Math.PI*(.18+.78*t)),.6);
      const y=((y0+y1)/2)+r*h*env*(i%2?.78:1);
      d+=' L'+x.toFixed(1)+','+y.toFixed(1);
    }
    return d+' L'+x1+','+y1.toFixed(1)+' Z';
  }
  return 'M'+x0+','+y0+' C'+(x0+w*.25)+','+yt+' '+(x1-w*.35)+','+(yt*.82)+' '+x1+','+y1+' Z';
}
function tekenVis(f,i,sleutel,grijs){
  const k=grijs?GRIJS:f.kl, id='g'+i+(sleutel||'')+(grijs?'q':'');
  const oogKl=grijs?'#C8D6D2':f.oog.kl, pupil=grijs?'#A9BCB8':'#111C1A';
  const grad='<linearGradient id="v'+id+'" x1="0" y1="0" x2="0" y2="1">'
    +'<stop offset="0" stop-color="'+k.b2+'"/><stop offset=".46" stop-color="'+k.b+'"/>'
    +'<stop offset=".70" stop-color="'+k.bu+'"/><stop offset="1" stop-color="'+k.bu+'"/></linearGradient>';

  if(f.vorm.aal){
    return '<svg viewBox="-8 -30 232 60" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:100%;max-width:100%;max-height:100%" role="img" aria-label="Paling">'
      +'<defs>'+grad+'</defs>'
      +'<path d="M46,-8 C92,-26 128,14 198,3" fill="none" stroke="'+k.f+'" stroke-width="17" stroke-linecap="round" opacity=".8"/>'
      +'<path d="M46,-8 C92,-26 128,14 198,3" fill="none" stroke="'+k.s+'" stroke-width="17" stroke-linecap="round" opacity=".35"/>'
      +'<path d="M6,-11 C42,-20 62,-3 98,-12 C134,-21 152,9 198,1" fill="none" stroke="'+k.s+'" stroke-width="22" stroke-linecap="round"/>'
      +'<path d="M6,-11 C42,-20 62,-3 98,-12 C134,-21 152,9 198,1" fill="none" stroke="url(#v'+id+')" stroke-width="17" stroke-linecap="round"/>'
      +'<path d="M10,-6 C44,-14 64,2 100,-7 C135,-15 153,13 196,5" fill="none" stroke="'+k.bu+'" stroke-width="5" stroke-linecap="round" opacity=".75"/>'
      +'<path d="M16,-5 C12,-1 12,3 17,7" fill="none" stroke="'+k.s+'" stroke-width="1.8" opacity=".5"/>'
      +'<path d="M1,-5 C-4,-3 -4,1 2,2" fill="none" stroke="'+k.s+'" stroke-width="2.2" stroke-linecap="round"/>'
      +'<circle cx="10" cy="-12" r="'+f.oog.r+'" fill="'+oogKl+'" stroke="'+k.s+'" stroke-width="1.4"/>'
      +'<circle cx="10" cy="-12" r="1.6" fill="'+pupil+'"/></svg>';
  }

  const v=f.vorm, body=vloei(punten(v)), hx=(v.head||.28)*L;
  let vinnen='';
  (v.dorsaal||[]).forEach(a=>{vinnen+='<path d="'+vinPad(v,a[0],a[1],a[2]*1.35,0,a[3])+'" fill="'+k.f+'" stroke="'+k.s+'" stroke-width="1.7" stroke-linejoin="round"/>'});
  (v.aars||[]).forEach(a=>{vinnen+='<path d="'+vinPad(v,a[0],a[1],a[2]*1.3,1,a[3])+'" fill="'+k.f+'" stroke="'+k.s+'" stroke-width="1.7" stroke-linejoin="round"/>'});
  const bx0=hx+6,bx1=hx+18,bh=v.bot*.5;
  const buik='<path d="'+vinPad(v,bx0,bx1,bh,1,'zacht')+'" fill="'+k.f+'" stroke="'+k.s+'" stroke-width="1.5" opacity=".95"/>';

  let pat='';
  if(!grijs){
    if(f.patroon==='strepen')
      pat=[.20,.32,.44,.56,.68,.80].map(t=>{const x=L*t;
        return '<path d="M'+x+',-42 L'+(x+4)+',-42 L'+(x-2)+',42 L'+(x-6)+',42 Z" fill="'+f.pc+'" opacity=".38"/>'}).join('');
    if(f.patroon==='bonen')
      pat=[[30,-5],[42,4],[52,-7],[56,6],[66,-3],[70,8],[78,-6],[82,4],[90,-1],[38,-11],[62,-12],[86,-9]]
        .map(p=>'<ellipse cx="'+p[0]+'" cy="'+p[1]+'" rx="5.2" ry="3" fill="'+f.pc+'" opacity=".6" transform="rotate(-10 '+p[0]+' '+p[1]+')"/>').join('');
    if(f.patroon==='schubben'||f.patroon==='grofschub'||f.patroon==='fijn'){
      const st=f.patroon==='grofschub'?10:(f.patroon==='fijn'?4.5:7);
      for(let x=hx*.8;x<L;x+=st) for(let y=-34;y<34;y+=st*.85)
        pat+='<path d="M'+x.toFixed(1)+','+y+' q'+(st*.5).toFixed(1)+','+(st*.42).toFixed(1)+' 0,'+(st*.85).toFixed(1)+'" fill="none" stroke="'+f.pc+'" stroke-width="'+(f.patroon==='grofschub'?1.3:.85)+'" opacity="'+(f.patroon==='fijn'?.25:.4)+'"/>';
    }
  }

  const oy=-v.top*(v.oogY==null?.40:v.oogY), ox=hx*(v.oogX==null?.42:v.oogX);
  const mondL=v.mond==null?hx*.42:hx*v.mond;
  const mond='<path d="M-0.5,'+(-v.top*(v.snout==null?.12:v.snout)*.2)+' C'+(mondL*.4)+','+(v.mondK||2.5)+' '+(mondL*.8)+','+((v.mondK||2.5)*1.2)+' '+mondL+','+((v.mondK||2.5)*.9)+'" fill="none" stroke="'+k.s+'" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>';
  const kieuw='<path d="M'+hx+','+(opRomp(v,hx,0)+1)+' C'+(hx-4)+','+(oy*.4)+' '+(hx-4)+','+(-oy*.5)+' '+(hx+1.5)+','+(opRomp(v,hx,1)-1)+'" fill="none" stroke="'+k.s+'" stroke-width="1.6" opacity=".45"/>';
  const baard=f.baard?
    '<path d="M'+(hx*.28)+',3.5 C'+(hx*.1)+','+(9*f.baard)+' '+(hx*.05)+','+(14*f.baard)+' '+(hx*.22)+','+(18*f.baard)+'" fill="none" stroke="'+k.s+'" stroke-width="1.7" stroke-linecap="round"/>'
   +'<path d="M'+(hx*.45)+',4.5 C'+(hx*.3)+','+(11*f.baard)+' '+(hx*.28)+','+(16*f.baard)+' '+(hx*.45)+','+(20*f.baard)+'" fill="none" stroke="'+k.s+'" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>':'';
  const pl=(v.pect?v.pect[2]:13)*.82, pd=(v.pect?v.pect[3]:8)*.85, pxx=hx+2.5;
  const pect='<path d="M'+pxx+',-1 C'+(pxx+pl*.55)+','+(pd*.35)+' '+(pxx+pl)+','+(pd*.9)+' '+(pxx+pl*.75)+','+(pd*1.5)
    +' C'+(pxx+pl*.3)+','+(pd*1.1)+' '+(pxx+pl*.05)+','+(pd*.5)+' '+pxx+',-1 Z" fill="'+k.f+'" fill-opacity=".75" stroke="'+k.s+'" stroke-width="1.3" opacity=".9"/>';

  const dv=(v.dorsaal||[]).map(a=>Math.abs((opRomp(v,a[0],0)+opRomp(v,a[1],0))/2)+a[2]*1.35);
  const av=(v.aars||[]).map(a=>Math.abs((opRomp(v,a[0],1)+opRomp(v,a[1],1))/2)+a[2]*1.3);
  const hoog=Math.max.apply(null,[v.top,v.fh].concat(dv))+3;
  const laag=Math.max.apply(null,[v.bot,v.fh,v.bot*.5+bh].concat(av))+3;
  const sc=.74+.26*Math.sqrt(f.max/130);
  const bw=L+v.ft+8, bh2=hoog+laag;
  const mx=(bw/sc-bw)/2, my=(bh2/sc-bh2)/2;
  const vb=(-6-mx).toFixed(1)+' '+(-hoog-my).toFixed(1)+' '+(bw+mx*2).toFixed(1)+' '+(bh2+my*2).toFixed(1);

  return '<svg viewBox="'+vb+'" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:100%;max-width:100%;max-height:100%" role="img" aria-label="'+f.n+'">'
   +'<defs>'+grad+'<clipPath id="c'+id+'"><path d="'+body+'"/></clipPath></defs>'
   +'<path d="'+staartPad(v)+'" fill="'+k.f+'" stroke="'+k.s+'" stroke-width="1.8" stroke-linejoin="round"/>'
   +vinnen+buik
   +'<path d="'+body+'" fill="url(#v'+id+')"/>'
   +'<g clip-path="url(#c'+id+')">'+pat+'</g>'
   +'<path d="'+body+'" fill="none" stroke="'+k.s+'" stroke-width="2.3" stroke-linejoin="round"/>'
   +pect+kieuw+mond+baard
   +'<circle cx="'+ox.toFixed(1)+'" cy="'+oy.toFixed(1)+'" r="'+f.oog.r+'" fill="'+oogKl+'" stroke="'+k.s+'" stroke-width="1.5"/>'
   +'<circle cx="'+ox.toFixed(1)+'" cy="'+oy.toFixed(1)+'" r="'+(f.oog.r*.44).toFixed(1)+'" fill="'+pupil+'"/>'
   +'<circle cx="'+(ox-f.oog.r*.3).toFixed(1)+'" cy="'+(oy-f.oog.r*.35).toFixed(1)+'" r="'+(f.oog.r*.2).toFixed(1)+'" fill="#fff" opacity=".9"/></svg>';
}

/* ---------- hulp ---------- */
function vandaagStr(){const d=new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function langeDag(s){
  const v=vandaagStr();
  if(s===v) return 'Vandaag';
  const d=new Date(s+'T00:00:00');
  return d.toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long'});
}
function korteDag(s){return new Date(s+'T00:00:00').toLocaleDateString('nl-NL',{day:'numeric',month:'short'})}
function vinden(n){return VISSEN.find(f=>f.n===n)}
function afstand(a,b){
  const R=6371000, r=Math.PI/180;
  const dl=(b.lat-a.lat)*r, dn=(b.lon-a.lon)*r, m=(a.lat+b.lat)/2*r;
  const x=dn*Math.cos(m);
  return Math.sqrt(dl*dl+x*x)*R;
}
function badgesUit(vangsten,plekken){
  const uit={};
  const n=vangsten.length;
  const soorten={}; vangsten.forEach(v=>soorten[v.soort]=1);
  const ns=Object.keys(soorten).length;
  const dagen={}; vangsten.forEach(v=>dagen[v.datum]=1);
  if(n>=1)uit.v1=1; if(n>=10)uit.v10=1; if(n>=25)uit.v25=1; if(n>=50)uit.v50=1;
  if(ns>=3)uit.s3=1; if(ns>=5)uit.s5=1; if(ns>=12)uit.s12=1;
  if(soorten['Snoek'])uit.snoek=1;
  if(vangsten.some(v=>v.lengte&&v.lengte>=40))uit.groot=1;
  if(Object.keys(dagen).length>=3)uit.dag3=1;
  if(plekken.length>=3)uit.plek3=1;
  return uit;
}
