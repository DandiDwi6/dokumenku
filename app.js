// ===== Penghubung ke Apps Script (menggantikan google.script.run) =====
var KEY=localStorage.getItem('vk')||prompt('Masukkan kunci akses')||'';
localStorage.setItem('vk',KEY);
function mk(ok,er){return new Proxy({},{get:function(_,k){
  if(k=='withSuccessHandler')return function(f){return mk(f,er)};
  if(k=='withFailureHandler')return function(f){return mk(ok,f)};
  return function(){
    var a=[].slice.call(arguments);
    fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({key:KEY,fn:k,args:a})})
      .then(function(r){return r.json()})
      .then(function(j){if(j.error)throw new Error(j.error);if(ok)ok(j.data)})
      .catch(function(e){if(/kunci/i.test(e.message)){localStorage.removeItem('vk');localStorage.removeItem('dc')}if(er)er(e);else console.error(e)});
  }}})}
var google={script:{run:mk()}};
// ===== Ikon =====
var IC={dash:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
vendor:'<path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 9h5a1 1 0 0 1 1 1v11M2 21h20M8 8h2M8 12h2M8 16h2"/>',
project:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
year:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
dl:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
doc:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
edit:'<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
warn:'<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17.5v.5"/>'};
function ic(p,z){z=z||20;return '<svg viewBox="0 0 24 24" width="'+z+'" height="'+z+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+IC[p]+'</svg>'}
function dlb(u){var m=String(u||'').match(/\/d\/([-\w]+)/)||String(u||'').match(/[?&]id=([-\w]+)/);return m?'<a class="x" title="Unduh" href="https://drive.google.com/uc?export=download&amp;id='+m[1]+'" onclick="event.stopPropagation()">'+ic('dl',16)+'</a>':''}
// ===== Aplikasi =====
var D,V='dash',CH=false,FILES=[],ST={Vendor:['Aktif','Nonaktif'],Project:['Berjalan','Selesai','Ditunda']};
function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function rp(n){return 'Rp '+Number(n||0).toLocaleString('id-ID')}
function dd(s){return Math.round((new Date(s)-new Date(new Date().toDateString()))/864e5)}
function bd(s){return s?'<span class="bd '+esc(s)+'">'+esc(s)+'</span>':''}
function vn(id){var v=D.vendor.find(function(x){return x.ID==id});return v?v.Nama:'-'}
function vOf(pid){return D.pv.filter(function(x){return x.ProjectID==pid}).map(function(x){return D.vendor.find(function(v){return v.ID==x.VendorID})}).filter(Boolean)}
function pOf(vid){return D.pv.filter(function(x){return x.VendorID==vid}).map(function(x){return D.project.find(function(p){return p.ID==x.ProjectID})}).filter(Boolean)}
function exp(s){if(!s)return '';var d=dd(s);return d<0?'<span class="bd rd">Kedaluwarsa</span>':d<=60?'<span class="bd Ditunda">'+d+' hari lagi</span>':esc(s)}
function tbl(h,r,m){return r.length?'<div class="tw"><table><tr>'+h.map(function(x){return '<th>'+x+'</th>'}).join('')+'</tr>'+r.map(function(x){return '<tr'+(x[0]?' onclick="'+x[0]+'"':'')+'>'+x.slice(1).map(function(c,i){return '<td data-label="'+h[i]+'">'+c+'</td>'}).join('')+'</tr>'}).join('')+'</table></div>':'<div class="empty">'+(m||'Belum ada data')+'</div>'}
function load(fresh){var c=null;if(!fresh){try{c=JSON.parse(localStorage.getItem('dc'))}catch(e){}}
  if(c&&c.vendor){D=c;render()}else $('app').innerHTML='<div class="ld"><div class="sp"></div>Memuat data…</div>';
  google.script.run.withSuccessHandler(function(d){D=d;try{localStorage.setItem('dc',JSON.stringify(d))}catch(e){}render()}).withFailureHandler(function(e){if(D&&c)return;var f=/fetch|network/i.test(e.message);$('app').innerHTML='<div class="ld"><b>'+(f?'Tidak bisa terhubung ke server':'Gagal memuat')+'</b><br>'+(f?'Periksa koneksi internet atau DNS, lalu coba lagi.':esc(e.message))+'<br><br><button class="btn" onclick="load()">Coba lagi</button></div>'}).getData()}
var FL='',LIM=50;
function go(v,f){V=v;FL=f||'';LIM=50;if(v=='doc')DF={j:'',v:'',s:FL,k:'',g:DF.g};$('q').value='';render()}
function fbar(){return FL?'<div class="chips"><a class="chip on" onclick="go(V)">Filter: '+FL+' ✕</a></div>':''}
function render(){
  if(!D)return;var q=$('q').value.trim().toLowerCase();
  $('nav').innerHTML=[['dash','Dashboard',ic('dash')],['vendor','Vendor',ic('vendor')],['project','Project',ic('project')],['doc','Dokumen',ic('doc')],['year','Per Tahun',ic('year')]].map(function(x){return '<a class="'+(V==x[0]&&!q?'on':'')+'" onclick="go(\''+x[0]+'\')">'+'<span class="ni">'+x[2]+'</span>'+x[1]+'</a>'}).join('');
  $('app').innerHTML=q?srch(q):({dash:dash,vendor:vlist,project:plist,doc:dlist,year:year})[V]()}
