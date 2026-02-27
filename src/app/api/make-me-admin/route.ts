import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import prismadb from '@/lib/prismadb';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Not logged in to Clerk" }, { status: 401 });
        }

        const dbUser = await prismadb.user.findUnique({
            where: { clerkId: user.id }
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User not found in DB" }, { status: 404 });
        }

        if (!dbUser.roles.includes('ADMIN')) {
            const updatedUser = await prismadb.user.update({
                where: { id: dbUser.id },
                data: {
                    roles: {
                        set: [...dbUser.roles, 'ADMIN']
                    }
                }
            });
            return NextResponse.json({ success: true, message: "ADMIN role added!", roles: updatedUser.roles });
        }

        return NextResponse.json({ success: true, message: "User is already an ADMIN!", roles: dbUser.roles });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
