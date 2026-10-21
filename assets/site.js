/* ---- home hero slideshow ---- */
(function(){
  var s = document.querySelectorAll('.hero-slides img');
  if(s.length < 2) return;
  var i = 0;
  setInterval(function(){
    s[i].classList.remove('on'); i = (i + 1) % s.length; s[i].classList.add('on');
  }, 4500);
})();

/* ---- preloader: fades out once the page has loaded (min 900ms so the logo is seen) ---- */
(function(){
  var pl = document.getElementById('preloader');
  if(!pl) return;
  var start = Date.now(), done = false;
  function hide(){
    if(done) return; done = true;
    setTimeout(function(){
      pl.classList.add('hide');
      setTimeout(function(){ pl.remove(); }, 1200);
    }, Math.max(0, 900 - (Date.now() - start)));
  }
  if(document.readyState === 'complete') hide(); else window.addEventListener('load', hide);
  setTimeout(hide, 4000);
})();

/* ---- dashboard logo: shows the preloader, then opens the Overview page (this link's href) ---- */
document.querySelectorAll('.dash-topbar a, .dash-brand').forEach(function(a){
  a.style.cursor = 'pointer';
  a.addEventListener('click', function(e){
    e.preventDefault();
    if(document.documentElement.dataset.reloading) return;
    document.documentElement.dataset.reloading = '1';
    var old = document.getElementById('preloader'); if(old) old.remove();
    var pl = document.createElement('div');
    pl.id = 'preloader'; pl.className = 'hide'; pl.setAttribute('aria-hidden','true');
    pl.innerHTML = '<div class="pl4"><img class="pl4-logo" src="assets/logo-brass.webp?v=5" alt="" width="230" height="67"><div class="pl4-bar"><i></i></div><div class="pl4-row"><span class="pl4-txt">Preparing your classroom</span><b class="pl4-pct">0%</b></div></div>';
    document.body.appendChild(pl);
    void pl.offsetWidth;                 /* let the fade-in transition run */
    pl.classList.remove('hide');
    var dest = a.getAttribute('href') || window.location.href;
    setTimeout(function(){ window.location.href = dest; }, 450);
  });
});

/* ---- log out: clear the dashboard session ---- */
document.querySelectorAll('[data-logout]').forEach(function(a){
  a.addEventListener('click', function(){ try{ sessionStorage.removeItem('stackly_role'); }catch(e){} });
});

/* ---- GSAP availability check: everything below degrades gracefully
   (content stays visible, interactions still work) if the CDN is
   blocked or an ad-blocker strips the animation library. ---- */
const HAS_GSAP = typeof gsap !== 'undefined';
const HAS_ST = HAS_GSAP && typeof ScrollTrigger !== 'undefined';
if(HAS_ST) gsap.registerPlugin(ScrollTrigger);

/* ---- sticky header shadow on scroll ---- */
const header = document.querySelector('header');
window.addEventListener('scroll', ()=>{
  if(header) header.classList.toggle('scrolled', window.scrollY > 12);
}, {passive:true});

/* ---- mobile nav (independent of GSAP) ---- */
const burgerBtn = document.getElementById('burgerBtn');
const mobileNav = document.getElementById('mobileNav');
const mobileNavScrim = document.getElementById('mobileNavScrim');
function closeMobileNav(){
  burgerBtn.classList.remove('open');
  mobileNav.classList.remove('open');
  mobileNavScrim.classList.remove('show');
}
if(burgerBtn){
  burgerBtn.addEventListener('click', ()=>{
    const isOpen = mobileNav.classList.toggle('open');
    burgerBtn.classList.toggle('open', isOpen);
    mobileNavScrim.classList.toggle('show', isOpen);
  });
  mobileNavScrim.addEventListener('click', closeMobileNav);
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));
}

/* ---- hero load sequence: headline mask reveal + stat readout + load bars ---- */
/* Wraps each word in a text node with a .split-word span for staggered
   reveal, while preserving child elements like <br> and highlight <span>s
   (recursing into them) instead of flattening the markup via textContent. */
function splitWords(el){
  const nodes = Array.from(el.childNodes);
  el.innerHTML = '';
  nodes.forEach(node=>{
    if(node.nodeType === Node.TEXT_NODE){
      const parts = node.textContent.split(/(\s+)/).filter(s => s.length);
      parts.forEach(part=>{
        if(/^\s+$/.test(part)){
          el.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement('span');
          span.className = 'split-word';
          span.textContent = part;
          el.appendChild(span);
        }
      });
    } else {
      if(node.tagName !== 'BR') splitWords(node);
      el.appendChild(node);
    }
  });
}
document.querySelectorAll('[data-split]').forEach(splitWords);

