Tasks = new Mongo.Collection('tasks');

Router.map(function() {
  this.route('home', {
    path: '/'
  });
});

if(Meteor.isClient) {
  /* =========================
  // Pomorodo Task History
  ============================ */
  Template.addTaskForm.helpers({
    task: function() { // Sort in reverse chronological order
      return Tasks.find({}, {sort: {date: -1} });
    },
    selectedClass: function() { // Add selected class to current selected task
      var taskId = this._id;
      var selectedTask = Session.get('selectedTask');
      if(taskId == selectedTask) {
        return 'selected';
      }
    }
  });

  Template.addTaskForm.events({
    'submit form': function(event) { // Add task to collection on form submit
      event.preventDefault();
      var taskName = event.target.taskName.value;
      var numSessions = event.target.numSessions.value;
      var dateAdded = new Date().getTime();

      Tasks.insert({
        name: taskName,
        sessions: Number(numSessions),
        interuptions: 0,
        date: dateAdded
      });

      console.log('Added ' + taskName + ' to Tasks collection');
      event.target.taskName.value = '';
      event.target.numSessions.value = '';
    },
    'click .task': function() { // Set currently selected task
      var taskId = this._id;
      Session.set('selectedTask', taskId);
    },
    'click .increment': function() { // Increment # of interuptions during pomodoro
      var selectedTask = Session.get('selectedTask');
      Tasks.update(selectedTask, {$inc: {interuptions: 1} });
    },
    'click .decrement': function() { // Decrement # of interuptions
      var selectedTask = Session.get('selectedTask');
      Tasks.update(selectedTask, {$inc: {interuptions: -1} });
    }
  });

  /* =========================
  // Pomorodo Timer
  ============================ */
  var pomoTime = 5; // 25 minutes * 60 seconds
  var breakTime = 3; // 5 minutes * 60 seconds
  var longBreakTime = 7; // 15 minutes * 60 seconds
  var pomosBeforeLongBreak = 4;
  var secondsLeft = pomoTime; // Initialize at pomodoro time
  var minutes, seconds, interval;
  var isStarted, isPaused = false;
  var onBreak = false;
  var pomoCount = 0; // Pomodoro counter

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

  var timeLeft = function() {
    // Continue to countdown as long as time remains
    if(isStarted && secondsLeft > 0) {
      secondsLeft -= 1;
      Session.set('time', secondsLeft);
    }

    if(secondsLeft == 0) { // Pomodoro or break completed
      if(!onBreak) {
        pomoCount += 1;
      }
      onBreak = !onBreak;
      Meteor.clearInterval(interval);
    }
  };

  Template.timer.helpers({
    time: function() {
      return Session.get('time');
    },
    isStarted: function() {
      return Session.get('isStarted');
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
            secondsLeft = longBreakTime; // Reset timer to 5 minutes * 60 seconds
            Session.set('time', secondsLeft);
            console.log('Pomodoro count: ' + pomoCount);
            event.target.value = 'Take a Long Break';
            pomoCount = 0; // Reset pomodoro counter
            console.log('Pomodoro count after reset: ' + pomoCount);
          } else {
            secondsLeft = breakTime; // Reset timer to 5 minutes * 60 seconds
            Session.set('time', secondsLeft);
            event.target.value = 'Take a Break';
            console.log('Pomodoro count: ' + pomoCount);
          } 
          Meteor.clearInterval(interval);   
        } else {
          secondsLeft = pomoTime; // Reset timer to 25 minutes * 60 seconds
          Session.set('time', secondsLeft);
          event.target.value = 'Start';
          Meteor.clearInterval(interval);
        }
      }
    },
    'click .pause': function(event) {
      isPaused = !isPaused;
      if(isPaused) {
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
}
