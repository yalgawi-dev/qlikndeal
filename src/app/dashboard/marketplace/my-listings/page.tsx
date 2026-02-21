"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { ListingForm } from "@/components/marketplace/ListingForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getMyListings, updateListing, deleteListing } from "@/app/actions/marketplace";
import { Loader2, Plus, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function MyListingsPage() {
    const { user } = useUser();
    const router = useRouter();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingListing, setEditingListing] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const fetchMyListings = async () => {
        setLoading(true);
        const res = await getMyListings();
        if (res.success) {
            setListings(res.listings || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMyListings();
    }, []);

    const handleEdit = (listing: any) => {
        // Prepare initial data for form
        const initialData = {
            ...listing,
            price: listing.price.toString(),
            images: JSON.parse(listing.images || "[]"),
            videos: JSON.parse(listing.videos || "[]"),
            extraData: JSON.parse(listing.extraData || "{}")
        };
        setEditingListing(initialData);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("האם אתה בטוח שברצונך למחוק את המודעה? פעולה זו אינה הפיכה.")) return;

        setIsDeleting(id);
        const res = await deleteListing(id);
        if (res.success) {
            setListings(prev => prev.filter(l => l.id !== id));
        } else {
            alert("שגיאה במחיקת המודעה");
        }
        setIsDeleting(null);
    };

    const handleUpdate = async (formData: any) => {
        // Logic handled inside ListingForm? No, ListingForm calls createListing directly usually.
        // We need to modify ListingForm or pass a custom handler?
        // Actually ListingForm currently calls createListing internally. 
        // We should probably refactor ListingForm to accept an onSubmit handler or handle update internally if ID exists.
        // For now, let's wrap the form submission or pass a custom onComplete that reloads.

        // Wait, ListingForm is tightly coupled to createListing in the code I saw.
        // I need to update ListingForm to support "Update" mode.
        // But first let's just close the modal and refresh.
        setEditingListing(null);
        fetchMyListings();
    };

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => router.back()} className="text-gray-400">
                            <ArrowRight className="w-5 h-5 ml-2" /> חזור
                        </Button>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            המודעות שלי
                        </h1>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
                        <h3 className="text-xl font-bold mb-2">אין לך מודעות פעילות עדיין</h3>
                        <p className="text-gray-400 mb-6">זה הזמן להתחיל למכור!</p>
                        <Button
                            onClick={() => router.push("/dashboard/marketplace")}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            פרסם מודעה חדשה
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map(listing => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                isOwner={true}
                                onDelete={() => handleDelete(listing.id)}
                                onEdit={() => handleEdit(listing)}
                                isDeleting={isDeleting === listing.id}
                            />
                        ))}
                    </div>
                )}

                {/* Edit Dialog */}
                <Dialog open={!!editingListing} onOpenChange={(open) => !open && setEditingListing(null)}>
                    <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>עריכת מודעה</DialogTitle>
                        </DialogHeader>
                        {editingListing && (
                            <ListingForm
                                initialData={editingListing}
                                onComplete={() => {
                                    setEditingListing(null);
                                    fetchMyListings();
                                }}
                                onCancel={() => setEditingListing(null)}
                                isEditing={true}
                                listingId={editingListing.id}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
