// Leaflet.js ile ücretsiz harita ve rota çizme (OpenStreetMap)
let map;
let startMarker = null;
let endMarker = null;
let routingControl = null;

// Haritayı başlat
function initMap() {
    // Harita div'ini kontrol et
    const mapDiv = document.getElementById('map');
    if (!mapDiv) {
        console.error('Harita div bulunamadı!');
        return;
    }
    
    // Leaflet kontrolü
    if (typeof L === 'undefined') {
        console.error('Leaflet.js yüklenmedi!');
        return;
    }
    
    // Türkiye merkez noktası (Ankara)
    const center = [39.9334, 32.8597];
    
    // Haritayı oluştur
    map = L.map('map').setView(center, 6);
    
    // Harita yüklenene kadar bekle
    map.whenReady(function() {
        console.log('Harita hazır!');
    });

    // OpenStreetMap tile layer'ı ekle (tamamen ücretsiz)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Adres arama özelliği (Nominatim - Ücretsiz)
    const Geocoder = L.Control && L.Control.Geocoder;
    
    function geocodeAddress(query, callback) {
        // Nominatim API'sini direkt kullan (ücretsiz)
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=tr&limit=5`;
        fetch(url, {
            headers: {
                'User-Agent': 'Turizm Platformu' // Nominatim için gerekli
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                callback(data.map(item => ({
                    center: { lat: parseFloat(item.lat), lng: parseFloat(item.lon) },
                    name: item.display_name
                })));
            } else {
                callback([]);
            }
        })
        .catch(error => {
            console.error('Geocoding error:', error);
            callback([]);
        });
    }
    
    function reverseGeocode(lat, lng, callback) {
        // Reverse geocoding (koordinat -> adres)
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
        fetch(url, {
            headers: {
                'User-Agent': 'Turizm Platformu'
            }
        })
        .then(response => response.json())
        .then(data => {
            callback([{
                name: data.display_name || `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
            }]);
        })
        .catch(error => {
            console.error('Reverse geocoding error:', error);
            callback([{
                name: `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
            }]);
        });
    }
    
    // Başlangıç noktası arama
    const startInput = document.getElementById('startAddress');
    if (startInput) {
            startInput.addEventListener('change', function() {
                const address = this.value;
                if (address.trim()) {
                    geocodeAddress(address, function(results) {
                        if (results && results.length > 0) {
                            const result = results[0];
                            const location = {
                                lat: result.center.lat,
                                lng: result.center.lng,
                                address: result.name
                            };
                            
                            document.getElementById('startLocation').value = JSON.stringify(location);
                            
                            // Marker ekle/güncelle
                            if (startMarker) {
                                map.removeLayer(startMarker);
                            }
                            startMarker = L.marker([location.lat, location.lng])
                                .addTo(map)
                                .bindPopup('Başlangıç: ' + location.address)
                                .openPopup();
                            
                            map.setView([location.lat, location.lng], 13);
                            
                            // Eğer bitiş noktası varsa rota çiz
                            if (endMarker) {
                                calculateRoute();
                            }
                        } else {
                            alert('Adres bulunamadı: ' + address);
                        }
                    });
                }
            });
    }

    // Bitiş noktası arama
    const endInput = document.getElementById('endAddress');
    if (endInput) {
            endInput.addEventListener('change', function() {
                const address = this.value;
                if (address.trim()) {
                    geocodeAddress(address, function(results) {
                        if (results && results.length > 0) {
                            const result = results[0];
                            const location = {
                                lat: result.center.lat,
                                lng: result.center.lng,
                                address: result.name
                            };
                            
                            document.getElementById('endLocation').value = JSON.stringify(location);
                            
                            // Marker ekle/güncelle
                            if (endMarker) {
                                map.removeLayer(endMarker);
                            }
                            endMarker = L.marker([location.lat, location.lng])
                                .addTo(map)
                                .bindPopup('Bitiş: ' + location.address)
                                .openPopup();
                            
                            map.setView([location.lat, location.lng], 13);
                            
                            // Eğer başlangıç noktası varsa rota çiz
                            if (startMarker) {
                                calculateRoute();
                            }
                        } else {
                            alert('Adres bulunamadı: ' + address);
                        }
                    });
                }
            });
    }

    // Haritaya tıklayınca marker ekle
    map.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            
            // Adres bilgisini al (reverse geocoding)
            reverseGeocode(lat, lng, function(results) {
                const address = results && results.length > 0 ? results[0].name : 'Koordinat: ' + lat.toFixed(6) + ', ' + lng.toFixed(6);
                
                // Eğer başlangıç noktası yoksa veya boşsa, başlangıç olarak ayarla
                const startLocation = document.getElementById('startLocation').value;
                if (!startLocation) {
                    const location = { lat, lng, address };
                    document.getElementById('startLocation').value = JSON.stringify(location);
                    document.getElementById('startAddress').value = address;
                    
                    if (startMarker) map.removeLayer(startMarker);
                    startMarker = L.marker([lat, lng])
                        .addTo(map)
                        .bindPopup('Başlangıç: ' + address)
                        .openPopup();
                } else if (!document.getElementById('endLocation').value) {
                    // Bitiş noktası olarak ayarla
                    const location = { lat, lng, address };
                    document.getElementById('endLocation').value = JSON.stringify(location);
                    document.getElementById('endAddress').value = address;
                    
                    if (endMarker) map.removeLayer(endMarker);
                    endMarker = L.marker([lat, lng])
                        .addTo(map)
                        .bindPopup('Bitiş: ' + address)
                        .openPopup();
                    
                    if (startMarker) {
                        calculateRoute();
                    }
                }
            });
        });
}

// Rota hesapla
function calculateRoute() {
    if (!map) {
        console.error('Harita henüz hazır değil!');
        return;
    }

    const startLoc = document.getElementById('startLocation').value;
    const endLoc = document.getElementById('endLocation').value;

    if (!startLoc || !endLoc) {
        console.log('Başlangıç veya bitiş noktası eksik');
        return;
    }

    try {
        const start = JSON.parse(startLoc);
        const end = JSON.parse(endLoc);

        console.log('Rota hesaplanıyor:', start, end);

        // Leaflet Routing Machine kontrolü
        if (typeof L.Routing === 'undefined') {
            alert('Rota çizme özelliği yüklenemedi. Lütfen sayfayı yenileyin.');
            return;
        }

        // Önceki routing control'ü kaldır
        if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
        }

        // Yeni routing control oluştur
        routingControl = L.Routing.control({
            waypoints: [
                L.latLng(start.lat, start.lng),
                L.latLng(end.lat, end.lng)
            ],
            routeWhileDragging: false,
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                profile: 'driving'
            }),
            lineOptions: {
                styles: [{color: '#3388ff', weight: 4, opacity: 0.8}]
            },
            addWaypoints: false,
            showAlternatives: false
        }).addTo(map);

        // Rota bulunduğunda mesafe ve süre bilgilerini al
        routingControl.on('routesfound', function(e) {
            const routes = e.routes;
            console.log('Rota bulundu:', routes);
            if (routes && routes.length > 0) {
                const route = routes[0];
                const distance = (route.summary.totalDistance / 1000).toFixed(2); // km
                const duration = route.summary.totalTime; // saniye
                
                const hours = Math.floor(duration / 3600);
                const minutes = Math.floor((duration % 3600) / 60);
                const durationStr = hours > 0 
                    ? `${hours} saat ${minutes} dakika`
                    : `${minutes} dakika`;

                document.getElementById('distance').value = distance;
                document.getElementById('duration').value = durationStr;
                
                console.log('Mesafe:', distance, 'km, Süre:', durationStr);
            }
        });

        routingControl.on('routingerror', function(e) {
            console.error('Rota hatası:', e);
            alert('Rota hesaplanamadı. Lütfen geçerli başlangıç ve bitiş noktaları seçin.');
        });
    } catch (error) {
        console.error('Rota hesaplama hatası:', error);
        alert('Rota hesaplanırken bir hata oluştu: ' + error.message);
    }
}

// Form submit
document.addEventListener('DOMContentLoaded', function() {
    // Leaflet ve Routing Machine yüklenene kadar bekle
    if (typeof L === 'undefined' || typeof L.Routing === 'undefined') {
        console.error('Leaflet veya Routing Machine kütüphaneleri yüklenmedi!');
        setTimeout(function() {
            if (typeof L !== 'undefined' && typeof L.Routing !== 'undefined') {
                initMap();
            } else {
                alert('Harita kütüphaneleri yüklenemedi. Lütfen sayfayı yenileyin.');
            }
        }, 1000);
    } else {
        // initMap'ı çağır
        setTimeout(function() {
            initMap();
        }, 100); // Kısa bir gecikme ile harita div'inin render olmasını bekle
    }
    
    const routeForm = document.getElementById('routeForm');
    if (routeForm) {
        routeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const startLoc = document.getElementById('startLocation').value;
            const endLoc = document.getElementById('endLocation').value;
            
            if (!startLoc || !endLoc) {
                alert('Lütfen başlangıç ve bitiş noktalarını seçin!');
                return;
            }
            
            // Form verilerini topla
            const title = routeForm.querySelector('input[name="title"]').value;
            const city = routeForm.querySelector('input[name="city"]').value;
            const description = routeForm.querySelector('textarea[name="description"]').value || '';
            const difficulty = routeForm.querySelector('select[name="difficulty"]').value;
            const waypoints = document.getElementById('waypoints').value || '[]';
            const distance = document.getElementById('distance').value || '';
            const duration = document.getElementById('duration').value || '';
            
            // Konum verilerini al
            const startLocationValue = document.getElementById('startLocation').value;
            const endLocationValue = document.getElementById('endLocation').value;
            
            if (!title || !city) {
                alert('Lütfen rota başlığı ve şehir bilgilerini girin!');
                return;
            }
            
            if (!startLocationValue || !endLocationValue) {
                alert('Lütfen başlangıç ve bitiş noktalarını seçin!');
                return;
            }
            
            const data = {
                title,
                city,
                description,
                startLocation: startLocationValue,
                endLocation: endLocationValue,
                waypoints,
                distance,
                duration,
                difficulty
            };

            // CSRF token'ı al
            const csrfToken = document.querySelector('input[name="_csrf"]')?.value || '';
            
            console.log('Gönderilen veri:', data);
            
            fetch('/route/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`HTTP ${response.status}: ${text}`);
                    });
                }
                return response.json();
            })
            .then(result => {
                console.log('Sunucu cevabı:', result);
                if (result.success) {
                    alert('Rota başarıyla kaydedildi!');
                    routeForm.reset();
                    // Marker'ları ve rotayı temizle
                    if (startMarker) {
                        map.removeLayer(startMarker);
                        startMarker = null;
                    }
                    if (endMarker) {
                        map.removeLayer(endMarker);
                        endMarker = null;
                    }
                    if (routingControl) {
                        map.removeControl(routingControl);
                        routingControl = null;
                    }
                    document.getElementById('startLocation').value = '';
                    document.getElementById('endLocation').value = '';
                    document.getElementById('startAddress').value = '';
                    document.getElementById('endAddress').value = '';
                    document.getElementById('distance').value = '';
                    document.getElementById('duration').value = '';
                    // Sayfayı yenile
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    alert('Hata: ' + (result.error || 'Bilinmeyen hata'));
                }
            })
            .catch(error => {
                console.error('Hata detayı:', error);
                alert('Bir hata oluştu: ' + error.message);
            });
        });
    }
});