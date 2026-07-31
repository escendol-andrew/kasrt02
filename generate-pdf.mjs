import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 900 });

// Open the app
await page.goto('file:///root/.openclaw/workspace/rt-finance/index.html', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 1000));

// Login as admin
await page.waitForSelector('#admin-user');
await page.type('#admin-user', 'admin');
await page.type('#admin-pass', 'rt02griya');
await page.click('.btn-login');
await new Promise(r => setTimeout(r, 1500));

// Sync iuran to journal (this creates transaction entries from payment data)
await page.evaluate(() => {
  syncIuranKeJurnal();
});
await new Promise(r => setTimeout(r, 1000));

// Switch to Laporan tab and render
await page.evaluate(() => { showTab('laporan'); });
await new Promise(r => setTimeout(r, 500));

// Set to Tahunan
await page.evaluate(() => {
  const periode = document.getElementById('laporan-periode');
  if (periode) { periode.value = 'tahunan'; renderLaporan(); }
});
await new Promise(r => setTimeout(r, 1000));

// Verify data exists
const check = await page.evaluate(() => {
  const content = document.getElementById('laporan-content');
  const hasData = content && content.innerHTML.length > 200;
  const transaksiCount = DB.transaksi.length;
  return { hasData, transaksiCount, contentLength: content ? content.innerHTML.length : 0 };
});
console.log('Data check:', JSON.stringify(check));

// Get the report HTML
const reportHTML = await page.evaluate(() => {
  const content = document.getElementById('laporan-content');
  return content ? content.innerHTML : '<p>Data tidak tersedia</p>';
});

// Create a clean page for PDF
const pdfPage = await browser.newPage();
await pdfPage.setContent(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 15px; max-width: 800px; margin: 0 auto; color: #1a1a2e; font-size: 11px; }
  h3 { color: #1B5E20; font-size: 13px; margin: 15px 0 8px; border-bottom: 2px solid #1B5E20; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0 15px; font-size: 10.5px; }
  th { background: #1B5E20; color: #fff; padding: 7px 6px; text-align: center; font-size: 10px; }
  td { padding: 6px; border-bottom: 1px solid #eee; text-align: center; }
  tr:nth-child(even) { background: #f9f9f9; }
  .text-left { text-align: left; }
</style>
</head>
<body>
  <div style="text-align:center;border-bottom:3px solid #1B5E20;padding-bottom:12px;margin-bottom:10px">
    <h1 style="color:#1B5E20;font-size:20px;margin-bottom:4px">📊 LAPORAN KEUANGAN</h1>
    <h2 style="color:#1B5E20;font-size:15px;margin:4px 0">RT 02/RW 014 Perumahan Griya Satwika Telkom</h2>
    <p style="text-align:center;color:#666;font-size:11px;margin-bottom:3px">Ciputat Timur, Tangerang Selatan</p>
    <p style="text-align:center;color:#1B5E20;font-size:14px;font-weight:700;margin:10px 0 15px">Tahun 2025</p>
  </div>
  ${reportHTML}
  <div style="margin-top:40px;display:flex;justify-content:space-between;padding:0 20px">
    <div style="text-align:center">
      <p style="margin:0;font-size:10px">Mengetahui,</p>
      <p style="margin:0;font-weight:700;font-size:10px">Ketua RT 02</p>
      <div style="margin-top:50px;border-top:1px solid #333;width:150px;display:inline-block"></div>
    </div>
    <div style="text-align:center">
      <p style="margin:0;font-size:10px">31 Juli 2026</p>
      <p style="margin:0;font-weight:700;font-size:10px">Bendahara RT 02</p>
      <div style="margin-top:50px;border-top:1px solid #333;width:150px;display:inline-block"></div>
      <p style="margin:6px 0 0;font-weight:700;font-size:10px">Andriyana</p>
    </div>
  </div>
  <div style="text-align:center;margin-top:30px;padding-top:10px;border-top:2px solid #1B5E20;color:#666;font-size:9px">
    <p>Bendahara: Andriyana &bull; Sistem Pelaporan Keuangan RT 2026</p>
  </div>
</body>
</html>
`, { waitUntil: 'networkidle2' });

const pdfPath = '/root/.openclaw/workspace/rt-finance/Laporan-Keuangan-RT02-2025.pdf';
await pdfPage.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' }
});

await browser.close();
console.log('✅ PDF generated: ' + pdfPath);
