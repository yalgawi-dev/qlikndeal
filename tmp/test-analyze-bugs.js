const text = `למכירה: Lenovo IdeaPad Slim – מהיר, מעוצב ושמור ברמה גבוהה! 💻
מחשב מצוין שמתאים בדיוק לסטודנטים, לעבודה משרדית, לניהול עסקים או לגלישה ביתית מהירה. המחשב עבר פירמוט והתקנה מחדש, נקי מתוכנות מיותרות ומוכן לשימוש מיידי.

📋 מפרט טכני מלא:
דגם: Lenovo IdeaPad Series
מעבד: Intel® Core™ i3-1115G4 (דור 11 חזק וחסכוני בסוללה)
זיכרון עבודה: 8GB RAM DDR4 – מאפשר הרצה של מספר לשוניות בדפדפן ותוכנות במקביל ללא איטיות.
אחסון: 128GB NVMe SSD – כונן מהיר במיוחד (מהיר פי 10 מהארד-דיסק רגיל).
כרטיס גרפי: Intel® UHD Graphics
מסך: 15.6 אינץ' Full HD (1920x1080) עם ציפוי Anti-glare למניעת השתקפויות.
קישוריות: Wi-Fi 6, Bluetooth 5.0, מצלמת רשת HD עם סוגר פרטיות פיזי.
חיבורים: 2x USB 3.2, 1x USB-C, HDMI (לחיבור למסך חיצוני), קורא כרטיסי SD ויציאת אוזניות.
מערכת הפעלה: Windows 11 Home – גרסה רשמית ומעודכנת.

🌟 מצב המחשב:
מצב קוסמטי: כמו חדש (נשמר תמיד בתוך נרתיק הגנה).
סוללה: בריאות סוללה מצוינת – מחזיקה כ-6-8 שעות עבודה רציפה.
משקל: קל מאוד (כ-1.6 ק"ג), נוח מאוד לנשיאה בתיק.

💰 מחיר מבוקש: 1200 ₪`;

fetch('http://localhost:3000/api/marketplace/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, category: "LAPTOPS" })
}).then(res => res.json()).then(data => {
    console.log("Condition:", data.result.condition);
    console.log("OS:", data.result.os);
    console.log("Full Result:", JSON.stringify(data.result, null, 2));
}).catch(console.error);
