Template.nav.helpers({
  notLoginPath: function() {
    return Router.current().route.path() !== '/login';
  }
});

Template.nav.events({
  'click .login': function() {
    Router.go('signin');
  }
});