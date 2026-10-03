function filterAuditItems(value){const term=value.trim().toLowerCase();document.querySelectorAll('.audit-item').forEach(item=>{item.style.display=!term||item.textContent.toLowerCase().includes(term)?'flex':'none'})}
document.addEventListener('input',event=>{if(!event.target.matches('.audit-search'))return;event.stopImmediatePropagation();auditQuery=event.target.value;filterAuditItems(auditQuery)},true);
window.setAuditSearch=function(value){auditQuery=value;filterAuditItems(value)}
