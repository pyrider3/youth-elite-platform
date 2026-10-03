// Surface saved evidence images in the administrator review list.
const standardAuditRender = window.renderAudit;
window.renderAudit = function () {
  standardAuditRender();
  const term = auditQuery.trim().toLowerCase();
  const visibleRows = (auditFilter === 'all' ? auditRows : auditRows.filter(row => row.status === auditFilter)).filter(row => !term || [row.name,row.note,row.submitted_by,row.event].some(value => String(value || '').toLowerCase().includes(term)));
  document.querySelectorAll('.audit-item').forEach((card, index) => {
    const row = visibleRows[index];
    if (!row?.has_attachment) return;
    const meta = card.querySelector('.audit-main small');
    if (meta) meta.insertAdjacentHTML('afterend', `<a class="audit-attachment" href="/api/records/${row.id}/attachment" target="_blank" rel="noopener">查看图片附件</a>`);
  });
};
