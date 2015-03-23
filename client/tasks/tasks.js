/* =========================
// Pomorodo Task History
============================ */
Template.taskList.helpers({
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
  }
});