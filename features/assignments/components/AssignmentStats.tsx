interface AssignmentStatsProps {
    averageScore: number;
    completionRate: number;
    totalSubmissions: number;
    totalPossibleSubmissions: number;
    pendingGradingCount: number;
    expiringSoonCount: number;
}

export default function AssignmentStats({ 
    averageScore = 0, 
    completionRate = 0, 
    totalSubmissions = 0, 
    totalPossibleSubmissions = 0, 
    pendingGradingCount = 0, 
    expiringSoonCount = 0 
}: Partial<AssignmentStatsProps>) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
            
            {/* Average Score */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                    </div>
                    <h3 className="text-gray-600 font-bold text-sm">Average Score</h3>
                </div>
                <div>
                    <div className="flex items-end gap-1 mb-2">
                        <span className="text-4xl font-extrabold text-gray-900 leading-none">{averageScore.toFixed(1)}</span>
                        <span className="text-sm font-bold text-gray-400 mb-1">/100</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-500 font-bold text-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                        +0%
                    </div>
                </div>
            </div>

            {/* Completion Rate */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <h3 className="text-gray-600 font-bold text-sm">Completion Rate</h3>
                </div>
                <div>
                    <div className="text-4xl font-extrabold text-gray-900 leading-none mb-2">{Math.round(completionRate)}%</div>
                    <div className="text-gray-400 text-sm font-medium">{totalSubmissions}/{totalPossibleSubmissions} bài đã nộp</div>
                </div>
            </div>

            {/* Chờ chấm điểm */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-orange-100 text-orange-500 p-2 rounded-lg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><circle cx="12" cy="14" r="3"></circle><line x1="12" y1="12" x2="12" y2="14"></line></svg>
                    </div>
                    <h3 className="text-gray-600 font-bold text-sm">Chờ chấm điểm</h3>
                </div>
                <div>
                    <div className="text-4xl font-extrabold text-orange-500 leading-none mb-2">{pendingGradingCount}</div>
                    <div className="text-gray-400 text-sm font-medium">Cần xem xét thủ công</div>
                </div>
            </div>

            {/* Sắp hết hạn */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <h3 className="text-gray-600 font-bold text-sm">Sắp hết hạn</h3>
                </div>
                <div>
                    <div className="text-4xl font-extrabold text-gray-900 leading-none mb-2">{expiringSoonCount.toString().padStart(2, '0')}</div>
                    <div className="text-red-500 text-sm font-bold">Trong vòng 24 giờ</div>
                </div>
            </div>

        </div>
    );
}
