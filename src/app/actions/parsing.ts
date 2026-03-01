"use server";

import prismadb from "@/lib/prismadb";
import { parseDealText } from "@/lib/parsing/dealParser";
import { getFacebookListing } from "@/lib/facebook-api";
import { auth, clerkClient } from "@clerk/nextjs/server";

export interface LinkParseResult {
    success: boolean;
    data?: {
        itemName?: string;
        description?: string;
        price?: number;
        images?: string[];
        condition?: string;
        source?: "database" | "opengraph" | "failed";
    };
    error?: string;
}

export async function parseLinkAction(url: string): Promise<LinkParseResult> {
    if (!url) return { success: false, error: "No URL provided" };

    try {
        // 1. Check if we already have this link in our ShadowLead database (from Chrome Extension)
        const existingLead = await prismadb.shadowLead.findFirst({
            where: {
                OR: [
                    { sourceUrl: url },
                    { sourceUrl: { contains: url.split('?')[0] } } // Match base URL
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        if (existingLead) {
            const parsedText = parseDealText(existingLead.postText || "");
            let images: string[] = [];
            try {
                images = existingLead.images ? JSON.parse(existingLead.images) : [];
            } catch (e) { }

            return {
                success: true,
                data: {
                    itemName: parsedText.itemName,
                    description: existingLead.postText || "",
                    price: parsedText.price,
                    condition: parsedText.condition,
                    images: images,
                    source: "database"
                }
            };
        }

        // 2. Try Facebook Graph API (If keys exist OR User is logged in via FB)
        if (url.includes("facebook.com")) {
            let userToken: string | undefined = undefined;

            // Try to get User's Facebook Token from Clerk
            try {
                const { userId } = await auth();
                if (userId) {
                    console.log(`[DEBUG] Parsing: Clerk User ID: ${userId}`);
                    const client = await clerkClient();
                    const tokens = await client.users.getUserOauthAccessToken(userId, "oauth_facebook");
                    console.log(`[DEBUG] Parsing: Facebook Tokens found: ${tokens.data.length}`);

                    if (tokens.data.length > 0) {
                        userToken = tokens.data[0].token;
                        console.log(`[DEBUG] Parsing: Found User Facebook Token! (Length: ${userToken.length})`);
                        // Scope check would be good here if Clerk returns it
                        console.log(`[DEBUG] Parsing: Token scopes: ${tokens.data[0].scopes || 'unknown'}`);
                    }
                } else {
                    console.log("[DEBUG] Parsing: No User ID found in auth()");
                }
            } catch (e) {
                console.log("[DEBUG] Parsing: Could not retrieve user FB token:", e);
            }

            if (userToken || (process.env.FB_APP_ID && process.env.FB_APP_SECRET)) {
                console.log(`[DEBUG] Parsing: Attempting Facebook API fetch with token type: ${userToken ? "User Token" : "App Token"}`);
                const fbResult = await getFacebookListing(url, userToken);

                console.log(`[DEBUG] Parsing: Facebook API Result Success: ${fbResult.success}`);
                if (!fbResult.success) {
                    console.log(`[DEBUG] Parsing: Facebook API Error: ${fbResult.error}`);
                }

                if (fbResult.success && fbResult.data) {
                    const combinedText = `${fbResult.data.title}\n${fbResult.data.description}`;
                    const parsedText = parseDealText(combinedText);

                    return {
                        success: true,
                        data: {
                            itemName: fbResult.data.title,
                            description: fbResult.data.description,
                            price: parsedText.price || (fbResult.data.price ? parseFloat(fbResult.data.price) : undefined),
                            condition: fbResult.data.condition || parsedText.condition,
                            images: fbResult.data.images || [],
                            source: "opengraph"
                        }
                    };
                } else {
                    console.log("Facebook API failed, falling back to basic scrape:", fbResult.error);
                }
            }
        }

        // 3. Fallback: OpenGraph tags (Basic scraping)
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error("Failed to fetch");

            const html = await response.text();

            // Improved Regex for OG tags (handles quotes inside content better)
            const titleMatch = html.match(/<meta\s+(?:property="og:title"|name="twitter:title")\s+content="([^"]+)"/i);
            const descMatch = html.match(/<meta\s+(?:property="og:description"|name="twitter:description")\s+content="([^"]+)"/i);
            const imageMatch = html.match(/<meta\s+(?:property="og:image"|name="twitter:image")\s+content="([^"]+)"/i);

            let title = titleMatch ? titleMatch[1] : "";
            let description = descMatch ? descMatch[1] : "";
            const image = imageMatch ? imageMatch[1] : null;

            // --- DEEP SCRAPE FALLBACK ---
            // If the description is truncated (ends with ...) or too short, look for the full message in JSON blobs
            if (description.endsWith("...") || description.length < 200) {
                const jsonMatch = html.match(/"message":\{"text":"(.*?)"\}/);
                if (jsonMatch && jsonMatch[1]) {
                    // Unescape unicode characters if present
                    const fullText = jsonMatch[1].replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) => 
                        String.fromCharCode(parseInt(grp, 16))
                    ).replace(/\\n/g, '\n').replace(/\\"/g, '"');
                    
                    if (fullText.length > description.length) {
                        description = fullText;
                    }
                }
            }

            if (title || description) {
                const combinedText = `${title}\n${description}`;
                const parsedText = parseDealText(combinedText);

                return {
                    success: true,
                    data: {
                        itemName: parsedText.itemName || title,
                        description: description,
                        price: parsedText.price,
                        condition: parsedText.condition,
                        images: image ? [image] : [],
                        source: "opengraph"
                    }
                };
            }

        } catch (fetchError) {
            console.log("OpenGraph fetch failed:", fetchError);
        }

        // 4. Ultimate Fallback
        return {
            success: false,
            error: "Could not extract data. If this is a Facebook post, please use the Qlikndeal Chrome Extension button on the post itself."
        };

    } catch (error) {
        console.error("Parse Link Error:", error);
        return { success: false, error: "Internal Error" };
    }
}
