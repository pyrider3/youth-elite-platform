const app=document.querySelector('#app');
let tasks=[],poller=null,selectedFile=null;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
async function api(url,options={}){
  const response=await fetch(url,{credentials:'same-origin',cache:'no-store',...options});
  let data={};try{data=await response.json()}catch{}
  if(!response.ok)throw Error(data.error||'请求失败');return data;
}
function login(message=''){
  clearInterval(poller);
  app.innerHTML=`<div class="login-wrap"><form class="login" id="login"><div class="brand-mark">✦</div><h1>菁英文件协助处理</h1><p>上传文件，描述你想完成的工作，可选择 Codex 或 Antigravity 协助处理。</p><label for="password">管理员密码</label><input id="password" class="password" type="password" autocomplete="current-password" required><button class="submit">进入工具</button><p class="error" id="error" ${message?'':'hidden'}>${esc(message)}</p></form></div>`;
  document.querySelector('#login').addEventListener('submit',async event=>{
    event.preventDefault();const button=event.target.querySelector('button');button.disabled=true;button.textContent='正在登录…';
    try{const result=await api('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:document.querySelector('#password').value})});if(!['superadmin','application_viewer'].includes(result.user?.role))throw Error('仅授权管理员可使用');await load()}
    catch(error){document.querySelector('#error').hidden=false;document.querySelector('#error').textContent=error.message;button.disabled=false;button.textContent='进入工具'}
  });
}
function page(){
  app.innerHTML=`<div class="layout"><header class="top"><div class="brand"><span class="brand-mark">✦</span><span>青年菁英 · 文件协助处理</span></div><button id="logout">退出登录</button></header><section class="hero"><div class="eyebrow">YOUTH ELITE · FILE ASSISTANT</div><h1>把繁琐的文件工作，交给 AI 协助</h1><p>上传一个文件，告诉我想怎么处理；完成后直接下载结果。</p></section><div class="columns"><section class="panel"><h2>新建处理任务</h2><p class="sub">支持单个文件，最大 15 MB</p><label class="label">1. 上传文件</label><label class="drop" id="drop"><div><strong>点击选择或拖入文件</strong><span>TXT / MD / CSV / JSON / PDF / Word / Excel / PPT / PNG / JPG</span></div><input id="file" type="file" accept=".txt,.md,.csv,.json,.pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg"></label><div class="selected" id="selected"></div><label class="label" for="instruction">2. 描述处理要求</label><textarea class="prompt" id="instruction" maxlength="2000" placeholder="例如：把这份表格按学院汇总，并生成一份新的 Excel 文件。"></textarea><div class="examples"><button type="button" data-example="把这份文件整理成清晰的摘要，输出为 Markdown 文件。">整理摘要</button><button type="button" data-example="检查文件中的错别字与表达问题，生成一份修订后的文件。">检查文字</button><button type="button" data-example="分析表格数据并制作简洁的统计结果，输出为新文件。">分析数据</button></div><label class="label">3. 选择处理 AI</label><div class="engine-options" role="radiogroup" aria-label="处理 AI"><label class="engine-option"><input type="radio" name="engine" value="codex" checked><span><strong>Codex</strong><small>适合复杂文件处理</small></span></label><label class="engine-option"><input type="radio" name="engine" value="antigravity"><span><strong>Antigravity</strong><small>使用本机 Antigravity CLI</small></span></label></div><p class="engine-hint">选择哪个就只使用哪个；Antigravity 会在沙箱内自动批准处理所需操作。</p><button class="submit" id="submit">开始处理</button><p class="error" id="error" hidden></p><p class="notice">仅授权管理员可使用。文件会由你选择的本机 AI 工具调用云端模型处理，内容可能发送至模型服务。请勿上传不宜共享的敏感资料。</p></section><section class="panel"><h2>处理进度</h2><p class="sub">任务按顺序处理；页面可刷新查看结果</p><div id="jobs"></div></section></div></div>`;
  const input=document.querySelector('#file'),drop=document.querySelector('#drop');
  input.addEventListener('change',()=>{selectedFile=input.files[0]||null;showFile()});
  drop.addEventListener('dragover',event=>{event.preventDefault();drop.classList.add('drag')});
  drop.addEventListener('dragleave',()=>drop.classList.remove('drag'));
  drop.addEventListener('drop',event=>{event.preventDefault();drop.classList.remove('drag');selectedFile=event.dataTransfer.files[0]||null;showFile()});
  document.querySelectorAll('[data-example]').forEach(button=>button.addEventListener('click',()=>{document.querySelector('#instruction').value=button.dataset.example}));
  document.querySelector('#submit').addEventListener('click',submit);
  document.querySelector('#logout').addEventListener('click',async()=>{await api('/api/logout',{method:'POST'});login()});
  renderTasks();
}
function showFile(){document.querySelector('#selected').textContent=selectedFile?`${selectedFile.name} · ${(selectedFile.size/1024/1024).toFixed(2)} MB`:''}
function renderTasks(){
  const root=document.querySelector('#jobs');if(!root)return;
  root.innerHTML=tasks.length?tasks.map(job=>{
    const state=job.status==='completed'?'已完成':job.status==='failed'?'失败':job.status==='running'?'处理中':'排队中';
    const files=(job.files||[]).map(file=>`<a href="/api/file-jobs/${job.id}/files/${encodeURIComponent(file.name)}" download>${esc(file.name)} ↓</a>`).join('');
    const engineLabel=job.engine==='antigravity'?'Antigravity':'Codex';
    return `<article class="job"><div class="job-name">${esc(job.name)}</div><div class="job-meta">${esc(engineLabel)} · ${esc(new Date(job.createdAt).toLocaleString('zh-CN',{hour12:false}))}</div><div class="stage"><span>${esc(job.stage)}</span><span class="pill ${esc(job.status)}">${state}</span></div>${job.status==='running'||job.status==='queued'?'<div class="progress"><span></span></div>':job.status==='completed'?'<div class="progress done"><span></span></div>':''}${job.error?`<p class="job-error">${esc(job.error)}</p>`:''}${job.summary?`<p class="job-summary">${esc(job.summary)}</p>`:''}${files?`<div class="files">${files}</div>`:''}${['completed','failed'].includes(job.status)?`<button class="remove-job" type="button" data-id="${job.id}">删除任务与文件</button>`:''}</article>`;
  }).join(''):'<div class="empty">还没有处理任务</div>';
  root.querySelectorAll('.remove-job').forEach(button=>button.addEventListener('click',async()=>{
    if(!confirm('确定删除这个任务及其上传、生成的文件吗？删除后无法恢复。'))return;
    try{await api(`/api/file-jobs/${button.dataset.id}`,{method:'DELETE'});await refresh()}catch(error){alert(error.message)}
  }));
}
async function refresh(){try{tasks=(await api('/api/file-jobs')).jobs;renderTasks()}catch(error){if(error.message.includes('管理员'))login()}}
async function load(){tasks=(await api('/api/file-jobs')).jobs;page();clearInterval(poller);poller=setInterval(refresh,2500)}
function readBase64(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(Error('读取文件失败'));reader.readAsDataURL(file)})}
async function submit(){
  const instruction=document.querySelector('#instruction').value.trim(),error=document.querySelector('#error'),button=document.querySelector('#submit');
  error.hidden=true;
  if(!selectedFile){error.textContent='请先选择文件';error.hidden=false;return}
  if(selectedFile.size>15*1024*1024){error.textContent='文件不能超过 15 MB';error.hidden=false;return}
  if(instruction.length<5){error.textContent='请写清楚你希望如何处理文件';error.hidden=false;return}
  button.disabled=true;button.textContent='正在上传…';
  try{const data=await readBase64(selectedFile);const engine=document.querySelector('input[name="engine"]:checked').value;await api('/api/file-jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:selectedFile.name,data,instruction,engine})});selectedFile=null;document.querySelector('#file').value='';showFile();document.querySelector('#instruction').value='';await refresh()}
  catch(failure){error.textContent=failure.message;error.hidden=false}
  finally{button.disabled=false;button.textContent='开始处理'}
}
async function init(){try{const session=await api('/api/me');if(['superadmin','application_viewer'].includes(session.user?.role))await load();else login()}catch{login()}}
init();
