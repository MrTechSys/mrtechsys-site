import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Target } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Mock geocoding for demo - in production you'd use actual geocoding API
const mockGeocode = (location) => {
  const baseCoords = { lat: 30.2672, lng: -97.7431 }; // Austin, TX
  return {
    lat: baseCoords.lat + (Math.random() - 0.5) * 0.2,
    lng: baseCoords.lng + (Math.random() - 0.5) * 0.2
  };
};

export default function LeadMapView({ leads = [], onLeadClick }) {
  const mapCenter = useMemo(() => {
    if (leads.length === 0) return [30.2672, -97.7431];
    // In production, calculate center from actual lead locations
    return [30.2672, -97.7431];
  }, [leads]);

  const leadsWithCoords = useMemo(() => 
    leads.map(lead => ({
      ...lead,
      coords: mockGeocode(lead.location)
    })),
    [leads]
  );

  const getMarkerColor = (score) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div style={{ height: '600px', borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer 
        center={mapCenter} 
        zoom={11} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {leadsWithCoords.map((lead, idx) => (
          <CircleMarker
            key={idx}
            center={[lead.coords.lat, lead.coords.lng]}
            radius={8}
            fillColor={getMarkerColor(lead.score || 0)}
            color="#fff"
            weight={2}
            opacity={0.9}
            fillOpacity={0.7}
            eventHandlers={{
              click: () => onLeadClick && onLeadClick(lead)
            }}
          >
            <Popup>
              <div className="text-sm space-y-2 min-w-[200px]">
                <div>
                  <p className="font-bold text-lg">{lead.name}</p>
                  {lead.metadata?.category && (
                    <Badge className="text-xs mt-1">{lead.metadata.category}</Badge>
                  )}
                </div>
                
                {lead.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-3 h-3" />
                    <span className="text-xs">{lead.phone}</span>
                  </div>
                )}
                
                {lead.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs">
                      {lead.location.city}, {lead.location.state}
                    </span>
                  </div>
                )}
                
                {lead.score && (
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3" />
                    <Badge className={`text-xs ${
                      lead.score >= 80 ? 'bg-green-100 text-green-800' :
                      lead.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Score: {lead.score}
                    </Badge>
                  </div>
                )}

                {lead.expected_value && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500">Est. Value:</span>
                    <span className="text-sm font-bold ml-2">${lead.expected_value}</span>
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}