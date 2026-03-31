import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '../types';

// Mock Data
const MOCK_REQUESTS: Booking[] = [
  {
    id: 'b1',
    renter_id: 'u5',
    item_id: 'i1',
    item_title: 'Honda Dream 2023',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    total_price: 24,
    status: BookingStatus.REQUESTED,
    created_at: new Date().toISOString()
  },
  {
    id: 'b2',
    renter_id: 'u6',
    item_id: 'i2',
    item_title: 'Canon 5D Mark IV',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 86400000).toISOString(),
    total_price: 35,
    status: BookingStatus.REQUESTED,
    created_at: new Date().toISOString()
  }
];

const MOCK_RETURNING: Booking[] = [
   {
    id: 'b3',
    renter_id: 'u7',
    item_id: 'i3',
    item_title: 'Camping Set',
    start_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    end_date: new Date().toISOString(), // Today
    total_price: 30,
    status: BookingStatus.PICKED_UP, // Currently out, due back
    created_at: new Date().toISOString()
  }
];

interface ShopDashboardScreenProps {
    onAddItem: () => void;
}

export const ShopDashboardScreen: React.FC<ShopDashboardScreenProps> = ({ onAddItem }) => {
    const [activeTab, setActiveTab] = useState<'requests' | 'handover'>('requests');
    const [requests, setRequests] = useState<Booking[]>(MOCK_REQUESTS);
    const [returning, setReturning] = useState<Booking[]>(MOCK_RETURNING);

    const handleAccept = (id: string) => {
        alert(`Booking ${id} Accepted! Chat opened.`);
        setRequests(prev => prev.filter(b => b.id !== id));
    };

    const handleDecline = (id: string) => {
        if(confirm("Are you sure you want to decline?")) {
            setRequests(prev => prev.filter(b => b.id !== id));
        }
    };
    
    const handleVerifyReturn = (id: string) => {
        alert("Return Verified. Item marked as stock.");
        setReturning(prev => prev.filter(b => b.id !== id));
    };

    return (
        <div className="bg-background min-h-full pb-20">
            {/* PROFESSIONAL HEADER */}
            <header className="bg-white pt-12 pb-6 px-6 shadow-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/20">
                             <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                             </svg>
                        </div>
                        <span className="font-black text-xl tracking-tighter text-gray-900">T-RENTAL</span>
                    </div>
                    
                    <button 
                        onClick={onAddItem}
                        className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-gray-200 active:scale-95 transition-transform hover:bg-black"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Shop Dashboard</h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Manage orders and inventory</p>
                </div>
            </header>

            {/* 1. Summary Cards */}
            <div className="px-6 py-6 overflow-x-auto no-scrollbar">
                <div className="flex gap-4 min-w-max">
                    <SummaryCard 
                        label="Pending" 
                        count={requests.length} 
                        color="bg-orange-500" 
                        icon="⏳"
                    />
                    <SummaryCard 
                        label="Active Rentals" 
                        count={12} 
                        color="bg-primary" 
                        icon="🚲" 
                    />
                    <SummaryCard 
                        label="Returning Today" 
                        count={returning.length} 
                        color="bg-indigo-500" 
                        icon="🔙"
                    />
                </div>
            </div>

            {/* 2. Tabs */}
            <div className="bg-white border-y border-gray-100 flex sticky top-[130px] z-10 shadow-sm">
                <TabButton 
                    active={activeTab === 'requests'} 
                    label="Requests" 
                    count={requests.length}
                    onClick={() => setActiveTab('requests')} 
                />
                <TabButton 
                    active={activeTab === 'handover'} 
                    label="Handover / Return" 
                    count={returning.length} 
                    onClick={() => setActiveTab('handover')} 
                />
            </div>

            {/* List View */}
            <div className="p-4 space-y-4">
                {activeTab === 'requests' ? (
                    <>
                        {requests.length === 0 && <EmptyState message="No new requests" />}
                        {requests.map(req => (
                            <RequestCard 
                                key={req.id} 
                                booking={req} 
                                onAccept={() => handleAccept(req.id)}
                                onDecline={() => handleDecline(req.id)}
                            />
                        ))}
                    </>
                ) : (
                    <>
                        {returning.length === 0 && <EmptyState message="No items scheduled for today" />}
                         {returning.length > 0 && (
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Returning Today</h3>
                         )}
                        {returning.map(ret => (
                            <ReturnCard 
                                key={ret.id} 
                                booking={ret}
                                onVerify={() => handleVerifyReturn(ret.id)}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

// --- Sub-Components ---

const SummaryCard = ({ label, count, color, icon }: { label: string, count: number, color: string, icon: string }) => (
    <div className={`${color} w-36 p-5 rounded-2xl text-white shadow-lg shadow-gray-200 relative overflow-hidden flex flex-col justify-between h-32`}>
        <div className="absolute -right-2 -top-2 text-6xl opacity-20 grayscale rotate-12">{icon}</div>
        <div className="text-2xl mb-auto">{icon}</div>
        <div>
            <p className="text-3xl font-bold tracking-tight">{count}</p>
            <p className="text-[10px] font-bold uppercase opacity-90 leading-tight mt-1">{label}</p>
        </div>
    </div>
);

const TabButton = ({ active, label, count, onClick }: { active: boolean, label: string, count?: number, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`flex-1 py-4 text-sm font-bold relative transition-colors ${active ? 'text-primary' : 'text-gray-400 bg-gray-50/50'}`}
    >
        {label}
        {count !== undefined && count > 0 && (
            <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                {count}
            </span>
        )}
        {active && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
    </button>
);

interface RequestCardProps {
    booking: Booking;
    onAccept: () => void;
    onDecline: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ booking, onAccept, onDecline }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0 overflow-hidden">
                <img src={`https://picsum.photos/seed/${booking.item_id}/200`} className="w-full h-full object-cover" alt="Item" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 truncate pr-2 text-sm">{booking.item_title}</h3>
                    <span className="text-primary font-bold text-sm bg-indigo-50 px-2 py-0.5 rounded-lg">${booking.total_price}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden border border-white shadow-sm">
                        <img src={`https://picsum.photos/seed/${booking.renter_id}/100`} alt="Renter" />
                    </div>
                    <p className="text-xs text-gray-500">Requested by <span className="font-bold text-gray-700">Dara</span></p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg inline-flex border border-gray-100">
                    <span>📅</span>
                    <span className="font-medium">{new Date(booking.start_date).toLocaleDateString()}</span>
                    <span className="text-gray-300 mx-1">→</span>
                    <span className="font-medium">{new Date(booking.end_date).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={onDecline}
                className="py-3 rounded-xl text-xs font-bold text-red-600 bg-white border border-red-100 hover:bg-red-50 transition-colors"
            >
                Decline
            </button>
            <button 
                onClick={onAccept}
                className="py-3 rounded-xl text-xs font-bold text-white bg-green-600 shadow-lg shadow-green-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <span>Accept & Chat</span>
                <span className="text-xs opacity-70">💬</span>
            </button>
        </div>
    </div>
);

interface ReturnCardProps {
    booking: Booking;
    onVerify: () => void;
}

const ReturnCard: React.FC<ReturnCardProps> = ({ booking, onVerify }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-indigo-500">
        <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded border border-indigo-100">Due: Today, 5:00 PM</span>
            <span className="text-xs text-gray-400 font-mono">#{booking.id.slice(0,4)}</span>
        </div>
        <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                 <img src={`https://picsum.photos/seed/${booking.item_id}/200`} className="w-full h-full object-cover" alt="Item" />
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-sm">{booking.item_title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Renter: <span className="font-bold text-gray-800">Sophea</span></p>
            </div>
            <button 
                onClick={onVerify}
                className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg shadow-md active:scale-95 transition-transform"
            >
                Verify
            </button>
        </div>
    </div>
);

const EmptyState = ({ message }: { message: string }) => (
    <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
        <div className="text-4xl mb-3 grayscale">🍃</div>
        <p className="text-sm font-bold text-gray-500">{message}</p>
    </div>
);