describe('verify that external helpers load', function() {
    beforeEach(function() {
    });

    it('stationInfo helper class should exist', function() {
      expect(stationInfo).toEqual(jasmine.anything());
    });

    it('busRoutes helper class should exist', function() {
      expect(busInfo).toEqual(jasmine.anything());
    });

});

describe('verify that station interchange lookup functions properly', function() {
    beforeEach(function() {
    });

    it('feeding interchange lookup "yonge bloor" returns bloor-yonge', function() {
      var expectedResult = {
        revisedInterchange: 'bloor-yonge',
        originalInterchange: 'yonge bloor',
        hasChanged: true
      };
      expect(stationInfo.interchangeLookup("yonge bloor").revisedInterchange).toEqual('bloor-yonge');
    });

    it('feeding interchange lookup "bloor yonge" returns bloor-yonge', function() {
      var expectedResult = {
        revisedInterchange: 'bloor-yonge',
        originalInterchange: 'bloor yonge',
        hasChanged: true
      };
      expect(stationInfo.interchangeLookup("bloor yonge").revisedInterchange).toEqual('bloor-yonge');
    });

    it('feeding interchange lookup "bloor and yonge" returns bloor-yonge', function() {
      var expectedResult = {
        revisedInterchange: 'bloor-yonge',
        originalInterchange: 'bloor and yonge',
        hasChanged: true
      };
      expect(stationInfo.interchangeLookup("bloor and yonge").revisedInterchange).toEqual('bloor-yonge');
    });

    it('feeding interchange lookup "bloor" returns bloor-yonge', function() {
      var expectedResult = {
        revisedInterchange: 'bloor-yonge',
        originalInterchange: 'bloor',
        hasChanged: true
      };
      expect(stationInfo.interchangeLookup("bloor").revisedInterchange).toEqual('bloor-yonge');
    });

    it('feeding interchange lookup "yonge" returns bloor-yonge', function() {
      var expectedResult = {
        revisedInterchange: 'bloor-yonge',
        originalInterchange: 'yonge',
        hasChanged: true
      };
      expect(stationInfo.interchangeLookup("yonge").revisedInterchange).toEqual('bloor-yonge');
    });

    it('feeding interchange lookup "yonge university both ways" fails', function() {
      var expectedResult = {
        revisedInterchange: '',
        originalInterchange: '',
        hasChanged: false
      };
      expect(stationInfo.interchangeLookup("yonge university both ways")).toEqual(expectedResult);
    });

});
