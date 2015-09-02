Notices = new Mongo.Collection("notices");
State = new Mongo.Collection("state");

if (Meteor.isClient) {

  Meteor.subscribe("notices");

  Meteor.startup(function () {
    console.log("PAGE refresh");
  });

  Template.body.helpers({
    // Helpers go here
    // Get a list of TTC notices into the browser
    notices: function () {
      return Notices.find(
        {
          "time" : { $gte : moment().subtract(24, 'hours').toISOString() }
        },
        {
          sort: {time:-1}, reactive:true
        });
    },
    currentTime: function () {
        // Get the current time
        var now = moment().format('DD MMM YYYY, h:mm:ss A');
        return now;
    }
  });

  Template.body.events({
    // Events go here
  });

}

