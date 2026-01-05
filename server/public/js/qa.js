// Soru-Cevap arama ve yararlı bulma
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const qaResults = document.getElementById('qaResults');

    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const query = document.getElementById('searchQuery').value;
            const city = document.getElementById('searchCity').value;

            fetch(`/qa/search?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        displayResults(result.qas);
                    } else {
                        alert('Arama sırasında bir hata oluştu');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        });
    }

    // Yararlı bulma butonları
    const helpfulButtons = document.querySelectorAll('.helpful-btn');
    helpfulButtons.forEach(button => {
        button.addEventListener('click', function() {
            const qaId = this.getAttribute('data-id');
            const btn = this;
            
            // CSRF token'ı al
            const csrfToken = document.querySelector('input[name="_csrf"]')?.value || 
                             document.querySelector('meta[name="csrf-token"]')?.content || '';
            
            fetch(`/qa/${qaId}/helpful`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                }
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const countSpan = btn.querySelector('.helpful-count');
                    if (countSpan) {
                        countSpan.textContent = result.helpful;
                    }
                    btn.classList.add('btn-success');
                    btn.classList.remove('btn-outline-success');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });

    function displayResults(qas) {
        if (qas.length === 0) {
            qaResults.innerHTML = '<div class="col-12"><div class="alert alert-info">Sonuç bulunamadı.</div></div>';
            return;
        }

        let html = '';
        qas.forEach(qa => {
            html += `
                <div class="col-md-12 mb-3">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">${qa.question}</h5>
                        </div>
                        <div class="card-body">
                            <p>${qa.answer}</p>
                            <div class="d-flex justify-content-between">
                                <div>
                                    <span class="badge bg-primary"><i class="bi bi-geo-alt"></i> ${qa.city}</span>
                                    <span class="badge bg-secondary">${qa.category}</span>
                                </div>
                                <div>
                                    <button class="btn btn-sm btn-outline-success helpful-btn" data-id="${qa._id}">
                                        <i class="bi bi-hand-thumbs-up"></i> Yararlı (${qa.helpful})
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        qaResults.innerHTML = html;
    }
});
