import { Link } from 'react-router-dom';



export const WeekendGetawaysPage = () => (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Hafta Sonu Gezileri</h1>
        <p className="text-lg text-gray-700">
            Şehrin gürültüsünden uzaklaşmak için sadece iki gününüz mü var? Sorun değil!
            Yakın çevrenizdeki doğa harikalarını, sessiz kasabaları ve dinlenme noktalarını keşfedin.
            Sapanca, Ağva, Şile veya Assos gibi lokasyonlar hafta sonu kaçamakları için idealdir.
        </p>
    </div>
);

export const CulturalToursPage = () => (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Kültür Turları</h1>
        <p className="text-lg text-gray-700">
            Tarih kokan sokaklar, antik kentler ve müzeler sizi bekliyor. Göbeklitepe'den Efes'e,
            tarihin sıfır noktasına yolculuk yapın. Yerel rehberler eşliğinde kültürümüzün derinliklerine inin.
        </p>
    </div>
);

/* --- KURUMSAL Components --- */
export const AboutPage = () => (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Hakkımızda</h1>
        <div className="prose max-w-none text-gray-700">
            <p className="mb-4">
                TourGuide, seyahat tutkunlarını bir araya getiren, yeni rotalar keşfetmelerini ve deneyimlerini paylaşmalarını sağlayan
                yenilikçi bir platformdur. 2024 yılında kurulan sitemiz, "Her yolculuk bir hikayedir" mottosuyla yola çıkmıştır.
            </p>
            <p className="mb-4">
                Amacımız, gezginlerin güvenilir bilgilere ulaşmasını sağlamak, yerel rehberlerin önerileriyle zenginleştirilmiş
                rotalar sunmak ve seyahat planlamasını karmaşık bir süreçten keyifli bir deneyime dönüştürmektir.
            </p>
            <h2 className="text-2xl font-bold mt-8 mb-4">Misyonumuz</h2>
            <p>
                Dünyayı keşfetmek isteyen herkes için erişilebilir, güvenilir ve ilham verici bir seyahat rehberi olmak.
            </p>
        </div>
    </div>
);

export const CareerPage = () => (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Kariyer</h1>
        <p className="text-lg text-gray-700 mb-8">
            TourGuide ekibine katılmak ister misiniz? Seyahat etmeyi seven, teknolojiye meraklı ve yaratıcı ekip arkadaşları arıyoruz.
        </p>
        <div className="bg-white shadow-soft rounded-lg p-6 border border-gray-100">
            <h3 className="font-bold text-xl mb-2">Açık Pozisyonlar</h3>
            <p className="text-gray-600 mb-4">Şu anda açık bir pozisyon bulunmamaktadır. Ancak genel başvurularınızı <a href="mailto:kariyer@tourguide.com" className="text-primary">kariyer@tourguide.com</a> adresine iletebilirsiniz.</p>
        </div>
    </div>
);

export const ContactPage = () => (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">İletişim</h1>
        <div className="grid md:grid-cols-2 gap-12">
            <div>
                <p className="text-lg text-gray-700 mb-6">
                    Sorularınız, önerileriniz veya iş birlikleri için bizimle iletişime geçebilirsiniz.
                    Ekibimiz en kısa sürede size dönüş yapacaktır.
                </p>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">mail</span>
                        <span>info@tourguide.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">phone</span>
                        <span>+90 (212) 555 00 00</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">location_on</span>
                        <span>Levent, İstanbul, Türkiye</span>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-soft">
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Adınız Soyadınız</label>
                        <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">E-Posta</label>
                        <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mesajınız</label>
                        <textarea rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"></textarea>
                    </div>
                    <button type="button" className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors">Gönder</button>
                </form>
            </div>
        </div>
    </div>
);

export const PrivacyPolicyPage = () => (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Gizlilik Politikası</h1>
        <div className="prose max-w-none text-gray-700 text-sm">
            <p className="mb-4">Son Güncelleme: 25 Aralık 2024</p>
            <p className="mb-2"><strong>1. Veri Toplama:</strong> Sitemizi kullanırken... (Örnek metin)</p>
            <p className="mb-2"><strong>2. Çerezler:</strong> Kullanıcı deneyimini artırmak için çerezler kullanıyoruz...</p>
            <p className="mb-2"><strong>3. Veri Güvenliği:</strong> Kişisel verileriniz şifrelenerek saklanmaktadır...</p>
            <p>Detaylı bilgi için lütfen bizimle iletişime geçin.</p>
        </div>
    </div>
);

/* --- YARDIM Components --- */
export const FAQPage = () => (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Sıkça Sorulan Sorular</h1>
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-2">Rota oluşturmak ücretli mi?</h3>
                <p className="text-gray-600">Hayır, TourGuide üzerinde rota oluşturmak ve paylaşmak tamamen ücretsizdir.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-2">Rehberlerle nasıl iletişime geçebilirim?</h3>
                <p className="text-gray-600">Rehberlerin profilleri üzerinden mesaj gönderebilir veya sundukları turlara rezervasyon yapabilirsiniz.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-2">Mobil uygulamanız var mı?</h3>
                <p className="text-gray-600">Şu anda sadece web üzerinden hizmet veriyoruz, ancak mobil uygulamamız geliştirme aşamasındadır.</p>
            </div>
        </div>
    </div>
);

export const CancellationPage = () => (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Rezervasyon İptali</h1>
        <p className="text-lg text-gray-700 mb-4">
            Satın aldığınız turları veya rezervasyonları, etkinlik tarihinden 24 saat öncesine kadar ücretsiz iptal edebilirsiniz.
        </p>
        <p>İptal işlemleri için profilinizdeki "Rezervasyonlarım" sekmesini kullanabilirsiniz.</p>
    </div>
);

export const TermsPage = () => (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Kullanım Koşulları</h1>
        <div className="prose max-w-none text-gray-700 text-sm">
            <p className="mb-4">Lütfen sitemizi kullanmadan önce bu koşulları dikkatlice okuyunuz.</p>
            <ul className="list-disc pl-5 space-y-2">
                <li>Sitedeki içeriklerin izinsiz kopyalanması yasaktır.</li>
                <li>Kullanıcılar, paylaştıkları içeriklerden kendileri sorumludur.</li>
                <li>TourGuide, site üzerinde değişiklik yapma hakkını saklı tutar.</li>
            </ul>
        </div>
    </div>
);
