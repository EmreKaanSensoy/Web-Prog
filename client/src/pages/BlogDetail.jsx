import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

const BlogDetail = () => {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [relatedBlogs, setRelatedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await fetch(`/blog/${slug}`);
                const data = await response.json();
                
                if (data.success) {
                    setBlog(data.blog);
                    setRelatedBlogs(data.relatedBlogs);
                } else {
                    setError(data.error || 'Blog bulunamadı');
                }
            } catch (err) {
                console.error(err);
                setError('Bir hata oluştu');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchBlog();
        }
    }, [slug]);

    if (loading) return <div className="text-center py-20">Yükleniyor...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!blog) return <div className="text-center py-20">Blog bulunamadı.</div>;

    // Use placeholder if no image
    const heroImage = (blog.images && blog.images.length > 0) ? blog.images[0] : 'https://placehold.co/1200x600?text=No+Image';
    const authorImage = 'https://placehold.co/100x100?text=Author'; // Placeholder for author

    return (
        <div className="bg-background-light min-h-screen pb-20">
             {/* Hero Section with Background Image and Overlay */}
            <div className="relative h-[60vh] min-h-[500px] w-full bg-gray-900 text-white group">
                <div 
                    className="absolute inset-0 bg-cover bg-center transform transition-transform duration-1000 group-hover:scale-105" 
                    style={{ backgroundImage: `url("${heroImage}")` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/80"></div> {/* Sophisticated overlay */}
                </div>
                
                <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 sm:pb-16">
                     {/* Breadcrumbs (White text) */}
                    <nav className="flex flex-wrap gap-2 text-sm text-gray-300 mb-6 font-medium">
                        <Link to="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
                        <span>/</span>
                        <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
                        <span>/</span>
                        <span className="text-white truncate max-w-[200px]">{blog.title}</span>
                    </nav>

                     {/* Chips */}
                    <div className="flex flex-wrap gap-3 mb-6 animate-fade-in-up">
                        <span className="bg-primary hover:bg-primary-dark transition-colors cursor-default text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/20">
                            {blog.category}
                        </span>
                         <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                            {blog.city}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-8 max-w-5xl drop-shadow-lg">
                        {blog.title}
                    </h1>

                     {/* Author & Meta */}
                    <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-sm border-t border-white/10 pt-6">
                        <div className="flex items-center gap-3">
                             <div className="size-12 rounded-full bg-gray-200 bg-cover bg-center ring-2 ring-white/50" style={{ backgroundImage: `url("${authorImage}")` }}></div>
                             <div className="flex flex-col">
                                <span className="font-bold text-base">{blog.author?.username || 'Admin'}</span>
                                <span className="text-gray-400 text-xs uppercase tracking-wide">Yazar</span>
                             </div>
                        </div>
                        <div className="hidden sm:block h-8 w-px bg-white/20"></div>
                         <div className="flex flex-col">
                            <span className="font-bold text-base">{new Date(blog.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            <span className="text-gray-400 text-xs uppercase tracking-wide">Yayınlanma</span>
                         </div>
                         <div className="hidden sm:block h-8 w-px bg-white/20"></div>
                        <div className="flex flex-col">
                            <span className="font-bold text-base flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-lg">visibility</span>
                                {blog.views}
                            </span>
                             <span className="text-gray-400 text-xs uppercase tracking-wide">Okunma</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content & Sidebar Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                      {/* Main Content */}
                     <main className="lg:col-span-8">
                         {/* Article Body */}
                         <article 
                            className="
                                prose prose-lg max-w-none 
                                prose-headings:font-bold prose-headings:text-text-main 
                                prose-p:text-text-main/80 prose-p:leading-relaxed
                                prose-a:text-primary hover:prose-a:text-primary-dark prose-a:transition-colors
                                prose-strong:text-text-main prose-strong:font-bold
                                prose-img:rounded-2xl prose-img:shadow-soft
                                prose-blockquote:border-l-primary prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                            " 
                            dangerouslySetInnerHTML={{ __html: blog.content }}>
                         </article>

                         {/* Gallery Section */}
                         {blog.images && blog.images.length > 1 && (
                            <div className="mt-20 pt-10 border-t border-gray-200">
                                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-text-main">
                                    <span className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
                                        <span className="material-symbols-outlined">photo_library</span>
                                    </span>
                                    Galeri
                                </h3>
                                <div className="masonry-grid">
                                    {blog.images.slice(1).map((img, index) => (
                                        <div key={index} className="masonry-item mb-4 rounded-xl overflow-hidden shadow-soft hover:shadow-lg transition-all duration-300 group cursor-pointer ring-1 ring-black/5">
                                            <img src={img} alt={`Gallery ${index}`} className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                         )}
                     </main>

                     {/* Sidebar */}
                     <aside className="lg:col-span-4 space-y-8">
                        {/* Similar Blogs */}
                        <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100/50">
                             <div className="flex items-center justify-between mb-6">
                                <h4 className="text-lg font-bold text-text-main flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">auto_stories</span>
                                    İlgili Yazılar
                                </h4>
                             </div>
                             
                             <div className="space-y-6">
                                {relatedBlogs.map(rb => (
                                    <Link key={rb._id} to={`/blog/${rb.slug}`} className="flex gap-4 group">
                                         <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 relative shadow-sm">
                                            {rb.images && rb.images[0] ? (
                                                <img src={rb.images[0]} alt={rb.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <span className="material-symbols-outlined">image</span>
                                                </div>
                                            )}
                                         </div>
                                         <div className="flex flex-col justify-center py-1">
                                             <span className="text-xs font-bold text-primary uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                                <span className="size-1.5 rounded-full bg-primary/40"></span>
                                                {rb.city}
                                             </span>
                                             <h5 className="font-bold text-text-main leading-snug group-hover:text-primary transition-colors line-clamp-2">{rb.title}</h5>
                                         </div>
                                    </Link>
                                ))}
                                {relatedBlogs.length === 0 && (
                                    <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        Benzer yazı bulunamadı.
                                    </div>
                                )}
                             </div>
                        </div>

                        {/* Sticky CTA */}
                        <div className="sticky top-24">
                              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-white shadow-xl shadow-primary/25 relative overflow-hidden text-center group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:rotate-12 transition-transform duration-700">
                                    <span className="material-symbols-outlined text-9xl">travel_explore</span>
                                </div>
                                <div className="relative z-10">
                                    <div className="size-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                                         <span className="material-symbols-outlined text-4xl">map</span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">Kendi Rotanı Oluştur!</h3>
                                    <p className="text-white/90 mb-8 text-sm leading-relaxed">Bu blogdaki mekanları beğendin mi? Hemen kendi seyahat planını oluşturmaya başla.</p>
                                    <Link to="/route" className="inline-flex w-full items-center justify-center gap-2 bg-white text-primary font-bold py-3.5 px-6 rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                                        <span className="material-symbols-outlined">add_location_alt</span>
                                        Rota Planla
                                    </Link>
                                </div>
                            </div>
                        </div>
                     </aside>
                 </div>
            </div>
        </div>
    );
};

export default BlogDetail;
