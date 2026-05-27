const fetch = require('node-fetch');

async function test() {
    try {
        console.log("Sending request to http://localhost:3001/api/marketplace/smart-search...");
        const res = await fetch('http://localhost:3001/api/marketplace/smart-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: '', lat: null, lng: null, category: null, listingType: 'SELL' })
        });
        console.log("Response status:", res.status);
        const data = await res.json();
        console.log("Response data success:", data.success);
        console.log("Results count:", data.results ? data.results.length : null);
    } catch(e) {
        console.error("Fetch failed:", e);
    }
}

test();
