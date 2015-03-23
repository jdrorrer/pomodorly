Accounts.onCreateUser(function(options, user) {
  user.pomoCount = 0;
  if (options.profile)
    user.profile = options.profile;
  return user;
});