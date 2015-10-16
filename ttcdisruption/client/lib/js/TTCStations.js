function StationLibrary () {
    var lineOne = [
        "Downsview",
        "Wilson",
        "Yorkdale",
        "Lawrence West",
        "Glencairn",
        "Eglinton West",
        "St Clair West",
        "Dupont",
        "Spadina",
        "St George",
        "Museum",
        "Queen's Park",
        "St Patrick",
        "Osgoode",
        "St Andrew",
        "Union",
        "King",
        "Queen",
        "Dundas",
        "College",
        "Wellesley",
        "Bloor-Yonge",
        "Rosedale",
        "Summerhill",
        "St Clair",
        "Davisville",
        "Eglinton",
        "Lawrence",
        "York Mills",
        "Sheppard-Yonge",
        "North York Centre",
        "Finch"
    ];
    var lineTwo = [
        "Kipling",
        "Islington",
        "Royal York",
        "Old Mill",
        "Jane",
        "Runnymede",
        "High Park",
        "Keele",
        "Dundas West",
        "Lansdowne",
        "Dufferin",
        "Ossington",
        "Christie",
        "Bathurst",
        "Spadina",
        "St George",
        "Bay",
        "Bloor-Yonge",
        "Sherbourne",
        "Castle Frank",
        "Broadview",
        "Chester",
        "Pape",
        "Donlands",
        "Greenwood",
        "Coxwell",
        "Woodbine",
        "Main Street",
        "Victoria Park",
        "Warden",
        "Kennedy"
    ];
    var lineThree = [
        "Kennedy",
        "Lawrence East",
        "Ellesmere",
        "Midland",
        "Scarborough Centre",
        "McCowan"
    ];
    var lineFour = [
        "Sheppard-Yonge",
        "Bayview",
        "Bessarion",
        "Leslie",
        "Don Mills"
    ];
    var lineTwoAlternate = [
        "Main"
    ];
    this.stationList = {
        1: lineOne,
        2: lineTwo,
        3: lineThree,
        4: lineFour
    };
    this.alternateStationList = {
        2: lineTwoAlternate
    }
    // Any non-standard occurences of interchange station names need to be
    // matched with their standardized equivalent
    this.interchangeStations = {
        "sheppard-yonge": [
            "yonge sheppard",
            "yonge-sheppard",
            "sheppard yonge",
            "sheppard-yonge",
            "yonge and sheppard",
            "sheppard and yonge",
            /\s?(sheppard)\s?/g
        ],
        "bloor-yonge": [
            "yonge and bloor",
            "bloor and yonge",
            "bloor yonge",
            "yonge bloor",
            "bloor",
            /(yonge)(?!\suniversity)/g
        ]
    };
};

StationLibrary.prototype.interchangeLookup = function (name) {
    var self = this;
    // get text
    var originalText = name;
    // Original station name
    var originalName = "";
    // Standardize interchange station names
    // Get the formatted station name
    // Create a holder for station name
    var formattedName = "";
    // track hasChanged
    var hasChanged = false;
    var search = _.find(self.interchangeStations, function (standardStation, index){
        // returns true for the first station array that contains a name match
        return _.find(standardStation, function(station){
            if (originalText.search(station) > -1){
                formattedName = index;
                originalName = station;
                hasChanged = true;
            }
            // return true if the station name is found in the station array
            return originalText.search(station) > -1; 
        }); 
    });
    return {
        "revisedInterchange": formattedName,
        "originalInterchange": originalName,
        "hasChanged": hasChanged
    }
};

StationLibrary.prototype.compileDictionary = function() {
    this.stationLineListing = [];
    this.stationWordPlusListing = [];
    var self = this;
    // Go through main station list (spellings from website)
    _.each(this.stationList, function (lineList, index) {
        _.each(lineList, function (item, subindex) {
            self.stationLineListing.push({"line": index, "name": item.toLowerCase()});
            var longNames = item.match(/\s/g);
            if (longNames){
                if (longNames.length > 0){
                    self.stationWordPlusListing.push(item.toLowerCase());
                }
            }
        });
    });
    // Go through alternate list
    _.each(this.alternateStationList, function (lineList, index) {
        _.each(lineList, function (item, subindex) {
            self.stationLineListing.push({"line": index, "name": item.toLowerCase()});
            var longNames = item.match(/\s/g);
            if (longNames){
                if (longNames.length > 0){
                    self.stationWordPlusListing.push(item.toLowerCase());
                }
            }
        });
    });
};

