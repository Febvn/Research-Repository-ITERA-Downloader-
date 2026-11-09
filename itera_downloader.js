/**
 * ITERA Repository Batch Flipbook to PDF Downloader
 * Created By Febvn
 * 
 * Skrip otomasi peramban untuk mengunduh seluruh berkas PDF bab tugas akhir/skripsi
 * dari repositori institusi ITERA secara berurutan.
 */

(async () => {
    console.log("----------------------------------------------------------");
    console.log("ITERA Batch PDF Downloader - Created By Febvn");
    console.log("----------------------------------------------------------");

    const forms = Array.from(document.querySelectorAll('form[action*="flipbook"]'));
    if (!forms.length) {
        return alert("Error: Form dokumen bab tidak ditemukan. Pastikan Anda berada di halaman repositori ITERA yang menampilkan daftar berkas.");
    }

    console.log(`[INFO] Terdeteksi ${forms.length} berkas bab. Memulai proses unduhan...`);

    for (let i = 0; i < forms.length; i++) {
        const form = forms[i];
        const title = form.querySelector('input[type="submit"]')?.value || `Dokumen_${i + 1}`;
        const fileName = form.querySelector('input[name="nama_file"]')?.value || '';

        console.log(`\n[${i + 1}/${forms.length}] Memuat: ${title} (${fileName})...`);

        const winName = `itera_worker_${i}`;
        const worker = window.open('about:blank', winName);
        if (!worker) {
            alert("Pop-up diblokir peramban. Harap izinkan pop-up (Always Allow) di bilah alamat, lalu jalankan kembali skrip.");
            return;
        }

        form.target = winName;
        form.submit();

        let downloaded = false;
        const maxAttempts = 35; // 35 x 800ms = 28 detik maksimal tunggu per bab

        for (let wait = 0; wait < maxAttempts; wait++) {
            await new Promise(resolve => setTimeout(resolve, 800));
            try {
                const app = worker.PDFViewerApplication;
                if (app && app.pdfDocument && typeof app.download === 'function') {
                    console.log(`[INFO] Berkas ${title} berhasil dimuat ke memori. Mengunduh...`);
                    app.download();
                    console.log(`[SUKSES] ${title} berhasil diunduh.`);
                    downloaded = true;
                    break;
                }
            } catch (err) {
                // Menunggu halaman transisi dan selesai memuat dokumen
            }
        }

        if (!downloaded) {
            console.warn(`[TIMEOUT] Gagal memuat berkas untuk ${title}. Melanjutkan ke bab berikutnya.`);
        }

        // Jeda waktu agar unduhan selesai didaftarkan oleh peramban sebelum tab ditutup
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
            worker.close();
        } catch (e) {
            // Tab sudah tertutup
        }

        // Jeda stabilitas jaringan sebelum memproses bab berikutnya
        console.log("[INFO] Menunggu 2 detik sebelum memproses bab berikutnya...");
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log("\n----------------------------------------------------------");
    console.log("Proses Selesai: Seluruh berkas bab telah diunduh.");
    console.log("Created By Febvn");
    console.log("----------------------------------------------------------");
    alert("Selesai! Seluruh berkas bab telah otomatis diunduh ke folder Downloads Anda.");
})();
