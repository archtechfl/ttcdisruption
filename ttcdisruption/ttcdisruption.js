if (Meteor.isClient) {

  Template.ttcdisruption.helpers({
    // Helpers go here
  });

  Template.ttcdisruption.events({
    // Events go here
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup

    var Twit = Meteor.npmRequire('twit');

    var T = new Twit({
        consumer_key:         Meteor.settings.consumer_key, // API key
        consumer_secret:      Meteor.settings.consumer_secret, // API secret
        access_token:         Meteor.settings.access_token, 
        access_token_secret:  Meteor.settings.access_token_secret
    });

    //  search twitter for all tweets containing the word 'banana'
    //  since Nov. 11, 2011
    T.get('statuses/user_timeline',
        {
            screen_name: 'TTCnotices'
        },
        function(err, data, response) {
            console.log(data[0]);
        }
    );

  });
}