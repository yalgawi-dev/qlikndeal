import { currentUser } from "@clerk/nextjs/server";

export default async function DebugClerkPage() {
    const user = await currentUser();

    return (
        <div className="p-8 font-mono text-xs bg-black text-green-400 min-h-screen">
            <h1 className="text-xl mb-4 text-white">Clerk User Object Debugger</h1>
            <pre>
                {JSON.stringify(user, null, 2)}
            </pre>
        </div>
    );
}
