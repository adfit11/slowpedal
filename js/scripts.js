let section = { start: 0, end: 0 };
let loopState = 0;
let playing = false;
let loopInterval;
let playbackInterval;

// Create a unified VideoPlayer class to handle both YouTube and HTML5 video players
class VideoPlayer {
  constructor() {
    this.type = null; // 'youtube' or 'html5'
    this.youtubePlayer = null;
    this.html5Player = null;
    this.html5LoopHandler = null; // Added to manage the HTML5 loop handler
  }

  setYouTubePlayer(ytPlayer) {
    this.youtubePlayer = ytPlayer;
    this.type = 'youtube';
  }

  setHTML5Player(html5Player) {
    this.html5Player = html5Player;
    this.type = 'html5';
  }

  play() {
    if (this.type === 'youtube') {
      this.youtubePlayer.playVideo();
    } else if (this.type === 'html5') {
      this.html5Player.play();
    }
  }

  pause() {
    if (this.type === 'youtube') {
      this.youtubePlayer.pauseVideo();
    } else if (this.type === 'html5') {
      this.html5Player.pause();
    }
  }

  getCurrentTime() {
    if (this.type === 'youtube') {
      return this.youtubePlayer.getCurrentTime();
    } else if (this.type === 'html5') {
      return this.html5Player.currentTime;
    }
    return 0;
  }

  seekTo(time) {
    if (this.type === 'youtube') {
      this.youtubePlayer.seekTo(time);
    } else if (this.type === 'html5') {
      this.html5Player.currentTime = time;
    }
  }

  getDuration() {
    if (this.type === 'youtube') {
      return this.youtubePlayer.getDuration();
    } else if (this.type === 'html5') {
      return this.html5Player.duration || 0;
    }
    return 0;
  }

  setPlaybackRate(rate) {
    if (this.type === 'youtube') {
      this.youtubePlayer.setPlaybackRate(rate);
    } else if (this.type === 'html5') {
      this.html5Player.playbackRate = rate;
    }
  }

  getPlaybackRate() {
    if (this.type === 'youtube') {
      return this.youtubePlayer.getPlaybackRate();
    } else if (this.type === 'html5') {
      return this.html5Player.playbackRate;
    }
    return 1;
  }

  getPlayerState() {
    if (this.type === 'youtube') {
      return this.youtubePlayer.getPlayerState();
    } else if (this.type === 'html5') {
      if (this.html5Player.paused) {
        return 'paused';
      } else {
        return 'playing';
      }
    }
    return 'unstarted';
  }

  isPlaying() {
    if (this.type === 'youtube') {
      return this.youtubePlayer.getPlayerState() === YT.PlayerState.PLAYING;
    } else if (this.type === 'html5') {
      return !this.html5Player.paused;
    }
    return false;
  }

  // New method to add a loop event listener for HTML5 video
  addHTML5LoopHandler(loopHandler) {
    if (this.type === 'html5' && this.html5Player) {
      this.html5LoopHandler = loopHandler;
      this.html5Player.addEventListener('timeupdate', this.html5LoopHandler);
    }
  }

  // New method to remove the loop event listener for HTML5 video
  removeHTML5LoopHandler() {
    if (this.type === 'html5' && this.html5Player && this.html5LoopHandler) {
      this.html5Player.removeEventListener('timeupdate', this.html5LoopHandler);
      this.html5LoopHandler = null;
    }
  }
}

let videoPlayer = new VideoPlayer();

// Load YouTube IFrame API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
  const ytPlayer = new YT.Player('player', {
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onPlaybackRateChange': onPlayerPlaybackRateChange
    }
  });
  videoPlayer.setYouTubePlayer(ytPlayer);
}

function onPlayerReady() {
  videoPlayer.setPlaybackRate(1);
  updateSpeedInput(); // Initialize speed input with current speed
  updateLoopSection();
  updateLoopInputs(); // Initialize input placeholders
}

function onPlayerStateChange(event) {
  if (videoPlayer.isPlaying()) {
    startLooping();
    startPlaybackMarker();
    updateStartStopButton();
  } else {
    stopLooping();
    stopPlaybackMarker();
    updateStartStopButton();
  }
}

function onPlayerPlaybackRateChange() {
  updateSpeedInput(); // Update speed input when playback rate changes
  if (videoPlayer.isPlaying()) {
    startLooping();
  }
}

// For HTML5 video player
function onHTML5PlayerReady() {
  videoPlayer.setPlaybackRate(1);
  updateSpeedInput();
  updateLoopSection();
  updateLoopInputs();
}

function onHTML5PlayerStateChange() {
  if (videoPlayer.isPlaying()) {
    startLooping();
    startPlaybackMarker();
    updateStartStopButton();
  } else {
    stopLooping();
    stopPlaybackMarker();
    updateStartStopButton();
  }
}

