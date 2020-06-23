

var audio = new Audio('Sedario.mp3');
audio.volume = 0.1;
audio.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);

audio.addEventListener('pause', function() {
	document.getElementById("music-button").innerHTML = 'PLAY';
});

audio.addEventListener('play', function() {
	document.getElementById("music-button").innerHTML = 'PAUSE';
});

function toggle_music() {
  if (audio.paused) {
		audio.play();
		document.getElementById("music-button").innerHTML = 'PAUSE';
  }
  else {
		audio.pause();
		document.getElementById("music-button").innerHTML = 'PLAY';
  }
}

function start_music() {
  if (audio.paused && audio.currentTime == 0) {
    toggle_music();
  }
}
