 Meteor.methods({
  'addNewTask': function(taskName, numSessions, dateAdded) {
    var currentUserId = Meteor.userId();
    Tasks.insert({
      name: taskName,
      sessions: Number(numSessions),
      sessionsCompleted: 0,
      interuptions: 0,
      date: dateAdded,
      dateCompleted: null,
      createdBy: currentUserId,
      status: 'active'
    });
  },
  'modifyInteruptions': function(selectedTask, incValue) {  
    Tasks.update(selectedTask, {$inc: {interuptions: incValue} });
  },
  'modifySessionsCompleted': function(selectedTask, incValue) {
    Tasks.update(selectedTask, {$inc: {sessionsCompleted: incValue} });
  },
  'deleteTask': function(selectedTask, doubleCheck) {
    if(doubleCheck) {
      Tasks.remove(selectedTask);
    }
  },
  'completeTask': function(selectedTask, dateCompleted) {
    Tasks.update(selectedTask, {$set: {dateCompleted: dateCompleted, status: 'complete'} }); 
  }
});