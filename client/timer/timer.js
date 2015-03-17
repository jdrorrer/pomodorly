/* =========================
// Pomorodo Timer
============================ */
var pomoTime = 5; // 25 minutes * 60 seconds
var breakTime = 3; // 5 minutes * 60 seconds
var longBreakTime = 7; // 15 minutes * 60 seconds
var pomosBeforeLongBreak = 4; // Default 4 pomodoros before long break
var secondsLeft = pomoTime; // Initialize at pomodoro time length
var minutes, seconds, interval;
var isStarted, isPaused = false;
var onBreak = false;
var pomoCount = 0; // Initialize pomodoro counter
var ding = new buzz.sound('/sounds/ding.mp3');


UI.registerHelper('formatTimer', function(timer) {
  minutes = parseInt(secondsLeft / 60);
  seconds = parseInt(secondsLeft % 60);

  // Formatting timer like mm:ss
  if(seconds < 10 && minutes < 10) {
    timer = '0' + minutes + ':0' + seconds; 
  } else if(seconds < 10) {
    timer = minutes + ':0' + seconds;
  } else if(minutes < 10) {
    timer = '0' + minutes + ':' + seconds;
  } else {
    timer = minutes + ':' + seconds;
  }

  return timer;
});


var clockUpdate = function(percent) {
  var deg;
  var totalTime;

  if(onBreak) { // Time for a short break
    if(pomoCount == pomosBeforeLongBreak) { // Take a long break after every 4 pomodoros
      totalTime = longBreakTime;
    } else { // Regular short break
      totalTime = breakTime;
    }
  } else { // Not on break means during a pomodoro
    totalTime = pomoTime;
  }

  if(percent<(totalTime/2)) {
    deg = 90 + (360*percent/totalTime);
    var clockElementBG = 'background-image: linear-gradient('+deg+'deg, transparent 50%, white 50%),linear-gradient(90deg, white 50%, transparent 50%)';
    Session.set('clockElementStyle', clockElementBG);
  } else if(percent>=(totalTime/2)) {
    deg = -90 + (360*percent/totalTime);
    var clockElementBG = 'background-image: linear-gradient('+deg+'deg, transparent 50%, #de4f4f 50%),linear-gradient(90deg, white 50%, transparent 50%)';
    Session.set('clockElementStyle', clockElementBG);
  }
};

var timeLeft = function() {
  // Continue to countdown as long as time remains
  if(isStarted && secondsLeft > 0) {
    secondsLeft -= 1;
    Session.set('time', secondsLeft);
    // console.log(pieElement);
    clockUpdate(secondsLeft);
  }

  if(secondsLeft == 0) { // Pomodoro or break completed
    if(!onBreak) { // Just finished a pomodoro
      var selectedTask = Session.get('selectedTask');
      Meteor.call('modifySessionsCompleted', selectedTask, 1);
      pomoCount += 1;
    }
    onBreak = !onBreak;
    ding.play(); // Play ding sound at end of work sessions and breaks
    Meteor.clearInterval(interval);
  }
};

Template.timer.helpers({
  time: function() {
    return Session.get('time');
  },
  isStarted: function() {
    return Session.get('isStarted');
  },
  clockElementStyle: function() {
    var clockElementStyle = Session.get('clockElementStyle');
    return clockElementStyle;
  }
});

Template.timer.events({
  'click .startReset': function(event) {
    isStarted = !isStarted;
    Session.set('isStarted', isStarted);
    
    if(isStarted) {
      if(interval) { // Prevents duplicate intervals that cause timer to speed up
        Meteor.clearInterval(interval);
      }
      event.target.value = 'Reset';
      interval = Meteor.setInterval(timeLeft, 1000);
    } else {
      if(onBreak) { // Time for a short break
        if(pomoCount == pomosBeforeLongBreak) { // Take a long break after every 4 pomodoros
          secondsLeft = longBreakTime; // Reset timer to 15 minutes * 60 seconds
          Session.set('time', secondsLeft);
          console.log('Pomodoro count: ' + pomoCount);
          event.target.value = 'Take a Long Break';
        } else { // Not on long break, i.e. on short break
          secondsLeft = breakTime; // Reset timer to 5 minutes * 60 seconds
          Session.set('time', secondsLeft);
          event.target.value = 'Take a Break';
          console.log('Pomodoro count: ' + pomoCount);
        } 
        Meteor.clearInterval(interval);   
      } else { // Not on break, i.e. ready to start next pomodoro
        if(pomoCount == pomosBeforeLongBreak) { // Just finished taking a long break
          pomoCount = 0; // Reset pomodoro counter
          console.log('Pomodoro count after reset: ' + pomoCount);
        }

        secondsLeft = pomoTime; // Reset timer to 25 minutes * 60 seconds
        Session.set('time', secondsLeft);
        event.target.value = 'Start';
        Meteor.clearInterval(interval);
      }
      // Reset clock background fill
      var clockElementBG = 'background-image: linear-gradient(270deg, transparent 50%, #de4f4f 50%),linear-gradient(90deg, white 50%, transparent 50%)';
      Session.set('clockElementStyle', clockElementBG);
    }
  },
  'click .pause': function(event) {
    isPaused = !isPaused;

    if(isPaused) {
      if(!onBreak) { // During a pomodoro, auto-add interuption on pause
        var selectedTask = Session.get('selectedTask');
        Meteor.call('modifyInteruptions', selectedTask, 1);
      }

      event.target.value = 'Continue';
      Meteor.clearInterval(interval);
    } else {
      if(interval) { // Prevents duplicate intervals that cause timer to speed up
        Meteor.clearInterval(interval);
      }
      event.target.value = 'Pause';
      interval = Meteor.setInterval(timeLeft, 1000);
    }
  }
});