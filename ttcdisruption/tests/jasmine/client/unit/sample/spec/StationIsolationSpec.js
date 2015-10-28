describe('verify correct stations are being returned by parser', function() {
    beforeEach(function() {
    });

    it('returns midland-kennedy-mccowan', function() {
      var expectedResult = [
        'midland',
        'kennedy',
        'mccowan'
      ];
      var alert = "service suspension both ways at midland station due to a power off situation at track level. no trains between kennedy and mccowan stns."
      expect(stationInfo.retrieveStationListing(alert)).toEqual(expectedResult);
    });

    it('returns greenwood-kennedy-victoria park', function() {
      var expectedResult = ["greenwood", "kennedy", "victoria park"];
      var alert = "service suspended btwn greenwood and" + 
        " kennedy stns due to injury at track level at victoria" +
        " park stn. shuttle buses from greenwood to kennedy.";
      expect(stationInfo.retrieveStationListing(alert)).toEqual(expectedResult);
    });

    it('returns greenwood-victoria_park', function() {
      var expectedResult = ["greenwood", "victoria park"];
      var alert = "trains turning back at greenwood stn due to a personal " + 
      "injury at track level at victoria park station. shuttle buses operating.";
      expect(stationInfo.retrieveStationListing(alert)).toEqual(expectedResult);
    });

    it('returns st_george-chester-sherbourne', function() {
      var expectedResult = ["st george", "chester", "sherbourne"];
      var alert = "trains turning back on line 2(bd) at st george and chester stns due to a fire investigation at sherbourne station.";
      expect(stationInfo.retrieveStationListing(alert)).toEqual(expectedResult);
    });

    it('returns greenwood-victoria_park after using "vic park"', function() {
      var expectedResult = ["greenwood", "victoria park"];
      var alert = "trains turning back at greenwood stn due to personal injury at track level at vic park stn. shuttle buses operating. expected clear 20 mins.";
      expect(stationInfo.retrieveStationListing(alert)).toEqual(expectedResult);
    });

});
