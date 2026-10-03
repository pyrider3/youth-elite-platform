const app=document.querySelector('#app');
let rows=[];
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
async function request(url,options={}){
  const response=await fetch(url,{credentials:'same-origin',cache:'no-store',...options});
  if(!response.ok){let message='操作失败';try{message=(await response.json()).error||message}catch{}throw Error(message)}
  return response.headers.get('content-type')?.includes('application/json')?response.json():response;
}
function showLogin(message=''){
  app.innerHTML=`<div class="login-wrap"><form class="login" id="loginForm"><div class="mark">✳</div><h1>报名管理</h1><p>大数据分析与机器学习实践社<br>请输入管理员密码，查看报名信息。</p><label for="password">管理员密码</label><input class="password" id="password" type="password" autocomplete="current-password" required><button type="submit">进入后台</button><p class="error" id="loginError" ${message?'':'hidden'}>${escapeHtml(message)}</p><a class="login-link" href="https://new.qnjyxh.xyz/dsj">查看报名页面 →</a></form></div>`;
  document.querySelector('#loginForm').addEventListener('submit',async event=>{
    event.preventDefault();const button=event.target.querySelector('button');button.disabled=true;button.textContent='正在登录…';
    try{await request('/api/dsj-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:document.querySelector('#password').value})});await loadRows()}
    catch(error){document.querySelector('#loginError').hidden=false;document.querySelector('#loginError').textContent=error.message;button.disabled=false;button.textContent='进入后台'}
  });
}
function render(){
  app.innerHTML=`<div class="shell"><header class="top"><div class="brand"><span class="mark">✳</span><span>大数据分析与<br>机器学习实践社</span></div><div class="top-actions"><button class="quiet" id="refresh">刷新</button><button class="quiet" id="logout">退出</button></div></header><section class="hero"><div class="eyebrow">APPLICATION CENTER</div><h1>报名管理</h1><p>查看每位报名者的信息，及时与他们取得联系。</p></section><div class="toolbar"><div><h2>报名记录</h2><p>共有 ${rows.length} 位同学报名</p></div><button class="export" id="export">↓ 导出表格</button></div><div class="filters"><input id="search" type="search" placeholder="搜索姓名、学院、联系方式" aria-label="搜索报名信息"><select id="grade" aria-label="筛选年级"><option value="">全部年级</option><option>大一</option><option>大二</option></select></div><div class="count" id="count"></div><section class="cards" id="cards" aria-label="报名记录"></section></div>`;
  document.querySelector('#search').addEventListener('input',filterRows);
  document.querySelector('#grade').addEventListener('change',filterRows);
  document.querySelector('#refresh').addEventListener('click',loadRows);
  document.querySelector('#export').addEventListener('click',()=>{location.href='/api/dsj-applications/export'});
  document.querySelector('#logout').addEventListener('click',async()=>{await request('/api/logout',{method:'POST'});showLogin()});
  filterRows();
}
function filterRows(){
  const query=document.querySelector('#search').value.trim().toLowerCase();
  const grade=document.querySelector('#grade').value;
  const filtered=rows.filter(row=>(!grade||row.grade===grade)&&(!query||[row.name,row.college,row.contact,row.introduction].join(' ').toLowerCase().includes(query)));
  document.querySelector('#count').textContent=query||grade?`筛选结果：${filtered.length} 条`:`最新报名 · ${filtered.length} 条`;
  document.querySelector('#cards').innerHTML=filtered.length?filtered.map(row=>{
    const date=new Date(row.created_at).toLocaleString('zh-CN',{hour12:false});
    return `<article class="card"><div class="card-head"><div><strong>${escapeHtml(row.name)}</strong><span class="badge">${escapeHtml(row.grade)}</span></div><time class="date">${escapeHtml(date)}</time></div><div class="data"><div><small>学院</small><span>${escapeHtml(row.college)}</span></div><div><small>联系方式</small><span>${escapeHtml(row.contact)}</span></div></div><div class="intro"><b>自我介绍</b>${row.introduction?escapeHtml(row.introduction):'未填写'}</div></article>`;
  }).join(''):'<div class="empty">暂无符合条件的报名记录</div>';
}
async function loadRows(){try{rows=(await request('/api/dsj-applications')).applications;render()}catch(error){showLogin(error.message)}}
async function init(){
  try{
    const session=await request('/api/me');
    if(['superadmin','application_viewer','dsj_admin'].includes(session.user?.role)) await loadRows();
    else showLogin();
  }catch{showLogin()}
}
init();
