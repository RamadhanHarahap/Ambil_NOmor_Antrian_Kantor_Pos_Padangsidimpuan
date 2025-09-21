document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    loadInstansi();

    document.getElementById('take-number-btn').addEventListener('click', takeQueueNumber);
    document.getElementById('close-result-btn').addEventListener('click', () => {
        document.getElementById('queue-result').classList.add('hidden');
    });
    document.getElementById('print-ticket-btn').addEventListener('click', () => window.print());
});

// -------------------
// TANGGAL & WAKTU
// -------------------
function updateDateTime() {
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const dateString = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    document.getElementById('pasien-current-time').textContent = timeString;
    document.getElementById('pasien-current-date').textContent = dateString;
}

// -------------------
// LOAD NAMA INSTANSI
// -------------------
function loadInstansi() {
    firebase.database().ref('settings/instansiNama').on('value', snapshot => {
        document.getElementById('pasien-instansi-nama').textContent = snapshot.val() || 'Kantor Pos Padangsidimpuan';
    });
}

// -------------------
// AMBIL NOMOR ANTRIAN
// -------------------
function takeQueueNumber() {
    const nextQueueRef = firebase.database().ref('antrian/next');
    nextQueueRef.transaction(queue => {
        if(queue === null) queue = [];
        const lastNumber = queue.length > 0 ? queue[queue.length-1] : 0;
        const newNumber = lastNumber + 1;
        queue.push(newNumber);
        return queue;
    }, (error, committed, snapshot) => {
        if(error) alert('Gagal mengambil nomor antrian.');
        else if(committed) showQueueResult(snapshot.val()[snapshot.val().length-1]);
    });
}

// -------------------
// TAMPILKAN NOMOR ANTRIAN
// -------------------
function showQueueResult(number) {
    document.getElementById('result-number').textContent = number;
    document.getElementById('queue-result').classList.remove('hidden');
    speakText(`Anda mendapatkan nomor antrian ${number}. Silakan menunggu.`);
}

// -------------------
// FUNGSI SUARA
// -------------------
function speakText(text) {
    const speech = new SpeechSynthesisUtterance();
    speech.lang = 'id-ID';
    speech.text = text;
    speech.volume = 1;
    speech.rate = 1.2;
    speech.pitch = 1.1;
    window.speechSynthesis.speak(speech);
}
