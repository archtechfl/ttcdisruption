if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    Notices.remove({});
    // Establish initial state
    State.insert({
        newest_id: 0,
        purpose: "tracking"
    });
    // begin tweet retrieval cycle for user TTCalerts
    Meteor.call("getTweets");
    // This code only runs on the server
    Meteor.publish("notices", function () {
        return Notices.find();
    });
  });
};

Meteor.methods({
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
        // max_id: 631518489279250400,
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
                  // Find tweets with rt @user_name (retweets)
                  var retweet = itemLowerCase.search("@");
                  // Don't add "all clear" tweets to database
                  if (retweet == -1){
                    // convert quotation marks to simple
                    itemLowerCase = itemLowerCase.replace("’","'");
                    Notices.insert({
                      description: itemLowerCase,
                      time: item.created_at,
                      tweet_id: item.id
                    });
                  }
                  if (index === 0){
                    var newestTweet = item.id;
                    // Update state
                    State.update({purpose: "tracking"}, {$set: {newest_id: newestTweet}});
                  }
                });
            })
        );
    }// End loop
  }// End get tweets method
});//End meteor methods