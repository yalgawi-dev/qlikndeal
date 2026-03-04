import { getAdminTasks } from "../collaboration-actions";
import AdminTasksClient from "./AdminTasksClient";

export default async function AdminTasksPage() {
    const tasks = await getAdminTasks();

    return (
        <div className="min-h-screen p-4 md:p-10 bg-gradient-to-b from-slate-900 to-indigo-950/20">
            <div className="max-w-4xl mx-auto mb-10 text-center md:text-right">
                <h1 className="text-4xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    יומן משימות אדמין
                </h1>
                <p className="text-large text-slate-400 font-medium">
                    ניהול משימות שוטפות ושיתוף פעולה עם חברי הצוות בזמן אמת.
                </p>
            </div>
            <AdminTasksClient initialTasks={tasks} />
        </div>
    );
}
