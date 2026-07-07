$(function(){
  gsap.registerPlugin(ScrollTrigger);
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var htmlEl = document.documentElement;
  var $main = $('#mainContent');

  (function(){
    var start = Date.now();
    var MIN_MS = 450; // avoid a jarring flash if everything loads instantly
    var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    Promise.all([fontsReady]).then(function(){
      var elapsed = Date.now() - start;
      var wait = Math.max(0, MIN_MS - elapsed);
      setTimeout(function(){
        $('#pageLoader').addClass('hidden');
        setTimeout(function(){ $('#pageLoader').remove(); }, 450);
      }, wait);
    });
  })();
 
  /* ================= THEME TOGGLE (remembers your last choice) ================= */
  var THEME_COLORS = { light:'#F5F4FA', dark:'#121218' };
  function updateMetaThemeColor(theme){
    $('#metaThemeColor').attr('content', THEME_COLORS[theme] || THEME_COLORS.light);
  }
  var savedTheme = null;
  try { savedTheme = localStorage.getItem('portfolio-theme'); } catch(e){ /* storage blocked, fall back below */ }
  if(savedTheme === 'dark' || savedTheme === 'light'){
    htmlEl.setAttribute('data-theme', savedTheme);
  } else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
    htmlEl.setAttribute('data-theme', 'dark');
  } else {
    htmlEl.setAttribute('data-theme', 'light');
  }
  updateMetaThemeColor(htmlEl.getAttribute('data-theme'));
  $('#themeToggle').on('click', function(){
    var current = htmlEl.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', next);
    updateMetaThemeColor(next);
    try { localStorage.setItem('portfolio-theme', next); } catch(e){ /* ignore if storage unavailable */ }
    if(!reduceMotion){
      gsap.fromTo(this, {rotate:-15}, {rotate:0, duration:.5, ease:'back.out(2)'});
    }
  });


  var currentLang = 'id';
  var TAG_LABELS = {
    internship: { id:'Website Magang', en:'Website Internship' },
    exercise:   { id:'Website Latihan', en:'Website Exercise' }
  };
  function updateProjectTags(){
    $('.proj-card').each(function(){
      var tag = $(this).data('tag');
      var labels = TAG_LABELS[tag];
      if(labels){ $(this).find('.proj-tag').text(labels[currentLang]); }
    });
  }
  function applyLang(lang){
    $('[data-i18n-id-html]').each(function(){
      $(this).html($(this).attr('data-i18n-' + lang + '-html'));
    });
    $('[data-i18n-id]').each(function(){
      $(this).text($(this).attr('data-i18n-' + lang));
    });
    $('[data-i18n-id-ph]').each(function(){
      $(this).attr('placeholder', $(this).attr('data-i18n-' + lang + '-ph'));
    });
    currentLang = lang;
    updateProjectTags();
    if(typeof renderDurations === 'function'){ renderDurations(); }
    if(typeof initTypedRoles === 'function'){ initTypedRoles(lang); }
    $('#langToggle').attr('data-active-lang', lang);
    $('#langToggle .lang-id').toggleClass('active', lang === 'id');
    $('#langToggle .lang-en').toggleClass('active', lang === 'en');
    // keep the layout indicator aligned if label widths shifted
    moveIndicator($navLinks.filter('.active'), true);
  }
  $('#langToggle').on('click', function(){
    applyLang(currentLang === 'id' ? 'en' : 'id');
  });

  var typedInstance = null;
  var TYPED_STRINGS = {
    id: ['Front-End Developer', 'React', 'PHP Laravel & CodeIgniter', 'UI yang hidup & responsif'],
    en: ['Front-End Developer', 'React', 'PHP Laravel & CodeIgniter', 'Interfaces that feel alive']
  };
  function initTypedRoles(lang){
    if(typeof Typed === 'undefined' || !document.getElementById('typedRoles')) return;
    if(typedInstance){ typedInstance.destroy(); }
    if(reduceMotion){
      document.getElementById('typedRoles').textContent = TYPED_STRINGS[lang][0];
      return;
    }
    typedInstance = new Typed('#typedRoles', {
      strings: TYPED_STRINGS[lang],
      typeSpeed: 42,
      backSpeed: 24,
      backDelay: 1400,
      startDelay: 300,
      loop: true,
      smartBackspace: true
    });
  }
  initTypedRoles(currentLang);
 
  /* ================= MOBILE CONTACTS TOGGLE ================= */
  $('#contactsToggle').on('click', function(){
    $(this).toggleClass('open');
    $('#contactList').toggleClass('open');
  });
 
  /* ================= NAV TAB SWITCHING ================= */
  var $navLinks = $('.nav-link');
  var $indicator = $('#navIndicator');
  var $pages = $('.page');
 
  // below 980px, .main-content no longer scrolls itself (see CSS),
  // the page/body scrolls instead — so ScrollTrigger and scrollTop(0)
  // need to target the right scroller depending on layout
  var mobileMQ = window.matchMedia('(max-width:980px)');
  function getScroller(){ return mobileMQ.matches ? window : '#mainContent'; }
  // Smoothly animate back to the top of whichever element actually
  // scrolls, instead of snapping instantly — this is what made tab
  // switches feel like they were "jumping" before.
  function scrollToTop(){
    if(reduceMotion){
      if(mobileMQ.matches){ window.scrollTo(0,0); } else { $main.scrollTop(0); }
      return;
    }
    if(mobileMQ.matches){
      window.scrollTo({ top:0, left:0, behavior:'smooth' });
    } else {
      gsap.to($main[0], { scrollTop:0, duration:.55, ease:'power2.out' });
    }
  }
 
  // On mobile the nav is a floating pill anchored to the bottom of the
  // screen, and the theme toggle floats just above it (rather than
  // overlapping it up in the corner). We measure the nav's real height
  // instead of guessing a fixed number, so it stays correct even if the
  // nav's height changes (longer labels, different font, etc).
  //
  // It also needs to clear the chat bubble (added below), which sits in
  // the same bottom-right corner. Earlier this was solved by stacking the
  // toggle ABOVE the bubble, but on short phone viewports that pushes it
  // high enough to overlap page content instead. Sitting it beside the
  // bubble (same row, shifted left) keeps both controls on the same low
  // horizontal band no matter how short the screen is.
  var navbarEl = document.getElementById('navbar');
  function positionMobileToggle(){
    if(!mobileMQ.matches){ $('#themeToggle').css({bottom:'', right:''}); return; }
    var gap = 12;
    var navBottomOffset = 16; // must match .navbar's bottom value in CSS
    $('#themeToggle').css('bottom', (navBottomOffset + navbarEl.offsetHeight + gap) + 'px');
 
    var fabW = $('#chatFab').outerWidth() || 52;
    var chatRight = 16; // must match .chat-fab-wrap's right value in mobile CSS
    var sideGap = 14;
    $('#themeToggle').css('right', (chatRight + fabW + sideGap) + 'px');
  }
  positionMobileToggle();
  $(window).on('resize orientationchange', positionMobileToggle);
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(positionMobileToggle);
  }
 
  // The indicator lives inside #navLinksScroll, which is itself the
  // horizontally-scrolling element (on mobile). Using offsetLeft/offsetWidth
  // (relative to that positioned container) instead of getBoundingClientRect
  // means the number is already correct regardless of current scroll
  // position, so there is no manual scrollLeft math to get wrong.
  function moveIndicator($btn, instant){
    var left = $btn[0].offsetLeft;
    var width = $btn[0].offsetWidth;
    gsap.killTweensOf($indicator[0]);
    if(instant){
      gsap.set($indicator[0], {x:left, width:width});
    } else {
      gsap.to($indicator[0], {x:left, width:width, duration:.35, ease:'power2.out'});
    }
  }
  moveIndicator($navLinks.filter('.active'), true);
 
  // recalc once the real font has loaded — before this, widths are based on
  // the fallback font and the indicator "jumps" once Plus Jakarta Sans kicks in
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(function(){
      moveIndicator($navLinks.filter('.active'), true);
    });
  }
 
  var switching = false;
  function switchPage(name){
    if(switching) return;
    var $target = $('.page[data-page="'+name+'"]');
    if($target.hasClass('active')) return;
    switching = true;
    var $current = $pages.filter('.active');
    $navLinks.removeClass('active').filter('[data-page="'+name+'"]').addClass('active');
    moveIndicator($navLinks.filter('.active'));
 
    if(reduceMotion){
      $current.removeClass('active');
      $target.addClass('active');
      scrollToTop();
      switching = false;
      ScrollTrigger.refresh();
      return;
    }
 
    // Scroll back to the top first (smoothly), then fade the OLD page out —
    // the new page's content animates in via replayReveals below, so we
    // never animate the container itself (that was causing the "double"
    // jump: container fade + children fade).
    scrollToTop();
    gsap.to($current[0], {opacity:0, y:-14, duration:.2, ease:'power2.in', onComplete:function(){
      $current.removeClass('active');
      gsap.set($current[0], {clearProps:'opacity,y'});
      $target.addClass('active');
      gsap.set($target[0], {opacity:1, y:0});
      switching = false;
      ScrollTrigger.refresh();
      replayReveals($target);
    }});
  }
  $navLinks.on('click', function(){ switchPage($(this).data('page')); });
  $(window).on('resize', function(){ moveIndicator($navLinks.filter('.active'), true); });
 
  /* ================= SCROLL REVEALS (scoped to main-content scroller) ================= */
  function initReveals($scope){
    ($scope ? $scope.find('.reveal-el') : $('.reveal-el')).each(function(){
      gsap.fromTo(this, {opacity:0, y:26}, {
        opacity:1, y:0, duration:.65, ease:'power3.out',
        scrollTrigger:{trigger:this, scroller:getScroller(), start:'top 92%'}
      });
    });
  }
  function replayReveals($page){
    $page.find('.reveal-el').each(function(i){
      gsap.fromTo(this, {opacity:0, y:22}, {opacity:1, y:0, duration:.5, ease:'power3.out', delay:i*0.045});
    });
  }
  initReveals();



  /* ================= STAT COUNTERS (count up once scrolled into view) ================= */
  $('.stat-number').each(function(){
    var $num = $(this);
    var target = parseInt($num.data('target'), 10) || 0;
    var suffix = $num.data('suffix') || '';
    ScrollTrigger.create({
      trigger:$num[0], scroller:getScroller(), start:'top 90%', once:true,
      onEnter:function(){
        if(reduceMotion){ $num.text(target + suffix); return; }
        var counter = {val:0};
        gsap.to(counter, {
          val:target, duration:1.3, ease:'power1.out',
          onUpdate:function(){ $num.text(Math.round(counter.val) + suffix); }
        });
      }
    });
  });
 
  /* timeline progress line */
  ScrollTrigger.create({
    trigger:'.timeline', scroller:getScroller(), start:'top 75%', end:'bottom 65%', scrub:.6,
    onUpdate:function(self){ $('#tlProgress').css('height', (self.progress*100)+'%'); }
  });

  /* ================= EXPERIENCE DURATION (auto-calculated) ================= */
  // Reads each "Mon YYYY – Mon YYYY" range straight out of the .tl-date text
  // and appends a small "X thn Y bln" / "X yr Y mo" badge — no hardcoded
  // numbers to keep in sync if the dates in the HTML ever change.
  // Ranges that are still ongoing are written as "Saat ini <year>" (or
  // "Present"/"Now"/"Current") instead of a real month name — those are
  // resolved against today's actual date rather than parsed as a month.
  var MONTHS_ID = {jan:0, feb:1, mar:2, apr:3, mei:4, jun:5, jul:6, agu:7, sep:8, okt:9, nov:10, des:11};
  var PRESENT_RE = /saat|present|now|current/i;
  function parseIdDate(str){
    var raw = str.trim();
    var lower = raw.toLowerCase();
    if(PRESENT_RE.test(lower)){
      var today = new Date();
      return { month: today.getMonth(), year: today.getFullYear() };
    }
    var parts = lower.split(/\s+/);
    var yearMatch = lower.match(/\d{4}/);
    return {
      month: MONTHS_ID[parts[0].slice(0,3)],
      year: yearMatch ? parseInt(yearMatch[0], 10) : NaN
    };
  }
  function calcDurationMonths(startStr, endStr){
    var s = parseIdDate(startStr), e = parseIdDate(endStr);
    var months = (e.year - s.year) * 12 + (e.month - s.month);
    return months < 1 ? 1 : months;
  }
  function formatDuration(totalMonths, lang){
    var y = Math.floor(totalMonths / 12), m = totalMonths % 12, parts = [];
    if(lang === 'id'){
      if(y > 0) parts.push(y + ' thn');
      if(m > 0) parts.push(m + ' bln');
    } else {
      if(y > 0) parts.push(y + ' yr');
      if(m > 0) parts.push(m + ' mo');
    }
    if(!parts.length) parts.push(lang === 'id' ? '1 bln' : '1 mo');
    return parts.join(' ');
  }
  function renderDurations(){
    $('.tl-item').each(function(){
      var $item = $(this);
      var range = $item.find('.tl-date').text().split('–');
      if(range.length < 2) return;
      var months = calcDurationMonths(range[0], range[1]);
      var $dur = $item.find('.tl-duration');
      if(!$dur.length){
        $dur = $('<span class="tl-duration"></span>');
        $item.find('.tl-badge').after($dur);
      }
      $dur.text(formatDuration(months, currentLang));
    });
  }
  renderDurations();

  /* ================= EXPERIENCE ON-SCROLL ANIMATION ================= */
  // Each card slides in from alternating sides with a soft blur-to-focus
  // and a gentle scale-up, while its dot pops in with a bouncy ease
  // timed slightly after the card starts — a small orchestrated moment
  // per entry rather than a single flat fade.
  function playTlItem($item){
    var dotEl = $item.find('.tl-dot')[0], cardEl = $item.find('.tl-card')[0];
    if(reduceMotion){
      gsap.set([dotEl, cardEl], {clearProps:'all'});
      return;
    }
    var tl = gsap.timeline({defaults:{ease:'power3.out'}});
    tl.to(dotEl, {scale:1, opacity:1, duration:.4, ease:'back.out(2.4)'})
      .to(cardEl, {opacity:1, x:0, y:0, scale:1, filter:'blur(0px)', duration:.75, ease:'power3.out'}, '-=0.25');
  }
  function initTimelineScrollFx(){
    $('.tl-item').each(function(i){
      var $item = $(this);
      var cardEl = $item.find('.tl-card')[0], dotEl = $item.find('.tl-dot')[0];
      if(reduceMotion) return;
      gsap.set(cardEl, {opacity:0, x: i % 2 === 0 ? -46 : 46, y:16, scale:.94, filter:'blur(5px)'});
      gsap.set(dotEl, {scale:0, opacity:0, transformOrigin:'50% 50%'});
      ScrollTrigger.create({
        trigger:$item[0], scroller:getScroller(), start:'top 88%',
        once:true, onEnter:function(){ playTlItem($item); }
      });
    });
  }
  initTimelineScrollFx();

  /* ================= EXPERIENCE CARD TILT (mouse-follow, GSAP quickTo) ================= */
  if(!reduceMotion){
    $('.tl-card').each(function(){
      var el = this;
      var toRotX = gsap.quickTo(el, 'rotationX', {duration:.5, ease:'power3.out'});
      var toRotY = gsap.quickTo(el, 'rotationY', {duration:.5, ease:'power3.out'});
      var toLift = gsap.quickTo(el, 'y', {duration:.5, ease:'power3.out'});
      $(el).on('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        toRotY(px * 7);
        toRotX(py * -7);
        toLift(-4);
      });
      $(el).on('mouseleave', function(){
        toRotX(0); toRotY(0); toLift(0);
      });
    });
  }
 
  /* ================= AMBIENT BLOB PARALLAX ================= */
  if(!reduceMotion){
    gsap.to('.sidebar-blob', {y:26, duration:6, repeat:-1, yoyo:true, ease:'sine.inOut', stagger:1});
    gsap.utils.toArray('.bg-blob').forEach(function(el, i){
      gsap.to(el, {y: i%2===0 ? 30 : -30, duration:7+i, repeat:-1, yoyo:true, ease:'sine.inOut'});
    });
  }

  /* ================= CURSOR SPOTLIGHT (desktop only) ================= */
  // A soft radial glow that follows the mouse across the main content area.
  // Skipped entirely on mobile (no real cursor) and reduced-motion.
  if(!reduceMotion && !mobileMQ.matches){
    var $spot = $('<div class="spotlight" aria-hidden="true"></div>').appendTo($main);
    var spotEl = $spot[0];
    $main.on('mousemove', function(e){
      var r = this.getBoundingClientRect();
      spotEl.style.setProperty('--x', (e.clientX - r.left) + 'px');
      spotEl.style.setProperty('--y', (e.clientY - r.top) + 'px');
      $spot.addClass('active');
    }).on('mouseleave', function(){
      $spot.removeClass('active');
    });
  }
 
  /* ================= PROJECTS ================= */
  var projects = [
    {title:"Recipe Website (localStorage)", tag:"exercise", url:"https://ahmadsabili0081.github.io/RecipeApps/", img:"images/recipeApps.png"},
    {title:"Note App (localStorage)", tag:"exercise", url:"https://ahmadsabili0081.github.io/notesApp/", img:"images/notesApps.png"},
    {title:"Whack-a-Mole", tag:"exercise", url:"https://ahmadsabili0081.github.io/pukul-tikus/", img:"images/whack-a-mole.png"},
    {title:"Music Player", tag:"exercise", url:"https://ahmadsabili0081.github.io/MusicAppss/", img:"images/MusicPlayer.png"},
    {title:"Osiris Landing Website", tag:"exercise", url:"https://ahmadsabili0081.github.io/osirisLanding/", img:"images/OsirisLanding.png"},
    {title:"Movie List", tag:"exercise", url:"https://ahmadsabili0081.github.io/MovieList/", img:"images/MovieList.png"},
    {title:"House Landing Website", tag:"exercise", url:"https://ahmadsabili0081.github.io/House/", img:"images/HouseLandingEdit.png"},
    {title:"Ilo Landing Website", tag:"internship", url:"https://ahmadsabili0081.github.io/Landingpage/", img:"images/IloLanding.png"},
    {title:"Booking Book (localStorage)", tag:"exercise", url:"https://ahmadsabili0081.github.io/BookingBook/", img:"images/bookingBook.png"},
    {title:"Quiz Website", tag:"exercise", url:"https://ahmadsabili0081.github.io/quizApps/", img:"images/quizApp.png"},
    {title:"Adira Landing Website", tag:"internship", url:"https://ahmadsabili0081.github.io/AdiraLandingpage/", img:"images/AdiraLanding.png"},
    {title:"Migas Landing Website", tag:"internship", url:"https://ahmadsabili0081.github.io/MigasNews/", img:"images/MigasNews.png"},
    {title:"Memory Game", tag:"exercise", url:"https://ahmadsabili0081.github.io/memoryGame/", img:"images/memoryGame.png"},
    {title:"Todo Apps", tag:"exercise", url:"https://ahmadsabili0081.github.io/TodoApps/", img:"images/todoApps.png"}
  ];
  var VISIBLE_STEP = 6, visibleCount = VISIBLE_STEP, activeFilter = 'all';
  var $grid = $('#projGrid');
 
  // Build every card ONCE, up front. "Show more" and the filter buttons
  // then only add/remove a "hide" class — they never destroy and rebuild
  // DOM nodes. Recreating nodes that are already on screen is what was
  // causing the scroll position to jump back to the top (the browser's
  // scroll-anchoring loses its anchor point when the elements around it
  // get replaced), plus it was needlessly re-triggering every reveal
  // animation and reloading every image on every click.
  function buildAllCards(){
    projects.forEach(function(p){
      var $card = $(
        '<a href="'+p.url+'" target="_blank" rel="noopener" class="proj-card reveal-el" data-tag="'+p.tag+'">'+
          '<div class="proj-thumb">'+
            '<img src="'+p.img+'" alt="'+p.title+'" loading="lazy" />'+
            '<div class="proj-overlay"><span class="view">↗ View site</span></div>'+
          '</div>'+
          '<div class="proj-body">'+
            '<div class="proj-tag">'+(p.tag==='internship'?'Website Internship':'Website Exercise')+'</div>'+
            '<div class="proj-title">'+p.title+'</div>'+
          '</div>'+
        '</a>'
      );
      $grid.append($card);
      $card.find('img').on('load', function(){ $(this).addClass('loaded'); });
      // Playful "pop in" entrance: scales up from slightly small + rotated
      // and settles into place with a light bounce, instead of a flat fade.
      gsap.fromTo($card[0],
        {opacity:0, y:34, scale:.9, rotate:-1.5},
        {opacity:1, y:0, scale:1, rotate:0, duration:.65, ease:'back.out(1.6)',
          scrollTrigger:{trigger:$card[0], scroller:getScroller(), start:'top 94%'}});
    });
  }
 
  function updateProjectVisibility(){
    var shown = 0;
    $grid.children('.proj-card').each(function(){
      var $c = $(this);
      var matches = activeFilter === 'all' || $c.data('tag') === activeFilter;
      if(!matches){
        $c.addClass('hide');
      } else {
        shown++;
        $c.toggleClass('hide', shown > visibleCount);
      }
    });
    var totalMatching = projects.filter(function(p){ return activeFilter==='all' || p.tag===activeFilter; }).length;
    $('#showMoreBtn').toggle(totalMatching > visibleCount);
  }
 
  buildAllCards();
  updateProjectVisibility();
  updateProjectTags();
 
  $('.filter-btn').on('click', function(){
    $('.filter-btn').removeClass('active'); $(this).addClass('active');
    activeFilter = $(this).data('filter'); visibleCount = VISIBLE_STEP;
    updateProjectVisibility();
  });
  $('#showMoreBtn').on('click', function(){ visibleCount += VISIBLE_STEP; updateProjectVisibility(); });
 
  /* ================= CONTACT FORM -> MAILTO ================= */
  $('#contactForm').on('submit', function(e){
    e.preventDefault();
    var name = $('#fname').val(), email = $('#femail').val(), msg = $('#fmsg').val();
    var subject = encodeURIComponent('Portfolio inquiry from ' + name);
    var body = encodeURIComponent(msg + '\n\n— ' + name + ' (' + email + ')');
    window.location.href = 'mailto:ahmadsabili0081@gmail.com?subject=' + subject + '&body=' + body;
  });
 
  setTimeout(function(){ ScrollTrigger.refresh(); }, 300);

     var CHAT_API_URL = 'https://portofolio-chat-backend.vercel.app/api/chat';
 
  var $wrap = $('.chat-fab-wrap');
  var $fab = $('#chatFab');
  var $panel = $('#chatPanel');
  var $messages = $('#chatMessages');
  var $input = $('#chatInput');
  var $send = $('#chatSend');
  var history = []; // {role: 'user'|'assistant', content: '...'}
  var opened = false;
  var mobileMQ = window.matchMedia('(max-width:980px)');
 
  // On mobile, the site's own navbar becomes a floating pill anchored to the
  // bottom of the screen (see .navbar in responsive.css), and the theme
  // toggle repositions itself above it. The chat bubble + panel need the
  // same treatment so they never overlap or get hidden behind that nav.
  function positionChatWidget(){
    if(!mobileMQ.matches){
      $wrap.css('bottom', '');
      $panel.css({ bottom:'', top:'' });
      return;
    }
    var navEl = document.getElementById('navbar');
    var navBottomOffset = 16; // must match .navbar's bottom value in CSS
    var gap = 14;
    var navSpace = navEl ? (navBottomOffset + navEl.offsetHeight + gap) : 90;
 
    $wrap.css('bottom', navSpace + 'px');
 
    // Panel is a fixed bottom sheet on mobile: anchor its bottom edge just
    // above the bubble, and let max-height (from CSS) handle the top.
    var fabH = $fab.outerHeight() || 58;
    $panel.css({ bottom:(navSpace + fabH + 12) + 'px', top:'auto' });

    // The theme toggle sits beside the chat bubble — recompute it here too
    // so both widgets always agree on layout, regardless of which one
    // triggered the reflow (resize, orientation change, font load, etc).
    if(typeof positionMobileToggle === 'function'){ positionMobileToggle(); }
  }
  positionChatWidget();
  $(window).on('resize orientationchange', positionChatWidget);
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(positionChatWidget);
  }
 
  $fab.on('click', function(){
    opened = !opened;
    $wrap.toggleClass('open', opened);
    if(opened){
      positionChatWidget();
      setTimeout(function(){ $input.trigger('focus'); }, 250);
    }
  });
 
  function addMessage(text, cls){
    var $msg = $('<div class="chat-msg ' + cls + '"></div>').text(text);
    $messages.append($msg);
    $messages.scrollTop($messages[0].scrollHeight);
    return $msg;
  }
 
  function sendMessage(){
    var text = $input.val().trim();
    if(!text) return;
    $input.val('');
    $send.prop('disabled', true);
 
    addMessage(text, 'user');
    history.push({ role: 'user', content: text });
    var $loading = addMessage('Mengetik...', 'bot loading');
 
    $.ajax({
      url: CHAT_API_URL,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ message: text, history: history.slice(0, -1) })
    })
    .done(function(data){
      $loading.remove();
      if(data && data.reply){
        addMessage(data.reply, 'bot');
        history.push({ role: 'assistant', content: data.reply });
      } else {
        addMessage('Maaf, ada gangguan. Coba lagi ya, atau langsung email ke ahmadsabili0081@gmail.com', 'bot');
      }
    })
    .fail(function(){
      $loading.remove();
      addMessage('Gagal terhubung ke server. Coba lagi nanti.', 'bot');
    })
    .always(function(){
      $send.prop('disabled', false);
    });
  }
 
  $send.on('click', sendMessage);
  $input.on('keydown', function(e){
    if(e.key === 'Enter') sendMessage();
  });

});
