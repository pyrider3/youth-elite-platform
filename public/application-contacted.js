// Contact status controls for every administrator who can view applications.
const contactedBaseRender = window.renderApplications;
window.renderApplications = function (rows) {
  contactedBaseRender(rows);
  const cards = document.querySelectorAll('.application-card');
  cards.forEach((card, index) => {
    const row = rows[index];
    if (!row) return;
    card.classList.toggle('is-contacted', Boolean(row.contacted));
    const person = card.querySelector('.application-person');
    if (me?.role !== 'application_viewer') person?.insertAdjacentHTML('beforeend', `<label class="application-contacted" title="标记为已联系"><input type="checkbox" ${row.contacted ? 'checked' : ''} onchange="setApplicationContacted(${row.id},this)"><span>已联系</span></label>`);
  });
};

window.setApplicationContacted = async function (id, input) {
  input.disabled = true;
  try {
    const data = await api(`/api/applications/${id}`, { method:'PATCH', body:JSON.stringify({contacted:input.checked}) });
    const row = applicationRows.find(item => item.id === id);
    if (row) row.contacted = data.contacted ? 1 : 0;
    input.closest('.application-card')?.classList.toggle('is-contacted', data.contacted);
  } catch (error) {
    input.checked = !input.checked;
    alert(error.message);
  } finally { input.disabled = false; }
};
