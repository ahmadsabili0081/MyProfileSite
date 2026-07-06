$(function(){
  gsap.registerPlugin(ScrollTrigger);
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var htmlEl = document.documentElement;
  var $main = $('#mainContent');
 
  /* ================= PAGE LOADER ================= */
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
 
  /* ================= THEME TOGGLE ================= */
  htmlEl.setAttribute('data-theme', 'dark');
  $('#themeToggle').on('click', function(){
    var current = htmlEl.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', next);
    if(!reduceMotion){
      gsap.fromTo(this, {rotate:-15}, {rotate:0, duration:.5, ease:'back.out(2)'});
    }
  });
 
  /* ================= MOBILE CONTACTS TOGGLE ================= */
  $('#contactsToggle').on('click', function(){
    $(this).toggleClass('open');
    $('#contactList').toggleClass('open');
  });
 
  /* ================= NAV TAB SWITCHING ================= */
  var $navLinks = $('.nav-link');
  var $indicator = $('#navIndicator');
  var $pages = $('.page');
  var navbarEl = document.getElementById('navbar');
 
  // below 980px, .main-content no longer scrolls itself (see CSS),
  // the page/body scrolls instead — so ScrollTrigger and scrollTop(0)
  // need to target the right scroller depending on layout
  var mobileMQ = window.matchMedia('(max-width:980px)');
  function getScroller(){ return mobileMQ.matches ? window : '#mainContent'; }
  function scrollToTop(){
    if(mobileMQ.matches){ window.scrollTo(0,0); } else { $main.scrollTop(0); }
  }
 
  function moveIndicator($btn, instant){
    var navRect = navbarEl.getBoundingClientRect();
    var btnRect = $btn[0].getBoundingClientRect();
    var left = btnRect.left - navRect.left + navbarEl.scrollLeft;
    gsap.killTweensOf($indicator[0]);
    if(instant){
      gsap.set($indicator[0], {x:left, width:btnRect.width});
    } else {
      gsap.to($indicator[0], {x:left, width:btnRect.width, duration:.35, ease:'power2.out'});
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
 
    // fade the OLD page out only — the new page's content animates in
    // via replayReveals below, so we never animate the container itself
    // (that was causing the "double" jump: container fade + children fade)
    gsap.to($current[0], {opacity:0, y:-14, duration:.2, ease:'power2.in', onComplete:function(){
      $current.removeClass('active');
      gsap.set($current[0], {clearProps:'opacity,y'});
      $target.addClass('active');
      gsap.set($target[0], {opacity:1, y:0});
      scrollToTop();
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
 
  /* timeline progress line */
  ScrollTrigger.create({
    trigger:'.timeline', scroller:getScroller(), start:'top 75%', end:'bottom 65%', scrub:.6,
    onUpdate:function(self){ $('#tlProgress').css('height', (self.progress*100)+'%'); }
  });
 
  /* ================= AMBIENT BLOB PARALLAX ================= */
  if(!reduceMotion){
    gsap.to('.sidebar-blob', {y:26, duration:6, repeat:-1, yoyo:true, ease:'sine.inOut', stagger:1});
    gsap.utils.toArray('.bg-blob').forEach(function(el, i){
      gsap.to(el, {y: i%2===0 ? 30 : -30, duration:7+i, repeat:-1, yoyo:true, ease:'sine.inOut'});
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
 
  function renderProjects(){
    var filtered = projects.filter(function(p){ return activeFilter==='all' || p.tag===activeFilter; });
    $grid.empty();
    filtered.forEach(function(p, i){
      var $card = $(
        '<a href="'+p.url+'" target="_blank" rel="noopener" class="proj-card reveal-el'+(i>=visibleCount?' hide':'')+'">'+
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
      gsap.fromTo($card[0], {opacity:0, y:24}, {opacity:1, y:0, duration:.5, delay:(i%VISIBLE_STEP)*0.05, ease:'power3.out',
        scrollTrigger:{trigger:$card[0], scroller:getScroller(), start:'top 94%'}});
    });
    $('#showMoreBtn').toggle(filtered.length > visibleCount);
    ScrollTrigger.refresh();
  }
  $('.filter-btn').on('click', function(){
    $('.filter-btn').removeClass('active'); $(this).addClass('active');
    activeFilter = $(this).data('filter'); visibleCount = VISIBLE_STEP;
    renderProjects();
  });
  $('#showMoreBtn').on('click', function(){ visibleCount += VISIBLE_STEP; renderProjects(); });
  renderProjects();
 
  /* ================= CONTACT FORM -> MAILTO ================= */
  $('#contactForm').on('submit', function(e){
    e.preventDefault();
    var name = $('#fname').val(), email = $('#femail').val(), msg = $('#fmsg').val();
    var subject = encodeURIComponent('Portfolio inquiry from ' + name);
    var body = encodeURIComponent(msg + '\n\n— ' + name + ' (' + email + ')');
    window.location.href = 'mailto:ahmadsabili0081@gmail.com?subject=' + subject + '&body=' + body;
  });
 
  setTimeout(function(){ ScrollTrigger.refresh(); }, 300);
});
