import prismadb from "@/lib/prismadb";
import ListingDeleteButton from "./ListingDeleteButton";
import AdminListingActions from "./AdminListingActions";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminListingsPage() {
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">ניהול מודעות</h1>
                    <p className="text-gray-400 mt-1">צפה, ערוך או מחק מודעות הקיימות במערכת הלייב.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center">
                    <p className="text-2xl font-bold text-white">{listings.length}</p>
                    <p className="text-xs text-gray-400">מודעות פעילות</p>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-black/40 text-gray-400 border-b border-white/10">
                            <tr>
                                <th className="p-4 font-medium whitespace-nowrap">מוצר</th>
                                <th className="p-4 font-medium whitespace-nowrap">מוכר</th>
                                <th className="p-4 font-medium whitespace-nowrap">מחיר</th>
                                <th className="p-4 font-medium whitespace-nowrap">קטגוריה / מצב</th>
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
                                        <div className="text-xs text-gray-600 mt-0.5 font-mono truncate max-w-[180px]">
                                            #{listing.id.slice(-8)}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-gray-300">
                                            {listing.seller?.firstName} {listing.seller?.lastName}
                                        </div>
                                        <div className="text-xs text-gray-500">{listing.seller?.phone || listing.seller?.email}</div>
                                    </td>
                                    <td className="p-4 font-medium text-emerald-400">₪{listing.price.toLocaleString()}</td>
                                    <td className="p-4">
                                        <div className="text-gray-300">{listing.category || "לא צוין"}</div>
                                        <div className="text-xs text-gray-500">{listing.condition}</div>
                                    </td>
                                    <td className="p-4 text-gray-400 whitespace-nowrap">
                                        {new Date(listing.createdAt).toLocaleDateString("he-IL")}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <AdminListingActions listing={listing} />
                                            <ListingDeleteButton id={listing.id} />
                                        </div>
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
