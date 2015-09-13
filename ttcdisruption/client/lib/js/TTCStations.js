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
        "elevator": /(elevator\salert:)\s?.+((station)|(stn))/g,
        "at_station": /((at)\s[\w\.\s]+(?=\s((station))|(?=\s(stn))))/g,
        "at_station_due": /((at)\s[\w\.\s]+(?=\sdue))/g,
        "between": /((between)\s[\w\s\.]+)(?=\s((station))|(?=\s(stn)))/g,
        "between_no_station_wording": /(between)\s[\w\s]+(?=\.)/g,
        "from": /(from\s).+(due)/g
    };
    // Alert text
    var text = alert + ".";
    // Get result
    var result = [];
    var matchingSearch = "";
    var search = _.find(searches, function(search, index){
        // Determines which search to use based on results
        var matching = text.match(search);
        if (matching){
            var matches = matching;
            result = matches;
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
        edited = edited.replace("between ","");
        // remove "from" and "due"
        edited = edited.replace(/(\s?from\s?)|(\s?due\s?)/g,"");
        // Remove station, stations, stn or stns
        edited = edited.replace(/((\sstn)s?|(\sstation)s?)/g,"");
        if (matchingSearch === "elevator"){
            edited = edited.replace(/.+:\s/g,""); 
        }
        // Remove periods
        edited = edited.replace(/\./g,"");
        if (edited.search(" to ") > -1){
            edited = edited.split(" to ");
            result[index] = edited;
        } else if (edited.search(" and ") > -1){
            edited = edited.split(" and ");
            result[index] = edited;
        } else {
            result[index] = edited;
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