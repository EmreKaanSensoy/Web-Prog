import { useState, useEffect } from 'react';

const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cities, setCities] = useState([]);
    const [types, setTypes] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedType, setSelectedType] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCity) params.append('city', selectedCity);
            if (selectedType) params.append('type', selectedType);

            const response = await fetch(`/announcements?${params.toString()}`);
            const data = await response.json();

            setAnnouncements(data.announcements);
            setCities(data.cities);
            setTypes(data.types);
        } catch (error) {
            console.error('Duyurular yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedCity, selectedType]);

    const getTypeLabel = (type) => {
        const map = {
            'etkinlik': 'Etkinlik',
            'senlik': 'Şenlik',
            'duyuru': 'Duyuru',
            'firsat': 'Fırsat'
        };
        return map[type] || type;
    };

    const getTypeColor = (type) => {
        const map = {
            'etkinlik': 'bg-blue-100 text-blue-800',
            'senlik': 'bg-purple-100 text-purple-800',
            'duyuru': 'bg-orange-100 text-orange-800',
            'firsat': 'bg-green-100 text-green-800'
        };
        return map[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="bg-background-light min-h-screen py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-text-main mb-4">Duyurular ve Etkinlikler</h1>
                    <p className="text-lg text-text-sub max-w-2xl mx-auto">
                        Güncel etkinlikler, şenlikler ve önemli duyuruları buradan takip edebilirsiniz.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-xl shadow-soft mb-10 border border-border-color">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="w-full rounded-lg border border-border-color px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="">Tüm Şehirler</option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full rounded-lg border border-border-color px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="">Tüm Kategoriler</option>
                            {types.map(type => (
                                <option key={type} value={type}>{getTypeLabel(type)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {announcements.length > 0 ? (
                            announcements.map((item) => (
                                <div key={item._id} className="bg-white rounded-xl shadow-soft p-6 border border-border-color hover:shadow-lg transition-shadow">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Date Badge */}
                                        <div className="flex-shrink-0">
                                            <div className="flex flex-col items-center justify-center w-20 h-20 bg-primary/10 rounded-xl text-primary font-bold border border-primary/20">
                                                <span className="text-2xl">{new Date(item.startDate).getDate()}</span>
                                                <span className="text-xs uppercase">{new Date(item.startDate).toLocaleString('tr-TR', { month: 'short' })}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${getTypeColor(item.type)}`}>
                                                    {getTypeLabel(item.type)}
                                                </span>
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                                    {item.city}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-text-main mb-2">{item.title}</h3>
                                            <div 
                                                className="text-text-sub mb-4 prose prose-sm max-w-none prose-p:my-2 prose-ul:list-disc prose-ul:ml-4"
                                                dangerouslySetInnerHTML={{ __html: item.content }}
                                            ></div>
                                            
                                            <div className="text-sm text-gray-400 flex items-center gap-4">
                                                 <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">account_circle</span>
                                                    {item.author?.username || 'Admin'}
                                                 </span>
                                                 {/* Optional: Add end date if different */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
                                <span className="material-symbols-outlined text-4xl mb-2 block text-gray-300">event_busy</span>
                                Henüz duyuru bulunmamaktadır.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnnouncementsPage;
