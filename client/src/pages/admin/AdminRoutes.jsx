import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';

// Fix Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const AdminRoutes = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Map related refs and state
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const startMarkerRef = useRef(null);
    const endMarkerRef = useRef(null);
    const routingControlRef = useRef(null);
    // Ref to access latest handleMapClick inside Leaflet event
    const handleMapClickRef = useRef(null);
    const [selectionMode, setSelectionMode] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        city: '',
        status: 'active',
        difficulty: 'orta',
        startLocation: { address: '', lat: '', lng: '' },
        endLocation: { address: '', lat: '', lng: '' },
        distance: '',
        duration: ''
    });
    const { csrfToken } = useAuth();

    useEffect(() => {
        fetchRoutes();
    }, []);

    // Update handleMapClickRef whenever functionality depends on state
    useEffect(() => {
        handleMapClickRef.current = handleMapClick;
    });

    // Initialize map when modal opens
    useEffect(() => {
        if (isModalOpen) {
            const timer = setTimeout(() => {
                initMap();
            }, 100);
            return () => clearTimeout(timer);
        } else {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                startMarkerRef.current = null;
                endMarkerRef.current = null;
                routingControlRef.current = null;
            }
        }
    }, [isModalOpen]);

    // Update markers when form data changes
    useEffect(() => {
        if (isModalOpen && mapInstanceRef.current) {
            updateMapMarkers();
        }
    }, [formData.startLocation, formData.endLocation, isModalOpen]);

    const initMap = async () => {
        if (mapInstanceRef.current) return;
        
        const container = document.getElementById('admin-map');
        if (!container) return;

        if (typeof window !== 'undefined') {
            window.L = L;
            try {
                await import('leaflet-routing-machine');
            } catch (e) {
                console.warn('Leaflet routing machine already loaded or failed', e);
            }
        }

        mapInstanceRef.current = L.map('admin-map').setView([39.0, 35.0], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);

        mapInstanceRef.current.on('click', (e) => {
            if (handleMapClickRef.current) {
                handleMapClickRef.current(e.latlng);
            }
        });
        
        updateMapMarkers();
    };

    const updateMapMarkers = () => {
        if (!mapInstanceRef.current) return;

        if (routingControlRef.current) {
             try {
                mapInstanceRef.current.removeControl(routingControlRef.current);
             } catch(e) {/* ignore */}
             routingControlRef.current = null;
        }

        const s = formData.startLocation;
        const e = formData.endLocation;

        if (s && s.lat && s.lng) {
            if (startMarkerRef.current) mapInstanceRef.current.removeLayer(startMarkerRef.current);
            startMarkerRef.current = L.marker([s.lat, s.lng]).addTo(mapInstanceRef.current)
                .bindPopup("Başlangıç");
        }

        if (e && e.lat && e.lng) {
            if (endMarkerRef.current) mapInstanceRef.current.removeLayer(endMarkerRef.current);
            endMarkerRef.current = L.marker([e.lat, e.lng]).addTo(mapInstanceRef.current)
                .bindPopup("Bitiş");
        }

        if (s && s.lat && s.lng && e && e.lat && e.lng) {
             const bounds = L.latLngBounds([s.lat, s.lng], [e.lat, e.lng]);
             mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });

             routingControlRef.current = L.Routing.control({
                waypoints: [
                    L.latLng(s.lat, s.lng),
                    L.latLng(e.lat, e.lng)
                ],
                routeWhileDragging: false,
                router: L.Routing.osrmv1({
                    serviceUrl: 'https://router.project-osrm.org/route/v1',
                    profile: 'driving'
                }),
                lineOptions: {
                    styles: [{color: '#136dec', weight: 4, opacity: 0.8}]
                },
                addWaypoints: false,
                createMarker: function() { return null; }
            }).addTo(mapInstanceRef.current);
        }
    };

    const handleMapClick = async (latlng) => {
        const { lat, lng } = latlng;
        let target = selectionMode;

        // Smart selection logic
        if (!target) {
            if (!formData.startLocation.lat) target = 'startLocation';
            else if (!formData.endLocation.lat) target = 'endLocation';
            else target = 'endLocation'; // Overwrite end by default if both exist
        }

        const address = await reverseGeocode(lat, lng);
        
        setFormData(prev => {
            const newState = {
                ...prev,
                [target]: { lat, lng, address }
            };
            
            // Trigger calculation immediately inside setState callback-ish logic or effect
            // Actually let's just use the effect we already have or helper
            // We'll calculate manually here to ensure sync
            
            return newState;
        });

        // Trigger distance calc logic helper
        // Since setFormData is async, passing the NEW values manually
        const s = target === 'startLocation' ? { lat, lng } : formData.startLocation;
        const e = target === 'endLocation' ? { lat, lng } : formData.endLocation;
        
        if (s.lat && s.lng && e.lat && e.lng) {
             const dist = calculateDistance(s.lat, s.lng, e.lat, e.lng);
             let dur = '';
             if (dist > 0) {
                 const hours = dist / 60;
                 const h = Math.floor(hours);
                 const m = Math.round((hours - h) * 60);
                 dur = `${h} sa ${m} dk`;
             }
             setFormData(prev => ({ ...prev, distance: dist, duration: dur }));
        }
    };

    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                headers: { 'User-Agent': 'Turizm Admin Panel' }
            });
            const data = await response.json();
            return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        } catch (error) {
            return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
    };

    // formData state moved to top
    // calculateDistance helper
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1); // Distance in km
    };

    const handleLocationChange = (type, field, value) => {
        setFormData(prev => {
            const newState = {
                ...prev,
                [type]: {
                    ...prev[type],
                    [field]: value
                }
            };
            
            // Auto calculate distance and duration if coords change
            if ((field === 'lat' || field === 'lng') && 
                newState.startLocation.lat && newState.startLocation.lng && 
                newState.endLocation.lat && newState.endLocation.lng) {
                
                const dist = calculateDistance(
                    parseFloat(newState.startLocation.lat),
                    parseFloat(newState.startLocation.lng),
                    parseFloat(newState.endLocation.lat),
                    parseFloat(newState.endLocation.lng)
                );
                
                newState.distance = dist;
                // Estimate duration: assume 60 km/h average speed
                // 150 km -> 2.5 hours -> 2 saat 30 dakika
                if (dist > 0) {
                    const hours = dist / 60;
                    const h = Math.floor(hours);
                    const m = Math.round((hours - h) * 60);
                    newState.duration = `${h} sa ${m} dk`;
                }
            }
            return newState;
        });
    };

    const fetchRoutes = async () => {
        try {
            console.log('Fetching routes...');
            const response = await fetch('/admin/route', {
                headers: {
                    'Accept': 'application/json'
                }
            });
            console.log('Response status:', response.status);
            
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error('Received non-JSON response:', text.substring(0, 100)); // Log first 100 chars
                throw new Error("Received non-JSON response");
            }

            const data = await response.json();
            console.log('Routes data:', data);

            if (data.routes) {
                setRoutes(data.routes);
            }
        } catch (error) {
            console.error('Error fetching routes:', error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setFormData({
            title: '',
            description: '',
            city: '',
            status: 'active',
            difficulty: 'orta',
            startLocation: { address: '', lat: '', lng: '' },
            endLocation: { address: '', lat: '', lng: '' },
            distance: '',
            duration: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (route) => {
        setFormData({
            id: route._id,
            title: route.title,
            description: route.description || '',
            city: route.city || '',
            status: route.status || 'active',
            difficulty: route.difficulty ? route.difficulty.toLowerCase() : 'orta',
            startLocation: { 
                address: route.startLocation?.address || '', 
                lat: route.startLocation?.lat || '', 
                lng: route.startLocation?.lng || '' 
            },
            endLocation: { 
                address: route.endLocation?.address || '', 
                lat: route.endLocation?.lat || '', 
                lng: route.endLocation?.lng || '' 
            },
            distance: route.distance || '',
            duration: route.duration || ''
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.city) {
            alert('Lütfen başlık ve şehir alanlarını doldurun.');
            return;
        }

        if (!formData.startLocation.lat || !formData.endLocation.lat) {
            alert('Lütfen haritadan başlangıç ve bitiş noktalarını seçin.');
            return;
        }

        try {
            console.log('Sending Form Data:', formData);

            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('city', formData.city);
            formDataToSend.append('status', formData.status);
            formDataToSend.append('difficulty', formData.difficulty);
            
            // Send locations as JSON strings
            formDataToSend.append('startLocation', JSON.stringify(formData.startLocation));
            formDataToSend.append('endLocation', JSON.stringify(formData.endLocation));
            
            formDataToSend.append('distance', formData.distance);
            formDataToSend.append('duration', formData.duration);
            
            if (formData.id) {
                formDataToSend.append('id', formData.id);
            }

            const response = await fetch('/admin/route/save', {
                method: 'POST',
                headers: {
                    'CSRF-Token': csrfToken
                },
                body: formDataToSend
            });
            
            const result = await response.json();
            if (result.success || response.ok) { // check response.ok as backup
                setIsModalOpen(false);
                fetchRoutes();
            } else {
                alert('Kaydetme hatası: ' + (result.error || 'Bilinmeyen hata'));
            }
        } catch (error) {
            console.error('Error saving route:', error);
            alert('Kaydetme sırasında bir hata oluştu');
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Bu rotayı silmek istediğinize emin misiniz?')) {
            try {
                const response = await fetch(`/admin/route/delete/${id}`, {
                    method: 'POST',
                    headers: {
                        'CSRF-Token': csrfToken
                    }
                });
                const result = await response.json();
                if (result.success) {
                    setRoutes(routes.filter(r => r._id !== id));
                } else {
                    alert('Silme başarısız: ' + result.error);
                }
            } catch (error) {
                console.error('Error deleting route:', error);
            }
        }
    };

    // Calculate Stats
    const totalRoutes = routes.length;
    const avgDistance = totalRoutes > 0 
        ? (routes.reduce((acc, curr) => acc + (parseFloat(curr.distance) || 0), 0) / totalRoutes).toFixed(1) 
        : 0;
    const longestRoute = routes.length > 0
        ? routes.reduce((prev, current) => (parseFloat(prev.distance) > parseFloat(current.distance)) ? prev : current)
        : null;

    return (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-white dark:bg-[#101822]">
           <style>{`
                /* Custom scrollbar for better dark mode experience */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #111822; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #324867; 
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #4b6a96; 
                }
            `}</style>

            {/* Mobile Header (Visible only on small screens) */}
            <div className="md:hidden h-16 bg-[#111822] border-b border-[#324867] flex items-center px-4 justify-between">
                <span className="font-bold text-white">TravelAdmin</span>
                <button className="text-white"><span className="material-symbols-outlined">menu</span></button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
                    {/* Page Header & Action */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Rota Yönetimi</h2>
                            <p className="text-slate-500 dark:text-[#92a9c9] text-base">Kullanıcılar tarafından oluşturulan seyahat rotalarını inceleyin ve yönetin.</p>
                        </div>
                        <button onClick={openCreateModal} className="flex items-center gap-2 bg-[#136dec] hover:bg-blue-600 text-white px-5 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-blue-500/20 active:scale-95">
                            <span className="material-symbols-outlined">add</span>
                            <span>Yeni Rota Ekle</span>
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-[#111822] border border-slate-200 dark:border-[#324867] rounded-xl p-6 shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-[#136dec]">
                                    <span className="material-symbols-outlined">route</span>
                                </div>
                                {/* <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold">+12%</span> */}
                            </div>
                            <p className="text-slate-500 dark:text-[#92a9c9] text-sm font-medium">Toplam Rota</p>
                            <p className="text-slate-900 dark:text-white text-2xl font-bold mt-1">{totalRoutes}</p>
                        </div>
                        <div className="bg-white dark:bg-[#111822] border border-slate-200 dark:border-[#324867] rounded-xl p-6 shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-500">
                                    <span className="material-symbols-outlined">straighten</span>
                                </div>
                                {/* <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold">+3%</span> */}
                            </div>
                            <p className="text-slate-500 dark:text-[#92a9c9] text-sm font-medium">Ortalama Uzunluk</p>
                            <p className="text-slate-900 dark:text-white text-2xl font-bold mt-1">{avgDistance} km</p>
                        </div>
                        <div className="bg-white dark:bg-[#111822] border border-slate-200 dark:border-[#324867] rounded-xl p-6 shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-500">
                                    <span className="material-symbols-outlined">flag</span>
                                </div>
                                {/* <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">2.4k kaydetme</span> */}
                            </div>
                            <p className="text-slate-500 dark:text-[#92a9c9] text-sm font-medium">En Uzun Rota</p>
                            <p className="text-slate-900 dark:text-white text-lg font-bold mt-1 truncate">{longestRoute ? longestRoute.title : '-'}</p>
                        </div>
                    </div>

                    {/* Routes Table */}
                    <div className="bg-white dark:bg-[#111822] border border-slate-200 dark:border-[#324867] rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-[#192433] border-b border-slate-200 dark:border-[#324867]">
                                        <th className="p-4 text-xs font-semibold text-slate-500 dark:text-[#92a9c9] uppercase tracking-wider">Rota Adı</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 dark:text-[#92a9c9] uppercase tracking-wider hidden sm:table-cell">Oluşturan</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 dark:text-[#92a9c9] uppercase tracking-wider hidden md:table-cell">Başlangıç / Bitiş</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 dark:text-[#92a9c9] uppercase tracking-wider">Mesafe</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 dark:text-[#92a9c9] uppercase tracking-wider hidden sm:table-cell">Zorluk</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 dark:text-[#92a9c9] uppercase tracking-wider">Durum</th>
                                        <th className="p-4 text-xs font-semibold text-slate-500 dark:text-[#92a9c9] uppercase tracking-wider text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-[#324867]">
                                    {loading ? (
                                        <tr><td colSpan="7" className="p-4 text-center text-slate-500">Yükleniyor...</td></tr>
                                    ) : routes.length === 0 ? (
                                        <tr><td colSpan="7" className="p-4 text-center text-slate-500">Kayıtlı rota bulunamadı.</td></tr>
                                    ) : (
                                        routes.map(route => (
                                            <tr key={route._id} className="group hover:bg-slate-50 dark:hover:bg-[#192433]/50 transition-colors cursor-pointer" onClick={() => openEditModal(route)}>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-[#324867] flex-shrink-0 overflow-hidden">
                                                            <img className="w-full h-full object-cover" src={route.image || 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=2070&auto=format&fit=crop'} alt={route.title} />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-white">{route.title}</p>
                                                            <p className="text-xs text-slate-500 dark:text-[#92a9c9] md:hidden">{route.startLocation?.address} / {route.endLocation?.address}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-slate-600 dark:text-[#92a9c9] hidden sm:table-cell">{route.author?.username || 'Admin'}</td>
                                                <td className="p-4 text-sm text-slate-600 dark:text-[#92a9c9] hidden md:table-cell">
                                                    <div className="flex items-center gap-1">
                                                        <span>{route.startLocation?.address?.split(',')[0]}</span>
                                                        <span className="material-symbols-outlined text-xs text-slate-400">arrow_forward</span>
                                                        <span>{route.endLocation?.address?.split(',')[0]}</span>
                                                    </div>

                                                </td>
                                                <td className="p-4 text-sm text-slate-900 dark:text-white font-medium">{route.distance}</td>
                                                <td className="p-4 hidden sm:table-cell">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        route.difficulty === 'Zor' ? 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400' :
                                                        route.difficulty === 'Orta' ? 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400' :
                                                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                    }`}>
                                                        {route.difficulty || 'Bilinmiyor'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                            route.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                                                        }`}></span>
                                                        <span className="text-sm text-slate-600 dark:text-slate-300">{route.status || 'Aktif'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={(e) => handleDelete(route._id, e)} 
                                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                                        >
                                                            <span className="material-symbols-outlined" style={{fontSize: "20px"}}>delete</span>
                                                        </button>
                                                        <button className="text-slate-400 hover:text-[#136dec] dark:hover:text-[#136dec] transition-colors">
                                                            <span className="material-symbols-outlined">chevron_right</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Route Detail Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white dark:bg-[#151e2b] rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col border border-slate-200 dark:border-[#324867] overflow-hidden animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#324867] bg-white dark:bg-[#111822] shrink-0">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {formData.id ? 'Rotayı Düzenle' : 'Yeni Rota Oluştur'}
                            </h3>
                            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/5" onClick={() => setIsModalOpen(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body - Form */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#0f172a]">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column: General Info */}
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Genel Bilgiler</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Rota Başlığı</label>
                                                <input 
                                                    type="text" 
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                    className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="Örn: Kapadokya Balon Turu"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Şehir</label>
                                                <input 
                                                    type="text" 
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                                                    className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Zorluk Seviyesi</label>
                                                    <select 
                                                        value={formData.difficulty}
                                                        onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                                                        className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                    >
                                                        <option value="kolay">Kolay</option>
                                                        <option value="orta">Orta</option>
                                                        <option value="zor">Zor</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Durum</label>
                                                    <select 
                                                        value={formData.status}
                                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                                        className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                    >
                                                        <option value="active">Aktif</option>
                                                        <option value="draft">Taslak</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Açıklama</label>
                                                <textarea 
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                    className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Location & Stats */}
                                <div className="space-y-6">
                                    {/* Map Visualization */}
                                    <div className="bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-700 h-[300px] z-0">
                                        <div id="admin-map" className="w-full h-full z-10"></div>
                                        
                                        {/* Map Controls */}
                                        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[400]">
                                            <button 
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectionMode('startLocation'); }}
                                                className={`px-3 py-1.5 rounded shadow-lg transition-all font-bold text-xs flex items-center gap-2 ${selectionMode === 'startLocation' ? 'bg-blue-600 text-white ring-2 ring-blue-300' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                                                title="Başlangıç Noktası Seç"
                                            >
                                                <span className="material-symbols-outlined text-sm">trip_origin</span>
                                                Başlangıç
                                            </button>
                                            <button 
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectionMode('endLocation'); }}
                                                className={`px-3 py-1.5 rounded shadow-lg transition-all font-bold text-xs flex items-center gap-2 ${selectionMode === 'endLocation' ? 'bg-red-600 text-white ring-2 ring-red-300' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                                                title="Bitiş Noktası Seç"
                                            >
                                                <span className="material-symbols-outlined text-sm">location_on</span>
                                                Bitiş
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Konum Bilgileri</h4>
                                        <div className="space-y-6">
                                            {/* Start Location */}
                                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                                <h5 className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[18px]">trip_origin</span> Başlangıç Noktası
                                                </h5>
                                                <div className="space-y-3">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Adres / Yer Adı"
                                                        value={formData.startLocation.address}
                                                        onChange={(e) => handleLocationChange('startLocation', 'address', e.target.value)}
                                                        className="w-full bg-white dark:bg-[#0f172a] border border-blue-200 dark:border-blue-800 rounded px-3 py-2 text-sm"
                                                    />
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <input 
                                                            type="number" 
                                                            placeholder="Enlem (Lat)"
                                                            value={formData.startLocation.lat}
                                                            onChange={(e) => handleLocationChange('startLocation', 'lat', e.target.value)}
                                                            className="w-full bg-white dark:bg-[#0f172a] border border-blue-200 dark:border-blue-800 rounded px-3 py-2 text-sm"
                                                        />
                                                        <input 
                                                            type="number" 
                                                            placeholder="Boylam (Lng)"
                                                            value={formData.startLocation.lng}
                                                            onChange={(e) => handleLocationChange('startLocation', 'lng', e.target.value)}
                                                            className="w-full bg-white dark:bg-[#0f172a] border border-blue-200 dark:border-blue-800 rounded px-3 py-2 text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* End Location */}
                                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-900/20">
                                                <h5 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[18px]">location_on</span> Bitiş Noktası
                                                </h5>
                                                <div className="space-y-3">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Adres / Yer Adı"
                                                        value={formData.endLocation.address}
                                                        onChange={(e) => handleLocationChange('endLocation', 'address', e.target.value)}
                                                        className="w-full bg-white dark:bg-[#0f172a] border border-emerald-200 dark:border-emerald-800 rounded px-3 py-2 text-sm"
                                                    />
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <input 
                                                            type="number" 
                                                            placeholder="Enlem (Lat)"
                                                            value={formData.endLocation.lat}
                                                            onChange={(e) => handleLocationChange('endLocation', 'lat', e.target.value)}
                                                            className="w-full bg-white dark:bg-[#0f172a] border border-emerald-200 dark:border-emerald-800 rounded px-3 py-2 text-sm"
                                                        />
                                                        <input 
                                                            type="number" 
                                                            placeholder="Boylam (Lng)"
                                                            value={formData.endLocation.lng}
                                                            onChange={(e) => handleLocationChange('endLocation', 'lng', e.target.value)}
                                                            className="w-full bg-white dark:bg-[#0f172a] border border-emerald-200 dark:border-emerald-800 rounded px-3 py-2 text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Calculated Stats */}
                                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl text-white shadow-lg">
                                        <h4 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                                            <span className="material-symbols-outlined">analytics</span> Otomatik Hesaplama
                                        </h4>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-1">Mesafe (km)</label>
                                                <input 
                                                    type="number" 
                                                    value={formData.distance}
                                                    readOnly
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white font-mono text-lg font-bold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-1">Tahmini Süre</label>
                                                <input 
                                                    type="text" 
                                                    value={formData.duration}
                                                    readOnly
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white font-mono text-lg font-bold"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-4 italic">
                                            * Mesafe ve süre, girilen koordinatlara göre otomatik hesaplanır.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-200 dark:border-[#324867] bg-white dark:bg-[#111822] flex justify-end gap-3 shrink-0">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium"
                            >
                                İptal
                            </button>
                            <button 
                                onClick={handleSave}
                                className="bg-[#136dec] hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-blue-500/20"
                            >
                                {formData.id ? 'Güncelle' : 'Kaydet'}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRoutes;
