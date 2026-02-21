chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "open_editor") {
        const data = request.data;

        // Construct URL with query parameters
        const params = new URLSearchParams();
        if (data.title) params.append("title", data.title);
        if (data.description) params.append("text", data.description); // Map description to 'text' for magic parser
        if (data.url) params.append("url", data.url);

        // Pass images as a JSON string if possible, or we might need another way for large lists.
        // URL length limit is ~2000 chars. 
        // For MVP, passing images via URL might be tricky if there are many long URLs.
        // Option A: Pass only the first image via URL.
        // Option B: Save to local storage and read from app? (Cross-domain issue)
        // Option C: Copy to clipboard?

        // Solution for MVP: Pass the first 5 images.
        if (data.images && data.images.length > 0) {
            params.append("images", JSON.stringify(data.images.slice(0, 5)));
        }

        const dashboardUrl = `http://localhost:3000/dashboard/marketplace/create?${params.toString()}`;

        chrome.tabs.create({ url: dashboardUrl });
    }
});
