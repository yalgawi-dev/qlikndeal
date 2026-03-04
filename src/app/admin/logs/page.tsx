import { getDatabaseStats } from "../export-actions";
import ImportLogsClient from "./ImportLogsClient";

export default async function ImportLogsPage() {
    const result = await getDatabaseStats();
    const logs = (result as any).recentLogs || [];

    return <ImportLogsClient initialLogs={logs} />;
}
