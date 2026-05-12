import { Trash2, Clock, CheckCircle, Search, Edit2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BuyerRequestCardProps {
    request: any;
    onDelete?: (id: string) => void;
    onEdit?: (request: any) => void;
}

export function BuyerRequestCard({ request, onDelete, onEdit }: BuyerRequestCardProps) {
    const statusColor = request.status === 'ACTIVE' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
        request.status === 'FULFILLED' ? 'text-green-400 bg-green-400/10 border-green-400/20' :
            'text-gray-400 bg-gray-400/10 border-gray-400/20';

    const statusLabel = request.status === 'ACTIVE' ? 'מחפש...' :
        request.status === 'FULFILLED' ? 'נמצא!' : 'בוטל';

    return (
        <Card 
            className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors group relative overflow-hidden cursor-pointer"
            onClick={() => onEdit && onEdit(request)}
        >
            <div className={`absolute top-0 right-0 w-1 h-full ${request.status === 'ACTIVE' ? 'bg-blue-500' : 'bg-gray-700'}`} />
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                        <Search className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-lg">{request.query}</h4>
                        <div className="flex flex-col gap-1 mt-1">
                            <div className="flex items-center gap-2 text-xs">
                                <span className={`px-2 py-0.5 rounded-md border ${statusColor} font-bold`}>
                                    {statusLabel}
                                </span>
                                <span className="text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(request.createdAt).toLocaleDateString('he-IL')}
                                </span>
                            </div>
                            
                            {request.extraData && (
                                <div className="text-xs text-gray-400 mt-2 flex flex-wrap gap-2">
                                    {JSON.parse(request.extraData)?.budgetRange && (
                                        <span className="bg-gray-800 px-2 py-0.5 rounded text-cyan-400 border border-cyan-500/20">
                                            ₪{JSON.parse(request.extraData).budgetRange[0]} - ₪{JSON.parse(request.extraData).budgetRange[1]}
                                        </span>
                                    )}
                                    {!JSON.parse(request.extraData)?.budgetRange && JSON.parse(request.extraData)?.budget && (
                                        <span className="bg-gray-800 px-2 py-0.5 rounded">
                                            עד ₪{JSON.parse(request.extraData).budget}
                                        </span>
                                    )}
                                    {JSON.parse(request.extraData)?.category && JSON.parse(request.extraData).category !== "General" && (
                                        <span className="bg-gray-800 px-2 py-0.5 rounded">
                                            {JSON.parse(request.extraData).category}
                                        </span>
                                    )}
                                    {JSON.parse(request.extraData)?.chips && JSON.parse(request.extraData).chips.map((chip: string) => (
                                        <span key={chip} className="bg-cyan-900/30 text-cyan-300 px-2 py-0.5 rounded">
                                            {chip}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    {onEdit && (
                        <Button variant="ghost" size="sm" onClick={() => onEdit(request)} className="text-gray-500 hover:text-blue-400 hover:bg-blue-400/10">
                            <Edit2 className="w-4 h-4" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button variant="ghost" size="sm" onClick={() => onDelete(request.id)} className="text-gray-500 hover:text-red-400 hover:bg-red-400/10">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
