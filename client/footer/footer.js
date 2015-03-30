Template.footer.helpers({
  loginPath: function() {
    return Router.current().route.path() === '/login';
  },
  loggedIn: function() {
    return Meteor.user();
  },
  notLoggedIn: function() {
    return !Meteor.user();
  }
});