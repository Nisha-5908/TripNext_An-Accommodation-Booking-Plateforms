
let mapTOKEN = mapToken;
 mapboxgl.accessToken = mapTOKEN;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12', // Use the standard style for the map
    projection: 'globe', // display the map as a globe
    // initial zoom level, 0 is the world view, higher values zoom in
    center: [83.37, 26.76], // center the map on this longitude and latitude
    zoom: 9,
});

map.addControl(new mapboxgl.NavigationControl());
map.scrollZoom.disable();

map.on('style.load', () => {
    map.setFog({}); // Set the default atmosphere style
    
    // Add marker after map loads
const marker1 = new mapboxgl.Marker({color: 'red'})
    .setLngLat(coordinates)//listing.geometry.coordinates)  
    .setPopup(new mapboxgl.Popup({offset: 25})
     .setHTML(`<h4>${listingTitle}</h4><p> Exact Location will be provided</p>`)) // add popups
    .addTo(map);
    
    // Fly to marker location
    map.flyTo({
        center: coordinates,
        zoom: 8,
        essential: true
    });
});

