import { getAdminTasks } from "../collaboration-actions";
import AdminTasksClient from "./AdminTasksClient";

export default async function AdminTasksPage() {
    const tasks = await getAdminTasks();

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-slate-800">Admin Task Log</h1>
            <p className="text-slate-600 mb-8">
                Keep track of tasks and collaborate with other admins.
            </p>
            <AdminTasksClient initialTasks={tasks} />
        </div>
    );
}
