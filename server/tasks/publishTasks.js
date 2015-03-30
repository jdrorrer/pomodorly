Meteor.publish('theTasks', function() {
  var currentUserId = this.userId;
  return Tasks.find({createdBy: currentUserId});
});