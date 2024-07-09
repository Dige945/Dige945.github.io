/* global CONFIG */
document.addEventListener("DOMContentLoaded",(()=>{"use strict";const e=()=>{localStorage.setItem("bookmark"+location.pathname,window.scrollY)},o=()=>{let e=localStorage.getItem("bookmark"+location.pathname);e=Number(e),
// If the page opens with a specific hash, just jump out
isNaN(e)||""!==location.hash||
// Auto scroll to the position
window.anime({targets:document.scrollingElement,duration:200,easing:"linear",scrollTop:e})};!function(t){
// Create a link element
const n=document.querySelector(".book-mark-link");
// Scroll event
window.addEventListener("scroll",(()=>n.classList.toggle("book-mark-link-fixed",0===window.scrollY)),{passive:!0}),
// Register beforeunload event when the trigger is auto
"auto"===t&&(
// Register beforeunload event
window.addEventListener("beforeunload",e),document.addEventListener("pjax:send",e)),
// Save the position by clicking the icon
n.addEventListener("click",(()=>{e(),window.anime({targets:n,duration:200,easing:"linear",top:-30,complete:()=>{setTimeout((()=>{n.style.top=""}),400)}})})),o(),document.addEventListener("pjax:success",o)}(CONFIG.bookmark.save)}));