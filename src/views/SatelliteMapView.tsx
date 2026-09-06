import React, { useState, useEffect, useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Globe, 
  MapPin, 
  ZoomIn, 
  ZoomOut, 
  Activity, 
  Droplets, 
  ShieldCheck, 
  Crosshair, 
  Check, 
  Search,
  Sparkles,
  Layers,
  Ruler
} from 'lucide-react';

export const SatelliteMapView: React.FC = () => {
  const { farm, updateFarmData, showToast } = useFarm();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const ndviLayerRef = useRef<L.Polygon | null>(null);

  // Default coordinates: Farm's registered coordinates, or Indore, MP (22.7196, 75.8577)
  const initialLat = farm?.latitude || 22.7196;
  const initialLng = farm?.longitude || 75.8577;

  const [currentLat, setCurrentLat] = useState<number>(initialLat);
  const [currentLng, setCurrentLng] = useState<number>(initialLng);
  const [activeLayer, setActiveLayer] = useState<'hybrid' | 'satellite' | 'ndvi'>('hybrid');
  const [ndviOpacity, setNdviOpacity] = useState<number>(65);
  const [showBoundary, setShowBoundary] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [detectedAddress, setDetectedAddress] = useState<string>(
    `${farm?.village ? farm.village + ', ' : ''}${farm?.district || 'Indore'}, ${farm?.state || 'Madhya Pradesh'}`
  );
  const [calculatedArea] = useState<{ acres: number; hectares: number; bigha: number }>({
    acres: farm?.acres || 2.5,
    hectares: Number(((farm?.acres || 2.5) * 0.404686).toFixed(2)),
    bigha: Number(((farm?.acres || 2.5) * 1.6).toFixed(2)),
  });

  // Layer Tile References
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelsLayerRef = useRef<L.TileLayer | null>(null);

  // Agricultural Belt Hubs across India for dropdown
  const indianAgriHubs = [
    { name: 'Indore (Malwa Wheat & Soybean)', lat: 22.7196, lng: 75.8577 },
    { name: 'Nashik (Vineyards & Banana)', lat: 19.9975, lng: 73.7898 },
    { name: 'Jalgaon (Banana Capital)', lat: 21.0077, lng: 75.5626 },
    { name: 'Karnal (Basmati Paddy)', lat: 29.6857, lng: 76.9905 },
    { name: 'Ludhiana (Punjab Wheat)', lat: 30.9010, lng: 75.8573 },
    { name: 'Guntur (Chilli & Cotton)', lat: 16.3067, lng: 80.4365 },
  ];

  // Helper to compute parcel vertices around a center point
  const generateParcelCoords = (centerLat: number, centerLng: number, sizeAcres: number = 2.5): [number, number][] => {
    const offset = Math.sqrt(sizeAcres) * 0.00065;
    return [
      [centerLat + offset * 0.9, centerLng - offset * 0.95],
      [centerLat + offset * 0.85, centerLng + offset * 1.1],
      [centerLat - offset * 0.95, centerLng + offset * 0.9],
      [centerLat - offset * 0.8, centerLng - offset * 1.05],
    ];
  };

  // Reverse geocode via Nominatim
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`
      );
      if (resp.ok) {
        const data = await resp.json();
        const addr = data.address || {};
        const village = addr.village || addr.suburb || addr.town || addr.hamlet || addr.county || '';
        const district = addr.state_district || addr.district || '';
        const state = addr.state || '';
        const postcode = addr.postcode || '';
        const formatted = [village, district, state, postcode].filter(Boolean).join(', ');
        if (formatted) {
          setDetectedAddress(formatted);
        }
      }
    } catch {
      // Keep previous address on fetch failure
    }
  };

  // Initialize Real Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Leaflet Map Instance
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Add True Satellite Tile Layer (Esri World Imagery)
    const esriSatellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        subdomains: ['server', 'services'],
      }
    ).addTo(map);
    tileLayerRef.current = esriSatellite;

    // Add Transportation & Labels Overlay (Esri Reference)
    const esriLabels = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        opacity: 0.9,
      }
    ).addTo(map);
    labelsLayerRef.current = esriLabels;

    // Custom Farm Marker Icon
    const customIcon = L.divIcon({
      className: 'custom-farm-marker',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
          <div style="width:36px; height:36px; background:#059669; border:2.5px solid white; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 14px rgba(0,0,0,0.5); color:white; font-size:18px;">
            🌱
          </div>
          <div style="background:#064e3b; color:#a7f3d0; font-size:10px; font-weight:700; padding:3px 8px; border-radius:6px; margin-top:3px; white-space:nowrap; border:1px solid #10b981; box-shadow:0 2px 5px rgba(0,0,0,0.4);">
            ${farm?.crop_name || 'My Farm'}
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    // Add Marker
    const marker = L.marker([initialLat, initialLng], {
      icon: customIcon,
      draggable: true,
    }).addTo(map);
    markerRef.current = marker;

    // Add Parcel Polygon Boundary
    const initialPolygonPoints = generateParcelCoords(initialLat, initialLng, farm?.acres || 2.5);
    const parcelPolygon = L.polygon(initialPolygonPoints, {
      color: '#10b981',
      weight: 2.5,
      dashArray: '5, 5',
      fillColor: '#34d399',
      fillOpacity: 0.18,
    }).addTo(map);
    polygonRef.current = parcelPolygon;

    // Add NDVI Simulated Layer
    const ndviPolygon = L.polygon(initialPolygonPoints, {
      color: '#059669',
      weight: 1,
      fillColor: '#10b981',
      fillOpacity: 0.55,
    });
    ndviLayerRef.current = ndviPolygon;

    // Map Event: Click to move marker and recalculate
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setCurrentLat(lat);
      setCurrentLng(lng);
      marker.setLatLng([lat, lng]);

      const newPoly = generateParcelCoords(lat, lng, farm?.acres || 2.5);
      parcelPolygon.setLatLngs(newPoly);
      if (ndviPolygon) ndviPolygon.setLatLngs(newPoly);

      reverseGeocode(lat, lng);
    });

    // Marker Drag Event
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setCurrentLat(pos.lat);
      setCurrentLng(pos.lng);

      const newPoly = generateParcelCoords(pos.lat, pos.lng, farm?.acres || 2.5);
      parcelPolygon.setLatLngs(newPoly);
      if (ndviPolygon) ndviPolygon.setLatLngs(newPoly);

      reverseGeocode(pos.lat, pos.lng);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Layer mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    if (labelsLayerRef.current) map.removeLayer(labelsLayerRef.current);
    if (ndviLayerRef.current && map.hasLayer(ndviLayerRef.current)) {
      map.removeLayer(ndviLayerRef.current);
    }

    if (activeLayer === 'hybrid') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);

      labelsLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, opacity: 0.95 }
      ).addTo(map);
    } else if (activeLayer === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);
    } else if (activeLayer === 'ndvi') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(map);

      if (ndviLayerRef.current) {
        ndviLayerRef.current.setStyle({
          fillColor: '#10b981',
          fillOpacity: ndviOpacity / 100,
        });
        ndviLayerRef.current.addTo(map);
      }
    }
  }, [activeLayer, ndviOpacity]);

  // Toggle boundary visibility
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !polygonRef.current) return;

    if (showBoundary) {
      if (!map.hasLayer(polygonRef.current)) polygonRef.current.addTo(map);
    } else {
      if (map.hasLayer(polygonRef.current)) map.removeLayer(polygonRef.current);
    }
  }, [showBoundary]);

  // Fly to location helper
  const flyToLocation = (lat: number, lng: number, name: string) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setCurrentLat(lat);
    setCurrentLng(lng);

    map.flyTo([lat, lng], 16, {
      duration: 1.5,
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }

    const newPoly = generateParcelCoords(lat, lng, farm?.acres || 2.5);
    if (polygonRef.current) polygonRef.current.setLatLngs(newPoly);
    if (ndviLayerRef.current) ndviLayerRef.current.setLatLngs(newPoly);

    setDetectedAddress(name);
    showToast(`Navigated to ${name}`, 'info');
  };

  // Search Indian Location via Nominatim
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim() + ', India'
        )}&limit=1`
      );
      if (resp.ok) {
        const results = await resp.json();
        if (results && results.length > 0) {
          const first = results[0];
          const lat = parseFloat(first.lat);
          const lon = parseFloat(first.lon);
          flyToLocation(lat, lon, first.display_name.split(',').slice(0, 3).join(', '));
          setSearchQuery('');
        } else {
          showToast('Location not found. Try entering a district or PIN code', 'error');
        }
      }
    } catch {
      showToast('Search failed. Please check internet connection', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  // Save Coordinates to Farm
  const handleSaveCoordinates = async () => {
    setIsSaving(true);
    try {
      await updateFarmData({
        latitude: Number(currentLat.toFixed(5)),
        longitude: Number(currentLng.toFixed(5)),
      });
      showToast('Farm GPS coordinates saved to Firestore!', 'success');
    } catch {
      showToast('Failed to save coordinates', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-200">
      
      {/* ========================================================= */}
      {/* POLISHED HERO HEADER (Aesthetic match with Landing Page)   */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-emerald-100 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copernicus Sentinel-2 &amp; Esri World Imagery • Sub-Meter GIS</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              Real-Time Satellite &amp; Field Radar
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              True spaceborne optical imaging of your fields. Drag the farm pin to adjust boundary vertices, monitor canopy health, or search any village in India.
            </p>
          </div>

          {/* Search & Agricultural Hub Quick Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            
            {/* Quick Agricultural Belt Dropdown (replaces 6 cluttered buttons) */}
            <div className="relative">
              <select
                id="select-agri-hub"
                onChange={(e) => {
                  const hub = indianAgriHubs.find((h) => h.name === e.target.value);
                  if (hub) flyToLocation(hub.lat, hub.lng, hub.name);
                }}
                defaultValue=""
                className="w-full sm:w-auto text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
              >
                <option value="" disabled>📍 Quick Agri Belts…</option>
                {indianAgriHubs.map((hub, idx) => (
                  <option key={idx} value={hub.name}>
                    {hub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Search Input */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 sm:w-64">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Village, district, PIN code…"
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
              >
                {isSearching ? 'Locating…' : 'Search'}
              </button>
            </form>

          </div>
        </div>

        {/* Current Location & GPS Coordinates Strip */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-800">{detectedAddress}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{currentLat.toFixed(5)}° N, {currentLng.toFixed(5)}° E</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SATELLITE CANVAS & TELEMETRY BENTO GRID                   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left / Main: Real Leaflet Satellite Stage (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-lg relative group select-none flex flex-col">
          
          {/* SATELLITE STAGE WRAPPER WITH SLEEK, UNCLUTTERED CONTROLS */}
          <div className="relative w-full">
            
            {/* Top-Left: Minimalist Live Spacecraft Indicator */}
            <div className="absolute top-3 left-3 z-[400] pointer-events-none">
              <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 text-white text-[11px] font-medium flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-bold">Sentinel-2 MSI</span>
                <span className="text-slate-400">• 10m Optical</span>
              </div>
            </div>

            {/* Top-Right: Sleek Segmented Layer Pill (Single Horizontal Dock - ZERO Overlap) */}
            <div className="absolute top-3 right-3 z-[400]">
              <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 p-1 rounded-2xl flex items-center gap-1 shadow-lg">
                <button
                  type="button"
                  id="btn-layer-hybrid"
                  onClick={() => setActiveLayer('hybrid')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeLayer === 'hybrid'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Hybrid
                </button>
                <button
                  type="button"
                  id="btn-layer-satellite"
                  onClick={() => setActiveLayer('satellite')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeLayer === 'satellite'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Satellite
                </button>
                <button
                  type="button"
                  id="btn-layer-ndvi"
                  onClick={() => setActiveLayer('ndvi')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    activeLayer === 'ndvi'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>NDVI</span>
                </button>
              </div>
            </div>

            {/* LEAFLET SATELLITE MAP CONTAINER */}
            <div 
              ref={mapContainerRef} 
              id="leaflet-satellite-canvas"
              className="w-full aspect-4/3 sm:aspect-16/10 md:aspect-16/9 bg-slate-950 z-0" 
              style={{ minHeight: '440px' }}
            />

            {/* Bottom-Left: Subtle NDVI Scale (only when NDVI active) */}
            {activeLayer === 'ndvi' && (
              <div className="absolute bottom-3 left-3 z-[400] bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 text-white text-[11px] shadow-lg space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Stressed (0.2)</span>
                  <span className="font-bold text-emerald-400">Canopy Health</span>
                  <span>Vigorous (0.85)</span>
                </div>
                <div className="w-36 h-2 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 shadow-inner" />
              </div>
            )}

            {/* Bottom-Right: Clean Floating Zoom & Center Pill (Compact, neatly docked) */}
            <div className="absolute bottom-3 right-3 z-[400] flex items-center gap-1 bg-slate-950/80 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-lg text-white">
              <button
                type="button"
                id="btn-map-zoom-in"
                onClick={() => {
                  if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
                }}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-emerald-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="btn-map-zoom-out"
                onClick={() => {
                  if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
                }}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-emerald-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-white/15 mx-0.5" />
              <button
                type="button"
                id="btn-map-center-farm"
                onClick={() => {
                  flyToLocation(farm?.latitude || 22.7196, farm?.longitude || 75.8577, farm?.name || 'Registered Farm');
                }}
                className="px-2.5 h-8 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Center on Registered Farm"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Center</span>
              </button>
            </div>

          </div>

          {/* SLEEK MAP CONTROLS & ACTION FOOTER */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Boundary Toggle Switch */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={showBoundary}
                  onChange={(e) => setShowBoundary(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="font-medium">Cadastral Boundary Polygon</span>
              </label>

              {/* NDVI Opacity Slider when NDVI is on */}
              {activeLayer === 'ndvi' && (
                <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
                  <span>Layer Opacity:</span>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={ndviOpacity}
                    onChange={(e) => setNdviOpacity(Number(e.target.value))}
                    className="w-20 accent-emerald-500 cursor-pointer"
                  />
                  <span className="font-mono text-emerald-400">{ndviOpacity}%</span>
                </div>
              )}
            </div>

            {/* Save Coordinates Primary Action */}
            <button
              id="btn-save-real-coords"
              onClick={handleSaveCoordinates}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving…' : 'Save GPS to Farm Record'}</span>
            </button>
          </div>

        </div>

        {/* Right Column: High-Craft Telemetry Cards (Matching Landing Page styling) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Card 1: Field Area & Cadastral Measurements */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-emerald-600" />
                <span>Field Area &amp; Geometry</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Geodetic
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Acres</span>
                <span className="text-base font-bold text-emerald-800 block mt-0.5">
                  {calculatedArea.acres}
                </span>
              </div>
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Hectares</span>
                <span className="text-base font-bold text-blue-900 block mt-0.5">
                  {calculatedArea.hectares}
                </span>
              </div>
              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-100/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Bigha</span>
                <span className="text-base font-bold text-amber-900 block mt-0.5">
                  {calculatedArea.bigha}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Area computed from the polygonal boundary overlay. Drag or click anywhere on the satellite canvas to recalculate.
            </p>
          </div>

          {/* Card 2: Canopy Vigor & Root-Zone Moisture */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Canopy &amp; Root Moisture</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Optimal</span>
              </span>
            </div>

            <div className="space-y-3">
              {/* NDVI Metric */}
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Mean NDVI Index</span>
                  <span className="text-lg font-bold text-emerald-800">0.76</span>
                  <span className="text-[11px] text-emerald-600 font-semibold block">Vigorous Vegetative Canopy</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  92%
                </div>
              </div>

              {/* Moisture Metric */}
              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Root-Zone Moisture</span>
                  <span className="text-lg font-bold text-blue-900">62%</span>
                  <span className="text-[11px] text-blue-700 font-semibold block">Adequate Soil Hydration</span>
                </div>
                <Droplets className="w-8 h-8 text-blue-500" />
              </div>

              {/* Uniformity Score */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Canopy Uniformity</span>
                  <span className="text-sm font-bold text-slate-800">89% Homogeneous</span>
                  <span className="text-[10px] text-slate-500 block">No patchy chlorosis detected</span>
                </div>
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
            </div>

            {/* Satellite Mission Specifications */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Satellite Mission:</span>
                <span className="font-semibold text-slate-700">Copernicus Sentinel-2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Imagery Provider:</span>
                <span className="font-semibold text-slate-700">Esri World Imagery GIS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cloud Obstruction:</span>
                <span className="font-semibold text-emerald-600">0% Cloud-Free</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