function pn(t,s,n,b,c,i){return '<div class="pn"'+(i?' id="'+i+'"':'')+'><div class="ph"><div><h3>'+t+'</h3><small>'+s+'</small></div><span class="cnt '+(c||'')+'">'+n+'</span></div>'+b+'</div>'}
function pc(p){return ['det(\''+'Project'+'\',\''+p.ID+'\')',esc(p.Nama),esc(vOf(p.ID).map(function(v){return v.Nama}).join(', ')||'-'),esc(p.Tenggat||'-'),bd(p.Status)]}
function dash(){
  var pj=D.project.filter(function(p){return p.Status=='Berjalan'}),
  ex=D.dok.filter(function(d){return d.BerlakuSampai&&dd(d.BerlakuSampai)<=60}).sort(function(a,b){return a.BerlakuSampai<b.BerlakuSampai?-1:1}),
  tg=pj.filter(function(p){return p.Tenggat&&dd(p.Tenggat)<=30}).sort(function(a,b){return a.Tenggat<b.Tenggat?-1:1}),
  card=function(i,c,l,v,a){return '<div class="cd lk" onclick="'+a+'"><div class="ico '+c+'">'+i+'</div><div><small>'+l+'</small><div class="big">'+v+'</div></div></div>'},
  hari=new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  return '<div class="pt"><h2>Dashboard</h2><p>'+hari+'</p></div><div class="gr">'
  +card(ic('vendor',24),'blue','Vendor aktif',D.vendor.filter(function(v){return v.Status!='Nonaktif'}).length,"go('vendor','Aktif')")
  +card(ic('project',24),'green','Project berjalan',pj.length,"go('project','Berjalan')")
  +card(ic('warn',24),'red','Dokumen perlu perhatian',ex.length,"go('doc','perlu')")+'</div><div class="cols">'
  +pn('Dokumen perlu perhatian','Kedaluwarsa atau berakhir dalam 60 hari',ex.length,tbl(['Dokumen','Terkait','Berlaku sampai'],ex.map(function(d){return ['ddet(\''+d.ID+'\')',esc(d.Nama),terkait(d),exp(d.BerlakuSampai)]}),'Semua dokumen masih aman'),ex.length?'red':'','pdok')
  +pn('Project mendekati tenggat','Project berjalan dengan tenggat dalam 30 hari',tg.length,tbl(['Project','Vendor','Tenggat','Status'],tg.map(pc),'Tidak ada tenggat dalam waktu dekat'),tg.length?'red':'')
  +'</div>'+pn('Project terbaru','5 project terakhir yang ditambahkan',D.project.length+' total',tbl(PH,D.project.slice(-5).reverse().map(pRow),'Belum ada project'))}
function show(h){$('modal').innerHTML='<div class="mb" onclick="if(event.target==this)cl()"><div class="mc">'+h+'</div></div>'}
function cl(){$('modal').innerHTML='';if(CH){CH=false;load(1)}}
function save(n,id){
  var o=id?Object.assign({},(n=='Vendor'?D.vendor:D.project).find(function(r){return r.ID==id})):{};
  document.querySelectorAll('[data-k]').forEach(function(e){o[e.dataset.k]=e.type=='number'&&e.value!==''?Number(e.value):e.value});
  if(!o.Nama){alert('Nama wajib diisi');return}
  var vids=n=='Project'?[].map.call(document.querySelectorAll('.vc:checked'),function(e){return e.value}):null;
  $('sv').disabled=true;$('sv').textContent='Menyimpan…';CH=true;
  google.script.run.withSuccessHandler(function(){cl()}).withFailureHandler(function(e){alert(e.message);$('sv').disabled=false;$('sv').textContent='Simpan'}).saveRow(n,o,vids)}
function rd(f){return new Promise(function(res,rej){var r=new FileReader();r.onload=function(){res(r.result.split(',')[1])};r.onerror=rej;r.readAsDataURL(f)})}
async function run(n,id){
  var rows=[].slice.call(document.querySelectorAll('.ur')),isV=n=='Vendor';$('go').disabled=true;$('fl').disabled=true;
  for(var i=0;i<rows.length;i++){var r=rows[i],st=r.querySelector('.st');if(r.dataset.done)continue;
    st.textContent='Mengunggah…';st.className='st w';
    try{var b=await rd(FILES[i]);
      await new Promise(function(res,rej){google.script.run.withSuccessHandler(res).withFailureHandler(rej).uploadFile({name:FILES[i].name,mime:FILES[i].type||'application/pdf',jenis:r.querySelector('select').value,baru:(r.querySelector('.jb').hidden?'':r.querySelector('.jb').value.trim()),grup:grp(r.querySelector('select')),berlaku:r.querySelector('.bk').value,vendorId:n=='G'?$('gv').value:isV?id:($('uv')?$('uv').value:''),projectId:n=='G'?$('gp').value:isV?'':id},b)});
      st.textContent='Berhasil ✓';st.className='st ok';r.dataset.done=1;CH=true}
    catch(e){st.textContent='Gagal: '+(e.message||e);st.className='st er'}
    $('ov').textContent=document.querySelectorAll('.ur[data-done]').length+' dari '+rows.length+' file selesai'}
  $('go').disabled=document.querySelectorAll('.ur[data-done]').length==rows.length;$('go').textContent='Ulangi yang gagal'}
