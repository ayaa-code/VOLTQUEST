# Deployment GitHub dan Vercel

Repository: [ayaa-code/VOLTQUEST](https://github.com/ayaa-code/VOLTQUEST).

## Deployment production

Deployment melalui CLI Vercel selesai pada 23 Oktober 2026 dengan status **READY**. URL production: **https://voltquest.vercel.app**. Project berada pada `aliyaas-projects-6360b9bd/voltquest`; [dashboard deployment](https://vercel.com/aliyaas-projects-6360b9bd/voltquest/5M486YqBXtxFtmw6iN7pVQ6EageM).

Build cloud menjalankan `npm ci`, TypeScript, dan Vite dengan sukses. Verifikasi HTTP dari jaringan agen mengalami timeout sehingga pengujian interaksi langsung pada domain production belum terkonfirmasi. Deployment dilakukan dari source lokal melalui CLI. Status deployment ini tidak membuktikan bahwa push GitHub atau sambungan deploy otomatis telah selesai; keduanya diperiksa terpisah.

Sambungan Git otomatis dicoba melalui `vercel git connect https://github.com/ayaa-code/VOLTQUEST.git --yes`, tetapi Vercel menolak akses integrasinya ke repository. Karena itu deployment berikutnya dapat dilakukan lewat `npx.cmd vercel --prod` dari folder yang sudah ditautkan. Untuk mengaktifkan deploy otomatis, buka Settings → Git pada project Vercel, lalu hubungkan akun/integrasi GitHub yang memiliki akses ke `ayaa-code/VOLTQUEST`.

VoltQuest adalah aplikasi React/Vite statis. Konfigurasi `vercel.json` menetapkan framework Vite, instalasi `npm ci`, build `npm run build`, output `dist`, dan fallback SPA ke `index.html`. Node.js 24 ditetapkan melalui `.nvmrc` serta `package.json`. Tidak memerlukan environment variable, database, atau server backend.

Untuk menghubungkan repository pada akun Vercel:

1. Buka [Import VoltQuest ke Vercel](https://vercel.com/new/import?s=https%3A%2F%2Fgithub.com%2Fayaa-code%2FVOLTQUEST).
2. Pilih akun/team tujuan dan repository tersebut. Root Directory tetap `./`.
3. Gunakan framework **Vite**, Build Command **npm run build**, Output Directory **dist**. Konfigurasi proyek sudah menyediakannya.
4. Deploy, lalu gunakan URL yang dikembalikan Vercel. Sambungan Git Vercel dapat membuat deployment baru setiap push ke `main`.

Alternatif setelah login Vercel CLI:

```powershell
npx.cmd vercel login
npx.cmd vercel --prod
```

Jangan menaruh token di repository. `.gitignore` mengecualikan `.env*`, `.vercel`, `tmp`, hasil build, dan cache. `.vercelignore` juga mengecualikan bukti pengujian/video dari unggahan deployment. Bukti tersebut tetap dapat disimpan di GitHub bersama dokumentasi.

Progres dan draf berada di localStorage browser masing-masing. Data pada `localhost` tidak otomatis berpindah ke domain Vercel, dan nama yang sama pada perangkat lain tidak menyinkronkan progres. Laboratorium PhET tetap membuka layanan eksternal. Kode kelas masih merupakan fitur demo.

GitHub Actions menjalankan instalasi bersih, lint, dan build setiap push ke `main` atau pull request. Pengujian browser lokal dapat dijalankan dengan instruksi README.

Dokumentasi konfigurasi: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite).
