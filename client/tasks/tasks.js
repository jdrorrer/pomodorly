/* =========================
// Pomorodo Task History
============================ */
Template.taskList.helpers({
  task: function() { // Sort in reverse chronological order
    return Tasks.find({}, {sort: {date: -1} });
  },
  selectedClass: function() { // Add selected class to current selected task
    var taskId = this._id;
    if(Session.equals('selectedTask', taskId)) {
      return 'selected';
    }
  },
  notSelectedClass: function() { // Add selected class to current selected task
    var taskId = this._id;
    var selectedTask = Session.get('selectedTask');
    return taskId !== selectedTask;
  },
  isStarted: function() {
    return Session.get('isStarted');
  },
  playPauseClass: function() {
    var taskId = this._id;
    if(Session.equals('selectedTask', taskId)) {
      return Session.get('playPauseClass');
    } 
    else {
      return 'ion-ios-play-outline play';
    }
  }
});

Template.taskList.events({
  'click .task': function() { // Set currently selected task
    var taskId = this._id;
    Session.set('selectedTask', taskId);
  },
  'click .increment': function() { // Increment # of interuptions during pomodoro
    var selectedTask = Session.get('selectedTask');
    Meteor.call('modifyInteruptions', selectedTask, 1);
  },
  'click .decrement': function() { // Decrement # of interuptions
    var selectedTask = Session.get('selectedTask');
    Meteor.call('modifyInteruptions', selectedTask, -1);
  },
  'click .delete': function() {
    var selectedTask = Session.get('selectedTask');
    var doubleCheck = confirm("Are you sure you want to delete this task?");

    Meteor.call('deleteTask', selectedTask, doubleCheck);
    
    Meteor.subscribe('theTasks', function() {
      var taskName = Tasks.findOne({_id: selectedTask}).name;
      console.log('Deleted ' + taskName + ' from Tasks collection');
    });
  },
  'click .complete': function() {
    var selectedTask = Session.get('selectedTask');
    var dateCompleted = new Date().getTime();

    Meteor.subscribe('theTasks', function() {
      var taskName = Tasks.findOne({_id: selectedTask}).name;
      console.log('Completed ' + taskName + ' on ' + dateCompleted);
    });

    Meteor.call('completeTask', selectedTask, dateCompleted);
  },
  'click .play': function(event) {
    Timer.before = new Date();
    Timer.isStarted = true;
    Session.set('isStarted', Timer.isStarted);
    Timer.isPaused = false;

    if(Timer.interval) { // Prevents duplicate intervals that cause timer to speed up
      Meteor.clearInterval(Timer.interval);
    }
    Session.set('playPauseClass', 'ion-ios-pause-outline pause');
    Timer.interval = Meteor.setInterval(timeLeft, 1000);   
  },
  'click .pause': function(event) {
    Timer.isPaused = true;

    if(!Timer.onBreak) { // During a pomodoro, auto-add interuption on pause
      var selectedTask = Session.get('selectedTask');
      Meteor.call('modifyInteruptions', selectedTask, 1);
    }
    Meteor.clearInterval(Timer.interval);
    Session.set('playPauseClass', 'ion-ios-play-outline play');
  },
  'click .reset': function(event) {
    Timer.isStarted = false;
    Session.set('isStarted', Timer.isStarted);
    // Reset clock time, background color and play/pause button
    Tracker.autorun(function() {
      clockReset();
    });
  }
});