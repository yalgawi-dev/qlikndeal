// Button Injection Logic
function injectButtonsIntoPosts() {
    // Check if we are on Facebook
    if (!window.location.href.includes('facebook.com')) return;

    // Find all post containers
    // Facebook uses role="article" for posts in feed and groups
    const posts = document.querySelectorAll('div[role="article"]');

    posts.forEach(post => {
        // Avoid duplicate buttons in the same post
        if (post.querySelector('.qlikndeal-post-btn')) return;

        // Create the button
        const btn = document.createElement('button');
        btn.className = 'qlikndeal-post-btn';
        btn.innerText = '✨ ייבא';

        // Style it to sit nicely inside the post
        btn.style.position = 'absolute';
        btn.style.top = '10px';
        btn.style.left = '10px'; // Hebrew interface usually RTL, so left is good visibility
        btn.style.zIndex = '999';
        btn.style.padding = '8px 16px';
        btn.style.backgroundColor = '#8b5cf6';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '20px';
        btn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '14px';
        btn.style.fontFamily = 'system-ui, sans-serif';
        btn.style.fontWeight = 'bold';

        // Ensure post has relative positioning so absolute button stays inside
        if (getComputedStyle(post).position === 'static') {
            post.style.position = 'relative';
        }

        // Click handler: Pass THIS specific post element
        btn.onclick = (e) => {
            e.stopPropagation(); // Prevent clicking the post itself
            extractAndSend(post);
        };

        post.appendChild(btn);
    });
}

// Extraction Logic - Scoped to a specific element
function extractAndSend(rootElement) {
    // 0. Try to expand "See more" within this post
    try {
        const seeMoreButtons = Array.from(rootElement.querySelectorAll('div[role="button"], span[role="button"]'))
            .filter(b => b.innerText.includes('See more') || b.innerText.includes('עוד') || b.innerText.includes('ראה עוד'));

        if (seeMoreButtons.length > 0) {
            seeMoreButtons[0].click();
        }
    } catch (e) { console.log('Auto-expand failed', e); }

    // 1. Title -> Try to find user name or just generic
    const title = "Post from Facebook";

    // 2. Price -> Hard to find reliably in feed, try regex on text
    const priceElement = Array.from(rootElement.querySelectorAll('span')).find(el =>
        (el.innerText.includes('₪') || el.innerText.match(/\d+/)) && el.innerText.length < 20
    );

    // 3. Description -> Main text content
    let description = "";
    const textDivs = Array.from(rootElement.querySelectorAll('div[dir="auto"]'));
    if (textDivs.length > 0) {
        description = textDivs.map(div => div.innerText).join('\n');
    } else {
        description = rootElement.innerText; // Fallback
    }

    // 4. Images - Scoped to post
    const images = Array.from(rootElement.querySelectorAll('img'))
        .filter(img => {
            if (!img.src || !img.src.startsWith('http')) return false;
            // Valid listing images logic
            const isBigEnough = (img.naturalWidth > 200 || img.width > 200);
            const isContent = img.src.includes('scontent') || img.src.includes('fbcdn');
            return isBigEnough && isContent;
        })
        .map(img => img.src);

    // Deduplicate
    const uniqueImages = [...new Set(images)];

    const data = {
        title,
        description,
        price: "0",
        images: uniqueImages,
        url: window.location.href
    };

    chrome.runtime.sendMessage({ action: "open_editor", data: data });
}

// Run injection on load and on scroll/navigation (SPA)
setInterval(injectButtonsIntoPosts, 1000);
