import prismadb from "@/lib/prismadb";
import LearningClient from "./LearningClient";

export const dynamic = 'force-dynamic';

export default async function AdminLearningAgentPage() {
    const mappings = await prismadb.capabilityMapping.findMany({
        orderBy: { keyword: "asc" }
    });
    
    const logs = await prismadb.searchLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
            <h1 className="text-3xl font-bold">המוח הלומד - Knowledge Base</h1>
            <p className="text-gray-400">נהל את מאגר הידע של מנוע ההמלצות וסקור חיפושים שטרם מופו במערכת.</p>

            <LearningClient initialMappings={mappings} initialLogs={logs} />
        </div>
    );
}
