Meteor.publish('theSessions', function() {
  var currentUserId = this.userId;
  return Sessions.find({createdBy: currentUserId});
});

Meteor.publish('theSessionsCount', function() {
  var self = this;

  var pipeline = [
    {$match: {createdBy: this.userId}},
    {$project: { date: { $substr: ["$dateCompleted", 0, 10] },
      userId: "$createdBy"
    }},
    {$group: { _id: {
      date: "$date",
      userId: "$userId"
    }, totalSessions: { $sum: 1 }}}
  ];

  sessionsCount = Sessions.aggregate(pipeline)
  _(sessionsCount).each(function(session) {
    self.added('sessionsCount', Random.id(), {userId: session._id.userId, date: moment(session._id.date).toDate(), totalSessions: session.totalSessions});
  });

  self.ready();
});