function av(n){var s=String(n||'?').trim()||'?',w=s.split(/\s+/),t=((w[0]||'?')[0]+(w[1]?w[1][0]:'')).toUpperCase(),h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%360;return '<span class="av" style="background:hsl('+h+' 75% 93%);color:hsl('+h+' 55% 32%)">'+esc(t)+'</span>'}
function nm(a,b){return '<div class="nm">'+a+(b?'<small>'+b+'</small>':'')+'</div>'}
function who(n,s){return '<div class="who">'+av(n)+nm(esc(n),esc(s||''))+'</div>'}
function pg(t,s,b){return '<div class="pt row"><div><h2>'+t+'</h2><p>'+s+'</p></div>'+(b||'')+'</div>'}
function emp(n,t,ic){return pg(t,'Belum ada data','')+'<div class="pn"><div class="empty cta"><div class="ei">'+ic+'</div><b>Belum ada '+t.toLowerCase()+'</b><p>Tambahkan '+t.toLowerCase()+' pertama untuk mulai mengisi database.</p><button class="btn" onclick="frm(\''+n+'\')">+ Tambah '+t+'</button></div></div>'}
var PH=['Project','Tahun','Vendor','Nilai','Tenggat','Status'];
function tgt(p){return p.Tenggat?(p.Status=='Berjalan'&&dd(p.Tenggat)<=30?'<span class="warn">'+esc(p.Tenggat)+'</span>':esc(p.Tenggat)):'-'}
function pRow(p){return ['det(\'Project\',\''+p.ID+'\')',nm(esc(p.Nama),esc(p.NoKontrak)),esc(p.Tahun),esc(vOf(p.ID).map(function(v){return v.Nama}).join(', ')||'-'),'<span class="num">'+rp(p.Nilai)+'</span>',tgt(p),bd(p.Status)]}
function vlist(){
  if(!D.vendor.length)return emp('Vendor','Vendor',ic('vendor',34));
  var a=D.vendor.filter(function(v){return v.Status!='Nonaktif'}).length;
  return pg('Vendor',D.vendor.length+' vendor · '+a+' aktif','<div class="acts2"><button class="btn s" onclick="scn()">Scan kartu nama</button><button class="btn" onclick="frm(\'Vendor\')">+ Tambah Vendor</button></div>')+fbar()+'<div class="pn">'+
  tbl(['Vendor','Kontak','Dokumen','Status'],VL().slice(0,LIM).map(function(v){return ['det(\'Vendor\',\''+v.ID+'\')',who(v.Nama,v.Kategori),nm(esc(v.PIC||'-'),esc(v.Telepon)),'<span class="cnt">'+D.dok.filter(function(d){return d.VendorID==v.ID}).length+' file</span>',bd(v.Status)]}))+'</div>'+mr(VL().length)}
function plist(){
  if(!D.project.length)return emp('Project','Project',ic('project',34));
  var t=D.project.reduce(function(s,p){return s+Number(p.Nilai||0)},0);
  return pg('Project',D.project.length+' project · total '+rp(t),'<button class="btn" onclick="frm(\'Project\')">+ Tambah Project</button>')+fbar()+'<div class="pn">'+tbl(PH,PL().slice(0,LIM).map(pRow),'Tidak ada project dengan status ini')+'</div>'+mr(PL().length)}
function year(){
  var ys=[];D.project.forEach(function(p){if(ys.indexOf(String(p.Tahun))<0)ys.push(String(p.Tahun))});ys.sort().reverse();
  var y=window.YR&&ys.indexOf(window.YR)>=0?window.YR:ys[0];
  if(!y)return pg('Per Tahun','Belum ada data','')+'<div class="pn"><div class="empty">Belum ada project. Tambahkan project dulu di tab Project.</div></div>';
  var ps=D.project.filter(function(p){return String(p.Tahun)==y});
  return pg('Tahun Kontrak '+y,ps.length+' project · '+rp(ps.reduce(function(s,p){return s+Number(p.Nilai||0)},0)),'')+
  '<div class="chips">'+ys.map(function(t){return '<a class="chip'+(t==y?' on':'')+'" onclick="window.YR=\''+t+'\';render()">'+t+'</a>'}).join('')+'</div><div class="pj">'+
  ps.map(function(p){var docs=D.dok.filter(function(d){return d.ProjectID==p.ID});
    return '<div class="cd pc" onclick="det(\'Project\',\''+p.ID+'\')"><div class="tb" style="margin:0"><b>'+esc(p.Nama)+'</b>'+bd(p.Status)+'</div><small>'+esc(p.NoKontrak||'Tanpa nomor kontrak')+'</small>'+
    '<div class="meta"><span>🏢 '+esc(vOf(p.ID).map(function(v){return v.Nama}).join(', ')||'-')+'</span><span>💰 '+rp(p.Nilai)+'</span><span>📄 '+docs.length+' dokumen</span></div>'+
    docs.map(function(d){return '<a class="ck" href="'+esc(d.Link)+'" target="_blank" onclick="event.stopPropagation()">'+esc(d.Jenis)+'</a>'}).join('')+'</div>'}).join('')+'</div>'}
function srch(q){
  var m=function(a){return a.join(' ').toLowerCase().indexOf(q)>=0},
  v=D.vendor.filter(function(r){return m([r.Nama,r.Kategori,r.PIC,r.NPWP,r.Catatan])}),
  p=D.project.filter(function(r){return m([r.Nama,r.NoKontrak,r.Tahun,vOf(r.ID).map(function(x){return x.Nama}).join(' ')])}),
  d=D.dok.filter(function(r){return m([r.Nama,r.Jenis])});
  return pg('Hasil pencarian','“'+esc(q)+'” · '+(v.length+p.length+d.length)+' hasil','')+
  pn('Vendor','',v.length,tbl(['Vendor','Kontak','Status'],v.map(function(r){return ['det(\'Vendor\',\''+r.ID+'\')',who(r.Nama,r.Kategori),nm(esc(r.PIC||'-'),esc(r.Telepon)),bd(r.Status)]}),'Tidak ada vendor yang cocok'))+
  pn('Project','',p.length,tbl(PH,p.map(pRow),'Tidak ada project yang cocok'))+
  pn('Dokumen','',d.length,tbl(['Jenis','Nama file','Vendor',''],d.map(function(r){return ['ddet(\''+r.ID+'\')','<span class="cnt">'+esc(r.Jenis)+'</span>','<span class="dn">📄 '+esc(r.Nama)+'</span>',esc(vn(r.VendorID)),'<div class="ra">'+eyeb(r.ID)+dlb(r.Link)+'</div>']}),'Tidak ada dokumen yang cocok'))}
