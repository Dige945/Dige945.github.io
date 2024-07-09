/* global CONFIG, pjax, LocalSearch */
document.addEventListener("DOMContentLoaded",(()=>{if(!CONFIG.path)
// Search DB path
return void console.warn("`hexo-generator-searchdb` plugin is not installed!");const e=new LocalSearch({path:CONFIG.path,top_n_per_article:CONFIG.localsearch.top_n_per_article,unescape:CONFIG.localsearch.unescape}),t=document.querySelector(".search-input"),c=document.querySelector(".search-result-container"),n=()=>{if(!e.isfetched)return;const n=t.value.trim().toLowerCase(),s=n.split(/[-\s]+/);let r=[];if(n.length>0&&(
// Perform local searching
r=e.getResultItems(s)),1===s.length&&""===s[0])c.innerHTML='<div class="search-result-icon"><i class="fa fa-search fa-5x"></i></div>';else if(0===r.length)c.innerHTML='<div class="search-result-icon"><i class="far fa-frown fa-5x"></i></div>';else{r.sort(((e,t)=>e.includedCount!==t.includedCount?t.includedCount-e.includedCount:e.hitCount!==t.hitCount?t.hitCount-e.hitCount:t.id-e.id));const e=CONFIG.i18n.hits.replace("${hits}",r.length);c.innerHTML=`<div class="search-stats">${e}</div>\n        <hr>\n        <ul class="search-result-list">${r.map((e=>e.item)).join("")}</ul>`,"object"==typeof pjax&&pjax.refresh(c)}};e.highlightSearchWords(document.querySelector(".post-body")),CONFIG.localsearch.preload&&e.fetchData(),t.addEventListener("input",n),window.addEventListener("search:loaded",n),
// Handle and trigger popup window
document.querySelectorAll(".popup-trigger").forEach((c=>{c.addEventListener("click",(()=>{document.body.classList.add("search-active"),
// Wait for search-popup animation to complete
setTimeout((()=>t.focus()),500),e.isfetched||e.fetchData()}))}));
// Monitor main search box
const s=()=>{document.body.classList.remove("search-active")};document.querySelector(".search-pop-overlay").addEventListener("click",(e=>{e.target===document.querySelector(".search-pop-overlay")&&s()})),document.querySelector(".popup-btn-close").addEventListener("click",s),document.addEventListener("pjax:success",(()=>{e.highlightSearchWords(document.querySelector(".post-body")),s()})),window.addEventListener("keyup",(e=>{"Escape"===e.key&&s()}))}));