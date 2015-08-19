if (Meteor.isServer) {
      Meteor.startup(function () {
        // BEGIN meteor methods
        Meteor.methods({
          getTweets: function (latest_tweet_id) {
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

            // Add additional param if this is an update call
            if (latest_tweet_id){
                console.log("_____________");
                console.log("LATEST TWEET ID");
                console.log(latest_tweet_id);
                console.log("_____________");
                tweetParameters["since_id"] = latest_tweet_id;
            }

            var totalRetrieved = 0;

            // Search twitter user timeline "TTCalerts"
            T.get('statuses/user_timeline',
                tweetParameters,
                // callback for Twitter API query has to be bound to Meteor as follows:
                Meteor.bindEnvironment(function(err, data, response) {
                    _.each(data, function (item, index){
                        // Go through the data and add it to the Notices collection
                        // First, turn to lowercase
                        var itemText = item.text;
                        if (latestTweetId){
                            var sanityCheckLatestTweet = (item.id === latest_tweet_id);
                            var latestSanity = true;
                            console.log("previous latest is IN results, EXCLUDE");
                        } else {
                            var latestSanity = false;
                            console.log("proceeding NORMALLY");
                        }
                        var itemLowerCase = itemText.toString().toLowerCase();
                        // Find tweets with rt @user_name (retweets)
                        var retweet = itemLowerCase.search("@");
                        // Don't add "all clear" tweets to database
                        if (retweet == -1 && !latestSanity){
                            console.log("Inserting");
                            // convert quotation marks to simple
                            itemLowerCase = itemLowerCase.replace("’","'");
                            // Set moment on server
                            var time = moment(item.created_at, "ddd MMM DD hh:mm:ss ZZ YYYY").toISOString();
                            Notices.insert({
                                description: itemLowerCase,
                                time: time,
                                tweet_id: item.id
                            });
                        }
                        if (index === 0){
                            var newestTweet = item.id;
                            // Update state
                            State.update(
                                {purpose: "tracking"},
                                {
                                    $set: {
                                        newest_id: newestTweet,
                                        state_time: new Date()
                                    }
                                }
                            );// End State update
                        }
                    });
                })
            );
          },// End get tweets method
          getStateInfo: function () {
            var checkStateStorage = State.findOne({});
            var storageCount = State.find().count();
            var returnObj = {
                data: checkStateStorage,
                count: storageCount
            };
            return returnObj;
          } // end get state method
        });
    // ------------------------------------------------------------------
    // END METHODS
    // ------------------------------------------------------------------
    // BEGIN SERVER CODE
    console.log("refreshing");
    // Establish initial state
    var checkStateStorage = Meteor.call("getStateInfo");
    if (checkStateStorage.count == 0){
        State.insert({
            newest_id: 0,
            purpose: "tracking",
            state_time: new Date()
        });
        console.log("STATUS: getting initial tweetss");
        // begin tweet retrieval cycle for user TTCalerts
        Meteor.call("getTweets", false);
    } else {
        // begin tweet retrieval cycle for user TTCalerts starting with newest
        var getLatestTweet = State.findOne({}, {sort:{$natural:1}})
        var latestTweetId = getLatestTweet.newest_id;
        console.log("STATUS: getting latest tweet");
        Meteor.call("getTweets", latestTweetId);
    }
    // This code only runs on the server
    Meteor.publish("notices", function () {
        return Notices.find();
    });// End meteor publish
  });// End meteor server startup function
}; // End is server condition