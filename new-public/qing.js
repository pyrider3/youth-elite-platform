const fields = [
  { key: 'name', text: '先从认识你开始吧。<br>你叫什么名字？', hint: '请填写真实姓名', type: 'input', placeholder: '输入你的姓名' },
  { key: 'grade', text: '很高兴认识你，{name}！<br>你现在是几年级呢？', hint: '点击选择一个答案', options: ['大一', '大二'] },
  { key: 'college', text: '你的学院是？', hint: '例如：工商管理学院', type: 'input', placeholder: '输入你的学院' },
  { key: 'department', text: '如果加入我们，<br>你最想去哪个部门？', hint: '先看看每个部门在做什么，再选择吧', options: ['办公室', '新媒体', '项目部', '实践部'] },
  { key: 'other_department', text: '还有第二个感兴趣的部门吗？', hint: '这题可以跳过，也可以再看看部门介绍', options: ['暂不选择', '办公室', '新媒体', '项目部', '实践部'], optional: true },
  { key: 'introduction', text: '最后，请用几句话介绍自己吧。', hint: '可以写写你的优势、经历或期待参与的工作', type: 'textarea', placeholder: '和小菁说说你自己…' },
  { key: 'contact', text: '留下一个联系方式，<br>方便我们联系你。', hint: '手机号或微信号', type: 'input', placeholder: '输入手机号或微信号' },
];

const departments = [
  ['办公室', '社团统筹核心，负责值班、文件、会议与文书工作。'],
  ['新媒体', '运营官方就业平台，负责推文、海报和信息推送。'],
  ['项目部', '对接校企资源，洽谈合作、策划项目与整合服务。'],
  ['实践部', '负责活动现场执行、后勤保障与现场沟通。'],
];

const data = {};
const bubble = document.querySelector('#bubble');
const hint = document.querySelector('#hint');
const answer = document.querySelector('#answer');
const next = document.querySelector('#next');
const back = document.querySelector('#back');
const count = document.querySelector('#stepCount');
const mascot = document.querySelector('#mascot');
const manualSignup = document.querySelector('#manualSignup');
const segments = [...document.querySelectorAll('.progress i')];
let step = -1;

const safe = value => String(value || '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
const message = text => text.replace('{name}', safe(data.name || '同学'));

function react(mood, duration = 1100) {
  window.dispatchEvent(new CustomEvent('xiaojing-react', { detail: { mood, duration } }));
}

function reactFrom(moods, duration = 1000) {
  react(moods[Math.floor(Math.random() * moods.length)], duration);
}

function createDepartmentGuide() {
  const guide = document.createElement('aside');
  guide.className = 'department-guide swap';
  guide.setAttribute('aria-label', '部门介绍');
  guide.innerHTML = '<p>四个部门，四种成长方向</p>' + departments.map(([name, description]) => `<article><strong>${name}</strong><span>${description}</span></article>`).join('');
  return guide;
}

function render() {
  const current = fields[step];
  document.body.dataset.step = String(step);
  manualSignup.hidden = true;
  next.onclick = advance;
  reactFrom(current.options ? ['thinking', 'curious', 'gesture-think', 'gesture-listen', 'nod', 'peek'] : ['wave', 'gesture-wave', 'happy', 'welcome', 'heart'], current.options ? 1200 : 950);
  bubble.classList.remove('swap');
  void bubble.offsetWidth;
  bubble.classList.add('swap');
  bubble.innerHTML = message(current.text);
  hint.textContent = current.hint;
  count.textContent = `${step + 1} / ${fields.length}`;
  segments.forEach((segment, index) => segment.classList.toggle('active', index <= step));
  back.classList.toggle('show', step > 0);
  answer.innerHTML = '';
  answer.className = 'answer swap';
  next.innerHTML = step === fields.length - 1 ? '提交报名 <span>✓</span>' : current.optional ? '跳过 <span>→</span>' : '继续 <span>→</span>';

  if (current.options) {
    const list = document.createElement('div');
    list.className = 'options';
    current.options.forEach(value => {
      const item = document.querySelector('#choice').content.firstElementChild.cloneNode(true);
      item.dataset.value = value;
      const profile = departments.find(([name]) => name === value);
      if (profile && (current.key === 'department' || current.key === 'other_department')) {
        item.classList.add('department-choice');
        item.innerHTML = `<strong>${safe(value)}</strong><small>${safe(profile[1])}</small>`;
      } else {
        item.textContent = value;
      }
      item.classList.toggle('selected', data[current.key] === value);
      item.onclick = () => {
        data[current.key] = value;
        [...list.children].forEach(button => button.classList.toggle('selected', button.dataset.value === value));
        react('celebrate', 950);
        setTimeout(() => advance(), 280);
      };
      list.append(item);
    });
    answer.append(list);
    return;
  }

  const input = document.createElement(current.type === 'textarea' ? 'textarea' : 'input');
  input.className = `field ${current.type === 'textarea' ? 'textarea' : ''}`;
  input.placeholder = current.placeholder;
  input.value = data[current.key] || '';
  input.addEventListener('input', () => {
    data[current.key] = input.value.trim();
    react('typing', 550);
  });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && current.type !== 'textarea') {
      event.preventDefault();
      advance();
    }
  });
  answer.append(input);
  setTimeout(() => input.focus(), 160);
}

