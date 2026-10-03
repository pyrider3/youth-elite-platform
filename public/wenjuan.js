const form=document.querySelector('#survey');
const memberFields=document.querySelector('#memberFields');
const memberNames=['birth_month','ethnicity','native_place','joined_month','branch'];
const selects=[...document.querySelectorAll('.custom-select')];
function closeSelect(select,restoreFocus=false){
  select.querySelector('.select-options').hidden=true;
  select.querySelector('.select-trigger').setAttribute('aria-expanded','false');
  if(restoreFocus)select.querySelector('.select-trigger').focus();
}
function openSelect(select){
  selects.forEach(other=>{if(other!==select)closeSelect(other)});
  select.querySelector('.select-options').hidden=false;
  select.querySelector('.select-trigger').setAttribute('aria-expanded','true');
  const selected=select.querySelector('[aria-selected="true"]');
  (selected||select.querySelector('[role="option"]')).focus();
}
for(const select of selects){
  const trigger=select.querySelector('.select-trigger');
  const options=[...select.querySelectorAll('[role="option"]')];
  trigger.addEventListener('click',()=>select.querySelector('.select-options').hidden?openSelect(select):closeSelect(select));
  trigger.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp','Enter',' '].includes(event.key)){event.preventDefault();openSelect(select)}});
  options.forEach((option,index)=>{
    option.addEventListener('click',()=>{
      select.querySelector('input').value=option.dataset.value;
      select.querySelector('.select-value').textContent=option.textContent;
      select.querySelector('.select-value').classList.remove('placeholder');
      options.forEach(item=>item.setAttribute('aria-selected',String(item===option)));
      trigger.classList.remove('invalid');
      closeSelect(select,true);
    });
    option.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();closeSelect(select,true)}
      if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();options[(index+(event.key==='ArrowDown'?1:-1)+options.length)%options.length].focus()}
      if(event.key==='Home'){event.preventDefault();options[0].focus()}
      if(event.key==='End'){event.preventDefault();options.at(-1).focus()}
    });
  });
}
document.addEventListener('pointerdown',event=>{for(const select of selects)if(!select.contains(event.target))closeSelect(select)});
document.addEventListener('focusin',event=>{for(const select of selects)if(!select.contains(event.target))closeSelect(select)});
function updateMemberFields(){
  const isMember=form.elements.is_member.value==='yes';
  memberFields.hidden=!isMember;
  for(const radio of form.querySelectorAll('[name="member_type"]'))radio.required=isMember;
  if(!isMember)for(const radio of form.querySelectorAll('[name="member_type"]'))radio.checked=false;
  const isParty=form.elements.member_type.value==='party';
  document.querySelector('#memberHeading').textContent=isParty?'党员信息':isMember?'团员信息':'成员信息';
  document.querySelector('#joinedLabel').textContent=isParty?'入党时间':'入团时间';
  document.querySelector('#branchLabel').textContent=isParty?'所属基层党支部':'所属学院（专业）基层团支部';
  form.elements.branch.placeholder=isParty?'请填写所属基层党支部':'一般填写所在班级团支部';
  for(const name of memberNames)form.elements[name].required=isMember;
}
form.addEventListener('change',event=>{if(['is_member','member_type'].includes(event.target.name))updateMemberFields()});
form.addEventListener('submit',async event=>{
  event.preventDefault();
  updateMemberFields();
  const message=document.querySelector('#message');
  const missing=selects.find(select=>!select.querySelector('input').value);
  if(missing){
    missing.querySelector('.select-trigger').classList.add('invalid');
    message.textContent=`请选择${missing.dataset.name==='gender'?'性别':'部门'}`;
    missing.querySelector('.select-trigger').focus();
    return;
  }
  if(!form.reportValidity())return;
  const button=document.querySelector('#submitButton');
  button.disabled=true;message.textContent='';
  const payload=Object.fromEntries(new FormData(form));
  try{
    const response=await fetch('/api/surveys',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data=await response.json();
    if(!response.ok)throw Error(data.error||'提交失败，请稍后再试');
    form.hidden=true;document.querySelector('#success').hidden=false;
  }catch(error){message.textContent=error.message;button.disabled=false}
});
