(function(){
  "use strict";

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.js-reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

  /* ---------- Modal elements ---------- */
  var backdrop = document.getElementById('modalBackdrop');
  var modal = document.getElementById('modal');
  var closeBtn = document.getElementById('modalClose');
  var successCloseBtn = document.getElementById('successClose');
  var openTriggers = document.querySelectorAll('[data-open-modal]');
  var tabConsult = document.getElementById('tabConsult');
  var tabContent = document.getElementById('tabContent');
  var modalTitle = document.getElementById('modalTitle');
  var modalSub = document.getElementById('modalSub');
  var submitLabel = document.getElementById('submitLabel');
  var successMsg = document.getElementById('successMsg');
  var lastFocusedEl = null;

  var COPY = {
    consult: {
      title: '무료 상담 신청',
      sub: '업무 상황을 알려주시면, 딱 맞는 AI 협업 방법을 상담해드립니다.',
      submit: '상담 신청하기',
      success: '빠른 시일 내에 입력하신 연락처로 상담 일정을 안내드리겠습니다.'
    },
    content: {
      title: '실무 가이드 받기',
      sub: '오늘 바로 써먹는 AI 협업 가이드를 이메일로 보내드립니다.',
      submit: '가이드 받기',
      success: '입력하신 이메일로 실무 가이드를 곧 보내드리겠습니다.'
    }
  };

  function setMode(mode){
    var isConsult = mode === 'consult';
    tabConsult.setAttribute('aria-selected', isConsult ? 'true' : 'false');
    tabContent.setAttribute('aria-selected', isConsult ? 'false' : 'true');
    var c = COPY[mode];
    modalTitle.textContent = c.title;
    modalSub.textContent = c.sub;
    submitLabel.textContent = c.submit;
    successMsg.textContent = c.success;
    modal.dataset.mode = mode;
  }

  function openModal(mode){
    lastFocusedEl = document.activeElement;
    setMode(mode || 'consult');
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    modal.classList.remove('is-success');
    setTimeout(function(){ document.getElementById('inputName').focus(); }, 50);
  }

  function closeModal(){
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
    if(lastFocusedEl){ lastFocusedEl.focus(); }
  }

  openTriggers.forEach(function(btn){
    btn.addEventListener('click', function(){
      openModal(btn.getAttribute('data-mode'));
    });
  });

  closeBtn.addEventListener('click', closeModal);
  successCloseBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', function(e){
    if(e.target === backdrop){ closeModal(); }
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && backdrop.classList.contains('is-open')){ closeModal(); }
  });

  tabConsult.addEventListener('click', function(){ setMode('consult'); });
  tabContent.addEventListener('click', function(){ setMode('content'); });

  /* ---------- Form validation ---------- */
  var form = document.getElementById('leadForm');
  var inputName = document.getElementById('inputName');
  var inputEmail = document.getElementById('inputEmail');
  var inputPhone = document.getElementById('inputPhone');
  var inputConsent = document.getElementById('inputConsent');
  var submitBtn = document.getElementById('submitBtn');

  var fieldName = document.getElementById('fieldName');
  var fieldEmail = document.getElementById('fieldEmail');
  var fieldPhone = document.getElementById('fieldPhone');

  var NAME_RE = /^[가-힣a-zA-Z\s]{2,}$/;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^01[0-9]-\d{3,4}-\d{4}$/;

  function formatPhone(value){
    var digits = value.replace(/[^0-9]/g, '').slice(0, 11);
    if(digits.length < 4) return digits;
    if(digits.length < 8) return digits.slice(0,3) + '-' + digits.slice(3);
    return digits.slice(0,3) + '-' + digits.slice(3,7) + '-' + digits.slice(7,11);
  }

  inputPhone.addEventListener('input', function(){
    inputPhone.value = formatPhone(inputPhone.value);
    validateAll(false);
  });

  function validateField(input, fieldWrap, regex, isTouched){
    var valid = regex.test(input.value.trim());
    if(isTouched){
      fieldWrap.classList.toggle('has-error', !valid);
      input.classList.toggle('is-error', !valid);
    }
    return valid;
  }

  function validateAll(showErrors){
    var v1 = validateField(inputName, fieldName, NAME_RE, showErrors);
    var v2 = validateField(inputEmail, fieldEmail, EMAIL_RE, showErrors);
    var v3 = validateField(inputPhone, fieldPhone, PHONE_RE, showErrors);
    var v4 = inputConsent.checked;
    var allValid = v1 && v2 && v3 && v4;
    submitBtn.disabled = !allValid;
    return allValid;
  }

  [inputName, inputEmail].forEach(function(input){
    input.addEventListener('blur', function(){ validateAll(true); });
    input.addEventListener('input', function(){ validateAll(false); });
  });
  inputPhone.addEventListener('blur', function(){ validateAll(true); });
  inputConsent.addEventListener('change', function(){ validateAll(true); });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(!validateAll(true)) return;

    var payload = {
      mode: modal.dataset.mode,
      name: inputName.value.trim(),
      email: inputEmail.value.trim(),
      phone: inputPhone.value.trim(),
      consent: inputConsent.checked,
      submittedAt: new Date().toISOString()
    };

    modal.classList.add('is-loading');
    submitBtn.disabled = true;

    // TODO: 실제 서비스에서는 이 지점에서 서버/CRM/구글시트 등으로 payload를 전송합니다.
    setTimeout(function(){
      console.log('lead submitted:', payload);
      modal.classList.remove('is-loading');
      modal.classList.add('is-success');
      form.reset();
      fieldName.classList.remove('has-error');
      fieldEmail.classList.remove('has-error');
      fieldPhone.classList.remove('has-error');
      submitBtn.disabled = true;
    }, 1100);
  });

})();
