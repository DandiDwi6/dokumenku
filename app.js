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
      .catch(function(e){if(/kunci/i.test(e.message))localStorage.removeItem('vk');if(er)er(e);else console.error(e)});
  }}})}
var google={script:{run:mk()}};
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
function tbl(h,r,m){return r.length?'<div class="tw"><table><tr>'+h.map(function(x){return '<th>'+x+'</th>'}).join('')+'</tr>'+r.map(function(x){return '<tr'+(x[0]?' onclick="'+x[0]+'"':'')+'>'+x.slice(1).map(function(c){return '<td>'+c+'</td>'}).join('')+'</tr>'}).join('')+'</table></div>':'<div class="empty">'+(m||'Belum ada data')+'</div>'}
function load(){$('app').innerHTML='<div class="ld"><div class="sp"></div>Memuat data…</div>';
  google.script.run.withSuccessHandler(function(d){D=d;render()}).withFailureHandler(function(e){var f=/fetch|network/i.test(e.message);$('app').innerHTML='<div class="ld"><b>'+(f?'Tidak bisa terhubung ke server':'Gagal memuat')+'</b><br>'+(f?'Periksa koneksi internet atau DNS, lalu coba lagi.':esc(e.message))+'<br><br><button class="btn" onclick="load()">Coba lagi</button></div>'}).getData()}
function go(v){V=v;$('q').value='';render()}
function render(){
  if(!D)return;var q=$('q').value.trim().toLowerCase();
  $('nav').innerHTML=[['dash','Dashboard','📊'],['vendor','Vendor','🏢'],['project','Project','🛠️'],['year','Per Tahun','📅']].map(function(x){return '<a class="'+(V==x[0]&&!q?'on':'')+'" onclick="go(\''+x[0]+'\')">'+'<span class="ni">'+x[2]+'</span>'+x[1]+'</a>'}).join('');
  $('app').innerHTML=q?srch(q):({dash:dash,vendor:vlist,project:plist,year:year})[V]()}
function pn(t,s,n,b,c){return '<div class="pn"><div class="ph"><div><h3>'+t+'</h3><small>'+s+'</small></div><span class="cnt '+(c||'')+'">'+n+'</span></div>'+b+'</div>'}
function pc(p){return ['det(\''+'Project'+'\',\''+p.ID+'\')',esc(p.Nama),esc(vOf(p.ID).map(function(v){return v.Nama}).join(', ')||'-'),esc(p.Tenggat||'-'),bd(p.Status)]}
function dash(){
  var pj=D.project.filter(function(p){return p.Status=='Berjalan'}),
  ex=D.dok.filter(function(d){return d.BerlakuSampai&&dd(d.BerlakuSampai)<=60}).sort(function(a,b){return a.BerlakuSampai<b.BerlakuSampai?-1:1}),
  tg=pj.filter(function(p){return p.Tenggat&&dd(p.Tenggat)<=30}).sort(function(a,b){return a.Tenggat<b.Tenggat?-1:1}),
  card=function(i,c,l,v){return '<div class="cd"><div class="ico '+c+'">'+i+'</div><div><small>'+l+'</small><div class="big">'+v+'</div></div></div>'},
  hari=new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  return '<div class="pt"><h2>Dashboard</h2><p>'+hari+'</p></div><div class="gr">'
  +card('🏢','blue','Vendor aktif',D.vendor.filter(function(v){return v.Status!='Nonaktif'}).length)
  +card('🛠️','green','Project berjalan',pj.length)
  +card('⚠️','red','Dokumen perlu perhatian',ex.length)+'</div><div class="cols">'
  +pn('Dokumen perlu perhatian','Kedaluwarsa atau berakhir dalam 60 hari',ex.length,tbl(['Dokumen','Vendor','Berlaku sampai'],ex.map(function(d){return ['det(\'Vendor\',\''+d.VendorID+'\')',esc(d.Nama),esc(vn(d.VendorID)),exp(d.BerlakuSampai)]}),'✅ Semua dokumen masih aman'),ex.length?'red':'')
  +pn('Project mendekati tenggat','Project berjalan dengan tenggat dalam 30 hari',tg.length,tbl(['Project','Vendor','Tenggat','Status'],tg.map(pc),'✅ Tidak ada tenggat dalam waktu dekat'),tg.length?'red':'')
  +'</div>'+pn('Project terbaru','5 project terakhir yang ditambahkan',D.project.length+' total',tbl(PH,D.project.slice(-5).reverse().map(pRow),'Belum ada project'))}
