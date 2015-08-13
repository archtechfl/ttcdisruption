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

  // Common subway method
  function subwayCheck (text) {
    // Track the presence of key terms
    var tracker = 0;
    // Get the text
    var text = text;
    // Check for mention of line and a number, ex. "line 1" or "trains"
    var searchTerms = /(line)\s\d{1}/g;
    var trainsExp = "trains";
    // Search terms array
    var searchArray = [searchTerms, trainsExp];
    // Check the text for either search term that might indicate subway
    _.each(searchArray, function (item) {
        var result = text.search(item);
        tracker += result;
    });
    // If the tracker is greater than 0, there are matches
    if (tracker > 0){
      return true;
    } else {
      return false;
    }
    // End return
  };

  // Determine if owner
  Template.ttcdisruption.helpers({
    // Owner is defined when the task is created, set to the user ID that created it
    isSubway: function () {
        // Track the presence of key terms
        return subwayCheck(this.description);
    },
    // Check if the alert is related to a streetcar
    isStreetcar: function () {
        // Get the text
        var text = this.description;
        // Check for mention of a streetcar line number, ex "501"
        var streetcarCheck = text.search(/(5{1}\d{2})/);
        // If there is a stretcar line number, results will be 0 or greater
        if (streetcarCheck != -1){
          return true;
        } else {
          return false;
        }
    },
    // identify the subway line
    subwayLine: function () {
      console.log(Meteor.call("isSubway"));
    }// End subway line identification
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    Notices.remove({});
    // begin tweet retrieval cycle for user TTCalerts
    /* 
    Goal: retrieve all 3200 accessible tweets by cycling through 200 tweet
    chunks 16 times

    Each time the cycle ends, get the tweet ID of the oldest tweet and set the
    next "max_id" parameter to that ID to get the next 200 oldest tweets
    */
    Meteor.call("getTweets");
  });
}

// End of server code

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