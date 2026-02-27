import { getAdminTasks } from "../collaboration-actions";
import AdminTasksClient from "./AdminTasksClient";

export default async function AdminTasksPage() {
    const tasks = await getAdminTasks();

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-slate-100">יומן משימות אדמין</h1>
            <p className="text-slate-400 mb-8">
                ניהול משימות שוטפות ושיתוף פעולה עם חברי הצוות.
            </p>
            <AdminTasksClient initialTasks={tasks} />
        </div>
    );
}
