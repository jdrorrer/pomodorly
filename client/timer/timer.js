/* =========================
// Pomorodo Timer
============================ */
var pomoTime = 5; // 25 minutes * 60 seconds
var breakTime = 3; // 5 minutes * 60 seconds
var longBreakTime = 7; // 15 minutes * 60 seconds
var pomosBeforeLongBreak = 4; // Default 4 pomodoros before long break
var secondsLeft = pomoTime; // Initialize at pomodoro time length
var interval; // Initialize timer interval
var isStarted, isPaused, onBreak = false;
var pomoCount = 0; // Initialize pomodoro counter
var ding = new buzz.sound('/sounds/ding.mp3');

Session.set('time', secondsLeft); // Initialize time session variable
Session.set('playPauseClass', 'ion-ios-play-outline'); // initialize play button

var clockUpdate = function(percent) {
  var deg;
  var totalTime;

  if(onBreak) { // Time for a short break
    if(pomoCount == pomosBeforeLongBreak) { // Take a long break after every 4 pomodoros
      totalTime = longBreakTime;

      if(percent<(totalTime/2)) { // different color timer for long breaks
        deg = 90 + (360*percent/totalTime);
        var clockElementBG = 'background-image: linear-gradient('+deg+'deg, transparent 50%, white 50%),linear-gradient(90deg, white 50%, transparent 50%);'
                           + 'background-color: #4081EA;'
                           + 'border-color: #4081EA;';
        Session.set('clockElementStyle', clockElementBG);
      } else if(percent>=(totalTime/2)) {
        deg = -90 + (360*percent/totalTime);
        var clockElementBG = 'background-image: linear-gradient('+deg+'deg, transparent 50%, #4081EA 50%),linear-gradient(90deg, white 50%, transparent 50%);'
                           + 'background-color: #4081EA;'
                           + 'border-color: #4081EA;';
        Session.set('clockElementStyle', clockElementBG);
      }
    } else { // Regular short break
      totalTime = breakTime;

      if(percent<(totalTime/2)) { // different color timer for short breaks
        deg = 90 + (360*percent/totalTime);
        var clockElementBG = 'background-image: linear-gradient('+deg+'deg, transparent 50%, white 50%),linear-gradient(90deg, white 50%, transparent 50%);'
                           + 'background-color: #80bd01;'
                           + 'border-color: #80bd01;';
        Session.set('clockElementStyle', clockElementBG);
      } else if(percent>=(totalTime/2)) {
        deg = -90 + (360*percent/totalTime);
        var clockElementBG = 'background-image: linear-gradient('+deg+'deg, transparent 50%, #80bd01 50%),linear-gradient(90deg, white 50%, transparent 50%);'
                           + 'background-color: #80bd01;'
                           + 'border-color: #80bd01;';
        Session.set('clockElementStyle', clockElementBG);
      }
    }
    
  } else { // Not on break means during a pomodoro
    totalTime = pomoTime;
    if(percent<(totalTime/2)) {
      deg = 90 + (360*percent/totalTime);
      var clockElementBG = 'background-image: linear-gradient('+deg+'deg, transparent 50%, white 50%),linear-gradient(90deg, white 50%, transparent 50%)';
      Session.set('clockElementStyle', clockElementBG);
    } else if(percent>=(totalTime/2)) {
      deg = -90 + (360*percent/totalTime);
      var clockElementBG = 'background-image: linear-gradient('+deg+'deg, transparent 50%, #de4f4f 50%),linear-gradient(90deg, white 50%, transparent 50%)';
      Session.set('clockElementStyle', clockElementBG);
    }
  }
};

var timeLeft = function() {
  // Continue to countdown as long as time remains
  if(isStarted && secondsLeft > 0) {
    secondsLeft -= 1;
    Session.set('time', secondsLeft);
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
  },
  blockElementStyle: function() {
    var blockElementStyle = Session.get('blockElementStyle');
    return blockElementStyle;
  }
});

Template.taskList.helpers({
  isStarted: function() {
    return Session.get('isStarted');
  },
  playPauseClass: function() {
    var taskId = this._id;
    var selectedTask = Session.get('selectedTask');
    if(taskId == selectedTask) {
      return Session.get('playPauseClass');
    } else {
      return 'ion-ios-play-outline';
    }
  }
});

Template.taskList.events({
  'click .playPause': function(event) {
    isStarted = !isStarted;
    Session.set('isStarted', isStarted);
    
    if(isStarted) {
      if(interval) { // Prevents duplicate intervals that cause timer to speed up
        Meteor.clearInterval(interval);
      }
      event.target.value = 'Reset';
      Session.set('playPauseClass', 'ion-ios-pause-outline');
      interval = Meteor.setInterval(timeLeft, 1000);
    } else {
      if(onBreak) { // Time for a break
        if(pomoCount == pomosBeforeLongBreak) { // Take a long break after every 4 pomodoros
          secondsLeft = longBreakTime; // Reset timer to 15 minutes * 60 seconds
          Session.set('time', secondsLeft);
          console.log('Pomodoro count: ' + pomoCount);
          event.target.value = 'Take a Long Break';
          Session.set('playPauseClass', 'ion-ios-play-outline');

          // Reset clock background fill for long break time
          var clockElementBG = 'background-image: linear-gradient(270deg, transparent 50%, #4081EA 50%),linear-gradient(90deg, white 50%, transparent 50%);'
                             + 'background-color: #4081EA;'
                             + 'border-color: #4081EA;';
          var blockElementBG = 'background-color: #4081EA;';
          Session.set('clockElementStyle', clockElementBG);
          Session.set('blockElementStyle', blockElementBG);
        } else { // Not on long break, i.e. on short break
          secondsLeft = breakTime; // Reset timer to 5 minutes * 60 seconds
          Session.set('time', secondsLeft);
          event.target.value = 'Take a Break';
          Session.set('playPauseClass', 'ion-ios-play-outline');
          console.log('Pomodoro count: ' + pomoCount);

          // Reset clock background fill for short break time
          var clockElementBG = 'background-image: linear-gradient(270deg, transparent 50%, #80bd01 50%),linear-gradient(90deg, white 50%, transparent 50%);'
                             + 'background-color: #80bd01;'
                             + 'border-color: #80bd01;';
          var blockElementBG = 'background-color: #80bd01;';
          Session.set('clockElementStyle', clockElementBG);
          Session.set('blockElementStyle', blockElementBG);
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
        Session.set('playPauseClass', 'ion-ios-play-outline');
        Meteor.clearInterval(interval);

        // Reset clock background fill for pomodoro
        var clockElementBG = 'background-image: linear-gradient(270deg, transparent 50%, #de4f4f 50%),linear-gradient(90deg, white 50%, transparent 50%)';
        var blockElementBG = 'background-color: #de4f4f;';
        Session.set('clockElementStyle', clockElementBG);
        Session.set('blockElementStyle', blockElementBG);
      }
    }
  },
  'click .reset': function(event) {
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