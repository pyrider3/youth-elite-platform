(() => {
  const mascot = document.querySelector('#mascot');
  if (!mascot) return;

  const valid = new Set(['idle','greeting','wave','happy','thinking','listening','typing','curious','shy','surprised','celebrate','success','blink','look','nod','heart','peek','twirl','welcome','sleepy']);
  const normalize = mood => ({
    'gesture-wave':'wave', 'gesture-listen':'listening', 'gesture-think':'thinking',
    'gesture-clap':'celebrate', 'gesture-stretch':'welcome', 'blink-soft':'blink',
    'brow-raise':'curious', 'giggle':'happy', 'look-around':'look'
  }[mood] || (valid.has(mood) ? mood : 'idle'));

  let current = 'idle';
  let active = false;
  let pending = null;
  let endTimer = 0;
  let settleTimer = 0;

  function paint(state) {
    mascot.dataset.jingState = state;
    mascot.setAttribute('aria-label', `小菁正在${state === 'idle' ? '等待' : '互动'}`);
  }

  function returnToIdle() {
    paint('idle');
    active = false;
    current = 'idle';
    // 给“收手”留出完整的过渡时间；随后才执行下一条互动。
    settleTimer = window.setTimeout(() => {
      if (!pending) return;
      const next = pending;
      pending = null;
      play(next.state, next.duration);
    }, 420);
  }

  function play(mood, duration = 950) {
    const state = normalize(mood);
    if (state === 'idle') return returnToIdle();
    if (active) {
      // 不中断已进行的手势，最新互动会在回位后接上。
      pending = { state, duration };
      return;
    }
    window.clearTimeout(settleTimer);
    active = true;
    current = state;
    paint(state);
    window.clearTimeout(endTimer);
    endTimer = window.setTimeout(returnToIdle, Math.max(280, duration));
  }

  window.addEventListener('xiaojing-react', event => {
    const { mood, duration } = event.detail || {};
    play(mood, duration);
  });

  document.addEventListener('focusin', event => {
    if (event.target.matches('.field')) play('listening', 760);
  });
  document.addEventListener('input', event => {
    if (event.target.matches('.field')) play('typing', 560);
  });
  document.addEventListener('click', event => {
    if (event.target.closest('.choice')) play(['happy','celebrate','wave','heart','twirl'][Math.floor(Math.random() * 5)], 950);
    if (event.target.closest('#back')) play('shy', 700);
  });

  // 待机时才出现极轻的微表情，避免干扰正在进行的动作。
  const ambient = () => {
    if (!document.hidden && !active) {
      const choices = [['blink',260],['look',700],['nod',660],['peek',720],['sleepy',560]];
      const choice = choices[Math.floor(Math.random() * choices.length)];
      play(choice[0], choice[1]);
    }
    window.setTimeout(ambient, 3300 + Math.random() * 2500);
  };
  paint('idle');
  window.setTimeout(() => play('greeting', 1250), 420);
  window.setTimeout(ambient, 2800);
})();

