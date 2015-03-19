Router.configure({
  loadingTemplate: 'loading'
});

Router.map(function() {
  this.route('home', {
    path: '/',
    waitOn: function() {
      return Meteor.subscribe('theTasks');
    }
  });
  this.route('loading', {
    path:'loading'
  });
});