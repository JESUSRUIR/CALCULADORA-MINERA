const ids=['tonelaje','leyCu','leyAg','leyAu','h2o','merma','leyCuConc','alquiler','adelanto','cuPrice','agPrice','auPrice','pagableCu','deducCu','refCu','proteccion','pagableAg','deducAg','refAg','pagableAu','deducAu','refAu','maquila','analisis','traslado'];
const metaIds=['empresa','cliente','responsable','fechaDoc','observaciones'];
const KEY='minero-yachaq-historico';
const $=id=>document.getElementById(id);
const n=id=>parseFloat($(id).value)||0;
const f=(x,d=2)=>Number.isFinite(x)?x.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
const set=(id,v)=>$(id).textContent=v;
const today=new Date();
$('fechaDoc').value=today.toISOString().slice(0,10);

function prettyDate(value){
  const date=value?new Date(value+'T12:00:00'):new Date();
  return date.toLocaleDateString('es-PE',{day:'2-digit',month:'long',year:'numeric'});
}

function calc(){
  const tonelaje=n('tonelaje'),leyCu=n('leyCu'),leyAg=n('leyAg'),leyAu=n('leyAu'),cu=n('cuPrice'),ag=n('agPrice'),au=n('auPrice'),h2o=n('h2o'),merma=n('merma'),leyConc=n('leyCuConc'),dedCu=n('deducCu'),refCu=n('refCu'),prot=n('proteccion'),pagAg=n('pagableAg'),dedAg=n('deducAg'),refAg=n('refAg'),pagAu=n('pagableAu'),dedAu=n('deducAu'),refAu=n('refAu'),maquila=n('maquila'),analisis=n('analisis'),traslado=n('traslado'),alquiler=n('alquiler'),adelanto=n('adelanto');
  const tmh=tonelaje*leyCu*3.3/100;
  const tmns=tmh*(1-h2o/100)-tmh*merma/100;
  const contCu=(leyConc-dedCu)/100;
  const cuVal=contCu*1000*(cu-prot)/.45359;
  const contAg=leyAg*pagAg/100;
  const agVal=contAg*(ag-dedAg);
  const contAu=leyAu*pagAu/100;
  const auVal=contAu*(au-dedAu);
  const pago=cuVal+agVal+auVal;
  const ref=contCu*1000*refCu/.45359+contAg*refAg+contAu*refAu;
  const red=maquila+ref+(tmns?analisis/tmns:0)+(tmns?traslado/tmns:0);
  const tm=pago-red;
  const neto=tm*tmns*1.18*.9;
  const desc=alquiler*tonelaje+adelanto;
  const total=neto-desc;

  set('out_tmns',f(tmns));set('out_total',f(total));set('out_cu',f(cu));set('out_tm',f(tm));
  set('l_pago','$'+f(pago));set('l_red','$'+f(red));set('l_neto','$'+f(neto));set('l_desc','$'+f(desc));set('l_total',f(total));

  set('p_empresa',$('empresa').value||'Minero - Yachaq');
  set('p_cliente',$('cliente').value||'No especificado');
  set('p_responsable',$('responsable').value||'No especificado');
  set('p_fecha',prettyDate($('fechaDoc').value));
  set('p_observaciones',$('observaciones').value||'Sin observaciones.');
  set('p_total',f(total));set('p_ton',f(tonelaje)+' TM');set('p_tmns',f(tmns)+' TM');set('p_tm','$'+f(tm));
  set('p_cu_ley',f(leyConc)+' %');set('p_cu_price','$'+f(cu)+' /lb');set('p_cu_pay','$'+f(cuVal));
  set('p_ag_ley',f(leyAg)+' oz/tm');set('p_ag_price','$'+f(ag)+' /oz');set('p_ag_pay','$'+f(agVal));
  set('p_au_ley',f(leyAu)+' oz/tm');set('p_au_price','$'+f(au)+' /oz');set('p_au_pay','$'+f(auVal));
  set('p_pago','$'+f(pago));set('p_red','$'+f(red));set('p_neto','$'+f(neto));set('p_desc','$'+f(desc));set('p_grand',f(total));
  return{tonelaje,tmns,total,pago,red,neto,desc,tm};
}

const defaults={tonelaje:150,leyCu:2.2,leyAg:0,leyAu:0,h2o:10.1,merma:1,leyCuConc:25.23,alquiler:55,adelanto:0,cuPrice:6.29,agPrice:57.5,auPrice:4043.6,pagableCu:100,deducCu:1.35,refCu:.19,proteccion:.1,pagableAg:90,deducAg:2,refAg:1.2,pagableAu:90,deducAu:60,refAu:12,maquila:175,analisis:100,traslado:55};

