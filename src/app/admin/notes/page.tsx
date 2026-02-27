import { getAdminNotes } from "../collaboration-actions";
import AdminNotesClient from "./AdminNotesClient";

export default async function AdminNotesPage() {
    const notes = await getAdminNotes();

    return (
        <div className="p-6 max-w-5xl mx-auto" dir="rtl">
            <h1 className="text-3xl font-bold mb-6 text-slate-100">הערות צוות משותפות</h1>
            <p className="text-slate-400 mb-8">
                מרחב משותף לרעיונות, תזכורות ותיעוד לצוות הניהול.
            </p>
            <AdminNotesClient initialNotes={notes} />
        </div>
    );
}
