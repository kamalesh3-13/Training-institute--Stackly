/* Stackly legal theme — motion: ink-wipe headings, ledger-rise cards, unseal images, brass progress bar */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* progress bar */
  var bar = document.createElement('div'); bar.id = 'lgProgress'; document.body.appendChild(bar);
  var hdr = document.querySelector('header');
  function onScroll(){
    var h = document.documentElement, p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    bar.style.transform = 'scaleX(' + Math.min(1, p) + ')';
    if(hdr) hdr.classList.toggle('lg-scrolled', h.scrollTop > 12);
  }
  addEventListener('scroll', onScroll, {passive:true}); onScroll();
  if(reduce || !('IntersectionObserver' in window)) return;

  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('lg-in'); io.unobserve(e.target); } });
  }, {threshold:.12, rootMargin:'0px 0px -6% 0px'});

  function mark(sel, cls, stagger){
    document.querySelectorAll(sel).forEach(function(el){
      if(el.closest('#preloader') || el.classList.contains('lg-rev') || el.classList.contains('lg-img') || el.classList.contains('lg-head')) return;
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--d', (stagger ? Math.min(sib, 6) * 0.1 : 0) + 's');
      el.classList.add(cls); io.observe(el);
    });
  }
  /* headings: ink-wipe */
  mark('section h2, .sec-head .tag, .page-hero h1, .page-hero .lede, .page-hero .crumb', 'lg-head', true);
  /* cards & blocks: ledger-rise */
  mark('.prog-card,.feature-card,.value-card,.team-card,.stat-card,.quote-card,.blog-card,.method-row,.compare-card,.plan-card,.faq-item,.feat-card,.mu-row,.dash-card,.dash-panel,.foot3 > div,.cta-band .wrap,.newsletter-cta .wrap,.sec-head .lede,.pc-list span,.page-hero-meta > *', 'lg-rev', true);
  /* images: unseal */
  mark('.pc-img,.blog-thumb,.gallery-tile,.nl-photo,.dc-photo,.feat-img,.m-img,.media-panel,.vc-photo', 'lg-img', true);
  /* hero kicks in immediately for content already in view */
  requestAnimationFrame(function(){ document.querySelectorAll('.lg-head,.lg-rev,.lg-img').forEach(function(el){
    var r = el.getBoundingClientRect(); if(r.top < innerHeight * .95){ el.classList.add('lg-in'); io.unobserve(el); }
  }); });
})();
