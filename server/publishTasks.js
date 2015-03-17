Meteor.publish('theTasks', function() {
  return Tasks.find();
});