if(false && HAS_GSAP && document.querySelector('.hero')){
  gsap.set('.hero .tag, .hero .lede, .hero-actions, .hero-foot', {opacity:0, y:24});
  gsap.set('.appwin', {opacity:0, y:50});
  gsap.set('.hero h1 .split-word', {opacity:0, y:36});
  gsap.timeline({defaults:{ease:'power3.out'}})
    .to('.hero .tag', {opacity:1, y:0, duration:.6}, 0.1)
    .to('.hero h1 .split-word', {opacity:1, y:0, duration:.8, stagger:0.06}, 0.15)
    .to('.hero .lede', {opacity:1, y:0, duration:.7}, '-=0.4')
    .to('.hero-actions', {opacity:1, y:0, duration:.7}, '-=0.5')
    .to('.hero-foot', {opacity:1, y:0, duration:.7}, '-=0.5')
    .to('.appwin', {opacity:1, y:0, duration:1.1, clearProps:'transform'}, 0.35);
}

/* ---- animated count-up on any [data-count] element, with a static fallback ---- */
function animateCount(el){
  const end = parseFloat(el.dataset.count);
  const decimals = (el.dataset.count.split('.')[1] || '').length;
  const suffix = el.dataset.suffix || '';
  if(!HAS_GSAP || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)){ el.textContent = end.toFixed(decimals) + suffix; return; }
  const obj = {v:0};
  el.textContent = (0).toFixed(decimals) + suffix;
  gsap.to(obj, {
    v:end, duration:1.8, delay:parseFloat(el.dataset.delay||0), ease:'power2.out',
    onUpdate(){ el.textContent = obj.v.toFixed(decimals) + suffix; }
  });
}
document.querySelectorAll('[data-count]').forEach(el=>{
  if(HAS_ST){
    ScrollTrigger.create({ trigger:el, start:'top 85%', once:true, onEnter: ()=> animateCount(el) });
  } else {
    animateCount(el);
  }
});

/* ---- generic scroll reveals (skipped entirely without GSAP — content is
   visible by default in CSS, so there is nothing to "reveal") ---- */
if(HAS_GSAP){
  gsap.utils.toArray('.reveal-up').forEach(el=>{
    gsap.fromTo(el, {opacity:0, y:36}, {opacity:1, y:0, duration:0.9, ease:'power3.out', clearProps:'transform',
      scrollTrigger: HAS_ST ? {trigger:el, start:'top 88%'} : undefined
    });
  });
  gsap.utils.toArray('.reveal-group').forEach(group=>{
    if(group.dataset.anim) return;
    const items = group.children;
    gsap.fromTo(items, {opacity:0, y:36}, {opacity:1, y:0, duration:0.8, stagger:0.1, ease:'power3.out', clearProps:'transform',
      scrollTrigger: HAS_ST ? {trigger:group, start:'top 88%'} : undefined
    });
  });
  gsap.utils.toArray('.method-row').forEach(row=>{
    gsap.fromTo(row, {opacity:0, y:36}, {
      opacity:1, y:0, duration:0.8, ease:'power3.out', clearProps:'transform',
      scrollTrigger: HAS_ST ? {trigger:row, start:'top 90%'} : undefined
    });
  });
}

/* ---- gallery tiles: sticker pop-in on scroll ---- */
if(HAS_GSAP){
  gsap.utils.toArray('.gallery-grid').forEach(grid=>{
    const tiles = Array.from(grid.querySelectorAll('.gallery-tile'));
    gsap.fromTo(tiles, {opacity:0, y:36}, {opacity:1, y:0, duration:.9, stagger:.1, ease:'power3.out', clearProps:'transform',
      scrollTrigger: HAS_ST ? {trigger:grid, start:'top 85%', once:true} : undefined});
  });
}

