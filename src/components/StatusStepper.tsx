import { Check, Clock, Package, Truck } from "lucide-react";

interface StatusStepperProps {
    currentStep: 'negotiation' | 'payment' | 'shipping' | 'delivery';
    isCancelled?: boolean;
    buyerLastSeen?: string; // ISO Date String
    sellerLastSeen?: string; // ISO Date String
}

export function StatusStepper({ currentStep, isCancelled = false, buyerLastSeen, sellerLastSeen }: StatusStepperProps) {
    // ... existing steps definition ...
    const steps = [
        { id: 'negotiation', label: 'משא ומתן', icon: <Clock className="w-4 h-4" /> },
        { id: 'payment', label: 'תשלום', icon: <Check className="w-4 h-4" /> },
        { id: 'shipping', label: 'משלוח', icon: <Package className="w-4 h-4" /> },
        { id: 'delivery', label: 'נמסר', icon: <Truck className="w-4 h-4" /> },
    ];

    const getStepStatus = (stepId: string) => {
        if (isCancelled) return 'cancelled';
        const stepOrder = ['negotiation', 'payment', 'shipping', 'delivery'];
        const currentIndex = stepOrder.indexOf(currentStep);
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

    return (
        <div className="w-full py-4 px-2">
            {/* ... existing stepper visual code ... */}
            <div className="relative flex items-center justify-between">
                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-100 -z-10 rounded-full"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-primary to-blue-500 -z-10 rounded-full transition-all duration-700 ease-out"
                    style={{
                        width: `${(steps.findIndex(s => s.id === currentStep) / (steps.length - 1)) * 100}%`
                    }}
                ></div>

                {steps.map((step) => {
                    const status = getStepStatus(step.id);
                    const isActive = status === 'active';
                    const isCompleted = status === 'completed';

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 relative bg-background px-2 z-10">
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-md
                                ${isCompleted ? 'bg-primary border-primary text-white scale-100' : ''}
                                ${isActive ? 'bg-white border-primary text-primary scale-110 shadow-lg shadow-primary/20 animate-pulse-subtle' : ''}
                                ${status === 'pending' ? 'bg-gray-50 border-gray-200 text-gray-300' : ''}
                                ${isCancelled ? 'bg-red-50 border-red-200 text-red-500' : ''}
                            `}>
                                {isCompleted ? <Check className="w-6 h-6 stroke-[3]" /> : step.icon}
                            </div>
                            <span className={`text-[11px] font-bold transition-colors duration-300 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                                {step.label}
                            </span>

                            {/* Active Pulse Effect */}
                            {isActive && (
                                <span className="absolute -bottom-4 w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Online Status Indicators - HALF-LIVE IMPLEMENTATION */}
            <div className="flex justify-between items-center mt-6 px-2 text-[10px] text-gray-400 font-medium">
                <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${sellerOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                    <span className={sellerOnline ? 'text-green-600 font-bold' : ''}>{sellerOnline ? 'מוכר מחובר' : 'מוכר לא מחובר'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className={buyerOnline ? 'text-green-600 font-bold' : ''}>{buyerOnline ? 'קונה מחובר' : 'קונה לא מחובר'}</span>
                    <span className={`w-2 h-2 rounded-full ${buyerOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                </div>
            </div>
        </div>
    );
}
