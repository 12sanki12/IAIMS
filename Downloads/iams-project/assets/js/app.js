/* IAMS auth page behaviour: view titles and deep links, show/hide password, strength meter, match check. */
(function () {
  'use strict';

  var loginRadio = document.getElementById('view-login');
  var registerRadio = document.getElementById('view-register');
  var headerSub = document.getElementById('brandSub');

  /* ---- Which view is showing ---- */
  function applyView(view, focusFirst) {
    var isRegister = view === 'register';
    registerRadio.checked = isRegister;
    loginRadio.checked = !isRegister;
    document.title = (isRegister ? 'Create account' : 'Sign in') + ' | IAMS';
    if (headerSub) { headerSub.textContent = isRegister ? 'Create account' : 'Sign in'; }

    if (focusFirst) {
      var first = document.querySelector(isRegister ? '#full_name' : '#identity');
      if (first) { first.focus({ preventScroll: true }); }
    }
  }

  function viewFromHash() {
    return window.location.hash === '#register' ? 'register' : 'login';
  }

  // Initial view from the URL (index.html#register opens the sign-up form).
  applyView(viewFromHash(), false);

  [loginRadio, registerRadio].forEach(function (radio) {
    radio.addEventListener('change', function () {
      var view = registerRadio.checked ? 'register' : 'login';
      applyView(view, true);
      if (history.replaceState) { history.replaceState(null, '', '#' + view); }
    });
  });

  window.addEventListener('hashchange', function () { applyView(viewFromHash(), false); });

  /* ---- Show / hide password ---- */
  document.querySelectorAll('.toggle-pass').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = document.querySelector(btn.getAttribute('data-target'));
      if (!input) { return; }
      var reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      btn.textContent = reveal ? 'Hide' : 'Show';
      btn.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
      btn.setAttribute('aria-pressed', reveal ? 'true' : 'false');
    });
  });

  /* ---- Password strength and match (register form) ---- */
  var pw = document.getElementById('password');
  var confirmPw = document.getElementById('confirm_password');
  var bar = document.getElementById('strengthBar');
  var strengthText = document.getElementById('strengthText');
  var matchText = document.getElementById('matchText');

  // Status colours stay red / orange / green on purpose: they carry meaning.
  var STRENGTH_COLOURS = ['#dc3545', '#dc3545', '#fd7e14', '#198754', '#146c43'];
  var STRENGTH_LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

  function updateStrength() {
    if (!pw || !bar) { return; }
    var v = pw.value, score = 0;
    if (v.length >= 10) { score++; }
    if (/[A-Za-z]/.test(v) && /[0-9]/.test(v)) { score++; }
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) { score++; }
    if (/[^A-Za-z0-9]/.test(v) || v.length >= 14) { score++; }

    bar.style.width = v ? Math.max(score, 1) * 25 + '%' : '0';
    bar.style.background = STRENGTH_COLOURS[score];
    if (strengthText) { strengthText.textContent = v ? STRENGTH_LABELS[score] : ''; }
  }

  function updateMatch() {
    if (!pw || !confirmPw) { return; }
    var same = pw.value === confirmPw.value;
    confirmPw.setCustomValidity(same ? '' : 'Passwords do not match');
    if (matchText) {
      if (!confirmPw.value) {
        matchText.textContent = '\u00a0';
        matchText.className = 'form-text';
      } else {
        matchText.textContent = same ? 'Passwords match.' : 'Passwords do not match.';
        matchText.className = 'form-text ' + (same ? 'ok' : 'bad');
      }
    }
  }

  if (pw) {
    pw.addEventListener('input', function () { updateStrength(); updateMatch(); });
  }
  if (confirmPw) { confirmPw.addEventListener('input', updateMatch); }

  /* ---- Forms: no backend yet, so valid submits show a notice instead of reloading ---- */
  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var notice = form.querySelector('.demo-notice');
      if (!notice) {
        notice = document.createElement('div');
        notice.className = 'alert alert-success mt-3 mb-0 demo-notice';
        notice.setAttribute('role', 'status');
        form.appendChild(notice);
      }
      notice.textContent = 'Form is valid. Connect this form to your server to complete ' +
        (form.id === 'registerForm' ? 'registration.' : 'sign in.');
    });
  });
})();
