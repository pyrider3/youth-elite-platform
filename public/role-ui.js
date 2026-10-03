// Role-aware navigation and application-management actions.
shell = function(content, tab = 'entry') {
  const isSuper = me?.role === 'superadmin';
  const isDepartment = me?.role === 'department_admin';
  const isAuditAdmin = me?.role === 'audit_admin';
  const isApplicationViewer = me?.role === 'application_viewer';
  const navigation = isSuper
    ? `<button class="${tab==='entry'?'active':''}" onclick="entry()">登记</button><button class="${tab==='stats'?'active':''}" onclick="stats()">统计</button><button class="${tab==='review'?'active':''}" onclick="review()">审核</button><button class="${tab==='applications'?'active':''}" onclick="applications()">报名</button><button class="${tab==='dsj'?'active':''}" onclick="dsjApplications()">大数据社</button><button class="${tab==='surveys'?'active':''}" onclick="surveys()">问卷</button><button class="ghost" onclick="logout()">退出</button>`
    : isDepartment
      ? `<button class="${tab==='applications'?'active':''}" onclick="applications()">${e(me.department)}报名</button><button class="${tab==='surveys'?'active':''}" onclick="surveys()">${e(me.department)}问卷</button><button class="ghost" onclick="logout()">退出</button>`
      : isAuditAdmin
        ? `<button class="active" onclick="review()">审核</button><button class="ghost" onclick="logout()">退出</button>`
        : isApplicationViewer
          ? `<button class="${tab==='applications'?'active':''}" onclick="applications()">青年菁英报名</button><button class="${tab==='dsj'?'active':''}" onclick="dsjApplications()">大数据社报名</button><button class="ghost" onclick="logout()">退出</button>`
        : `<button class="${tab==='entry'?'active':''}" onclick="entry()">登记</button><button class="${tab==='stats'?'active':''}" onclick="stats()">统计</button><button class="ghost" onclick="adminLogin()">管理员登录</button>`;
  app.innerHTML = `<div class="shell"><header class="top"><div class="brand"><div class="mark">Y</div><div>青年菁英生涯发展协会<div class="sub">${isDepartment ? e(me.label) : 'VOLUNTEER HOURS SYSTEM'}</div></div></div><div class="nav">${navigation}</div></header>${content}</div>`;
};

go = async function(event) {
  event.preventDefault();
  try {
    me = (await api('/api/login',{method:'POST',body:JSON.stringify({password:new FormData(event.target).get('password')})})).user;
    ['department_admin','application_viewer'].includes(me.role) ? applications() : review();
  } catch (error) { alert(error.message); }
};

applications = async function() {
  const data = await api('/api/applications');
  applicationRows = data.applications;
  const scoped = me?.role === 'department_admin';
  const readOnly = me?.role === 'application_viewer';
  if (scoped) window.applicationInterest = '';
  const departmentOptions = scoped ? '' : ['办公室','新媒体','项目部','实践部'].map(item=>`<option>${item}</option>`).join('');
  shell(`<section class="card hero applications-hero"><div><div class="eyebrow">${scoped ? 'DEPARTMENT APPLICATIONS' : readOnly ? 'READ ONLY APPLICATIONS' : 'ASSOCIATION APPLICATIONS'}</div><h1>${scoped ? `${e(me.department)}报名管理` : readOnly ? '报名表查看' : '协会报名管理'}</h1><p>${scoped ? '仅展示第一意向或其他意向选择本部门的报名信息。' : readOnly ? '可查看全部报名信息并使用搜索、筛选功能；此账号没有任何修改权限。' : '集中查看、筛选、导出或删除新成员报名记录。'}</p></div>${readOnly ? '' : `<button class="primary export" onclick="exportApplications()">导出名单</button>`}</section><section class="application-dashboard"><article class="card application-metric"><small>${scoped ? '本部门报名' : '全部报名'}</small><strong>${applicationRows.length}</strong><span>份</span></article><article class="card application-metric"><small>大一报名</small><strong>${applicationRows.filter(x=>x.grade==='大一').length}</strong><span>人</span></article><article class="card application-metric"><small>大二报名</small><strong>${applicationRows.filter(x=>x.grade==='大二').length}</strong><span>人</span></article></section><section class="card applications-panel">${scoped ? `<div class="application-interest-filter"><span>报名意向筛选</span><div><button class="active" onclick="setApplicationInterest('',this)">全部相关</button><button onclick="setApplicationInterest('primary',this)">仅第一志愿</button><button onclick="setApplicationInterest('secondary',this)">仅其他意向</button></div></div>` : ''}<div class="applications-toolbar"><label class="application-search"><span>⌕</span><input id="applicationSearch" placeholder="搜索姓名、学院、部门或联系方式" oninput="filterApplications()"></label><select id="applicationGrade" onchange="filterApplications()"><option value="">全部年级</option><option>大一</option><option>大二</option></select>${scoped ? '' : `<select id="applicationDepartment" onchange="filterApplications()"><option value="">全部部门</option>${departmentOptions}</select>`}</div><div id="applicationResult"></div></section>`,'applications');
  renderApplications(applicationRows);
};

