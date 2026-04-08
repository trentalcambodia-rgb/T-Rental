import React from 'react';

export const LenderDashboardScreen: React.FC = () => {
    return (
        <div className="bg-background min-h-full pb-20 pt-12">
            
            {/* Professional Brand Header */}
            <div className="px-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                             <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                             </svg>
                        </div>
                        <span className="font-black text-xl tracking-tighter text-gray-900">T-RENTAL</span>
                    </div>
                    {/* Optional: Add a settings or profile icon here if needed */}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Lender Dashboard</h1>
                <p className="text-sm text-gray-500 font-medium mt-1">Overview of your rental business</p>
            </div>
            
            <div className="px-6">
                {/* Earnings Card */}
                <div className="bg-primary rounded-3xl p-6 text-white shadow-xl shadow-primary/20 mb-8 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 text-white opacity-10 text-9xl font-bold group-hover:scale-110 transition-transform duration-500">
                        $
                    </div>
                    <p className="text-blue-200 text-sm font-bold mb-2 uppercase tracking-wider">Total Earnings</p>
                    <div className="flex items-baseline gap-1 mb-6 relative z-10">
                        <span className="text-5xl font-bold tracking-tight">$145</span>
                        <span className="text-2xl opacity-60 font-medium">.00</span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
                        </span>
                        <span className="text-xs font-bold">Active Status: Online</span>
                    </div>
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                     <button className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-left active:bg-gray-50 active:scale-[0.98] transition-all group">
                        <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-100 transition-colors">
                            <span className="text-xl">📅</span>
                        </div>
                        <span className="text-sm font-bold text-gray-800">Block Dates</span>
                     </button>
                     <button className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-left active:bg-gray-50 active:scale-[0.98] transition-all group">
                        <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-yellow-100 transition-colors">
                            <span className="text-xl">⭐</span>
                        </div>
                        <span className="text-sm font-bold text-gray-800">My Reviews</span>
                     </button>
                </div>
            </div>
        </div>
    )
}