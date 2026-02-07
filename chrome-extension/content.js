// content.js
console.log("Qlikndeal Content Script Loaded on Facebook");

const AUTO_REPLY_TEXT = "בהצלחה במכירה! 🛡️ רוצים עסקה בטוחה? מומלץ לסגור רק דרך הלינק של Qlikndeal.";

function scanForPosts() {
    // 1. Feed Posts (role="article")
    // 2. Marketplace Item View (role="dialog" or "main")
    const posts = document.querySelectorAll('div[role="article"], div[role="dialog"], div[role="main"]');

    posts.forEach(post => {
        // Filter out irrelevant dialogs
        if (post.dataset.qlikndealProcessed) return;

        // Basic check to see if it's likely a post
        if (post.innerText.length < 50) return;

        post.dataset.qlikndealProcessed = "true";

        // Create the magic button
        const btn = document.createElement("button");
        btn.innerText = "🛡️ הגב בטוח";
        btn.style.cssText = `
            position: absolute;
            top: 60px;
            left: 10px;
            z-index: 9999;
            background-color: #25D366;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 20px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            font-family: sans-serif;
            font-size: 14px;
        `;

        btn.onclick = (e) => {
            e.stopPropagation();

            // --- DATA EXTRACTION ---
            let sellerName = "Unknown";
            let sellerLink = "Unknown";
            let postPermalink = "Unknown";
            let postText = "";

            // 1. Seller Info
            const nameElement = post.querySelector('h2 a, h3 a, strong a, span > a[role="link"]');
            if (nameElement) {
                sellerName = nameElement.innerText;
                sellerLink = nameElement.href;
            }

            // 2. Post Permalink (The timestamp usually holds the link)
            const timestampLink = post.querySelector('a[aria-label*="mins"], a[aria-label*="hrs"], a[aria-label*="Yesterday"], a[href*="/posts/"], span > a[href*="/permalink/"]');
            if (timestampLink) {
                postPermalink = timestampLink.href;
            } else {
                postPermalink = window.location.href; // Fallback if single post view
            }

            // 3. Post Content (Text)
            // Strategy: Look for the main message container. 
            // Often inside div[data-ad-preview="message"] or just a div with dir="auto" that isn't the header.
            const contentDiv = post.querySelector('div[data-ad-preview="message"]');
            if (contentDiv) {
                postText = contentDiv.innerText;
            } else {
                // Fallback: Try to find the largest text block that isn't the user name
                const allTextBlocks = Array.from(post.querySelectorAll('div[dir="auto"]'));
                // Filter out short blocks (like name) or blocks that contain the name
                const likelyMessage = allTextBlocks.find(el => el.innerText.length > 20 && !el.innerText.includes(sellerName));
                if (likelyMessage) {
                    postText = likelyMessage.innerText;
                } else {
                    // Last resort: Clean up the full innerText
                    postText = post.innerText.replace(sellerName, "").trim();
                }
            }

            // 4. Extract Images
            const images = [];
            const imgs = post.querySelectorAll('img');
            imgs.forEach(img => {
                // Filter out small icons like emojis or profile pics (approx < 100px)
                // Also ignore tiny tracking pixels
                if (img.width > 100 && img.height > 100 && img.src.startsWith('http')) {
                    // Avoid duplicate URLs
                    if (!images.includes(img.src)) {
                        images.push(img.src);
                    }
                }
            });

            console.log("CAPTURED:", { sellerName, sellerLink, postPermalink, postText, imagesCount: images.length });

            // --- AUTO REPLY LOGIC ---
            attemptReply(post, sellerName, sellerLink, postText, postPermalink, images);
        };

        try {
            if (getComputedStyle(post).position === 'static') {
                post.style.position = "relative";
            }
            post.appendChild(btn);
        } catch (e) {
            console.error("Failed to append button", e);
        }
    });
}

function attemptReply(post, sellerName, sellerLink, postText, postPermalink, images) {
    let commentBox = post.querySelector('div[role="textbox"][contenteditable="true"]');

    if (!commentBox) {
        // Try to open comment box
        const commentActionBtn = post.querySelector('div[aria-label="Comment"], div[aria-label="הגב"], div[aria-label="Write a comment"]');
        if (commentActionBtn) {
            commentActionBtn.click();
            setTimeout(() => finalReplyStep(post, sellerName, sellerLink, postText, postPermalink, images), 500);
            return;
        }
    }
    finalReplyStep(post, sellerName, sellerLink, postText, postPermalink, images);
}

function finalReplyStep(post, sellerName, sellerLink, postText, postPermalink, images) {
    let commentBox = post.querySelector('div[role="textbox"][contenteditable="true"]');

    if (commentBox) {
        commentBox.focus();
        const success = document.execCommand('insertText', false, AUTO_REPLY_TEXT);

        if (success) {
            // --- SERVER SYNC ---
            // Wait for the save response before alerting!
            saveLeadToDB(sellerName, sellerLink, postText, postPermalink, images).then(result => {
                if (result && result.success) {
                    alert(`✅ נתונים נשמרו!\n\nתיאור: ${postText.slice(0, 30)}...\nתמונות: ${images ? images.length : 0}\nלינק: נשמר`);
                } else {
                    alert(`⚠️ התגובה נכתבה, אבל השמירה בשרת נכשלה.`);
                }
            });
        } else {
            navigator.clipboard.writeText(AUTO_REPLY_TEXT).then(() => {
                saveLeadToDB(sellerName, sellerLink, postText, postPermalink, images);
                alert(`📋 טקסט הועתק ללוח.\n(שמירה בשרת מתבצעת ברקע...)`);
            });
        }
    } else {
        // Marketplace fallback
        saveLeadToDB(sellerName, sellerLink, postText, postPermalink, images).then(result => {
            if (result && result.success) {
                alert(`✅ נתונים נשמרו בשרת!\n(לא מצאתי מקום להגיב ציבורית) - ${images ? images.length : 0} תמונות`);
            } else {
                alert(`❌ השמירה בשרת נכשלה.`);
            }
        });
    }
}

function saveLeadToDB(name, link, text, permalink, images) {
    return fetch('http://localhost:3000/api/shadow-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sellerName: name,
            sellerLink: link || "https://facebook.com",
            postText: (text || "").substring(0, 500),
            sourceUrl: permalink || "",
            images: images || []
        })
    })
        .then(res => res.json())
        .then(data => {
            console.log("DB Save Result:", data);
            return data;
        })
        .catch(err => {
            console.error("DB Save Error:", err);
            return false;
        });
}

setInterval(scanForPosts, 3000);
