exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const ADMIN_EMAIL  = 'meirgm10@gmail.com';
  const ADMIN_NAME   = 'Meir — GM';

  let data;
  try { data = JSON.parse(event.body); }
  catch(e) { return { statusCode: 400, body: 'Invalid JSON' }; }

  const { name, email, phone, notes, dateLabel, confirmNum, service, time, price } = data;

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
      throw new Error('Brevo error: ' + err);
    }
    return res.json();
  }

  const customerHtml = '<div dir="rtl" style="font-family:Arial;padding:20px;background:#111;color:#f5f5f0"><h2 style="color:#c9a84c">💈 GM המספרה</h2><p>שלום ' + name + '! התור שלך אושר ✅</p><p>שירות: ' + service + '<br>תאריך: ' + dateLabel + '<br>שעה: ' + time + '<br>מחיר: ₪' + price + '<br>אישור: #' + confirmNum + '</p><p>מחכים לך!</p></div>';

  const adminHtml = '<div dir="rtl" style="font-family:Arial;padding:20px;background:#111;color:#f5f5f0"><h2 style="color:#c9a84c">💈 תור חדש!</h2><p>שם: ' + name + '<br>טלפון: ' + phone + '<br>מייל: ' + email + '<br>שירות: ' + service + '<br>תאריך: ' + dateLabel + '<br>שעה: ' + time + '<br>מחיר: ₪' + price + '</p></div>';

  try {
    await sendEmail(email, name, 'אישור תור GM המספרה #' + confirmNum, customerHtml);
    await sendEmail(ADMIN_EMAIL, ADMIN_NAME, 'תור חדש: ' + name + ' ' + dateLabel + ' ' + time, adminHtml);
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch(e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
