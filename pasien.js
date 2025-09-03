document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi dan perbarui waktu & tanggal
    updateDateTime();
    setInterval(updateDateTime, 1000);
    // Muat pengaturan dari localStorage
    loadSettings();
    
    // Atur event listeners
    setupEventListeners();
});

// Perbarui tanggal dan waktu
function updateDateTime() {
    const now = new Date();
    
    // Format waktu: HH:MM:SS
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    // Format tanggal: Hari, DD Bulan YYYY
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const dateString = `${day}, ${date} ${month} ${year}`;
    
    // Perbarui DOM
    document.getElementById('pasien-current-time').textContent = timeString;
    document.getElementById('pasien-current-date').textContent = dateString;
}

// Muat pengaturan dari localStorage
function loadSettings() {
    // Muat nama instansi
    const instansiNama = localStorage.getItem('instansiNama') || 'Kantor Pos Padangsidimpuan';
    document.getElementById('pasien-instansi-nama').textContent = instansiNama;
}

// Ambil nomor antrian
function takeQueueNumber() {
    // Dapatkan daftar antrian saat ini
    let queueList = JSON.parse(localStorage.getItem('queueList')) || [];
    
    // Tentukan nomor antrian berikutnya
    let nextQueueNumber;
    
    if (queueList.length === 0) {
        // Jika antrian kosong, mulai dari 1 + nomor yang sudah diproses
        const processedQueue = parseInt(localStorage.getItem('processedQueue') || '0');
        nextQueueNumber = processedQueue + 1;
    } else {
        // Jika ada antrian, ambil nomor terakhir dan tambahkan 1
        const lastQueueNumber = parseInt(queueList[queueList.length - 1]);
        nextQueueNumber = lastQueueNumber + 1;
    }
    
    // Format nomor antrian dengan nol di depan
    const formattedQueueNumber = String(nextQueueNumber).padStart(3, '0');
    
    // Tambahkan ke daftar antrian
    queueList.push(formattedQueueNumber);
    localStorage.setItem('queueList', JSON.stringify(queueList));
    
    // Perbarui statistik
    const totalQueue = parseInt(localStorage.getItem('totalQueue') || '0') + 1;
    const remainingQueue = queueList.length;
    
    localStorage.setItem('totalQueue', totalQueue.toString());
    localStorage.setItem('remainingQueue', remainingQueue.toString());
    
    // Tampilkan hasil
    document.getElementById('result-number').textContent = formattedQueueNumber;
    document.getElementById('queue-result').classList.remove('hidden');
    
    // Putar notifikasi suara yang lebih baik
    speakText(`Anda mendapatkan nomor antrian ${formattedQueueNumber}. Silakan menunggu. Terima kasih.`);
}

// Tutup pop-up hasil
function closeResult() {
    document.getElementById('queue-result').classList.add('hidden');
}

// Cetak tiket (disederhanakan untuk demo)
function printTicket() {
    const queueNumber = document.getElementById('result-number').textContent;
    const instansiNama = document.getElementById('pasien-instansi-nama').textContent;
    
    // Buat jendela yang bisa dicetak
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Tiket Antrian</title>
            <style>
                body {
                    font-family: 'Poppins', Arial, sans-serif;
                    text-align: center;
                    padding: 20px;
                }
                .ticket {
                    border: 1px dashed #000;
                    padding: 20px;
                    width: 250px;
                    margin: 0 auto;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    border-radius: 8px;
                }
                .title {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .number {
                    font-size: 60px;
                    font-weight: bold;
                    margin: 20px 0;
                    color: #FF6600; /* Warna khas Pos */
                }
                .info {
                    font-size: 14px;
                    margin-top: 20px;
                }
                @media print {
                    body {
                        font-size: 10px;
                    }
                    .ticket {
                        border: 1px solid #000;
                        box-shadow: none;
                        border-radius: 0;
                    }
                    .no-print {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="ticket">
                <div class="title">${instansiNama}</div>
                <div>NOMOR ANTRIAN</div>
                <div class="number">${queueNumber}</div>
                <div class="info">
                    ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    <br>
                    ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div class="info" style="font-size:12px; margin-top:10px;">Mohon menunggu hingga dipanggil.</div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Atur event listeners
function setupEventListeners() {
    document.getElementById('take-number-btn').addEventListener('click', takeQueueNumber);
    document.getElementById('close-result-btn').addEventListener('click', closeResult);
    document.getElementById('print-ticket-btn').addEventListener('click', printTicket);
}

// Fungsionalitas suara dengan konfigurasi yang ditingkatkan
function speakText(text) {
    const speech = new SpeechSynthesisUtterance();
    speech.lang = 'id-ID';
    speech.text = text;
    speech.volume = 1;
    speech.rate = 1.2; // Sedikit lebih cepat
    speech.pitch = 1.1; // Sedikit lebih tinggi untuk suara yang lebih jernih
    
    window.speechSynthesis.speak(speech);
}