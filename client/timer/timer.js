/* =========================
// Pomorodo Timer
============================ */
Timer = {
  pomoTime: 5,
  breakTime: 3,
  longBreakTime: 7, // 15 minutes * 60 seconds
  pomosBeforeLongBreak: 4,// Default 4 pomodoros before long break
  secondsLeft: pomoTime, // Initialize at pomodoro time length
  interval: null,
  isStarted: false, 
  isPaused: false, 
  onBreak: false,
  pomoCount: 0, // Initialize pomodoro counter
  ding: new buzz.sound('/sounds/ding.mp3'),
  pomoColor: '#de4f4f',
  shortBreakColor: '#80bd01',
  longBreakColor :'#4081EA'
};

var pomoTime = 5; // 25 minutes * 60 seconds
var breakTime = 3; // 5 minutes * 60 seconds
var longBreakTime = 7; // 15 minutes * 60 seconds
var pomosBeforeLongBreak = 4; // Default 4 pomodoros before long break
var secondsLeft = pomoTime; // Initialize at pomodoro time length
var interval; // Initialize timer interval
var isStarted, isPaused, onBreak = false;
// var pomoCount = 0; // Initialize pomodoro counter
var ding = new buzz.sound('/sounds/ding.mp3');
var pomoColor = '#de4f4f';
var shortBreakColor = '#80bd01';
var longBreakColor = '#4081EA';

pomoCountDep = {
  count: 0,
  dep: new Tracker.Dependency, 
  get: function () {
    this.dep.depend(); //saves the Tracker.currentComputation
    return this.count;
  },
  set: function (newValue) {
    if(newValue !== this.count) {
      this.count = newValue;
      this.dep.changed(); //invalidates all dependent computations
    }
    return this.count;
  }
};

Session.set('time', secondsLeft); // Initialize time session variable
Session.set('playPauseClass', 'ion-ios-play-outline play'); // initialize play button

var setClockBackground = function(deg, bgColor, color) {
  var clockElementBG = 'background-image: linear-gradient('+deg+'deg, transparent 50%, '+bgColor+' 50%),linear-gradient(90deg, white 50%, transparent 50%);'
                     + 'background-color: '+color+';'
                     + 'border-color: '+color+';';
  var blockElementBG = 'background-color: '+color+';';
  Session.set('clockElementStyle', clockElementBG);
  Session.set('blockElementStyle', blockElementBG);
};

var clockResetHelper = function(time, color) {
  secondsLeft = time; // Reset timer based on pomodoro, short or long break time
  Session.set('time', secondsLeft);
  Session.set('playPauseClass', 'ion-ios-play-outline play');
  // Reset clock background fill based on pomodoro, short or long break time
  setClockBackground(270, color, color);
};

var clockReset = function() {
  Tracker.autorun(function(c) {
    var pomoCount = pomoCountDep.get();

    if(onBreak) { // Time for a break, i.e. just finished a pomodoro
      if(pomoCount >= pomosBeforeLongBreak) { // Take a long break after every 4 pomodoros
        clockResetHelper(longBreakTime, longBreakColor);
        console.log('Pomodoro count lb: ' + pomoCount);
      } else { // Not on long break, i.e. on short break
        clockResetHelper(breakTime, shortBreakColor);
        console.log('Pomodoro count sb: ' + pomoCount);
      } 
    } else { // Not on break, i.e. ready to start next pomodoro
      clockResetHelper(pomoTime, pomoColor);
    }

    c.stop();
  });
};

var clockUpdateHelper = function(color, totalTime, percent) {
  var deg;

  if(percent<(totalTime/2)) { // different color timer for long breaks
    deg = 90 + (360*percent/totalTime);
    setClockBackground(deg, 'white', color);
  } else if(percent>=(totalTime/2)) {
    deg = -90 + (360*percent/totalTime);
    setClockBackground(deg, color, color);
  }
};

var clockUpdate = function(percent) {
  var pomoCount = pomoCountDep.get();
 
  if(onBreak) { // Time for a short break
    if(pomoCount >= pomosBeforeLongBreak) { // Take a long break after every 4 pomodoros
      clockUpdateHelper(longBreakColor, longBreakTime, percent);
    } else { // Regular short break
      clockUpdateHelper(shortBreakColor, breakTime, percent);
    }  
  } else { // Not on break means during a pomodoro
    clockUpdateHelper(pomoColor, pomoTime, percent);
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
    isStarted = false;
    Session.set('isStarted', isStarted);
    onBreak = !onBreak;
    ding.play(); // Play ding sound at end of work sessions and breaks
    Meteor.clearInterval(interval);

    if(onBreak) { // Time for a break, i.e. just finished a pomodoro 
      var selectedTask = Session.get('selectedTask');
      var pomoCount = pomoCountDep.get();

      Meteor.call('modifySessionsCompleted', selectedTask, 1);
      Meteor.call('completeSession', selectedTask);
      Meteor.call('modifyPomoCount', 1, function(err, data) {
        if(err) {
          console.log(err);
        } else {
          pomoCountDep.set(data);
          console.log(data);
          
          clockReset();
        }
      });
    } else { // Not on break, i.e. ready to start next pomodoro
      var pomoCount = pomoCountDep.get();
      if(pomoCount >= pomosBeforeLongBreak) { // Just finished taking a long break
        Meteor.call('resetPomoCount', function(err, data) { // Reset pomodoro counter
          if(err) {
            console.log(err);
          } else {
            pomoCountDep.set(data);
            console.log(data);
               
            clockReset();
            console.log('Pomodoro count after reset: ' + data);
          }
        }); 
      }
      if(pomoCount < pomosBeforeLongBreak) { // Just finished a short break
        clockReset();
      } 
    }
  }
};

// ==================================
// timer template helpers and events
// ==================================
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

// ====================================
// taskList template helpers and events
// ====================================
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
      return 'ion-ios-play-outline play';
    }
  }
});

Template.taskList.events({
  'click .play': function(event) {
    isStarted = true;
    Session.set('isStarted', isStarted);
    isPaused = false;

    if(interval) { // Prevents duplicate intervals that cause timer to speed up
      Meteor.clearInterval(interval);
    }
    Session.set('playPauseClass', 'ion-ios-pause-outline pause');
    interval = Meteor.setInterval(timeLeft, 1000);
  },
  'click .pause': function(event) {
    isPaused = true;

    if(!onBreak) { // During a pomodoro, auto-add interuption on pause
      var selectedTask = Session.get('selectedTask');
      Meteor.call('modifyInteruptions', selectedTask, 1);
    }
    Meteor.clearInterval(interval);
    Session.set('playPauseClass', 'ion-ios-play-outline play');
  },
  'click .reset': function(event) {
    isStarted = false;
    // Reset clock time, background color and play/pause button
    clockReset();
  }
});