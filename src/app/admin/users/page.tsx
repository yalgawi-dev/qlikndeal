import prismadb from "@/lib/prismadb";
import UserRoleSelector from "./UserRoleSelector";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
    // Note: Admin check should ideally go here
    const users = await prismadb.user.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
            <h1 className="text-3xl font-bold">ניהול משתמשים</h1>
            <p className="text-gray-400">צפה בניהם, עדכן הרשאות וסמן משתמשים כספקי שירות או מנהלים.</p>

            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="bg-black/40 text-gray-400 border-b border-white/10">
                            <tr>
                                <th className="p-4 font-medium whitespace-nowrap">משתמש</th>
                                <th className="p-4 font-medium whitespace-nowrap">פרטי קשר</th>
                                <th className="p-4 font-medium whitespace-nowrap">תאריך הרשמה</th>
                                <th className="p-4 font-medium whitespace-nowrap">סוג חשבון</th>
                                <th className="p-4 font-medium whitespace-nowrap">עדכון הרשאות</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {user.imageUrl ? (
                                                <Image
                                                    src={user.imageUrl}
                                                    alt={user.firstName || "User"}
                                                    width={36}
                                                    height={36}
                                                    className="rounded-full bg-white/10 shrink-0 object-cover"
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 flex flex-col justify-center items-center shrink-0 font-bold">
                                                    {(user.firstName?.[0] || user.id[0]).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-semibold text-white">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono" title={user.id}>
                                                    ID: {user.id.substring(0, 8)}...
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-gray-300">{user.email || "—"}</div>
                                        <div className="text-xs text-gray-500">{user.phone || "—"}</div>
                                    </td>
                                    <td className="p-4 text-gray-400 whitespace-nowrap">
                                        {new Date(user.createdAt).toLocaleDateString("he-IL")}
                                    </td>
                                    <td className="p-4">
                                        {user.isGuest ? (
                                            <span className="px-2 py-0.5 rounded-md bg-white/10 text-gray-400 text-xs border border-white/5">
                                                אורח
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/20">
                                                רשום
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {/* Pass `user.roles` but we need to fetch it in Prisma. Prisma model has `roles` which is an array `UserRole[]` */}
                                        <UserRoleSelector userId={user.id} currentRoles={user.roles} />
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center p-10 text-gray-500">
                                        לא נמצאו משתמשים במערכת.
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
