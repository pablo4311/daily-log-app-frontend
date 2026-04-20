import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import isEmpty from "../utils/empty";

import "mapbox-gl/dist/mapbox-gl.css";

const MapboxExample = ({ scale, geometry, data }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // TO MAKE THE MAP APPEAR YOU MUST
    // ADD YOUR ACCESS TOKEN FROM
    // https://account.mapbox.com
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
    if (!isEmpty(geometry)) {
      console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^");

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/standard",
        center: [-101.198374, 27.933061],
        zoom: 4,
      });

      new mapboxgl.Marker({ color: "#FF0000" })
        .setLngLat(geometry.coordinates[0])
        .addTo(mapRef.current);
      new mapboxgl.Marker({ color: "#00FF00" })
        .setLngLat(geometry.coordinates[geometry.coordinates.length - 1])
        .addTo(mapRef.current);
      new mapboxgl.Marker()
        .setLngLat([data.pickupLocation.x, data.pickupLocation.y])
        .addTo(mapRef.current);
      // Automatically fit the map view to the route's bounds
      const bounds = new mapboxgl.LngLatBounds();
      geometry.coordinates.forEach((coord) => bounds.extend(coord)); // Extend bounds with route coordinates

      // Fit the map to the bounds (auto zoom and center)
      mapRef.current.fitBounds(bounds, {
        padding: 50, // Adds some padding around the route for a better view
        duration: 1000, // Animation duration in milliseconds
      });

      mapRef.current.on("load", () => {
        if (!mapRef.current.getSource("route")) {
          mapRef.current.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: geometry,
            },
          });

          mapRef.current.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "red",
              "line-width": 6,
            },
          });
        }
      });
    } else {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/standard",
        center: [-101.198374, 27.933061],
        zoom: 4,
      });
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [geometry]);

  return (
    <>
      <div id="mapbox-container" ref={mapContainerRef} className="map-container"></div>
    </>
  );
};

export default MapboxExample;
