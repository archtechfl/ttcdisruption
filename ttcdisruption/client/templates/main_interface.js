  Template.ttcdisruption.helpers({
    // Owner is defined when the task is created, set to the user ID that created it
    isSubway: function () {
        // Track the presence of key terms
        var tracker = [];
        // Get the text
        var text = this.description;
        // Check for line
        var lineSearch = /(line)\s\d{1}/g;
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
        var streetcarCheck = text.search(/(5{1}\d{2})/);
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
        var streetcarNum = text.match(/(5{1}\d{2})/)[0];
        return streetcarNum;
    },
    // identify the subway line
    subwayLine: function () {
      // Line storage
      var ttcSubwayLines = {
        1: "Yonge-University-Spadina",
        2: "Bloor-Danforth",
        3: "Scarborough-RT",
        4: "Sheppard",
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
      return {
            "name": ttcSubwayLines[lineNumber],
            "number": lineNumber
        };
    },// End subway line identification
    getBus: function () {
        // bus route search regexp
        // OLD var findBus = /\d{1,3}[a-f]?\s(\w)+/g;
        var findBus = /\d{1,3}[a-f]?\s[a-zA-Z']+/g;
        // bus matches
        var busMatch = this.description.match(findBus);
        // Filter out minute entries
        // 17-08-2015: need to distinguish when entries appear with road names like "Highway 7"

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
        return routesListing;
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
    }

  });