function onHTML5PlayerPlaybackRateChange() {
  updateSpeedInput();
  if (videoPlayer.isPlaying()) {
    startLooping();
  }
}

function updateStartStopButton() {
  const startStopButton = document.getElementById('start-stop-button');
  if (videoPlayer.isPlaying()) {
    startStopButton.innerHTML = '<i class="ri-pause-mini-line"></i>';
    startStopButton.title = 'Pause Video - Spacebar';
    playing = true;
  } else {
    startStopButton.innerHTML = '<i class="ri-play-mini-fill"></i>';
    startStopButton.title = 'Start Video - Spacebar';
    playing = false;
  }
}

function startLooping() {
  if (loopState === 2) {
    stopLooping(); // Clear any existing loop handlers
    if (videoPlayer.type === 'youtube') {
      // Use setInterval for YouTube
      loopInterval = setInterval(() => {
        const currentTime = videoPlayer.getCurrentTime();
        if (currentTime >= section.end || currentTime < section.start) {
          videoPlayer.seekTo(section.start);
        }
      }, 100); // Check every 100 milliseconds
    } else if (videoPlayer.type === 'html5') {
      // Use timeupdate event for HTML5 video
      const loopHandler = () => {
        const currentTime = videoPlayer.getCurrentTime();
        if (currentTime >= section.end || currentTime < section.start) {
          videoPlayer.seekTo(section.start);
        }
      };
      videoPlayer.addHTML5LoopHandler(loopHandler);
    }
  }
}

function stopLooping() {
  if (videoPlayer.type === 'youtube') {
    if (loopInterval) {
      clearInterval(loopInterval);
      loopInterval = null;
    }
  } else if (videoPlayer.type === 'html5') {
    videoPlayer.removeHTML5LoopHandler();
  }
}

function handleLoopControlClick() {
  const controlButton = document.getElementById('control-button');
  const currentTime = videoPlayer.getCurrentTime();
  if (loopState === 0) {
    section.start = currentTime;
    loopState = 1;
    controlButton.innerHTML = '<i class="ri-stop-circle-line"></i>';
    controlButton.title = 'Set Loop End';
  } else if (loopState === 1) {
    section.end = currentTime;
    if (section.end <= section.start) {
      alert("Loop end time must be after loop start time.");
      return;
    }
    loopState = 2;
    controlButton.innerHTML = '<i class="ri-close-circle-line"></i>';
    controlButton.title = 'Clear Loop';
    videoPlayer.seekTo(section.start);
    updateLoopSection();
    updateLoopInputs();
    if (videoPlayer.isPlaying()) {
      startLooping(); // Ensure looping starts immediately if video is playing
    }
  } else {
    section.start = 0;
    section.end = 0;
    loopState = 0;
    controlButton.innerHTML = '<i class="ri-loop-left-line"></i>';
    controlButton.title = 'Set Loop Start';
    stopLooping();
    updateLoopSection();
    updateLoopInputs();
  }
}

function extractVideoId(url) {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/.*v=([^&]+)|youtu\.be\/([^?&]+)/);
  return match ? match[1] || match[2] : null;
}

function loadVideo() {
  const url = document.getElementById('video-url').value;
  const videoId = extractVideoId(url);
  if (videoId) {
    // Hide HTML5 player and show YouTube player
    const html5PlayerElement = document.getElementById('html5-player');
    html5PlayerElement.style.display = 'none';
    document.getElementById('player').style.display = 'block';

    videoPlayer.setYouTubePlayer(videoPlayer.youtubePlayer);

    videoPlayer.youtubePlayer.loadVideoById(videoId);
    videoPlayer.pause();
    section.start = 0;
    section.end = 0;
    loopState = 0;
    playing = false;
    const controlButton = document.getElementById('control-button');
    controlButton.innerHTML = '<i class="ri-loop-left-line"></i>';
    controlButton.title = 'Set Loop Start';
    stopLooping();
    updateLoopSection();
    updateLoopInputs();
  } else {
    alert("Invalid YouTube URL. Please enter a valid one.");
  }
}

