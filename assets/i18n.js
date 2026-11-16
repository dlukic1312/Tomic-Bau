/* TOMIC BAU language selector. German is the original and default. */
(() => {
  "use strict";
  const allowed = ["de", "en", "fr", "hr"];
  const names = {de:"Deutsch", en:"English", fr:"Français", hr:"Hrvatski"};
  const params = new URLSearchParams(location.search);
  const requested = params.get("lang");
  const lang = allowed.includes(requested) ? requested : "de";
  const source = window.TOMIC_TRANSLATIONS || {};
  const index = {en:1,fr:2,hr:3};
  const translate = (s) => {
    if (lang === "de") return s;
    const trimmed = s.trim();
    const item = source[trimmed];
    if (!item) return s;
    const result = item[index[lang]-1];
    return result ? s.replace(trimmed, result) : s;
  };
  function translateNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.parentElement && /^(SCRIPT|STYLE|NOSCRIPT|OPTION_DISABLED)$/i.test(node.parentElement.tagName)) return;
      const value = translate(node.nodeValue);
      if (node.nodeValue !== value) node.nodeValue = value;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      for (const attr of ["alt","aria-label","placeholder","title"]) {
        if (node.hasAttribute(attr)) {
          const value = node.getAttribute(attr);
          const translated = translate(value);
          if (value !== translated) node.setAttribute(attr, translated);
        }
      }
      if (node.tagName === "INPUT" && ["submit","button"].includes(node.type)) node.value = translate(node.value);
    }
  }
  function applyTree(root) {
    translateNode(root);
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) translateNode(walker.currentNode);
  }
  function currentPage(target) {
    const u = new URL(target, location.href);
    if (u.origin !== location.origin || !/\.html$|\/$/.test(u.pathname)) return target;
    if (lang === "de") u.searchParams.delete("lang");
    else u.searchParams.set("lang", lang);
    return u.pathname + u.search + u.hash;
  }
  function switchTo(next) {
    const u = new URL(location.href);
    if (next === "de") u.searchParams.delete("lang");
    else u.searchParams.set("lang", next);
    location.assign(u.pathname + u.search + u.hash);
  }
  document.documentElement.lang = lang;
  const style = document.createElement("style");
  style.textContent = '.tomic-languages{display:flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:center}.tomic-language{background:transparent;border:1px solid #a7a7a7;color:inherit;border-radius:3px;font:700 12px Arial,sans-serif;padding:7px 9px;min-height:34px;cursor:pointer}.tomic-language[aria-current="true"]{background:#dba92a;color:#171b1d;border-color:#dba92a}.tomic-language:focus-visible{outline:3px solid #dba92a;outline-offset:2px}.top .tomic-languages{margin-left:auto}@media(max-width:1050px){.top .tomic-languages{margin-left:auto}.top .tomic-language{font-size:11px;padding:6px}}@media(max-width:670px){.top .tomic-languages{gap:3px}.top .tomic-language{font-size:10px;padding:5px;min-height:30px}}';
  style.textContent += '@media(max-width:670px){.top .nav{flex-wrap:wrap;padding-top:4px;padding-bottom:8px;row-gap:4px}.top .tomic-languages{order:3;flex-basis:100%;width:100%;margin:0;justify-content:flex-end}.top .menu{order:2;margin-left:auto}.top .navlinks{top:112px}.top .tomic-language{min-width:38px}}';
  document.head.appendChild(style);
  const nav = document.createElement("nav");
  nav.className = "tomic-languages";
  nav.setAttribute("aria-label", "Website language / Sprache");
  for (const code of allowed) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tomic-language";
    btn.textContent = code.toUpperCase();
    btn.title = names[code];
    btn.setAttribute("aria-label", names[code]);
    btn.setAttribute("aria-current", String(code === lang));
    btn.addEventListener("click", () => switchTo(code));
    nav.append(btn);
  }
  const heroNav = document.querySelector(".top .nav");
  const menu = heroNav?.querySelector(".menu");
  if (heroNav) heroNav.insertBefore(nav, menu || null);
  else {
    const siteHeader = document.querySelector("header");
    if (siteHeader) { siteHeader.appendChild(nav); style.textContent += 'header .tomic-languages{margin:10px 0 0;justify-content:flex-start}'; }
    else document.body.prepend(nav);
  }
  // Make all internal links retain the chosen language, including back links and policy pages.
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    const target = currentPage(href);
    if (target !== href) a.setAttribute("href", target);
  });
  if (lang !== "de") {
    applyTree(document.body);
    if (document.title in source) document.title = source[document.title][index[lang]-1] || document.title;
    document.querySelectorAll('meta[name="description"]').forEach(m => {
      const content = m.getAttribute("content");
      if (content in source) m.setAttribute("content", source[content][index[lang]-1] || content);
    });
    // Also translate form response messages generated after the visitor submits an inquiry.
    const result = document.querySelector("#result");
    if (result) {
      const observer = new MutationObserver(() => {
        observer.disconnect();
        applyTree(result);
        observer.observe(result, {childList:true,subtree:true});
      });
      observer.observe(result, {childList:true,subtree:true});
    }
  }
})();