var DT=[];
function det(n,id){DT=[n,id];
  var isV=n=='Vendor',o=(isV?D.vendor:D.project).find(function(r){return r.ID==id}),skip=['ID','Nama','Status'],
  kv=D.cols[n].filter(function(c){return skip.indexOf(c)<0&&o[c]!==''&&o[c]!=null}).map(function(c){return '<div><small>'+c+'</small><div>'+esc(c=='Nilai'?rp(o[c]):o[c])+'</div></div>'}).join(''),
  docs=D.dok.filter(function(d){return isV?d.VendorID==id:d.ProjectID==id}),
  rel=isV?tbl(['Tahun','Project','Status'],pOf(id).map(function(p){return ['det(\'Project\',\''+p.ID+'\')',esc(p.Tahun),esc(p.Nama),bd(p.Status)]}),'Belum terlibat di project mana pun'):
    tbl(['Vendor','Kategori'],vOf(id).map(function(v){return ['det(\'Vendor\',\''+v.ID+'\')',who(v.Nama,''),esc(v.Kategori)]}),'Belum ada vendor (opsional). Klik "Ubah data" untuk menambahkan vendor.');
  show('<div class="dh">'+(isV?av(o.Nama):'<span class="av p">'+ic('project')+'</span>')+'<div class="dt"><h2>'+esc(o.Nama)+'</h2><small>'+(isV?esc(o.Kategori||'Vendor'):'Kontrak '+esc(o.Tahun)+(o.NoKontrak?' · '+esc(o.NoKontrak):''))+'</small></div>'+bd(o.Status)+'<button class="x" onclick="cl()">✕</button></div>'+
  '<div class="acts"><button class="btn" onclick="upl(\''+n+'\',\''+id+'\')">Unggah dokumen</button>'+(isV?'':'<button class="btn s" onclick="upl(\''+n+'\',\''+id+'\',1)">Unggah finance</button>')+'<button class="btn s" onclick="frm(\''+n+'\',\''+id+'\')">✎ Ubah data</button><button class="btn s dg" onclick="hapus(\''+n+'\',\''+id+'\')">🗑 Hapus</button></div>'+
  (kv?'<div class="kv">'+kv+'</div>':'')+'<div class="sec"><h3>'+(isV?'Project':'Vendor')+'</h3>'+rel+'</div>'+
  dsecs(isV,docs))}
function frm(n,id){
  var o=id?(n=='Vendor'?D.vendor:D.project).find(function(r){return r.ID==id}):(n=='Project'?{Tahun:new Date().getFullYear(),Status:'Berjalan'}:{Status:'Aktif'}),
  h='<div class="dh"><div class="dt"><h2>'+(id?'Ubah ':'Tambah ')+n+'</h2><small>Isi data lalu simpan</small></div><button class="x" onclick="cl()">✕</button></div><div class="g">';
  D.cols[n].filter(function(c){return c!='ID'}).forEach(function(c){var v=o[c]===undefined?'':o[c],t=/^(Mulai|Tenggat)$/.test(c)?'date':/^(Tahun|Nilai)$/.test(c)?'number':'text',tx=/^(Alamat|Catatan)$/.test(c);
    h+='<label'+(tx?' class="full"':'')+'>'+c+(c=='Status'?'<select data-k="Status">'+ST[n].map(function(s){return '<option'+(s==o.Status?' selected':'')+'>'+s+'</option>'}).join('')+'</select>':tx?'<textarea data-k="'+c+'" rows="2">'+esc(v)+'</textarea>':'<input type="'+t+'" data-k="'+c+'" value="'+esc(v)+'">')+'</label>'});
  h+='</div>';
  if(n=='Project'){var cur=id?vOf(id).map(function(v){return v.ID}):[];h+='<div class="sec"><h3>Vendor yang terlibat (opsional)</h3>'+(D.vendor.length?D.vendor.map(function(v){return '<label class="ck"><input type="checkbox" class="vc" value="'+v.ID+'"'+(cur.indexOf(v.ID)>=0?' checked':'')+'>'+esc(v.Nama)+'</label>'}).join(''):'<span class="mu">Belum ada vendor. Project tetap bisa disimpan tanpa vendor.</span>')+'</div>'}
  show(h+'<div class="ft"><button class="btn s" onclick="'+(id?'det(\''+n+'\',\''+id+'\')':'cl()')+'">Batal</button><button class="btn" id="sv" onclick="save(\''+n+'\',\''+(id||'')+'\')">Simpan</button></div>')}
var UF=0;
function upl(n,id,f){UF=f?1:0;
  if(!D)return;
  var G=n=='G',isV=n=='Vendor',vs=isV||G?[]:vOf(id);
  if(G&&!D.vendor.length&&!D.project.length){alert('Tambahkan vendor atau project dulu.');return}
  var sel=G?'<div class="g"><label>Vendor<select id="gv" onchange="gpl()">'+D.vendor.map(function(v){return '<option value="'+v.ID+'">'+esc(v.Nama)+'</option>'}).join('')+'<option value="">Tanpa vendor (dokumen project)</option></select></label><label>Project<select id="gp" onchange="pick(\'G\')"></select></label></div>':
    isV?'':!vs.length?'':'<label>Vendor (opsional)<select id="uv"><option value="">Tanpa vendor (dokumen project)</option>'+vs.map(function(v){return '<option value="'+v.ID+'">'+esc(v.Nama)+'</option>'}).join('')+'</select></label>';
  show('<div class="dh"><div class="dt"><h2>Unggah dokumen</h2><small>PDF, bisa pilih banyak file sekaligus</small></div><button class="x" onclick="cl()">✕</button></div>'+sel+
  '<label class="drop"><b>Klik untuk memilih file</b><span>atau seret file PDF ke sini</span><input type="file" id="fl" multiple accept=".pdf,application/pdf" onchange="pick(\''+n+'\')"></label><div id="ul"></div><p id="ov" class="mu"></p>'+
  '<div class="ft"><button class="btn s" onclick="cl()">Selesai</button><button class="btn" id="go" onclick="run(\''+n+'\',\''+id+'\')" disabled>Unggah semua</button></div>');
  if(G)gpl()}
