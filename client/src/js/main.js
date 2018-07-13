import DBHelper from './dbhelper.js';

let restaurants,
  neighborhoods,
  cuisines;
var newMap;
var numSteps= 20.0;
var prevRatio = 0.0;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  //console.log('dom loaded in main, variables ', restaurants, neighborhoods, cuisines);
  initMap();
  fetchNeighborhoods();
  fetchCuisines();
  setListeners();
  setIntersectionObservers();
});

/**
 * Set Intersection Observers
 */

 var setIntersectionObservers = () => {
   var options = {
    root: document.querySelector('#maincontent'),
    rootMargin: '0px',
    threshold: buildThresholdList()
  }
  var observer = new IntersectionObserver(handleIntersect, options);
 }

 var buildThresholdList = () => {
   var thresholds = [];
   for(var i = 1.0; i <= numSteps; i++) {
     var ratio = i/numSteps;
     thresholds.push(ratio);
   }
    thresholds.push(0);
    return thresholds;
 }

 var handleIntersect = (entries, observer) => {
  entries.forEach(function(entry) {
    if (entry.intersectionRatio > prevRatio) {
      entry.target.classList.remove('hidden');
      entry.target.classList.add('show')
    } else {
      entry.target.classList.add('hidden');
      entry.target.classList.remove('show');
    }

    prevRatio = entry.intersectionRatio;
  });
}
/**
 * Set Event Listeners for neighborhod and cuisine change since calling function was not working after bundling of scripts
 */
var setListeners = () => {
  document.getElementById('neighborhoods-select').addEventListener('change', function() {
    updateRestaurants();
  });

  document.getElementById('cuisines-select').addEventListener('change', function() {
   updateRestaurants();
  });
 }

/**
 * Fetch all neighborhoods and set their HTML.
 */
var fetchNeighborhoods = () => {
  //console.log('main fetchNeighborhoods was called');
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
var fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
var fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
var fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
var initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoibW1rZXBsZXIiLCJhIjoiY2pqMXp6b2t0MGVvMzN3b2FxbTA5aGcxciJ9.WalEAPr3uW5Iztb-PYr0FA',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(self.newMap);
  //added self. to the above after browserify/babelify caused code to break

  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
var updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
var resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
var fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
var createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  /**
   * Picture element for responsive images.
   */

  const picture = document.createElement('picture');
  let num;
  if(!restaurant.photgraph) {
    num = restaurant.id;
  } else {
    num = restaurant.photograph;
  }
  
  let origin = `/img/${num}.jpg`;
  let small = `/img/${num}-400.jpg`;
  const source1 = document.createElement('source');
  source1.media = '(min-width: 1481px)';
  source1.srcset = origin;
  const source2 = document.createElement('source');
  source2.media = '(max-width: 1480px) and (min-width: 769px)';
  source2.srcset = small;
  const source3 = document.createElement('source');
  source3.media = '(max-width: 768px) and (min-width: 490px)';
  source3.srcset = origin;
  const source4 = document.createElement('source');
  source4.media = '(max-width: 489px)';
  source4.srcset = small;
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.alt = `An image of ${restaurant.name}.`;
  image.src = origin;

  picture.append(source1);
  picture.append(source2);
  picture.append(source3);
  picture.append(source4);
  picture.append(image);
  li.append(picture);

  const name = document.createElement('h3');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  //Added role='button for imporoved screen reader use
  more.setAttribute('role', 'button');
  //Added aria-label for improved accessibility
  more.setAttribute('aria-label', `View details for ${restaurant.name}`);
  more.addEventListener('keypress', ensureClick);
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
var addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

} 

/**
 * Ensures that space key will work for enter on keyboard navigation through site
 */
var ensureClick = (e) => {
  e.preventDefault();
  let code = event.charCode || event.keyCode;
    if((code === 32)|| (code === 13)){
      e.target.click();
  }
}