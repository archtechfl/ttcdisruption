if (Meteor.isServer) {
      Meteor.startup(function () {
        // BEGIN meteor methods
        Meteor.methods({
          getTweets: function (latest_tweet_id) {
            console.log("Latest ID: " + latest_tweet_id);
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
                tweetParameters["since_id"] = latest_tweet_id;
            }

            // Search twitter user timeline "TTCalerts"
            T.get('statuses/user_timeline',
                tweetParameters,
                // callback for Twitter API query has to be bound to Meteor as follows:
                Meteor.bindEnvironment(function(err, data, response) {
                    _.each(data, function (item, index){
                        // Go through the data and add it to the Notices collection
                        // First, turn to lowercase
                        var itemText = item.text;
                        var latestSanity = "";
                        if (latest_tweet_id){
                            var sanityCheckLatestTweet = (item.id === latest_tweet_id);
                            if (sanityCheckLatestTweet == true){
                                latestSanity = false;
                                // console.log("previous latest is IN results, EXCLUDE");
                            } else {
                                latestSanity = true;
                                // console.log("proceeding NORMALLY");
                            }
                        } else {
                            latestSanity = true;
                            // console.log("proceeding NORMALLY");
                        }
                        var itemLowerCase = itemText.toString().toLowerCase();
                        // Find tweets with rt @user_name (retweets)
                        var retweet = itemLowerCase.search("@");
                        // Don't add "all clear" tweets to database
                        if (retweet == -1 && latestSanity){
                            // console.log("Inserting");
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
            // Gets the state object that stores info about the main Notices
            // collection, so that it doesn't have to be queried at the beginning of
            // an update process
            //
            // The State is stored at the end of the update process, and read at the beginning of
            // the next cycle
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
    // Establish initial state
    var checkStateStorage = Meteor.call("getStateInfo");
    // CRON JOB
    var newestTweetsCron = function () {
        var getLatestTweet = State.findOne({}, {sort:{$natural:1}})
        var latestTweetId = getLatestTweet.newest_id;
        Meteor.call("getTweets", latestTweetId);
    };
    SyncedCron.add({
          name: 'Update feed',
          schedule: function(parser) {
            // parser is a later.parse object
            return parser.text('every 2 minutes');
          },
          job: function() {
            var refresher = newestTweetsCron();
            return refresher;
          }
        });
    // END CRON JOB
    if (checkStateStorage.count == 0){
        State.insert({
            newest_id: 0,
            purpose: "tracking",
            state_time: new Date()
        });
        // begin tweet retrieval cycle for user TTCalerts, for first time
        // This would only occur with a fresh database
        Meteor.call("getTweets", false);
        SyncedCron.start();
    } else {
        // begin tweet retrieval cycle for user TTCalerts starting with newest
        // Update the tweet database every 2 minutes
        // Start CRON job
        SyncedCron.start();
    }
    // Publish the notices collection to client
    Meteor.publish("notices", function () {
        return Notices.find();
    });// End meteor publish
  });// End meteor server startup function
}; // End is server condition