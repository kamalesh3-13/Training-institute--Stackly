/* Stackly Campus v2 — preloader counter, word rotator, count-up, spring reveals, magnetic buttons, floaters */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s,r){ return (r||document).querySelector(s); }, $$ = function(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };

  /* preloader: percent counter, finishes when site.js hides it */
  var pl = $('#preloader');
  if(pl){
    var pct = $('.pl4-pct', pl), fill = $('.pl4-bar i', pl), n = 0;
    if(fill){ fill.style.animation = 'none'; fill.style.transition = 'transform .15s linear'; }
    var t = setInterval(function(){ n = Math.min(96, n + 2 + Math.random()*6); if(pct) pct.textContent = Math.round(n) + '%'; if(fill) fill.style.transform = 'scaleX(' + (n/100) + ')'; }, 70);
    new MutationObserver(function(m, ob){
      if(pl.classList.contains('hide')){ if(pct) pct.textContent = '100%'; if(fill) fill.style.transform = 'scaleX(1)'; clearInterval(t); ob.disconnect(); }
    }).observe(pl, {attributes:true, attributeFilter:['class']});
  }

  /* scroll progress + header state */
  var bar = document.createElement('div'); bar.id = 'lgProgress'; bar.style.cssText = 'position:fixed;left:0;top:0;width:100%;transform:scaleX(0);transform-origin:left;z-index:10000;pointer-events:none'; document.body.appendChild(bar);
  var hdr = $('header');
  function onScroll(){
    var h = document.documentElement, p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    bar.style.transform = 'scaleX(' + Math.min(1, p) + ')';
    if(hdr) hdr.classList.toggle('lg-scrolled', h.scrollTop > 12);
  }
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  /* hero word rotator */
  var rot = $('.hm-rot');
  if(rot && !reduce){
    var ws = rot.dataset.words.split('|'), i = 0;
    setInterval(function(){
      rot.classList.add('out');
      setTimeout(function(){ i = (i + 1) % ws.length; rot.textContent = ws[i]; rot.classList.remove('out'); }, 320);
    }, 2400);
  }

  /* count-up numbers */
  function countUp(el){
    var to = parseFloat(el.dataset.to), suf = el.dataset.suf || '', start = null, dur = 1600;
    function step(ts){ if(!start) start = ts; var p = Math.min(1, (ts - start)/dur), e = 1 - Math.pow(1-p, 3);
      el.textContent = Math.round(to * e).toLocaleString('en-IN') + suf; if(p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  var cio = 'IntersectionObserver' in window ? new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ if(!reduce) countUp(e.target); cio.unobserve(e.target); } });
  }, {threshold:.4}) : null;
  $$('.cnt').forEach(function(el){ if(cio) cio.observe(el); });

  /* soft floating rings in dark / hero blocks */
  $$('.page-hero, .sec-dark, .hm-cta-card').forEach(function(sec, i){
    for(var k=0;k<2;k++){
      var s = document.createElement('span'); s.className = 'in-shape'; s.setAttribute('aria-hidden','true');
      var sz = 40 + ((i*17 + k*31) % 60);
      s.style.cssText = 'width:'+sz+'px;height:'+sz+'px;top:'+(10+((i*29+k*37)%70))+'%;left:'+(4+((i*17+k*43)%88))+'%;animation-delay:'+(k*1.5)+'s';
      sec.appendChild(s);
    }
  });

  /* spring reveals */
  var all = '.lg-rev,.lg-head,.lg-img';
  if(reduce || !('IntersectionObserver' in window)){ $$(all).forEach(function(e){ e.classList.add('lg-in'); }); }
  else {
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('lg-in'); io.unobserve(e.target); } }); }, {threshold:.1, rootMargin:'0px 0px -5% 0px'});
    function mark(sel, cls){
      $$(sel).forEach(function(el){
        if(el.closest('#preloader') || /lg-(rev|img|head)/.test(el.className)) return;
        var idx = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        el.style.setProperty('--d', Math.min(idx, 6) * 0.08 + 's'); el.classList.add(cls); io.observe(el);
      });
    }
    mark('section h2, .hm-head .tag, .page-hero h1, .page-hero .lede, .hm-hero h1, .hm-lede, .hm-finder, .hm-trust', 'lg-head');
    mark('.prog-card,.feature-card,.value-card,.team-card,.stat-card,.quote-card,.blog-card,.method-row,.compare-card,.plan-card,.faq-item,.feat-card,.dash-card,.dash-panel,.hm-cat,.hm-course,.hm-bx,.hm-steps li,.hm-stat-grid>div,.hm-tr,.hm-v,.hm-bt,.hm-cta-card,.foot3 .f3-top > *', 'lg-rev');
    mark('.pc-img,.blog-thumb,.gallery-tile,.nl-photo,.dc-photo,.feat-img,.m-img,.media-panel,.hm-blob', 'lg-img');
    requestAnimationFrame(function(){ $$(all).forEach(function(el){ var r = el.getBoundingClientRect(); if(r.top < innerHeight*.95){ el.classList.add('lg-in'); io.unobserve(el); } }); });
  }

  /* magnetic buttons */
  if(!reduce && matchMedia('(hover:hover)').matches){
    document.addEventListener('pointermove', function(e){
      var b = e.target.closest && e.target.closest('.hm-btn,.btn-solid,.nav-cta'); if(!b) return;
      var r = b.getBoundingClientRect(), x = (e.clientX - r.left - r.width/2) * .12, y = (e.clientY - r.top - r.height/2) * .2;
      b.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
    }, {passive:true});
    document.addEventListener('pointerout', function(e){ var b = e.target.closest && e.target.closest('.hm-btn,.btn-solid,.nav-cta'); if(b) b.style.translate = ''; }, {passive:true});
  }

  /* button ripple */
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('.btn,.nav-cta,.hm-btn'); if(!b) return;
    var r = b.getBoundingClientRect(), d = Math.max(r.width, r.height), s = document.createElement('span');
    s.className = 'in-ripple'; s.style.cssText = 'width:'+d+'px;height:'+d+'px;left:'+(e.clientX-r.left-d/2)+'px;top:'+(e.clientY-r.top-d/2)+'px';
    b.appendChild(s); setTimeout(function(){ s.remove(); }, 650);
  });
})();
