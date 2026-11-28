'use strict';
(function () {
  function byId(id) { return document.getElementById(id); }

  // Jap counter, 108 to a mala.
  var count = 0;
  function showCount() {
    var malas = Math.floor(count / 108);
    byId('count').textContent = count;
    byId('malas').textContent = malas + (malas === 1 ? ' mala' : ' malas') + ' of 108';
  }
  byId('tap').addEventListener('click', function () {
    count++;
    showCount();
    if (navigator.vibrate) navigator.vibrate(count % 108 === 0 ? 250 : 15);
  });
  byId('reset').addEventListener('click', function () { count = 0; showCount(); });

  // Sound, shared by the timer's bell and the tones.
  var audio = null;
  var playing = null;
  function context() {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    return audio;
  }
  function tone(hertz, seconds) {
    var a = context();
    var volume = a.createGain();
    volume.gain.value = 0.15;
    var source = a.createOscillator();
    source.frequency.value = hertz;
    source.connect(volume);
    volume.connect(a.destination);
    source.start();
    if (seconds) {
      volume.gain.exponentialRampToValueAtTime(0.001, a.currentTime + seconds);
      source.stop(a.currentTime + seconds);
    }
    return source;
  }

  // Meditation timer. The end time is fixed at the start, so a sleeping page
  // cannot make it run slow.
  var minutes = 10;
  var end = 0;
  var timer = null;
  var lock = null;
  function showClock(seconds) {
    var s = seconds % 60;
    byId('clock').textContent = Math.floor(seconds / 60) + ':' + (s < 10 ? '0' : '') + s;
  }
  function finish(message) {
    clearInterval(timer);
    timer = null;
    byId('start').textContent = 'Start';
    byId('timerSays').textContent = message;
    showClock(minutes * 60);
    if (lock) { lock.release().catch(function () {}); lock = null; }
  }
  function tick() {
    var left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    showClock(left);
    if (left === 0) {
      tone(528, 4);
      finish('Time is complete.');
    }
  }
  document.querySelectorAll('.pick').forEach(function (button) {
    button.addEventListener('click', function () {
      minutes = Number(button.dataset.min);
      document.querySelectorAll('.pick').forEach(function (other) {
        other.setAttribute('aria-pressed', String(other === button));
      });
      finish('');
    });
  });
  byId('start').addEventListener('click', function () {
    if (timer) { finish('Stopped.'); return; }
    context();
    end = Date.now() + minutes * 60000;
    timer = setInterval(tick, 250);
    byId('start').textContent = 'Stop';
    byId('timerSays').textContent = 'Started. A bell sounds at the end.';
    if (navigator.wakeLock) {
      navigator.wakeLock.request('screen').then(function (held) {
        if (timer) lock = held; else held.release();
      }).catch(function () {});
    }
    tick();
  });

  // Tones, one at a time. The same notes as in the app.
  var groups = [
    ['Chakra notes', [['Root', 261.63], ['Sacral', 293.66], ['Solar plexus', 329.63], ['Heart', 349.23], ['Throat', 392], ['Third eye', 440], ['Crown', 493.88]]],
    ['Planet tones', [['Sun', 246], ['Moon', 293], ['Mars', 329], ['Mercury', 196], ['Jupiter', 220], ['Venus', 349], ['Saturn', 261]]],
    ['Solfeggio tones', [['396', 396], ['417', 417], ['528', 528], ['639', 639], ['741', 741], ['852', 852]]]
  ];
  function stop() {
    if (playing) { playing.stop(); playing = null; }
    document.querySelectorAll('.tone').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
  }
  groups.forEach(function (group) {
    var title = document.createElement('h3');
    title.textContent = group[0];
    var row = document.createElement('div');
    row.className = 'row';
    group[1].forEach(function (note) {
      var button = document.createElement('button');
      button.className = 'btn tone';
      button.textContent = note[0];
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', function () {
        var again = button.getAttribute('aria-pressed') === 'true';
        stop();
        if (again) return;
        playing = tone(note[1]);
        button.setAttribute('aria-pressed', 'true');
      });
      row.appendChild(button);
    });
    byId('tones').appendChild(title);
    byId('tones').appendChild(row);
  });
  byId('stop').addEventListener('click', stop);
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
})();
