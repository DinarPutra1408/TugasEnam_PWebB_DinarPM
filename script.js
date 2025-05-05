document.addEventListener('DOMContentLoaded', function() {
    // Kode untuk buku tamu
    const guestbookForm = document.getElementById('guestbook-form');
    const guestList = document.getElementById('guestbook-list');
    const searchInput = document.getElementById('search-guest');
    const clearAllBtn = document.getElementById('clear-all');
    
    let guests = JSON.parse(localStorage.getItem('guests')) || [];
    
    function displayGuests(filter = '') {
        guestList.innerHTML = '';

        if (guests.length === 0) {
            guestList.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <p>Belum ada pengunjung</p>
                </div>
            `;
            return;
        }
        
        let filteredGuests = guests;
        if (filter) {
            filteredGuests = [];
            for (let i = 0; i < guests.length; i++) {
                const guest = guests[i];
                if (guest.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1 || 
                    guest.message.toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
                    filteredGuests.push(guest);
                }
            }
        }
        
        if (filteredGuests.length === 0) {
            guestList.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <p>Tidak ada pengunjung yang cocok dengan pencarian</p>
                </div>
            `;
            return;
        }

        for (let i = 0; i < filteredGuests.length; i++) {
            const guest = filteredGuests[i];
            
            const guestItem = document.createElement('div');
            guestItem.className = `guest-item ${guest.attended ? 'attended' : ''}`;
            
            const formattedDate = formatDate(new Date(guest.timestamp));
            
            guestItem.innerHTML = `
                <div class="guest-info">
                    <h4>${escapeHtml(guest.name)}</h4>
                    <p class="guest-message">${escapeHtml(guest.message)}</p>
                    <span class="guest-date">${formattedDate}</span>
                </div>
                <div class="guest-actions">
                    <button class="toggle-attended" data-index="${getOriginalIndex(guest)}" 
                            title="${guest.attended ? 'Tandai belum berkunjung' : 'Tandai sudah berkunjung'}">
                        ${guest.attended ? '✓' : '✗'}
                    </button>
                    <button class="delete-guest" data-index="${getOriginalIndex(guest)}" 
                            title="Hapus pengunjung">✕</button>
                </div>
            `;
            
            guestList.appendChild(guestItem);
        }
    }
    
    function getOriginalIndex(guest) {
        for (let i = 0; i < guests.length; i++) {
            if (guests[i].timestamp === guest.timestamp) {
                return i;
            }
        }
        return -1;
    }
    
    function formatDate(date) {
        const options = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleString('id-ID', options);
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    guestbookForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('guest-name').value.trim();
        const message = document.getElementById('guest-message').value.trim();
        const attended = document.getElementById('guest-attended').checked;
        
        if (name && message) {
            const newGuest = {
                name: name,
                message: message,
                attended: attended,
                timestamp: new Date().toISOString()
            };
            
            guests.unshift(newGuest);
            localStorage.setItem('guests', JSON.stringify(guests));
            
            displayGuests();
            guestbookForm.reset();
            
            showToast('Terima kasih telah mengisi buku tamu!');
        }
    });
    
    guestList.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-guest')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            if (confirm('Apakah Anda yakin ingin menghapus pengunjung ini?')) {
                guests.splice(index, 1);
                localStorage.setItem('guests', JSON.stringify(guests));
                displayGuests(searchInput.value);
            }
        }
        
        if (e.target.classList.contains('toggle-attended')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            guests[index].attended = !guests[index].attended;
            localStorage.setItem('guests', JSON.stringify(guests));
            displayGuests(searchInput.value);
        }
    });
    
    searchInput.addEventListener('input', function() {
        displayGuests(this.value);
    });
    
    clearAllBtn.addEventListener('click', function() {
        if (guests.length > 0 && confirm('Apakah Anda yakin ingin menghapus semua data pengunjung?')) {
            guests = [];
            localStorage.removeItem('guests');
            displayGuests();
            searchInput.value = '';
        }
    });

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>${escapeHtml(message)}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }, 100);
    }  

    // Kode untuk API Pexels (Gambar)
    const API_KEY_PEXELS = 'qVUjdmMlBd8yhQcsuQM3b6VNKDNluck2kdkyhV5PcrbhMZGrvIoBgCen'; 
    const query = 'pemandangan'; 
    const perPage = 4;

    fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=${perPage}`, {
      headers: {
        Authorization: API_KEY_PEXELS
      }
    })
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('image-containerr');
      data.photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.src.medium;
        img.alt = photo.photographer;
        container.appendChild(img);
      });
    })
    .catch(error => {
      console.error('Gagal ambil gambar dari Pexels:', error);
    });
});

const API_KEY = 'FRRCGBROcMubkF+6ZCSKtg==JYZ9jxhgUtSRfEMx';

  function fetchQuote() {
    fetch('https://api.api-ninjas.com/v1/quotes', {
      headers: { 'X-Api-Key': API_KEY }
    })
    .then(response => {
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      const quote = data[0];
      document.getElementById('quote-text').textContent = `"${quote.quote}"`;
      document.getElementById('quote-author').textContent = `— ${quote.author}`;
    })
    .catch(error => {
      console.error('Gagal ambil kutipan:', error);
      document.getElementById('quote-text').textContent = 'Gagal memuat kutipan.';
      document.getElementById('quote-author').textContent = '';
    });
  }

  // Load awal
  fetchQuote();

  // Tombol klik
  document.getElementById('refresh-quote').addEventListener('click', fetchQuote);