StationLibrary.prototype.retrieveStationListing = function(alert) {
    var self = this;
    // station search patterns to try
    var stationSearches = {
        "elevator": /(elevator\salert:)\s?.+((station)|(stn))/g,
        "between": /(((between)|(btwn))\s[\w\s\-\']+)(?=\s((station))|(?=\s(stn)))/g,
        "between_no_station_wording": /((between)|(btwn))\s[\w\s\-\']+(?=\.)/g,
        "between_due": /((between)|(btwn))\s[\w\s\,\-\']+/g,
        "between_abbr_bw": /((b\/w)\s[\w\s\-\']+)(?=\s((station))|(?=\s(stn)))/g,
        "at_station": /((at)\s[\w\s\-\']+(?=\s((station))|(?=\s(stn))))/g,
        "at_station_line": /((at)\s[\w\s\-\']+\,)/g,
        "line_comma_stations": /((line)\s\d{1}\,)\s?.+(?=\s((station))|(?=\s(stn)))/g,
        "bypassing": /(bypassing\s).+((station|stn))/g,
        "between_stations_dash": /(operating\s)[\w]+(-)[\w]+/g,
        "near_station": /(near)\s.+(stn|station)/g,
        "line_comma_stations_comma": /(line)\s\d{1},?.+(?=,)/g,
        "from_for": /(from).+(for)/g,
        "from_stn": /(from).+((station)|(stn))/g,
        "from": /(from\s).+/g,
        "abbr_stations": /(\)\s).+(?=\s((station))|(?=\s(stn)))/g,
        "clear": /.+(clear:\s)[\w\s\-]+((station)|(stn))?((has)|(is)|(are))/g,
        "delay_cleared": /(delay)\s.+(cleared)/g,
        "at_station_period": /((at)\s[\w\s\-\']+(?=\.))/g
    };
    // Alert text
    var text = alert;
    // Get result
    var result = [];
    // The search being used, to be stored later in this var
    var searchUsed = "";
    // Split at due if present, or at " for " if present
    var splitDue = text.search(" due ") > -1;
    // Storage for split alert
    var splitAlert = [];
    if (splitDue){
        splitAlert = text.split(" due ");
    } else if (text.search("expect") > -1) {
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
    // Go through each part of the alert and find stations
    var stationSearchResult = [];
    _.each(splitAlert, function (alert, index) {
        var searchAll = _.find(stationSearches, function(search, index){
            // Determines which search to use based on results
            var addPeriodsEnd = alert + ".";
            var matching = addPeriodsEnd.match(search);
            if (matching){
                var matches = matching;
                // Process matches and remove an extraneous information
                // not related to station names
                // remove as invalid if present
                var messageBlacklist = [
                    // Service time update
                    /(\d{1}:\d{2}(am|pm))/g,
                    /(track level)/g
                ];
                // Reject
                matches = _.reject(matches, function(entry){
                    var test = _.find(messageBlacklist, function (item, index) {
                        return entry.search(item) > -1;
                    });
                    return _.isUndefined(test) == false;
                });
                var matchesProcessed = [];
                if (matches.length > 0){
                    matchesProcessed = self.stationIsolate(matches[0], index);
                    if (matchesProcessed.length > 0){
                        stationSearchResult.push(matchesProcessed);
                    } 
                }
            } else {
                var matches = [];
            }
            return matches.length > 0;
        });
    });
    if (stationSearchResult.length == 0){
        result = ["None specified"];
    } else {
        result = stationSearchResult;
    }
    var returnArray = _.flatten(result);
    // Ensure all entries are unique since some station names are repeated
    var duplicateFreeReturn = _.uniq(returnArray);
    return duplicateFreeReturn;
};

StationLibrary.prototype.stationIsolate = function(entry, search_used) {
    // Store reference to class instance
    var self = this;
    // Get result
    var result = [];
    // The search being used, to be stored later in this var
    var searchUsed = search_used;
    // Store the initial text
    var initialText = entry;
    // replace anything before "at", irrelevant
    edited = initialText.replace(/(.+(at)\s)|(at\s)/g,"");
    edited = edited.replace(/((between\s)|(btwn\s))/g,"");
    // remove "from" and "due"
    edited = edited.replace(/(\s?from\s?)|(\s?due\s?)/g,"");
    // Remove station, stations, stn or stns
    edited = edited.replace(/((\sstn)s?|(\sstation)s?)/g,"");
    // remove bypassing language
    edited = edited.replace("bypassing ","");
    // Remove "all clear text"
    edited = edited.replace(/.+(clear:\s)/g,"");
    // Remove colon for elevator alert
    if (searchUsed === "elevator"){
        edited = edited.replace(/.+:\s/g,""); 
    }
    // handle comma and line number reference
    if (searchUsed == "at_station_line"){
        edited = edited.replace(/\,.+/g,""); 
    }
    // handle station name range with dash
    if (searchUsed == "between_stations_dash"){
        edited = edited.replace(/(operating\s)/g,""); 
    }
    // handle station with between b/w abbreviation
    if (searchUsed == "between_abbr_bw"){
        edited = edited.replace(/(b\/w)\s/g,""); 
    }
    // handle station name near reference
    if (searchUsed == "near_station"){
        edited = edited.replace(/(near\s)/g,""); 
    }
    // handle station from -- for reference
    if (searchUsed == "from_for"){
        edited = edited.replace(/(\sfor)/g,""); 
    }
    // handle line followed by station reference, commas
    // ex line 2, woodbine to warden, eastbound
    if (searchUsed == "line_comma_stations_comma" || searchUsed == "line_comma_stations"){
        // Remove "Line 1, " instances, take into account punctuation errors
        // ex. "line 2. jane to" vs "line 2, jane to"
        edited = edited.replace(/(line)\s\d{1}(\,|\.)\s/g,"");
        // Remove SRT instances, ex "Line 3 (SRT) "
        edited = edited.replace(/(line)\s\d{1},?.+\)\s/g, "");
        // Remove any information trailing second comma 
        edited = edited.replace(/,\s.+/g,"");
        // Remove direction if it comes before station names
        if (edited.search(/.+(bound)/g) > -1){
            edited = edited.replace(/.+(bound)/g,"");
        }
    } 
    if (searchUsed == "clear" || searchUsed == "delay_cleared"){
        // Remove everything after station names, either has, is or are
        edited = edited.replace(/\s(has)\s.*/g,"");
        // This step is required because of islington station name
        edited = edited.replace(/\s(is)\s.*/g,"");
        // handle "have" occurences
        edited = edited.replace(/\s?(have).*/g,"");
        // handle "are" occurences
        edited = edited.replace(/(\s?are).*/g,"");
        if (searchUsed == "clear"){
            // Remove everything before delay and certain words after
            edited = edited.replace(/.+(delay)\s?(on|near)?\s?/g,"");
        } else {
            edited = edited.replace(/(delay)\s?/g,"");
            edited = edited.replace(/\s?(at)\s/g,"");
        }
    }  
    // Remove SRT (Scarborough RT) reference if present
    if (edited.search(/\s(srt)/g) > -1){
        edited = edited.replace(/\s(srt)/g,"");
    }
    if (searchUsed == "abbr_stations"){
        edited = edited.replace(/(\)\s?)/g,"");
    }
    // Remove punctuation
    edited = edited.replace(/(\.|\,)/g,"");
    // Check for interchange stations at this stage
    var interchange = self.interchangeLookup(edited);
    // Change station names and replace with interchange names if present
    if (interchange.hasChanged){
        edited = edited.replace(interchange.originalInterchange, interchange.revisedInterchange);
    }
    if (edited.search(/\s(and)[a-zA-z]/g) > -1){
        edited = edited.replace(/\s(and)[a-zA-z]/g, " and ");
    }
    // Result to return
    var toReturn = [];
    // Perform regular splitting operations to obtains stations
    if (edited.search(" to ") > -1){
        edited = edited.split(" to ");
        toReturn = edited;
    } else if (edited.search(" and ") > -1){
        // Check for interchange stations at this stage
        edited = edited.split(" and ");
        toReturn = edited;
    } else if (edited.search("-") > -1 && !interchange.hasChanged){
        // IMPORTANT: may need to update with additional logic
        edited = edited.split("-");
        toReturn = edited;
    } else {
        toReturn = edited;
    }
    if (!_.isArray(toReturn)){
        toReturn = [toReturn];
    }
    // Handle removing any additional unnecessary text after station names
    _.each(toReturn, function (station, index) {
        var modify = _.find(self.stationWordPlusListing, function(entry){
            return station.search(entry) > -1;
        });
        if (_.isUndefined(modify)){
            var stationCheck = _.find(self.stationLineListing, function(entry){
                return station.search(entry.name) > -1;
            });
            if (!_.isUndefined(stationCheck)){
                toReturn[index] = stationCheck.name; 
            } else {
                // toReturn[index] = "General Notice: All Stations";
            }
        } else {
            toReturn[index] = modify;
        }
    });
    // Return the stations
    return toReturn;
};

StationLibrary.prototype.retrieveLineNumber = function(stations, description) {
    var self = this;
    var searchLineArray = [];
    _.each(stations, function (item, index){
        // Standardize station name, removing punctuation
        searchLineArray.push(_.where(self.stationLineListing, {name: item.toLowerCase()}));
    });
    searchLineArray = _.flatten(searchLineArray);
    var linesGrouping = _.groupBy(searchLineArray, 'line');
    if (searchLineArray.length === 1){
        return searchLineArray[0].line;
    } else {
        if (!_.isEmpty(linesGrouping)){
            var maxLine = _.max(linesGrouping, function(group){
                return group.length;
            });
            if (maxLine[0].name == "bloor-yonge" && maxLine.length == 1){
                var directions = {
                    "east/west": ["e/b", "eastbound", "w/b", "westbound"],
                    "north/south": ["n/b", "northbound", "norhtbound", "s/b", "southbound"]
                };
                // Storage for direction
                var directionName = "";
                var search = _.find(directions, function(dir, index){
                    // returns true for the first array that contains a term match
                    // to the direction
                    // - this is used to retrive index (direction)
                    return _.find(dir, function(entry){
                        if (description.search(entry) > -1){
                            directionName = index;
                        } else {
                            directionName = "other";
                        }
                        // return true if the direction is found in the alert
                        return description.search(entry) > -1; 
                    }); 
                });
                if (directionName == "east/west"){
                    return 2;
                } else {
                    return 1;
                }
            } else {
                return maxLine[0].line;
            }
        } else {
            return 5;
        }
    }
};

stationInfo = new StationLibrary();
stationInfo.compileDictionary();