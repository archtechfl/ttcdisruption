if (Meteor.isClient) {

function formatDescription (text) {
    var text = text;
    // Remove TTC mentions
    formattedText = text.replace(/(http)s?:\/\/.+/g, "");
    formattedText = formattedText.replace(/\#?\s?(ttc)\#?/g, "");
    // handle punctuation (' and &)
    formattedText = formattedText.replace("’","'")
    formattedText = formattedText.replace(/\s?&amp;\s?/g, " and ");
    // change saint (st.) to st
    formattedText = formattedText.replace(/(st\.)/g,"st");
    // change mount (mt.) to mt
    formattedText = formattedText.replace(/(mt\.)/g,"mt");
    // Correct any missing spaces around commas
    formattedText = formattedText.replace(/\,(?=[a-zA-z])/g,", ");
    // Spelling errors, correct them
    var spellingErrors = {
        "bwtn": "btwn",
        "srn": "stn",
        "queens park": "queen's park",
        "ratburn": "rathburn",
        "bessation": "bessarion"
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
            "street_level": "street level",
            "outside": "outside",
            "diversion_ended": "regular routing"
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
        // If there is a streetcar line number, results will be 0 or greater
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
        // Eliminate duplicate route numbers
        routeListing = _.uniq(routeListing);
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
      // Final station list
      var stationList = [];
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
        stationList = stationInfo.retrieveStationListing(textForSearch);
      } catch(err) {
        // Line number not included, proceed to search for abbreviations
        // station database search to come later
        var lineNum = _.find(ttcLineAbbreviations, function(abbrs){
            return textForSearch.search(abbrs.abbr) > -1; 
        });
        var lineNumber = 0;
        // If there is a matching abbreviation
        if (lineNum){
            if (lineNum.line < 5){
                lineNumber = lineNum.line;
            } else {
                lineNumber = 5;
            }
            stationList = stationInfo.retrieveStationListing(textForSearch);
            lineNumbers.push(lineNumber);
        } else {
            // If there is not a matching abbreviation, do station checking
            // Get station list
            stationList = stationInfo.retrieveStationListing(textForSearch);
            // search through station name database by passing station list
            lineNumber = stationInfo.retrieveLineNumber(stationList, textForSearch);
            lineNumbers.push(lineNumber);
        }
      }
      // Set subway line color style
      var subwayLineColorStyle = "";
      // Organize line numbers in ascending order, from 1 to 4
      lineNumbers = _.sortBy(lineNumbers, function(num){ return num * 1; });
      // Eliminate any duplicates
      lineNumbers = _.uniq(lineNumbers);
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
            var routeName = busInfo.retrieveRouteName(numberMatched);
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
        // Eliminate duplicate route numbers
        returnArray = _.uniq(returnArray);
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
            /(longer\sthan\snormal)/g,
            // Service time update
            /(\d{1}(\:?)\d{2}(am|pm))/g,
            /(streetcar)/g
        ];
        // List of intersection expressions
        // Looks for common patterns and parses the intersection
        var searches = {
            // Between intersection combination
            "between_and": /((between)|(btwn))\s[\w\s]+(and)\s[\w\s]+/g,
            // Handle "at" street "and" street reference
            "at_and": /(\s(at)\s[\w\s']+(and)\s[\w\s\'\,]+(and)*[\w\s\'\,]+)/g,
            // handle "on street near street" or "on street at street" combinations or "on-and"
            "on_at_near_and": /(\s(on)\s[\w\s]+(((at\s)|(near\s))|(and))[\w\s]+)/g,
            // Bypassing station
            "bypassing_station": /(\s(bypassing)\s.+(?=\s((station))|(?=\s(stn))))/g,
            // Check for subway station reference as location of disruption
            "at_station": /(\s(at)\s[\w\.\s]+(?=\s((station))|(?=\s(stn))))/g,
            // On and intersection combination
            "on_and": /(\s(on)\s[\w\s]+((and)|(&))[\w\s]+)/g,
            // Direction relative to intersection combination
            "direction_relative": /(due).+\s(on)\s.+((south|north)|(east|west)).+/g,
            // Single "At" condition followed by "due"
            "at_due": /\s(at)\s[\w\s\'\,]+(and)?[\w\s\'\,]+(due)\s/g,
            // Outside station
            "outside_from_station": /((outside)|(from))\s.+(?=\s((station))|(?=\s(stn)))/g,
            // All clear combinations
            "has_cleared_reopened": /.+(clear:\s)[\w\s\.]+\s(has)\s(now\s)?((cleared)|(re-opened))/g,
            "is_clear": /.+(clear:\s)[\w\s\.]+\s(is\s)/g,
            // Intersection "near"
            "near": /\s(at)\s[\w\s]+(near)\s[\w\s]+/g,
            // Intersection "at" street "and" street, end of alert
            "at_end_alert": /\s(at)\s[\w\s]+(?=.)/g,
            "direction_streets": /(bound)\s.+\s(due)\s/g
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
            } else if (entry.search(" near ") > -1) {
                crossStreets = entry.split(" near ");
            } else {
                // If there is no "and" or "near" for splitting, assume single entry
                crossStreets[0] = entry;
            }
            // return cross street array
            returnArray = crossStreets;
        } else if (searchUsed == "on_at_near_and") {
            // Handle "on" street condition, and periods
            entry = entry.replace(/\s(on)\s/g, "");
            if (entry.search(" near ") > -1){
                crossStreets = entry.split(" near ");
            } else if (entry.search(" and ") > -1) {
                crossStreets = entry.split(" and "); 
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
            entry = entry.replace(/(due).+\s(on)\s/g, "");
            crossStreets = entry.split(/((north|south)|(east|west))(\sof\s)/g);
            // Get the first and last entry in the array corresponding to the actual streets
            returnArray = [_.first(crossStreets), _.last(crossStreets)];
            console.log(returnArray);
        } else if (searchUsed == "at_station" || searchUsed == "bypassing_station"){
            if (searchUsed == "at_station"){
                // Handle reference to disruption at a station
                var atSanityCheck = entry.match(/(\sat\s)/g);
                // If there are multiple at conditions, the station
                // will be the last entry in the array since it should come before
                // "station" text captured at end of regex
                if (atSanityCheck.length == 2){
                    var entrySplitAt = entry.split(/\sat\s/g);
                    entry = _.last(entrySplitAt);
                }
            } else {
                entry = entry.replace(/\s?(bypassing)\s?/g,"");
            }
            returnArray = [entry];
        } else if (searchUsed == "near"){
            // Handle near reference
            if (entry.search(" due ") > -1){
                entry = entry.replace(/(due).+/g, "");
            }
            // Split at near
            entry = entry.split(/\s?(near)\s?/g);
            returnArray = [_.first(entry), _.last(entry)];
        } else if (searchUsed == "outside_from_station"){
            entry = entry.replace(/(outside)\s|(from)\s/g, "");
            returnArray = [entry];
        } else if (searchUsed == "direction_streets") {
            entry = entry.replace(/(bound)\s/g,"");
            if (entry.search(" and ") > -1){
                crossStreets = entry.split(" and ");
            }
            console.log(crossStreets);
            returnArray = crossStreets;
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
            streetToEdit = streetToEdit.replace(/\s((has)|(is)|(on))\s.*/g, "");
            // Remove "at" and all text before
            streetToEdit = streetToEdit.replace(/.*(\sat\s)/g, "");
            // Remove "due" and everything after
            streetToEdit = streetToEdit.replace(/(\s(due)\s.*)/g, "");
            // remove anything following "with"
            streetToEdit = streetToEdit.replace(/(\s(with)\s.*)/g, "");
            // Replace anything following blocking
            if (streetToEdit.search(/\s(blocking)\s/g) > -1) {
                streetToEdit = streetToEdit.replace(/\s(blocking)\s.+/g, "");
            }
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
            "isSubwayLocation": searchUsed === "at_station" || 
                searchUsed === "bypassing_station" ||
                searchUsed === "outside_from_station"
        }
    },
    disruptionType: function () {
        // Disruption type reporting
        var text = formatDescription(this.description);
        // Split at due if present, or at " for " if present
        var splitDue = text.search(" due ") > -1;
        var splitAlert = [];
        if (splitDue){
            splitAlert = text.split(" due ");
        } else if (text.search(" expect ") > -1) {
            splitAlert = text.split(" expect ");
        } else if (text.search(" no trains ") > -1){
            // Split for new divider, "no trains", 13-10-2015
            splitAlert = text.split(" no trains ");
        } else if (text.search(" for ") > -1){
            splitAlert = text.split(" for ");
        } else if (text.search(" during ") > -1){
            splitAlert = text.split(" during ");
        } else {
            splitAlert = [text];
        }
        // Track the disruption type
        var type = "";
        // Disruption regexes
        var disruptionRegexes = {
            "unauthorized track level": /[authorized]{4,10}\s(person\sat\strack\slevel)/g,
            "extended hours": /(running)\s(from)\s(\d{1}:\d{2}(am|pm)).+(\d{1}:\d{2}(am|pm))/g
        }
        var disruptionTypes = {
            "police": ["tps", "security", "police", disruptionRegexes["unauthorized track level"]],
            "fire": ["tfs", "fire", "smoke", "hazmat", "materials"],
            "vehicular": ["collision", "blocking", "auto"],
            "elevator": ["elevator"],
            "medical": ["medical", "personal injury"],
            "power": ["power off"],
            "construction": ["construction", "repair", " track ", "upgrade"],
            "mechanical": ["mechanical", "stalled", "signal", "disabled", "switch", "overhead"],
            "reroute": ["diverting", "divert", "bypassing"],
            "alarm": ["alarm"],
            "turning back": ["turning back", "turn back"],
            "suspension": ["alternative", "suspended", "no train", "closed", "no service"],
            "resolved": ["clear", "all clear"],
            "delay": ["holding", "longer"],
            "increased": [
                "service increased",
                "increased",
                disruptionRegexes["extended hours"],
                "supplementary"
            ],
            "shuttle": ["shuttle"]
        };
        var icons = {
            "suspension": "stop",
            "police": "police",
            "elevator": "elevator",
            "fire": "fire",
            "mechanical": "cogs",
            "power": "power-off",
            "vehicular": "car",
            "construction": "wrench",
            "reroute": "level-up",
            "medical": "medkit",
            "delay": "clock-o",
            "alarm": "exclamation-triangle",
            "resolved": "thumbs-up",
            "turning back": "refresh",
            "increased": "plus-square",
            "other": "question",
            "shuttle": "bus"
        }
        // Store all of the alert types
        var alertsStorage = [];
        // Search through each part of the alert for the disruptions
        _.each(splitAlert, function (alert, index) {
            // Two level find to get the key with the first match to search terms
            var searchSplit = _.find(disruptionTypes, function(category, index){
                // returns true for the first disruption array that contains a term match
                // to the twitter alert
                // - This is used to retrieve index or disruption type 
                return _.find(category, function(entry){
                    if (alert.search(entry) > -1){
                        var diversionRoute = "";
                        // Handle a reroute alert, get the reroute
                        if (index == "reroute"){
                            var diversion = alert.match(/\s(divert)(ed|ing)\s.+/g);
                            if (!_.isNull(diversion)){
                                diversion = diversion[0];
                                diversion = diversion.replace(/\s(divert)(ed|ing)\s/g, "");
                                diversion = diversion.replace(/\,\s/g,",");
                                diversionRoute = diversion;
                            }
                        }
                        alertsStorage.push({
                            "icon": icons[index],
                            "type": index,
                            "custom": index === "police" || index === "elevator",
                            "diversionRoute": diversionRoute
                        });
                    }
                    // return true if the disruptuon type is found in the alert
                    return alert.search(entry) > -1; 
                }); 
            });
        });
        // Create return object
        var returnObj = {
            "alerts": alertsStorage
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

// Event for showing alert drawer
Template.ttcdisruption.events({
    // UI events go here
    "click .toggle-description": function (event) {
        // get description container
        var descriptionContainer = $(event.currentTarget).parent('.description')[0];
        // get parent row
        var parentRow = $(descriptionContainer).parent()[0];
        // get tray status
        var getTrayStatus = $(parentRow).hasClass("drawerOpenDesc");
        // If drawer is open
        if (getTrayStatus){
            // Get current mobile description
            var mobileDescriptionCurrent = $(parentRow).find('.mobile-description')[0];
            var renderedAlert = Blaze.getView(mobileDescriptionCurrent);
            Blaze.remove(renderedAlert);
            $(parentRow).find('.mobile-ui-viz').toggle();
            // Transition arrow back
            $(parentRow).find('.toggle-description .fa-chevron-right').removeClass("fa-chevron-right").addClass("fa-chevron-left");
            $(parentRow).removeClass("drawerOpenDesc");
        } else {
            var formattedAlert = formatDescription(this.description);
            var renderedAlert = Blaze.renderWithData(
                Template.alert_drawer,
                {"description": formattedAlert},
                parentRow
            );
            $(parentRow).find('.mobile-ui-viz').toggle();
            // add drawerOpen class
            $(parentRow).addClass("drawerOpenDesc");
            // Change arrow from point left to pointing right to indicate
            // it closes in that direction
            $(parentRow).find('.toggle-description .fa-chevron-left').removeClass("fa-chevron-left").addClass("fa-chevron-right");
        }
    },
    "click .diversion-alert": function (event) {
        var diversionListing,
            parentRow,
            diversion,
            diversionListing,
            getTrayStatus,
            directionFlag;
        // Activate the diversion alert tray when diversion is clicked
        // get diversion listing
        diversionListing = $(event.currentTarget)[0];
        // Get parent row
        parentRow = $(diversionListing).parents(".disruption-entry")[0];
        // Get diversion
        diversion = $(diversionListing).data("diversion");
        // Check for direction indicators
        var directions = [
            "(e\/?b)",
            "(eastbound)",
            "(w\/?b)",
            "(westbound)",
            "(n\/?b)",
            "(northbound)",
            "(norhtbound)",
            "(s\/?b)",
            "(southbound)",
            "((both way)s?)",
            "(b\/?w)"
        ];
        // get tray status
        var getTrayStatus = $(parentRow).hasClass("drawerOpenDivert");
        // If drawer is open
        if (getTrayStatus){
            // Get current mobile description
            var diversionCurrent = $(parentRow).find('.diversion-drawer')[0];
            var renderedDiversion = Blaze.getView(diversionCurrent);
            Blaze.remove(renderedDiversion);
            $(parentRow).find('.mobile-ui-viz-divert').toggle();
            $(parentRow).removeClass("drawerOpenDivert");
            $(event.currentTarget).removeClass("active");
        } else {
            // If drawer is not open, perform all data operations
            // Store all direction flags found
            var dirs = _.filter(directions, function(entry){
                var exp = new RegExp(entry,"g");
                return diversion.search(exp) > -1;
            });
            // Remove "via" mentions
            diversion = diversion.replace(/\s?(via)\s?/g,"");
            // Direction flag, for determining rendering process
            directionFlag = false;
            // Remove direction if only one present
            if (dirs.length <= 1){
                if (dirs.length == 1){
                    var singleDirExp = new RegExp(dirs[0],"g");
                    diversion = diversion.replace(singleDirExp,"");
                    // Split the diversion data
                    diversionListing = diversion.split(",");
                    diversionListing = _.compact(diversionListing);
                    // End of single direction operation
                } else {
                    diversionListing = diversion.split(",");
                    diversionListing = _.compact(diversionListing);
                }
            } else {
                // Contruct a regExp for splitting, and split into direction groupings
                var newExpBase = "";
                _.each(dirs, function (exp, index){
                    newExpBase += exp;
                });
                newExpBase = newExpBase.replace(/\)\(/g,")|(");
                // Create new focused regular expression, string together all known
                // direction flags, split only on those
                var newExp = new RegExp(newExpBase,"g");
                // Perform direction split
                var diversionMoreOne = diversion.split(newExp);
                // Get rid of blank string and undefineds coming from split operation
                // after direction search
                diversionMoreOne = _.compact(diversionMoreOne);
                // Remove any "and" or other extra words
                // Compact each element at end to account for trailing commas
                diversionMoreOne = _.map(diversionMoreOne, function(entry){
                    entry = entry.replace(/(and)\s/g,"");
                    entry = entry.split(",");
                    entry = _.compact(entry);
                    return entry;
                });
                // Extra words have been removed
                // Store the diversions as objects with the direction and streets as properties
                var diversionHash = {};
                _.each(diversionMoreOne, function (street, index){
                    var checkIfDir = street[0].match(newExp);
                    if (checkIfDir && !_.has(diversionHash, checkIfDir[0])){
                        diversionHash[street] = {
                            "streets": diversionMoreOne[index + 1],
                            "direction": checkIfDir
                        }
                    }
                });
                directionFlag = true;
                // Take the objects in the diversion Hash and move them to an array
                // for rendering
                var diversionArray = [];
                _.each(diversionHash, function (item, index){
                    diversionArray.push(item);
                });
            }
            // Begin rendering
            var renderedDiversion = Blaze.renderWithData(
                Template.diversion_drawer,
                {
                    "diversions": diversionListing,
                    "multiDirection": directionFlag,
                    "multiDiversions": diversionArray
                },
                parentRow
            );
            $(parentRow).find('.mobile-ui-viz-divert').toggle();
            // add drawerOpen class
            $(parentRow).addClass("drawerOpenDivert");
            $(event.currentTarget).addClass("active");
        }
    }
});

}
