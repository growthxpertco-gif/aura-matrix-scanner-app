'use strict';
(function () {
  var box = document.getElementById('search');
  if (!box) return;
  var none = document.getElementById('none');
  box.addEventListener('input', function () {
    var wanted = box.value.trim().toLowerCase();
    var any = false;
    document.querySelectorAll('.cat').forEach(function (section) {
      var title = section.querySelector('h2').textContent.toLowerCase();
      var whole = wanted !== '' && title.indexOf(wanted) !== -1;
      var shown = 0;
      section.querySelectorAll('li').forEach(function (item) {
        var match = whole || item.dataset.name.indexOf(wanted) !== -1;
        item.hidden = !match;
        if (match) shown++;
      });
      section.hidden = shown === 0;
      if (shown) any = true;
    });
    none.hidden = any;
  });
})();
