function BusRoutesLibrary () {
    this.standard_routes = {
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
      this.night_routes = {
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
    this.community_routes = {
        400: "Lawrence Manor",
        402: "Parkdale",
        403: "South Don Mills",
        404: "East York",
        405: "Etobicoke",
        406: "Venue Shuttle Downtown",
        407: "Toronto Rehab Cardiac Centre",
        408: "Venue Shuttle East"
      };
    this.downtown_exp_routes = {
        141: "Downtown / Mt Pleasant Express",
        142: "Downtown / Avenue Rd Express",
        143: "Downtown / Beach Express",
        144: "Downtown / Don Valley Express",
        145: "Downtown / Humber Bay Express"
      };
    this.masterList = {
        "standard_routes": this.standard_routes,
        "night_routes": this.night_routes,
        "community_routes": this.community_routes,
        "downtown_exp_routes": this.downtown_exp_routes
    };
    this.createIndexes();
};

BusRoutesLibrary.prototype.createIndexes = function() {
    // Create simple index arrays for determining if route is valid
    var self = this;
    self.indexes = {
        "standard_routes": [],
        "night_routes": [],
        "community_routes": [],
        "downtown_exp_routes": []
    };
    _.each(self.masterList, function (sublist, index) {
        _.each(sublist, function (item, subindex) {
            self.indexes[index].push(Number(subindex));
        });
    });
};

BusRoutesLibrary.prototype.retrieveRouteName = function(routeNumber) {
    var self = this;
    var route = Number(routeNumber);
    if (route >= 400){
        var checkIndex = _.contains(self.indexes["community_routes"], route);
        // Community route
        if (checkIndex){
            return this.community_routes[route];
        } else {
            return "invalid";
        }
    } else if (route >= 300 && route < 400){
        // Night route
        var checkIndex = _.contains(self.indexes["night_routes"], route);
        // Community route
        if (checkIndex){
            return this.night_routes[route];
        } else {
            return "invalid";
        }
    } else if (route > 140 && route < 146){
        // Downtown express
        var checkIndex = _.contains(self.indexes["downtown_exp_routes"], route);
        // Community route
        if (checkIndex){
            return this.downtown_exp_routes[route];
        } else {
            return "invalid";
        }
    } else {
        // Regular routes
        var checkIndex = _.contains(self.indexes["standard_routes"], route);
        // Community route
        if (checkIndex){
            return this.standard_routes[route];
        } else {
            return "invalid";
        }
    }
};

busInfo = new BusRoutesLibrary();