/* ---- split-media: soft parallax drift on the decorative blobs ---- */
if(HAS_GSAP && HAS_ST){
  gsap.utils.toArray('.media-panel').forEach(panel=>{
    const blob1 = panel.querySelector('.m-blob');
    const blob2 = panel.querySelector('.m-blob2');
    if(blob1) gsap.to(blob1, {y:40, ease:'none', scrollTrigger:{trigger:panel, start:'top bottom', end:'bottom top', scrub:0.6}});
    if(blob2) gsap.to(blob2, {y:-30, ease:'none', scrollTrigger:{trigger:panel, start:'top bottom', end:'bottom top', scrub:0.6}});
    const icon = panel.querySelector('.m-icon');
    if(icon){
      gsap.fromTo(icon, {opacity:0, scale:0.8, rotate:-6}, {
        opacity:1, scale:1, rotate:0, duration:0.9, ease:'back.out(1.6)',
        scrollTrigger:{trigger:panel, start:'top 80%'}
      });
    }
  });
}

/* ---- subtle 3D tilt on cards (feature/program/value/gallery/manager) ---- */
if(window.matchMedia('(pointer:fine)').matches){
  document.querySelectorAll('.__no-tilt').forEach(card=>{
    card.classList.add('tilt');
    card.addEventListener('mousemove', e=>{
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if(HAS_GSAP){
        gsap.to(card, {rotateY: px*6, rotateX: -py*6, duration:0.4, ease:'power2.out', transformPerspective:700});
      }
    });
    card.addEventListener('mouseleave', ()=>{
      if(HAS_GSAP){ gsap.to(card, {rotateY:0, rotateX:0, duration:0.6, ease:'power3.out'}); }
    });
  });
}

/* ---- ember spotlight that follows the cursor on feature cards ---- */
document.querySelectorAll('.feature-card').forEach(card=>{
  card.addEventListener('mousemove', e=>{
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
});

/* ---- logo / press marquee: pause the drift on hover ---- */
document.querySelectorAll('.logo-band, .marquee').forEach(band=>{
  const track = band.querySelector('.logo-track, .marquee-track');
  if(!track) return;
  band.addEventListener('mouseenter', ()=> track.style.animationPlayState = 'paused');
  band.addEventListener('mouseleave', ()=> track.style.animationPlayState = 'running');
});

/* ---- FAQ accordion (contact/services pages) — works with or without GSAP ---- */
document.querySelectorAll('.faq-item').forEach(item=>{
  const q = item.querySelector('.faq-q');
  if(!q) return;
  q.addEventListener('click', ()=>{
    const open = item.classList.toggle('open');
    const panel = item.querySelector('.faq-a');
    if(HAS_GSAP){
      gsap.to(panel, {height: open ? 'auto' : 0, duration: open ? 0.35 : 0.3, ease: open ? 'power2.out' : 'power2.in'});
    } else {
      panel.style.height = open ? 'auto' : '0';
    }
  });
});

/* ---- tab switcher (services/programs pages) — works with or without GSAP ---- */
document.querySelectorAll('[data-tabs]').forEach(group=>{
  const tabs = group.querySelectorAll('[data-tab]');
  const scope = group.closest('section') || group.parentElement; const panels = scope.querySelectorAll('[data-panel]');
  tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
      tabs.forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const key = tab.dataset.tab;
      panels.forEach(p=>{
        const show = p.dataset.panel === key;
        p.style.display = show ? '' : 'none';
        if(show){
          if(HAS_GSAP) gsap.fromTo(p, {opacity:0, y:10}, {opacity:1, y:0, duration:0.4});
        }
      });
    });
  });
});

/* ---- booking form: friendly "please fill in ..." messages under each empty field ---- */
document.querySelectorAll('form[data-validate]').forEach(function(form){
  function fieldOf(el){ return el.closest('.f-field') || el.parentNode; }
  function clearErr(el){
    var f = fieldOf(el); f.classList.remove('has-err');
    var m = f.querySelector('.f-err'); if(m) m.remove();
  }
  function showErr(el, text){
    clearErr(el);
    var f = fieldOf(el); f.classList.add('has-err');
    var m = document.createElement('div'); m.className = 'f-err'; m.setAttribute('role','alert'); m.textContent = text;
    f.appendChild(m);
  }
  function check(el){
    var v = el.value.trim();
    if(!v){ showErr(el, el.getAttribute('data-msg') || 'Please fill in this field'); return false; }
    if(el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){ showErr(el, 'Please enter a valid email address'); return false; }
    if(el.type === 'tel' && v.replace(/\D/g,'').length < 10){ showErr(el, 'Please enter a valid 10-digit phone number'); return false; }
    clearErr(el); return true;
  }
  var fields = form.querySelectorAll('input[required], textarea[required]');
  fields.forEach(function(el){ el.addEventListener('input', function(){ if(fieldOf(el).classList.contains('has-err')) check(el); }); });
  form.addEventListener('submit', function(e){
    var first = null;
    fields.forEach(function(el){ if(!check(el) && !first) first = el; });
    if(first){ e.preventDefault(); e.stopImmediatePropagation(); first.focus(); }
  }, true);
});

