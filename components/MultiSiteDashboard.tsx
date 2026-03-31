
import React, { useState, useEffect } from 'react';
import { Item, ShopLocation, ItemCategory } from '../types';

// Mock Data for Locations
const MOCK_LOCATIONS: ShopLocation[] = [
    { id: 'loc_main', shop_id: 'shop_1', name: 'Main Warehouse (TK)', type: 'OWNED', gps_lat: 11.57, gps_long: 104.89, capacity: 100, is_active: true },
    { id: 'loc_partner_1', shop_id: 'shop_1', name: 'Riverside Hotel Partner', type: 'PARTNER', gps_lat: 11.56, gps_long: 104.93, capacity: 10, partner_contact_info: '+855 12 345 678', is_active: true },
    { id: 'loc_partner_2', shop_id: 'shop_1', name: 'BKK1 Coffee Spot', type: 'PARTNER', gps_lat: 11.55, gps_long: 104.92, capacity: 5, partner_contact_info: 'Manager: Sothea', is_active: true },
];

const MOCK_FLEET_ITEMS: Item[] = [
    { id: '1', owner_id: 'u1', current_shop_location_id: 'loc_main', title: 'Honda Dream #01', description: '', category: ItemCategory.VEHICLE, price_per_day: 8, currency: 'USD', image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400', latitude: 11.57, longitude: 104.89, availability_status: 'AVAILABLE', rating_avg: 4.8, quantity: 1 },
    { id: '2', owner_id: 'u1', current_shop_location_id: 'loc_partner_1', title: 'Honda Dream #02', description: '', category: ItemCategory.VEHICLE, price_per_day: 8, currency: 'USD', image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400', latitude: 11.56, longitude: 104.93, availability_status: 'AVAILABLE', rating_avg: 4.5, quantity: 1 },
    { id: '3', owner_id: 'u1', current_shop_location_id: 'loc_main', title: 'Honda Zoomer #05', description: '', category: ItemCategory.VEHICLE, price_per_day: 10, currency: 'USD', image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400', latitude: 11.57, longitude: 104.89, availability_status: 'MAINTENANCE', rating_avg: 4.2, quantity: 1 },
];

export const MultiSiteDashboard: React.FC<{ onAddItem: () => void }> = ({ onAddItem }) => {
    const [selectedLocationId, setSelectedLocationId] = useState<string>('ALL');
    const [viewMode, setViewMode] = useState<'MAP' | 'LIST'>('LIST');
    const [items, setItems] = useState<Item[]>(MOCK_FLEET_ITEMS);
    
    // Transfer Modal State
    const [transferItem, setTransferItem] = useState<Item | null>(null);
    const [targetLocationId, setTargetLocationId] = useState<string>('');
    const [isTransferring, setIsTransferring] = useState(false);

    // Filter Items Logic
    const filteredItems = selectedLocationId === 'ALL' 
        ? items 
        : items.filter(i => i.current_shop_location_id === selectedLocationId);

    const handleTransfer = async () => {
        if (!targetLocationId || !transferItem) return;
        setIsTransferring(true);

        try {
            // In real app, call Edge Function 'transfer-inventory' here
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Optimistic Update
            setItems(prev => prev.map(item => {
                if (item.id === transferItem.id) {
                    const targetLoc = MOCK_LOCATIONS.find(l => l.id === targetLocationId);
                    return { 
                        ...item, 
                        current_shop_location_id: targetLocationId,
                        latitude: targetLoc?.gps_lat || item.latitude,
                        longitude: targetLoc?.gps_long || item.longitude
                    };
                }
                return item;
            }));
            
            alert(`Transferred to ${MOCK_LOCATIONS.find(l => l.id === targetLocationId)?.name}`);
            setTransferItem(null);
        } catch (e) {
            alert("Transfer failed");
        } finally {
            setIsTransferring(false);
        }
    };

    return (
        <div className="bg-background min-h-full pb-24 relative">
             {/* Header */}
             <div className="bg-white pt-12 pb-4 shadow-sm z-20 sticky top-0">
                <div className="px-6 flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Fleet Manager</h1>
                        <p className="text-xs text-gray-500 font-medium">Monitoring {items.length} assets across {MOCK_LOCATIONS.length} sites</p>
                    </div>
                    <button 
                        onClick={() => setViewMode(prev => prev === 'MAP' ? 'LIST' : 'MAP')}
                        className="bg-gray-100 p-2 rounded-xl text-xs font-bold text-gray-700 border border-gray-200"
                    >
                        {viewMode === 'MAP' ? 'Show List' : 'Show Map'}
                    </button>
                </div>

                {/* Horizontal Location Filter */}
                <div className="overflow-x-auto no-scrollbar px-6 flex gap-3 pb-2">
                    <button 
                        onClick={() => setSelectedLocationId('ALL')}
                        className={`
                            px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border
                            ${selectedLocationId === 'ALL' ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-500 border-gray-200'}
                        `}
                    >
                        All Sites ({items.length})
                    </button>
                    {MOCK_LOCATIONS.map(loc => {
                        const count = items.filter(i => i.current_shop_location_id === loc.id).length;
                        return (
                            <button 
                                key={loc.id}
                                onClick={() => setSelectedLocationId(loc.id)}
                                className={`
                                    px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border
                                    ${selectedLocationId === loc.id ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-500 border-gray-200'}
                                `}
                            >
                                {loc.name} ({count}/{loc.capacity})
                            </button>
                        );
                    })}
                </div>
             </div>

             {/* Content Area */}
             <div className="flex-1">
                {viewMode === 'MAP' ? (
                    <FleetMapView locations={MOCK_LOCATIONS} items={items} />
                ) : (
                    <div className="p-4 space-y-3">
                        {filteredItems.map(item => {
                            const locationName = MOCK_LOCATIONS.find(l => l.id === item.current_shop_location_id)?.name || 'Unknown';
                            return (
                                <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.availability_status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {item.availability_status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end mt-1">
                                            <p className="text-[10px] text-gray-400 font-medium">
                                                At: <span className="text-gray-600 font-bold">{locationName}</span>
                                            </p>
                                            <button 
                                                onClick={() => { setTransferItem(item); setTargetLocationId(item.current_shop_location_id || ''); }}
                                                className="bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                                            >
                                                Move 🚚
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
             </div>

             {/* Transfer Modal */}
             {transferItem && (
                 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
                     <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                         <h3 className="text-lg font-bold text-gray-900 mb-1">Move Inventory</h3>
                         <p className="text-sm text-gray-500 mb-4">Select destination for <span className="font-bold text-gray-800">{transferItem.title}</span></p>

                         <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                            {MOCK_LOCATIONS.map(loc => {
                                const isCurrent = loc.id === transferItem.current_shop_location_id;
                                const isFull = false; // Logic to check capacity would go here
                                return (
                                    <button
                                        key={loc.id}
                                        disabled={isCurrent || isFull}
                                        onClick={() => setTargetLocationId(loc.id)}
                                        className={`
                                            w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all
                                            ${targetLocationId === loc.id 
                                                ? 'border-primary bg-indigo-50 ring-1 ring-primary' 
                                                : 'border-gray-200 hover:bg-gray-50'}
                                            ${isCurrent ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
                                        `}
                                    >
                                        <div>
                                            <p className={`text-sm font-bold ${targetLocationId === loc.id ? 'text-primary' : 'text-gray-700'}`}>{loc.name}</p>
                                            <p className="text-[10px] text-gray-400">{loc.type} • Cap: {loc.capacity}</p>
                                        </div>
                                        {targetLocationId === loc.id && <span className="text-primary font-bold">✓</span>}
                                        {isCurrent && <span className="text-[10px] text-gray-400 font-medium">Current</span>}
                                    </button>
                                )
                            })}
                         </div>

                         <div className="flex gap-3">
                             <button 
                                onClick={() => setTransferItem(null)}
                                className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200"
                             >
                                Cancel
                             </button>
                             <button 
                                onClick={handleTransfer}
                                disabled={isTransferring || targetLocationId === transferItem.current_shop_location_id}
                                className="flex-1 py-3 text-sm font-bold text-white bg-primary rounded-xl shadow-lg active:scale-95 disabled:opacity-50"
                             >
                                {isTransferring ? 'Moving...' : 'Confirm Move'}
                             </button>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
};

// --- Sub Component: Map View ---
const FleetMapView = ({ locations, items }: { locations: ShopLocation[], items: Item[] }) => {
    // Simulated Map using relative positioning on a static image
    // Center point approx: 11.56, 104.91
    // Scale factor for visualization
    const SCALE = 2000;
    const CENTER_LAT = 11.56;
    const CENTER_LONG = 104.91;

    return (
        <div className="w-full h-full min-h-[500px] bg-blue-50 relative overflow-hidden">
            <div 
                className="absolute inset-0 opacity-40 bg-cover bg-center grayscale-[30%]"
                style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Phnom_Penh_map.png/1200px-Phnom_Penh_map.png")' }}
            ></div>
            
            {/* Render Location Pins */}
            {locations.map(loc => {
                const latDiff = (loc.gps_lat - CENTER_LAT) * SCALE;
                const longDiff = (loc.gps_long - CENTER_LONG) * SCALE;
                const top = 50 - latDiff;
                const left = 50 + longDiff;
                
                const itemCount = items.filter(i => i.current_shop_location_id === loc.id).length;
                const colorClass = loc.type === 'OWNED' ? 'bg-primary' : 'bg-purple-600';

                return (
                    <div 
                        key={loc.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group hover:z-20"
                        style={{ top: `${top}%`, left: `${left}%` }}
                    >
                        <div className="flex flex-col items-center">
                            <div className={`${colorClass} text-white px-2 py-1 rounded-lg shadow-xl font-bold text-[10px] border border-white whitespace-nowrap mb-1`}>
                                {loc.name}
                            </div>
                            <div className={`w-8 h-8 ${colorClass} rounded-full border-2 border-white flex items-center justify-center shadow-lg`}>
                                <span className="text-white text-xs font-bold">{itemCount}</span>
                            </div>
                            <div className="w-1 h-3 bg-black/50"></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
