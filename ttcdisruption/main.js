Notices = new Mongo.Collection("notices");
State = new Mongo.Collection("state");

if (Meteor.isClient) {

  Meteor.subscribe("notices");

  var clock = function () {
    Session.set("currentTime", moment().toISOString());
  };

  Meteor.startup(function () {
    setInterval(clock, 1000);
  });

  Template.listing.helpers({
    // Helpers go here
    // Get a list of TTC notices into the browser
    notices: function () {
        if (Session.get("displayState")) {
          // Filter alerts based on visibility selection
          var state = Number(Session.get("displayState"));
          if (state != 4){
            if (state === 1){
              state = moment().subtract(3, 'hours').toISOString();
            } else if (state === 2){
              state = moment().subtract(24, 'hours').toISOString();
            } else if (state === 3){
              state = moment().subtract(1, 'week').toISOString();
            } else {
              state = "";
            }
            return Notices.find(
              {
                "time" : { $gte : state }
              },
              {
                sort: {time:-1}, reactive:true
              });
          } else {
            return Notices.find(
            {},
            {
              sort: {time:-1}, reactive:true
            });
          }
        } else {
          var time = moment().subtract(3, 'hours').toISOString();
          // Otherwise, return all of the alerts
          var data = Notices.find(
            {
              "time" : { $gte : time }
            },
            {
              sort: {time:-1}, reactive:true
            });
          return data;
        }
    }
  });

  Template.body.helpers({
    currentTime: function () {
        // Get the current time
        var current = Session.get("currentTime");
        var now = moment(current).format('DD MMM YYYY, h:mm:ss A');
        return now;
    }
  });

  Template.body.events({
    // UI events go here
    "change .ui-control select": function (event) {
      Session.set("displayState", event.target.value);
      // Check for end of day entries
      // var endOfDay = $('.end-of-day-entry');
      // // Remove day dividers if there are no end of day entries
      // if (!_.isEmpty(endOfDay)){
      //   var dayDividerRendered = Blaze.getView($('.day-divider')[0]);
      //   Blaze.remove(dayDividerRendered);
      // }
    }
  });

}