function loadLocalVideo() {
  const localVideoFileInput = document.getElementById('local-video-file');
  const file = localVideoFileInput.files[0];
  if (!file) {
    alert('Please select a video file.');
    return;
  }

  const url = URL.createObjectURL(file);

  const html5PlayerElement = document.getElementById('html5-player');

  // Hide the YouTube player and show the HTML5 video player
  document.getElementById('player').style.display = 'none';
  html5PlayerElement.style.display = 'block';

  // Set the source of the HTML5 video player
  html5PlayerElement.src = url;

  // Set up the videoPlayer object
  videoPlayer.setHTML5Player(html5PlayerElement);

  // Reset variables and states as needed
  section.start = 0;
  section.end = 0;
  loopState = 0;
  playing = false;

  // Update UI elements accordingly
  const controlButton = document.getElementById('control-button');
  controlButton.innerHTML = '<i class="ri-loop-left-line"></i>';
  controlButton.title = 'Set Loop Start';
  stopLooping();
  updateLoopSection();
  updateLoopInputs();

  // Add event listeners for the HTML5 video element
  html5PlayerElement.addEventListener('loadedmetadata', onHTML5PlayerReady);
  html5PlayerElement.addEventListener('play', onHTML5PlayerStateChange);
  html5PlayerElement.addEventListener('pause', onHTML5PlayerStateChange);
  html5PlayerElement.addEventListener('ratechange', onHTML5PlayerPlaybackRateChange);

  // Ensure the video fills the container
  html5PlayerElement.style.objectFit = 'contain';
}

function togglePlayPause() {
  if (videoPlayer.isPlaying()) {
    videoPlayer.pause();
  } else {
    videoPlayer.play();
  }
  // The state change will be handled in the state change event handlers
}

function adjustPlaybackRate(change) {
  let currentRate = videoPlayer.getPlaybackRate();
  let newRate = Math.round((currentRate + change) * 100) / 100; // Limit precision
  if (newRate < 0.1) newRate = 0.1; // Prevent setting too low speed
  if (newRate > 2.0) newRate = 2.0; // Prevent setting too high speed
  videoPlayer.setPlaybackRate(newRate);
  updateSpeedInput(); // Update speed input after changing speed
}

function setSpeedManually() {
  const speedInput = document.getElementById('speed-input');
  let speedValue = parseFloat(speedInput.value);
  if (isNaN(speedValue) || speedValue < 10 || speedValue > 200) {
    alert('Please enter a valid speed percentage between 10 and 200.');
    return;
  }
  let playbackRate = speedValue / 100;
  videoPlayer.setPlaybackRate(playbackRate);
  // Update speed input to reflect the actual speed
  updateSpeedInput();
}

function updateSpeedInput() {
  const speedInput = document.getElementById('speed-input');
  const currentSpeed = Math.round(videoPlayer.getPlaybackRate() * 100);
  speedInput.value = currentSpeed; // Update input with current speed percentage
}

function updateLoopSection() {
  const duration = videoPlayer.getDuration();
  if (duration === 0) {
    // Duration not yet available; try again shortly
    setTimeout(updateLoopSection, 100);
    return;
  }
  const startPercent = (section.start / duration) * 100;
  const endPercent = (section.end / duration) * 100;
  const loopWidthPercent = endPercent - startPercent;

  const loopSection = document.getElementById('loop-section');
  loopSection.style.left = `${startPercent}%`;
  loopSection.style.width = `${loopWidthPercent}%`;
}

function updateLoopInputs() {
  const startInput = document.getElementById('loop-start-input');
  const endInput = document.getElementById('loop-end-input');
  if (loopState === 2) {
    startInput.value = formatTime(section.start);
    endInput.value = formatTime(section.end);
  } else {
    startInput.value = '';
    endInput.value = '';
    startInput.placeholder = 'M:SS';
    endInput.placeholder = 'M:SS';
  }
}

