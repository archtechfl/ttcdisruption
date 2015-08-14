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
};