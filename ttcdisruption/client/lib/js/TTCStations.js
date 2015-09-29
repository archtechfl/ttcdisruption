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
    this.stationList = {
        1: lineOne,
        2: lineTwo,
        3: lineThree,
        4: lineFour
    };
    // Any non-standard occurences of interchange station names need to be
    // matched with their standardized equivalent
    this.interchangeStations = {
        "Sheppard-Yonge": [
            "sheppard",
            "yonge sheppard",
            "sheppard yonge",
            "yonge and sheppard",
            "sheppard and yonge"
        ],
        "Bloor-Yonge": [
            "yonge and bloor",
            "bloor and yonge",
            "bloor yonge",
            "yonge bloor"
        ]
    };
};

StationLibrary.prototype.interchangeLookup = function (name) {
    var self = this;
    // get name
    var originalStationName = name;
    // Standardize interchange station names
    // Get the formatted station name
    // Create a holder for station name
    var formattedName = "";
    var search = _.find(self.interchangeStations, function (standardStation, index){
        // returns true for the first station array that contains a name match
        return _.find(standardStation, function(station){
            if (name.search(station) > -1){
                formattedName = index;
            } else {
                // Return original station name if there is no match
                formattedName = originalStationName;
            }
            // return true if the station name is found in the station array
            return name.search(station) > -1; 
        }); 
    });
    return {
        "name": formattedName,
        "hasChanged": formattedName !== originalStationName
    }
};

StationLibrary.prototype.compileDictionary = function() {
    this.stationLineListing = [];
    var self = this;
    _.each(this.stationList, function (lineList, index) {
        _.each(lineList, function (item, subindex) {
            self.stationLineListing.push({"line": index, "name": item.toLowerCase()});
        });
    });
};

StationLibrary.prototype.retrieveStationListing = function(alert) {
    var self = this;
    var searches = {
        "clear": /.+(clear:\s)[\w\s\.]+((station)|(stn))?(has|is)/g,
        "elevator": /(elevator\salert:)\s?.+((station)|(stn))/g,
        "at_station": /((at)\s[\w\.\s]+(?=\s((station))|(?=\s(stn))))/g,
        "at_station_due": /((at)\s[\w\.\s]+(?=\sdue))/g,
        "at_station_line": /((at)\s[\w\.\s\,]+(?=\sdue))/g,
        "between": /(((between)|(btwn))\s[\w\s\.]+)(?=\s((station))|(?=\s(stn)))/g,
        "between_no_station_wording": /((between)|(btwn))\s[\w\s]+(?=\.)/g,
        "between_due": /((between)|(btwn))\s[\w\s\,]+(due)/g,
        "bypassing": /(bypassing\s).+((station|stn))/g,
        "between_stations_dash": /(operating\s)[\w]+(-)[\w]+/g,
        "near_station": /(near)\s.+(stn|station)/g,
        "line_stations_direction_commas": /(line)\s\d{1},?.+(?=,)/g,
        "from_for": /(from).+(for)/g,
        "from_stn": /(from).+((station)|(stn))/g,
        "from": /(from\s).+(due)/g
    };
    // Alert text
    var text = alert + ".";
    // Get result
    var result = [];
    var matchingSearch = "";
    // The search being used, to be stored later in this var
    var searchUsed = "";
    var search = _.find(searches, function(search, index){
        // Determines which search to use based on results
        var matching = text.match(search);
        if (matching){
            var matches = matching;
            result = matches;
            searchUsed = index;
        } else {
            var matches = [];
        }
        matchingSearch = index;
        return matches.length > 0;
    });
    if (result.length == 0){
        result = ["None specified"];
    }
    // Sanity check, then split if there is a reason
    if (result.length > 0){
        if (result[0].search(" due ") > -1){
            result = result[0].split(" due ");
        }
    }
    // Remove at and between
    // Additional processing needed 
    _.each(result, function (item, index){
        var initialText = item;
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
        if (matchingSearch === "elevator"){
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
        if (searchUsed == "line_stations_direction_commas"){
            // Remove "Line 1, " instances
            edited = edited.replace(/(line)\s\d{1},\s/g,"");
            // Remove SRT instances, ex "Line 3 (SRT) "
            edited = edited.replace(/(line)\s\d{1},?.+\)\s/g, "");
            // Remove any information trailing second comma 
            edited = edited.replace(/,\s.+/g,"");
            // Remove direction if it comes before station names
            if (edited.search(/.+(bound)/g) > -1){
                edited = edited.replace(/.+(bound)/g,"");
            }
        } 
        if (searchUsed == "clear"){
            // Remove everything after station names
            edited = edited.replace(/\s(has).*/g,"");
            // This step is required because of islington station name
            edited = edited.replace(/\s(is).*/g,"");
            // handle "have" occurences
            edited = edited.replace(/\s?(have).*/g,"");
            // Remove everything before delay and certain words after
            console.log(edited);
            edited = edited.replace(/.+(delay)\s?(on|near)?\s?/g,"");
        }  
        // Remove SRT (Scarborough RT) reference if present
        if (edited.search(/\s(srt)/g) > -1){
            edited = edited.replace(/\s(srt)/g,"");
        } 
        // Remove punctuation
        edited = edited.replace(/(\.|\,)/g,"");
        // Check for interchange stations at this stage
        var interchange = self.interchangeLookup(edited);
        if (interchange.hasChanged){
            result[index] = interchange.name;
        } else {
            // Perform regular splitting operations to obtains stations
            // if no interchange found
            if (edited.search(" to ") > -1){
                edited = edited.split(" to ");
                result[index] = edited;
            } else if (edited.search(" and ") > -1){
                // Check for interchange stations at this stage
                edited = edited.split(" and ");
                result[index] = edited;
            } else if (edited.search("-") > -1){
                edited = edited.split("-");
                result[index] = edited;
            } else {
                result[index] = edited;
            }
        }
    });
    var returnArray = _.flatten(result);
    return returnArray;
};

StationLibrary.prototype.retrieveLineNumber = function(stations) {
    var self = this;
    var searchLineArray = [];
    _.each(stations, function (item, index){
        searchLineArray.push(_.where(self.stationLineListing, {name: item}));
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
            return maxLine[0].line;
        } else {
            return 5;
        }
    }
};

stationInfo = new StationLibrary();
stationInfo.compileDictionary();