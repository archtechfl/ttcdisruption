if (Meteor.isClient) {

function formatDescription (text) {
    var text = text;
    // Remove TTC mentions
    formattedText = text.replace(/(http)s?:\/\/.+/g, "");
    formattedText = formattedText.replace(/\#?(ttc)\#?/g, "");
    // handle punctuation (' and &)
    formattedText = formattedText.replace("’","'")
    formattedText = formattedText.replace(/\s?&amp;\s?/g, " and ");
    // change saint (st.) to st
    formattedText = formattedText.replace(/(st\.)/g,"st");
    // Spelling errors, correct them
    var spellingErrors = {
        "bwtn": "btwn"
    };
    _.each(spellingErrors, function (replacement, original) {
        formattedText = formattedText.replace(original, replacement);
    });
    return formattedText;
};

Template.ttcdisruption.events({
    // Talking to Google goes here
    // "click .location-alert": function (event) {
    //     var resources = {};
    //     Meteor.call("googleMapRetrieve", function(error, data) {
    //         if (!error) {
    //             resources = data;
    //             console.log(resources);
    //         } else {
    //             console.log(error);
    //         }
    //     });
    // }
  });

Template.ttcdisruption.helpers({
    // Owner is defined when the task is created, set to the user ID that created it
    isSubway: function () {
        // Track the presence of key terms
        var tracker = "";
        // Get the text
        var text = this.description;
        // Search terms object
        var searchTerms = {
            "line search": /(line)\s?\d{1}/g,
            "trains": "trains",
            "station abbreviation": "stn",
            "station full": "station",
            "subway": "subway",
            "elevator": "elevator",
            "platform": "platform",
            "track": "track"
        };
        // Check the text for either search term that might indicate subway
        tracker = _.filter(searchTerms, function(term, index){ 
            return text.search(term) > -1;
        });
        // Check to make sure that the reference isn't to a bus or go station
        // Also make sure there are no landmarks with "track" in the name
        var sanityExclude = {
            "diversion": "diverting",
            "diverted": "diverted",
            "go_transit": "go station",
            "racing_venue": /(race)\s?(track)/g,
            "surface_routes": /(surface\sroutes)|(night\sbus)/g,
            "street_level": "street level"
        };
        var excludeTracker = [];
        // Check the text for either search term that might indicate bus
        excludeTracker = _.filter(sanityExclude, function(term){ 
            return text.search(term) > -1;
        });
        // If the tracker is greater than 0 and bus tracker is nil, 
        // there is a subway entry
        if (tracker.length > 0 && excludeTracker.length === 0){
            return true;
        } else {
            return false;
        }
    },
    // Check if the alert is related to a streetcar
    isStreetcar: function () {
        // Get the text
        var text = this.description;

        // Check for mention of a streetcar line number, ex "501", first
        // Then check other terms
        var searchTerms = {
            "line_search": /(5{1}\d{2})/g
        };
        // Check the text for either search term that might indicate subway
        var streetcarCheck = _.filter(searchTerms, function(term, index){ 
            return text.search(term) > -1;
        });
        // If there is a stretcar line number, results will be 0 or greater
        if (streetcarCheck.length > 0){
          return true;
        } else {
          return false;
        }
    },
    // Get streetcar number
    streetcarNumber: function () {
        // Get the text
        var text = this.description;
        var routeListing = [];
        var streetcarNum = text.match(/(5{1}\d{2})/g);
        // Handle how many streetcar routes may be involved
        if (streetcarNum.length > 0){
            _.each(streetcarNum, function (item, index) {
                routeListing.push(item);
            });
        } else {
            routeListing.push(0);
        }
        return routeListing;
    },
    // identify the subway line
    subwayLine: function () {
      var text  = this.description;
      // Line storage
      var ttcSubwayLines = {
        1: "YUS-Line",
        2: "BD-Line",
        3: "SRT-Line",
        4: "Sheppard-Line",
        5: "no-line-provided"
      };
      var ttcLineAbbreviations = [
        {"line": 1, "abbr": /(\(yus\))/g},
        {"line": 1, "abbr": /(\(yu\))/g},
        {"line": 2, "abbr": /(\(bd\))/g},
        {"line": 3, "abbr": /(\(rt\))/g},
        {"line": 3, "abbr": /(\(srt\))/g}
      ];
      // Check for the grouping of line and number, regex
      var searchTermsLineEach = /(line)\s?\d{1}/g;
      // Check for multiple line declaration with one preface, ie. Lines 1 and 2
      var searchTermsOne = /(line)s?\s?\d{1}.+\d{1}/g;
      // Line number check
      var lineCheck = /\d{1}/g;
      // Get the desired text block with the line number, if line number is present
      var textForSearch = formatDescription(text);
      // Prepare for line search capture
      var lineBlocks = [];
      // Final line numbers repository
      var lineNumbers = [];
      try {
        lineBlocks = text.match(searchTermsLineEach);
        if (_.isNull(lineBlocks)){
            lineBlocks = text.match(searchTermsOne)[0];
            lineNumbers = lineBlocks.match(lineCheck);
        } else {
            // Get the actual line number, and make sure it is registered as a number
            _.each(lineBlocks, function (item, index) {
                lineNumbers.push(Number(item.match(lineCheck)[0]));
            });
        }
        // Get station list
        var stationList = stationInfo.retrieveStationListing(textForSearch);
      } catch(err) {
        // Line number not included, proceed to search for abbreviations
        // station database search to come later
        var lineNum = _.find(ttcLineAbbreviations, function(abbrs){
            return text.search(abbrs.abbr) > -1; 
        });
        var lineNumber = 0;
        if (lineNum){
            if (lineNum.line < 5){
                lineNumber = lineNum.line;
            } else {
                lineNumber = 5;
            }
        } else {
            // Get station list
            var stationList = stationInfo.retrieveStationListing(textForSearch);
            // search through station name database by passing station list
            lineNumber = stationInfo.retrieveLineNumber(stationList);
            lineNumbers.push(lineNumber);
        }
      }
      // Set subway line color style
      var subwayLineColorStyle = "";
      // Organize line numbers in ascending order, from 1 to 4
      lineNumbers = _.sortBy(lineNumbers, function(num){ return num * 1; });
      // Create line color style
      _.each(lineNumbers, function (item, index) {
        if (index > 0){
            subwayLineColorStyle += "-";
        }
        subwayLineColorStyle += ttcSubwayLines[item];
      });
      return {
            "name": subwayLineColorStyle,
            "lines": lineNumbers,
            "stations": stationList
        };
    },// End subway line identification
    getBus: function () {
        // bus route search regexp
        var findBus = /\d{1,3}[a-f]?\s+[a-zA-Z']+/g;
        // bus matches
        var busMatch = this.description.match(findBus);
        // Store the full text for additional searching
        var text = this.description;
        // Create an array to store the route numbers that are found
        var routesListing = [];
        // Go through possible routes
        _.each(busMatch, function (item, index) {
            // Get actual bus route number from match capture
            var routeNumberExp = /\d{1,3}/g;
            // Assign possible route to another variable
            var busMatchEntry = item;
            var numberMatched = busMatchEntry.match(routeNumberExp)[0];
            // compare bus route name to the pairing retrived before
            var routeName = busInfo.retrieveRouteName(numberMatched)
            // If single name, do a splitting operation and compare first word, otherwise add
            // entire alternate list for searching
            if (_.isString(routeName)){
                routeName = routeName.toLowerCase().split(" ")[0];
            }
            // Check to see if bus route is actually a bus route (sanity check)
            var searchArray = [routeName, "bus", "route"];
            // Create a tracker for counting matches
            var tracker = [];
            // flatten searchArray if routeName variable returned alternate spelling list instead
            // of single entry
            if (_.isArray(routeName)){
                searchArray = _.flatten(searchArray);
                // Lowercase all entries
                searchArray = _.map(searchArray, function(entry){
                    return entry.toLowerCase();
                });
                _.each(searchArray, function (item) {
                    var result = text.search(item);
                    // If there is a valid search term, add it to the tracker
                    if (result != -1){
                        tracker.push(result);
                    }
                });
            } else {
                _.each(searchArray, function (item) {
                    var result = busMatchEntry.search(item);
                    // If there is a valid search term, add it to the tracker
                    if (result != -1){
                        tracker.push(result);
                    }
                });
            }
            // If the tracker is greater than 0, there are matches
            if (tracker.length > 0){
                routesListing.push(numberMatched);
            }
        });
        /*
        Need to distinguish route listings when they
        appear in groups, such as the following:

        25,51,53 routes
        */
        // Old
        // var multipleRouteNoNames = /(\d{1,3}[,\s]*(\s)*)+routes/g;
        // updated to take "25 81 routes" into account
        // New
        var multipleRouteNoNames = /(\d{1,3}([,\s]|(&amp;))*(\s)*)+routes/g;
        var prefaceMulti = /routes\s(\d{1,3}(,*)\s)+(and)*((\s)*\d{1,3})/g;
        var searchMulti = this.description.search(multipleRouteNoNames);
        var searchPreface = this.description.search(prefaceMulti);
        if (searchMulti > -1 || searchPreface > -1){
            if (searchMulti > -1){
                searchMulti = this.description.match(multipleRouteNoNames);
                if (searchMulti.length != 0){
                    var additionalRoutes = searchMulti[0].match(/\d{1,3}/g);
                    var combined = _.union(additionalRoutes, routesListing);
                }
            } else {
                prefaceMulti = this.description.match(prefaceMulti);
                if (prefaceMulti.length != 0){
                    var additionalRoutes = prefaceMulti[0].match(/\d{1,3}/g);
                    var combined = _.union(additionalRoutes, routesListing);
                }
            }
            var returnArray = combined;
        } else {
            var returnArray = routesListing;
        }
        // Organize line numbers in ascending order
        returnArray = _.sortBy(returnArray, function(num){ return num * 1; });
        return returnArray;
    }, // End getBus method
    getDateTime: function () {
        // Get the month and day for display
        // 17-08-2016: need to adjust for momentJS deprecation
        /*
        > moment("2014-04-25T01:32:21.196Z");  // iso string, utc timezone
        > moment("2014-04-25T01:32:21.196+0600");  // iso string with timezone
        > moment("2014 04 25", "YYYY MM DD"); // string with format

        These are the only allowable formats now, must convert current format
        "Mon Aug 17 20:53:23 +0000 2015" to standard ISO
        */

        var today = moment();
        var todayFormatted = today.format("DD-MM-YYYY");
        var time = moment(this.time);
        var timeComparison = time.format("DD-MM-YYYY");
        // entry time in format for getting "from" in momentJS
        var entryTimeFrom = moment([time.year(),time.month(),time.date()]);
        // Get number of days between entry time and today
        var todayTimeFrom = moment([today.year(),today.month(),today.date()]);
        var difference = entryTimeFrom.diff(todayTimeFrom, 'days');
        var month = time.format("MMM");
        var day = time.format("DD");
        var formattedTimeOfDay = time.format("hh:mm A");

        return {
            "day": day,
            "month": month,
            "time": formattedTimeOfDay,
            "isBeforeToday": todayFormatted !== timeComparison,
            "difference": difference
        };
    },
    getIntersection: function () {
        // Format text
        var text = formatDescription(this.description);
        // List of terms to search for in intersections,
        // remove as invalid if present
        var messageBlacklist = [
            /(full)\s(service)/g,
            /(board)/g,
            /(longer\sthan\snormal)/g
        ];
        // List of intersection expressions
        // Looks for common patterns and parses the intersection
        var searches = {
            // Between intersection combination
            "between_and": /((between)|(btwn))\s[\w\s]+(and)\s[\w\s]+/g,
            // Handle "at" street "and" street reference
            "at_and": /(\s(at)\s[\w\s']+(and)\s[\w\s\'\,]+(and)*[\w\s\'\,]+)/g,
            // handle "on street near street" or "on street at street" combinations
            "on_at_near": /(\s(on)\s[\w\s]+((at\s)|(near\s))[\w\s]+)/g,
            // All clear combinations
            "has_cleared_reopened": /.+(clear:\s)[\w\s\.]+\s(has)\s(now\s)?((cleared)|(re-opened))/g,
            "is_clear": /.+(clear:\s)[\w\s\.]+\s(is\s)/g,
            // On and intersection combination
            "on_and": /(\s(on)\s[\w\s]+((and)|(&))[\w\s]+)/g,
            // Direction relative to intersection combination
            "direction_relative": /(due).+(on).+((south|north)|(east|west)).+/g,
            // Check for subway station reference as location of disruption
            "at_station": /(\s(at)\s[\w\.\s]+(?=\s((station))|(?=\s(stn))))/g,
            // Single "At" condition followed by "due"
            "at_due": /\s(at)\s[\w\s\'\,]+(and)?[\w\s\'\,]+(due)\s/g,
            // Intersection "at" street "and" street, end of alert
            "at_end_alert": /\s(at)\s[\w\s\.]+(?=.)/g
        };
        // Correct any tense errors
        // replace "known tense errors", such as "had" instead of "has"
        var tenseErrors = {
            "had cleared": "has cleared"
        };
        _.each(tenseErrors, function (replacement, original) {
            text = text.replace(original, replacement);
        });
        // entry storage
        var entry = "";
        // Store the search used
        var searchUsed = "";
        // Check for intersection patterns, stop at the first one that matches
        var search = _.find(searches, function(search, index){
            // Perform each search, stop at the one that is good
            var matching = text.match(search);
            if (matching){
                var matches = matching;
                entry = matches;
                searchUsed = index;
            } else {
                var matches = [];
            }
            return matches.length > 0;
        });
        // Data to return
        var returnArray = [];
        // Cross streets array
        var crossStreets = [];
        // Only used first match if present for now
        if (_.isArray(entry)){
            entry = entry[0];
        } else {
            entry = [];
        }
        // Processing conditions based on search returned
        if (searchUsed == "between_and"){
            // Handle alert on road between cross streets, between condition
            entry = entry.replace(/((between)|(btwn))\s/g, "");
            // Get cross streets by splitting at "and" or "&"
            if (entry.search(" and ") > -1){
                crossStreets = entry.split(" and ");
            }
            // return cross street array
            returnArray = crossStreets;
        } else if (searchUsed == "at_and" || searchUsed == "at_due" || searchUsed == "at_end_alert"){
            // Check for multiple "at" and select the second group is present
            var multipleAtCheck = entry.match(/\s(at)\s/g).length;
            if (multipleAtCheck > 1){
                entry = entry.split(" at ")[2];
            }
            // End multiple at condition
            // replace "at" with blank text
            entry = entry.replace(/\s(at)\s/g, "");
            // Get cross streets by splitting at "and" or "&"
            if (entry.search(" and ") > -1){
                crossStreets = entry.split(" and ");
            } else {
                // If there is no "and" for splitting, assume single entry
                crossStreets[0] = entry;
            }
            // return cross street array
            returnArray = crossStreets;
        } else if (searchUsed == "on_at_near") {
            // Handle "on" street condition, and periods
            entry = entry.replace(/\s(on)\s/g, "");
            if (entry.search(" near ") > -1){
                crossStreets = entry.split(" near ");
            } else {
                crossStreets = entry.split(" at "); 
            }
            returnArray = crossStreets;
        } else if (searchUsed == "has_cleared_reopened"){
            // handle all clear messages with intersections lacking "At" or "on"
            // preface
            entry = entry.replace(/.+(clear:\s)/g,"");
            if (entry.search(" and ") > -1){
                crossStreets = entry.split(" and ");
            } else {
                crossStreets[0] = entry;
            }
            returnArray = crossStreets;
        } else if (searchUsed == "is_clear"){
            // Clear for all clear, is now clear condition
            entry = entry.replace(/.+(clear:\s)/g,"");
            if (entry.search(" and ") > -1){
                crossStreets = entry.split(" and ");
            } else {
                crossStreets = entry.split(" at ");
            }
            returnArray = crossStreets;
        } else if (searchUsed == "on_and") {
            // handle intersections with "on" and "and"
            entry = entry.replace(/\s(on)\s/g, "");
            if (entry.search(" and ") > -1){
                crossStreets = entry.split(" and ");
            }
            returnArray = crossStreets;
        } else if (searchUsed == "direction_relative"){
            // Handle directional reference, i.e. broadview south of danforth
            // Intrepret to intersection, remove vaguness
            entry = entry.replace(/(due).+(on)\s/g, "");
            crossStreets = entry.split(/((north|south)|(east|west))(\sof\s)/g);
            // Get the first and last entry in the array corresponding to the actual streets
            returnArray = [_.first(crossStreets), _.last(crossStreets)];
        } else if (searchUsed == "at_station"){
            // Handle reference to disruption at a station
            var atSanityCheck = entry.match(/(\sat\s)/g);
            // If there are multiple at conditions, the station
            // will be the last entry in the array since it should come before
            // "station" text captured at end of regex
            if (atSanityCheck.length == 2){
                var entrySplitAt = entry.split(/\sat\s/g);
                entry = _.last(entrySplitAt);
            }
            returnArray = [entry];
        } else {
            returnArray = [];
        }
        // Remove punctuation and shuttle bus mentions
        var finalArray = [];
        // Also remove "due" or "has" condtions
        _.each(returnArray, function (item, index){
            var streetToEdit = item;
            streetToEdit = streetToEdit.replace(/[\.\,]+/g,"");
            streetToEdit = streetToEdit.replace(/(shuttle).+/g, "");
            // Go through cross streets and remove unnecessary text not referring to streets
            streetToEdit = streetToEdit.replace(/\s((has)|(is)).*/g, "");
            // Remove "at" and all text before
            streetToEdit = streetToEdit.replace(/.*(at\s)/g, "");
            // Remove "due" and everything after
            streetToEdit = streetToEdit.replace(/(\s(due)\s.*)/g, "");
            // handle presence of "full service has resumed" or "onboard streetcar"
            var excludeCheck = _.find(messageBlacklist, function(excludeItem){ 
                return streetToEdit.search(excludeItem) > -1; 
            });
            var excludeFlag = _.isUndefined(excludeCheck);
            if (excludeFlag){
                finalArray.push(streetToEdit);
            }
        });
        // handle blank situation
        if (finalArray.length == 0){
            finalArray = ["No Intersection Specified"];
        }
        return {
            "intersections": finalArray,
            "hasIntersections": finalArray.length > 1,
            "isSubwayLocation": searchUsed === "at_station"
        }
    },
    disruptionType: function () {
        // Disruption type reporting
        var text = formatDescription(this.description);
        // Track the disruption type
        var type = "";
        var disruptionTypes = {
            "police": ["tps", "security", "police", "unauthorized", "person at track level"],
            "fire": ["tfs", "fire", "smoke", "hazmat", "materials"],
            "vehicular": ["collision", "blocking", "auto"],
            "elevator": ["elevator"],
            "medical": ["medical", "personal injury"],
            "construction": ["construction", "repair", " track ", "upgrade"],
            "mechanical": ["mechanical", "stalled", "signal", "disabled", "switch", "power off"],
            "reroute": ["diverting", "divert", "bypassing"],
            "alarm": ["alarm"],
            "surface_stoppage": ["turning back"],
            "suspension": ["alternative", "suspended"],
            "resolved": ["clear", "all clear"],
            "delay": ["holding", "longer"],
            "increased": ["service increased", "increased"],
        };
        var icons = {
            "suspension": "stop",
            "police": "police",
            "elevator": "elevator",
            "fire": "fire",
            "mechanical": "cogs",
            "vehicular": "car",
            "construction": "wrench",
            "reroute": "level-up",
            "medical": "medkit",
            "delay": "clock-o",
            "alarm": "exclamation-triangle",
            "resolved": "thumbs-up",
            "surface_stoppage": "refresh",
            "increased": "plus-square",
            "other": "question"
        }
        // Two level find to get the key with the first match to search terms
        var search = _.find(disruptionTypes, function(category, index){
            // returns true for the first disruption array that contains a term match
            // to the twitter alert
            // - This is used to retrieve index or disruption type 
            return _.find(category, function(entry){
                if (text.search(entry) > -1){
                    type = index;
                } else {
                    type = "other";
                }
                // return true if the disruptuon type is found in the alert
                return text.search(entry) > -1; 
            }); 
        });
        var returnObj = {
            "icon": icons[type],
            "text": type,
            "custom": type === "police" || type === "elevator"
        };
        return returnObj;
    },
    formattedDescription: function () {
        // Format description
        return formatDescription(this.description);
    },
    direction: function () {
        // get text
        var text =  this.description;
        // report the direction of delay, convert into icon for readability
        var directions = {
            "both": [
                /(e\/b).+(w\/b)|(w\/b).+(e\/b)/g,
                /(n\/b).+(s\/b)|(s\/b).+(n\/b)/g,
                /(\seb\s).+(\swb\s)|(\swb\s).+(\seb\s)/g,
                /(\snb\s).+(\ssb\s)|(\ssb\s).+(\snb\s)/g,
                "both"
            ],
            "east": ["e/b", "eastbound"],
            "west": ["w/b", "westbound"],
            "north": ["n/b", "northbound", "norhtbound"],
            "south": ["s/b", "southbound"]
        };
        // Font awesome classes and letters
        var returnDict = {
            "north": {"text": "N","icon": "long-arrow-up"},
            "south": {"text": "S","icon": "long-arrow-down"},
            "east": {"text": "E","icon": "long-arrow-right"},
            "west": {"text": "W","icon": "long-arrow-left"},
            "both": {"text": "BD","icon": "exchange"}
        }
        // Storage for direction
        var directionName = "";
        var search = _.find(directions, function(dir, index){
            // returns true for the first array that contains a term match
            // to the direction
            // - this is used to retrive index (direction)
            return _.find(dir, function(entry){
                if (text.search(entry) > -1){
                    directionName = index;
                } else {
                    directionName = "other";
                }
                // return true if the direction is found in the alert
                return text.search(entry) > -1; 
            }); 
        });
        // Return direction letter and icon class
        if (directionName != "other"){
            return returnDict[directionName];
        } else {
            return {
                "icon": "",
                "text": ""
            }
        }
    }

  });
// End helpers
}