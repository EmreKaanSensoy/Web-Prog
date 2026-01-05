# Google Maps API Kurulum Rehberi

## Adım 1: Google Cloud Console'a Giriş
1. https://console.cloud.google.com/ adresine gidin
2. Google hesabınızla giriş yapın

## Adım 2: Proje Oluşturma
1. Üst kısımdaki proje seçiciye tıklayın
2. "NEW PROJECT" butonuna tıklayın
3. Proje adı girin (örn: "Turizm Platformu")
4. "CREATE" butonuna tıklayın
5. Oluşturulan projeyi seçin

## Adım 3: Faturalandırma Ayarlama
⚠️ **ÖNEMLİ:** Google Maps API kullanmak için bir faturalandırma hesabı bağlamanız gerekir.
- Sol menüden "Billing" (Faturalandırma) seçin
- Faturalandırma hesabı ekleyin (kredi kartı gerekli)
- Aylık $200 ücretsiz kredi alırsınız (çoğu kullanım için yeterli)

## Adım 4: Gerekli API'leri Etkinleştirme
Sol menüden "APIs & Services" > "Library" (API'ler ve Hizmetler > Kütüphane) seçin ve şu API'leri arayıp etkinleştirin:

### Zorunlu API'ler:
1. **Maps JavaScript API**
   - Arayın ve "ENABLE" (Etkinleştir) butonuna tıklayın

2. **Places API**
   - Arayın ve "ENABLE" (Etkinleştir) butonuna tıklayın

### Opsiyonel (Önerilen):
3. **Geocoding API** (Adres dönüşümü için)
4. **Directions API** (Rota çizme için)

## Adım 5: API Anahtarı Oluşturma
1. Sol menüden "APIs & Services" > "Credentials" (Kimlik Bilgileri) seçin
2. "CREATE CREDENTIALS" butonuna tıklayın
3. "API key" seçin
4. Oluşan API anahtarını kopyalayın (bir kez gösterilir, saklayın!)

## Adım 6: API Anahtarını Kısıtlama (Güvenlik)
1. Oluşan API anahtarına tıklayın
2. "Application restrictions" (Uygulama kısıtlamaları) altında:
   - "HTTP referrers (web sites)" seçin
   - "Website restrictions" (Web sitesi kısıtlamaları) altına ekleyin:
     ```
     http://localhost:3000/*
     http://localhost:*
     ```
     (Production için domain'inizi ekleyin: `https://yourdomain.com/*`)

3. "API restrictions" (API kısıtlamaları) altında:
   - "Restrict key" seçin
   - Sadece şu API'leri seçin:
     - Maps JavaScript API
     - Places API
     - (Etkinleştirdiğiniz diğer API'ler)
4. "SAVE" (Kaydet) butonuna tıklayın

## Adım 7: API Anahtarını Projeye Ekleme

1. Proje klasörünüzde `.env` dosyasını açın (yoksa oluşturun)

2. Şu satırı ekleyin veya güncelleyin:
   ```env
   GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   (`AIzaSyB...` kısmını kendi API anahtarınızla değiştirin)

3. Dosyayı kaydedin

## Adım 8: Sunucuyu Yeniden Başlatma
```bash
# Sunucuyu durdurun (Ctrl+C)
# Sonra yeniden başlatın
node server.js
```

## Test Etme
1. Tarayıcıda `http://localhost:3000/route` adresine gidin
2. Harita görünmeli ve rota çizme özelliği çalışmalı

## Sorun Giderme

### Harita görünmüyor
- API anahtarının `.env` dosyasında doğru olduğundan emin olun
- Tarayıcı konsolunu kontrol edin (F12 > Console)
- Google Cloud Console'da API'lerin etkin olduğunu kontrol edin

### "This API project is not authorized to use this API"
- İlgili API'lerin etkinleştirildiğinden emin olun
- API kısıtlamalarını kontrol edin

### "RefererNotAllowedMapError"
- API anahtarı kısıtlamalarını kontrol edin
- `localhost:3000` referrer'ının ekli olduğundan emin olun

## Ücretsiz Kota
Google Maps API aylık $200 ücretsiz kredi sağlar:
- Maps JavaScript API: $7 per 1000 yükleme
- Places API: $17 per 1000 istek
- Geocoding API: $5 per 1000 istek

Çoğu küçük-orta ölçekli proje için yeterlidir.

## Güvenlik Notları
⚠️ **ÖNEMLİ:**
- API anahtarınızı GitHub'a yüklemeyin (`.env` zaten `.gitignore`'da)
- Production'da mutlaka domain kısıtlaması ekleyin
- API kısıtlamalarını aktif edin
- Kullanılmayan API'leri devre dışı bırakın

## Yardımcı Linkler
- Google Maps Platform: https://developers.google.com/maps
- Fiyatlandırma: https://developers.google.com/maps/billing-and-pricing/pricing
- Dokümantasyon: https://developers.google.com/maps/documentation/javascript
