/* =========================
// Add Pomodoro Form
============================ */
Template.addTaskForm.events({
  'submit form': function(event) { // Add task to collection on form submit
    event.preventDefault();
    var taskName = event.target.taskName.value;
    var numSessions = event.target.numSessions.value;
    var dateAdded = new Date().getTime();

    Meteor.call('addNewTask', taskName, numSessions, dateAdded);

    console.log('Added ' + taskName + ' to Tasks collection');
    event.target.taskName.value = '';
    event.target.numSessions.value = '';
  }
});