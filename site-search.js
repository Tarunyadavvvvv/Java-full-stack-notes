(function(){
"use strict";
if (!window.SEARCH_INDEX) return;

var root = document.getElementById("siteSearch");
if (!root) return;
var input = document.getElementById("siteSearchInput");
var resultsEl = document.getElementById("siteSearchResults");

var TYPE_LABEL = { chapter: "Chapter", topic: "Topic", question: "Question" };
var TYPE_WEIGHT = { chapter: 3, topic: 2, question: 1 };

function escapeHtml(s){
  return s.replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; });
}

function highlight(text, q){
  var idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return escapeHtml(text);
  return escapeHtml(text.slice(0, idx)) + "<mark>" + escapeHtml(text.slice(idx, idx + q.length)) + "</mark>" + escapeHtml(text.slice(idx + q.length));
}

function score(entry, q){
  var title = entry.title.toLowerCase();
  if (title === q) return 100;
  if (title.indexOf(q) === 0) return 80;
  if (title.indexOf(q) !== -1) return 60;
  var words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.every(function(w){ return title.indexOf(w) !== -1; })) return 40;
  var chapter = (entry.chapter || "").toLowerCase();
  var moduleTitle = entry.moduleTitle.toLowerCase();
  if (chapter.indexOf(q) !== -1 || moduleTitle.indexOf(q) !== -1) return 15;
  return 0;
}

function search(q){
  q = q.trim().toLowerCase();
  if (!q) return [];
  var results = [];
  for (var i = 0; i < window.SEARCH_INDEX.length; i++){
    var entry = window.SEARCH_INDEX[i];
    var s = score(entry, q);
    if (s > 0) results.push({ entry: entry, s: s + TYPE_WEIGHT[entry.type] });
  }
  results.sort(function(a, b){ return b.s - a.s; });
  return results.slice(0, 20).map(function(r){ return r.entry; });
}

var activeIndex = -1;
var currentResults = [];
var currentQuery = "";

function render(results, q){
  currentResults = results;
  currentQuery = q;
  activeIndex = -1;
  if (!results.length){
    resultsEl.innerHTML = '<div class="site-search__empty">No matches for &quot;' + escapeHtml(q) + '&quot;</div>';
    return;
  }
  resultsEl.innerHTML = results.map(function(entry, i){
    var href = entry.module + "#" + entry.anchor;
    var metaParts = [entry.moduleTitle];
    if (entry.chapter && entry.chapter !== entry.title) metaParts.push(entry.chapter);
    return '<a class="site-search__item" data-idx="' + i + '" href="' + href + '">' +
      '<span class="site-search__item-title">' + highlight(entry.title, q) + '</span>' +
      '<span class="site-search__item-meta"><span class="site-search__item-type">' + TYPE_LABEL[entry.type] + '</span>' + escapeHtml(metaParts.join(" — ")) + '</span>' +
      '</a>';
  }).join("");
}

function openPanel(){ root.classList.add("is-open"); input.setAttribute("aria-expanded", "true"); }
function closePanel(){ root.classList.remove("is-open"); input.setAttribute("aria-expanded", "false"); activeIndex = -1; }

function updateActive(items){
  items.forEach(function(it, i){ it.classList.toggle("is-active", i === activeIndex); });
  if (activeIndex >= 0 && items[activeIndex]) items[activeIndex].scrollIntoView({ block: "nearest" });
}

function go(entry){
  closePanel();
  input.value = "";
  window.location.href = entry.module + "#" + entry.anchor;
}

function checkHashExpand(){
  if (!location.hash) return;
  var target = document.getElementById(location.hash.slice(1));
  if (!target) return;
  if (target.tagName === "DETAILS") target.setAttribute("open", "");
  target.scrollIntoView({ behavior: "instant", block: "start" });
}

input.addEventListener("input", function(){
  var q = input.value;
  if (!q.trim()){ closePanel(); resultsEl.innerHTML = ""; return; }
  render(search(q), q.trim());
  openPanel();
});

input.addEventListener("focus", function(){
  if (input.value.trim() && currentResults.length) openPanel();
});

input.addEventListener("keydown", function(e){
  if (!root.classList.contains("is-open")) return;
  var items = resultsEl.querySelectorAll(".site-search__item");
  if (e.key === "ArrowDown"){
    e.preventDefault();
    activeIndex = Math.min(activeIndex + 1, items.length - 1);
    updateActive(items);
  } else if (e.key === "ArrowUp"){
    e.preventDefault();
    activeIndex = Math.max(activeIndex - 1, 0);
    updateActive(items);
  } else if (e.key === "Enter"){
    e.preventDefault();
    var entry = activeIndex >= 0 ? currentResults[activeIndex] : currentResults[0];
    if (entry) go(entry);
  } else if (e.key === "Escape"){
    closePanel();
    input.blur();
  }
});

resultsEl.addEventListener("click", function(e){
  var a = e.target.closest(".site-search__item");
  if (!a) return;
  e.preventDefault();
  var idx = parseInt(a.getAttribute("data-idx"), 10);
  var entry = currentResults[idx];
  if (entry) go(entry);
});

document.addEventListener("click", function(e){
  if (!root.contains(e.target)) closePanel();
});

document.addEventListener("keydown", function(e){
  if ((e.key === "/" || (e.key === "k" && (e.ctrlKey || e.metaKey))) && document.activeElement !== input){
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    e.preventDefault();
    input.focus();
  }
});

checkHashExpand();
window.addEventListener("load", checkHashExpand);
setTimeout(checkHashExpand, 300);
window.addEventListener("hashchange", checkHashExpand);
})();
