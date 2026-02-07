import { ShieldCheck } from "lucide-react";

export function Logo({ className }: { className?: string }) {
    return (
        <div className={`flex items-center gap-3 group ${className}`}>
            <div className="relative flex items-center justify-center">
                {/* Neon Glow Behind */}
                <div className="absolute inset-0 bg-primary/40 rounded-full blur-[10px] group-hover:blur-[15px] transition-all duration-300" />
                <div className="absolute inset-0 bg-secondary/20 rounded-full blur-[20px] group-hover:bg-secondary/30" />

                <ShieldCheck className="h-10 w-10 text-primary relative z-10 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col justify-center">
                <span className="font-['Outfit'] font-extrabold text-3xl tracking-wide text-white drop-shadow-md leading-none">
                    Qlik<span className="text-primary font-normal">n</span>deal
                </span>
                <span className="font-['Outfit'] text-[9px] text-primary/90 font-bold tracking-[0.3em] uppercase mt-1 ml-1">
                    Safe Transactions
                </span>
            </div>
        </div>
    );
}
