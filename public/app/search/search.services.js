
angular.module('soundGlomerate.searchFactory', [])

.factory('Search', ['$http', '$q', function($http, $q) {

  var events = [], 
      latLong = [],
      selectedCity = '',
      keys = {},
      test = {},
      dbAPIKeys = [],
      newKeys = null,
      eventBriteData = {"pagination": {"object_count": 1400, "page_number": 1, "page_size": 50, "page_count": 28}},
      eventBriteBaseUrl = 'https://www.eventbriteapi.com/v3/events/search/',
      eventBriteCity = 'Oakland' || '';
      testReq = eventBriteBaseUrl + '?sort_by=date&venue.city=Oakland&venue.region=CA&categories=103&expand=venue&token=',
      apiReq = eventBriteBaseUrl + '?sort_by=date&venue.city=Oakland&venue.region=CA&categories=103&expand=venue&token=';


  // Fetch promise needs to go in it's own service
  function httpPromise (url) {
    var deferred = $q.defer();
      $http.get(url)
      .success(function (data) {              
        deferred.resolve(data);
      })
    return deferred.promise; 
  }

  // Get api token on loading of the app (out of public view) 
  function getKeys() {   
    return httpPromise('db/apikeys');
  }

  // For testing the get API key
  test.getApiKey = function () {
    return httpPromise('/keys');
  }

  // For testing the API calls
  test.search = function (argument) {
    return httpPromise(testReq);
  }

  // Just Practice
  test.find = function (query) {
    return eventBriteData[query];
  }

  // Get data from Eventbrite
  function getEventBriteData(city, startDate, endDate, key) { 

    angular.copy([], events);
    selectedCity = city;
    
    function fixTime(date) {
      console.log('date', date);
      date = date.substring(0,19);
      date += 'Z';
      return date;
    }  

    if(startDate !== undefined) {
      startDate = fixTime(startDate.toISOString());
    }
    if(endDate !== undefined) {
      endDate = fixTime(endDate.toISOString());
    }

    startDate = startDate ? '&start_date.range_start='+startDate : '';
    endDate = endDate ? '&start_date.range_end='+endDate : '';

    return $http({
      method: 'GET',
      url: 'https://www.eventbriteapi.com/v3/events/search/?sort_by=date&venue.city=' + city + '&venue.region=CA'+startDate+endDate+'&categories=103&expand=venue&token=' + key
    })
    .then(function(res) {
      res.data.events.forEach(function(evnt) {
        var tuple = [ evnt.venue.address.latitude, evnt.venue.address.longitude];

        latLong.push(tuple);
        events.unshift(evnt);
      });
      return events;
    })
    .catch(function(err) {
      console.log(err);
    });
  };

  function scrappedData() {
    return $http.get('/db/events')
    .success(function (res) {
      res.forEach(function(event) {
        events.unshift(event);
      });
    });
  };

  return {
    events: events,
    getEventBriteData: getEventBriteData,
    scrappedData: scrappedData,
    latLong: latLong,
    selectedCity: selectedCity,
    getKeys: getKeys,
    test: test
  };
}]);

  
