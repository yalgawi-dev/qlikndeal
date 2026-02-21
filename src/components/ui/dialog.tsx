"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = ({
    open,
    onOpenChange,
    children,
}: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}) => {
    // Simple context to share open state if needed, but for now we rely on controlled props
    // If we want fully controlled, we just render children.
    // We can just clone children to pass props if using Trigger, but here we keep it simple.

    // This is a simplified "shim" to match shadcn API without full Radix install
    return <>{children}</>;
};

import { Slot } from "@radix-ui/react-slot";

// ... existing code ...

const DialogTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, children, onClick, asChild = false, ...props }, ref) => {
    const ctx = React.useContext(DialogContext);
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            ref={ref}
            className={cn(className)}
            onClick={(e: any) => {
                ctx?.onOpenChange(true);
                onClick?.(e);
            }}
            {...props}
        >
            {children}
        </Comp>
    );
});
DialogTrigger.displayName = "DialogTrigger";

// CONTEXT
interface DialogContextType {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}
const DialogContext = React.createContext<DialogContextType | null>(null);

const Root = ({
    open = false,
    onOpenChange = () => { },
    children,
}: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}) => {
    return (
        <DialogContext.Provider value={{ open, onOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
};

const DialogContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const ctx = React.useContext(DialogContext);

    if (!ctx?.open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
                ref={ref}
                className={cn(
                    "bg-background rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative shadow-2xl animate-in zoom-in-95 duration-200",
                    className
                )}
                onClick={(e) => e.stopPropagation()}
                {...props}
            >
                <button
                    onClick={() => ctx.onOpenChange(false)}
                    className="absolute left-4 top-4 rounded-full p-2 bg-muted hover:bg-muted/80 transition-colors z-50"
                >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                </button>
                {children}
            </div>
        </div>
    );
});
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col text-center sm:text-left p-6 pb-2",
            className
        )}
        {...props}
    />
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-lg font-semibold leading-none tracking-tight",
            className
        )}
        {...props}
    />
));
DialogTitle.displayName = "DialogTitle";

DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
));
DialogDescription.displayName = "DialogDescription";

export { Root as Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription };
