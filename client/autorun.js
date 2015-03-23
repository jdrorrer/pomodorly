Tracker.autorun(function(){
  Meteor.subscribe('userData');
  // console.log("pomoCount changed to: " + Session.get('pomoCount'));
});