const baseHintEntry=window.entry,baseHintSmart=window.smartMode;
function refreshEntryHint(){const hint=document.querySelector('#entryMode .hint');if(hint)hint.innerHTML='支持多人多任务：<b>王五赵六参加双选会 6h，李四放东西 1h</b>'}
window.entry=function(){baseHintEntry();refreshEntryHint()};window.smartMode=function(button){baseHintSmart(button);refreshEntryHint()};
window.entry();
