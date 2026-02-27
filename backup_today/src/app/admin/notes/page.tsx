import { getAdminNotes } from "../collaboration-actions";
import AdminNotesClient from "./AdminNotesClient";

export default async function AdminNotesPage() {
    const notes = await getAdminNotes();

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-slate-800">Shared Admin Notes</h1>
            <p className="text-slate-600 mb-8">
                A shared space for ideas, reminders, and documentation.
            </p>
            <AdminNotesClient initialNotes={notes} />
        </div>
    );
}
