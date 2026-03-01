
export async function getFacebookListing(url: string, userToken?: string) {
    if (!userToken && (!process.env.FB_APP_ID || !process.env.FB_APP_SECRET)) {
        return { success: false, error: "Missing Facebook Keys and User Token" };
    }

    try {
        // 1. Extract Listing ID from URL
        // Formats: 
        // https://www.facebook.com/marketplace/item/1234567890/
        // https://www.facebook.com/share/p/1234567890/
        const match = url.match(/\/item\/(\d+)/) || url.match(/\/p\/(\d+)/) || url.match(/\/(\d{10,})/);

        if (!match) {
            return { success: false, error: "Could not extract Listing ID" };
        }

        const listingId = match[1];

        // 2. Obtain Access Token (App Token)
        // Note: Marketplace APIs often require a User Token, but some public data might be accessible with an App Token.
        // We typically construct an app token as "APP_ID|APP_SECRET"
        const accessToken = userToken || `${process.env.FB_APP_ID}|${process.env.FB_APP_SECRET}`;

        // 3. Call Graph API
        // Endpoint: https://graph.facebook.com/v19.0/{listing-id}
        // Adding more fields: message and name (sometimes descriptions are in these fields)
        const fields = "id,title,description,price,currency,photos{image},condition,message,name";
        const apiUrl = `https://graph.facebook.com/v19.0/${listingId}?fields=${fields}&access_token=${accessToken}`;

        const res = await fetch(apiUrl);
        const data = await res.json();

        if (data.error) {
            console.error("Facebook API Error:", data.error);
            return { success: false, error: data.error.message || "Facebook API Error" };
        }

        // 4. Map Response to our structure
        // Preference: description > message > name
        const finalDescription = data.description || data.message || "";
        const finalTitle = data.title || data.name || "";

        return {
            success: true,
            data: {
                title: finalTitle,
                description: finalDescription,
                price: data.price || "",
                images: data.photos?.data.map((p: any) => p.image.src) || [],
                condition: data.condition || ""
            }
        };

    } catch (error) {
        console.error("Facebook Helper Error:", error);
        return { success: false, error: "Internal Helper Error" };
    }
}
