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

  // Determine if owner
  Template.ttcdisruption.helpers({
    // Owner is defined when the task is created, set to the user ID that created it
    isSubway: function () {
        // Track the presence of key terms
        var tracker = [];
        // Get the text
        var text = this.description;
        // Check for line
        var searchTerms = /(line)\s\d{1}/g;
        // Check for trains
        var trainsExp = "trains";
        // Check for station abbreviation
        var stationAbbr = "stn";
        // Check for elevator
        var elevatorTerm = "elevator";
        // Check for platform
        var platformTerm = "platform";
        // Search terms array
        var searchArray = [searchTerms, trainsExp, stationAbbr, elevatorTerm, platformTerm];
        // Check the text for either search term that might indicate subway
        _.each(searchArray, function (item) {
            var result = text.search(item);
            // If there is a valid search term, add it to the tracker
            if (result != -1){
                tracker.push(result);
            }
        });
        // If the tracker is greater than 0, there are matches
        if (tracker.length > 0){
          return true;
        } else {
          return false;
        }
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
      // Line storage
      var ttcSubwayLines = {
        1: "yus",
        2: "bloor-danforth",
        3: "rt",
        4: "sheppard",
        5: "no-line-provided"
      };
      // Check for the grouping of line and number, regex
      var searchTerms = /(line)\s\d{1}/g;
      // Line number check
      var lineCheck = /\d{1}/g;
      // Get the desired text block with the line number, if line number is present
      try {
        var lineBlock = this.description.match(searchTerms)[0];
        // Get the actual line number, and make sure it is registered as a number
        var lineNumber = Number(lineBlock.match(lineCheck)[0]);
      } catch(err) {
        var lineNumber = 5;
      }
      return ttcSubwayLines[lineNumber];
    },// End subway line identification
    getBus: function () {
      // Get the bus number, and display along with bus route name
      var busRoutes = {
        5: "Avenue Rd",
        6: "Bay",
        7: "Bathurst",
        8: "Broadview",
        9: "Bellamy",
        10: "Van Horne",
        11: "Bayview",
        12: "Kingston Rd",
        14: "Glencairn",
        15: "Evans",
        16: "McCowan",
        17: "Birchmount",
        20: "Cliffside",
        21: "Brimley",
        22: "Coxwell",
        23: "Dawes",
        24: "Victoria Park",
        25: "Don Mills",
        26: "Dupont",
        28: "Bayview South",
        29: "Dufferin",
        30: "Lambton",
        31: "Greenwood",
        32: "Eglinton West",
        33: "Forest Hill",
        34: "Eglinton East",
        35: "Jane",
        36: "Finch West",
        37: "Islington",
        38: "Highland Creek",
        39: "Finch East",
        40: "Junction",
        41: "Keele",
        42: "Cummer",
        43: "Kennedy",
        44: "Kipling South",
        45: "Kipling",
        46: "Martin Grove",
        47: "Lansdowne",
        48: "Rathburn",
        49: "Bloor West",
        50: "Burnhamthorpe",
        51: "Leslie",
        52: "Lawrence West",
        53: "Steeles East",
        54: "Lawrence East",
        55: "Warren Park",
        56: "Leaside",
        57: "Midland",
        59: "Maple Leaf",
        60: "Steeles West",
        61: "Avenue Rd North",
        62: "Mortimer",
        63: "Ossington",
        64: "Main",
        65: "Parliament",
        66: "Prince Edward",
        67: "Pharmacy",
        68: "Warden",
        69: "Warden South",
        70: "O'Connor",
        71: "Runnymede",
        72: "Pape",
        73: "Royal York",
        74: "Mt Pleasant",
        75: "Sherbourne",
        76: "Royal York South",
        77: "Swansea",
        78: "St Andrews",
        79: "Scarlett Rd",
        80: "Queensway",
        81: "Thorncliffe Park",
        82: "Rosedale",
        83: "Jones",
        84: "Sheppard West",
        85: "Sheppard East",
        86: "Scarborough",
        87: "Cosburn",
        88: "South Leaside",
        89: "Weston",
        90: "Vaughan",
        91: "Woodbine",
        92: "Woodbine South",
        94: "Wellesley",
        95: "York Mills",
        96: "Wilson",
        97: "Yonge",
        98: "Willowdale - Senlac",
        99: "Arrow Rd",
        100: "Flemingdon Park",
        101: "Downsview Park",
        102: "Markham Rd",
        103: "Mt Pleasant North",
        104: "Faywood",
        105: "Dufferin North",
        106: "York University",
        107: "Keele North",
        108: "Downsview",
        109: "Ranee",
        110: "Islington South",
        111: "East Mall",
        112: "West Mall",
        113: "Danforth",
        115: "Silver Hills",
        116: "Morningside",
        117: "Alness",
        120: "Calvington",
        122: "Graydon Hall",
        123: "Shorncliffe",
        124: "Sunnybrook",
        125: "Drewry",
        126: "Christie",
        127: "Davenport",
        129: "McCowan North",
        130: "Middlefield",
        131: "Nugget",
        132: "Milner",
        133: "Neilson",
        134: "Progress",
        135: "Gerrard",
        139: "Finch-Don Mills",
        160: "Bathurst North",
        161: "Rogers Rd",
        162: "Lawrence - Donway",
        165: "Weston Rd North",
        167: "Pharmacy North",
        168: "Symington",
        169: "Huntingwood",
        171: "Mt Dennis",
        172: "Cherry Street",
        190: "Scarborough Centre Rocket",
        191: "Highway 27 Rocket",
        192: "Airport Rocket",
        193: "Exhibition Rocket",
        194: "Aquatics Centre Rocket",
        195: "Jane Rocket",
        196: "York University Rocket",
        198: "U of T Scarborough Rocket",
        199: "Finch Rocket",
        224: "Victoria Park North",
      };
      var nightRoutes = {
        300: "Bloor - Danforth",
        301: "Queen",
        302: "Danforth Rd - McCowan",
        303: "Don Mills",
        305: "Eglinton East",
        306: "Carlton",
        307: "Eglinton West",
        308: "Finch East",
        309: "Finch West",
        310: "Bathurst",
        311: "Islington",
        312: "St Clair",
        313: "Jane",
        316: "Ossington",
        319: "Wilson",
        320: "Yonge",
        321: "York Mills",
        322: "Coxwell",
        324: "Victoria Park",
        329: "Dufferin",
        352: "Lawrence West",
        353: "Steeles East",
        354: "Lawrence East",
        385: "Sheppard East"
      };
    var communityRoutes = {
        400: "Lawrence Manor",
        402: "Parkdale",
        403: "South Don Mills",
        404: "East York",
        405: "Etobicoke",
        406: "Venue Shuttle Downtown",
        407: "Toronto Rehab Cardiac Centre",
        408: "Venue Shuttle East"
      };
    var downtownExp = {
        141: "Downtown / Mt Pleasant Express",
        142: "Downtown / Avenue Rd Express",
        143: "Downtown / Beach Express",
        144: "Downtown / Don Valley Express",
        145: "Downtown / Humber Bay Express"
      };
    var routeMaster = [busRoutes, nightRoutes, communityRoutes, downtownExp];

    // bus route search regexp
    var findBus = /\d{1,3}.?\s(\w)+/g;
    // bus matches
    var busMatch = this.description.match(findBus);
    console.log(busMatch);
    return "bus";
    } // End getBus method
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