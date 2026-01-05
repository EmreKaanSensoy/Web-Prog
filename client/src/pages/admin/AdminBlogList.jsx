import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminBlogList = () => {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const response = await fetch('/admin/blog');
            const data = await response.json();
            if (data.blogs) {
                setBlogs(data.blogs);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu bloğu silmek istediğinize emin misiniz?')) {
            try {
                const response = await fetch(`/admin/blog/delete/${id}`, {
                    method: 'POST'
                });
                const result = await response.json();
                if (result.success) {
                    setBlogs(blogs.filter(blog => blog._id !== id));
                } else {
                    alert('Silme işlemi başarısız: ' + result.error);
                }
            } catch (error) {
                console.error('Error deleting blog:', error);
                alert('Silme işlemi sırasında hata oluştu.');
            }
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Blog Yönetimi</h2>
                        <p className="text-slate-500 mt-1">Tüm blog yazılarını görüntüleyin, düzenleyin veya silin.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/admin/blogs/new')} 
                        className="px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark shadow-md shadow-primary/20 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Yeni Yazı Ekle
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
                                    <th className="px-6 py-4">Başlık</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Yazar</th>
                                    <th className="px-6 py-4">Tarih</th>
                                    <th className="px-6 py-4 text-center">Resim</th>
                                    <th className="px-6 py-4 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Yükleniyor...</td>
                                    </tr>
                                ) : blogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Hiç blog yazısı bulunamadı.</td>
                                    </tr>
                                ) : (
                                    blogs.map(blog => (
                                        <tr key={blog._id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4 font-semibold text-slate-900">{blog.title}</td>
                                            <td className="px-6 py-4">{blog.category}</td>
                                            <td className="px-6 py-4">{blog.author?.username || 'Admin'}</td>
                                            <td className="px-6 py-4 text-slate-500">{new Date(blog.createdAt).toLocaleDateString('tr-TR')}</td>
                                            <td className="px-6 py-4 text-center">
                                                {blog.images && blog.images.length > 0 ? (
                                                    <img src={blog.images[0]} alt="Blog Cover" className="h-10 w-16 object-cover rounded mx-auto border border-slate-200" />
                                                ) : (
                                                    <span className="text-xs text-slate-400">Resim Yok</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => navigate(`/admin/blogs/edit/${blog._id}`)} className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Düzenle">
                                                        <span className="material-symbols-outlined" style={{fontSize: "20px"}}>edit</span>
                                                    </button>
                                                    <button onClick={() => handleDelete(blog._id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Sil">
                                                        <span className="material-symbols-outlined" style={{fontSize: "20px"}}>delete</span>
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
    );
};

export default AdminBlogList;
