import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const GalleryPage = () => {
    const [galleries, setGalleries] = useState([]);
    const [cities, setCities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { csrfToken } = useAuth();

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCity) params.append('city', selectedCity);
            if (selectedCategory) params.append('category', selectedCategory);

            const response = await fetch(`/api/gallery?${params.toString()}`);
            const data = await response.json();

            setGalleries(data.galleries);
            setCities(data.cities);
            setCategories(data.categories);
        } catch (error) {
            console.error('Error fetching gallery data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedCity, selectedCategory]);

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchData();
    };

    const handleImageClick = async (image) => {
        setSelectedImage(image);
        setIsModalOpen(true);

        // Increment view count
        try {
            await fetch(`/api/gallery/${image._id}/view`, { 
                method: 'POST',
                headers: {
                    'CSRF-Token': csrfToken
                }
            });
        } catch (error) {
            console.error('View count increment failed:', error);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedImage(null);
    };

    return (
        <div className="bg-background-light min-h-screen py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 border-b border-border-color pb-4">
                    <h1 className="text-3xl font-display font-bold text-text-main flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">photo_library</span>
                        Galeri
                    </h1>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-soft p-6 border border-border-color mb-8">
                    <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <select 
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="w-full rounded-lg border border-border-color px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="">Tüm Şehirler</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <select 
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full rounded-lg border border-border-color px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="">Tüm Kategoriler</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                Filtrele
                            </button>
                        </div>
                    </form>
                </div>

                {/* Gallery Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {galleries.map(item => (
                            <div 
                                key={item._id} 
                                onClick={() => handleImageClick(item)}
                                className="bg-white rounded-xl shadow-soft overflow-hidden border border-border-color group hover:border-primary transition-colors cursor-pointer"
                            >
                                <div className="aspect-w-16 aspect-h-9 relative overflow-hidden h-64">
                                    <img 
                                        src={item.image} 
                                        alt={item.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <span className="material-symbols-outlined text-white text-4xl drop-shadow-lg">visibility</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-text-main mb-2">{item.title}</h3>
                                    {item.description && (
                                        <p className="text-sm text-text-sub mb-4 line-clamp-3">{item.description}</p>
                                    )}
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            {item.city}
                                        </span>
                                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">{item.category}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {!loading && galleries.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        Bu kriterlere uygun görsel bulunamadı.
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && selectedImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={closeModal}>
                        <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl" onClick={e => e.stopPropagation()}>
                            {/* Image Section */}
                            <div className="w-full md:w-2/3 bg-black flex items-center justify-center relative group">
                                <img src={selectedImage.image} alt={selectedImage.title} className="max-h-[50vh] md:max-h-[90vh] w-full object-contain" />
                                <button onClick={closeModal} className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors md:hidden">
                                     <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            
                            {/* Details Section */}
                            <div className="w-full md:w-1/3 p-8 flex flex-col overflow-y-auto max-h-[50vh] md:max-h-[90vh] bg-white relative">
                                <button onClick={closeModal} className="absolute top-4 right-4 text-text-sub hover:text-text-main hidden md:block">
                                     <span className="material-symbols-outlined">close</span>
                                </button>

                                <div className="mb-6">
                                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wide">
                                        {selectedImage.category}
                                    </span>
                                </div>

                                <h2 className="text-3xl font-bold text-text-main mb-2">{selectedImage.title}</h2>
                                <div className="flex items-center gap-2 text-text-sub text-sm mb-6">
                                    <span className="material-symbols-outlined text-lg">location_on</span>
                                    <span>{selectedImage.city}</span>
                                    {selectedImage.location && selectedImage.location.address && (
                                         <span className="text-xs text-gray-400 block w-full mt-1 border-t pt-1 border-gray-100 italic">
                                            {selectedImage.location.address}
                                         </span>
                                    )}
                                </div>

                                <div className="prose prose-sm text-text-sub mb-8 flex-1">
                                    <p>{selectedImage.description}</p>
                                </div>

                                <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                                    <span>Yüklenme Tarihi: {new Date(selectedImage.createdAt).toLocaleDateString('tr-TR')}</span>
                                    <div className="flex items-center gap-1" title="Görüntülenme">
                                        <span className="material-symbols-outlined text-lg">visibility</span>
                                        <span>{(selectedImage.views || 0) + 1}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GalleryPage;