function gpl(){var nv=!$('gv').value;$('gp').innerHTML=(nv?'':'<option value="">Tanpa project (dokumen umum vendor)</option>')+(nv?D.project:pOf($('gv').value)).map(function(p){return '<option value="'+p.ID+'">Project: '+esc(p.Tahun+' · '+p.Nama)+'</option>'}).join('');pick('G')}
function pick(n){
  FILES=[].slice.call($('fl').files);var g=JG(n=='G'?!!$('gp').value:n!='Vendor'),df=UF&&(D.jenisF||[])[0];
  $('ul').innerHTML=FILES.length?'<div class="uh"><span>File</span><span>Jenis dokumen</span><span>Berlaku sampai</span><span>Status</span></div>'+FILES.map(function(f){return '<div class="ur"><span class="fn">📄 '+esc(f.name)+'</span><div class="jc"><select onchange="jch(this)">'+jopt(g,df)+'</select><input class="jb" placeholder="Tulis jenis dokumen baru…" hidden></div><input type="date" class="bk" title="Berlaku sampai (opsional)"><span class="st">Menunggu</span></div>'}).join(''):'';
  var bad=n=='G'&&!$('gv').value&&!$('gp').value;$('go').disabled=!FILES.length||bad;$('ov').textContent=bad?'Pilih vendor atau project dulu.':''}
function hapus(n,id){
  var isV=n=='Vendor',o=(isV?D.vendor:D.project).find(function(r){return r.ID==id});if(!o)return;
  var nd=D.dok.filter(function(d){return isV?d.VendorID==id:d.ProjectID==id}).length,
  nr=(isV?pOf(id):vOf(id)).length;
  if(!confirm('Hapus '+n.toLowerCase()+' "'+o.Nama+'"?\n\n• '+nd+' dokumen ikut terhapus (file di Google Drive dipindah ke Tempat Sampah)\n• '+(isV?'Dilepas dari '+nr+' project':'Relasi dengan '+nr+' vendor dihapus')+'\n\nTindakan ini tidak bisa dibatalkan dari aplikasi.'))return;
  var bs=document.querySelectorAll('.acts button');
  bs.forEach(function(b){b.disabled=true});CH=true;
  google.script.run.withSuccessHandler(function(){cl()}).withFailureHandler(function(e){alert(e.message);CH=false;bs.forEach(function(b){b.disabled=false})}).deleteRow(n,id)}
function hapusDok(id){
  var d=D.dok.find(function(x){return x.ID==id});if(!d)return;
  if(!confirm('Hapus dokumen "'+d.Nama+'"?\n\nFile di Google Drive dipindah ke Tempat Sampah.'))return;
  google.script.run.withSuccessHandler(function(){var dm=!!$('modal').querySelector('.dd'),mo=!!$('modal').innerHTML;D.dok=D.dok.filter(function(x){return x.ID!=id});try{localStorage.setItem('dc',JSON.stringify(D))}catch(e){}render();if(dm)ddBack();else if(mo)det(DT[0],DT[1])}).withFailureHandler(function(e){alert(e.message)}).deleteDoc(id)}
var DF={j:'',v:'',s:'',k:'',g:''};
function dst(d){if(!d.BerlakuSampai)return 'none';var n=dd(d.BerlakuSampai);return n<0?'exp':n<=60?'soon':'ok'}
function drow(d){var p=d.ProjectID?D.project.find(function(x){return x.ID==d.ProjectID}):null;
  return ['ddet(\''+d.ID+'\')','<span class="dn">'+esc(d.Nama)+'</span>','<span class="cnt'+(cat(d)=='f'?' fin':'')+'">'+esc(d.Jenis)+'</span>',(d.VendorID?'<a class="lk2" onclick="event.stopPropagation();det(\'Vendor\',\''+d.VendorID+'\')">'+esc(vn(d.VendorID))+'</a>':'<span class="mu">-</span>'),p?'<a class="lk2" onclick="event.stopPropagation();det(\'Project\',\''+p.ID+'\')">'+esc(p.Nama)+'</a>':'<span class="mu">Umum</span>',exp(d.BerlakuSampai)||'-','<div class="ra">'+eyeb(d.ID)+dlb(d.Link)+'<button class="x" title="Ubah dokumen" onclick="event.stopPropagation();edDok(\''+d.ID+'\')">'+ic('edit',16)+'</button><button class="x" title="Hapus dokumen" onclick="event.stopPropagation();hapusDok(\''+d.ID+'\')">🗑</button></div>']}
