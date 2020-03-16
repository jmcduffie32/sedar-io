var audio = new Audio('Sedario.mp3');
var playing = false;
audio.volume = 0.1;
audio.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);

function toggle_music() {
  if (playing) {
    audio.pause();
    document.getElementById("music-button").innerHTML = 'PLAY';
    playing = false;

  }
  else {
    audio.play();
    document.getElementById("music-button").innerHTML = 'PAUSE';
    playing = true;
  }
}

function start_music() {
  if (!playing) {
    toggle_music();
  }
}
