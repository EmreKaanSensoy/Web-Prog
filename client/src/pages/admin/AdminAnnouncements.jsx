import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const AdminAnnouncements = () => {
    // Veri Durumu
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const { csrfToken } = useAuth();

    // Modal ve Form Durumu
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    
    // Form Başlangıç Durumu
    const initialFormState = {
        id: '',
        title: '',
        content: '',
        type: 'duyuru', // Varsayılan (küçük harf)
        city: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        isActive: true,
        image: null
    };

    const [formData, setFormData] = useState(initialFormState);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch('/admin/announcement');
            const data = await response.json();
            if (data.announcements) {
                setAnnouncements(data.announcements);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setFormData(initialFormState);
        setImagePreview(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setFormData({
            id: item._id,
            title: item.title,
            content: item.content,
            type: item.type,
            city: item.city || '',
            startDate: item.startDate ? item.startDate.split('T')[0] : '',
            endDate: item.endDate ? item.endDate.split('T')[0] : '',
            isActive: item.isActive,
            image: null // Yeni görsel yükleme
        });
        setImagePreview(item.image); // Mevcut görsel
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
         if (window.confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) {
            try {
                const response = await fetch(`/admin/announcement/delete/${id}`, {
                    method: 'POST',
                    headers: {
                        'CSRF-Token': csrfToken
                    }
                });
                const result = await response.json();
                if (result.success) {
                    setAnnouncements(announcements.filter(item => item._id !== id));
                } else {
                    alert('Silme başarısız: ' + result.error);
                }
            } catch (error) {
                console.error('Error deleting announcement:', error);
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        const dataToSend = new FormData();
        if (formData.id) dataToSend.append('id', formData.id);
        dataToSend.append('title', formData.title);
        dataToSend.append('content', formData.content);
        dataToSend.append('type', formData.type);
        dataToSend.append('city', formData.city);
        dataToSend.append('startDate', formData.startDate);
        dataToSend.append('endDate', formData.endDate);
        dataToSend.append('isActive', formData.isActive ? 'on' : 'off');
        if (formData.image) {
            dataToSend.append('image', formData.image);
        }

        try {
            const response = await fetch('/admin/announcement/save', {
                method: 'POST',
                headers: {
                    'CSRF-Token': csrfToken
                },
                body: dataToSend
            });
            const result = await response.json();

            if (result.success) {
                alert('Duyuru başarıyla kaydedildi!');
                setIsModalOpen(false);
                fetchAnnouncements(); // Listeyi yenile
            } else {
                alert('Hata: ' + result.error);
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Bir hata oluştu.');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="flex flex-1 flex-col h-full bg-[#111822] text-white font-['Inter'] overflow-hidden relative">
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
            
            {/* Başlık */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#324867] bg-[#111822]">
                <div>
                    <h1 className="text-2xl font-bold">Duyuru Yönetimi</h1>
                    <p className="text-[#92a9c9] text-sm mt-1">Kullanıcılara ve site ziyaretçilerine duyurular yayınlayın.</p>
                </div>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-[#136dec] hover:bg-[#136dec]/90 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-[#136dec]/20">
                    <span className="material-symbols-outlined">campaign</span>
                    <span>Yeni Duyuru Ekle</span>
                </button>
            </div>

            {/* İçerik */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Liste Bölümü */}
                    <div className="lg:col-span-2 space-y-4">
                        {loading ? <p className="text-gray-400">Yükleniyor...</p> : announcements.length === 0 ? <p className="text-gray-400">Duyuru bulunamadı.</p> : announcements.map((item) => (
                            <div key={item._id} className="bg-[#1e293b] rounded-xl p-6 border border-[#324867] hover:border-[#136dec]/50 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`size-10 rounded-lg flex items-center justify-center ${
                                            (item.type === 'duyuru' || item.type === 'Duyuru') ? 'bg-blue-500/20 text-blue-400' : 
                                            (item.type === 'firsat' || item.type === 'Kampanya') ? 'bg-green-500/20 text-green-400' : 
                                            'bg-orange-500/20 text-orange-400'
                                        }`}>
                                            <span className="material-symbols-outlined">
                                                {(item.type === 'duyuru' || item.type === 'Duyuru') ? 'info' : (item.type === 'firsat' || item.type === 'Kampanya') ? 'local_offer' : 'dns'}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{item.title}</h3>
                                            <div className="flex items-center gap-2 text-xs text-[#92a9c9]">
                                                <span>{new Date(item.startDate || item.createdAt).toLocaleDateString('tr-TR')}</span>
                                                <span>•</span>
                                                <span className="capitalize">{item.type === 'firsat' ? 'Kampanya' : item.type}</span>
                                                {item.city && <span>• {item.city}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        item.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                    }`}>
                                        {item.isActive ? 'Aktif' : 'Pasif'}
                                    </div>
                                </div>
                                <div 
                                    className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3 prose prose-invert prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: item.content }}
                                ></div>
                                <div className="flex items-center gap-3 border-t border-[#324867] pt-4 mt-2">
                                    <button onClick={() => handleEdit(item)} className="text-sm text-[#92a9c9] hover:text-white flex items-center gap-1 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                        Düzenle
                                    </button>
                                    <button onClick={() => handleDelete(item._id)} className="text-sm text-[#92a9c9] hover:text-red-400 flex items-center gap-1 transition-colors ml-auto">
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                        Sil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* İstatistikler */}
                    <div className="space-y-6">
                        <div className="bg-[#1e293b] rounded-xl p-6 border border-[#324867]">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#136dec]">analytics</span>
                                Duyuru İstatistikleri
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-[#111822] rounded-lg">
                                    <span className="text-gray-400 text-sm">Aktif Duyurular</span>
                                    <span className="text-white font-bold">{announcements.filter(a => a.isActive).length}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[#111822] rounded-lg">
                                    <span className="text-gray-400 text-sm">Toplam Sayı</span>
                                    <span className="text-white font-bold">{announcements.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-[#1e293b] w-full max-w-2xl rounded-2xl border border-[#324867] shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-[#324867]">
                            <h3 className="text-xl font-bold text-white">{formData.id ? 'Duyuru Düzenle' : 'Yeni Duyuru Ekle'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-[#92a9c9] hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-[#92a9c9] mb-1">Başlık</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full bg-[#111822] border border-[#324867] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#136dec]"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[#92a9c9] mb-1">Tür</label>
                                    <select 
                                        className="w-full bg-[#111822] border border-[#324867] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#136dec]"
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    >
                                        <option value="duyuru">Duyuru</option>
                                        <option value="firsat">Kampanya / Fırsat</option>
                                        <option value="etkinlik">Etkinlik</option>
                                        <option value="senlik">Şenlik</option>
                                    </select>
                                </div>
                            </div>

                            <div className="prose-editor-container">
                                <style>{`
                                    .ck-editor__editable_inline {
                                        min-height: 200px;
                                        color: black;
                                    }
                                `}</style>
                                <label className="block text-xs font-medium text-[#92a9c9] mb-1">İçerik</label>
                                <CKEditor
                                    editor={ClassicEditor}
                                    data={formData.content}
                                    onChange={(event, editor) => {
                                        const data = editor.getData();
                                        setFormData({...formData, content: data});
                                    }}
                                    config={{
                                        placeholder: 'Duyuru içeriği...'
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-[#92a9c9] mb-1">Şehir (Opsiyonel)</label>
                                    <select 
                                        className="w-full bg-[#111822] border border-[#324867] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#136dec]"
                                        value={formData.city}
                                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                                    >
                                        <option value="">Seçiniz (Genel)</option>
                                        <option value="İstanbul">İstanbul</option>
                                        <option value="Ankara">Ankara</option>
                                        <option value="İzmir">İzmir</option>
                                        <option value="Antalya">Antalya</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[#92a9c9] mb-1">Başlangıç Tarihi</label>
                                    <input 
                                        type="date" 
                                        className="w-full bg-[#111822] border border-[#324867] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#136dec]"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            {/* Görsel Yükleme */}
                            <div>
                                <label className="block text-xs font-medium text-[#92a9c9] mb-1">Görsel (Opsiyonel)</label>
                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer bg-[#324867] hover:bg-[#4b6a96] text-white px-4 py-2 rounded-lg text-sm transition-colors">
                                        Dosya Seç
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                    {imagePreview && (
                                        <img src={imagePreview} alt="Preview" className="h-10 w-10 object-cover rounded-md border border-[#324867]" />
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                    />
                                    <div className="w-11 h-6 bg-[#111822] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#136dec]"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-300">Bu duyuru aktif olsun</span>
                                </label>
                            </div>

                            <div className="bg-[#111822] p-4 rounded-lg flex justify-end gap-3 mt-4 border-t border-[#324867]">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[#92a9c9] hover:text-white transition-colors">Vazgeç</button>
                                <button type="submit" disabled={submitLoading} className="px-6 py-2 bg-[#136dec] hover:bg-[#136dec]/90 text-white rounded-lg font-bold shadow-lg shadow-[#136dec]/20 disabled:opacity-50">
                                    {submitLoading ? 'Kaydediliyor...' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAnnouncements;