var DH=['Dokumen','Jenis','Vendor','Project','Berlaku sampai',''];
function dgrp(L,g){
  var m={},ks=[];
  L.forEach(function(d){var k,l,s;
    if(g=='vendor'){k=d.VendorID||'-';l=d.VendorID?vn(d.VendorID):'Tanpa vendor';s=d.VendorID?String(l).toLowerCase():'zzzz'}
    else if(g=='project'){var p=d.ProjectID?D.project.find(function(x){return x.ID==d.ProjectID}):null;k=p?p.ID:'-';l=p?p.Tahun+' · '+p.Nama:'Tanpa project (dokumen umum vendor)';s=p?(9999-Number(p.Tahun||0))+' '+String(p.Nama).toLowerCase():'zzzz'}
    else{k=d.Jenis||'-';l=d.Jenis||'Tanpa jenis';s=String(l).toLowerCase()}
    if(!m[k]){m[k]={l:l,s:s,r:[]};ks.push(k)}m[k].r.push(d)});
  ks.sort(function(a,b){return m[a].s<m[b].s?-1:m[a].s>m[b].s?1:0});
  var op=ks.length<=8;
  return ks.slice(0,LIM).map(function(k){var x=m[k];return '<details class="grp"'+(op?' open':'')+'><summary><span>'+esc(x.l)+'</span><span class="cnt">'+x.r.length+'</span></summary>'+tbl(DH,x.r.map(drow),'')+'</details>'}).join('')+mr(ks.length)}
