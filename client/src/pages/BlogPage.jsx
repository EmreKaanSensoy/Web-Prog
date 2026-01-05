import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BlogPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch('/blog');
                const data = await response.json();
                
                if (data.success) {
                    setBlogs(data.blogs);
                } else {
                    setError('Bloglar yüklenemedi.');
                }
            } catch (err) {
                console.error(err);
                setError('Sunucu ile iletişim kurulamadı.');
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    if (loading) return <div className="text-center py-20">Yükleniyor...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

    return (
        <div className="w-full px-4 md:px-10 lg:px-40 py-12">
            <div className="max-w-[1280px] mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-text-main mb-4">Blog ve Gezi Rehberi</h1>
                    <p className="text-lg text-text-sub max-w-2xl mx-auto">
                        Keşfedilmeyi bekleyen rotalar, seyahat ipuçları ve ilham verici hikayeler.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.map(blog => {
                         const heroImage = (blog.images && blog.images.length > 0) ? blog.images[0] : 'https://placehold.co/600x400?text=No+Image';

                        return (
                            <Link key={blog._id} to={`/blog/${blog.slug}`} className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-border-color overflow-hidden flex flex-col h-full">
                                <div className="aspect-[4/3] w-full overflow-hidden relative">
                                    <div className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: `url("${heroImage}")` }}></div>
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                                    <div className="absolute top-4 left-4">
                                         <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-primary text-xs font-bold uppercase tracking-wider shadow-sm">
                                            {blog.city}
                                         </span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center gap-2 text-xs text-text-sub mb-3">
                                        <span className="font-medium text-primary">{blog.category}</span>
                                        <span>•</span>
                                        <span>{new Date(blog.createdAt).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-text-main mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                        {blog.title}
                                    </h3>
                                    <p className="text-text-sub text-sm line-clamp-3 mb-4 flex-grow">
                                        {blog.excerpt}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm font-medium text-primary mt-auto">
                                        Devamını Oku
                                        <span className="material-symbols-outlined text-[18px] transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {blogs.length === 0 && (
                     <div className="text-center py-20 text-text-sub">
                        Henüz hiç blog yazısı eklenmemiş.
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogPage;
