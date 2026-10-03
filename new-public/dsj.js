const steps = [
  {key:'name',question:'先认识一下，你叫什么名字？',hint:'请填写真实姓名',type:'input',placeholder:'输入你的姓名'},
  {key:'grade',question:'很高兴认识你，{name}！你现在是几年级？',hint:'选择你的年级',options:['大一','大二']},
  {key:'college',question:'你所在的学院是？',hint:'例如：工商管理学院',type:'input',placeholder:'输入学院名称'},
  {key:'introduction',question:'愿意介绍一下自己吗？',hint:'选填，可以说说你的兴趣、经历和期待',type:'textarea',placeholder:'自我介绍（可选）',optional:true},
  {key:'contact',question:'留下一个联系方式吧。',hint:'手机号或微信号，方便我们联系你。填完就可以提交了',type:'input',placeholder:'输入手机号或微信号'}
];
const values = {};
let index = -1;
let sending = false;
const $ = selector => document.querySelector(selector);
const question = $('#question'), hint = $('#hint'), answer = $('#answer');
const next = $('#next'), back = $('#back'), error = $('#error');
const motion = $('#characterMotion');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

// An original spring controller for the mascot's position. No third-party geometry or assets.
const spring = {x:0,y:0,r:0,vx:0,vy:0,vr:0,tx:0,ty:0,tr:0};
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
function animate() {
  if (!reducedMotion) {
    for (const [key,velocity,target] of [['x','vx','tx'],['y','vy','ty'],['r','vr','tr']]) {
      spring[velocity] = (spring[velocity] + (spring[target]-spring[key]) * .075) * .83;
      spring[key] += spring[velocity];
    }
    motion.style.transform = `translate(${spring.x.toFixed(2)}px,${spring.y.toFixed(2)}px) rotate(${spring.r.toFixed(2)}deg)`;
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
document.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch') return;
  spring.tx = Math.max(-14,Math.min(14,(event.clientX / innerWidth-.5)*28));
  spring.ty = Math.max(-8,Math.min(8,(event.clientY / innerHeight-.4)*16));
});
let moodTimer;
function react(mood='wave') {
  clearTimeout(moodTimer);
  motion.dataset.mood = mood;
  spring.ty = mood === 'happy' ? -16 : mood === 'shy' ? 10 : -5;
  spring.tr = mood === 'thinking' ? 11 : mood === 'shy' ? -10 : mood === 'happy' ? 8 : -5;
  moodTimer = setTimeout(() => { motion.dataset.mood = 'idle'; spring.ty = 0; spring.tr = 0; }, 1400);
}

function show() {
  error.hidden = true;
  const step = steps[index];
  $('#stepCount').textContent = `${Math.max(0,index+1)} / ${steps.length}`;
  $('#stepLabel').textContent = index < 0 ? '欢迎' : `第 ${index+1} 步`;
  $('#progressFill').style.width = `${Math.max(0,(index+1)/steps.length*100)}%`;
  back.hidden = index < 0;
  next.innerHTML = index < 0 ? '开始报名 <span aria-hidden="true">→</span>' : index === steps.length-1 ? '提交报名 <span aria-hidden="true">✓</span>' : '继续 <span aria-hidden="true">→</span>';
  if (index < 0) {
    question.textContent = '欢迎来到大数据分析与机器学习实践社！';
    hint.textContent = '用几个小问题认识你。完成后，我们会尽快与你联系。';
    answer.innerHTML = '';
    react('wave');
    return;
  }
  question.textContent = step.question.replace('{name}',values.name || '同学');
  hint.textContent = step.hint;
  question.classList.remove('slide-in'); void question.offsetWidth; question.classList.add('slide-in');
  answer.classList.remove('slide-in'); void answer.offsetWidth; answer.classList.add('slide-in');
  react(['wave','happy','thinking','surprised'][index % 4]);
  if (step.options) {
    answer.innerHTML = `<div class="options">${step.options.map(option => `<button class="choice${values[step.key]===option?' selected':''}" type="button" data-value="${escapeHtml(option)}"><strong>${escapeHtml(option)}</strong></button>`).join('')}</div>`;
    answer.querySelectorAll('.choice').forEach(button => button.addEventListener('click', () => {
      values[step.key] = button.dataset.value === '暂不选择' ? '' : button.dataset.value;
      answer.querySelectorAll('.choice').forEach(item => item.classList.toggle('selected',item===button));
      react('happy');
      setTimeout(() => { if (index < steps.length-1) {index++;show();} }, 320);
    }));
  } else {
    const field = document.createElement(step.type === 'textarea' ? 'textarea' : 'input');
    field.className = `field${step.type === 'textarea'?' textarea':''}`;
    field.placeholder = step.placeholder;
    field.value = values[step.key] || '';
    field.maxLength = step.key === 'introduction' ? 2000 : step.key === 'contact' ? 100 : 80;
    field.addEventListener('input', () => { values[step.key] = field.value.trim(); });
    field.addEventListener('keydown', event => { if (event.key==='Enter' && step.type!=='textarea') { event.preventDefault(); advance(); } });
    answer.replaceChildren(field);
  }
}

function advance() {
  if (sending) return;
  if (index < 0) {index=0;show();return;}
  const step = steps[index];
  if (!step.optional && !String(values[step.key] || '').trim()) {
    error.textContent = '请先填写或选择这一项'; error.hidden = false;
    answer.querySelector('.field')?.focus(); react('shy'); return;
  }
  if (index < steps.length-1) {index++;show();return;}
  submit();
}

async function submit() {
  sending = true; next.disabled = true; next.textContent = '正在提交…';
  try {
    const response = await fetch('/api/dsj-applications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(values)});
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || '提交失败');
    react('success');
    question.textContent = `收到你的报名啦，${values.name}！`;
    hint.textContent = '大数据分析与机器学习实践社会尽快与你联系。';
    answer.innerHTML = '<div class="success-card"><strong>✓ 报名提交成功</strong><p>感谢你的加入，期待一起探索数据与智能。</p></div>';
    back.hidden = true; next.hidden = true; error.hidden = true;
    $('#progressFill').style.width = '100%';
    answer.scrollIntoView({behavior:'smooth',block:'center'});
  } catch (failure) {
    error.textContent = failure.message || '提交失败，请稍后重试'; error.hidden = false;
    next.disabled = false; next.innerHTML = '重新提交 <span aria-hidden="true">→</span>';
    react('shy');
  } finally { sending = false; }
}

next.addEventListener('click',advance);
back.addEventListener('click',() => { if (index>0) {index--;show();} });
show();
