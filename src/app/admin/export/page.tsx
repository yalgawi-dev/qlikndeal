import { Metadata } from "next";
import ExportPageClient from "./ExportPageClient";

export const metadata: Metadata = {
    title: "ייצוא נתונים - Qlikndeal Admin",
    description: "ייצוא מאגרי המידע של המחשבים והסלולר",
};

export default function ExportPage() {
    return <ExportPageClient />;
}
