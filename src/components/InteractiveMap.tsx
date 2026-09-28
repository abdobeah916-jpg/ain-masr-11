import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  AlertCircle,
  Sparkles,
  Crosshair,
  ExternalLink,
  Copy,
  RotateCcw,
} from 'lucide-react';
import { GOVERNORATES, calculateDistanceKm } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { Report, Severity } from '../types';
import {
  acquireAccurateGpsLocation,
  resolveFromGazetteer,
  reverseGeocodeOnline,
  searchEgyptianAddress,
  SearchAddressResult,
  EGYPT_DETAILED_GAZETTEER,
} from '../utils/gpsService';

interface InteractiveMapProps {
  mode: 'picker' | 'viewer';
  selectedGovId?: string;
  selectedCoordinates?: { lat: number; lng: number };
  onCoordinatesChange?: (
    coords: { lat: number; lng: number },
    govId?: string,
    districtSuggestion?: string,
    streetSuggestion?: string
  ) => void;
  reports?: Report[];
  onSelectReport?: (reportId: string) => void;
  heightClass?: string;
}

// Preset popular Egyptian hubs for 1-click teleportation
const EGYPT_PRESET_AREAS = [
  { nameAr: 'السويس - الأربعين', nameEn: 'Al-Arbaeen, Suez', govId: 'suez', district: 'حي الأربعين', street: 'ميدان الإسعاف - شارع الجيش', lat: 29.9801, lng: 32.535 },
  { nameAr: 'السويس - وسط البلد', nameEn: 'Suez Central', govId: 'suez', district: 'حي السويس', street: 'شارع سعد زغلول - ديوان المحافظة', lat: 29.9668, lng: 32.5498 },
  { nameAr: 'القاهرة - مدينة نصر', nameEn: 'Nasr City, Cairo', govId: 'cairo', district: 'مدينة نصر', street: 'شارع عباس العقاد تقاطع مصطفى النحاس', lat: 30.057, lng: 31.341 },
  { nameAr: 'القاهرة - وسط البلد', nameEn: 'Downtown Cairo', govId: 'cairo', district: 'وسط البلد', street: 'ميدان التحرير - شارع قصر النيل', lat: 30.0444, lng: 31.2357 },
  { nameAr: 'القاهرة - التجمع الخامس', nameEn: 'New Cairo 5th Settlement', govId: 'cairo', district: 'التجمع الخامس', street: 'شارع التسعين الشمالي - مجمع البنوك', lat: 30.025, lng: 31.45 },
  { nameAr: 'الجيزة - الدقي', nameEn: 'Dokki, Giza', govId: 'giza', district: 'الدقي', street: 'شارع مصدق تقاطع شارع إيران', lat: 30.038, lng: 31.2056 },
  { nameAr: 'الجيزة - 6 أكتوبر', nameEn: '6th of October City', govId: 'giza', district: 'مدينة 6 أكتوبر', street: 'المحور المركزي - ميدان الحصري', lat: 29.975, lng: 30.935 },
  { nameAr: 'الإسكندرية - سموحة', nameEn: 'Smouha, Alexandria', govId: 'alexandria', district: 'سموحة', street: 'ميدان فيكتور عمانويل - شارع فوزي معاذ', lat: 31.215, lng: 29.955 },
  { nameAr: 'الإسكندرية - محطة الرمل', nameEn: 'Raml Station', govId: 'alexandria', district: 'محطة الرمل', street: 'ميدان سعد زغلول - الكورنيش', lat: 31.2001, lng: 29.8987 },
  { nameAr: 'الإسماعيلية - المركز', nameEn: 'Ismailia Central', govId: 'ismailia', district: 'حي أول الإسماعيلية', street: 'شارع محمد علي - نمرة 6', lat: 30.5965, lng: 32.2715 },
  { nameAr: 'بورسعيد - حي الشرق', nameEn: 'Port Said East', govId: 'port_said', district: 'حي الشرق', street: 'شارع الجمهورية - ممشى ديليسبس', lat: 31.2653, lng: 32.3019 },
  { nameAr: 'المنصورة - الدقهلية', nameEn: 'Mansoura, Dakahlia', govId: 'dakahlia', district: 'المنصورة', street: 'شارع الجمهورية - أمام الجامعة', lat: 31.0409, lng: 31.3785 },
  { nameAr: 'طنطا - الغربية', nameEn: 'Tanta, Gharbia', govId: 'gharbia', district: 'طنطا', street: 'شارع البحر - ميدان السيد البدوي', lat: 30.7865, lng: 31.0004 },
  { nameAr: 'أسوان المركزية', nameEn: 'Aswan Central', govId: 'aswan', district: 'أسوان المركزية', street: 'كورنيش النيل - ميدان المحطة', lat: 24.0889, lng: 32.8998 },
  { nameAr: 'الغردقة - البحر الأحمر', nameEn: 'Hurghada, Red Sea', govId: 'red_sea', district: 'الغردقة', street: 'ميدان السقالة - شارع الشيراتون', lat: 27.2579, lng: 33.8116 },
];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  mode,
  selectedGovId,
  selectedCoordinates,
  onCoordinatesChange,
  reports = [],
  onSelectReport,
  heightClass = 'h-96 sm:h-[420px]',
}) => {
  const { language } = useApp();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const activeTileLayerRef = useRef<L.TileLayer | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const reportMarkersLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchAddressResult[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [locationFeedback, setLocationFeedback] = useState<string | null>(null);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(13);

  // Default coordinate: provided, or Cairo center
  const currentCoords = selectedCoordinates || { lat: 30.0444, lng: 31.2357 };

  // Helper to construct custom HTML pin icon for picker
  const createPickerIcon = (accuracyMeters?: number) => {
    return L.divIcon({
      className: 'custom-picker-pin',
      html: `
        <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-full cursor-grab active:cursor-grabbing select-none">
          <div class="px-2.5 py-1 bg-amber-400 text-slate-950 font-black text-[11px] rounded-lg shadow-2xl whitespace-nowrap border-2 border-white flex items-center gap-1.5 animate-bounce">
            <svg class="w-3.5 h-3.5 fill-slate-950" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <span>${language === 'ar' ? 'موقع البلاغ المحدد' : 'Selected Location'}</span>
          </div>
          <div class="w-1 h-3 bg-amber-500 shadow-md"></div>
          <div class="w-4 h-4 rounded-full bg-rose-600 border-2 border-white shadow-xl ring-4 ring-rose-400/40"></div>
        </div>
      `,
      iconSize: [120, 50],
      iconAnchor: [60, 50],
    });
  };

  // Helper for report markers
  const createReportIcon = (severity: Severity, refNo: string) => {
    const bgClass =
      severity === 'critical'
        ? 'bg-rose-600 ring-rose-400 animate-pulse'
        : severity === 'high'
        ? 'bg-amber-600 ring-amber-400'
        : 'bg-blue-600 ring-blue-400';

    return L.divIcon({
      className: 'custom-report-pin',
      html: `
        <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div class="w-7 h-7 rounded-full ${bgClass} text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-opacity-50 transition-transform group-hover:scale-125">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 21s-8-7.5-8-12a8 8 0 1 1 16 0c0 4.5-8 12-8 12z"></path><circle cx="12" cy="9" r="2.5"></circle></svg>
          </div>
          <div class="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center bg-slate-950 text-white text-[11px] px-2.5 py-1 rounded-lg shadow-2xl border border-slate-700 whitespace-nowrap z-50">
            <span class="font-mono font-bold text-amber-400">${refNo}</span>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = currentCoords.lat || 30.0444;
      const initialLng = currentCoords.lng || 31.2357;
      const initialZoom = mode === 'picker' ? 14 : 7;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        zoomControl: false,
        attributionControl: false,
      });

      // Default OpenStreetMap Street Tiles
      const streetLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
        }
      ).addTo(map);

      activeTileLayerRef.current = streetLayer;
      mapInstanceRef.current = map;

      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });

      // Handle map clicks in picker mode
      if (mode === 'picker') {
        map.on('click', async (e: L.LeafletMouseEvent) => {
          const lat = Number(e.latlng.lat.toFixed(5));
          const lng = Number(e.latlng.lng.toFixed(5));

          // Move pin marker
          if (pickerMarkerRef.current) {
            pickerMarkerRef.current.setLatLng([lat, lng]);
          } else {
            pickerMarkerRef.current = L.marker([lat, lng], {
              icon: createPickerIcon(),
              draggable: true,
            }).addTo(map);
          }

          // Remove old accuracy circle on manual click
          if (accuracyCircleRef.current) {
            map.removeLayer(accuracyCircleRef.current);
            accuracyCircleRef.current = null;
          }

          // Resolve Address
          const gaz = resolveFromGazetteer(lat, lng);
          const district = language === 'ar' ? gaz.districtAr : gaz.districtEn;
          const street = language === 'ar' ? gaz.streetAr : gaz.streetEn;

          if (onCoordinatesChange) {
            onCoordinatesChange({ lat, lng }, gaz.gov.id, district, street);
          }

          setLocationFeedback(
            language === 'ar'
              ? `📍 تم التحديد: [${lat}° N, ${lng}° E] — ${district} (${gaz.gov.nameAr})`
              : `📍 Pin placed: [${lat}° N, ${lng}° E] — ${district} (${gaz.gov.nameEn})`
          );
          setTimeout(() => setLocationFeedback(null), 3500);

          // Online Reverse Geocode enhancement in background
          try {
            const online = await reverseGeocodeOnline(lat, lng, language);
            if (online && (online.district || online.street)) {
              if (onCoordinatesChange) {
                onCoordinatesChange(
                  { lat, lng },
                  online.govId || gaz.gov.id,
                  online.district || district,
                  online.street || street
                );
              }
            }
          } catch (err) {
            // keep gazetteer
          }
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Handle Base Layer switch (Streets vs Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (activeTileLayerRef.current) {
      map.removeLayer(activeTileLayerRef.current);
    }

    if (mapType === 'satellite') {
      // Esri World Imagery (High-Resolution Satellite)
      activeTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Esri, Maxar, Earthstar Geographics',
        }
      ).addTo(map);
    } else {
      // OpenStreetMap Streets
      activeTileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
        }
      ).addTo(map);
    }
  }, [mapType]);

  // 3. Maintain Picker Marker position & drag events
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || mode !== 'picker') return;

    const lat = currentCoords.lat;
    const lng = currentCoords.lng;

    if (!pickerMarkerRef.current) {
      const marker = L.marker([lat, lng], {
        icon: createPickerIcon(),
        draggable: true,
      }).addTo(map);

      // Listen to marker dragend
      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        const dLat = Number(pos.lat.toFixed(5));
        const dLng = Number(pos.lng.toFixed(5));

        if (accuracyCircleRef.current) {
          map.removeLayer(accuracyCircleRef.current);
          accuracyCircleRef.current = null;
        }

        const gaz = resolveFromGazetteer(dLat, dLng);
        const district = language === 'ar' ? gaz.districtAr : gaz.districtEn;
        const street = language === 'ar' ? gaz.streetAr : gaz.streetEn;

        if (onCoordinatesChange) {
          onCoordinatesChange({ lat: dLat, lng: dLng }, gaz.gov.id, district, street);
        }

        setLocationFeedback(
          language === 'ar'
            ? `📍 تم نقل الدبوس إلى: [${dLat}° N, ${dLng}° E] — ${district}`
            : `📍 Pin moved to: [${dLat}° N, ${dLng}° E] — ${district}`
        );
        setTimeout(() => setLocationFeedback(null), 3500);

        try {
          const online = await reverseGeocodeOnline(dLat, dLng, language);
          if (online && (online.district || online.street)) {
            if (onCoordinatesChange) {
              onCoordinatesChange(
                { lat: dLat, lng: dLng },
                online.govId || gaz.gov.id,
                online.district || district,
                online.street || street
              );
            }
          }
        } catch (e) {
          // ignore
        }
      });

      pickerMarkerRef.current = marker;
    } else {
      pickerMarkerRef.current.setLatLng([lat, lng]);
    }
  }, [selectedCoordinates?.lat, selectedCoordinates?.lng, mode, language]);

  // 4. In Viewer Mode: Render all reports markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || mode !== 'viewer') return;

    if (reportMarkersLayerRef.current) {
      map.removeLayer(reportMarkersLayerRef.current);
    }

    const markersGroup = L.layerGroup();

    const filtered = reports.filter((r) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'critical') return r.severity === 'critical';
      if (activeFilter === 'investigating') return r.status === 'investigating';
      if (activeFilter === 'resolved') return r.status === 'resolved';
      return true;
    });

    filtered.forEach((rep) => {
      const marker = L.marker([rep.location.lat, rep.location.lng], {
        icon: createReportIcon(rep.severity, rep.referenceNo),
      });

      const repGov = GOVERNORATES.find((g) => g.id === rep.location.governorateId);
      const repGovName = language === 'ar' ? (repGov?.nameAr || '') : (repGov?.nameEn || '');

      const repTitle = language === 'en' && rep.titleEn ? rep.titleEn : rep.title;
      const repDistrict = language === 'en' && rep.location?.cityDistrictEn ? rep.location.cityDistrictEn : (rep.location?.cityDistrict || '');

      // Bind rich popup
      marker.bindPopup(`
        <div style="font-family: inherit; direction: ${language === 'ar' ? 'rtl' : 'ltr'}; min-width: 200px;">
          <div style="font-weight: 800; color: #d97706; font-size: 13px; margin-bottom: 2px;">
            ${rep.referenceNo}
          </div>
          <div style="font-weight: 700; color: #0f172a; font-size: 13px; margin-bottom: 4px;">
            ${repTitle}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 8px;">
            📍 ${repDistrict}${repDistrict && repGovName ? (language === 'ar' ? '، ' : ', ') : ''}${repGovName}
          </div>
          <button id="view-rep-${rep.id}" style="width: 100%; padding: 6px 10px; background-color: #0f172a; color: white; border-radius: 8px; font-size: 11px; font-weight: bold; cursor: pointer; border: none;">
            ${language === 'ar' ? 'عرض وتتبع تفاصيل البلاغ ➔' : 'Inspect Report Details ➔'}
          </button>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-rep-${rep.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectReport) onSelectReport(rep.id);
          };
        }
      });

      markersGroup.addLayer(marker);
    });

    markersGroup.addTo(map);
    reportMarkersLayerRef.current = markersGroup;
  }, [reports, activeFilter, mode, language]);

  // Master High-Accuracy GPS Trigger
  const handleTriggerGps = async () => {
    setIsLocating(true);
    setLocationFeedback(
      language === 'ar'
        ? '🛰️ جاري فتح وحدة الـ GPS والاتصال المباشر بالأقمار الصناعية...'
        : 'Connecting to GPS Satellites...'
    );

    try {
      const res = await acquireAccurateGpsLocation(language, (msg) => {
        setLocationFeedback(msg);
      });

      const map = mapInstanceRef.current;
      if (map) {
        // Fly smoothly to exact user GPS coordinates
        map.flyTo([res.lat, res.lng], 16, {
          duration: 1.5,
        });

        // Update Pin Marker
        if (pickerMarkerRef.current) {
          pickerMarkerRef.current.setLatLng([res.lat, res.lng]);
        } else {
          pickerMarkerRef.current = L.marker([res.lat, res.lng], {
            icon: createPickerIcon(),
            draggable: true,
          }).addTo(map);
        }

        // Draw GPS Accuracy Circle
        if (accuracyCircleRef.current) {
          map.removeLayer(accuracyCircleRef.current);
        }

        accuracyCircleRef.current = L.circle([res.lat, res.lng], {
          radius: Math.max(res.accuracyMeters, 15),
          color: '#3b82f6',
          fillColor: '#60a5fa',
          fillOpacity: 0.18,
          weight: 2,
        }).addTo(map);
      }

      // Propagate to form
      if (onCoordinatesChange) {
        onCoordinatesChange(
          { lat: res.lat, lng: res.lng },
          res.governorateId,
          res.district,
          res.street
        );
      }

      setLocationFeedback(
        language === 'ar'
          ? `🎯 ${res.statusMessageAr || 'تم قفل الـ GPS بنجاح'}: [${res.lat}° N, ${res.lng}° E] — ${res.district}، ${res.governorateNameAr}`
          : `🎯 GPS Fix locked: [${res.lat}° N, ${res.lng}° E] — ${res.district}, ${res.governorateNameEn}`
      );
      setTimeout(() => setLocationFeedback(null), 5500);
    } catch (err: any) {
      setLocationFeedback(
        language === 'ar'
          ? 'تعذر الوصول إلى الـ GPS. يمكنك النقر مباشرة على الخريطة أو البحث باسم الشارع لتحديده بدقة.'
          : 'Could not access GPS. Please click on the map or search by address.'
      );
      setTimeout(() => setLocationFeedback(null), 4500);
    } finally {
      setIsLocating(false);
    }
  };

  // Search Address Handling
  const handleSearchChange = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchSuggestions([]);
      return;
    }
    const results = await searchEgyptianAddress(val, language);
    setSearchSuggestions(results);
  };

  const handleSelectSearchResult = (result: SearchAddressResult) => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([result.lat, result.lng], 16, { duration: 1.2 });
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLatLng([result.lat, result.lng]);
      }
      if (accuracyCircleRef.current) {
        map.removeLayer(accuracyCircleRef.current);
        accuracyCircleRef.current = null;
      }
    }

    if (onCoordinatesChange) {
      onCoordinatesChange(
        { lat: result.lat, lng: result.lng },
        result.govId,
        result.district,
        result.street
      );
    }

    setSearchQuery('');
    setSearchSuggestions([]);
    setLocationFeedback(
      language === 'ar'
        ? `تم الانتقال المباشر إلى: ${result.district} — ${result.street} (${result.govName})`
        : `Centered on: ${result.district} — ${result.street}`
    );
    setTimeout(() => setLocationFeedback(null), 3500);
  };

  const handleSelectAreaPreset = (area: typeof EGYPT_PRESET_AREAS[0]) => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([area.lat, area.lng], 15, { duration: 1.2 });
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLatLng([area.lat, area.lng]);
      }
      if (accuracyCircleRef.current) {
        map.removeLayer(accuracyCircleRef.current);
        accuracyCircleRef.current = null;
      }
    }

    if (onCoordinatesChange) {
      onCoordinatesChange(
        { lat: area.lat, lng: area.lng },
        area.govId,
        language === 'ar' ? area.district : area.nameEn,
        language === 'ar' ? area.street : area.nameEn
      );
    }

    setLocationFeedback(
      language === 'ar'
        ? `تم الانتقال المباشر إلى: ${area.nameAr} [${area.lat}° N, ${area.lng}° E]`
        : `Centered on: ${area.nameEn}`
    );
    setTimeout(() => setLocationFeedback(null), 3500);
  };

  const copyCoordinates = () => {
    const text = `${currentCoords.lat.toFixed(5)}, ${currentCoords.lng.toFixed(5)}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2500);
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${currentCoords.lat},${currentCoords.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-300/80 bg-slate-900 shadow-xl flex flex-col select-none text-slate-100 w-full max-w-full min-w-0">
      {/* Top Map Toolbar */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-3.5 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2.5 z-20 backdrop-blur-md w-full min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-100 text-xs sm:text-sm flex items-center gap-1.5 flex-wrap">
              <span>{language === 'ar' ? 'الخريطة التفاعلية ونظام الـ GPS الحي' : 'Live Interactive Map & GPS'}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {language === 'ar' ? 'مصر' : 'Egypt'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-amber-400 font-mono tabular-nums">
              <span>[{currentCoords.lat.toFixed(4)}° N, {currentCoords.lng.toFixed(4)}° E]</span>
              <button
                type="button"
                onClick={copyCoordinates}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={language === 'ar' ? 'نسخ الإحداثيات' : 'Copy Coordinates'}
              >
                {copiedCoords ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Map Layer Switch (Streets / Satellite) */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setMapType('streets')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapType === 'streets'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'ar' ? 'شوارع' : 'Streets'}
            </button>
            <button
              type="button"
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapType === 'satellite'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'ar' ? 'قمر صناعي' : 'Satellite'}
            </button>
          </div>

          {/* Master GPS Button */}
          {mode === 'picker' && (
            <button
              type="button"
              onClick={handleTriggerGps}
              disabled={isLocating}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg ring-2 ring-blue-400/40"
              title={language === 'ar' ? 'قفل موقعي بدقة عبر الـ GPS' : 'Lock GPS Location'}
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>
                {isLocating
                  ? (language === 'ar' ? 'جاري الاتصال...' : 'Connecting...')
                  : (language === 'ar' ? 'موقعي الآن (GPS)' : 'Locate Me (GPS)')}
              </span>
            </button>
          )}

          {/* Viewer Mode Filter Pills */}
          {mode === 'viewer' && (
            <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  activeFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                {language === 'ar' ? 'الكل' : 'All'}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('critical')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  activeFilter === 'critical' ? 'bg-rose-600 text-white' : 'text-slate-400'
                }`}
              >
                {language === 'ar' ? 'حرجة' : 'Critical'}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('resolved')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  activeFilter === 'resolved' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                {language === 'ar' ? 'منجزة' : 'Resolved'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Egyptian Cities & Hubs Strip */}
      {mode === 'picker' && (
        <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar w-full max-w-full min-w-0">
          <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{language === 'ar' ? 'نطاقات سريعة:' : 'Quick Hubs:'}</span>
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {EGYPT_PRESET_AREAS.map((area, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectAreaPreset(area)}
                className="px-2.5 py-0.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 whitespace-nowrap transition-colors cursor-pointer text-[10px] font-semibold shrink-0"
              >
                {language === 'ar' ? area.nameAr : area.nameEn}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Egyptian Address Search Bar */}
      {mode === 'picker' && (
        <div className="relative z-20 px-3 py-2 bg-slate-950/90 border-b border-slate-800 flex items-center gap-2 w-full min-w-0">
          <div className="relative flex-1 w-full min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'ابحث باسم الشارع، الحي، أو الميدان في مصر (مثل: الأربعين السويس، شارع عباس العقاد، المعادي، سموحة، الدقي...)'
                  : 'Search Egyptian street, square, or district (e.g. Al-Arbaeen, Abbas El-Akkad, Maadi, Dokki...)'
              }
              className="w-full pl-8 pr-3 rtl:pr-8 rtl:pl-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 min-w-0"
            />

            {/* Suggestions Dropdown */}
            {searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-30 divide-y divide-slate-800 animate-in fade-in max-h-60 overflow-y-auto">
                {searchSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full p-2.5 text-start hover:bg-slate-800 transition-colors flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-amber-300 truncate">
                        {item.displayName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {item.district} — {item.street} ({item.govName})
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] text-slate-200 bg-blue-600/40 border border-blue-500/50 px-2.5 py-1 rounded-lg font-bold">
                      {language === 'ar' ? 'تحديد' : 'Pick'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Feedback Toast Banner */}
      {locationFeedback && (
        <div className="absolute top-24 left-3 right-3 z-30 p-2.5 bg-slate-900/95 border border-amber-400/70 rounded-xl text-xs text-amber-300 shadow-2xl flex items-center gap-2 backdrop-blur-md animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-bold leading-relaxed">{locationFeedback}</span>
        </div>
      )}

      {/* Leaflet Map DOM Node */}
      <div
        ref={mapContainerRef}
        dir="ltr"
        className={`w-full max-w-full overflow-hidden ${heightClass} z-10`}
        style={{ minHeight: '320px', direction: 'ltr' }}
      />

      {/* On-Map Floating Zoom & Re-Center Controls */}
      <div className="absolute bottom-10 right-3 z-20 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 shadow-lg flex items-center justify-center cursor-pointer transition-colors active:scale-95"
          title={language === 'ar' ? 'تكبير' : 'Zoom In'}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 shadow-lg flex items-center justify-center cursor-pointer transition-colors active:scale-95"
          title={language === 'ar' ? 'تصغير' : 'Zoom Out'}
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            mapInstanceRef.current?.flyTo([currentCoords.lat, currentCoords.lng], 15);
          }}
          className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-slate-700 shadow-lg flex items-center justify-center cursor-pointer transition-colors active:scale-95"
          title={language === 'ar' ? 'إعادة التوسيط على المؤشر' : 'Center on Pin'}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* On-Map Quick Floating GPS Button (Mobile-Friendly) */}
      {mode === 'picker' && (
        <div className="absolute bottom-10 left-3 z-20">
          <button
            type="button"
            onClick={handleTriggerGps}
            disabled={isLocating}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-2xl border-2 border-blue-400/80 flex items-center gap-2 text-xs font-black transition-all cursor-pointer hover:scale-105 active:scale-95 ring-2 ring-blue-500/40"
            title={language === 'ar' ? 'تحديد موقعي الدقيق عبر الـ GPS' : 'Lock GPS'}
          >
            <Crosshair className={`w-4 h-4 text-amber-300 ${isLocating ? 'animate-spin' : ''}`} />
            <span>
              {isLocating
                ? (language === 'ar' ? 'جاري الاتصال...' : 'Locating...')
                : (language === 'ar' ? 'موقعي (GPS)' : 'My GPS')}
            </span>
          </button>
        </div>
      )}

      {/* Footer Info Bar */}
      <div className="bg-slate-950 border-t border-slate-800 px-3.5 py-2 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {mode === 'picker'
              ? (language === 'ar'
                ? 'انقر على الخريطة أو اسحب الدبوس لتحديد الشارع والحي بدقة، أو اضغط "موقعي الآن (GPS)" لتسجيله تلقائياً.'
                : 'Click map or drag pin to fine-tune district and street, or click "Locate Me (GPS)".')
              : (language === 'ar'
                ? 'انقر على أي بلاغ بالخريطة لعرض تفاصيله وتحديثات الاستجابة.'
                : 'Click any report pin on the map to inspect status.')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openInGoogleMaps}
            className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer text-[10px] font-semibold"
          >
            <span>{language === 'ar' ? 'فتح في خرائط Google' : 'Open Google Maps'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
          <div className="text-amber-400/90 font-mono text-[10px]">
            {language === 'ar' ? 'نظام WGS84 العالمي' : 'WGS84 Egyptian Grid'}
          </div>
        </div>
      </div>
    </div>
  );
};
