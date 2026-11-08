'use strict';

(function () {
  // ---- login gate — token must be present ----
  var API = window.MindCursorAPI;
  if (!API || !API.getToken()) { location.href = 'signup.html'; return; }
  var session = { email: '', name: '' };
  API.me().then(function(d){
    session.email = (d.user||{}).email || '';
    session.name  = (d.user||{}).name  || '';
  }).catch(function(){});

var OPTS=['Definitely agree','Slightly agree','Slightly disagree','Definitely disagree'];
var BANK = {
  'teens': { label: '12\u201318', questions: [
    ['I find it hard to make new friends.', 1],
    ['I prefer to do things the same way every time.', 1],
    ['I notice small sounds or details that others miss.', 1],
    ['I find small talk difficult.', 1],
    ['I get so focused on my interests that I lose track of time.', 1],
    ['I find it easy to understand what others are feeling.', -1],
    ['I like meeting new people.', -1],
    ['I find unexpected changes in plans upsetting.', 1],
    ['I prefer to be alone rather than with a group.', 1],
    ['I find it hard to tell when someone is joking.', 1] ] },
  'young': { label: '18\u201330', questions: [
    ['I find social situations confusing or exhausting.', 1],
    ['I have strong routines that I like to follow.', 1],
    ['I am sensitive to lights, sounds, or textures.', 1],
    ['I find it hard to start conversations.', 1],
    ['I can spend hours on my special interests.', 1],
    ['I easily read other people\u2019s body language.', -1],
    ['I enjoy parties and gatherings.', -1],
    ['Unexpected changes throw me off.', 1],
    ['I prefer written messages over phone calls.', 1],
    ['I take things literally more often than others do.', 1] ] },
  'adults': { label: '30+', questions: [
    ['Social gatherings leave me feeling drained.', 1],
    ['I rely on routines to get through my day.', 1],
    ['Certain sounds, lights, or textures bother me a lot.', 1],
    ['I find workplace small talk difficult.', 1],
    ['I have deep, focused interests.', 1],
    ['I find it easy to tell what someone means, not just what they say.', -1],
    ['I make friends easily.', -1],
    ['I get upset when my plans change suddenly.', 1],
    ['I need alone time to recharge after being social.', 1],
    ['People tell me I miss social cues.', 1] ] }
};
var GROUPS=[
  {key:'teens',n:'01',big:'12\u201318',sub:'Teens'},
  {key:'young',n:'02',big:'18\u201330',sub:'Young adults'},
  {key:'adults',n:'03',big:'30+',sub:'Adults'}
];

/* ── Result data by band ─────────────────────────────── */
var RESULT_DATA = {
  'FEW TRAITS': {
    color: '#22c55e',
    headline: 'You\u2019re doing great.',
    summary: 'Your responses show very few traits commonly associated with autism spectrum. Every mind is beautifully unique — you appear to be navigating the world in a neurotypical way.',
    suggestions: [
      'Continue learning about neurodiversity to support others around you.',
      'Share awareness — knowing the signs helps friends and family.',
      'No further action is needed based on this screening.',
      '\u2665 Keep being kind to every mind you meet.'
    ],
    chartLabel: 'Low indicator',
    icon: '\u2713'
  },
  'SOME TRAITS': {
    color: '#f59e0b',
    headline: 'Worth a closer look.',
    summary: 'Your responses show a moderate number of traits associated with autism spectrum. This doesn\u2019t mean you have autism — but it\u2019s worth exploring further with a professional.',
    suggestions: [
      'Consider booking an appointment with a GP or psychologist to discuss your responses.',
      'Keep a personal journal of situations where you notice these traits.',
      'Look into autism-friendly resources and communities for support.',
      'Remember: a screening is not a diagnosis — only a qualified professional can assess you.',
      'Talk to someone you trust about how you\u2019re feeling.'
    ],
    chartLabel: 'Moderate indicator',
    icon: '\u26A0'
  },
  'MANY TRAITS': {
    color: '#ef4444',
    headline: 'Professional assessment recommended.',
    summary: 'Your responses indicate many traits commonly associated with autism spectrum. A formal evaluation by a qualified professional is strongly recommended for proper understanding and support.',
    suggestions: [
      '\ud83d\udc68\u200d\u2695\ufe0f See your GP or family doctor as a first step — they can refer you to a specialist.',
      '\ud83e\udde0 Request a referral to a psychiatrist, psychologist, or autism diagnostic specialist.',
      '\ud83d\udcdd Bring a copy of your screening results to your appointment.',
      '\ud83e\udd1d Reach out to autism support organisations in your area for guidance.',
      '\ud83d\udcda Educate yourself: autism is a spectrum and looks different for everyone.',
      '\ud83d\udcac Consider speaking with a counsellor or therapist who understands neurodiversity.',
      '\u26a0\ufe0f Do not self-diagnose — this tool is preliminary only.'
    ],
    chartLabel: 'High indicator',
    icon: '!'
  }
};

var stage = document.getElementById('stage');
var state = { group: null, qi: 0, answers: [] };
function el(h){ var d=document.createElement('div'); d.innerHTML=h; return d.firstElementChild; }

(function(){
  var t='AUTISM SCREENING <span style="color:#ff2e1f">\u25a0</span> 10 QUESTIONS <span style="color:#ff2e1f">\u25a0</span> AI-ASSISTED <span style="color:#ff2e1f">\u25a0</span> PRELIMINARY ONLY <span style="color:#ff2e1f">\u25a0</span> NOT A DIAGNOSIS <span style="color:#ff2e1f">\u25a0</span> ';
  var _tk=document.getElementById('tk'); if(_tk) _tk.innerHTML=t+t;
})();

function setP(p){ document.getElementById('cp').textContent=String(Math.round(p*100)).padStart(3,'0')+'%'; }

function scramble(elm,text,dur){
  dur=dur||650;
  var glyphs='\u2588\u2593\u2592\u2591<>/\\|*#+-=',len=text.length,t0=performance.now();
  function fr(t){
    var p=Math.min(1,(t-t0)/dur),rev=Math.floor(p*len),out='';
    for(var i=0;i<len;i++){var ch=text[i];out+=(ch===' '||i<rev)?ch:glyphs[(Math.random()*glyphs.length)|0];}
    elm.textContent=out;
    if(p<1)requestAnimationFrame(fr); else elm.textContent=text;
  }
  requestAnimationFrame(fr);
  setTimeout(function(){elm.textContent=text;},dur+500);
}

function scatterText(elm,text,delay){
  delay=delay||0;
  elm.innerHTML='';
  var idx=0;
  text.split(' ').forEach(function(w){
    var ws=document.createElement('span');
    ws.style.display='inline-block'; ws.style.whiteSpace='nowrap';
    Array.prototype.forEach.call(w,function(ch){
      var s=document.createElement('span');
      s.textContent=ch; s.style.display='inline-block';
      var dx=(Math.random()-0.5)*520,dy=(Math.random()-0.5)*380,r=(Math.random()-0.5)*170;
      s.style.transform='translate('+dx+'px,'+dy+'px) rotate('+r+'deg)';
      s.style.opacity='0'; ws.appendChild(s);
      var my=idx++;
      setTimeout(function(){
        s.style.transition='transform .65s cubic-bezier(.22,1,.36,1),opacity .45s ease';
        s.style.transform='translate(0,0) rotate(0deg)'; s.style.opacity='1';
      },delay+90+my*20);
    });
    elm.appendChild(ws); elm.appendChild(document.createTextNode(' '));
  });
}

/* Fixed font-size for questions — same size for ALL 10 */
var Q_FONT_SIZE = null;
function setQuestionFontSize(elm) {
  if (!elm) return;
  /* First call: compute the size that fits the LONGEST question in the bank */
  if (!Q_FONT_SIZE) {
    var qs = BANK[state.group].questions;
    var longest = qs.reduce(function(a,b){ return b[0].length > a[0].length ? b : a; })[0];
    elm.style.whiteSpace = 'nowrap';
    elm.style.maxWidth = '96%';
    var max = elm.parentElement.clientWidth * 0.96;
    var fs = 56, guard = 0;
    elm.style.fontSize = fs + 'px';
    elm.textContent = longest.toUpperCase();
    while (elm.scrollWidth > max && fs > 18 && guard < 40) {
      fs -= 2; elm.style.fontSize = fs + 'px'; guard++;
    }
    Q_FONT_SIZE = fs;
  }
  elm.style.fontSize = Q_FONT_SIZE + 'px';
  elm.style.whiteSpace = 'normal';
  elm.style.lineHeight = '1.15';
}

function stackAndFan(cards,grid){
  var gr=grid.getBoundingClientRect();
  var gcx=gr.left+gr.width/2,gcy=gr.top+gr.height/2;
  var data=cards.map(function(c){
    var r=c.getBoundingClientRect();
    return {c:c,dx:(r.left+r.width/2)-gcx,dy:(r.top+r.height/2)-gcy,
      rot:(Math.random()*16-8),jx:(Math.random()*30-15),jy:(Math.random()*30-15)};
  });
  data.forEach(function(d){
    d.c.style.transition='none';
    d.c.style.transform='translate('+(-d.dx+d.jx)+'px,'+(-d.dy+d.jy)+'px) rotate('+d.rot+'deg) scale(.96)';
    d.c.style.opacity='1';
  });
  void grid.offsetWidth;
  data.forEach(function(d,i){
    setTimeout(function(){
      d.c.style.transition='transform .8s cubic-bezier(.22,1,.36,1)';
      d.c.style.transform='translate(0,0) rotate(0deg) scale(1)';
    },60+i*110);
    setTimeout(function(){
      d.c.style.transition=''; d.c.style.transform=''; d.c.style.opacity='';
    },1150+i*110);
  });
}

function scatterOut(root,meas,done){
  var gr=meas.getBoundingClientRect();
  var gcx=gr.left+gr.width/2,gcy=gr.top+gr.height/2;
  meas.querySelectorAll('.wp-card').forEach(function(c){
    var r=c.getBoundingClientRect();
    var vx=(r.left+r.width/2)-gcx,vy=(r.top+r.height/2)-gcy;
    var m=330/Math.max(1,Math.hypot(vx,vy));
    c.style.transition='transform .5s cubic-bezier(.55,.06,.75,0),opacity .4s ease';
    c.style.transform='translate('+(vx*m)+'px,'+(vy*m-70)+'px) rotate('+((Math.random()*44)-22)+'deg)';
    c.style.opacity='0';
  });
  root.querySelectorAll('#qh span span').forEach(function(s){
    var dx=(Math.random()-0.5)*700,dy=(Math.random()-0.5)*460,r=(Math.random()-0.5)*190;
    s.style.transition='transform .45s cubic-bezier(.55,.06,.75,0),opacity .35s ease';
    s.style.transform='translate('+dx+'px,'+dy+'px) rotate('+r+'deg)';
    s.style.opacity='0';
  });
  setTimeout(done,580);
}

function sweep(mid){
  var s=document.getElementById('sweep');
  s.classList.remove('run'); void s.offsetWidth; s.classList.add('run');
  setTimeout(mid,260);
}

function show(html,cls){
  stage.innerHTML='';
  var s=el('<div class="screen'+(cls?' '+cls:'')+'">'+html+'</div>');
  stage.appendChild(s); return s;
}

/* ── HERO ──────────────────────────────────────────────── */
function showHero(){
  setP(0);
  var s=show(
    '<div class="hero-fg">'+
    '<div class="tlabel"><span class="h">#</span> MINDCURSOR — <b>AUTISM SCREENING</b></div>'+
    '<div class="kick"><span class="sq"></span><div class="kt">10 QUESTIONS.<br>READY TO USE.</div></div>'+
    '<h1 class="mega"><span class="r">SCREEN</span><span class="w">.</span><span class="r">!</span><span class="w">#</span><span class="w">ING</span></h1>'+
    '</div>'+
    '<div class="term"><div class="tgrid"><div class="tmain">'+
    '<div class="tr"><svg class="globe" viewBox="0 0 24 24" fill="none" stroke="#f5f5f5" stroke-width="1.4"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18"/></svg><span>SYSTEM UPTIME: <span id="up">3061D 06H 22M 15S</span></span></div>'+
    '<div class="tr"><span>STATUS: ONLINE <span class="rd">\u25cf</span> &nbsp;BUILD: STABLE</span></div>'+
    '<div class="tr"><span>AVAILABLE WORLDWIDE</span></div>'+
    '</div><div class="vert">MINDCURSOR</div></div></div>'+
    '<div class="hashtags"><span>#SCREENING</span><span>#AUTISM</span><span>#AWARENESS</span></div>'+
    '<div class="hero-cta"><button class="cbtn" id="h-start">START SCREENING \u2192</button></div>',
    'hero');
  s.insertAdjacentHTML('afterbegin','<div class="herobg"></div><div class="hero-shade"></div>');
  var up=s.querySelector('#up'),sec=15;
  setInterval(function(){sec++;if(sec>59){sec=0;}
    up.textContent='3061D 06H 22M '+String(sec).padStart(2,'0')+'S';},1000);
  s.querySelector('#h-start').addEventListener('click',function(){
    state.qi=0; state.answers=[]; sweep(showAge);
  });
}

/* ── AGE ───────────────────────────────────────────────── */
function showAge(){
  setP(0);
  var cards=GROUPS.map(function(g){
    return '<button class="card" data-g="'+g.key+'"><div class="cnum"><span class="sq"></span>'+g.n+'</div>'+
      '<div class="cbig">'+g.big+'</div><div class="csub">'+g.sub+'</div>'+
      '<div class="cgo">SELECT <span class="arr">\u2192</span></div></button>';
  }).join('');
  var s=show(
    '<div class="tlabel"><span class="h">#</span> STEP 01 — <b>CHOOSE AGE GROUP</b></div>'+
    '<h1 class="disp" id="ah">SELECT YOUR RANGE.</h1>'+
    '<div class="cards">'+cards+'</div>','center');
  scramble(s.querySelector('#ah'),'SELECT YOUR RANGE.',700);
  s.querySelectorAll('.card').forEach(function(b){
    b.addEventListener('click',function(){
      state.group=b.getAttribute('data-g');
      state.qi=0; state.answers=[];
      Q_FONT_SIZE=null; /* reset so size is recalculated for this group */
      showQuestion(0);
    });
  });
}

/* ── QUESTION ──────────────────────────────────────────── */
var OPTIMG=['assets/images/screening/opt-a.webp','assets/images/screening/opt-b.webp',
            'assets/images/screening/opt-c.webp','assets/images/screening/opt-d.webp'];
function wpCard(k){
  return '<button class="wp-card" data-k="'+k+'">'+
    '<div class="wp-bar"><i></i><i></i><i></i><span>OPTION — '+'ABCD'[k]+'</span></div>'+
    '<div class="wp-img"><img src="'+OPTIMG[k]+'" alt=""/></div>'+
    '<div class="wp-label"><span class="k">'+'ABCD'[k]+'</span><span class="t">'+OPTS[k]+'</span></div></button>';
}
function showQuestion(i){
  var qs=BANK[state.group].questions, total=qs.length;
  setP(i/total);
  var s=show(
    '<div class="qwrap" id="qw">'+
    '<div class="tlabel"><span class="h">#</span> Q'+String(i+1).padStart(2,'0')+' <b>/ '+total+'</b></div>'+
    '<div class="wp-top">'+wpCard(0)+wpCard(1)+'</div>'+
    '<h2 class="qbig" id="qh"></h2>'+
    '<div class="wp-bot">'+wpCard(2)+wpCard(3)+'</div>'+
    (i>0?'<button class="qback" id="qb">\u2190 BACK</button>':'')+
    '<div class="pbar"><i id="pf"></i></div>'+
    '<div class="pmeta"><span>PROGRESS</span><span>'+Math.round(i/total*100)+'%</span></div>'+
    '</div>','center light');
  var qw=s.querySelector('#qw'), qh=s.querySelector('#qh');

  /* Place full text first, then animate scatter */
  qh.textContent = qs[i][0].toUpperCase();
  setQuestionFontSize(qh);
  scatterText(qh, qs[i][0].toUpperCase(), 420);
  /* Re-apply fixed size after scatter rebuilds spans */
  setTimeout(function(){
    qh.style.fontSize = Q_FONT_SIZE + 'px';
    qh.style.whiteSpace = 'normal';
    qh.style.lineHeight = '1.15';
  }, 450 + qs[i][0].length * 20 + 100);

  stackAndFan(Array.prototype.slice.call(qw.querySelectorAll('.wp-card')),qw);
  s.querySelector('#pf').style.width=(i/total*100)+'%';

  qw.querySelectorAll('.wp-card').forEach(function(b){
    b.addEventListener('click',function(){
      if(b.classList.contains('sel')) return;
      b.classList.add('sel');
      state.answers[i]=parseInt(b.getAttribute('data-k'),10);
      setTimeout(function(){
        state.qi++;
        if(state.qi<total) scatterOut(qw,qw,function(){showQuestion(state.qi);});
        else sweep(showAnalyzing);
      },320);
    });
  });
  var bk=s.querySelector('#qb');
  if(bk) bk.addEventListener('click',function(){
    scatterOut(qw,qw,function(){state.qi--;showQuestion(state.qi);});
  });
}

/* ── ANALYZING ─────────────────────────────────────────── */
function showAnalyzing(){
  setP(1);
  var s=show(
    '<div class="tlabel"><span class="h">#</span> MODEL — <b>FEEDFORWARD</b></div>'+
    '<h2 class="disp" id="azh">ANALYZING.</h2>'+
    '<div class="azbox"><div class="ahead"><span>ML-MODEL // TRAIT-SCAN</span><span>LIVE</span></div>'+
    '<div class="alog" id="alog"></div>'+
    '<div class="azpct"><span id="apct">000</span><small>%</small></div></div>','center');
  scramble(s.querySelector('#azh'),'ANALYZING.',500);
  var log=s.querySelector('#alog'), apct=s.querySelector('#apct'), li=0;
  var lines=[
    '> feeding 10 answers to model <span class="w">...... OK</span>',
    '> extracting trait vectors <span class="w">...... OK</span>',
    '> computing score <span class="r">......</span>'
  ];
  (function nl(){
    if(li<lines.length){
      var d=document.createElement('div'); d.innerHTML=lines[li];
      log.appendChild(d); li++; setTimeout(nl,420);
    }
  })();
  var t0=null;
  function tick(t){
    if(!t0) t0=t;
    var p=Math.min(1,(t-t0)/2100),e=1-Math.pow(1-p,3);
    apct.textContent=String(Math.round(e*100)).padStart(3,'0');
    if(p<1) requestAnimationFrame(tick);
    else setTimeout(function(){sweep(showResult);},400);
  }
  setTimeout(function(){requestAnimationFrame(tick);},300);
  setTimeout(function(){apct.textContent='100';},2800);
}

/* ── SCORE ─────────────────────────────────────────────── */
function calcScore(){
  var qs=BANK[state.group].questions, s=0;
  for(var i=0;i<qs.length;i++){
    var agree=state.answers[i]<=1;
    if((qs[i][1]===1&&agree)||(qs[i][1]===-1&&!agree)) s++;
  }
  return s;
}

/* ── PIE CHART ─────────────────────────────────────────── */
function drawPieChart(canvasId, score, total, color){
  setTimeout(function(){
    var canvas = document.getElementById(canvasId);
    if(!canvas) return;
    var ctx = canvas.getContext('2d');
    var cx = canvas.width/2, cy = canvas.height/2, r = cx - 10;
    var pct = score / total;
    var startAngle = -Math.PI/2;

    /* bg circle */
    ctx.beginPath();
    ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,0.07)';
    ctx.fill();

    /* track */
    ctx.beginPath();
    ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,0.12)';
    ctx.lineWidth=14;
    ctx.stroke();

    /* animated arc */
    var current=0;
    var target=pct*Math.PI*2;
    function animate(){
      current+=target/60;
      if(current>target) current=target;
      ctx.clearRect(0,0,canvas.width,canvas.height);

      /* bg */
      ctx.beginPath();
      ctx.arc(cx,cy,r,0,Math.PI*2);
      ctx.fillStyle='rgba(255,255,255,0.04)';
      ctx.fill();

      /* track */
      ctx.beginPath();
      ctx.arc(cx,cy,r,0,Math.PI*2);
      ctx.strokeStyle='rgba(255,255,255,0.1)';
      ctx.lineWidth=14;
      ctx.stroke();

      /* value arc */
      ctx.beginPath();
      ctx.arc(cx,cy,r,startAngle,startAngle+current);
      ctx.strokeStyle=color;
      ctx.lineWidth=14;
      ctx.lineCap='round';
      ctx.stroke();

      /* center text */
      ctx.fillStyle='#ffffff';
      ctx.font='bold '+(cx*0.48)+'px Anton,sans-serif';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.fillText(score+'/'+total, cx, cy);

      if(current<target) requestAnimationFrame(animate);
    }
    animate();
  }, 400);
}

