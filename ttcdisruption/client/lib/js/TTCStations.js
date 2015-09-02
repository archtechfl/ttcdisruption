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

StationLibrary.prototype.retrieveLineNumber = function(alert) {
    var textToSearch = alert.toLowerCase();
    var matches = [];
    _.each(this.stationList, function (lineList, index) {
        _.each(lineList, function (item, subindex) {
            var stationName = item.toLowerCase();
            var stationResult = textToSearch.search(stationName);
            if (stationResult != -1){
                // Match
                matches.push({stationName: stationName, line: index});
            }
        });
    });
    // if there is one match, that is the line
    var lengthMatches = matches.length;
    if (lengthMatches === 1){
        return matches[0].line;
    } else {
        return 5;
    }
};

stationInfo = new StationLibrary();