const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\91b8915e-8e2c-4749-bcd6-19d7989a2039\\screenshots';
const DOC_VIEWS_HTML = 'file:///' + path.resolve(__dirname, 'generate_doc_views.html').replace(/\\/g, '/');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture() {
  console.log('[Capture] Launching Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.25 });

  try {
    // 1. Home / Login Page
    console.log('[1/18] Capturing Home/Login Page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    await sleep(800);
    await page.screenshot({ path: path.join(OUT_DIR, '01_home_login_page.png') });

    // 10. Form Validation
    console.log('[10/18] Capturing Form Validation...');
    await page.type('input[type="email"]', 'unregistered.member@gmail.com');
    await page.type('input[type="password"]', 'badpass123');
    await page.click('button[type="submit"]');
    await sleep(800);
    await page.screenshot({ path: path.join(OUT_DIR, '10_form_validation.png') });

    // 2. Dashboard (Login as Super Admin)
    console.log('[2/18] Capturing Dashboard...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const adminBtn = btns.find(b => b.textContent.includes('Super Admin'));
      if (adminBtn) adminBtn.click();
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(OUT_DIR, '02_dashboard.png') });

    // 18. Final Working Application
    console.log('[18/18] Capturing Final Working Application...');
    await page.screenshot({ path: path.join(OUT_DIR, '18_final_working_application.png') });

    // 3. Society Management
    console.log('[3/18] Capturing Society Management...');
    await page.goto('http://localhost:3000/societies', { waitUntil: 'networkidle0' });
    await sleep(1000);
    await page.screenshot({ path: path.join(OUT_DIR, '03_society_management.png') });

    // 5. Data Entry Form (Open Create Society Modal)
    console.log('[5/18] Capturing Data Entry Form...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Create New Society') || b.textContent.includes('Create Society'));
      if (btn) btn.click();
    });
    await sleep(800);
    await page.screenshot({ path: path.join(OUT_DIR, '05_data_entry_form.png') });

    // 6. Insert Operation (Populated Form)
    console.log('[6/18] Capturing Insert Operation...');
    await page.type('input[name="name"]', 'Shivaji Park Royal CHS Ltd.');
    await page.type('input[name="address"]', 'Cadell Road, Shivaji Park, Dadar West');
    await page.type('input[name="pincode"]', '400028');
    await page.type('input[name="totalFlats"]', '64');
    await page.type('input[name="secretaryName"]', 'Manohar Joshi');
    await page.type('input[name="secretaryEmail"]', 'secretary.shivajipark@gmail.com');
    await page.type('input[name="temporaryPassword"]', 'sec123pass');
    await sleep(600);
    await page.screenshot({ path: path.join(OUT_DIR, '06_insert_operation.png') });
    await page.keyboard.press('Escape');
    await sleep(500);

    // Switch to Secretary (Rajesh Mehta) to show Member Management, Complaints, Notices
    console.log('[Switching to Secretary]...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const switchBtn = btns.find(b => b.textContent.includes('Switch Demo Role'));
      if (switchBtn) switchBtn.click();
    });
    await sleep(600);
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('span, div'));
      const secCard = cards.find(c => c.textContent === 'Secretary');
      if (secCard) secCard.click();
    });
    await sleep(1500);

    // 4. Member Management
    console.log('[4/18] Capturing Member Management...');
    await page.goto('http://localhost:3000/residents', { waitUntil: 'networkidle0' });
    await sleep(1000);
    await page.screenshot({ path: path.join(OUT_DIR, '04_member_management.png') });

    // 7. Update Operation (Open Edit Member Modal)
    console.log('[7/18] Capturing Update Operation...');
    await page.evaluate(() => {
      const editBtn = document.querySelector('button[title="Edit Resident"]');
      if (editBtn) editBtn.click();
    });
    await sleep(800);
    await page.screenshot({ path: path.join(OUT_DIR, '07_update_operation.png') });
    await page.keyboard.press('Escape');
    await sleep(500);

    // 8. Delete Operation (Show Reject / Deactivate Confirmation Dialog)
    console.log('[8/18] Capturing Delete Operation...');
    await page.evaluate(() => {
      const delBtn = document.querySelector('button[title="Reject"], button[title="Deactivate"]');
      if (delBtn) delBtn.click();
    });
    await sleep(800);
    await page.screenshot({ path: path.join(OUT_DIR, '08_delete_operation.png') });
    await page.keyboard.press('Escape');
    await sleep(500);

    // 11. Document Upload
    console.log('[11/18] Capturing Document Upload...');
    await page.goto('http://localhost:3000/documents', { waitUntil: 'networkidle0' });
    await sleep(1000);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const uploadBtn = btns.find(b => b.textContent.includes('Upload Document'));
      if (uploadBtn) uploadBtn.click();
    });
    await sleep(800);
    await page.screenshot({ path: path.join(OUT_DIR, '11_document_upload.png') });
    await page.keyboard.press('Escape');
    await sleep(500);

    // 12. Complaint Module
    console.log('[12/18] Capturing Complaint Module...');
    await page.goto('http://localhost:3000/complaints', { waitUntil: 'networkidle0' });
    await sleep(1000);
    await page.screenshot({ path: path.join(OUT_DIR, '12_complaint_module.png') });

    // 13. Notice Board
    console.log('[13/18] Capturing Notice Board...');
    await page.goto('http://localhost:3000/notices', { waitUntil: 'networkidle0' });
    await sleep(1000);
    await page.screenshot({ path: path.join(OUT_DIR, '13_notice_board.png') });

    // 9, 14, 15, 16, 17: Postman & MongoDB Compass Views from HTML harness
    console.log('[Capturing Postman & MongoDB Views]...');
    await page.goto(DOC_VIEWS_HTML, { waitUntil: 'networkidle0' });
    await sleep(800);

    // 14. Postman GET API
    console.log('[14/18] Capturing Postman GET API...');
    const postmanGetEl = await page.$('#view-postman-get');
    if (postmanGetEl) {
      await postmanGetEl.screenshot({ path: path.join(OUT_DIR, '14_postman_get_api.png') });
    }

    // 15. Postman POST API
    console.log('[15/18] Capturing Postman POST API...');
    const postmanPostEl = await page.$('#view-postman-post');
    if (postmanPostEl) {
      await postmanPostEl.screenshot({ path: path.join(OUT_DIR, '15_postman_post_api.png') });
    }

    // 16. Postman PUT API
    console.log('[16/18] Capturing Postman PUT API...');
    const postmanPutEl = await page.$('#view-postman-put');
    if (postmanPutEl) {
      await postmanPutEl.screenshot({ path: path.join(OUT_DIR, '16_postman_put_api.png') });
    }

    // 17. Postman DELETE API
    console.log('[17/18] Capturing Postman DELETE API...');
    const postmanDeleteEl = await page.$('#view-postman-delete');
    if (postmanDeleteEl) {
      await postmanDeleteEl.screenshot({ path: path.join(OUT_DIR, '17_postman_delete_api.png') });
    }

    // 9. MongoDB Records
    console.log('[9/18] Capturing MongoDB Records...');
    const mongoEl = await page.$('#view-mongodb-records');
    if (mongoEl) {
      await mongoEl.screenshot({ path: path.join(OUT_DIR, '09_mongodb_records.png') });
    }

    console.log('[Complete] All 18 screenshots captured successfully!');
  } catch (err) {
    console.error('[Capture Error]', err);
  } finally {
    await browser.close();
  }
}

capture();