/* ── RESULT ────────────────────────────────────────────── */
function showResult(){
  var total = BANK[state.group].questions.length, sc = calcScore();
  var band = sc<=3 ? 'FEW TRAITS' : sc<=6 ? 'SOME TRAITS' : 'MANY TRAITS';
  var rd   = RESULT_DATA[band];

  /* Save to DB + send email */
  try { API.postResult(BANK[state.group].label, sc).catch(function(){}); } catch(e){}
  try {
    fetch('/api/results/notify', {
      method:'POST',
      headers:{'Content-Type':'application/json','X-Token': API.getToken()},
      body: JSON.stringify({
        group: BANK[state.group].label,
        score: sc,
        total: total,
        band:  band,
        suggestions: rd.suggestions,
        name: session.name,
        email: session.email
      })
    }).catch(function(){});
  } catch(e){}

  var suggestionsHtml = rd.suggestions.map(function(s){
    return '<li class="res-suggest-item">'+s+'</li>';
  }).join('');

  setP(1);
  var s=show(
    /* ── top label ── */
    '<div class="tlabel"><span class="h">#</span> RESULT \u2014 <b>COMPLETE</b></div>'+

    /* ── main result grid ── */
    '<div class="res-grid">'+

      /* LEFT: big band + summary */
      '<div class="res-left">'+
        '<div class="res-band-wrap">'+
          '<span class="res-icon" style="background:'+rd.color+'">'+rd.icon+'</span>'+
          '<div>'+
            '<div class="res-band" style="color:'+rd.color+'">'+band+'</div>'+
            '<div class="res-headline">'+rd.headline+'</div>'+
          '</div>'+
        '</div>'+

        '<div class="res-score-row">'+
          '<span class="res-score-num" style="color:'+rd.color+'" id="rn">00</span>'+
          '<span class="res-score-denom">/'+total+' traits indicated</span>'+
        '</div>'+

        '<p class="res-summary">'+rd.summary+'</p>'+

        '<div class="res-suggestions">'+
          '<div class="res-suggest-title">'+
            (band==='FEW TRAITS' ? '\u2665 All good' : '\u26a0 Suggestions for you')+
          '</div>'+
          '<ul class="res-suggest-list">'+suggestionsHtml+'</ul>'+
        '</div>'+

        '<p class="res-disclaimer">THIS IS A PRELIMINARY SCREENING, NOT A MEDICAL DIAGNOSIS. ONLY A QUALIFIED PROFESSIONAL CAN DIAGNOSE AUTISM SPECTRUM DISORDER.</p>'+
      '</div>'+

      /* RIGHT: pie chart + nav */
      '<div class="res-right">'+
        '<div class="res-chart-wrap">'+
          '<div class="res-chart-label">'+rd.chartLabel+'</div>'+
          '<canvas id="pie-chart" width="200" height="200"></canvas>'+
          '<div class="res-chart-sublabel">Score breakdown</div>'+
        '</div>'+

        '<div class="res-image-wrap">'+
          '<img src="assets/images/screening/result-portrait.webp" alt="Result" class="res-portrait"/>'+
        '</div>'+

        '<div class="res-actions">'+
          '<button class="cbtn" id="r-re">RETAKE \u25a0</button>'+
          '<button class="cbtn ghost" id="r-hm">BACK HOME</button>'+
        '</div>'+

        '<div class="res-email-note" id="res-email-note">'+
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>'+
          'A result summary has been sent to your email.'+
        '</div>'+
      '</div>'+

    '</div>'+

    /* ── giant word ── */
    '<div class="rmega">RESULT</div>',
    'darkres res-screen');

  /* animate score counter */
  var rnEl=s.querySelector('#rn'), t0=null;
  function tick(t){
    if(!t0) t0=t;
    var p=Math.min(1,(t-t0)/1100),e=1-Math.pow(1-p,3);
    rnEl.textContent=String(Math.round(e*sc)).padStart(2,'0');
    if(p<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  setTimeout(function(){rnEl.textContent=String(sc).padStart(2,'0');},1600);

  /* draw pie */
  drawPieChart('pie-chart', sc, total, rd.color);

  s.querySelector('#r-re').addEventListener('click',function(){location.reload();});
  s.querySelector('#r-hm').addEventListener('click',function(){location.href='index.html';});
}

showHero();
})();
