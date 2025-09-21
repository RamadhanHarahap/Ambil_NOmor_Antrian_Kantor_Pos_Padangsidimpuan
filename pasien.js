// ======================
// pasien.js - Terhubung Firebase Realtime Database
// ======================

// Import Firebase (pastikan <script type="module"> di pasien.html)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";

// ======================
// Inisialisasi Firebase
// ======================
const firebaseConfig = {
  apiKey: "AIzaSyATmw7Oy0dd1ETEbcThKGM1CDznzFX7v_c",
  authDomain: "antriankantorpos.firebaseapp.com",
  databaseURL: "https://antriankantorpos-default-rtdb.firebaseio.com",
  projectId: "antriankantorpos",
  storageBucket: "antriankantorpos.firebasestorage.app",
  messagingSenderId: "906149591966",
  appId: "1:906149591966:web:cc342da74f2065e41f748f",
  measurementId: "G-0ZLZT3CKK6"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// ======================
// Event DOM Loaded
// ======================
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    loadSettings();
    setupEventListeners();
});

// ======================
// Tanggal & Waktu
// ======================
function updateDateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2,'0');
    const minutes = String(now.getMinutes()).padStart(2,'0');
    const seconds = String(now.getSeconds()).padStart(2,'0');
    const timeString = `${hours}:${minutes}:${seconds}`;

    const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const dateString = `${day}, ${date} ${month} ${year}`;

    document.getElementById('pasien-current-time').textContent = timeString;
    document.getElementById('pasien-current-date').textContent = dateString;
}

// ======================
// Load Settings
// ======================
function loadSettings() {
    const instansiNama = localStorage.getItem('instansiNama') || 'Kantor Pos Padangsidimpuan';
    document.getElementById('pasien-instansi-nama').textContent = instansiNama;
}

// ======================
// Ambil Nomor Antrian
// ======================
async function takeQueueNumber() {
    const antrianRef = ref(database, 'antrian');

    // Ambil data terakhir dari Firebase
    let lastNumber = 0;
    await onValue(antrianRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const semuaData = Object.values(data);
            semuaData.sort((a,b) => a.waktu - b.waktu);
            lastNumber = semuaData[semuaData.length-1]?.nomorAntrian || 0;
        }
    }, { onlyOnce: true });

    const nextNumber = lastNumber + 1;
    const formattedNumber = String(nextNumber).padStart(3,'0');

    // Tambahkan ke Firebase
    const newRef = push(antrianRef);
    set(newRef, {
        nomorAntrian: nextNumber,
        waktu: Date.now()
    }).then(() => {
        console.log("Nomor antrian ditambahkan:", formattedNumber);
    }).catch(err => console.error(err));

    // Tampilkan hasil
    document.getElementById('result-number').textContent = formattedNumber;
    document.getElementById('queue-result').classList.remove('hidden');

    speakText(`Anda mendapatkan nomor antrian ${formattedNumber}. Silakan menunggu. Terima kasih.`);
}

// ======================
// Tutup pop-up hasil
// ======================
function closeResult() {
    document.getElementById('queue-result').classList.add('hidden');
}

// ======================
// Cetak Tiket
// ======================
function printTicket() {
    const queueNumber = document.getElementById('result-number').textContent;
    const instansiNama = document.getElementById('pasien-instansi-nama').textContent;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Tiket Antrian</title>
            <style>
                body { font-family: 'Poppins', Arial, sans-serif; text-align:center; padding:20px; }
                .ticket { border:1px dashed #000; padding:20px; width:250px; margin:0 auto; box-shadow:0 4px 8px rgba(0,0,0,0.1); border-radius:8px;}
                .title { font-size:18px; font-weight:bold; margin-bottom:10px; }
                .number { font-size:60px; font-weight:bold; margin:20px 0; color:#FF6600;}
                .info { font-size:14px; margin-top:20px; }
                @media print {
                    body { font-size:10px; }
                    .ticket { border:1px solid #000; box-shadow:none; border-radius:0;}
                    .no-print { display:none; }
                }
            </style>
        </head>
        <body>
            <div class="ticket">
                <div class="title">${instansiNama}</div>
                <div>NOMOR ANTRIAN</div>
                <div class="number">${queueNumber}</div>
                <div class="info">
                    ${new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
                    <br>
                    ${new Date().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })}
                </div>
                <div class="info" style="font-size:12px; margin-top:10px;">Mohon menunggu hingga dipanggil.</div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// ======================
// Event Listeners
// ======================
function setupEventListeners() {
    document.getElementById('take-number-btn').addEventListener('click', takeQueueNumber);
    document.getElementById('close-result-btn').addEventListener('click', closeResult);
    document.getElementById('print-ticket-btn').addEventListener('click', printTicket);
}

// ======================
// Text-to-Speech
// ======================
function speakText(text) {
    const speech = new SpeechSynthesisUtterance();
    speech.lang = 'id-ID';
    speech.text = text;
    speech.volume = 1;
    speech.rate = 1.2;
    speech.pitch = 1.1;
    window.speechSynthesis.speak(speech);
}