/* ---- simple form submit feedback (no backend, no GSAP dependency) ---- */
document.querySelectorAll('form[data-demo-form]').forEach(form=>{
  form.addEventListener('submit', e=>{
    e.preventDefault();
    /* forms marked data-redirect-404 send the visitor to 404.html once
       native browser validation (required / type=email) has passed */
    if(form.hasAttribute('data-redirect-404')){
      window.location.href = '404.html';
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Sent';
    btn.disabled = true;
    setTimeout(()=>{ btn.textContent = original; btn.disabled = false; form.reset(); }, 2200);
  });
});

/* ---- blog category filter (blog page only) ---- */
(function(){
  const grid = document.querySelector('.blog-grid');
  const tabs = document.querySelectorAll('.tabs-bar button[data-filter]');
  if(!grid || !tabs.length) return;
  const cards = grid.querySelectorAll('.blog-card[data-cat]');
  tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
      tabs.forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      cards.forEach(card=>{
        const show = (filter === 'all') || (card.dataset.cat === filter);
        card.style.display = show ? '' : 'none';
      });
    });
  });
})();

/* ---- name fields: letters, spaces, apostrophes and hyphens only ---- */
document.querySelectorAll('input[data-name-field]').forEach(inp=>{
  inp.setAttribute('pattern', "[A-Za-z\\s'-]+");
  inp.setAttribute('title', 'Letters only — no numbers or special characters.');
  inp.addEventListener('input', function(){
    this.value = this.value.replace(/[^A-Za-z\s'-]/g, '');
  });
});

/* ---- hover light: spotlight follows the cursor on [data-fx="spot"] cards ---- */
document.querySelectorAll('[data-fx="spot"]').forEach(function(el){
  el.addEventListener('mousemove', function(e){
    var r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/* ---- route progress bar: a little freight marker rides the scroll position ---- */
(function(){
  var bar=document.createElement('div'); bar.className='route-progress'; bar.innerHTML='<b></b><i></i>'; document.body.appendChild(bar);
  var fill=bar.firstChild, dot=bar.lastChild;
  function upd(){ var h=document.documentElement.scrollHeight-innerHeight, p=h>0?Math.min(1,scrollY/h):0;
    fill.style.transform='scaleX('+p+')'; dot.style.left='calc('+(p*100)+'% - '+(p*16)+'px)'; }
  addEventListener('scroll',upd,{passive:true}); upd();
})();


/* ---- motion pack: hero reveal + parallax, per-grid card entrances, image parallax, light tracking ---- */
(function(){
  return; /* legacy motion removed — see legal.js */
  var ST = typeof ScrollTrigger!=='undefined', fine = matchMedia('(pointer:fine)').matches;
  var hero = document.querySelector('.hero, .page-hero'), hv = document.querySelector('.hero-visual, .ph-photo');
  if(hv){
    var img = hv.querySelector('img');
    gsap.fromTo(hv,{clipPath:'inset(0 0 0 100%)'},{clipPath:'inset(0 0 0 0%)',duration:1.3,ease:'power4.inOut',delay:.15,clearProps:'clipPath'});
    if(img && !hv.querySelector('.hero-slides')){
      gsap.fromTo(img,{scale:1.25},{scale:1.02,duration:2.2,ease:'power3.out'});
      if(ST) gsap.to(img,{yPercent:12,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.5}});
    }
    if(hero && fine){
      var qx = gsap.quickTo(hv,'x',{duration:.9,ease:'power3'}), qy = gsap.quickTo(hv,'y',{duration:.9,ease:'power3'});
      hero.addEventListener('mousemove',function(e){var r=hero.getBoundingClientRect();qx(((e.clientX-r.left)/r.width-.5)*-22);qy(((e.clientY-r.top)/r.height-.5)*-14);});
    }
  }
  var bar=document.createElement('div'); bar.id='scrollBar'; document.body.appendChild(bar);
  if(ST) gsap.to(bar,{scaleX:1,ease:'none',scrollTrigger:{trigger:document.body,start:'top top',end:'bottom bottom',scrub:.3}});
  var A={flip:{from:{opacity:0,y:40},st:.12,ease:'power3.out'},
    slide:{from:{opacity:0,y:40},st:.12,ease:'power3.out'},
    pop:{from:{opacity:0,scale:.96,y:30},st:.1,ease:'power3.out'},
    drop:{from:{opacity:0,y:30},st:.12,ease:'power3.out'}};
  document.querySelectorAll('[data-anim]').forEach(function(g){
    var a=A[g.dataset.anim]; if(!a) return;
    gsap.fromTo(g.children,a.from,{opacity:1,x:0,y:0,scale:1,rotate:0,rotateX:0,duration:.9,stagger:a.st,ease:a.ease,clearProps:'transform',scrollTrigger:ST?{trigger:g,start:'top 85%',once:true}:undefined});
  });
  if(ST) gsap.utils.toArray('.g-img,.m-img').forEach(function(im){
    gsap.fromTo(im,{yPercent:-7,scale:1.14},{yPercent:7,ease:'none',scrollTrigger:{trigger:im.parentNode,start:'top bottom',end:'bottom top',scrub:.6}});
  });
  gsap.utils.toArray('section h2').forEach(function(h){
    gsap.fromTo(h,{opacity:0,y:24},{opacity:1,y:0,duration:.9,ease:'power3.out',clearProps:'transform',scrollTrigger:ST?{trigger:h,start:'top 88%',once:true}:undefined});
  });
  if(fine) document.querySelectorAll('[data-fx]').forEach(function(el){
    el.addEventListener('mousemove',function(e){var r=el.getBoundingClientRect();el.style.setProperty('--mx',(e.clientX-r.left)+'px');el.style.setProperty('--my',(e.clientY-r.top)+'px');});
  });
})();


/* ================= site-wide GSAP motion layer ================= */
(function(){
  return; /* legacy motion removed — see legal.js */
  var ST = typeof ScrollTrigger!=='undefined'; if(ST) gsap.registerPlugin(ScrollTrigger);
  var fine = matchMedia('(pointer:fine)').matches;
  var q = function(sel){ return gsap.utils.toArray(sel).filter(function(el){ return !(el.parentElement && el.parentElement.classList.contains('reveal-group')); }); };

  /* 2. home hero: image curtains, tracker card, depth-on-mouse */
  var hv = document.querySelector('.hv3');
  if(hv){
    var tiles = hv.querySelectorAll('figure'), imgs = hv.querySelectorAll('figure img');
    gsap.set(tiles,{clipPath:'inset(100% 0% 0% 0%)'}); gsap.set(imgs,{scale:1.25});
    gsap.set('.hv3-card',{y:40,opacity:0}); gsap.set('.hv3-steps li',{x:-14,opacity:0}); gsap.set('.hv3-bar i',{scaleX:0,transformOrigin:'0 50%'});
    gsap.timeline({delay:.25,defaults:{ease:'power3.out'}})
      .to(tiles,{clipPath:'inset(0% 0% 0% 0%)',duration:1.1,stagger:.14})
      .to(imgs,{scale:1,duration:1.7,stagger:.14},0)
      .to('.hv3-card',{y:0,opacity:1,duration:.8},.9)
      .to('.hv3-steps li',{x:0,opacity:1,duration:.45,stagger:.12},1.1)
      .to('.hv3-bar i',{scaleX:1,duration:1.4,ease:'power2.inOut'},1.3);
    if(fine){
      var hero = document.querySelector('.hero');
      var moves = [['.hv3-a img',12],['.hv3-b img',22],['.hv3-c img',17],['.hv3-card',-10]].map(function(m){
        var el = hv.querySelector(m[0]); return {x:gsap.quickTo(el,'x',{duration:.9,ease:'power3'}), y:gsap.quickTo(el,'y',{duration:.9,ease:'power3'}), d:m[1]};
      });
      hero.addEventListener('mousemove',function(e){
        var r=hero.getBoundingClientRect(), nx=(e.clientX-r.left)/r.width-.5, ny=(e.clientY-r.top)/r.height-.5;
        moves.forEach(function(m){ m.x(nx*m.d); m.y(ny*m.d); });
      });
    }
  }

  /* 3. interior page heroes */
  var ph = document.querySelector('.page-hero');
  if(ph) gsap.from(ph.querySelectorAll('.crumb, h1, .lede, .page-hero-meta > *, .btn'),{y:34,opacity:0,duration:.9,stagger:.1,ease:'power3.out',delay:.15});

  if(ST){
    /* 4. section headings */
    q('.sec-head > div, .sec-head > .btn, .sec-head > .lede').forEach(function(el){
      gsap.from(el,{y:36,opacity:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}});
    });
    /* 5. image curtain reveals */
    gsap.utils.toArray('.pc-img, .blog-thumb, .team-photo, .media-panel, .vc-photo').forEach(function(el){
      gsap.fromTo(el,{clipPath:'inset(0% 0% 100% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.1,ease:'power3.inOut',scrollTrigger:{trigger:el,start:'top 92%'}});
    });
    /* 6. staggered list items, FAQ rows, footer columns */
    var items = q('.m-points span, .pc-list span, .compare-card li, .faq-item, .foot-top > div, .method-row .m-body');
    if(items.length){
      gsap.set(items,{opacity:0,y:24});
      ScrollTrigger.batch(items,{start:'top 94%',once:true,onEnter:function(b){ gsap.to(b,{opacity:1,y:0,duration:.7,stagger:.09,ease:'power3.out',overwrite:true}); }});
    }
    /* 7. closing bands */
    q('.cta-band .wrap, .newsletter-cta .wrap').forEach(function(el){
      gsap.from(el,{y:50,scale:.96,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%'}});
    });
  }

  /* 8. dashboards */
  if(document.querySelector('.dash-main')){
    gsap.from('.dash-head',{y:-16,opacity:0,duration:.6,ease:'power3.out'});
    gsap.from(q('.dash-card'),{y:30,opacity:0,duration:.7,stagger:.09,delay:.1,ease:'power3.out'});
    gsap.from('.dash-main tbody tr',{x:-16,opacity:0,duration:.5,stagger:.05,delay:.35,ease:'power2.out'});
    gsap.from('.dash-bars > *',{scaleY:0,transformOrigin:'50% 100%',duration:.8,stagger:.05,delay:.3,ease:'power2.out'});
  }

  /* 9. magnetic buttons */
  if(fine) document.querySelectorAll('.btn-solid, .nav-cta').forEach(function(b){
    var xt=gsap.quickTo(b,'x',{duration:.4,ease:'power3'}), yt=gsap.quickTo(b,'y',{duration:.4,ease:'power3'});
    b.addEventListener('mousemove',function(e){ var r=b.getBoundingClientRect(); xt((e.clientX-r.left-r.width/2)*.18); yt((e.clientY-r.top-r.height/2)*.25); });
    b.addEventListener('mouseleave',function(){ xt(0); yt(0); });
  });
})();


/* ================= dashboard forms: validation + toggles ================= */
(function(){
  var forms = document.querySelectorAll('.dash-main form');
  if(!forms.length) return;
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* toggle rows: clicking the text flips the switch too */
  document.querySelectorAll('.f-tog').forEach(function(row, i){
    var inp = row.querySelector('input[type=checkbox]'), lab = row.querySelector('label:first-child');
    if(inp && lab && lab !== inp.parentNode){ inp.id = inp.id || 'tog-' + i; lab.setAttribute('for', inp.id); }
  });

  function labelOf(el){
    var f = el.closest('.f-field'), l = f && f.querySelector('label');
    return l ? l.textContent.trim().toLowerCase() : 'this field';
  }
  function check(el, form){
    if(el.disabled || el.type === 'checkbox' || el.type === 'submit' || el.type === 'button') return '';
    var v = (el.value || '').trim();
    if(!v) return el.required ? (el.tagName === 'SELECT' ? 'Please choose an option.' : 'Please fill in ' + labelOf(el) + '.') : '';
    if(el.type === 'email' && !EMAIL.test(v)) return 'Enter a valid email address.';
    if(el.type === 'number'){
      var n = Number(v);
      if(!isFinite(n)) return 'Enter a number.';
      if(el.step === '1' && n % 1 !== 0) return 'Use a whole number.';
      if(el.min !== '' && n < Number(el.min)) return 'Must be at least ' + el.min + '.';
      if(el.max !== '' && n > Number(el.max)) return 'Must be ' + el.max + ' or less.';
    }
    if(el.minLength > 0 && v.length < el.minLength) return 'Use at least ' + el.minLength + ' characters.';
    if(el.pattern && !new RegExp('^(?:' + el.pattern + ')$').test(v)) return el.getAttribute('data-error') || 'Check the format.';
    var rule = el.getAttribute('data-rule');
    if(rule === 'card'){ var d = v.replace(/\s/g, ''); if(d.length < 13 || d.length > 19) return el.getAttribute('data-error'); }
    if(rule === 'expiry'){
      var p = v.replace(/\s/g, '').split('/'), now = new Date(), yr = 2000 + Number(p[1]), mo = Number(p[0]);
      if(yr < now.getFullYear() || (yr === now.getFullYear() && mo < now.getMonth() + 1)) return 'This card has expired.';
    }
    if(rule === 'newpass'){
      if(!/[A-Za-z]/.test(v) || !/[0-9]/.test(v)) return 'Use both letters and numbers.';
      var cur = form.querySelector('input[type=password]');
      if(cur && cur !== el && cur.value === v) return 'Choose a password different from your current one.';
    }
    return '';
  }
  function show(el, msg){
    var box = el.closest('.f-field') || el.parentNode, err = box.querySelector('.f-err');
    if(msg){
      if(!err){ err = document.createElement('div'); err.className = 'f-err'; err.setAttribute('role', 'alert'); box.appendChild(err); }
      err.textContent = msg; el.classList.add('is-invalid'); el.setAttribute('aria-invalid', 'true');
    } else {
      if(err) err.remove(); el.classList.remove('is-invalid'); el.removeAttribute('aria-invalid');
    }
  }

  forms.forEach(function(form){
    form.noValidate = true;                 /* we show our own messages */
    var fields = [].slice.call(form.querySelectorAll('input, select, textarea'));
    fields.forEach(function(el){
      el.addEventListener('blur', function(){ if(el.value.trim() || el.classList.contains('is-invalid')) show(el, check(el, form)); });
      el.addEventListener('input', function(){ if(el.classList.contains('is-invalid')) show(el, check(el, form)); });
    });
    /* capture phase: runs before the redirect / "Saved" handlers, and blocks them when invalid */
    form.addEventListener('submit', function(e){
      var first = null;
      fields.forEach(function(el){ var m = check(el, form); show(el, m); if(m && !first) first = el; });
      if(first){ e.preventDefault(); e.stopImmediatePropagation(); first.focus(); }
    }, true);
  });
})();


/* ================= dashboard checklists: click / tap / keyboard to tick ================= */
(function(){
  var lists = document.querySelectorAll('.dash-main .checklist');
  if(!lists.length) return;
  var page = location.pathname.split('/').pop() || 'page';
  var store = null; try{ store = window.localStorage; }catch(e){}
  lists.forEach(function(ul, li_i){
    ul.setAttribute('role', 'group');
    var saved = null;
    try{ saved = store && JSON.parse(store.getItem('stackly_chk_' + page + '_' + li_i) || 'null'); }catch(e){}
    var items = [].slice.call(ul.querySelectorAll('li'));
    function persist(){
      try{ store && store.setItem('stackly_chk_' + page + '_' + li_i, JSON.stringify(items.map(function(x){ return x.classList.contains('done') ? 1 : 0; }))); }catch(e){}
    }
    items.forEach(function(li, i){
      if(saved && saved.length === items.length) li.classList.toggle('done', !!saved[i]);
      li.setAttribute('role', 'checkbox'); li.setAttribute('tabindex', '0');
      li.setAttribute('aria-checked', li.classList.contains('done') ? 'true' : 'false');
      function flip(){
        var on = !li.classList.contains('done');
        li.classList.toggle('done', on); li.setAttribute('aria-checked', on ? 'true' : 'false');
        var box = li.querySelector('span');
        if(box && typeof gsap !== 'undefined') gsap.fromTo(box, {scale:.7}, {scale:1, duration:.35, ease:'back.out(3)', clearProps:'transform'});
        persist();
      }
      li.addEventListener('click', flip);
      li.addEventListener('keydown', function(e){ if(e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); flip(); } });
    });
  });
})();

/* card hover light: cursor-follow spotlight */
(function(){var S='.prog-card,.feature-card,.quote-card,.blog-card,.value-card,.price-card,.compare-card,.team-card,.stat-card,.dash-card,.mini';document.addEventListener('pointermove',function(e){var c=e.target.closest&&e.target.closest(S);if(!c)return;var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');},{passive:true});})();
