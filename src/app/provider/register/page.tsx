import { Navbar } from "@/components/Navbar";
import { ProviderOnboarding } from "@/components/service/ProviderOnboarding";

export default function ProviderRegisterPage() {
    return (
        <main className="min-h-screen bg-black text-white pb-20">
            <Navbar />

            <div className="container mx-auto px-4 pt-10">
                <ProviderOnboarding />
            </div>
        </main>
    );
}