function show(h){$('modal').innerHTML='<div class="mb" onclick="if(event.target==this)cl()"><div class="mc">'+h+'</div></div>'}
function cl(){$('modal').innerHTML='';if(CH){CH=false;load()}}
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
      await new Promise(function(res,rej){google.script.run.withSuccessHandler(res).withFailureHandler(rej).uploadFile({name:FILES[i].name,mime:FILES[i].type||'application/pdf',jenis:r.querySelector('select').value,berlaku:r.querySelector('input').value,vendorId:n=='G'?$('gv').value:isV?id:$('uv').value,projectId:n=='G'?$('gp').value:isV?'':id},b)});
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
  if(!D.vendor.length)return emp('Vendor','Vendor','🏢');
  var a=D.vendor.filter(function(v){return v.Status!='Nonaktif'}).length;
  return pg('Vendor',D.vendor.length+' vendor · '+a+' aktif','<button class="btn" onclick="frm(\'Vendor\')">+ Tambah Vendor</button>')+'<div class="pn">'+
  tbl(['Vendor','Kontak','Dokumen','Status'],D.vendor.map(function(v){return ['det(\'Vendor\',\''+v.ID+'\')',who(v.Nama,v.Kategori),nm(esc(v.PIC||'-'),esc(v.Telepon)),'<span class="cnt">'+D.dok.filter(function(d){return d.VendorID==v.ID}).length+' file</span>',bd(v.Status)]}))+'</div>'}
function plist(){
  if(!D.project.length)return emp('Project','Project','🛠️');
  var t=D.project.reduce(function(s,p){return s+Number(p.Nilai||0)},0);
  return pg('Project',D.project.length+' project · total '+rp(t),'<button class="btn" onclick="frm(\'Project\')">+ Tambah Project</button>')+'<div class="pn">'+tbl(PH,D.project.slice().reverse().map(pRow))+'</div>'}
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
  pn('Dokumen','',d.length,tbl(['Jenis','Nama file','Vendor'],d.map(function(r){return ['','<span class="cnt">'+esc(r.Jenis)+'</span>','<a href="'+esc(r.Link)+'" target="_blank">📄 '+esc(r.Nama)+'</a>',esc(vn(r.VendorID))]}),'Tidak ada dokumen yang cocok'))}
var DT=[];
function det(n,id){DT=[n,id];
  var isV=n=='Vendor',o=(isV?D.vendor:D.project).find(function(r){return r.ID==id}),skip=['ID','Nama','Status'],
  kv=D.cols[n].filter(function(c){return skip.indexOf(c)<0&&o[c]!==''&&o[c]!=null}).map(function(c){return '<div><small>'+c+'</small><div>'+esc(c=='Nilai'?rp(o[c]):o[c])+'</div></div>'}).join(''),
  docs=D.dok.filter(function(d){return isV?d.VendorID==id:d.ProjectID==id}),
  rel=isV?tbl(['Tahun','Project','Status'],pOf(id).map(function(p){return ['det(\'Project\',\''+p.ID+'\')',esc(p.Tahun),esc(p.Nama),bd(p.Status)]}),'Belum terlibat di project mana pun'):
    tbl(['Vendor','Kategori'],vOf(id).map(function(v){return ['det(\'Vendor\',\''+v.ID+'\')',who(v.Nama,''),esc(v.Kategori)]}),'Belum ada vendor. Klik "Ubah data" untuk memilih vendor');
  show('<div class="dh">'+(isV?av(o.Nama):'<span class="av p">🛠️</span>')+'<div class="dt"><h2>'+esc(o.Nama)+'</h2><small>'+(isV?esc(o.Kategori||'Vendor'):'Kontrak '+esc(o.Tahun)+(o.NoKontrak?' · '+esc(o.NoKontrak):''))+'</small></div>'+bd(o.Status)+'<button class="x" onclick="cl()">✕</button></div>'+
  '<div class="acts"><button class="btn" onclick="upl(\''+n+'\',\''+id+'\')">⬆ Unggah dokumen</button><button class="btn s" onclick="frm(\''+n+'\',\''+id+'\')">✎ Ubah data</button><button class="btn s dg" onclick="hapus(\''+n+'\',\''+id+'\')">🗑 Hapus</button></div>'+
  (kv?'<div class="kv">'+kv+'</div>':'')+'<div class="sec"><h3>'+(isV?'Project':'Vendor')+'</h3>'+rel+'</div>'+
  '<div class="sec"><h3>Dokumen ('+docs.length+')</h3>'+tbl(['Jenis','Nama file',isV?'Project':'Vendor','Berlaku sampai',''],docs.map(function(d){return ['','<span class="cnt">'+esc(d.Jenis)+'</span>','<a href="'+esc(d.Link)+'" target="_blank">📄 '+esc(d.Nama)+'</a>',isV?esc(d.ProjectID?(D.project.find(function(p){return p.ID==d.ProjectID})||{}).Nama:'Umum'):esc(vn(d.VendorID)),exp(d.BerlakuSampai)||'-','<button class="x" title="Hapus dokumen" onclick="hapusDok(\''+d.ID+'\')">🗑</button>']}),'Belum ada dokumen. Klik "Unggah dokumen" untuk menambahkan.')+'</div>')}