function advance() {
  if (step === -1) {
    step = 0;
    reactFrom(['celebrate', 'happy', 'gesture-wave', 'twirl', 'welcome'], 950);
    render();
    return;
  }
  const current = fields[step];
  if (!current.optional && !String(data[current.key] || '').trim()) {
    const field = answer.querySelector('.field');
    if (field) {
      field.focus();
      field.style.borderColor = '#df6071';
      react('thinking', 1000);
      setTimeout(() => { field.style.borderColor = ''; }, 700);
    }
    return;
  }
  if (current.optional && !data[current.key]) data[current.key] = '';
  if (step < fields.length - 1) {
    reactFrom(['celebrate', 'happy', 'gesture-clap', 'gesture-stretch', 'heart', 'twirl'], 950);
    step += 1;
    render();
  } else {
    submit();
  }
}

async function submit() {
  next.disabled = true;
  next.textContent = '小菁正在提交…';
  react('thinking', 2500);
  try {
    const response = await fetch('/api/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, note: '来自小菁对话式报名' }) });
    const result = await response.json();
    if (!response.ok) throw Error(result.error);
    react('success', 3000);
    bubble.innerHTML = `欢迎加入我们，${safe(data.name)}！`;
    hint.textContent = '报名信息已经安全送达。';
    answer.className = 'answer success swap';
    answer.innerHTML = '<div class="tick">✓</div><h2>报名提交成功</h2><p>协会将尽快与你联系，期待和你一起做很酷的事。</p>';
    next.style.display = 'none';
    back.style.display = 'none';
  } catch (error) {
    alert(error.message || '提交失败，请稍后重试。');
    next.disabled = false;
    next.innerHTML = '提交报名 <span>✓</span>';
    react('wave', 900);
  }
}

function intro() {
  document.body.dataset.step = '-1';
  react('wave', 1800);
  bubble.innerHTML = '你好，我叫小菁。<br>欢迎加入山西财经大学就业协会<br>青年菁英生涯发展协会！';
  hint.textContent = '我会用几个小问题认识你，提交完成后协会会尽快与你联系。';
  manualSignup.hidden = false;
  answer.innerHTML = '';
  count.textContent = '1 / 7';
  segments.forEach(segment => segment.classList.remove('active'));
  back.classList.remove('show');
  next.innerHTML = '开始聊聊 <span>→</span>';
  next.onclick = advance;
}

const departmentStyle = document.createElement('style');
departmentStyle.textContent = `.choice.department-choice{min-height:86px;padding:10px 11px;text-align:left}.choice.department-choice strong{display:block;margin-bottom:5px;font-size:15px}.choice.department-choice small{display:block;color:#77839d;font-size:10px;font-weight:500;line-height:1.38}.choice.department-choice.selected small{color:#eef0ff}@media(max-width:500px){.choice.department-choice{min-height:80px;padding:9px}.choice.department-choice strong{margin-bottom:4px;font-size:14px}.choice.department-choice small{font-size:9px;line-height:1.32}}`;
document.head.append(departmentStyle);
const viewportStyle = document.createElement('style');
viewportStyle.textContent = `
  header a span{display:block;white-space:nowrap}.action-area{width:100%;max-width:540px;margin:0 auto;text-align:center}.action-area .manual-link{display:inline-block;color:#6376d9;font-size:12px;font-weight:700;text-decoration:none;transition:opacity .2s,transform .2s}.action-area .manual-link:active{opacity:.65;transform:scale(.98)}.action-area .actions{max-width:none;margin:7px 0 0}
  @media(max-width:560px){
    html,body{height:100dvh;overflow:hidden}
    .app{height:100dvh;min-height:100dvh;padding:14px 18px max(14px,env(safe-area-inset-bottom));overflow:hidden}
    header{min-height:28px}.chat{flex:0 0 auto!important;padding:210px 4px 7px!important}body[data-step="-1"] .chat,body[data-step="0"] .chat,body[data-step="1"] .chat,body[data-step="2"] .chat{padding-top:278px!important}.bubble{padding:15px 17px!important;font-size:18px!important;line-height:1.42}.chat p{margin:8px 0 0!important;font-size:12px!important}.action-area{margin:9px auto 0}
    .answer{min-height:0!important;margin:0 auto auto!important}.actions{margin:10px auto 0!important}.actions button{height:50px!important}
    .options{gap:8px!important}.choice{min-height:48px!important}.choice.department-choice{min-height:70px!important;padding:8px!important}.choice.department-choice strong{font-size:13px!important;margin-bottom:3px!important}.choice.department-choice small{font-size:8.5px!important;line-height:1.25!important}
    .avatar-wrap{top:52px!important}
  }
  @media(max-width:560px) and (max-height:760px){
    .app{padding-top:11px!important;padding-bottom:11px!important}.chat,body[data-step="-1"] .chat,body[data-step="0"] .chat,body[data-step="1"] .chat,body[data-step="2"] .chat{padding-top:195px!important}.avatar-wrap{top:38px!important}.bubble{padding:12px 15px!important;font-size:16px!important}.chat p{font-size:11px!important}.actions{margin-top:7px!important}.actions button{height:46px!important}.choice.department-choice{min-height:62px!important}.choice.department-choice small{font-size:8px!important}
  }
`;
document.head.append(viewportStyle);
back.onclick = () => {
  if (step > 0) {
    step -= 1;
    render();
  } else if (step === 0) {
    step = -1;
    intro();
  }
};
intro();
