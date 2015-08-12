Notices = new Mongo.Collection("notices");

if (Meteor.isClient) {

  Template.body.helpers({
    // Helpers go here
    // Get a list of TTC notices into the browser
    notices: function () {
      return Notices.find({}); 
    }
  });

  Template.body.events({
    // Events go here
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

    Notices.remove({});

    var Twit = Meteor.npmRequire('twit');

    var T = new Twit({
        consumer_key:         Meteor.settings.consumer_key, // API key
        consumer_secret:      Meteor.settings.consumer_secret, // API secret
        access_token:         Meteor.settings.access_token, 
        access_token_secret:  Meteor.settings.access_token_secret
    });

    //  search twitter use timeline "TTCalerts"
    T.get('statuses/user_timeline',
        {
            screen_name: 'TTCnotices',
            exclude_replies: true,
            count: 200
        },
        // callback for Twitter API query has to be bound to Meteor as follows:
        Meteor.bindEnvironment(function(err, data, response) {
            _.each(data, function (item){
              // Go through the data and add it to the Notices collection
              // First, turn to lowercase
              var itemText = item.text;
              var itemLowerCase = itemText.toString().toLowerCase();
              // Find tweets with all clear
              var allClear = itemLowerCase.search("all clear");
              // Don't add "all clear" tweets to database
              if (allClear == -1){
                Notices.insert({
                  description: itemLowerCase
                });
              }
            });
        })
    );

  });
}