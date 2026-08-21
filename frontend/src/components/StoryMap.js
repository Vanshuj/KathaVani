import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const customIcon = L.divIcon({
  className: '',
  html: `<div class="map-pulse-aura"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36]
});

export default function StoryMap({ stories = [], onSelectStory }) {
  return (
    <div style={{ height: 500, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {stories.map(story => story.lat && story.lng ? (
          <Marker key={story._id} position={[story.lat, story.lng]} icon={customIcon}>
            <Popup>
              <div style={{ fontFamily: 'Georgia, serif', minWidth: 180 }}>
                <strong style={{ display: 'block', marginBottom: 4, fontSize: '1rem' }}>{story.title}</strong>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{story.region}</span>
                {story.tags?.length > 0 && (
                  <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {story.tags.map(t => <span key={t} style={{ fontSize: '0.7rem', background: '#f5e8cc', padding: '1px 6px', borderRadius: 10 }}>{t}</span>)}
                  </div>
                )}
                <button
                  onClick={() => onSelectStory(story._id)}
                  style={{ marginTop: 8, padding: '4px 12px', background: '#b45f2b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
                >
                  Read Story →
                </button>
              </div>
            </Popup>
          </Marker>
        ) : null)}
      </MapContainer>
    </div>
  );
}
