import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';

// Leaflet işaretçi ikonlarını düzelt
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const RoutePlannerPage = () => {
    const [title, setTitle] = useState('');
    const [city, setCity] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState('orta');
    const [startAddress, setStartAddress] = useState('');
    const [endAddress, setEndAddress] = useState('');
    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [startLocation, setStartLocation] = useState(null);
    const [endLocation, setEndLocation] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [selectionMode, setSelectionMode] = useState(null);
    
    // Harita örneklerini takip etmek için Ref'ler
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const routingControlRef = useRef(null);
    const startMarkerRef = useRef(null);
    const endMarkerRef = useRef(null);
    const handleMapClickRef = useRef(null);

    // İlk harita kurulumu
    useEffect(() => {
        // Eklentiler için L'nin global olarak erişilebilir olduğundan emin ol
        if (typeof window !== 'undefined') {
            window.L = L;
        }

        const initMap = async () => {
            // L hazır olduğunda eklentiyi dinamik olarak içe aktar
            await import('leaflet-routing-machine');

            if (!mapInstanceRef.current && mapRef.current) {
                // Haritayı Türkiye (Ankara) merkezli başlat
                mapInstanceRef.current = L.map(mapRef.current).setView([39.9334, 32.8597], 6);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19
                }).addTo(mapInstanceRef.current);

                // Bayat closure'ları önlemek için Ref kullanan harita tıklama işleyicisi
                mapInstanceRef.current.on('click', (e) => {
                    if (handleMapClickRef.current) {
                        handleMapClickRef.current(e.latlng);
                    }
                });
            }
        };

        initMap();

        // Temizlik fonksiyonu
        return () => {
             // Bileşen yeniden render edilirse genellikle harita örneğini tutmak isteriz,
             // ancak mount'tan kaldırılırsa temizleyebiliriz. Şimdilik basit tutuyoruz.
        };
    }, []);

    // İşleyici değiştiğinde ref'i güncelle (selectionMode gibi durumlara bağlı)
    useEffect(() => {
        handleMapClickRef.current = handleMapClick;
    });

    // Mevcut rotaları getir
    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const searchParams = window.location.search;
                const response = await fetch(`/api/route${searchParams}`);
                const data = await response.json();
                setRoutes(data);
            } catch (error) {
                console.error("Error fetching routes:", error);
            }
        };
        fetchRoutes(); 
    }, []);

    const handleMapClick = async (latlng) => {
        const { lat, lng } = latlng;
        
        // Seçim moduna veya akıllı varsayılana göre hedefi belirle
        let target = selectionMode;
        if (!target) {
            if (!startLocation) target = 'start';
            else target = 'end';
        }

        try {
            const address = await reverseGeocode(lat, lng);
            
            if (target === 'start') {
                const newStart = { lat, lng, address };
                setStartLocation(newStart);
                setStartAddress(address);
                updateMarker('start', lat, lng, address);
                
                // Bitiş varsa, yeniden hesapla
                if (endLocation) {
                    calculateRoute(null, newStart);
                }
            } else {
                const newEnd = { lat, lng, address };
                setEndLocation(newEnd);
                setEndAddress(address);
                updateMarker('end', lat, lng, address);
                
                // Başlangıç varsa, yeniden hesapla
                if (startLocation) {
                    calculateRoute(newEnd, null);
                }
            }
        } catch (error) {
            console.error("Geocoding error:", error);
        }
    };

    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                headers: { 'User-Agent': 'Turizm Platformu' }
            });
            const data = await response.json();
            return data.display_name || `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        } catch (error) {
            return `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
    };

    const geocodeAddress = async (query) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=tr&limit=1`, {
                 headers: { 'User-Agent': 'Turizm Platformu' }
            });
            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                    address: data[0].display_name
                };
            }
            return null;
        } catch (error) {
            console.error("Geocoding search error:", error);
            return null;
        }
    };

    const updateMarker = (type, lat, lng, popupText) => {
        if (type === 'start') {
            if (startMarkerRef.current) mapInstanceRef.current.removeLayer(startMarkerRef.current);
            startMarkerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current)
                .bindPopup(`Başlangıç: ${popupText}`).openPopup();
        } else {
            if (endMarkerRef.current) mapInstanceRef.current.removeLayer(endMarkerRef.current);
            endMarkerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current)
                .bindPopup(`Bitiş: ${popupText}`).openPopup();
        }
        mapInstanceRef.current.setView([lat, lng], 13);
    };

    const handleAddressChange = async (type, value) => {
        if (type === 'start') setStartAddress(value);
        else setEndAddress(value);
        
        // Gerçek bir uygulamada çok fazla isteği önlemek için burada debounce kullanırsınız
        // Basitlik için şimdilik blur veya enter tuşunu bekleyeceğiz
    };

    const handleAddressBlur = async (type) => {
        const query = type === 'start' ? startAddress : endAddress;
        if (!query) return;

        const result = await geocodeAddress(query);
        if (result) {
            if (type === 'start') {
                setStartLocation(result);
                updateMarker('start', result.lat, result.lng, result.address);
                if (endLocation) calculateRoute(null, result);
            } else {
                setEndLocation(result);
                updateMarker('end', result.lat, result.lng, result.address);
                if (startLocation) calculateRoute(null, null, result);
            }
        } else {
            alert('Adres bulunamadı!');
        }
    };

    const calculateRoute = (newEnd = null, newStart = null) => {
        const s = newStart || startLocation;
        const e = newEnd || endLocation;

        if (!s || !e) return;

        if (routingControlRef.current) {
            mapInstanceRef.current.removeControl(routingControlRef.current);
        }

        routingControlRef.current = L.Routing.control({
            waypoints: [
                L.latLng(s.lat, s.lng),
                L.latLng(e.lat, e.lng)
            ],
            routeWhileDragging: false,
            // OSRM demo sunucusunu kullan (mevcut uygulamayla aynı)
             router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                profile: 'driving'
            }),
            lineOptions: {
                styles: [{color: '#f49d25', weight: 4, opacity: 0.8}] // Ana rengi kullan
            },
            addWaypoints: false,
            showAlternatives: false,
            createMarker: function() { return null; } // Varsayılan işaretçileri oluşturma, kendimizinkini kullanıyoruz
        }).addTo(mapInstanceRef.current);

        routingControlRef.current.on('routesfound', function(e) {
            const routes = e.routes;
            if (routes && routes.length > 0) {
                const route = routes[0];
                const distKm = (route.summary.totalDistance / 1000).toFixed(2);
                const timeSec = route.summary.totalTime;
                
                const hours = Math.floor(timeSec / 3600);
                const minutes = Math.floor((timeSec % 3600) / 60);
                const durationStr = hours > 0 
                    ? `${hours} saat ${minutes} dakika`
                    : `${minutes} dakika`;

                setDistance(distKm);
                setDuration(durationStr);
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title || !city) { // !startLocation || !endLocation yerine !title || !city olarak değiştirildi
            alert('Lütfen rota başlığı ve şehir seçin!');
            return;
        }

        // Yönlendirme kontrolünden yol noktalarını al
        // routingControlRef.current'ın var olduğundan ve yol noktalarına sahip olduğundan emin ol
        if (!routingControlRef.current) {
            alert('Lütfen önce bir rota oluşturun!');
            return;
        }

        const waypoints = routingControlRef.current.getWaypoints()
            .filter(wp => wp.latLng)
            .map(wp => ({
                lat: wp.latLng.lat,
                lng: wp.latLng.lng,
                address: wp.name || '',
                name: wp.name || ''
            }));

        if (waypoints.length < 2) {
            alert('Lütfen en az iki nokta içeren bir rota oluşturun!');
            return;
        }

        const payload = {
            title,
            description,
            city: city, // 'city' durum değişkenini kullanarak
            difficulty, // Orijinal handleSubmit'ten korundu
            startLocation: waypoints[0],
            endLocation: waypoints[waypoints.length - 1],
            waypoints: JSON.stringify(waypoints), // Backend stringified JSON bekliyor
            distance,
            duration
        };

        try {
            const response = await fetch('/api/route/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                alert('Rota başarıyla kaydedildi!');
                // Formu sıfırla
                setTitle('');
                setCity('');
                setDescription('');
                setStartAddress('');
                setEndAddress('');
                setStartLocation(null);
                setEndLocation(null);
                setDistance('');
                setDuration('');
                
                // Haritayı temizle
                if (startMarkerRef.current) mapInstanceRef.current.removeLayer(startMarkerRef.current);
                if (endMarkerRef.current) mapInstanceRef.current.removeLayer(endMarkerRef.current);
                if (routingControlRef.current) mapInstanceRef.current.removeControl(routingControlRef.current);
                startMarkerRef.current = null;
                endMarkerRef.current = null;
                routingControlRef.current = null;

                // Rotaları yenile
                 const searchParams = window.location.search;
                 const listRes = await fetch(`/api/route${searchParams}`);
                 const listData = await listRes.json();
                 setRoutes(listData);
            } else {
                alert('Hata: ' + (result.error || 'Bilinmeyen hata'));
            }
        } catch (error) {
            console.error("Submit error:", error);
            alert('Bir hata oluştu: ' + error.message);
        }
    };

    const handleLoadRoute = (route) => {
        let start = route.startLocation;
        let end = route.endLocation;

        if (!start || !end) {
             if (route.waypoints) {
                 try {
                     const wps = typeof route.waypoints === 'string' ? JSON.parse(route.waypoints) : route.waypoints;
                     if (wps && wps.length >= 2) {
                         start = wps[0];
                         end = wps[wps.length - 1];
                     }
                 } catch (e) {
                     console.error("Error parsing waypoints", e);
                 }
             }
        }

        if (start && end) {
            setStartLocation(start);
            setEndLocation(end);
            setStartAddress(start.address || '');
            setEndAddress(end.address || '');
            
            // Önceki işaretçileri temizle
            if (startMarkerRef.current) mapInstanceRef.current.removeLayer(startMarkerRef.current);
            if (endMarkerRef.current) mapInstanceRef.current.removeLayer(endMarkerRef.current);
            if (routingControlRef.current) mapInstanceRef.current.removeControl(routingControlRef.current);

            // İşaretçileri güncelle
            updateMarker('start', start.lat, start.lng, start.address || '');
            updateMarker('end', end.lat, end.lng, end.address || '');
            
            // Rotayı hesapla
            calculateRoute(end, start);
            
            // Haritaya kaydır
            mapRef.current.scrollIntoView({ behavior: 'smooth' });
            
            // Düzenleme/görüntüleme için formu rota detaylarıyla doldur
            setTitle(route.title);
            setCity(route.city);
            setDescription(route.description);
            setDifficulty(route.difficulty);
        } else {
            alert('Rota verisi eksik veya bozuk.');
        }
    };

    return (
        <div className="bg-background-light min-h-screen py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 border-b border-border-color pb-4">
                    <h1 className="text-3xl font-display font-bold text-text-main">
                        <span className="material-symbols-outlined align-bottom mr-2 text-primary">map</span>
                        Rota Planlayıcı
                    </h1>
                    <p className="mt-2 text-text-sub">Kendi seyahat rotanızı oluşturun ve kaydedin.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sol Sütun: Form */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl shadow-soft p-6 border border-border-color">
                            <h2 className="text-xl font-bold text-text-main mb-4">Yeni Rota</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-sub mb-1">Rota Başlığı</label>
                                    <input 
                                        type="text" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full rounded-lg border border-border-color px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                        required 
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-text-sub mb-1">Şehir</label>
                                    <input 
                                        type="text" 
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="w-full rounded-lg border border-border-color px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                        required 
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-sub mb-1">Açıklama</label>
                                    <textarea 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows="3"
                                        className="w-full rounded-lg border border-border-color px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-sub mb-1">Mesafe (km)</label>
                                        <input 
                                            type="text" 
                                            value={distance}
                                            readOnly
                                            className="w-full rounded-lg bg-gray-50 border border-border-color px-4 py-2 text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-sub mb-1">Süre</label>
                                        <input 
                                            type="text" 
                                            value={duration}
                                            readOnly
                                            className="w-full rounded-lg bg-gray-50 border border-border-color px-4 py-2 text-gray-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-sub mb-1">Zorluk Seviyesi</label>
                                    <div className="flex gap-4">
                                        {['kolay', 'orta', 'zor'].map((level) => (
                                            <label key={level} className="flex items-center cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="difficulty" 
                                                    value={level}
                                                    checked={difficulty === level}
                                                    onChange={(e) => setDifficulty(e.target.value)}
                                                    className="sr-only peer"
                                                />
                                                <div className="px-3 py-1 rounded-full border border-border-color text-sm capitalize peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-colors hover:border-primary">
                                                    {level}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">save</span>
                                    Rotayı Kaydet
                                </button>
                            </form>
                        </div>

                         {/* Talimatlar Kutusu */}
                         <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <h3 className="text-blue-800 font-bold mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">info</span>
                                Nasıl Kullanılır?
                            </h3>
                            <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
                                <li><strong>Tıklayarak:</strong> Harita üzerinde başlangıç ve bitiş noktalarına tıklayın.</li>
                                <li><strong>Arayarak:</strong> Aşağıdaki kutucuklardan adres aratarak noktaları belirleyin.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Sağ Sütun: Harita ve Adres Arama */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Adres Arama Girdileri */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Başlangıç Noktası</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-primary">trip_origin</span>
                                    <input 
                                        type="text" 
                                        value={startAddress}
                                        onChange={(e) => handleAddressChange('start', e.target.value)}
                                        onBlur={() => handleAddressBlur('start')}
                                        placeholder="Şehir, ilçe veya mekan ara..."
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-color focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Bitiş Noktası</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-red-500">location_on</span>
                                    <input 
                                        type="text" 
                                        value={endAddress}
                                        onChange={(e) => handleAddressChange('end', e.target.value)}
                                        onBlur={() => handleAddressBlur('end')}
                                        placeholder="Şehir, ilçe veya mekan ara..."
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-color focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sağ Sütun: Harita */}
                    <div className="h-[600px] bg-white rounded-xl shadow-soft overflow-hidden border border-border-color relative group">
                        <div ref={mapRef} className="w-full h-full z-0"></div>
                        
                        {/* Harita Kontrolleri Katmanı */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[400]">
                            <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectionMode('start'); }}
                                className={`px-4 py-2 rounded-lg shadow-lg transition-all font-bold text-sm flex items-center gap-2 ${selectionMode === 'start' ? 'bg-primary text-white ring-2 ring-orange-200' : 'bg-white text-text-main hover:bg-gray-50'}`}
                                title="Başlangıç Noktası Seç"
                            >
                                <span className="material-symbols-outlined text-lg">trip_origin</span>
                                Başlangıç Seç
                            </button>
                            <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectionMode('end'); }}
                                className={`px-4 py-2 rounded-lg shadow-lg transition-all font-bold text-sm flex items-center gap-2 ${selectionMode === 'end' ? 'bg-red-500 text-white ring-2 ring-red-200' : 'bg-white text-text-main hover:bg-gray-50'}`}
                                title="Bitiş Noktası Seç"
                            >
                                <span className="material-symbols-outlined text-lg">location_on</span>
                                Bitiş Seç
                            </button>
                        </div>
                    </div>
                    </div>
                </div>

                {/* Kayıtlı Rotalar Listesi */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-text-main mb-4">Kayıtlı Rotalar</h2>
                    {routes.length === 0 ? (
                         <div className="bg-white rounded-xl shadow-soft p-6 border border-border-color text-center text-text-sub">
                            Henüz kayıtlı rota bulunmuyor.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {routes.map((route) => (
                                <div key={route._id} className="bg-white rounded-xl shadow-soft p-6 border border-border-color hover:border-primary transition-colors">
                                    <h3 className="font-bold text-lg text-text-main mb-2">{route.title}</h3>
                                    <p className="text-sm text-text-sub mb-4 line-clamp-2">{route.description}</p>
                                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            {route.city}
                                        </span>
                                        {route.distance && (
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">straighten</span>
                                                {route.distance} km
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">signal_cellular_alt</span>
                                            <span className="capitalize">{route.difficulty}</span>
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => handleLoadRoute(route)}
                                        className="w-full mt-auto bg-white border border-primary text-primary hover:bg-primary hover:text-white transition-colors py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 group"
                                    >
                                        Rotayı Göster
                                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-lg">arrow_forward</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoutePlannerPage;
