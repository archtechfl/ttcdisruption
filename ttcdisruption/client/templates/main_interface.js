function formatDescription (text) {
    var text = text;
    formattedText = text.replace(/http:\/\/.+/g, "");
    formattedText = formattedText.replace(/\#ttc/g, "");
    return formattedText;
};

Template.ttcdisruption.helpers({
    // Owner is defined when the task is created, set to the user ID that created it
    isSubway: function () {
        // Track the presence of key terms
        var tracker = [];
        // Get the text
        var text = this.description;
        // Check for line
        var lineSearch = /(line)\s?\d{1}/g;
        // Check for trains
        var trainsExp = "trains";
        // Check for station abbreviation
        var stationAbbr = "stn";
        // Check for station wording
        var stationFull = "station";
        // Check for elevator
        var elevatorTerm = "elevator";
        // Check for platform
        var platformTerm = "platform";
        // Search terms array
        var searchArray = [lineSearch, trainsExp, stationAbbr, stationFull, elevatorTerm, platformTerm];
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
        var streetcarCheck = text.search(/(5{1}\d{2})/g);
        // If there is a stretcar line number, results will be 0 or greater
        if (streetcarCheck != -1){
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
        1: "Yonge-University-Spadina",
        2: "Bloor-Danforth",
        3: "Scarborough-RT",
        4: "Sheppard",
        5: "no-line-provided"
      };
      // Check for the grouping of line and number, regex
      var searchTerms = /(line)\s?\d{1}/g;
      // Line number check
      var lineCheck = /\d{1}/g;
      // Get the desired text block with the line number, if line number is present
      try {
        var lineBlock = text.match(searchTerms)[0];
        // Get the actual line number, and make sure it is registered as a number
        var lineNumber = Number(lineBlock.match(lineCheck)[0]);
      } catch(err) {
        // Line number not included, proceed to search through station databases
        var stationLookup = stationInfo.retrieveLineNumber(text);
        var lineNumber = stationLookup;
      }
      return {
            "name": ttcSubwayLines[lineNumber],
            "number": lineNumber
        };
    },// End subway line identification
    getBus: function () {
        // bus route search regexp
        var findBus = /\d{1,3}[a-f]?\s[a-zA-Z']+/g;
        // bus matches
        var busMatch = this.description.match(findBus);
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
            var routeName = busInfo.retrieveRouteName(numberMatched).toLowerCase().split(" ")[0];
            // Check to see if bus route is actually a bus route (sanity check)
            var searchArray = [routeName, "bus", "route"];
            // Check the text for either search term that might indicate subway
            var tracker = [];
            _.each(searchArray, function (item) {
                var result = busMatchEntry.search(item);
                // If there is a valid search term, add it to the tracker
                if (result != -1){
                    tracker.push(result);
                }
            });
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
        var multipleRouteNoNames = /(\d{1,3}(,*)(\s)*)+routes/g;
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
            return combined;
        } else {
            return routesListing;
        }
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

        DONE - 19 August 2015

        */
        var time = moment(this.time);
        var month = time.format("MMM");
        var day = time.format("DD");
        var formattedTimeOfDay = time.format("hh:mm A");

        return {
            "day": day,
            "month": month,
            "time": formattedTimeOfDay
        };
    },
    getIntersection: function () {
        // Get intersection method
        // Looks for common patterns and parses the intersection
        var intersectionExpA = /((at)\s\w+\s(and)\s\w+)/g;
        // Get text and search
        var text = this.description;
        var intersection = text.match(intersectionExpA);
        if (intersection){
            var entry = intersection[0];
            entry = entry.replace("at ", "");
            entry = entry.replace("and ", "");
            var crossStreets = entry.split(" ");
            return crossStreets;
        }
    },
    disruptionType: function () {
        // Disruption type reporting
        var text = formatDescription(this.description);
        // Track the disruption type
        var type = "";
        var disruptionTypes = {
            "police": ["tps", "security", "police", "unauthorized"],
            "fire": ["tfs", "fire", "smoke", "hazmat", "materials"],
            "mechanical": ["mechanical", "stalled", "broken", "signal", "disabled"],
            "automobile": ["collision", "blocking", "auto"],
            "construction": ["construction", "repairs", "track"],
            "reroute": ["turning", "diverting"],
            "medical": ["medical"],
            "alarm": ["alarm"],
            "resolved": ["clear"]
        };
        var icons = {
            "police": "police",
            "fire": "fire",
            "mechanical": "cogs",
            "automobile": "car",
            "construction": "wrench",
            "reroute": "long-arrow-right",
            "medical": "medkit",
            "alarm": "exclamation-triangle",
            "resolved": "thumbs-up",
            "other": "question"
        }
        var search = _.find(disruptionTypes, function(category, index){ 
            return _.find(category, function(entry){
                if (text.search(entry) > -1){
                    type = index;
                } else {
                    type = "other";
                }
                return text.search(entry) > -1; 
            }); 
        });
        var returnObj = {
            "icon": icons[type],
            "text": type,
            "police": type === "police"
        };
        return returnObj;
    },
    formattedDescription: function () {
        // Format description
        return formatDescription(this.description);
    }

  });