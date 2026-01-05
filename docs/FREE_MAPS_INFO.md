# Ücretsiz Harita Çözümü - Leaflet.js

## ✅ Tamamen Ücretsiz!

Bu proje artık **Leaflet.js** kullanıyor - API anahtarı, kayıt veya kredi kartı gerektirmez!

## Kullanılan Ücretsiz Servisler

### 1. **OpenStreetMap** (Harita Tiles)
- Tamamen açık kaynak ve ücretsiz
- Dünya çapında harita verileri
- Hiçbir limit yok

### 2. **Nominatim Geocoding** (Adres Arama)
- OpenStreetMap projesi tarafından sağlanan ücretsiz servis
- Adres araması yapabilirsiniz
- Limit: Dakikada 1 istek (yeterli)

### 3. **OSRM Routing** (Rota Hesaplama)
- Açık kaynak routing servisi
- Araba, yaya, bisiklet rotaları
- Tamamen ücretsiz

## Özellikler

✅ Harita görüntüleme  
✅ Adres arama (Türkiye odaklı)  
✅ Haritaya tıklayarak nokta seçme  
✅ Rota çizme  
✅ Mesafe ve süre hesaplama  
✅ Marker'lar (başlangıç/bitiş)  

## Nasıl Kullanılır?

1. **Adres ile arama:**
   - "Başlangıç Noktası" veya "Bitiş Noktası" alanına bir adres yazın
   - Enter'a basın veya başka bir yere tıklayın
   - Harita üzerinde nokta işaretlenecektir

2. **Haritaya tıklayarak:**
   - Harita üzerinde herhangi bir yere tıklayın
   - İlk tıklama başlangıç, ikinci tıklama bitiş noktası olur
   - Otomatik olarak rota çizilir

3. **Rota kaydetme:**
   - Başlangıç ve bitiş noktalarını seçin
   - Rota otomatik çizilir
   - Mesafe ve süre bilgileri doldurulur
   - "Rotayı Kaydet" butonuna tıklayın

## Sınırlamalar

- Nominatim servisi **dakikada 1 istek** limitine sahip (çoğu kullanım için yeterli)
- Daha yüksek limit için kendi Nominatim sunucunuzu kurabilirsiniz (yine ücretsiz)

## Google Maps'e Geçiş

Eğer ileride Google Maps API kullanmak isterseniz:
1. `GOOGLE_MAPS_SETUP.md` dosyasına bakın
2. Google Maps API anahtarı alın
3. `views/route/index.ejs` ve `public/js/maps.js` dosyalarını güncelleyin

## Avantajlar

✅ **Tamamen ücretsiz** - Hiçbir ücret yok  
✅ **API anahtarı gerekmez**  
✅ **Kayıt olmaya gerek yok**  
✅ **Açık kaynak** - Tam kontrol sizde  
✅ **Özelleştirilebilir** - İstediğiniz gibi değiştirebilirsiniz  

## Destek

Leaflet.js dokümantasyonu: https://leafletjs.com/  
OpenStreetMap: https://www.openstreetmap.org/  
Nominatim: https://nominatim.org/
