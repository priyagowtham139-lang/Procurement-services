/* ==========================================================================
   STACKLY — shared site engine
   ========================================================================== */
(function(){

  var NAV = [
    {href:'index.html',    label:'Home',       key:'home'},
    {href:'about.html',    label:'About',      key:'about'},
    {href:'services.html', label:'Services',   key:'services'},
    {href:'industries.html',label:'Industries',key:'industries'},
    {href:'resources.html',label:'Resources',  key:'resources'},
    {href:'contact.html',  label:'Contact',    key:'contact'}
  ];

  var SERVICES = [
    'e-Sourcing',
    'e-Tendering',
    'Contract management',
    'Vendor management',
    'Spend analytics',
    'Compliance &amp; audit'
  ];

  /* Sidebar sets for the two dashboards. `key` matches the data-page attribute
     of the page the item belongs to, so the active item follows the route. */
  var DASH_NAV = {
    user: [
      {href:'dashboard-user.html',  label:'Overview',    icon:'fa-gauge',              key:'dash-overview'},
      {href:'dash-contracts.html',  label:'My Contracts',icon:'fa-file-contract',      key:'dash-contracts'},
      {href:'dash-orders.html',     label:'Orders',      icon:'fa-truck-fast',         key:'dash-orders'},
      {href:'dash-suppliers.html',  label:'Suppliers',   icon:'fa-people-arrows',      key:'dash-suppliers'},
      {href:'dash-wishlist.html',   label:'Wishlist',    icon:'fa-regular fa-heart',   key:'dash-wishlist'},
      {href:'dash-settings.html',   label:'Settings',    icon:'fa-gear',               key:'dash-settings'}
    ],
    admin: [
      {href:'dashboard-admin.html',    label:'Organization overview', icon:'fa-gauge',          key:'dash-admin-overview'},
      {href:'dash-admin-users.html',   label:'User management',       icon:'fa-users-gear',    key:'dash-admin-users'},
      {href:'dash-admin-tenders.html', label:'All tenders',           icon:'fa-gavel',         key:'dash-admin-tenders'},
      {href:'dash-admin-vendors.html', label:'Vendor registry',       icon:'fa-people-arrows', key:'dash-admin-vendors'},
      {href:'dash-admin-compliance.html',label:'Compliance',          icon:'fa-shield-halved', key:'dash-admin-compliance'},
      {href:'dash-admin-analytics.html',label:'Spend analytics',      icon:'fa-chart-pie',     key:'dash-admin-analytics'},
      {href:'dash-admin-settings.html',label:'Platform settings',     icon:'fa-gear',          key:'dash-admin-settings'}
    ]
  };

  function currentPage(){ return document.body.getAttribute('data-page') || 'home'; }

  /* Navigates to dest, remembering the current page + scroll offset so that
     404.html can offer a "go back" that actually returns you here. */
  function redirectTo(dest){
    var anchor = location.pathname.split('/').pop() || 'index.html';
    sessionStorage.setItem('sk_return_href', anchor);
    sessionStorage.setItem('sk_return_scroll', String(window.scrollY));
    location.href = dest;
  }

  /* ---------- signed-in profile ----------
     The display name is derived from whatever local part the person typed
     before the @, so jordan.blake@gmail.com reads as "Jordan Blake". */
  var PROFILE_KEY = 'sk_user_email';
  var PROFILE_FALLBACK = 'jordan.blake@gmail.com';

  function profileEmail(){
    try{ return sessionStorage.getItem(PROFILE_KEY) || PROFILE_FALLBACK; }
    catch(e){ return PROFILE_FALLBACK; }
  }
  function setProfileEmail(v){
    try{ sessionStorage.setItem(PROFILE_KEY, v); }catch(e){}
  }
  function profileName(){
    var local = String(profileEmail()).split('@')[0] || '';
    var words = local
      .replace(/([a-z])([A-Z])/g, '$1 $2')   /* jordanBlake  -> jordan Blake */
      .split(/[._\-\s+0-9]+/)                /* priya.nair    -> priya nair  */
      .filter(Boolean);
    if(!words.length) return 'Guest';
    return words.map(function(w){ return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
  }
  function profileInitials(){
    var w = profileName().split(' ').filter(Boolean);
    if(!w.length) return '?';
    if(w.length === 1) return w[0].charAt(0).toUpperCase();
    return (w[0].charAt(0) + w[w.length - 1].charAt(0)).toUpperCase();
  }
  /* paints every profile surface on the current page */
  function paintProfile(){
    var name = profileName();
    document.querySelectorAll('[data-profile-name]').forEach(function(el){ el.textContent = name; });
    document.querySelectorAll('[data-profile-email]').forEach(function(el){ el.textContent = profileEmail(); });
    document.querySelectorAll('[data-profile-initials]').forEach(function(el){ el.textContent = profileInitials(); });
  }

  /* Log out: drop the stored identity on the way to the sign-in page, so the
     next person cannot inherit the previous one's name on a shared machine. */
  function clearProfile(){
    try{
      sessionStorage.removeItem(PROFILE_KEY);
      sessionStorage.removeItem('sk_return_href');
      sessionStorage.removeItem('sk_return_scroll');
    }catch(e){}
  }
  function initLogout(){
    document.addEventListener('click', function(e){
      var link = e.target.closest ? e.target.closest('.js-logout') : null;
      if(link) clearProfile();
    });
  }

  function buildHeader(){
    var mount = document.getElementById('site-header');
    if(!mount) return;
    var page = currentPage();
    var navHtml = NAV.map(function(n){
      return '<a href="'+n.href+'"'+(n.key===page?' class="active"':'')+'>'+n.label+'</a>';
    }).join('');
    var mobileNavHtml = NAV.map(function(n){
      return '<a href="'+n.href+'"'+(n.key===page?' class="active"':'')+'>'+n.label+' <i class="fa-solid fa-arrow-right-long"></i></a>';
    }).join('');

    mount.innerHTML =
    '<header class="site-header" id="siteHeader"><div class="header-grid">'+
      '<div class="header-logo"><a href="index.html"><img class="header-logo-img" src="assets/logo (3).webp" alt="Stackly"></a></div>'+
      '<nav class="header-nav">'+navHtml+'</nav>'+
      '<div class="header-actions">'+
        '<a href="login.html" class="btn btn-accent btn-sm header-signin"><i class="fa-regular fa-user"></i><span>Sign In</span></a>'+
        '<button class="hamburger" id="hamburgerBtn" aria-label="Open menu"><span></span><span></span><span></span></button>'+
      '</div>'+
    '</div></header>'+
    '<div class="mobile-nav" id="mobileNav">'+
      '<a href="index.html" class="mobile-nav-logo" aria-label="Stackly home"><img src="assets/logo (3).webp" alt="Stackly"></a>'+
      '<button class="icon-btn mobile-nav-close" id="mobileNavClose" aria-label="Close menu"><i class="fa-solid fa-xmark"></i></button>'+
      mobileNavHtml+
      '<div class="mobile-nav-actions">'+
        '<a href="login.html" class="btn btn-accent"><i class="fa-regular fa-user"></i><span>Sign In</span></a>'+
      '</div>'+
    '</div>';
  }

  function buildFooter(){
    var mount = document.getElementById('site-footer');
    if(!mount) return;
    var page = currentPage();

    var navHtml = NAV.map(function(n){
      return '<li><a href="'+n.href+'"'+(n.key===page?' class="active"':'')+'>'+n.label+'</a></li>';
    }).join('');

    var serviceHtml = SERVICES.map(function(s){
      return '<li><a href="404.html" class="js-404">'+s+'</a></li>';
    }).join('');

    mount.innerHTML =
    '<footer><div class="container">'+
      '<div class="footer-top">'+
        '<div class="footer-brand">'+
          '<a href="index.html"><img class="footer-logo-img" src="assets/logo_white.webp" alt="Stackly"></a>'+
          '<p>Stackly is a smart procurement platform helping public agencies and enterprises run transparent, efficient sourcing — from requisition to contract, in one connected workspace.</p>'+
          '<div class="footer-social">'+
            '<a href="404.html" class="js-social" aria-label="Twitter"><i class="fa-brands fa-x-twitter"></i></a>'+
            '<a href="404.html" class="js-social" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>'+
            '<a href="404.html" class="js-social" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>'+
            '<a href="404.html" class="js-social" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>'+
          '</div>'+
        '</div>'+
        '<div class="footer-col">'+
          '<h4 class="footer-acc-head">Quick links <i class="fa-solid fa-chevron-down"></i></h4>'+
          '<ul>'+navHtml+'</ul>'+
        '</div>'+
        '<div class="footer-col">'+
          '<h4 class="footer-acc-head">Services <i class="fa-solid fa-chevron-down"></i></h4>'+
          '<ul>'+serviceHtml+'</ul>'+
        '</div>'+
        '<div class="footer-col footer-contact">'+
          '<h4 class="footer-acc-head">Contact <i class="fa-solid fa-chevron-down"></i></h4>'+
          '<ul>'+
            '<li class="footer-contact-row"><i class="fa-solid fa-location-dot"></i><address class="footer-address">MMR Complex, Periyakollappatty<br>Chinna Thirupathi, Salem, Tamil Nadu 636008</address></li>'+
            '<li class="footer-contact-row"><i class="fa-solid fa-phone"></i><a href="tel:+917010792745">+91 70107 92745</a></li>'+
            '<li class="footer-contact-row"><i class="fa-solid fa-envelope"></i><a href="mailto:hello@stackly.io">hello@stackly.io</a></li>'+
          '</ul>'+
        '</div>'+
      '</div>'+
      '<div class="footer-bottom">'+
        '<span>&copy; 2026 Stackly Technologies. All rights reserved.</span>'+
        '<span>Built for transparent public &amp; enterprise procurement.</span>'+
        '<a href="#top" class="footer-login js-top">Login <i class="fa-solid fa-arrow-up"></i></a>'+
      '</div>'+
    '</div></footer>';
  }

  /* Renders the dashboard sidebar into #dashSide. The nav set is chosen by the
     body's data-dash attribute so buyer and admin pages stay independent. */
  function buildDashSide(){
    var mount = document.getElementById('dashSide');
    if(!mount) return;
    var page = currentPage();
    var set = document.body.getAttribute('data-dash');
    var items = DASH_NAV[set];
    if(!items) return;

    var navHtml = items.map(function(n){
      return '<a href="'+n.href+'"'+(n.key===page?' class="active" aria-current="page"':'')+'><i class="fa-solid '+n.icon+'"></i> '+n.label+'</a>';
    }).join('');

    mount.innerHTML =
      '<div class="dl"><img class="dl-logo" src="assets/logo_white.webp" alt="Stackly"></div>'+
    '<div class="dprofile">'+
      '<div class="davatar" data-profile-initials aria-hidden="true">?</div>'+
      '<div class="dwho"><b class="dname" data-profile-name>Guest</b><span class="dmail" data-profile-email></span></div>'+
    '</div>'+
    '<nav class="dash-nav">'+navHtml+'</nav>'+
    '<div class="out"><a href="login.html" class="js-logout"><i class="fa-solid fa-right-from-bracket"></i> Log out</a></div>';
  }

  /* ---------- dashboard mobile header (logo + drawer toggle) ----------
     Rendered from JS so every dashboard page stays in sync. Hidden above
     900px by CSS, where the persistent sidebar already carries the brand. */
  function buildDashHead(){
    var set = document.body.getAttribute('data-dash');
    if(!set || !document.getElementById('dashSide')) return;
    if(document.querySelector('.dash-mhead')) return;

    var head = document.createElement('header');
    head.className = 'dash-mhead';
    head.innerHTML =
      '<a class="mh-logo" href="index.html"><img src="assets/logo (3).webp" alt="Stackly"></a>'+
      '<button class="hamburger dash-mhead-burger" id="dashHamburger" type="button" aria-label="Toggle menu" aria-controls="dashSide" aria-expanded="false"><span></span><span></span><span></span></button>';

    var wrap = document.querySelector('.dash-wrap');
    document.body.insertBefore(head, wrap || null);
  }

  /* ---------- 404 return tracking (social + service links) ---------- */
  function trackSocialLinks(){
    document.addEventListener('click', function(e){
      var a = e.target.closest('.js-social, .js-404');
      if(!a) return;
      e.preventDefault();
      redirectTo('404.html');
    });
  }

  /* ---------- footer: login scrolls back to top ---------- */
  function initTopLinks(){
    document.addEventListener('click', function(e){
      var a = e.target.closest('.js-top');
      if(!a) return;
      e.preventDefault();
      window.scrollTo({top:0, left:0, behavior:'smooth'});
    });
  }

  function restoreScrollIfNeeded(){
    var page = location.pathname.split('/').pop() || 'index.html';
    var target = sessionStorage.getItem('sk_return_href');
    if(target && target === page){
      var y = parseInt(sessionStorage.getItem('sk_return_scroll')||'0',10);
      requestAnimationFrame(function(){
        window.scrollTo({top:y, left:0, behavior:'auto'});
        sessionStorage.removeItem('sk_return_href');
        sessionStorage.removeItem('sk_return_scroll');
      });
    }
  }

  function initGoBack404(){
    var btn = document.getElementById('goBackBtn');
    if(!btn) return;
    btn.addEventListener('click', function(){
      var target = sessionStorage.getItem('sk_return_href');
      if(target){ location.href = target; }
      else if(document.referrer && document.referrer.indexOf(location.host) !== -1){ history.back(); }
      else { location.href = 'index.html'; }
    });
  }

  /* ---------- loader ---------- */
  function initLoader(){
    var loader = document.getElementById('loader');
    if(!loader) return;
    var bar = loader.querySelector('.loader-bar span');
    var pct = loader.querySelector('.loader-pct');
    var value = 0;

    var timer = setInterval(function(){
      value += Math.random()*13 + 5;
      if(value >= 100) value = 100;
      if(bar) bar.style.width = value + '%';
      if(pct) pct.textContent = Math.floor(value) + '%';
      if(value >= 100) clearInterval(timer);
    }, 130);

    function finish(){
      if(loader.classList.contains('done')) return;
      clearInterval(timer);
      if(bar) bar.style.width = '100%';
      if(pct) pct.textContent = '100%';
      setTimeout(function(){ loader.classList.add('done'); }, 320);
    }

    window.addEventListener('load', function(){ setTimeout(finish, 650); });
    setTimeout(finish, 2600);
  }

  /* ---------- header scroll + hamburger ---------- */
  function initHeader(){
    var header = document.getElementById('siteHeader');
    window.addEventListener('scroll', function(){
      if(!header) return;
      if(window.scrollY > 12) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    });
    var burger = document.getElementById('hamburgerBtn');
    var mnav = document.getElementById('mobileNav');
    var mclose = document.getElementById('mobileNavClose');
    function toggle(open){
      burger.classList.toggle('open', open);
      mnav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }
    if(burger){
      burger.addEventListener('click', function(){ toggle(!mnav.classList.contains('open')); });
    }
    if(mclose){ mclose.addEventListener('click', function(){ toggle(false); }); }
    if(mnav){
      mnav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ toggle(false); }); });
    }
  }

  /* ---------- footer accordion (mobile) ---------- */
  function initFooterAccordion(){
    document.querySelectorAll('.footer-acc-head').forEach(function(h){
      h.addEventListener('click', function(){
        var ul = h.nextElementSibling;
        var isOpen = ul.classList.contains('open');
        ul.classList.toggle('open', !isOpen);
        h.classList.toggle('open', !isOpen);
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal(){
    var els = document.querySelectorAll('.reveal, .reveal-l, .reveal-r, .hl-underline');
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); obs.unobserve(en.target); }
      });
    }, {threshold:.18});
    els.forEach(function(el){ obs.observe(el); });
  }

  /* ---------- animated counters ---------- */
  function initCounters(){
    var counters = document.querySelectorAll('[data-count]');
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(!en.isIntersecting) return;
        obs.unobserve(en.target);
        var el = en.target, end = parseFloat(el.getAttribute('data-count')), dec = el.getAttribute('data-dec')==='1';
        var start = 0, dur = 1400, t0 = null;
        function step(t){
          if(!t0) t0 = t;
          var p = Math.min((t - t0)/dur, 1);
          var val = start + (end-start)*(1-Math.pow(1-p,3));
          el.textContent = dec ? val.toFixed(1) : Math.floor(val).toLocaleString();
          if(p<1) requestAnimationFrame(step); else el.textContent = dec ? end.toFixed(1) : end.toLocaleString();
        }
        requestAnimationFrame(step);
      });
    }, {threshold:.4});
    counters.forEach(function(c){ obs.observe(c); });
  }

  /* ---------- spotlight cards ---------- */
  function initSpotlight(){
    document.querySelectorAll('.spot-card').forEach(function(card){
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX-r.left)+'px');
        card.style.setProperty('--my', (e.clientY-r.top)+'px');
      });
    });
  }

  /* Magnetic button hover-to-cursor motion removed: the .mag-inner label used
     to be translated toward the pointer on every mousemove, which made button
     text slide around under the cursor. The .magnetic / .mag-inner classes
     remain in the markup and CSS purely for button layout (flex + gap). */

  /* ---------- tabs ---------- */
  function initTabs(){
    document.querySelectorAll('.tabbar').forEach(function(bar){
      var group = bar.getAttribute('data-group');
      bar.querySelectorAll('button').forEach(function(btn){
        btn.addEventListener('click', function(){
          bar.querySelectorAll('button').forEach(function(b){ b.classList.remove('active'); });
          btn.classList.add('active');
          document.querySelectorAll('.tabpanel[data-group="'+group+'"]').forEach(function(p){
            p.classList.toggle('active', p.getAttribute('data-panel') === btn.getAttribute('data-tab'));
          });
        });
      });
    });
  }

  /* ---------- password eye toggle (cross-browser safe) ---------- */
  function initPasswordToggle(){
    document.querySelectorAll('.pw-toggle').forEach(function(btn){
      btn.setAttribute('type','button');
      btn.addEventListener('click', function(){
        var input = btn.parentElement.querySelector('input');
        var isPw = input.getAttribute('type') === 'password';
        input.setAttribute('type', isPw ? 'text' : 'password');
        var icon = btn.querySelector('i');
        icon.classList.remove('fa-eye','fa-eye-slash');
        icon.classList.add(isPw ? 'fa-eye-slash' : 'fa-eye');
        btn.setAttribute('aria-label', isPw ? 'Hide password' : 'Show password');
      });
    });
  }

  /* ---------- auth page logic ---------- */
  function initAuth(){
    var switchBtns = document.querySelectorAll('.auth-switch button');
    if(switchBtns.length){
      switchBtns.forEach(function(btn){
        btn.addEventListener('click', function(){
          switchBtns.forEach(function(b){ b.classList.remove('active'); });
          btn.classList.add('active');
          document.querySelectorAll('.auth-panel').forEach(function(p){
            p.classList.toggle('active', p.getAttribute('data-auth') === btn.getAttribute('data-switch'));
          });
        });
      });
    }
    var roleBtns = document.querySelectorAll('.role-tabs button');
    if(roleBtns.length){
      roleBtns.forEach(function(btn){
        btn.addEventListener('click', function(){
          roleBtns.forEach(function(b){ b.classList.remove('active'); });
          btn.classList.add('active');
          document.getElementById('loginForm').setAttribute('data-role', btn.getAttribute('data-role'));
        });
      });
    }
    var loginForm = document.getElementById('loginForm');
    if(loginForm){
      loginForm.addEventListener('submit', function(e){
        e.preventDefault();
        if(!runRuleValidation(loginForm)) return;
        var role = loginForm.getAttribute('data-role') || 'user';
        var email = loginForm.querySelector('input[type="email"]');
        if(email && email.value.trim()) setProfileEmail(email.value.trim());
        location.href = role === 'admin' ? 'dashboard-admin.html' : 'dashboard-user.html';
      });
    }
    var signupForm = document.getElementById('signupForm');
    if(signupForm){
      signupForm.addEventListener('submit', function(e){
        e.preventDefault();
        if(!runRuleValidation(signupForm)) return;
        var dest = signupForm.getAttribute('data-success');
        if(dest){ redirectTo(dest); return; }
        location.href = 'dashboard-user.html';
      });
    }
  }

  /* ---------- shared validation rules ---------- */
  var GMAIL_RE = /^[A-Za-z0-9._%+-]+@gmail\.com$/i;
  var NAME_RE = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
  var STRONG_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\s]).{8,}$/;
  var MISMATCH_MSG = 'Passwords do not match. Please re-enter the same password.';
  var RULES = {
    name: {
      test: function(v){ return NAME_RE.test(v); },
      empty: 'Please enter your full name.',
      invalid: 'Only alphabets are allowed in the name field.'
    },
    gmail: {
      test: function(v){ return GMAIL_RE.test(v); },
      empty: 'Please enter your email address.',
      invalid: 'Only Gmail addresses are allowed — please use a @gmail.com address.'
    },
    pwd: {
      test: function(v){ return v.length > 0; },
      empty: 'Please enter your password.',
      invalid: 'Please enter your password.'
    },
    strong: {
      test: function(v){ return STRONG_RE.test(v); },
      empty: 'Please create a password.',
      invalid: 'Password is too weak — use at least 8 characters with an upper and lower case letter, a number and a symbol.'
    },
    terms: {
      test: function(v){ return v === true; },
      empty: 'Please accept the Terms & Privacy Policy to create an account.',
      invalid: 'Please accept the Terms & Privacy Policy to create an account.'
    }
  };

  /* 0-4 strength score: length plus each required character class, capped at 4 */
  function passwordScore(v){
    if(!v) return 0;
    var score = v.length >= 8 ? 1 : 0;
    if(/[a-z]/.test(v)) score++;
    if(/[A-Z]/.test(v)) score++;
    if(/[0-9]/.test(v)) score++;
    if(/[^A-Za-z0-9\s]/.test(v)) score++;
    return Math.min(score, 4);
  }

  /* runs every data-rule field in a form; focuses + reports the first failure */
  function runRuleValidation(form){
    var inputs = form.querySelectorAll('[data-rule]');
    for(var i = 0; i < inputs.length; i++){
      if(inputs[i]._skValidate && !inputs[i]._skValidate()){
        inputs[i].focus();
        return false;
      }
    }
    return true;
  }

  /* ---------- newsletter: gmail-only inline validation ---------- */
  function initNewsletterValidation(){
    document.querySelectorAll('.newsletter-form').forEach(function(form){
      var input = form.querySelector('input[type="email"]');
      var error = form.querySelector('.form-error');
      if(!input || !error) return;

      function fail(msg){
        error.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i><span>' + msg + '</span>';
        error.hidden = false;
        input.classList.add('invalid');
        input.setAttribute('aria-invalid','true');
      }
      function clear(){
        error.hidden = true;
        error.textContent = '';
        input.classList.remove('invalid');
        input.removeAttribute('aria-invalid');
      }
      function validate(){
        var val = input.value.trim();
        if(!val){
          fail(RULES.gmail.empty);
          return false;
        }
        if(!RULES.gmail.test(val)){
          fail(RULES.gmail.invalid);
          return false;
        }
        clear();
        return true;
      }

      form.addEventListener('submit', function(e){
        e.preventDefault();
        if(!validate()){ input.focus(); return; }
        clear();
        redirectTo('404.html');
      });
      input.addEventListener('input', function(){
        if(!error.hidden) validate();
      });
    });
  }

  /* ---------- live password strength meter ---------- */
  var STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  function initPasswordStrength(){
    document.querySelectorAll('[data-strength]').forEach(function(input){
      var wrap = input.closest('.field');
      if(!wrap) return;
      var bars = wrap.querySelectorAll('.pw-strength .track i');
      var label = wrap.querySelector('.pw-strength .label');
      if(!bars.length) return;

      function paint(){
        var score = passwordScore(input.value);
        for(var i = 0; i < bars.length; i++){
          bars[i].className = i < score ? 'on-' + score : '';
        }
        if(label) label.textContent = input.value ? STRENGTH_LABELS[score] : '';
      }
      input.addEventListener('input', paint);
      input.addEventListener('blur', paint);
      paint();
    });
  }

  /* ---------- data-rule driven field validation ---------- */
  function initFieldValidation(){
    var bound = [];
    document.querySelectorAll('[data-rule]').forEach(function(input){
      var rule = RULES[input.getAttribute('data-rule')];
      var field = input.closest('.field');
      var error = field ? field.querySelector('.form-error') : null;
      if(!rule || !error || !input.form) return;
      var matchId = input.getAttribute('data-match');

      function fail(msg){
        error.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i><span>' + msg + '</span>';
        error.hidden = false;
        input.classList.add('invalid');
        input.setAttribute('aria-invalid','true');
      }
      function clear(){
        error.hidden = true;
        error.textContent = '';
        input.classList.remove('invalid');
        input.removeAttribute('aria-invalid');
      }
      function currentValue(){
        return input.type === 'checkbox' ? input.checked : input.value.trim();
      }
      function validate(){
        var val = currentValue();
        if(!val){
          fail(rule.empty);
          return false;
        }
        if(!rule.test(val)){
          fail(rule.invalid);
          return false;
        }
        if(matchId){
          var other = input.form.querySelector('#' + matchId);
          if(other && other.value !== input.value){
            fail(MISMATCH_MSG);
            return false;
          }
        }
        clear();
        return true;
      }

      input.addEventListener('input', function(){
        if(!currentValue()){ clear(); return; }
        validate();
      });
      input.addEventListener('blur', function(){
        if(currentValue()) validate();
      });

      input._skValidate = validate;
      if(bound.indexOf(input.form) === -1) bound.push(input.form);
    });

    /* a form can opt into a post-submit destination without owning any
       data-rule fields; runRuleValidation is then a no-op and it still fires */
    document.querySelectorAll('form[data-success]').forEach(function(form){
      if(bound.indexOf(form) === -1) bound.push(form);
    });

    bound.forEach(function(form){
      form.addEventListener('submit', function(e){
        if(!runRuleValidation(form)){ e.preventDefault(); return; }
        if(!form.getAttribute('data-success')) return;
        e.preventDefault();
        redirectTo(form.getAttribute('data-success'));
      });
    });
  }

  /* ---------- dashboard sidebar toggle ---------- */
  function initDashboard(){
    var burger = document.getElementById('dashHamburger');
    var side = document.getElementById('dashSide');
    if(!side) return;
    if(!burger) return;
    function setOpen(open){
      side.classList.toggle('open', open);
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    burger.addEventListener('click', function(){
      setOpen(!side.classList.contains('open'));
    });
    side.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ setOpen(false); });
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    buildHeader();
    buildFooter();
    buildDashSide();
    buildDashHead();
    paintProfile();
    initLogout();
    initLoader();
    initHeader();
    initFooterAccordion();
    trackSocialLinks();
    initTopLinks();
    restoreScrollIfNeeded();
    initGoBack404();
    initReveal();
    initCounters();
    initSpotlight();
    initTabs();
    initPasswordToggle();
    initAuth();
    initNewsletterValidation();
    initFieldValidation();
    initPasswordStrength();
    initDashboard();
  });

})();
