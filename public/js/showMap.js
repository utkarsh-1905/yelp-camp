mapboxgl.accessToken = token;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/light-v10", // style URL
  center: data.geometry.coordinates, // center centerstarting position [lng, lat]
  zoom: 10, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl(),'bottom-left')

new mapboxgl.Marker()
  .setLngLat(data.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h3>${data.title}</h3><p>${data.location}</p>`
    )
  )
  .addTo(map);
