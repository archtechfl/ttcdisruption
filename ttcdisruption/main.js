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
        if (Session.get("displayState")) {
          // Filter alerts based on visibility selection
          var state = Number(Session.get("displayState"));
          var time = "";
          if (state != "all"){
            if (state === 1){
              state = moment().subtract(3, 'hours').toISOString();
            } else if (state === 2){
              state = moment().subtract(24, 'hours').toISOString();
            } else if (state === 3){
              state = moment().subtract(1, 'week').toISOString();
            } else {
              state = "";
            }
            console.log(state);
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
    },
    currentTime: function () {
        // Get the current time
        var now = moment().format('DD MMM YYYY, h:mm:ss A');
        return now;
    }//,
    /*
    timeAgo: function (number, period){
        // Return ISO time stamps for filtering based on past range
        var num = Number(number);
        return moment().subtract(num, period).toISOString();
    }
    */
  });

  Template.body.events({
    // UI events go here
    "change .ui-control select": function (event) {
      Session.set("displayState", event.target.value);
    }
  });

}