const stateMachineStyle = document.createElement('style');
stateMachineStyle.textContent = `
  /* 单一状态机：外层持续移动，内层只做一种可回位的动作。 */
  .avatar-wrap{animation:roamTop 8.6s cubic-bezier(.45,0,.4,1) infinite!important}
  .avatar-wrap .avatar,.avatar-wrap .face,.avatar-wrap .eye,.avatar-wrap .brow,.avatar-wrap .mouth,.avatar-wrap .mascot-arm{
    animation:none!important;will-change:transform,opacity,width,height;transition:transform .5s cubic-bezier(.18,.88,.24,1),width .36s ease,height .36s ease,top .36s ease,bottom .36s ease,opacity .32s ease,background .32s ease!important
  }
  .avatar-wrap .mascot-arm{transform-origin:50% 50%!important}
  .avatar-wrap .arm-left{transform:translate(-1px,1px) rotate(-8deg)!important}
  .avatar-wrap .arm-right{transform:translate(1px,1px) rotate(8deg)!important}
  /* 待机的两只手不同步呼吸，避免站着时像静态贴图。 */
  .avatar-wrap[data-jing-state="idle"] .arm-left{animation:jingIdleHandLeft 4.4s cubic-bezier(.42,0,.25,1) infinite!important}
  .avatar-wrap[data-jing-state="idle"] .arm-right{animation:jingIdleHandRight 5.2s cubic-bezier(.42,0,.25,1) infinite!important}
  .avatar-wrap[data-jing-state="idle"] .avatar{transform:rotate(-2deg) translateY(0)!important}
  .avatar-wrap[data-jing-state="idle"] .face{transform:translateX(0)!important}
  .avatar-wrap[data-jing-state="greeting"] .avatar{transform:rotate(-7deg) translateY(-5px)!important}
  .avatar-wrap[data-jing-state="greeting"] .arm-right{animation:jingGreetingWave .62s cubic-bezier(.22,.82,.28,1) 2!important}
  .avatar-wrap[data-jing-state="wave"] .arm-right{animation:jingGreetingWave .62s cubic-bezier(.22,.82,.28,1) 2!important}
  .avatar-wrap[data-jing-state="greeting"] .eye-left,.avatar-wrap[data-jing-state="wave"] .eye-left{transform:scaleY(.28)!important}
  .avatar-wrap[data-jing-state="wave"] .avatar{transform:rotate(7deg) translateY(-4px)!important}
  .avatar-wrap[data-jing-state="happy"] .avatar,.avatar-wrap[data-jing-state="celebrate"] .avatar{transform:translateY(-17px) rotate(8deg) scale(1.08)!important}
  .avatar-wrap[data-jing-state="happy"] .eye,.avatar-wrap[data-jing-state="celebrate"] .eye{height:4px!important;top:21px!important}
  .avatar-wrap[data-jing-state="happy"] .mouth,.avatar-wrap[data-jing-state="celebrate"] .mouth{width:21px!important;height:12px!important;bottom:9px!important;border:0!important;background:#ef9bb5!important;border-radius:0 0 14px 14px!important}
  .avatar-wrap[data-jing-state="celebrate"] .arm-left{transform:translate(-15px,-23px) rotate(-38deg) scale(1.08)!important}
  .avatar-wrap[data-jing-state="celebrate"] .arm-right{transform:translate(15px,-23px) rotate(38deg) scale(1.08)!important}
  .avatar-wrap[data-jing-state="thinking"] .avatar{transform:rotate(11deg) translate(6px,-3px)!important}
  .avatar-wrap[data-jing-state="thinking"] .face{transform:translateX(3px)!important}
  .avatar-wrap[data-jing-state="thinking"] .arm-right{transform:translate(-19px,-22px) rotate(-40deg)!important}
  .avatar-wrap[data-jing-state="thinking"] .brow-left{transform:translateY(1px) rotate(17deg)!important}
  .avatar-wrap[data-jing-state="thinking"] .brow-right{transform:translateY(-2px) rotate(-18deg)!important}
  .avatar-wrap[data-jing-state="listening"] .avatar,.avatar-wrap[data-jing-state="typing"] .avatar{transform:rotate(-7deg) translateY(-4px)!important}
  .avatar-wrap[data-jing-state="listening"] .arm-left{transform:translate(7px,-20px) rotate(23deg)!important}
  .avatar-wrap[data-jing-state="listening"] .arm-right{transform:translate(-7px,-20px) rotate(-23deg)!important}
  .avatar-wrap[data-jing-state="typing"] .eye{height:5px!important;top:20px!important}
  .avatar-wrap[data-jing-state="curious"] .avatar{transform:translate(8px,-7px) rotate(11deg)!important}
  .avatar-wrap[data-jing-state="curious"] .brow-left{transform:translateY(-3px) rotate(-22deg)!important}
  .avatar-wrap[data-jing-state="curious"] .brow-right{transform:translateY(-4px) rotate(22deg)!important}
  .avatar-wrap[data-jing-state="shy"] .avatar{transform:translate(-9px,5px) rotate(-9deg) scale(.96)!important}
  .avatar-wrap[data-jing-state="shy"] .eye{height:5px!important;top:20px!important}.avatar-wrap[data-jing-state="shy"] .brow{opacity:.35!important}
  .avatar-wrap[data-jing-state="surprised"] .avatar{transform:translateY(-12px) rotate(6deg) scale(1.1)!important}
  .avatar-wrap[data-jing-state="surprised"] .eye{height:12px!important;top:15px!important}.avatar-wrap[data-jing-state="surprised"] .mouth{width:9px!important;height:10px!important;border:0!important;background:#e994af!important;border-radius:50%!important}
  .avatar-wrap[data-jing-state="success"] .avatar{transform:translateY(-22px) rotate(10deg) scale(1.12)!important}
  .avatar-wrap[data-jing-state="success"] .arm-left{transform:translate(-15px,-28px) rotate(-42deg)!important}.avatar-wrap[data-jing-state="success"] .arm-right{transform:translate(15px,-28px) rotate(42deg)!important}
  .avatar-wrap[data-jing-state="nod"] .avatar{transform:translateY(9px) rotate(2deg) scale(.98)!important}.avatar-wrap[data-jing-state="nod"] .eye{height:5px!important;top:20px!important}.avatar-wrap[data-jing-state="nod"] .mouth{width:18px!important}
  .avatar-wrap[data-jing-state="heart"] .avatar{transform:translateY(-10px) rotate(-6deg) scale(1.07)!important}.avatar-wrap[data-jing-state="heart"] .arm-left{transform:translate(13px,-24px) rotate(38deg)!important}.avatar-wrap[data-jing-state="heart"] .arm-right{transform:translate(-13px,-24px) rotate(-38deg)!important}.avatar-wrap[data-jing-state="heart"] .eye{height:4px!important;top:21px!important}.avatar-wrap[data-jing-state="heart"] .mouth{width:20px!important;height:11px!important;border:0!important;background:#ef9bb5!important;border-radius:0 0 13px 13px!important}
  .avatar-wrap[data-jing-state="peek"] .avatar{transform:translate(-21px,7px) rotate(-13deg) scale(.92)!important}.avatar-wrap[data-jing-state="peek"] .face{transform:translateX(4px)!important}.avatar-wrap[data-jing-state="peek"] .eye{transform:translateX(5px)!important}.avatar-wrap[data-jing-state="peek"] .arm-right{transform:translate(9px,-11px) rotate(35deg)!important}
  .avatar-wrap[data-jing-state="twirl"] .avatar{transform:translateY(-16px) rotate(28deg) scale(1.1)!important}.avatar-wrap[data-jing-state="twirl"] .arm-left{transform:translate(-17px,-16px) rotate(-40deg)!important}.avatar-wrap[data-jing-state="twirl"] .arm-right{transform:translate(17px,-16px) rotate(40deg)!important}.avatar-wrap[data-jing-state="twirl"] .brow{opacity:0!important}
  .avatar-wrap[data-jing-state="welcome"] .avatar{transform:translateY(-6px) scale(1.04)!important}.avatar-wrap[data-jing-state="welcome"] .arm-left{transform:translate(-25px,-13px) rotate(-47deg)!important}.avatar-wrap[data-jing-state="welcome"] .arm-right{transform:translate(25px,-13px) rotate(47deg)!important}.avatar-wrap[data-jing-state="welcome"] .mouth{width:20px!important}
  .avatar-wrap[data-jing-state="sleepy"] .avatar{transform:translateY(5px) rotate(-5deg) scale(.96)!important}.avatar-wrap[data-jing-state="sleepy"] .eye{height:3px!important;top:21px!important}.avatar-wrap[data-jing-state="sleepy"] .mouth{width:9px!important;height:4px!important}
  .avatar-wrap[data-jing-state="blink"] .eye{transform:scaleY(.08)!important}.avatar-wrap[data-jing-state="look"] .face{transform:translateX(4px)!important}.avatar-wrap[data-jing-state="look"] .eye{transform:translateX(5px)!important}
  @keyframes jingIdleHandLeft{0%,100%{transform:translate(-1px,1px) rotate(-8deg)}30%{transform:translate(-11px,-16px) rotate(-35deg) scale(1.06)}57%{transform:translate(-4px,-7px) rotate(-18deg)}76%{transform:translate(3px,-2px) rotate(1deg)}}
  @keyframes jingIdleHandRight{0%,100%{transform:translate(1px,1px) rotate(8deg)}22%{transform:translate(10px,-20px) rotate(36deg) scale(1.08)}46%{transform:translate(4px,-9px) rotate(18deg)}69%{transform:translate(12px,-15px) rotate(29deg) scale(1.04)}84%{transform:translate(2px,-3px) rotate(9deg)}}
  @keyframes jingGreetingWave{0%,100%{transform:translate(1px,1px) rotate(8deg) scale(1)}20%{transform:translate(14px,-30px) rotate(62deg) scale(1.12)}42%{transform:translate(17px,-31px) rotate(86deg) scale(1.12)}63%{transform:translate(13px,-30px) rotate(49deg) scale(1.1)}82%{transform:translate(16px,-31px) rotate(80deg) scale(1.12)}}
`;
document.head.append(stateMachineStyle);
