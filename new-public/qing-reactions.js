(() => {
  const mascot = document.querySelector('#mascot');
  if (!mascot) return;

  const moods = ['greeting', 'curious', 'listening', 'thinking', 'typing', 'wave', 'happy', 'celebrate', 'shy', 'surprised', 'success', 'gesture-wave', 'gesture-listen', 'gesture-think', 'gesture-clap', 'gesture-stretch', 'blink-soft', 'brow-raise', 'giggle', 'look-around'];
  const pick = list => list[Math.floor(Math.random() * list.length)];
  let timer;
  let activeMood = '';
  let queuedMood = null;
  const show = (name, ms = 900) => {
    if (activeMood) {
      queuedMood = { name, ms };
      return;
    }
    activeMood = name;
    mascot.classList.remove(...moods);
    mascot.classList.add(name);
    timer = setTimeout(() => {
      mascot.classList.remove(name);
      mascot.classList.add('settling');
      activeMood = '';
      setTimeout(() => {
        mascot.classList.remove('settling');
        if (!queuedMood) return;
        const next = queuedMood;
        queuedMood = null;
        show(next.name, next.ms);
      }, 320);
    }, ms);
  };

  // 所有页面动作都经过同一条队列，避免表情、手势在同一帧互相覆盖。
  window.addEventListener('xiaojing-react', event => {
    const { mood, duration } = event.detail || {};
    if (mood) show(mood, duration);
  });

  document.addEventListener('input', event => {
    if (event.target.matches('.field')) show('typing', 720);
  });
  document.addEventListener('focusin', event => {
    if (event.target.matches('.field')) show('listening', 900);
  });
  document.addEventListener('click', event => {
    if (event.target.closest('.choice')) show(['happy', 'celebrate', 'gesture-clap'][Math.floor(Math.random() * 3)], 1100);
    if (event.target.closest('#next')) show(pick(['wave', 'gesture-wave', 'gesture-listen', 'gesture-think', 'gesture-stretch', 'happy']), 1100);
    if (event.target.closest('#back')) show('shy', 760);
  });

  let pointerQueued = false;
  document.addEventListener('pointermove', event => {
    if (pointerQueued || event.pointerType === 'touch') return;
    pointerQueued = true;
    requestAnimationFrame(() => {
      pointerQueued = false;
      const x = Math.max(-2.7, Math.min(2.7, (event.clientX / innerWidth - .5) * 5.4));
      const y = Math.max(-1.8, Math.min(1.8, (event.clientY / innerHeight - .32) * 3.2));
      mascot.style.setProperty('--look-x', `${x}px`);
      mascot.style.setProperty('--look-y', `${y}px`);
    });
  });

  const ambient = () => {
    if (!document.hidden && !activeMood && !mascot.classList.contains('success')) {
      const moments = ['curious', 'surprised', 'gesture-wave', 'gesture-listen', 'gesture-think', 'gesture-stretch', 'giggle', 'look-around'];
      const mood = moments[Math.floor(Math.random() * moments.length)];
      show(mood, mood.startsWith('gesture-') ? 1450 : 820);
    }
    setTimeout(ambient, 6500 + Math.random() * 5000);
  };
  setTimeout(() => show('greeting', 1450), 500);
  setTimeout(ambient, 5200);
  const microExpression = () => {
    if (!document.hidden && !activeMood && !mascot.classList.contains('success')) {
      show(Math.random() > .58 ? 'blink-soft' : 'brow-raise', 420);
    }
    setTimeout(microExpression, 2600 + Math.random() * 2600);
  };
  setTimeout(microExpression, 2300);
})();

