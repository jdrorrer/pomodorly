Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

var requireLogin = function() { 
  if (! Meteor.user()) { // If user is not logged in render welcome page
   this.render('welcome'); 
 } else { //if user is logged in render whatever route was requested
   this.next(); 
 }
}
 
// Before any routing run the requireLogin function, 
// Except in the case of "welcome". 
Router.onBeforeAction(requireLogin, {except: ['welcome', 'signin']});

Router.map(function() {
  this.route('welcome', {
    path:'/'
  });
  this.route('home', {
    path: 'home',
    waitOn: function() {
      Meteor.subscribe('theTasks');
      Meteor.subscribe('theSessions');
    }
  });
  this.route('loading', {
    path: 'loading'
  });
  this.route('stats', {
    path: 'stats',
    waitOn: function() {
      Meteor.subscribe('theTasks');
      Meteor.subscribe('theSessions');
      Meteor.subscribe('theSessionsCount');
    }
  });
});

