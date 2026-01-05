import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const AdminBlogForm = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID for edit mode
    const [loading, setLoading] = useState(false);
    const { csrfToken } = useAuth();
    
    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState(''); // Simple text area for now
    const [excerpt, setExcerpt] = useState('');
    
    const [city, setCity] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    
    const [featured, setFeatured] = useState(false);
    const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
    const [author, setAuthor] = useState('Admin'); // Placeholder
    
    // Media State
    const [images, setImages] = useState([]); // File objects (for new uploads)
    const [previews, setPreviews] = useState([]); // URL strings for preview
    const [existingImages, setExistingImages] = useState([]); // For edit mode

    useEffect(() => {
        if (id) {
            fetchBlogData();
        }
    }, [id]);

    const fetchBlogData = async () => {
        try {
            const response = await fetch(`/admin/blog/edit/${id}`);
            const data = await response.json();
            if (data.blog) {
                const b = data.blog;
                setTitle(b.title);
                setContent(b.content);
                setExcerpt(b.excerpt);
                setCity(b.city);
                setCategory(b.category);
                setFeatured(b.featured);
                setExistingImages(b.images || []);
                // If tags supported later: setTags(b.tags);
            }
        } catch (error) {
            console.error('Error fetching blog:', error);
            alert('Blog verisi alınamadı.');
            navigate('/admin/blog');
        }
    };

    // Handlers
    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setImages((prev) => [...prev, ...newFiles]);
            
            // Generate previews
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews((prev) => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async () => {
        if (!title || !content || !city || !category) {
            alert('Lütfen zorunlu alanları doldurun (Başlık, İçerik, Şehir, Kategori).');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        if (id) formData.append('id', id); // Important for update
        
        formData.append('title', title);
        formData.append('content', content);
        formData.append('excerpt', excerpt); // Not visible in UI but used in schema
        formData.append('city', city);
        formData.append('category', category);
        formData.append('featured', featured ? 'on' : 'off');
        // formData.append('tags', JSON.stringify(tags)); // Backend might not support this yet, strictly following schema
        
        images.forEach(file => {
            formData.append('images', file);
        });

        try {
            const response = await fetch('/admin/blog/save', {
                method: 'POST',
                headers: {
                    'CSRF-Token': csrfToken
                },
                // Headers for FormData are set automatically by browser (including boundary)
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(id ? 'Blog güncellendi!' : 'Blog yazısı başarıyla oluşturuldu!');
                navigate('/admin/blog'); // Navigate to list
            } else {
                alert('Hata: ' + result.error);
            }
        } catch (error) {
            console.error(error);
            alert('Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Top Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-2 text-sm">
                    <button onClick={() => navigate('/admin/dashboard')} className="text-slate-500 hover:text-primary font-medium">Dashboard</button>
                    <span className="text-slate-300">/</span>
                    <button onClick={() => navigate('/admin/blog')} className="text-slate-500 hover:text-primary font-medium">Blog Yönetimi</button>
                    <span className="text-slate-300">/</span>
                    <span className="text-primary font-semibold">{id ? 'Düzenle' : 'Yeni Gönderi'}</span>
                </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]"> {/* Added light bg to contrast */}
                <div className="max-w-7xl mx-auto flex flex-col gap-6">
                    {/* Page Heading */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{id ? 'Blog Yazısını Düzenle' : 'Yeni Blog Ekle'}</h2>
                            <p className="text-slate-500 mt-1">{id ? 'Mevcut içeriği güncelleyin.' : 'Seyahat rehberi için yeni içerik oluşturun.'}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => navigate(-1)} className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                                İptal
                            </button>
                            <button 
                                onClick={handleSubmit} 
                                disabled={loading}
                                className={`px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark shadow-md shadow-primary/20 transition-all flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">send</span>
                                {loading ? 'Kaydediliyor...' : 'Yayınla'}
                            </button>
                        </div>
                    </div>

                    {/* Layout Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Main Form (2/3 width) */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            {/* Title & Content Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100">
                                    <h3 className="text-lg font-semibold text-slate-900">İçerik Detayları</h3>
                                </div>
                                <div className="p-6 flex flex-col gap-6">
                                    <label className="flex flex-col w-full">
                                        <span className="text-slate-700 font-medium mb-2 text-sm">Blog Başlığı</span>
                                        <input 
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-slate-400 h-12 px-4 transition-all" 
                                            placeholder="Örn: Kapadokya'da Balon Turu Rehberi" 
                                            type="text" 
                                        />
                                    </label>
                                    
                                    <div className="flex flex-col w-full prose-editor-container">
                                        <style>{`
                                            .ck-editor__editable_inline {
                                                min-height: 400px;
                                            }
                                        `}</style>
                                        <span className="text-slate-700 font-medium mb-2 text-sm">İçerik</span>
                                        <CKEditor
                                            editor={ClassicEditor}
                                            data={content}
                                            onChange={(event, editor) => {
                                                const data = editor.getData();
                                                setContent(data);
                                            }}
                                            config={{
                                                placeholder: 'Blog içeriğini buraya yazın...'
                                            }}
                                        />
                                    </div>
                                    
                                     <label className="flex flex-col w-full">
                                        <span className="text-slate-700 font-medium mb-2 text-sm">Kısa Özet (Opsiyonel)</span>
                                        <textarea 
                                            value={excerpt}
                                            onChange={(e) => setExcerpt(e.target.value)}
                                            className="w-full h-24 p-4 rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" 
                                            placeholder="Listeleme sayfalarında görünecek kısa açıklama..."
                                        ></textarea>
                                    </label>
                                </div>
                            </div>
                            
                            {/* Media Upload Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-slate-900">Medya & Galeri</h3>
                                </div>
                                <div className="p-6">
                                    <label className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-primary/50 transition-all cursor-pointer group">
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
                                        <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                                            <span className="material-symbols-outlined text-primary text-4xl">cloud_upload</span>
                                        </div>
                                        <p className="text-slate-900 font-medium text-lg">Resimleri seçmek için tıklayın</p>
                                        <p className="text-slate-400 text-xs mt-4">Desteklenenler: JPG, PNG, WEBP (Max 5MB)</p>
                                    </label>
                                    
                                    {/* Uploaded Items Preview */}
                                    {previews.length > 0 && (
                                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {previews.map((src, index) => (
                                                <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video">
                                                    <img src={src} alt={`Preview ${index}`} className="absolute inset-0 w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <button onClick={() => removeImage(index)} className="p-1.5 bg-white rounded-full text-slate-900 hover:text-red-600 transition-colors">
                                                            <span className="material-symbols-outlined text-sm">delete</span>
                                                        </button>
                                                    </div>
                                                    {index === 0 && (
                                                        <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">KAPAK</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Settings (1/3 width) */}
                        <div className="flex flex-col gap-6">
                            {/* Publish Settings */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                                    <h3 className="text-base font-semibold text-slate-900">Yayın Ayarları</h3>
                                </div>
                                <div className="p-5 flex flex-col gap-5">
                                    {/* Featured Toggle */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-900">Öne Çıkar</span>
                                            <span className="text-xs text-slate-500">Ana sayfada göster</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={featured}
                                                onChange={(e) => setFeatured(e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <hr className="border-slate-100" />
                                    {/* Date Picker */}
                                    <label className="flex flex-col w-full">
                                        <span className="text-slate-700 font-medium mb-2 text-sm">Yayınlanma Tarihi</span>
                                        <div className="relative">
                                            <input 
                                                value={publishDate}
                                                onChange={(e) => setPublishDate(e.target.value)}
                                                className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary h-11 px-4 text-sm" 
                                                type="date" 
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Organization Settings */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                                    <h3 className="text-base font-semibold text-slate-900">Kategorizasyon</h3>
                                </div>
                                <div className="p-5 flex flex-col gap-5">
                                    {/* City Select */}
                                    <label className="flex flex-col w-full">
                                        <span className="text-slate-700 font-medium mb-2 text-sm">Şehir</span>
                                        <div className="relative">
                                            <select 
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary h-11 px-4 text-sm appearance-none"
                                            >
                                                <option value="" disabled>Şehir Seçin</option>
                                                <option value="İstanbul">İstanbul</option>
                                                <option value="Ankara">Ankara</option>
                                                <option value="İzmir">İzmir</option>
                                                <option value="Antalya">Antalya</option>
                                                <option value="Muğla">Muğla</option>
                                                <option value="Nevşehir">Nevşehir</option>
                                                <option value="Trabzon">Trabzon</option>
                                                <option value="Kars">Kars</option>
                                                <option value="Bursa">Bursa</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">location_on</span>
                                        </div>
                                    </label>
                                    
                                    {/* Category Select */}
                                    <label className="flex flex-col w-full">
                                        <span className="text-slate-700 font-medium mb-2 text-sm">Kategori</span>
                                        <div className="relative">
                                            <select 
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary h-11 px-4 text-sm appearance-none"
                                            >
                                                <option value="" disabled>Kategori Seçin</option>
                                                <option value="gezi-rehberi">Gezi Rehberi</option>
                                                <option value="yeme-icme">Yeme & İçme</option>
                                                <option value="konaklama">Konaklama</option>
                                                <option value="etkinlik">Etkinlik & Festival</option>
                                                <option value="tarih-kultur">Tarih & Kültür</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none">category</span>
                                        </div>
                                    </label>

                                    {/* Tags Input */}
                                    <label className="flex flex-col w-full">
                                        <span className="text-slate-700 font-medium mb-2 text-sm">Etiketler</span>
                                        <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 min-h-[44px] flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                            {tags.map((tag, idx) => (
                                                <span key={idx} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                                                    {tag}
                                                    <button onClick={() => removeTag(tag)} className="hover:text-primary-dark"><span className="material-symbols-outlined text-[14px]">close</span></button>
                                                </span>
                                            ))}
                                            <input 
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                                className="bg-transparent border-none p-0 text-sm focus:ring-0 w-20 flex-1 placeholder:text-slate-400" 
                                                placeholder="+ Tag" 
                                                type="text" 
                                            />
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminBlogForm;