document.querySelectorAll('input,textarea').forEach(el=>el.addEventListener('input',calc));

function enterPresentation(){
  calc();
  document.body.classList.add('presenting');
  $('presentBtn').classList.add('active');
  $('editBtn').classList.remove('active');
}
function leavePresentation(){
  document.body.classList.remove('presenting');
  $('editBtn').classList.add('active');
  $('presentBtn').classList.remove('active');
}
$('editBtn').onclick=leavePresentation;
$('presentBtn').onclick=enterPresentation;
$('presentFromEditBtn').onclick=enterPresentation;
$('returnEditBtn').onclick=leavePresentation;

$('resetBtn').onclick=()=>{
  Object.entries(defaults).forEach(([id,value])=>$(id).value=value);
  $('empresa').value='Minero - Yachaq';
  $('cliente').value='';
  $('responsable').value='';
  $('observaciones').value='';
  $('fechaDoc').value=new Date().toISOString().slice(0,10);
  calc();
};

function read(){
  try{
    const value=JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(value)?value:[];
  }catch{return[]}
}
function write(value){localStorage.setItem(KEY,JSON.stringify(value))}
function snapshot(){
  const values={};
  [...ids,...metaIds].forEach(id=>values[id]=$(id).value);
  return{id:crypto.randomUUID?.()||Date.now()+Math.random(),name:'',date:new Date().toISOString(),values,result:calc()};
}
function render(){
  let data=read();
  const q=$('searchInput').value.toLowerCase(),from=$('fromDate').value,to=$('toDate').value,sort=$('sortSelect').value;
  data=data.filter(x=>(!q||(x.name||'').toLowerCase().includes(q)||new Date(x.date).toLocaleString('es-PE').toLowerCase().includes(q))&&(!from||x.date.slice(0,10)>=from)&&(!to||x.date.slice(0,10)<=to));
  data.sort((a,b)=>sort==='old'?new Date(a.date)-new Date(b.date):sort==='high'?b.result.total-a.result.total:sort==='low'?a.result.total-b.result.total:new Date(b.date)-new Date(a.date));
  $('historyList').innerHTML='';
  $('empty').style.display=data.length?'none':'block';
  data.forEach(x=>{
    const el=document.createElement('article');
    el.className='history-item';
    el.innerHTML=`<div class="history-main"><div><div class="history-title">${x.name||'Cálculo sin nombre'}</div><div class="history-date">${new Date(x.date).toLocaleString('es-PE')}</div></div><div class="history-total">$${f(x.result.total)}</div></div><div class="history-details">Tonelaje: ${f(x.result.tonelaje)} TM · Seco: ${f(x.result.tmns)} TM</div><div class="history-actions"><button data-a="load" data-id="${x.id}">Cargar</button><button data-a="rename" data-id="${x.id}">Renombrar</button><button data-a="delete" data-id="${x.id}">Eliminar</button></div>`;
    $('historyList').appendChild(el);
  });
}
$('saveBtn').onclick=()=>{
  const item=snapshot();
  item.name=prompt('Nombre del cálculo:','Liquidación '+prettyDate($('fechaDoc').value))||'Cálculo sin nombre';
  const data=read();data.unshift(item);write(data);render();alert('Cálculo guardado correctamente.');
};
['searchInput','fromDate','toDate','sortSelect'].forEach(id=>$(id).addEventListener('input',render));
$('clearBtn').onclick=()=>{if(confirm('¿Borrar todo el histórico?')){localStorage.removeItem(KEY);render()}};
$('historyList').onclick=e=>{
  const b=e.target.closest('button');if(!b)return;
  const data=read(),item=data.find(x=>String(x.id)===b.dataset.id);
  if(b.dataset.a==='delete')write(data.filter(x=>String(x.id)!==b.dataset.id));
  if(b.dataset.a==='rename'&&item){item.name=prompt('Nuevo nombre:',item.name)||item.name;write(data)}
  if(b.dataset.a==='load'&&item){Object.entries(item.values).forEach(([id,value])=>$(id).value=value);calc()}
  render();
};
function download(name,data,type){
  const blob=new Blob([data],{type}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href);
}
$('exportBtn').onclick=()=>download('historico-calculos-minero.json',JSON.stringify(read(),null,2),'application/json');
$('importBtn').onclick=()=>$('fileInput').click();
$('fileInput').onchange=e=>{
  const file=e.target.files[0];if(!file)return;
  const r=new FileReader();
  r.onload=()=>{
    try{const data=JSON.parse(r.result);if(!Array.isArray(data))throw Error();write([...data,...read()]);render();alert('Histórico importado correctamente.')}
    catch{alert('El archivo no contiene un histórico JSON válido.')}
  };
  r.readAsText(file);
};

