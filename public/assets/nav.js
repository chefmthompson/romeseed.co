/* Mobile nav disclosure. Progressive enhancement: without JS the links stay
   reachable because the toggle only appears when this script runs. */
(function () {
  var nav = document.getElementById('nav');
  if (!nav) return;
  var btn = nav.querySelector('.nav-toggle');
  var panel = document.getElementById('nav-links');
  if (!btn || !panel) return;
  function set(open) {
    nav.setAttribute('data-open', open ? 'true' : 'false');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = open ? 'Close' : 'Menu';
  }
  set(false);
  btn.addEventListener('click', function () {
    set(nav.getAttribute('data-open') !== 'true');
  });
  panel.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') set(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') set(false);
  });
})();
