import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const HomePage = () => {
    const [featuredBlogs, setFeaturedBlogs] = useState([]);
    const [popularGalleries, setPopularGalleries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Öne çıkan blogları getir
                const blogRes = await fetch('/blog?featured=true&limit=3');
                const blogData = await blogRes.json();
                if (blogData.success) setFeaturedBlogs(blogData.blogs);

                // Popüler galerileri getir
                const galleryRes = await fetch('/api/gallery/popular');
                const galleryData = await galleryRes.json();
                if (Array.isArray(galleryData)) setPopularGalleries(galleryData);

            } catch (error) {
                console.error('Veri yüklenirken hata:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    // HTML temizleme yardımcısı
    const stripHtml = (html) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    return (
        <div className="flex flex-col w-full">
            {/* Hero Bölümü */}
            <section className="relative">
                <div className="absolute inset-0 z-0">
                    <div className="h-full w-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAIgCxgZzSHbjDr9UTj1zxDFBu2C_fFXgc-99KB1KkdTgTXVyOuqoqIJSVJmqIKzxvzpo7DvhrqLd9gjzURFVU-PF8g4sqjyuFaJKBdYTR2vQ8UTxXUpxQOgyK2mhiKI4Mpr12Tun6hoMqJ47I31tvmGuwDjUNw263cJy5fKyGdNiuneQMwZ3SGr7JzxS1v8KaLo30mwhX1MlCRTuPIEVKLMgMqIX8S0ItxyH9LG0t8ptHWXf7JxDV0Fjqx-P5Qk1oGDNoro9K91NLj")' }}>
                    </div>
                </div>
                <div className="relative z-10 mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8 lg:py-40">
                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-md">
                            Keşfet Kendi Rotanı
                        </h1>
                        <p className="mb-10 text-lg text-gray-100 sm:text-xl drop-shadow-sm font-medium">
                            Yerel rehberlerin önerileriyle mükemmel seyahatini planla ve unutulmaz anılar biriktir.
                        </p>
                        {/* Arama Çubuğu */}
                        {/* Search Bar */}

                    </div>
                </div>
            </section>

            {/* En Çok Ziyaret Edilen Yerler Bölümü */}
            <section className="bg-background-light py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-text-main">En Çok Ziyaret Edilen Mekanlar</h2>
                            <p className="mt-2 text-text-sub">Ziyaretçilerimizin en çok ilgi gösterdiği mekanları keşfedin.</p>
                        </div>
                        <Link to="/gallery" className="hidden sm:flex items-center text-sm font-bold text-primary hover:text-primary-dark">
                            Tümünü Gör
                            <span className="material-symbols-outlined ml-1 text-lg">arrow_forward</span>
                        </Link>
                    </div>

                    {popularGalleries.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {popularGalleries.map((img) => (
                                <div key={img._id} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft transition-all hover:shadow-lg border border-gray-100">
                                    <div className="relative h-60 w-full overflow-hidden">
                                        <div className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url("${img.image}")` }}>
                                        </div>
                                        <div className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">visibility</span>
                                            {img.views || 0}
                                        </div>
                                    </div>
                                    <div className="flex flex-1 flex-col p-5">
                                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-text-sub">
                                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded capitalize">{img.category}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span> {img.city}</span>
                                        </div>
                                        <h3 className="mb-2 text-lg font-bold text-text-main">{img.title}</h3>
                                        <Link to={`/gallery`} className="mt-auto text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-1">
                                            İncele <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500">Henüz popüler mekan bulunmuyor.</p>
                        </div>
                    )}

                    <div className="mt-8 flex justify-center sm:hidden">
                        <Link to="/gallery" className="flex items-center text-sm font-bold text-primary hover:text-primary-dark">
                            Tümünü Gör
                            <span className="material-symbols-outlined ml-1 text-lg">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </section>

             {/* Özellikler/İstatistikler Bölümü */}
             <section className="bg-primary/5 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <span className="material-symbols-outlined">group</span>
                            </div>
                            <dt className="text-2xl font-bold text-text-main">10K+</dt>
                            <dd className="text-sm font-medium text-text-sub">Mutlu Gezgin</dd>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <span className="material-symbols-outlined">map</span>
                            </div>
                            <dt className="text-2xl font-bold text-text-main">500+</dt>
                            <dd className="text-sm font-medium text-text-sub">Özel Rota</dd>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <span className="material-symbols-outlined">reviews</span>
                            </div>
                            <dt className="text-2xl font-bold text-text-main">4.9</dt>
                            <dd className="text-sm font-medium text-text-sub">Ortalama Puan</dd>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <span className="material-symbols-outlined">verified</span>
                            </div>
                            <dt className="text-2xl font-bold text-text-main">%100</dt>
                            <dd className="text-sm font-medium text-text-sub">Güvenli Ödeme</dd>
                        </div>
                    </div>
                </div>
            </section>

            {/* Öne Çıkan Blog Yazıları */}
            <section className="bg-background-light py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-text-main">Öne Çıkan Blog Yazıları</h2>
                        <p className="mt-2 text-text-sub">Seyahat tutkunları için ipuçları ve rehberler.</p>
                    </div>

                    {!loading && featuredBlogs.length > 0 ? (
                        <div className="grid gap-8 lg:grid-cols-2">
                            {/* Ana Büyük Blog Kartı - İlk Öğe */}
                            {featuredBlogs[0] && (
                                <div className="group relative overflow-hidden rounded-2xl bg-white shadow-soft transition-all hover:shadow-lg lg:col-span-1 h-full flex flex-col">
                                    <div className="relative h-64 w-full overflow-hidden sm:h-72 lg:h-80 lg:flex-1">
                                        <div className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                                             style={{ backgroundImage: `url("${featuredBlogs[0].images?.[0] || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80'}")` }}>
                                        </div>
                                        <div className="absolute top-4 left-4 rounded bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                                            {featuredBlogs[0].category || 'Genel'}
                                        </div>
                                    </div>
                                    <div className="flex flex-col p-6 lg:p-8">
                                        <div className="mb-3 flex items-center gap-3 text-sm text-text-sub">
                                            <span>{new Date(featuredBlogs[0].createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                                            <span>5 dk okuma</span>
                                        </div>
                                        <h3 className="mb-3 text-2xl font-bold text-text-main">{featuredBlogs[0].title}</h3>
                                        <p className="mb-4 text-gray-500 line-clamp-3">{featuredBlogs[0].excerpt || stripHtml(featuredBlogs[0].content).substring(0, 150) + '...'}</p>
                                        <Link to={`/blog/${featuredBlogs[0].slug}`} className="mt-auto inline-flex items-center text-sm font-bold text-primary hover:text-primary-dark">
                                            Devamını Oku <span className="material-symbols-outlined ml-1 text-lg">arrow_forward</span>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Yan Küçük Blog Kartları - Sonraki 2 Öğe */}
                            <div className="flex flex-col gap-8 lg:col-span-1">
                                {featuredBlogs.slice(1, 3).map((blog) => (
                                    <div key={blog._id} className="group flex flex-col gap-4 overflow-hidden rounded-2xl bg-white p-4 shadow-soft transition-all hover:shadow-lg sm:flex-row sm:items-center">
                                        <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-40">
                                            <div className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105" 
                                                 style={{ backgroundImage: `url("${blog.images?.[0] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80'}")` }}>
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">{blog.category || 'Genel'}</div>
                                            <h3 className="mb-2 text-lg font-bold text-text-main line-clamp-2">{blog.title}</h3>
                                            <p className="mb-2 text-sm text-gray-500 line-clamp-2">{blog.excerpt || stripHtml(blog.content).substring(0, 80) + '...'}</p>
                                            <Link to={`/blog/${blog.slug}`} className="text-sm font-semibold text-text-main hover:text-primary">Okumaya Başla</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                         <div className="text-center py-12">
                            {loading ? (
                                <p className="text-gray-500">Yükleniyor...</p>
                            ) : (
                                <p className="text-gray-500">Henüz öne çıkan blog yazısı bulunmuyor.</p>
                            )}
                        </div>
                    )}
                </div>
            </section>

             {/* Bülten Bölümü */}
             <section className="border-t border-border-color bg-white py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl bg-background-dark px-6 py-12 shadow-xl sm:px-12 sm:py-16 md:flex md:items-center md:justify-between">
                        <div className="md:w-1/2">
                            <h2 className="text-2xl font-bold text-white sm:text-3xl">Seyahat Fırsatlarını Kaçırmayın!</h2>
                            <p className="mt-3 text-gray-300">En yeni rotalar, indirimler ve seyahat ipuçları için bültenimize abone olun.</p>
                        </div>
                        <div className="mt-8 md:mt-0 md:w-5/12">
                            <form className="flex flex-col gap-3 sm:flex-row">
                                <input type="email" className="w-full rounded-lg border-0 bg-white/10 px-4 py-3 text-white placeholder:text-gray-400 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-primary sm:flex-1" placeholder="E-posta adresiniz" />
                                <button type="submit" className="whitespace-nowrap rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-dark">
                                    Abone Ol
                                </button>
                            </form>
                            <p className="mt-3 text-xs text-gray-500">Spam yok, sadece macera.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