$('pdfBtn').onclick=()=>{
  calc();
  const jsPDF=window.jspdf?.jsPDF;
  if(!jsPDF){alert('No se pudo cargar el módulo PDF. Verifica tu conexión a internet.');return}
  const result=calc();
  const doc=new jsPDF({unit:'mm',format:'a4'});
  const pageW=210,margin=18;
  const empresa=$('empresa').value||'Minero - Yachaq';
  const cliente=$('cliente').value||'No especificado';
  const responsable=$('responsable').value||'No especificado';
  const fecha=prettyDate($('fechaDoc').value);
  const obs=$('observaciones').value||'Sin observaciones.';
  const money=v=>'$ '+f(v);
  const line=(y,label,value)=>{
    doc.setDrawColor(220,214,202);doc.line(margin,y,pageW-margin,y);
    doc.setTextColor(40,40,40);doc.setFont('helvetica','normal');doc.text(label,margin,y+7);
    doc.setFont('helvetica','bold');doc.text(value,pageW-margin,y+7,{align:'right'});
  };

  doc.setFillColor(22,34,29);doc.roundedRect(margin,margin,pageW-margin*2,67,5,5,'F');
  doc.setTextColor(174,190,180);doc.setFontSize(8);doc.setFont('helvetica','normal');doc.text('DOCUMENTO DE LIQUIDACIÓN MINERA',margin+8,margin+10);
  doc.setTextColor(255,255,255);doc.setFontSize(25);doc.setFont('helvetica','bold');doc.text(empresa,margin+8,margin+25);
  doc.setTextColor(240,185,59);doc.setFontSize(30);doc.text('USD $'+f(result.total),margin+8,margin+51);
  doc.setTextColor(170,185,175);doc.setFontSize(8);doc.setFont('helvetica','normal');doc.text('TOTAL A PAGAR',pageW-margin-8,margin+43,{align:'right'});
  doc.text(fecha,pageW-margin-8,margin+52,{align:'right'});

  let y=96;
  doc.setTextColor(30,30,30);doc.setFontSize(11);doc.setFont('helvetica','bold');doc.text('INFORMACIÓN DEL DOCUMENTO',margin,y);
  y+=8;doc.setFontSize(9);doc.setFont('helvetica','normal');
  doc.text('Cliente: '+cliente,margin,y);doc.text('Responsable: '+responsable,margin+95,y);
  y+=17;doc.setFont('helvetica','bold');doc.text('RESUMEN OPERATIVO',margin,y);y+=7;
  line(y,'Tonelaje',f(result.tonelaje)+' TM');y+=10;
  line(y,'Concentrado seco',f(result.tmns)+' TM');y+=10;
  line(y,'Pago por TMNS',money(result.tm));y+=17;

  doc.setFont('helvetica','bold');doc.text('VALORIZACIÓN DE METALES',margin,y);y+=7;
  line(y,'Cobre · ley '+f(n('leyCuConc'))+' %',money(result.pago));y+=10;
  line(y,'Plata y oro incluidos en el cálculo',money(0));y+=17;

  doc.setFont('helvetica','bold');doc.text('RESUMEN DE LIQUIDACIÓN',margin,y);y+=7;
  line(y,'Pago total por metales',money(result.pago));y+=10;
  line(y,'Reducciones',money(result.red));y+=10;
  line(y,'Valor neto + IGV - detracción',money(result.neto));y+=10;
  line(y,'Alquiler + adelanto',money(result.desc));y+=14;

  doc.setFillColor(251,243,217);doc.roundedRect(margin,y-3,pageW-margin*2,16,2,2,'F');
  doc.setTextColor(20,20,20);doc.setFont('helvetica','bold');doc.text('TOTAL A PAGAR',margin+5,y+7);doc.setTextColor(150,112,15);doc.text(money(result.total),pageW-margin-5,y+7,{align:'right'});
  y+=29;doc.setTextColor(80,80,80);doc.setFontSize(9);doc.setFont('helvetica','bold');doc.text('OBSERVACIONES',margin,y);y+=6;doc.setFont('helvetica','normal');
  const lines=doc.splitTextToSize(obs,pageW-margin*2);doc.text(lines,margin,y);
  y+=Math.max(12,lines.length*5+8);
  doc.setFontSize(8);doc.setTextColor(110,110,110);doc.text('Documento generado con fines de referencia. No sustituye la liquidación oficial de planta.',margin,y);
  doc.save('liquidacion-minera-'+new Date().toISOString().slice(0,10)+'.pdf');
};

calc();
render();