function setLoopManually() {
  const startInput = document.getElementById('loop-start-input');
  const endInput = document.getElementById('loop-end-input');
  const startTime = parseTime(startInput.value);
  const endTime = parseTime(endInput.value);
  const duration = videoPlayer.getDuration();

  if (startTime === null || endTime === null) {
    alert('Please enter valid times in the format M:SS (e.g., 1:30).');
    return;
  }

  if (startTime < 0 || endTime < 0 || startTime >= endTime) {
    alert('Loop start time must be less than loop end time, and both must be positive.');
    return;
  }

  if (startTime > duration || endTime > duration) {
    alert('Loop times must be within the video duration.');
    return;
  }

  section.start = startTime;
  section.end = endTime;
  loopState = 2;
  const controlButton = document.getElementById('control-button');
  controlButton.innerHTML = '<i class="ri-close-circle-line"></i>';
  controlButton.title = 'Clear Loop';
  updateLoopSection();
  updateLoopInputs();

  // If the video is playing, seek to the loop start and start looping
  if (videoPlayer.isPlaying()) {
    videoPlayer.seekTo(section.start);
    startLooping();
  }
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function parseTime(timeStr) {
  const parts = timeStr.trim().split(':');
  if (parts.length !== 2) {
    return null;
  }
  const minutes = parseInt(parts[0], 10);
  const seconds = parseFloat(parts[1]);
  if (isNaN(minutes) || isNaN(seconds)) {
    return null;
  }
  return minutes * 60 + seconds;
}

function startPlaybackMarker() {
  if (playbackInterval) clearInterval(playbackInterval);
  playbackInterval = setInterval(() => {
    const currentTime = videoPlayer.getCurrentTime();
    const duration = videoPlayer.getDuration();
    if (duration > 0) {
      const percent = (currentTime / duration) * 100;
      const playbackMarker = document.getElementById('playback-marker');
      playbackMarker.style.left = `${percent}%`;
    }
  }, 100);
}

function stopPlaybackMarker() {
  if (playbackInterval) {
    clearInterval(playbackInterval);
    playbackInterval = null;
  }
}

// Functions to shift and adjust the loop
function shiftLoopBackward() {
  if (loopState !== 2) {
    alert("Loop is not set.");
    return;
  }
  const loopLength = section.end - section.start;
  section.end = section.start;
  section.start = section.start - loopLength;

  if (section.start < 0) {
    // Adjust the loop to fit within the duration
    section.start = 0;
    section.end = loopLength;
    const duration = videoPlayer.getDuration();
    if (section.end > duration) {
      section.end = duration;
    }
  }
  videoPlayer.seekTo(section.start);
  updateLoopSection();
  updateLoopInputs();
}

function shiftLoopForward() {
  if (loopState !== 2) {
    alert("Loop is not set.");
    return;
  }
  const loopLength = section.end - section.start;
  section.start = section.end;
  section.end = section.end + loopLength;

  const duration = videoPlayer.getDuration();
  if (section.end > duration) {
    // Adjust the loop to fit within the duration
    section.end = duration;
    section.start = duration - loopLength;
    if (section.start < 0) {
      section.start = 0;
    }
  }
  videoPlayer.seekTo(section.start);
  updateLoopSection();
  updateLoopInputs();
}

function doubleLoopLength() {
  if (loopState !== 2) {
    alert("Loop is not set.");
    return;
  }
  const duration = videoPlayer.getDuration();
  const loopLength = section.end - section.start;
  section.end = section.start + loopLength * 2;

  if (section.end > duration) {
    section.end = duration;
  }

  updateLoopSection();
  updateLoopInputs();
}

function halveLoopLength() {
  if (loopState !== 2) {
    alert("Loop is not set.");
    return;
  }
  const loopLength = section.end - section.start;
  if (loopLength / 2 < 0.1) {
    alert("Loop length too short to halve.");
    return;
  }
  section.end = section.start + loopLength / 2;

  updateLoopSection();
  updateLoopInputs();
}

// Event listeners for the buttons
document.getElementById('control-button').addEventListener('click', handleLoopControlClick);
document.getElementById('load-video').addEventListener('click', loadVideo);
document.getElementById('load-local-video').addEventListener('click', loadLocalVideo);
document.getElementById('start-stop-button').addEventListener('click', togglePlayPause);
document.getElementById('speed-up-button').addEventListener('click', () => adjustPlaybackRate(0.1));
document.getElementById('slow-down-button').addEventListener('click', () => adjustPlaybackRate(-0.1));
document.getElementById('shift-loop-backward-button').addEventListener('click', shiftLoopBackward);
document.getElementById('shift-loop-forward-button').addEventListener('click', shiftLoopForward);
document.getElementById('double-loop-length-button').addEventListener('click', doubleLoopLength);
document.getElementById('halve-loop-length-button').addEventListener('click', halveLoopLength);
document.getElementById('set-loop-button').addEventListener('click', setLoopManually);
document.getElementById('set-speed-button').addEventListener('click', setSpeedManually);

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
  // Ignore key presses when focus is on an input or textarea
  if (event.target.tagName.toLowerCase() === 'input' || event.target.tagName.toLowerCase() === 'textarea') {
    return;
  }

  switch (event.key.toLowerCase()) {
    case ' ':
    case 'spacebar':
    case 'space':
      event.preventDefault(); // Prevent default spacebar scrolling
      togglePlayPause();
      break;
    case 'a':
      adjustPlaybackRate(-0.1);
      break;
    case 's':
      adjustPlaybackRate(0.1);
      break;
    case 'd':
      shiftLoopBackward();
      break;
    case 'f':
      shiftLoopForward();
      break;
    case 'g':
      halveLoopLength();
      break;
    case 'h':
      doubleLoopLength();
      break;
    case 'j':
      handleLoopControlClick();
      break;
  }
});

// Modal functionality
const modalOverlay = document.getElementById('modal-overlay');
const infoButton = document.getElementById('info-button');
const modalCloseButton = document.getElementById('modal-close-button');

infoButton.addEventListener('click', () => {
  modalOverlay.style.display = 'flex';
});

modalCloseButton.addEventListener('click', () => {
  modalOverlay.style.display = 'none';
});

modalOverlay.addEventListener('click', (event) => {
  if (event.target === modalOverlay) {
    modalOverlay.style.display = 'none';
  }
});