filterApplications = function() {
  const query = (document.querySelector('#applicationSearch')?.value || '').trim().toLowerCase();
  const grade = document.querySelector('#applicationGrade')?.value || '';
  const department = document.querySelector('#applicationDepartment')?.value || '';
  const interest = window.applicationInterest || '';
  renderApplications(applicationRows.filter(row => (!grade || row.grade === grade) && (!department || row.department === department || row.other_department === department) && (!interest || (interest === 'primary' ? row.department === me?.department : row.other_department === me?.department)) && (!query || [row.name,row.college,row.department,row.other_department,row.contact,row.introduction,row.note].join(' ').toLowerCase().includes(query))));
};

window.applicationInterest = '';
setApplicationInterest = function(value, button) {
  window.applicationInterest = value;
  document.querySelectorAll('.application-interest-filter button').forEach(item => item.classList.toggle('active', item === button));
  filterApplications();
};

renderApplications = function(rows) {
  const root = document.querySelector('#applicationResult'); if (!root) return;
  const format = time => time ? new Date(time).toLocaleString('zh-CN',{hour12:false}) : '—';
  const isSuper = me?.role === 'superadmin';
  root.innerHTML = `<div class="application-result-head"><b>报名列表</b><span>显示 ${rows.length} / ${applicationRows.length} 份</span></div>${rows.length ? `<div class="application-list">${rows.map(row=>`<article class="application-card"><div class="application-head"><div class="application-person"><b>${e(row.name)}</b><span>${e(row.grade)}</span></div><time>${format(row.created_at)}</time></div><div class="application-tags"><span>${e(row.college)}</span><strong>${e(row.department)}</strong>${row.other_department?`<span>兼报 ${e(row.other_department)}</span>`:''}</div><div class="application-contact"><span>联系方式</span><b>${e(row.contact)}</b><button onclick="copyApplicationContact('${e(row.contact)}',this)">复制</button></div><details class="application-details"><summary>查看完整报名信息 <span>⌄</span></summary><div class="application-copy"><small>自我介绍</small><p>${e(row.introduction)}</p></div>${row.note?`<div class="application-copy application-note"><small>备注</small><p>${e(row.note)}</p></div>`:''}</details>${isSuper?`<button class="application-delete" onclick="deleteApplication(${row.id},'${e(row.name)}')">删除报名</button>`:''}</article>`).join('')}</div>` : '<div class="empty">没有找到匹配的报名信息</div>'}`;
};

deleteApplication = async function(id, name) {
  if (!confirm(`确定删除 ${name} 的报名记录吗？此操作无法撤销。`)) return;
  try { await api(`/api/applications/${id}`,{method:'DELETE'}); applications(); } catch (error) { alert(error.message); }
};

api('/api/me').then(({user}) => {
  if (!user) return;
  me = user;
  ['department_admin','application_viewer'].includes(user.role) ? applications() : ['superadmin','audit_admin'].includes(user.role) ? review() : entry();
}).catch(() => {});
