// Optional evidence image attached to the final volunteer-hours submission.
let recordAttachment = null;
const attachmentBasePreview = window.renderPreview;
const attachmentBaseSubmit = window.submit;
const attachmentBaseEntry = window.entry;

function attachmentMarkup() {
  return `<div class="record-attachment"><label class="record-attachment-picker"><input id="recordAttachmentInput" type="file" accept="image/png,image/jpeg,image/webp" onchange="selectRecordAttachment(this)"><span>＋</span><div><b>上传图片附件（可选）</b><small>作为登记凭证保存，不参与 AI 识别。支持 PNG、JPG、WebP，最大 8 MB。</small></div></label><div id="recordAttachmentInfo"></div></div>`;
}

window.entry = function () {
  recordAttachment = null;
  attachmentBaseEntry();
  document.querySelector('#result')?.insertAdjacentHTML('beforebegin', attachmentMarkup());
};

window.renderPreview = function () {
  attachmentBasePreview();
};

window.selectRecordAttachment = function (input) {
  const file = input.files?.[0];
  const info = document.querySelector('#recordAttachmentInfo');
  recordAttachment = null;
  if (!file) { if (info) info.innerHTML = ''; return; }
  if (file.size > 8 * 1024 * 1024) { input.value = ''; if (info) info.innerHTML = '<p class="attachment-error">图片附件请小于 8 MB</p>'; return; }
  const reader = new FileReader();
  reader.onload = () => {
    recordAttachment = { data: reader.result, name: file.name };
    if (info) info.innerHTML = `<div class="attachment-ready">✓ 已添加附件：${e(file.name)}</div>`;
  };
  reader.readAsDataURL(file);
};

window.submit = async function () {
  if (!parsed.length) return attachmentBaseSubmit();
  result.innerHTML = '<div class="submit-transition"><span class="loader dark"></span><b>正在提交登记记录…</b><small>请稍候</small></div>';
  try {
    const response = await api('/api/records', { method:'POST', body:JSON.stringify({ records:parsed, attachment:recordAttachment?.data || '', attachmentName:recordAttachment?.name || '' }) });
    recordAttachment = null;
    result.innerHTML = `<div class="success success-in">✓ 提交成功：${response.count} 条记录已进入待审核队列。${response.hasAttachment ? ' 图片附件已保存。' : ''}</div>`;
  } catch (error) {
    result.innerHTML = `<div class="success">${e(error.message)}</div>`;
  }
};

window.entry();