function frm(n,id){
  var o=id?(n=='Vendor'?D.vendor:D.project).find(function(r){return r.ID==id}):(n=='Project'?{Tahun:new Date().getFullYear(),Status:'Berjalan'}:{Status:'Aktif'}),
  h='<div class="dh"><div class="dt"><h2>'+(id?'Ubah ':'Tambah ')+n+'</h2><small>Isi data lalu simpan</small></div><button class="x" onclick="cl()">✕</button></div><div class="g">';
  D.cols[n].filter(function(c){return c!='ID'}).forEach(function(c){var v=o[c]===undefined?'':o[c],t=/^(Mulai|Tenggat)$/.test(c)?'date':/^(Tahun|Nilai)$/.test(c)?'number':'text',tx=/^(Alamat|Catatan)$/.test(c);
    h+='<label'+(tx?' class="full"':'')+'>'+c+(c=='Status'?'<select data-k="Status">'+ST[n].map(function(s){return '<option'+(s==o.Status?' selected':'')+'>'+s+'</option>'}).join('')+'</select>':tx?'<textarea data-k="'+c+'" rows="2">'+esc(v)+'</textarea>':'<input type="'+t+'" data-k="'+c+'" value="'+esc(v)+'">')+'</label>'});
  h+='</div>';
  if(n=='Project'){var cur=id?vOf(id).map(function(v){return v.ID}):[];h+='<div class="sec"><h3>Vendor yang terlibat</h3>'+(D.vendor.length?D.vendor.map(function(v){return '<label class="ck"><input type="checkbox" class="vc" value="'+v.ID+'"'+(cur.indexOf(v.ID)>=0?' checked':'')+'>'+esc(v.Nama)+'</label>'}).join(''):'<span class="mu">Belum ada vendor. Tambahkan vendor dulu.</span>')+'</div>'}
  show(h+'<div class="ft"><button class="btn s" onclick="'+(id?'det(\''+n+'\',\''+id+'\')':'cl()')+'">Batal</button><button class="btn" id="sv" onclick="save(\''+n+'\',\''+(id||'')+'\')">Simpan</button></div>')}
function upl(n,id){
  if(!D)return;
  var G=n=='G',isV=n=='Vendor',vs=isV||G?[]:vOf(id);
  if(G&&!D.vendor.length){alert('Tambahkan vendor dulu.');return}
  if(!G&&!isV&&!vs.length){alert('Pilih vendor yang terlibat dulu lewat tombol Ubah data.');return}
  var sel=G?'<div class="g"><label>Vendor<select id="gv" onchange="gpl()">'+D.vendor.map(function(v){return '<option value="'+v.ID+'">'+esc(v.Nama)+'</option>'}).join('')+'</select></label><label>Dokumen untuk<select id="gp" onchange="pick(\'G\')"></select></label></div>':
    isV?'':'<label>Vendor<select id="uv">'+vs.map(function(v){return '<option value="'+v.ID+'">'+esc(v.Nama)+'</option>'}).join('')+'</select></label>';
  show('<div class="dh"><div class="dt"><h2>Unggah dokumen</h2><small>PDF, bisa pilih banyak file sekaligus</small></div><button class="x" onclick="cl()">✕</button></div>'+sel+
  '<label class="drop"><b>Klik untuk memilih file</b><span>atau seret file PDF ke sini</span><input type="file" id="fl" multiple accept=".pdf,application/pdf" onchange="pick(\''+n+'\')"></label><div id="ul"></div><p id="ov" class="mu"></p>'+
  '<div class="ft"><button class="btn s" onclick="cl()">Selesai</button><button class="btn" id="go" onclick="run(\''+n+'\',\''+id+'\')" disabled>Unggah semua</button></div>');
  if(G)gpl()}
function gpl(){$('gp').innerHTML='<option value="">Dokumen umum vendor (NIB, NPWP, dll.)</option>'+pOf($('gv').value).map(function(p){return '<option value="'+p.ID+'">Project: '+esc(p.Tahun+' · '+p.Nama)+'</option>'}).join('');pick('G')}
function pick(n){
  FILES=[].slice.call($('fl').files);var js=n=='G'?($('gp').value?D.jenisP:D.jenisV):n=='Vendor'?D.jenisV:D.jenisP;
  $('ul').innerHTML=FILES.length?'<div class="uh"><span>File</span><span>Jenis dokumen</span><span>Berlaku sampai</span><span>Status</span></div>'+FILES.map(function(f){return '<div class="ur"><span class="fn">📄 '+esc(f.name)+'</span><select>'+js.map(function(j){return '<option>'+esc(j)+'</option>'}).join('')+'</select><input type="date" title="Berlaku sampai (opsional)"><span class="st">Menunggu</span></div>'}).join(''):'';
  $('go').disabled=!FILES.length}
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
  google.script.run.withSuccessHandler(function(){D.dok=D.dok.filter(function(x){return x.ID!=id});render();det(DT[0],DT[1])}).withFailureHandler(function(e){alert(e.message)}).deleteDoc(id)}
load();
