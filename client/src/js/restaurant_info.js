let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  /**
   * Add source elements to picture element and update the src of the image, so it will display correctly
   */

  const picture = document.getElementById('restaurant-pic');
  let origin  = DBHelper.imageUrlForRestaurant(restaurant);
  console.log('origin in rest', origin);
  let imageName = origin.replace('.jpg', '').replace('/img/', '');
  let small = `/img/${imageName}-400.jpg`;
  console.log("small in rest", small);
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
  picture.append(source1);
  picture.append(source2);
  picture.append(source3);
  picture.append(source4);

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.alt = `An image of ${restaurant.name}`;
  image.src = origin;
  

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  //Added some elements to create review div like the example
  const holder = document.createElement('div');
  const name = document.createElement('p');
  name.setAttribute('class', 'name');
  holder.setAttribute('class', 'holder');
  name.innerHTML = review.name;
  holder.appendChild(name);

  const date = document.createElement('p');
  date.setAttribute('class', 'date');
  date.innerHTML = review.date;
  holder.appendChild(date);
  li.appendChild(holder);

  const rating = document.createElement('p');
  rating.setAttribute('class', 'rating');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.setAttribute('class', 'comments');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  //Added aria-current attribute for accessiblity
  li.setAttribute('aria-current', 'page');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
/**
 * Function for keystroke eventlistener on View Details button. Makes sure spacebar clicks button.
 */
ensureClick = (e) => {
  e.preventDefault();
  let code = event.charCode || event.keyCode;
    if((code === 32)|| (code === 13)){
      e.target.click();
  }
}