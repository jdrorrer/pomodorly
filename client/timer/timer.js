/* =========================
// Pomorodo Timer
============================ */
Meteor.startup(function() {
  var pomoTime = 25 * 60; // 25 minutes * 60 seconds
  var breakTime = 5 * 60; // 5 minutes * 60 seconds
  var longBreakTime = 15 * 60; // 15 minutes * 60 seconds
  var pomosBeforeLongBreak = 4; // Default 4 pomodoros before long break
  var ding = new buzz.sound('/sounds/ding.mp3');
  var pomoColor = '#de4f4f';
  var shortBreakColor = '#80bd01';
  var longBreakColor = '#4081EA';

  Session.setDefault({ // Initialize secondsLeft and playPauseClass
    'secondsLeft': pomoTime,
    'playPauseClass': 'ion-ios-play-outline play'
  }); 

  var pomoCountDep = {
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

  var setClockBackground = function(deg, bgColor, color) {
    var clockElementBG = 'background-image: linear-gradient('+deg+'deg, transparent 50%, '+bgColor+' 50%),linear-gradient(90deg, white 50%, transparent 50%);'
                       + 'background-color: '+color+';'
                       + 'border-color: '+color+';';
    var blockElementBG = 'background-color: '+color+';';
    Session.set({
      'clockElementStyle': clockElementBG,
      'blockElementStyle': blockElementBG
    });
  };

  var clockResetHelper = function(time, color) {
    Session.set({
      'secondsLeft': time,
      'playPauseClass': 'ion-ios-play-outline play'
    }); 

    // Reset clock background fill based on pomodoro, short or long break time
    setClockBackground(270, color, color);
  };

  clockReset = function() {
    if(Timer.onBreak) { // Time for a break, i.e. just finished a pomodoro
      if(pomoCountDep.get() >= pomosBeforeLongBreak) { // Take a long break after every 4 pomodoros
        clockResetHelper(longBreakTime, longBreakColor);
        console.log('Pomodoro count lb: ' + pomoCountDep.get());
      } else { // Not on long break, i.e. on short break
        clockResetHelper(breakTime, shortBreakColor);
        console.log('Pomodoro count sb: ' + pomoCountDep.get());
      } 
    } else { // Not on break, i.e. ready to start next pomodoro
      clockResetHelper(pomoTime, pomoColor);
    }
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
    if(Timer.onBreak) { // Time for a short break
      if(pomoCountDep.get() >= pomosBeforeLongBreak) { // Take a long break after every 4 pomodoros
        clockUpdateHelper(longBreakColor, longBreakTime, percent);
      } else { // Regular short break
        clockUpdateHelper(shortBreakColor, breakTime, percent);
      }  
    } else { // Not on break means during a pomodoro
      clockUpdateHelper(pomoColor, pomoTime, percent);
    }
  };

  timeLeft = function() {
    // Continue to countdown as long as time remains
    if(Timer.isStarted && Session.get('secondsLeft') > 0) {
      Timer.now = new Date();
      var elapsedTime = (Timer.now.getTime() - Timer.before.getTime());

      if(elapsedTime > Timer.delay) {
        Session.set('secondsLeft', Session.get('secondsLeft') - Math.floor(elapsedTime/Timer.delay));
      } else {
        Session.set('secondsLeft', Session.get('secondsLeft') - 1);
      }

      clockUpdate(Session.get('secondsLeft'));
      Timer.before = new Date();
    }

    if(Session.equals('secondsLeft', 0)) { // Pomodoro or break completed
      Timer.isStarted = false;
      Session.set('isStarted', Timer.isStarted);
      Timer.onBreak = !Timer.onBreak;
      ding.play(); // Play ding sound at end of work sessions and breaks
      Meteor.clearInterval(Timer.interval);

      if(Timer.onBreak) { // Time for a break, i.e. just finished a pomodoro 
        var selectedTask = Session.get('selectedTask');

        Meteor.call('modifySessionsCompleted', selectedTask, 1);
        Meteor.call('completeSession', selectedTask);
        Meteor.call('modifyPomoCount', 1, function(err, data) {
          if(err) {
            console.log(err);
          } else {
            pomoCountDep.set(data);
            console.log(data);
            
            Tracker.autorun(function() {
              clockReset();
            });
          }
        });
      } else { // Not on break, i.e. ready to start next pomodoro
        if(pomoCountDep.get() >= pomosBeforeLongBreak) { // Just finished taking a long break
          Meteor.call('resetPomoCount', function(err, data) { // Reset pomodoro counter
            if(err) {
              console.log(err);
            } else {
              pomoCountDep.set(data);
              console.log(data);
                 
              Tracker.autorun(function() {
                clockReset();
              });
              console.log('Pomodoro count after reset: ' + data);
            }
          }); 
        }
        if(pomoCountDep.get() < pomosBeforeLongBreak) { // Just finished a short break
          Tracker.autorun(function() {
            clockReset();
          });
        } 
      }
    }
  };
});

// =======================
// timer template helpers 
// =======================
Template.timer.helpers({
  time: function() {
    return Session.get('secondsLeft');
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