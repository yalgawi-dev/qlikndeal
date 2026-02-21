"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { getServiceProviderProfile } from "@/app/actions/service-provider";
import { useRouter } from "next/navigation";
import { Loader2, Package, MapPin, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { he } from "date-fns/locale";

// Mock data for now - we will replace this with real data fetching later
const MOCK_REQUESTS = [
    {
        id: "1",
        title: "הובלת ספה וכורסא",
        pickup: "תל אביב",
        dropoff: "רמת גן",
        date: new Date(),
        budget: 400,
        status: "OPEN"
    },
    {
        id: "2",
        title: "אריזת דירת 3 חדרים",
        pickup: "הרצליה",
        dropoff: "הרצליה",
        date: new Date(Date.now() + 86400000), // Tomorrow
        budget: 1200,
        status: "OPEN"
    }
];

export default function ProviderDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const checkProfile = async () => {
            const res = await getServiceProviderProfile();
            if (!res.success) {
                // If not a provider, redirect to registration
                router.push("/provider/register");
            } else {
                setProfile(res.profile);
                setLoading(false);
            }
        };
        checkProfile();
    }, [router]);

    if (loading) {
        return (
            <div className="h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white pb-20">
            <Navbar />

            <div className="container mx-auto px-4 pt-8 space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold">שלום, {profile.displayName} 👋</h1>
                        <p className="text-gray-400 mt-1">אזור אישי לנותני שירות</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-gray-900 px-4 py-2 rounded-xl border border-gray-800 text-center">
                            <span className="block text-2xl font-bold text-green-400">0</span>
                            <span className="text-xs text-gray-400">עבודות פעילות</span>
                        </div>
                        <div className="bg-gray-900 px-4 py-2 rounded-xl border border-gray-800 text-center">
                            <span className="block text-2xl font-bold text-purple-400">₪0</span>
                            <span className="text-xs text-gray-400">הכנסות החודש</span>
                        </div>
                    </div>
                </div>

                {/* Available Jobs */}
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Package className="text-blue-400" />
                        עבודות חדשות באזורך
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {MOCK_REQUESTS.map(req => (
                            <Card key={req.id} className="bg-gray-900/50 border-gray-800 hover:border-purple-500/50 transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-start text-lg">
                                        <span>{req.title}</span>
                                        <span className="text-green-400 text-base">₪{req.budget}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span>{req.pickup} ⬅️ {req.dropoff}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span>{format(req.date, "eeee, d בMMMM", { locale: he })}</span>
                                    </div>

                                    <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                                        הגש הצעה
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

            </div>
        </main>
    );
}
