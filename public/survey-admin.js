let surveyRows=[];
async function surveys(){
  if(!['superadmin','department_admin'].includes(me?.role))return adminLogin();
  try{
    const data=await api('/api/surveys');surveyRows=data.surveys;
    const scoped=me.role==='department_admin';
    shell(`<section class="card hero"><div class="eyebrow">2026 ASSOCIATION SURVEY</div><h1>${scoped?`${e(me.department)}问卷`:'协会信息问卷'}</h1><p>${scoped?'仅查看本部门提交的问卷。':'查看全部问卷提交结果。'}</p></section><section class="card survey-panel"><div class="survey-toolbar"><div><h2>问卷记录</h2><p class="hint">共 ${surveyRows.length} 份</p></div><button class="primary" onclick="location.href='/api/surveys/export'">导出表格</button></div><input id="surveySearch" class="survey-search" placeholder="搜索姓名、学院、班级或学号" oninput="filterSurveys()"><div id="surveyList"></div></section>`,'surveys');
    filterSurveys();
  }catch(error){alert(error.message)}
}
function filterSurveys(){
  const query=(document.querySelector('#surveySearch')?.value||'').trim().toLowerCase();
  const rows=surveyRows.filter(row=>[row.name,row.college,row.class_name,row.student_id].join(' ').toLowerCase().includes(query));
  const format=value=>value?e(value):'—';
  document.querySelector('#surveyList').innerHTML=rows.length?`<div class="survey-list">${rows.map(row=>`<article class="survey-record"><details class="survey-details"><summary class="survey-heading"><strong>${format(row.name)}</strong><span>${row.is_member?(row.member_type==='party'?'党员':'团员'):'非团员/党员'}</span></summary><dl><div><dt>性别</dt><dd>${format(row.gender)}</dd></div><div><dt>学院</dt><dd>${format(row.college)}</dd></div><div><dt>班级</dt><dd>${format(row.class_name)}</dd></div><div><dt>学号</dt><dd>${format(row.student_id)}</dd></div><div><dt>手机号码</dt><dd>${format(row.phone)}</dd></div><div><dt>部门</dt><dd>${format(row.department)}</dd></div><div><dt>提交时间</dt><dd>${new Date(row.created_at).toLocaleString('zh-CN',{hour12:false})}</dd></div>${row.is_member?`<div><dt>出生年月</dt><dd>${format(row.birth_month)}</dd></div><div><dt>民族</dt><dd>${format(row.ethnicity)}</dd></div><div><dt>籍贯</dt><dd>${format(row.native_place)}</dd></div><div><dt>${row.member_type==='party'?'入党时间':'入团时间'}</dt><dd>${format(row.joined_month)}</dd></div><div><dt>${row.member_type==='party'?'基层党支部':'基层团支部'}</dt><dd>${format(row.branch)}</dd></div>`:''}</dl></details></article>`).join('')}</div>`:'<div class="empty">暂无匹配的问卷记录</div>';
}
