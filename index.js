const reviews = [];

document.addEventListener("DOMContentLoaded", () => {
  ymaps.ready(init);
  function init(){
    var myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 7
    })
    myMap.events.add('click', function (e) {
      var coords = e.get('coords');
      openBalloon(myMap, coords);
    });
  };
  var saveReviews = JSON.parse(localStorage['reviews']);
  for (const saveReview of saveReviews) {
    reviews.push(saveReview);
  }

});

function getOptionsCluster(coords) {
  const clusterOjects = [];
  for (const review of reviews) {
    if (JSON.stringify(review.coords) === JSON.stringify(coords)) {
      const geoObj = new ymaps.GeoObject({
        geometry: {type: 'Point' , coordinates: coords}
      })
      clusterOjects.push(geoObj);
    }
  }
  return clusterOjects;
};

function addCluster(map, coords) {
  var myClusterer = new ymaps.Clusterer({clusterDisableClickZoom: true});
  myClusterer.options.set('hasBalloon', false);

  function addToCluster() {
    const myGeoObjects = getOptionsCluster(coords);
    myClusterer.add(myGeoObjects);
    map.geoObjects.add(myClusterer);
    map.balloon.close();
  }

  myClusterer.events.add('click', function(e) {
    e.preventDefault();
    openBalloon(map, coords, myClusterer, addToCluster);
  })

  addToCluster();
}

function getReviewList(coords) {
  var reviewListHTML = '';
  for (const review of reviews) {
    if (JSON.stringify(review.coords) === JSON.stringify(coords)) {
      reviewListHTML += `
        <div class="review">
          <div><strong>Место: </strong> ${review.place}</div>
          <div><strong>Автор: </strong> ${review.author}</div>
          <div><strong>Отзыв: </strong> ${review.reviewText}</div>
        </div>`
    }
  }
  return reviewListHTML
}

async function openBalloon(map, coords, myClusterer, fn) {
  await map.balloon.open(coords, {
    content: `<div class="review__container">${getReviewList(coords)}</div>${formBalloon}`
  })
  document.querySelector('#add-form').addEventListener("submit", function(e) {
    if (myClusterer) {
      myClusterer.removeAll();
    }
    e.preventDefault();
    reviews.push({
      coords: coords,
      author: this.elements.author.value,
      place: this.elements.place.value,
      reviewText: this.elements.review.value,
    })
    localStorage['reviews'] = JSON.stringify(reviews);
    console.log(localStorage['reviews']);
    !fn ? addCluster(map, coords) : fn()
    map.balloon.close()
  })
}










const formBalloon = `
<form id="add-form">
  <input type="text" placeholder="Название места" name="place"><br><br>
  <input type="text" placeholder="Ваше имя" name="author"><br><br>
  <textarea placeholder="Ваш отзыв" name="review" class="review__text"></textarea><br><br>
  <button id="add-btn">Добавить</button><br>
</form>
`