function dlist(){
  var up='<button class="btn" onclick="upl(\'G\')">Unggah Dokumen</button>';
  if(!D.dok.length)return pg('Dokumen','Belum ada dokumen',up)+'<div class="pn"><div class="empty cta"><div class="ei">'+ic('doc',34)+'</div><b>Belum ada dokumen</b><p>Unggah dokumen pertama untuk mulai mengisi database.</p>'+up+'</div></div>';
  var js=[];D.dok.forEach(function(d){if(d.Jenis&&js.indexOf(d.Jenis)<0)js.push(d.Jenis)});js.sort();
  var L=D.dok.filter(function(d){var s=dst(d);return (!DF.k||cat(d)==DF.k)&&(!DF.j||d.Jenis==DF.j)&&(!DF.v||d.VendorID==DF.v)&&(!DF.s||(DF.s=='perlu'?(s=='exp'||s=='soon'):s==DF.s))}).reverse();
  var sel=function(k,all,o){return '<select onchange="DF.'+k+'=this.value;render()"><option value="">'+all+'</option>'+o.map(function(x){return '<option value="'+esc(x[0])+'"'+(DF[k]==x[0]?' selected':'')+'>'+esc(x[1])+'</option>'}).join('')+'</select>'};
  var any=DF.j||DF.v||DF.s||DF.k,tabs=[['','Semua'],['u','Vendor'],['p','Project'],['f','Finance']].map(function(x){var n=x[0]?D.dok.filter(function(d){return cat(d)==x[0]}).length:D.dok.length;return '<a class="chip'+(DF.k==x[0]?' on':'')+'" onclick="DF.k=\''+x[0]+'\';render()">'+x[1]+' · '+n+'</a>'}).join(''),
  gs='<select class="gsel" onchange="DF.g=this.value;LIM=50;render()">'+[['','Tanpa pengelompokan'],['project','Kelompokkan: Project'],['vendor','Kelompokkan: Vendor'],['jenis','Kelompokkan: Jenis dokumen']].map(function(x){return '<option value="'+x[0]+'"'+(DF.g==x[0]?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select>',
  f=sel('j','Semua jenis',js.map(function(x){return [x,x]}))+sel('v','Semua vendor',D.vendor.map(function(v){return [v.ID,v.Nama]}))+sel('s','Semua status',[['perlu','Perlu perhatian'],['exp','Kedaluwarsa'],['soon','Segera habis (60 hari)'],['ok','Masih berlaku'],['none','Tanpa masa berlaku']])+gs,
  none='<div class="pn"><div class="empty">Tidak ada dokumen yang cocok dengan filter</div></div>';
  return pg('Dokumen',D.dok.length+' dokumen'+(any?' · '+L.length+' ditampilkan':''),up)+'<div class="chips">'+tabs+'</div><div class="fl">'+f+(any?'<a class="chip" onclick="DF={j:\'\',v:\'\',s:\'\',k:\'\',g:DF.g};render()">Reset filter</a>':'')+'</div>'+
  (DF.g?(L.length?dgrp(L,DF.g):none):'<div class="pn">'+tbl(DH,L.slice(0,LIM).map(drow),'Tidak ada dokumen yang cocok dengan filter')+'</div>'+mr(L.length))}
function VL(){return FL?D.vendor.filter(function(v){return FL=='Aktif'?v.Status!='Nonaktif':v.Status==FL}):D.vendor}
function PL(){return (FL?D.project.filter(function(p){return p.Status==FL}):D.project).slice().reverse()}
function mr(n){return n>LIM?'<div class="more"><button class="btn s" onclick="LIM+=50;render()">Tampilkan 50 lagi · sisa '+(n-LIM)+'</button></div>':''}
var EB=null;
function edBack(){if(EB){if(EB[0]=='Dok')ddet(EB[1],1);else det(EB[0],EB[1])}else cl()}
function edDok(id){
  var d=D.dok.find(function(x){return x.ID==id});if(!d)return;
  var g=JG(!!d.ProjectID),all=[].concat.apply([],g.map(function(x){return x[1]}));if(all.indexOf(d.Jenis)<0)g.unshift(['Jenis lama',[d.Jenis]]);
  EB=$('modal').innerHTML?($('modal').querySelector('.dd')?['Dok',DDid]:DT.slice()):null;
  show('<div class="dh"><div class="dt"><h2>Ubah dokumen</h2><small>'+esc(d.Nama)+'</small></div><button class="x" onclick="edBack()">✕</button></div><div class="g"><label>Jenis dokumen<select id="ej" onchange="jch(this)">'+jopt(g,d.Jenis)+'</select><input class="jb" id="ejb" placeholder="Tulis jenis dokumen baru…" hidden></label><label>Berlaku sampai<input type="date" id="eb" value="'+esc(d.BerlakuSampai||'')+'"></label></div><div class="ft"><button class="btn s" onclick="edBack()">Batal</button><button class="btn" id="sv" onclick="svDok(\''+id+'\')">Simpan</button></div>');jch($('ej'))}
function svDok(id){
  var j=$('ej').value,b=$('eb').value,bw=$('ejb').hidden?'':$('ejb').value.trim(),gr=grp($('ej'));$('sv').disabled=true;$('sv').textContent='Menyimpan…';
  google.script.run.withSuccessHandler(function(r){var d=D.dok.find(function(x){return x.ID==id});d.Jenis=(r&&r.jenis)||j;reg(gr,d.Jenis);d.BerlakuSampai=b;try{localStorage.setItem('dc',JSON.stringify(D))}catch(e){}render();edBack()}).withFailureHandler(function(e){alert(e.message);$('sv').disabled=false;$('sv').textContent='Simpan'}).updateDoc(id,{Jenis:j,BerlakuSampai:b,baru:bw,grup:gr})}
function kecil(f){return new Promise(function(res,rej){var u=URL.createObjectURL(f),i=new Image();i.onload=function(){var k=Math.min(1,1600/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=Math.round(i.width*k);c.height=Math.round(i.height*k);c.getContext('2d').drawImage(i,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',.85).split(',')[1])};i.onerror=function(){rej(new Error('Gambar tidak bisa dibuka'))};i.src=u})}
function scn(){
  show('<div class="dh"><div class="dt"><h2>Scan kartu nama</h2><small>Foto kartu atau pilih gambar dari galeri</small></div><button class="x" onclick="cl()">✕</button></div><label class="drop"><b>Klik untuk memilih foto kartu</b><span>Pastikan foto terang, lurus, dan tulisannya jelas</span><input type="file" id="kf" accept="image/*" onchange="scnGo()"></label><div id="ks" class="mu" style="text-align:center"></div>')}
async function scnGo(){
  var f=$('kf').files[0];if(!f)return;$('ks').textContent='Memproses gambar…';
  try{var b=await kecil(f);$('ks').innerHTML='<div class="sp"></div>Membaca kartu… (beberapa detik)';
    google.script.run.withSuccessHandler(function(r){
      frm('Vendor');
      Object.keys(r).forEach(function(k){var e=document.querySelector('[data-k="'+k+'"]');if(e&&r[k])e.value=r[k]});
      var g=document.querySelector('.mc .g');if(g)g.insertAdjacentHTML('beforebegin','<p class="mu" style="margin:0 0 14px">Hasil scan kartu nama. Periksa dan koreksi dulu sebelum menyimpan.</p>');
    }).withFailureHandler(function(e){$('ks').textContent='Gagal: '+e.message}).scanKartu({mime:'image/jpeg'},b)
  }catch(e){$('ks').textContent='Gagal: '+(e.message||e)}}
function isF(d){var f=D.jenisF||[];return !!d.ProjectID&&f.indexOf(d.Jenis)>=0&&D.jenisP.indexOf(d.Jenis)<0}
function cat(d){return !d.ProjectID?'u':isF(d)?'f':'p'}
function JG(proj){return proj?[['Dokumen Project',D.jenisP],['Dokumen Finance',D.jenisF||[]]]:[['Dokumen Vendor',D.jenisV]]}
function jopt(g,sel){return g.map(function(x){return x[1].length?'<optgroup label="'+x[0]+'">'+x[1].map(function(j){return '<option'+(j==sel?' selected':'')+'>'+esc(j)+'</option>'}).join('')+'</optgroup>':''}).join('')}
function drows(l,isV){return l.map(function(d){return ['ddet(\''+d.ID+'\')','<span class="cnt">'+esc(d.Jenis)+'</span>','<span class="dn">📄 '+esc(d.Nama)+'</span>',isV?esc(d.ProjectID?(D.project.find(function(p){return p.ID==d.ProjectID})||{}).Nama:'Umum'):esc(vn(d.VendorID)),exp(d.BerlakuSampai)||'-','<div class="ra">'+eyeb(d.ID)+dlb(d.Link)+'<button class="x" title="Ubah dokumen" onclick="event.stopPropagation();edDok(\''+d.ID+'\')">'+ic('edit',16)+'</button><button class="x" title="Hapus dokumen" onclick="event.stopPropagation();hapusDok(\''+d.ID+'\')">🗑</button></div>']})}
function dsec(t,l,isV,m){return '<div class="sec"><h3>'+t+' ('+l.length+')</h3>'+tbl(['Jenis','Nama file',isV?'Project':'Vendor','Berlaku sampai',''],drows(l,isV),m)+'</div>'}
function dsecs(isV,docs){
  var u=docs.filter(function(d){return !d.ProjectID}),f=docs.filter(isF),p=docs.filter(function(d){return d.ProjectID&&!isF(d)});
  return isV?dsec('Dokumen Vendor',u,1,'Belum ada dokumen vendor. Klik "Unggah dokumen" untuk menambahkan.')+(p.length?dsec('Dokumen Project',p,1,''):'')+(f.length?dsec('Dokumen Finance',f,1,''):''):
    dsec('Dokumen Project',p,0,'Belum ada dokumen project. Klik "Unggah dokumen" untuk menambahkan.')+dsec('Dokumen Finance',f,0,'Belum ada dokumen finance. Klik "Unggah finance" untuk menambahkan.')}
function grp(sel){var l=sel.options[sel.selectedIndex].parentNode.label;return l=='Dokumen Finance'?'F':l=='Dokumen Project'?'P':'V'}
function jch(sel){var o=sel.options[sel.selectedIndex],b=sel.parentNode.querySelector('.jb'),on=!!o&&/lainnya/i.test(o.text);b.hidden=!on;if(on)b.focus();else b.value=''}
function reg(g,n){var L=D.jenisV.concat(D.jenisP,D.jenisF||[]);if(!n||L.indexOf(n)>=0)return;var t={V:D.jenisV,P:D.jenisP,F:D.jenisF||(D.jenisF=[])}[g];if(t)t.push(n)}
var DDid=null,PB=null;
function dlu(u){var m=String(u||'').match(/\/d\/([-\w]+)/)||String(u||'').match(/[?&]id=([-\w]+)/);return m?'https://drive.google.com/uc?export=download&amp;id='+m[1]:''}
function fmtT(s){if(!s)return '-';var t=new Date(String(s).slice(0,10)+'T00:00:00');return isNaN(t)?esc(s):t.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}
function terkait(d){var p=d.ProjectID?D.project.find(function(x){return x.ID==d.ProjectID}):null;return p?nm(esc(p.Nama),esc(d.VendorID?vn(d.VendorID):'Tanpa vendor')):nm(esc(vn(d.VendorID)),'Dokumen vendor')}
function ddBack(){DDid=null;if(PB)det(PB[0],PB[1]);else cl()}
function ddet(id,keep,pv){
  var d=D.dok.find(function(x){return x.ID==id});if(!d)return;
  if(!keep)PB=$('modal').innerHTML?DT.slice():null;
  DDid=id;
  var p=d.ProjectID?D.project.find(function(x){return x.ID==d.ProjectID}):null,v=d.VendorID?D.vendor.find(function(x){return x.ID==d.VendorID}):null,
  c=cat(d),kt={u:'Dokumen Vendor',p:'Dokumen Project',f:'Dokumen Finance'}[c],s=dst(d),n=d.BerlakuSampai?dd(d.BerlakuSampai):0,
  stb=s=='none'?'':s=='exp'?' <span class="bd rd">Kedaluwarsa</span>':s=='soon'?' <span class="bd Ditunda">'+n+' hari lagi</span>':' <span class="bd Aktif">Berlaku</span>',
  fl=function(x){return String(x).replace(/[\/\\:*?"<>|]/g,'-').trim()},
  path=['Database Vendor'].concat(p?[p.Tahun,fl(p.Nama)].concat(v?[fl(v.Nama)]:[]).concat(c=='f'?['Finance']:[]):['Dokumen Umum Vendor',v?fl(v.Nama):'-']).join(' / '),
  rc=function(t,main,sub){return '<div class="rc'+(main?'':' none')+'"><small>'+t+'</small>'+(main||'<div>Tidak terkait</div>')+(main&&sub?'<div class="sub">'+sub+'</div>':'')+'</div>'},
  kv=function(t,x){return '<div><small>'+t+'</small><div>'+x+'</div></div>'},
  du=dlu(d.Link);
  show('<div class="dh dd"><span class="av p">'+ic('doc')+'</span><div class="dt"><h2>'+esc(d.Nama)+'</h2><small>'+kt+' · '+esc(d.Jenis)+'</small></div><button class="x" onclick="ddBack()">✕</button></div>'+
  '<div class="acts">'+(pvu(d.Link)?'<button class="btn" id="pvb" onclick="ddpv(\''+d.ID+'\')">Lihat dokumen</button>':'')+'<a class="btn s" href="'+esc(d.Link)+'" target="_blank">Buka di tab baru</a>'+(du?'<a class="btn s" href="'+du+'">Unduh</a>':'')+'<button class="btn s" onclick="edDok(\''+d.ID+'\')">'+ic('edit',15)+' Ubah</button><button class="btn s dg" onclick="hapusDok(\''+d.ID+'\')">🗑 Hapus</button></div>'+'<div id="pv"></div>'+
  '<div class="rl">'+rc('Project',p?'<a onclick="det(\'Project\',\''+p.ID+'\')">'+esc(p.Nama)+'</a>':'',p?'Kontrak '+esc(p.Tahun)+(p.NoKontrak?' · '+esc(p.NoKontrak):'')+' · '+esc(p.Status):'')+
  rc('Vendor',v?'<a onclick="det(\'Vendor\',\''+v.ID+'\')">'+esc(v.Nama)+'</a>':'',v?[v.Kategori,v.PIC,v.Telepon].filter(Boolean).map(esc).join(' · '):'')+'</div>'+
  '<div class="kv">'+kv('Kategori',kt)+kv('Jenis dokumen',esc(d.Jenis))+kv('Berlaku sampai',fmtT(d.BerlakuSampai)+stb)+kv('Diunggah',fmtT(d.Diunggah))+kv('Diunggah oleh',esc(d.Oleh||'-'))+kv('Lokasi folder Drive',esc(path))+'</div>'+
  '<div class="ft"><button class="btn s" onclick="ddBack()">Tutup</button></div>');if(pv)ddpv(id)}
function pvu(u){var m=String(u||'').match(/\/d\/([-\w]+)/)||String(u||'').match(/[?&]id=([-\w]+)/);return m?'https://drive.google.com/file/d/'+m[1]+'/preview':''}
function eyeb(id){return '<button class="x" title="Lihat dokumen" onclick="event.stopPropagation();ddet(\''+id+'\',0,1)">'+ic('eye',16)+'</button>'}
function ddpv(id){
  var b=$('pv'),w=document.querySelector('#modal .mc'),d=D.dok.find(function(x){return x.ID==id});if(!b||!d)return;
  if(b.innerHTML){b.innerHTML='';w.classList.remove('wide');$('pvb').textContent='Lihat dokumen';return}
  b.innerHTML='<div class="pvw"><div class="ld"><div class="sp"></div>Memuat dokumen…</div><iframe src="'+pvu(d.Link)+'" allow="autoplay"></iframe></div><p class="mu pvh">Dokumen tidak tampil? Pastikan Anda login ke akun Google yang punya akses, atau pakai "Buka di tab baru".</p>';
  w.classList.add('wide');$('pvb').textContent='Sembunyikan dokumen'}
load();
