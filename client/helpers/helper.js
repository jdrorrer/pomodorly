var minutes, seconds;

Template.registerHelper('formatTimer', function(time) {
  var formatTimer;

  minutes = parseInt(time / 60);
  seconds = parseInt(time % 60);

  // Formatting timer like mm:ss
  if(seconds < 10 && minutes < 10) {
    formatTimer = '0' + minutes + ':0' + seconds; 
  } else if(seconds < 10) {
    formatTimer = minutes + ':0' + seconds;
  } else if(minutes < 10) {
    formatTimer = '0' + minutes + ':' + seconds;
  } else {
    formatTimer = minutes + ':' + seconds;
  }

  return formatTimer;
});
