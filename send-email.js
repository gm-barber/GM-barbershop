exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const ADMIN_EMAIL  = 'meirgm10@gmail.com';
  const ADMIN_NAME   = 'Meir — GM המספרה';

  let data;
  try { data = JSON.parse(event.body); }
  catch(e) { return { statusCode: 400, body: 'Invalid JSON' }; }

  const { name, email, phone, notes, dateLabel, confirmNum, service, time, price } = data;

  // ── EMAIL TO CUSTOMER ──────────────────────────────────────────
  const customerHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8">
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #0a0a0a; margin: 0; padding: 20px; }
  .wrap { max-width: 480px; margin: 0 auto; background: #111; border: 1px solid #c9a84c; }
  .header { background: #0a0a0a; padding: 32px; text-align: center; border-bottom: 2px solid #c9a84c; }
  .gm { font-size: 64px; font-weight: 900; letter-spacing: 8px; color: #c9a84c; line-height: 1; }
  .sub { font-size: 11px; letter-spacing: 5px; color: #888; margin-top: 4px; }
  .body { padding: 28px 32px; }
  .greeting { font-size: 20px; font-weight: 700; color: #f5f5f0; margin-bottom: 6px; }
  .msg { font-size: 14px; color: #888; margin-bottom: 24px; line-height: 1.6; }
  .card { background: #1a1a1a; border: 1px solid rgba(201,168,76,0.25); padding: 20px; margin-bottom: 20px; }
  .card-title { font-size: 10px; letter-spacing: 4px; color: #c9a84c; margin-bottom: 14px; }
  .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; }
  .row:last-child { border-bottom: none; }
  .row .lbl { color: #888; }
  .row .val { color: #f5f5f0; font-weight: 600; }
  .price-row .val { color: #c9a84c; font-size: 18px; }
  .confirm { font-family: monospace; font-size: 12px; letter-spacing: 3px; color: #c9a84c; text-align: center; padding: 12px; border: 1px dashed rgba(201,168,76,0.3); margin-bottom: 20px; }
  .footer { padding: 20px 32px; text-align: center; border-top: 1px solid #222; font-size: 11px; color: #444; letter-spacing: 1px; }
  .pole { font-size: 28px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="pole">💈</div>
    <div class="gm">GM</div>
    <div class="sub">המספרה</div>
  </div>
  <div class="body">
    <div class="greeting">שלום ${name}! 🎉</div>
    <div class="msg">התור שלך אושר בהצלחה.<br>מחכים לך ב-GM המספרה!</div>
    <div class="confirm">אישור #${confirmNum}</div>
    <div class="card">
      <div class="card-title">פרטי התור</div>
      <div class="row"><span class="lbl">שירות</span><span class="val">${service}</span></div>
      <div class="row"><span class="lbl">תאריך</span><span class="val">${dateLabel}</span></div>
      <div class="row"><span class="lbl">שעה</span><span class="val">${time}</span></div>
      <div class="row"><span class="lbl">טלפון</span><span class="val">${phone}</span></div>
      ${notes ? `<div class="row"><span class="lbl">הערות</span><span class="val">${notes}</span></div>` : ''}
      <div class="row price-row"><span class="lbl">לתשלום במקום</span><span class="val">₪${price}</span></div>
    </div>
    <div class="msg" style="font-size:13px;color:#555">לביטול או שינוי תור — צור קשר ישירות עם המספרה.<br>נשמח לראות אותך! ✂️</div>
  </div>
  <div class="footer">GM המספרה · LOOK SHARP. FEEL SHARP.</div>
</div>
</body>
</html>`;

  // ── EMAIL TO ADMIN ──────────────────────────────────────────────
  const adminHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; background: #0a0a0a; margin: 0; padding: 20px; }
  .wrap { max-width: 440px; margin: 0 auto; background: #111; border: 1px solid #c9a84c; padding: 28px; }
  h2 { color: #c9a84c; font-size: 22px; margin-bottom: 4px; }
  .sub { color: #888; font-size: 12px; letter-spacing: 2px; margin-bottom: 20px; }
  .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1a1a1a; font-size: 14px; }
  .row:last-child { border-bottom: none; }
  .lbl { color: #888; }
  .val { color: #f5f5f0; font-weight: 600; }
  .price { color: #c9a84c; font-size: 20px; font-weight: 700; }
</style>
</head>
<body>
<div class="wrap">
  <h2>💈 תור חדש!</h2>
  <div class="sub">GM המספרה — הזמנה חדשה התקבלה</div>
  <div class="row"><span class="lbl">שם</span><span class="val">${name}</span></div>
  <div class="row"><span class="lbl">טלפון</span><span class="val">${phone}</span></div>
  <div class="row"><span class="lbl">מייל</span><span class="val">${email}</span></div>
  <div class="row"><span class="lbl">שירות</span><span class="val">${service}</span></div>
  <div class="row"><span class="lbl">תאריך</span><span class="val">${dateLabel}</span></div>
  <div class="row"><span class="lbl">שעה</span><span class="val">${time}</span></div>
  ${notes ? `<div class="row"><span class="lbl">הערות</span><span class="val">${notes}</span></div>` : ''}
  <div class="row"><span class="lbl">מחיר</span><span class="price">₪${price}</span></div>
  <div class="row"><span class="lbl">מספר אישור</span><span class="val">#${confirmNum}</span></div>
</div>
</body>
</html>`;

  // ── SEND BOTH EMAILS VIA BREVO ──────────────────────────────────
  async function sendEmail(toEmail, toName, subject, html) {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: 'GM המספרה', email: ADMIN_EMAIL },
        to: [{ email: toEmail, name: toName }],
        subject,
        htmlContent: html
      })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Brevo error: ${err}`);
    }
    return res.json();
  }

  try {
    // Send to customer
    await sendEmail(email, name, `✅ אישור תור ב-GM המספרה — #${confirmNum}`, customerHtml);
    // Send to admin
    await sendEmail(ADMIN_EMAIL, ADMIN_NAME, `💈 תור חדש: ${name} — ${dateLabel} ${time}`, adminHtml);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch(e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
