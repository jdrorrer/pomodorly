Meteor.methods({
  'completeSession': function(selectedTask) {
    var dateCompleted = new Date();
    var currentUserId = Meteor.userId();

    Sessions.insert({
      dateCompleted: dateCompleted,
      taskId: selectedTask,
      createdBy: currentUserId
    });
  }
});