let dsjRows=[];
async function dsjApplications(){
  if(!['superadmin','application_viewer'].includes(me?.role))return adminLogin();
  try{
    dsjRows=(await api('/api/dsj-applications')).applications;
    shell(`<section class="card hero"><div class="eyebrow">DATA & MACHINE LEARNING</div><h1>大数据分析与机器学习实践社</h1><p>独立查看新社团的报名资料。</p></section><section class="card dsj-admin-panel"><div class="dsj-toolbar"><div><h2>报名记录</h2><p class="hint">共 ${dsjRows.length} 份</p></div><button class="primary" onclick="location.href='/api/dsj-applications/export'">导出表格</button></div><div class="dsj-filters"><input id="dsjSearch" placeholder="搜索姓名、学院或联系方式" oninput="filterDsjApplications()"><select id="dsjGrade" onchange="filterDsjApplications()"><option value="">全部年级</option><option>大一</option><option>大二</option></select></div><div id="dsjList"></div></section>`,'dsj');
    filterDsjApplications();
  }catch(error){alert(error.message)}
}
function filterDsjApplications(){
  const query=(document.querySelector('#dsjSearch')?.value||'').trim().toLowerCase();
  const grade=document.querySelector('#dsjGrade')?.value||'';
  const rows=dsjRows.filter(row=>(!grade||row.grade===grade)&&(!query||[row.name,row.college,row.contact,row.introduction].join(' ').toLowerCase().includes(query)));
  const root=document.querySelector('#dsjList');if(!root)return;
  root.innerHTML=rows.length?`<div class="dsj-list">${rows.map(row=>`<article class="dsj-card"><div class="dsj-card-head"><strong>${e(row.name)}</strong><time>${new Date(row.created_at).toLocaleString('zh-CN',{hour12:false})}</time></div><div class="dsj-tags"><span>${e(row.grade)}</span></div><dl><div><dt>学院</dt><dd>${e(row.college)}</dd></div><div><dt>联系方式</dt><dd>${e(row.contact)}</dd></div></dl><details><summary>查看完整信息</summary><p><b>自我介绍</b><br>${row.introduction?e(row.introduction):'未填写'}</p></details></article>`).join('')}</div>`:'<div class="empty">暂无符合条件的报名记录</div>';
}
