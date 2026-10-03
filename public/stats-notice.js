const statsWithNotice = window.stats;
window.stats = async function () {
  await statsWithNotice();
  document.querySelector('.stats')?.insertAdjacentHTML('beforebegin', '<p class="stats-notice">提示：志愿时长统计并非实时更新，数据可能存在一定滞后，请以审核后的记录为准。</p>');
};
