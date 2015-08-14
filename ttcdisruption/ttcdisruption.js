Notices = new Mongo.Collection("notices");

if (Meteor.isClient) {

  Template.body.helpers({
    // Helpers go here
    // Get a list of TTC notices into the browser
    notices: function () {
      return Notices.find({}); 
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

Meteor.methods({
  test: function (oldestTweet) {
    // This is a generic testing function confirming that methods are hooked up
    console.log(oldestTweet);
  },
  getTweets: function () {
    var Twit = Meteor.npmRequire('twit');

    // Create new twitter access object
    var T = new Twit({
        consumer_key:         Meteor.settings.consumer_key, // API key
        consumer_secret:      Meteor.settings.consumer_secret, // API secret
        access_token:         Meteor.settings.access_token, 
        access_token_secret:  Meteor.settings.access_token_secret
    });

    // Parameters object
    var tweetParameters = {
        screen_name: 'TTCnotices',
        count: 200
    };

    var totalRetrieved = 0;

    for (var counter = 0; counter < 1; counter++){
        // Search twitter user timeline "TTCalerts"
        T.get('statuses/user_timeline',
            tweetParameters,
            // callback for Twitter API query has to be bound to Meteor as follows:
            Meteor.bindEnvironment(function(err, data, response) {
                _.each(data, function (item, index){
                  // Go through the data and add it to the Notices collection
                  // First, turn to lowercase
                  var itemText = item.text;
                  var itemLowerCase = itemText.toString().toLowerCase();
                  // Find tweets with all clear
                  var allClear = itemLowerCase.search("all clear");
                  // Find tweets with rt @user_name (retweets)
                  var retweet = itemLowerCase.search("@");
                  // Don't add "all clear" tweets to database
                  if (allClear == -1 && retweet == -1){
                    Notices.insert({
                      description: itemLowerCase,
                      time: item.created_at,
                      tweet_id: item.id
                    });
                  }
                  if (index === 199){
                    var oldestTweet = item.id;
                    totalRetrieved = totalRetrieved + (index + 1);
                    tweetParameters["max_id"] = oldestTweet;
                  }
                });
            })
        );
    }// End loop
  }// End get tweets method
});//End meteor methods