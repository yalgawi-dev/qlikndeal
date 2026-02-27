import { PrismaClient } from '@prisma/client';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DbFixPage() {
    const user = await currentUser();

    // בטיחות: רק המייל שלך יכול לגשת לדף הזה
    if (user?.emailAddresses[0].emailAddress !== 'yalgawi@gmail.com') {
        return <div>Access Denied</div>;
    }

    async function runFix() {
        'use server';
        const prisma = new PrismaClient();
        try {
            // ננסה להוסיף את תומר ישירות דרך הקוד
            // אם הטבלאות לא קיימות, זה ייכשל ונדע שחייבים db push
            const tomerEmail = 'Dpccomp@gmail.com';

            console.log("Checking database connection...");
            const test = await prisma.user.findFirst();
            console.log("Connection OK!");

            const updatedUser = await prisma.user.upsert({
                where: { email: tomerEmail },
                update: { role: 'ADMIN' },
                create: {
                    email: tomerEmail,
                    firstName: 'Tomer',
                    lastName: 'Admin',
                    role: 'ADMIN',
                    clerkId: 'manual_' + Date.now()
                }
            });

            return { success: true, message: "תומר עודכן כאדמין בהצלחה!" };
        } catch (e: any) {
            console.error(e);
            return { success: false, error: e.message };
        } finally {
            await prisma.$disconnect();
        }
    }

    return (
        <div className="p-10 space-y-6" dir="rtl">
            <h1 className="text-2xl font-bold">תיקון מסד נתונים ותוספת אדמין</h1>
            <p>הדף הזה נועד לעקוף חסימות תקשורת מהמחשב המקומי.</p>

            <form action={runFix}>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-lg"
                >
                    בצע עדכון אדמין עכשיו
                </button>
            </form>
        </div>
    );
}
