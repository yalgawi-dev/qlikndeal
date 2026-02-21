import { Trash2, Clock, CheckCircle, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BuyerRequestCardProps {
    request: any;
    onDelete?: (id: string) => void;
}

export function BuyerRequestCard({ request, onDelete }: BuyerRequestCardProps) {
    const statusColor = request.status === 'ACTIVE' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
        request.status === 'FULFILLED' ? 'text-green-400 bg-green-400/10 border-green-400/20' :
            'text-gray-400 bg-gray-400/10 border-gray-400/20';

    const statusLabel = request.status === 'ACTIVE' ? 'מחפש...' :
        request.status === 'FULFILLED' ? 'נמצא!' : 'בוטל';

    return (
        <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-1 h-full ${request.status === 'ACTIVE' ? 'bg-blue-500' : 'bg-gray-700'}`} />
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                        <Search className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-lg">{request.query}</h4>
                        <div className="flex items-center gap-2 text-xs mt-1">
                            <span className={`px-2 py-0.5 rounded-md border ${statusColor} font-bold`}>
                                {statusLabel}
                            </span>
                            <span className="text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(request.createdAt).toLocaleDateString('he-IL')}
                            </span>
                        </div>
                    </div>
                </div>

                {onDelete && (
                    <Button variant="ghost" size="sm" onClick={() => onDelete(request.id)} className="text-gray-500 hover:text-red-400 hover:bg-red-400/10">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
