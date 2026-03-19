import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function WorldMap({ countryMarkers }) {
  const center = [20, 0];
  const zoom = 2;

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%", borderRadius: "12px" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
      />
      {countryMarkers.map(({ name, lat, lng, count }) => (
        <Marker key={name} position={[lat, lng]}>
          <Popup>
            <strong>{name}</strong>
            <br />Mentions: {count}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default WorldMap;
