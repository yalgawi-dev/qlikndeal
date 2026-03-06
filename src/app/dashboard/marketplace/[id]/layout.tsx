import { Metadata } from "next";
import prismadb from "@/lib/prismadb";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    try {
        const listing = await prismadb.marketplaceListing.findUnique({
            where: { id: params.id },
        });

        if (!listing) {
            return {
                title: "Qlikndeal - מודעה לא נמצאה",
                description: "המודעה שחיפשת אינה זמינה יותר במערכת."
            };
        }

        const getCategoryFallback = (category?: string | null) => {
            switch (category) {
                case "Mobile": return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop";
                case "Computers": return "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop";
                case "Vehicles": return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop";
                default: return "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?q=80&w=800&auto=format&fit=crop"; // General marketplace fallback
            }
        };

        let mainImageUrl = getCategoryFallback(listing.category); // Fallback image if any
        try {
            const images = JSON.parse(listing.images);
            if (images && images.length > 0 && images[0] !== "") {
                mainImageUrl = images[0];
            }
        } catch (e) {
            // parsing failed
        }

        const formattedPrice = `₪${listing.price.toLocaleString("he-IL")}`;
        const shortDescription = listing.description?.substring(0, 150) + "..." || `קנה בטוח עכשיו את ${listing.title} באתר Qlikndeal`;

        return {
            title: `${listing.title} במחיר ${formattedPrice} | Qlikndeal`,
            description: shortDescription,
            openGraph: {
                title: `${listing.title} במחיר ${formattedPrice}`,
                description: shortDescription,
                url: `https://qlikndeal.vercel.app/dashboard/marketplace/${params.id}`,
                siteName: "Qlikndeal",
                images: [
                    {
                        url: mainImageUrl,
                        width: 800,
                        height: 600,
                        alt: listing.title,
                    },
                ],
                locale: "he_IL",
                type: "article",
            },
            twitter: {
                card: "summary_large_image",
                title: `${listing.title} במחיר ${formattedPrice}`,
                description: shortDescription,
                images: [mainImageUrl],
            },
        };
    } catch (e) {
        return {
            title: "Qlikndeal Marketplace",
        };
    }
}

export default function ListingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
