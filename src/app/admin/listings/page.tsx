import prismadb from "@/lib/prismadb";
import ListingDeleteButton from "./ListingDeleteButton";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default async function AdminListingsPage() {
    // Note: Admin check should ideally go here
    const listings = await prismadb.marketplaceListing.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            seller: {
                select: { firstName: true, lastName: true, email: true, phone: true }
            }
        }
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
            <h1 className="text-3xl font-bold">ניהול מודעות</h1>
            <p className="text-gray-400">צפה, ערוך או מחק מודעות הקיימות במערכת הלייב.</p>

            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-black/40 text-gray-400 border-b border-white/10">
                            <tr>
                                <th className="p-4 font-medium whitespace-nowrap">מוצר</th>
                                <th className="p-4 font-medium whitespace-nowrap">מוכר</th>
                                <th className="p-4 font-medium whitespace-nowrap">מחיר</th>
                                <th className="p-4 font-medium whitespace-nowrap">קטגוריה/מצב</th>
                                <th className="p-4 font-medium whitespace-nowrap">תאריך</th>
                                <th className="p-4 font-medium whitespace-nowrap text-center">פעולות</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {listings.map(listing => (
                                <tr key={listing.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="font-semibold text-white max-w-[200px] truncate" title={listing.title}>
                                            {listing.title}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-gray-300">
                                            {listing.seller?.firstName} {listing.seller?.lastName}
                                        </div>
                                        <div className="text-xs text-gray-500">{listing.seller?.phone || listing.seller?.email}</div>
                                    </td>
                                    <td className="p-4 font-medium text-emerald-400">₪{listing.price}</td>
                                    <td className="p-4">
                                        <div className="text-gray-300">{listing.category || "לא צוין"}</div>
                                        <div className="text-xs text-gray-500">{listing.condition}</div>
                                    </td>
                                    <td className="p-4 text-gray-400 whitespace-nowrap">
                                        {new Date(listing.createdAt).toLocaleDateString("he-IL")}
                                    </td>
                                    <td className="p-4 flex justify-center gap-2">
                                        <ListingDeleteButton id={listing.id} />
                                    </td>
                                </tr>
                            ))}
                            {listings.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center p-10 text-gray-500">
                                        לא נמצאו מודעות במערכת.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
