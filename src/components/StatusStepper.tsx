import { Check, Clock, Package, Truck } from "lucide-react";

interface StatusStepperProps {
    currentStep: 'understanding' | 'negotiation' | 'agreement' | 'payment' | 'shipping';
    isCancelled?: boolean;
    buyerLastSeen?: string; // ISO Date String
    sellerLastSeen?: string; // ISO Date String
    viewerRole?: 'buyer' | 'seller';
}

export function StatusStepper({ currentStep, isCancelled = false, buyerLastSeen, sellerLastSeen, viewerRole = 'buyer' }: StatusStepperProps) {
    // Redesigned steps flow based on user request
    const steps = [
        { id: 'negotiation', label: 'משא ומתן' },
        { id: 'agreement', label: 'סגירת מחיר וחתימה' },
        { id: 'payment', label: 'תשלום מאובטח' },
        { id: 'shipping', label: 'קבלת מוצר' },
    ];

    const getStepStatus = (stepId: string) => {
        if (isCancelled) return 'cancelled';
        // "understanding" falls under "negotiation" for simplicity in UI, but we treat it as 1
        const mapCurrent = currentStep === 'understanding' ? 'negotiation' : currentStep;
        
        const stepOrder = ['negotiation', 'agreement', 'payment', 'shipping'];
        let effectiveCurrentStep = mapCurrent;
        if (!stepOrder.includes(mapCurrent)) {
            effectiveCurrentStep = 'negotiation'; // Fallback
        }

        const currentIndex = stepOrder.indexOf(effectiveCurrentStep as any);
        const stepIndex = stepOrder.indexOf(stepId);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'active';
        return 'pending';
    };

    // Helper to check if online (within last 15 seconds)
    const isOnline = (lastSeen?: string) => {
        if (!lastSeen) return false;
        const diff = new Date().getTime() - new Date(lastSeen).getTime();
        return diff < 15000; // 15 seconds
    };

    const buyerOnline = isOnline(buyerLastSeen);
    const sellerOnline = isOnline(sellerLastSeen);

    // Map currentStep for the progress bar (if it's understanding, it's 0)
    const activeIndex = steps.findIndex(s => s.id === (currentStep === 'understanding' ? 'negotiation' : currentStep));

    return (
        <div className="w-full py-4 px-2">
            <div className="relative flex items-center justify-between">
                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-200 dark:bg-gray-800 -z-10 rounded-full"></div>
                <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-l from-primary to-blue-500 -z-10 rounded-full transition-all duration-700 ease-out"
                    style={{
                        width: `${(activeIndex / (steps.length - 1)) * 100}%`
                    }}
                ></div>

                {steps.map((step, index) => {
                    const status = getStepStatus(step.id);
                    const isActive = status === 'active';
                    const isCompleted = status === 'completed';

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 relative bg-transparent px-2 z-10 w-20">
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-md relative z-20
                                ${isCompleted ? 'bg-primary border-primary text-white scale-100 shadow-primary/20' : ''}
                                ${isActive ? 'bg-slate-900 border-primary text-primary scale-110 shadow-lg shadow-primary/40' : ''}
                                ${status === 'pending' ? 'bg-slate-800 border-slate-700 text-slate-400' : ''}
                                ${isCancelled ? 'bg-red-950 border-red-800 text-red-500' : ''}
                            `}>
                                {isCompleted ? <Check className="w-6 h-6 stroke-[3]" /> : <span className="font-bold text-sm tracking-tighter">{index + 1}</span>}
                            </div>
                            <span className={`text-[11px] font-bold transition-colors duration-300 text-center leading-tight ${isActive ? 'text-primary' : (isCompleted ? 'text-gray-300' : 'text-gray-500')}`}>
                                {step.label}
                            </span>

                            {/* Active Pulse Effect */}
                            {isActive && (
                                <span className="absolute top-12 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full animate-bounce z-20" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Online Status Indicators */}
            <div className="flex justify-between items-center mt-6 px-2 text-[10px] text-gray-500 font-medium z-10 relative">
                <div className="flex items-center gap-1.5">
                    <span className={`relative w-2 h-2 rounded-full ${viewerRole === 'buyer' && buyerOnline || viewerRole === 'seller' && sellerOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
                    <span className={viewerRole === 'buyer' && buyerOnline || viewerRole === 'seller' && sellerOnline ? 'text-green-500 font-bold' : ''}>
                        {viewerRole === 'buyer' ? (buyerOnline ? 'קונה מחובר (את/ה)' : 'קונה לא מחובר') : (sellerOnline ? 'מוכר מחובר (את/ה)' : 'מוכר לא מחובר')}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className={viewerRole === 'buyer' && sellerOnline || viewerRole === 'seller' && buyerOnline ? 'text-green-500 font-bold' : ''}>
                        {viewerRole === 'buyer' ? (sellerOnline ? 'מוכר מחובר' : 'מוכר לא מחובר') : (buyerOnline ? 'קונה מחובר' : 'קונה לא מחובר')}
                    </span>
                    <span className={`relative w-2 h-2 rounded-full ${viewerRole === 'buyer' && sellerOnline || viewerRole === 'seller' && buyerOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
                </div>
            </div>
        </div>
    );
}
