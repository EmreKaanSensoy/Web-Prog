import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import 'leaflet/dist/leaflet.css';
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

const AdminGallery = () => {
    // Mock data for gallery images
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        city: '',
        category: 'genel',
        featured: false,
        image: null,
        location: { lat: '', lng: '', address: '' }
    });
    const { csrfToken } = useAuth();

    // Map Refs
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const handleMapClickRef = useRef(null);

    useEffect(() => {
        fetchGalleries();
    }, []);

    // Map Initialization Effect
    useEffect(() => {
        if (isModalOpen && !mapInstanceRef.current) {
            // Delay to ensure DOM is ready
            setTimeout(initMap, 100);
        }
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, [isModalOpen]);
    
    // Update marker on location change
    useEffect(() => {
        if (mapInstanceRef.current && formData.location && formData.location.lat && formData.location.lng) {
            const { lat, lng } = formData.location;
            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else {
                markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
            }
            mapInstanceRef.current.setView([lat, lng], 13);
        }
    }, [formData.location]);

    // Keep Ref updated
    useEffect(() => {
        handleMapClickRef.current = handleMapClick;
    });

    const initMap = () => {
        if (mapInstanceRef.current) return;
        
        const mapContainer = document.getElementById('gallery-map');
        if (!mapContainer) return;

        mapInstanceRef.current = L.map('gallery-map').setView([39.0, 35.0], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);

        mapInstanceRef.current.on('click', (e) => {
             if (handleMapClickRef.current) handleMapClickRef.current(e.latlng);
        });
    };

    const handleMapClick = async (latlng) => {
        const { lat, lng } = latlng;
        // Reverse geocode if needed (assuming helper function available or fetch directly)
        // For simplicity, we can fetch directly or reuse the one from AdminRoutes if exported.
        // I'll assume we need to implement simple fetch here since I can't easily import from another page file.
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            const address = data.display_name;
            
            setFormData(prev => ({
                ...prev,
                location: { lat, lng, address }
            }));
        } catch (error) {
            console.error('Geocoding error:', error);
             setFormData(prev => ({
                ...prev,
                location: { lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }
            }));
        }
    };


    const fetchGalleries = async () => {
        try {
            const response = await fetch('/admin/gallery');
            const data = await response.json();
            if (data.galleries) {
                // Map API data to component structure if needed, or use directly
                // API returns: title, description, city, category, image, featured
                setImages(data.galleries);
            }
        } catch (error) {
            console.error('Error fetching galleries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu görseli silmek istediğinize emin misiniz?')) {
            try {
                const response = await fetch(`/admin/gallery/delete/${id}`, {
                    method: 'POST',
                    headers: {
                        'CSRF-Token': csrfToken
                    }
                });
                const result = await response.json();
                if (result.success) {
                    setImages(images.filter(img => img._id !== id));
                } else {
                    alert('Silme başarısız: ' + result.error);
                }
            } catch (error) {
                console.error('Error deleting gallery:', error);
            }
        }
    };

    const openModal = (img = null) => {
        if (img) {
            setFormData({
                id: img._id,
                title: img.title,
                description: img.description || '',
                city: img.city,
                category: img.category,
                featured: img.featured,
                image: img.image, // For display preview
                location: img.location || { lat: '', lng: '', address: '' }
            });
        } else {
            setFormData({
                title: '',
                description: '',
                city: '',
                category: 'genel',
                featured: false,
                image: null,
                location: { lat: '', lng: '', address: '' }
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            if (formData.id) data.append('id', formData.id);
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('city', formData.city);
            data.append('category', formData.category);
            data.append('featured', formData.featured ? 'on' : 'off');
            if (formData.location) data.append('location', JSON.stringify(formData.location));
            
            if (e.target.image.files[0]) {
                data.append('image', e.target.image.files[0]);
            }

            const response = await fetch('/admin/gallery/save', {
                method: 'POST',
                headers: {
                    'CSRF-Token': csrfToken
                },
                body: data
            });
            const result = await response.json();
            
            if (result.success) {
                setIsModalOpen(false);
                fetchGalleries();
            } else {
                alert('Hata: ' + result.error);
            }
        } catch (error) {
            console.error('Error saving gallery:', error);
            alert('Kaydetme hatası');
        }
    };

    return (
        <div className="flex flex-1 flex-col h-full bg-[#111822] text-white font-['Inter'] overflow-hidden relative">
            {/* Styles... */}
            <style>{`
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

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#324867] bg-[#111822]">
                <div>
                    <h1 className="text-2xl font-bold">Galeri Yönetimi</h1>
                    <p className="text-[#92a9c9] text-sm mt-1">Sitedeki görselleri ve albümleri yönetin.</p>
                </div>
                <button onClick={() => openModal()} className="flex items-center gap-2 bg-[#136dec] hover:bg-[#136dec]/90 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-[#136dec]/20">
                    <span className="material-symbols-outlined">add_photo_alternate</span>
                    <span>Yeni Görsel Ekle</span>
                </button>
            </div>

            {/* Content & Grid */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {/* Filters */}
                {/* ... existing filters ... */}
                
                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {loading ? (
                        <p className="text-gray-400">Yükleniyor...</p>
                    ) : images.length === 0 ? (
                        <p className="text-gray-400">Hiç görsel bulunamadı.</p>
                    ) : (
                        images.map((img) => (
                        <div key={img._id} className="group relative bg-[#1e293b] rounded-xl overflow-hidden border border-[#324867] hover:border-[#136dec] transition-all duration-300">
                            {/* Image */}
                            <div className="aspect-square overflow-hidden relative">
                                <img src={img.image || 'https://via.placeholder.com/300'} alt={img.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={() => openModal(img)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-colors" title="Düzenle">
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                    <button onClick={() => handleDelete(img._id)} className="p-2 bg-red-500/80 hover:bg-red-600/80 text-white rounded-lg backdrop-blur-sm transition-colors" title="Sil">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                            {/* Info */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-white truncate pr-2">{img.title}</h3>
                                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#324867] text-[#92a9c9]">{img.category}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-[#92a9c9]">
                                    <span>{img.city}</span>
                                    {img.views > 0 && <span><span className="material-symbols-outlined text-[10px] align-middle mr-0.5">visibility</span>{img.views}</span>}
                                </div>
                            </div>
                        </div>
                    )))}
                    
                    {/* Upload Placeholder */}
                    <div onClick={() => openModal()} className="border-2 border-dashed border-[#324867] rounded-xl flex flex-col items-center justify-center p-6 text-[#92a9c9] hover:text-[#136dec] hover:border-[#136dec] hover:bg-[#1e293b]/50 transition-all cursor-pointer min-h-[250px]">
                        <span className="material-symbols-outlined text-4xl mb-2">cloud_upload</span>
                        <span className="font-medium">Hızlı Yükle</span>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#1e293b] w-full max-w-4xl max-h-[90vh] rounded-2xl border border-[#324867] shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-[#324867]">
                            <h2 className="text-xl font-bold">{formData.id ? 'Görsel Düzenle' : 'Yeni Görsel Ekle'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <form id="galleryForm" onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#92a9c9] mb-1">Başlık</label>
                                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#111822] border border-[#324867] rounded-lg px-4 py-2 text-white outline-none focus:border-[#136dec]" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#92a9c9] mb-1">Şehir</label>
                                        <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-[#111822] border border-[#324867] rounded-lg px-4 py-2 text-white outline-none focus:border-[#136dec]" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#92a9c9] mb-1">Kategori</label>
                                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#111822] border border-[#324867] rounded-lg px-4 py-2 text-white outline-none focus:border-[#136dec]">
                                            <option value="genel">Genel</option>
                                            <option value="yer">Yer</option>
                                            <option value="restoran">Restoran</option>
                                            <option value="otel">Otel</option>
                                            <option value="aktivite">Aktivite</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#92a9c9] mb-1">Görsel</label>
                                        <input type="file" name="image" className="w-full bg-[#111822] border border-[#324867] rounded-lg px-4 py-2 text-white outline-none focus:border-[#136dec]" />
                                    </div>
                                    <div>
                                         <label className="block text-sm font-medium text-[#92a9c9] mb-1">Seçilen Konum</label>
                                         <p className="text-sm text-white bg-[#111822] p-2 rounded border border-[#324867]">{formData.location.address || 'Haritadan seçiniz'}</p>
                                    </div>
                                </div>
                                <div className="h-[300px] lg:h-full bg-[#111822] rounded-lg border border-[#324867] overflow-hidden relative">
                                    <div id="gallery-map" className="w-full h-full z-0"></div>
                                    <div className="absolute top-2 right-2 bg-black/50 text-xs text-white p-1 rounded z-[1000]">Konum Seçin</div>
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-6 border-t border-[#324867] flex justify-end gap-3 bg-[#1e293b]">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-white hover:bg-[#324867] transition-colors">İptal</button>
                            <button type="submit" form="galleryForm" className="px-6 py-2 bg-[#136dec] hover:bg-[#136dec]/90 text-white rounded-lg font-medium transition-colors shadow-lg shadow-[#136dec]/20">Kaydet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGallery;