const expressionStyle = document.createElement('style');
expressionStyle.textContent = `
  .tuft{display:block!important;top:-10px!important;left:29px!important;width:14px!important;height:14px!important;border-radius:50%!important;background:#ffd35f!important;transform:rotate(0)!important;box-shadow:0 -7px 0 -1px #ffc1d3,6px -3px 0 -1px #ffc1d3,6px 4px 0 -1px #ffc1d3,0 7px 0 -1px #ffc1d3,-6px 4px 0 -1px #ffc1d3,-6px -3px 0 -1px #ffc1d3,0 2px 2px #b36d8d55!important}.tuft:after{content:''!important;position:absolute!important;inset:4px!important;border-radius:50%!important;background:#fff4a9!important;box-shadow:inset 0 1px 1px #fff!important}
  .avatar:after{display:none!important}.tuft{top:-5px!important;left:9px!important;transform:rotate(-14deg)!important}
  .avatar-wrap{--look-x:0px;--look-y:0px;animation:roamTop 8.6s cubic-bezier(.45,0,.4,1) infinite!important}
  /* 只让内部头像做表情动作；外层持续沿同一轨迹移动，切页时不会重置到关键帧起点。 */
  .avatar-wrap.celebrate{animation:roamTop 8.6s cubic-bezier(.45,0,.4,1) infinite!important}
  .avatar-wrap .arm-left{animation:jingHandIdleLeft 4.8s ease-in-out infinite!important}
  .avatar-wrap .arm-right{animation:jingHandIdleRight 5.6s ease-in-out infinite!important}
  .avatar-wrap .avatar,.avatar-wrap .face,.avatar-wrap .eye,.avatar-wrap .brow,.avatar-wrap .mouth,.avatar-wrap .mascot-arm{will-change:transform;transition:transform .5s cubic-bezier(.22,.78,.28,1),opacity .36s ease,filter .36s ease,width .36s ease,height .36s ease,top .36s ease,bottom .36s ease!important}
  .avatar-wrap.settling .avatar,.avatar-wrap.settling .face,.avatar-wrap.settling .eye,.avatar-wrap.settling .brow,.avatar-wrap.settling .mouth,.avatar-wrap.settling .mascot-arm{transition-duration:.46s!important;transition-timing-function:cubic-bezier(.16,.9,.25,1)!important}
  .avatar-wrap .eye{transform:translate(var(--look-x),var(--look-y))}
  .avatar-wrap.curious .avatar{animation:jingCurious .85s cubic-bezier(.22,.8,.3,1) 2!important}
  .avatar-wrap.curious .face{transform:translate(2px,-1px) rotate(3deg)!important}
  .avatar-wrap.curious .brow-left{transform:translateY(-3px) rotate(-22deg)!important}.avatar-wrap.curious .brow-right{transform:translateY(-4px) rotate(22deg)!important}
  .avatar-wrap.curious .mouth{width:11px!important;height:6px!important;bottom:8px!important}
  .avatar-wrap.listening .avatar{animation:jingListen .55s ease-in-out infinite alternate!important}
  .avatar-wrap.listening .face{transform:translateY(2px) rotate(-2deg)!important}.avatar-wrap.listening .eye{height:7px!important;top:18px!important}
  .avatar-wrap.listening .brow{transform:translateY(-2px) rotate(0)!important}.avatar-wrap.listening .mouth{width:17px!important;height:8px!important}
  .avatar-wrap.shy .avatar{animation:jingShy .8s cubic-bezier(.32,.8,.32,1) 2!important}.avatar-wrap.shy .face{transform:translate(-4px,3px) rotate(-5deg)!important}
  .avatar-wrap.shy .eye{height:5px!important;top:20px!important}.avatar-wrap.shy .brow{opacity:.4!important}.avatar-wrap.shy .mouth{width:9px!important;height:5px!important}
  .avatar-wrap.shy .face:before,.avatar-wrap.shy .face:after{transform:scale(1.55);opacity:1}
  .avatar-wrap.happy .avatar{animation:jingHappy .38s cubic-bezier(.2,.8,.3,1) 3!important}.avatar-wrap.happy .eye{height:4px!important;top:21px!important}.avatar-wrap.happy .brow{opacity:0!important}
  .avatar-wrap.happy .mouth{width:23px!important;height:14px!important;border:0!important;background:#ef91af!important;border-radius:0 0 15px 15px!important}
  .avatar-wrap.greeting .avatar{animation:jingGreeting .52s cubic-bezier(.17,.8,.25,1) 3!important}.avatar-wrap.greeting .arm-right{animation:jingHandHello .18s ease-in-out 8!important}
  .avatar-wrap.greeting .eye-left{height:4px!important;top:21px!important}.avatar-wrap.greeting .mouth{width:20px!important}
  .avatar-wrap.surprised .avatar{animation:jingSurprise .48s cubic-bezier(.18,.82,.28,1) 2!important}
  .avatar-wrap.success .avatar{animation:jingSuccess .42s cubic-bezier(.2,.8,.3,1) 4!important}.avatar-wrap.success .mascot-arm{animation:jingArmsUp .25s ease-in-out infinite alternate!important}
  .avatar-wrap.gesture-wave .avatar{animation:jingWaveBody .55s ease-in-out 3!important}.avatar-wrap.gesture-wave .arm-left{animation:jingWaveLeft .32s ease-in-out 5!important}.avatar-wrap.gesture-wave .arm-right{animation:jingWaveRight .22s ease-in-out 8!important}
  .avatar-wrap.gesture-listen .avatar{animation:jingListenBody .72s ease-in-out 2!important}.avatar-wrap.gesture-listen .arm-left{animation:jingListenLeft .7s cubic-bezier(.25,.8,.3,1) 2!important}.avatar-wrap.gesture-listen .arm-right{animation:jingListenRight .7s cubic-bezier(.25,.8,.3,1) 2!important}.avatar-wrap.gesture-listen .eye{height:7px!important;top:18px!important}
  .avatar-wrap.gesture-think .avatar{animation:jingThinkBody 1.15s ease-in-out 2!important}.avatar-wrap.gesture-think .arm-right{animation:jingThinkHand .6s cubic-bezier(.25,.8,.3,1) 3!important}.avatar-wrap.gesture-think .brow-left{transform:translateY(1px) rotate(18deg)!important}.avatar-wrap.gesture-think .brow-right{transform:translateY(-2px) rotate(-20deg)!important}
  .avatar-wrap.gesture-clap .avatar{animation:jingClapBody .35s ease-in-out 4!important}.avatar-wrap.gesture-clap .mascot-arm{animation:jingClap .18s ease-in-out 8!important}
  .avatar-wrap.gesture-stretch .avatar{animation:jingStretchBody .9s cubic-bezier(.22,.8,.3,1) 2!important}.avatar-wrap.gesture-stretch .arm-left{animation:jingStretchLeft .75s cubic-bezier(.22,.8,.3,1) 2!important}.avatar-wrap.gesture-stretch .arm-right{animation:jingStretchRight .75s cubic-bezier(.22,.8,.3,1) 2!important}.avatar-wrap.gesture-stretch .eye{height:4px!important;top:21px!important}
  .avatar-wrap.blink-soft .eye{animation:jingBlinkSoft .34s cubic-bezier(.3,0,.2,1) 1!important}.avatar-wrap.blink-soft .brow{animation:jingBlinkBrows .34s ease 1!important}
  .avatar-wrap.brow-raise .avatar{animation:jingBrowBody .5s ease-in-out 1!important}.avatar-wrap.brow-raise .brow-left{animation:jingBrowLeft .55s cubic-bezier(.2,.8,.25,1) 1!important}.avatar-wrap.brow-raise .brow-right{animation:jingBrowRight .55s cubic-bezier(.2,.8,.25,1) 1!important}.avatar-wrap.brow-raise .mouth{width:16px!important;height:8px!important}
  .avatar-wrap.giggle .avatar{animation:jingGiggle .34s ease-in-out 4!important}.avatar-wrap.giggle .eye{height:4px!important;top:21px!important}.avatar-wrap.giggle .brow{opacity:.2!important}.avatar-wrap.giggle .mouth{width:20px!important;height:11px!important;border:0!important;background:#ef9bb5!important;border-radius:0 0 13px 13px!important}
  .avatar-wrap.look-around .avatar{animation:jingLookBody 1.2s cubic-bezier(.35,0,.25,1) 1!important}.avatar-wrap.look-around .eye-left{animation:jingLookLeft 1.2s cubic-bezier(.35,0,.25,1) 1!important}.avatar-wrap.look-around .eye-right{animation:jingLookRight 1.2s cubic-bezier(.35,0,.25,1) 1!important}.avatar-wrap.look-around .brow{animation:jingLookBrow 1.2s ease-in-out 1!important}
  @keyframes jingCurious{50%{transform:translate(10px,-10px) rotate(14deg) scale(1.06)}}
  @keyframes jingHandIdleLeft{0%,100%{transform:translate(-1px,1px) rotate(-8deg)}48%{transform:translate(-3px,-2px) rotate(-13deg)}70%{transform:translate(1px,0) rotate(-4deg)}}
  @keyframes jingHandIdleRight{0%,100%{transform:translate(1px,1px) rotate(8deg)}38%{transform:translate(3px,-2px) rotate(13deg)}72%{transform:translate(0,-1px) rotate(5deg)}}
  @keyframes jingListen{to{transform:translateY(-8px) rotate(-8deg)}}
  @keyframes jingShy{50%{transform:translate(-13px,7px) rotate(-12deg) scale(.96)}}
  @keyframes jingHappy{50%{transform:translateY(-28px) rotate(15deg) scale(1.14)}}
  @keyframes jingGreeting{50%{transform:translateY(-18px) rotate(-12deg) scale(1.1)}}
  @keyframes jingHandHello{0%,100%{transform:translate(1px,1px) rotate(8deg) scale(1)}50%{transform:translate(10px,-32px) rotate(68deg) scale(1.14)}}
  @keyframes jingSurprise{48%{transform:translateY(-17px) rotate(8deg) scale(1.13)}}
  @keyframes jingSuccess{50%{transform:translateY(-36px) rotate(360deg) scale(1.18)}}
  @keyframes jingArmsUp{to{transform:translateY(-34px) scale(1.24)}}
  @keyframes jingWaveBody{50%{transform:translateY(-10px) rotate(-8deg) scale(1.06)}}
  @keyframes jingWaveLeft{0%,100%{transform:translate(-1px,1px) rotate(-8deg) scale(1)}50%{transform:translate(-10px,-14px) rotate(-35deg) scale(1)}}
  @keyframes jingWaveRight{0%,100%{transform:translate(1px,1px) rotate(8deg) scale(1)}50%{transform:translate(14px,-34px) rotate(72deg) scale(1.15)}}
  @keyframes jingListenBody{50%{transform:translateY(-7px) rotate(4deg)}}
  @keyframes jingListenLeft{0%,100%{transform:translate(-1px,1px) rotate(-8deg)}50%{transform:translate(8px,-25px) rotate(26deg)}}
  @keyframes jingListenRight{0%,100%{transform:translate(1px,1px) rotate(8deg)}50%{transform:translate(-8px,-25px) rotate(-26deg)}}
  @keyframes jingThinkBody{50%{transform:translate(7px,-5px) rotate(12deg)}}
  @keyframes jingThinkHand{0%,100%{transform:translate(1px,1px) rotate(8deg) scale(1)}50%{transform:translate(-22px,-24px) rotate(-42deg) scale(1.08)}}
  @keyframes jingClapBody{50%{transform:translateY(-8px) scale(1.05)}}
  @keyframes jingClap{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-12px) scale(1.1)}}
  @keyframes jingStretchBody{50%{transform:translateY(-12px) scale(1.08)}}
  @keyframes jingStretchLeft{0%,100%{transform:translate(-1px,1px) rotate(-8deg) scale(1)}50%{transform:translate(-20px,-31px) rotate(-48deg) scale(1.08)}}
  @keyframes jingStretchRight{0%,100%{transform:translate(1px,1px) rotate(8deg) scale(1)}50%{transform:translate(20px,-31px) rotate(48deg) scale(1.08)}}
  @keyframes jingBlinkSoft{0%,100%{transform:translate(var(--look-x),var(--look-y)) scaleY(1)}42%,58%{transform:translate(var(--look-x),var(--look-y)) scaleY(.08)}}
  @keyframes jingBlinkBrows{50%{transform:translateY(1px) rotate(0);opacity:.55}}
  @keyframes jingBrowBody{50%{transform:translateY(-4px) rotate(3deg)}}
  @keyframes jingBrowLeft{50%{transform:translateY(-6px) rotate(-28deg)}}
  @keyframes jingBrowRight{50%{transform:translateY(-4px) rotate(25deg)}}
  @keyframes jingGiggle{25%{transform:translate(-3px,-3px) rotate(-5deg)}75%{transform:translate(3px,-4px) rotate(5deg)}}
  @keyframes jingLookBody{0%,100%{transform:rotate(-3deg)}35%{transform:translateX(7px) rotate(8deg)}72%{transform:translateX(-7px) rotate(-9deg)}}
  @keyframes jingLookLeft{0%,100%{transform:translate(var(--look-x),var(--look-y))}35%{transform:translate(5px,0)}72%{transform:translate(-5px,1px)}}
  @keyframes jingLookRight{0%,100%{transform:translate(var(--look-x),var(--look-y))}35%{transform:translate(5px,0)}72%{transform:translate(-5px,1px)}}
  @keyframes jingLookBrow{35%{transform:translateX(2px) rotate(8deg)}72%{transform:translateX(-2px) rotate(-8deg)}}
`;
document.head.append(expressionStyle);
