Future = Npm.require('fibers/future');

Meteor.methods({
  'modifyPomoCount': function(incValue) {
    var currentUser = Meteor.user();
    var fut = new Future();
    Meteor.users.update(currentUser, 
      {$inc: {pomoCount: incValue} }, 
      function(err) {
        if(err) {
          fut.throw(err);
        } else {
          var currentUserId = Meteor.userId();
          currentUser = Meteor.users.findOne({_id: currentUserId});
          if(currentUser) {
            var pomoCount = currentUser.pomoCount;
          }
          fut.return(pomoCount);
        }
      });
    return fut.wait();
  },
  'resetPomoCount': function() {
    var currentUser = Meteor.user();
    var fut = new Future();
    Meteor.users.update(currentUser, 
      {$set: {pomoCount: 0} },
      function(err) {
        if(err) {
          fut.throw(err);
        } else {
          var currentUserId = Meteor.userId();
          currentUser = Meteor.users.findOne({_id: currentUserId});
          if(currentUser) {
            var pomoCount = currentUser.pomoCount;
          }
          fut.return(pomoCount);
        }
      });
    return fut.wait();
  } 
});