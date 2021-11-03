// mapboxgl.accessToken = 'pk.eyJ1IjoibHVpc2FyY3BpY2F6em8iLCJhIjoiY2t2Z2NpYm1iMWU1dDJucWZwNGh5cGVrMCJ9.XYM-jej0ePsNmCgfcRtuiw';
// mapboxgl.accessToken = '<%-process.env.MAPBOX_TOKEN%>';
mapboxgl.accessToken = mapBoxTokenFromEjsShowTemplate;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v11', // style URL can change the map style/theme here!. Look it up in the docs
        center: campgroundMapLocation.geometry.coordinates, // starting position [lng, lat]
        zoom: 9 // starting zoom
    });

// Create a default Marker and add it to the map.
new mapboxgl.Marker()
    .setLngLat(campgroundMapLocation.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup( { offset: 25 } )
                    .setHTML(
                        `<h5>${campgroundMapLocation.title}</h5>
                         <p>${campgroundMapLocation.location}</p>`
                    )
    )
    .addTo(map);