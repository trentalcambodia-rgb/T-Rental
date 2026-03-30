import React, { useState, useEffect } from 'react';
import { Item, ItemCategory } from '../types';

// --- MOCK SUPABASE RPC CALL ---
const fetchNearbyItems = async (category: string | 'All', lat: number, long: number): Promise<Item[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));

  const MOCK_DB: Item[] = [
    {
      id: '1', owner_id: 'u2', title: 'Honda Dream 2023', description: 'Perfect condition, includes 2 helmets.', category: ItemCategory.VEHICLE,
      price_per_day: 8, currency: 'USD', image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
      latitude: 11.5564, longitude: 104.9282, availability_status: 'AVAILABLE', rating_avg: 4.8, quantity: 2
    },
    {
      id: '2', owner_id: 'u3', title: 'Canon 5D Mark IV', description: 'Body only. Good for wedding photography.', category: ItemCategory.ELECTRONICS,
      price_per_day: 35, currency: 'USD', image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      latitude: 11.562, longitude: 104.91, availability_status: 'AVAILABLE', rating_avg: 5.0, quantity: 1
    },
    {
      id: '3', owner_id: 'u4', title: 'Camping Set (4 Pax)', description: 'Tent, stove, chairs.', category: ItemCategory.OTHER,
      price_per_day: 15, currency: 'USD', image_url: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80',
      latitude: 11.55, longitude: 104.94, availability_status: 'AVAILABLE', rating_avg: 4.5, quantity: 3
    },
    {
      id: '4', owner_id: 'u5', title: 'Traditional Khmer Dress', description: 'Wedding attire', category: ItemCategory.FASHION,
      price_per_day: 12, currency: 'USD', image_url: 'https://images.unsplash.com/photo-1566231267800-449e794324f6?auto=format&fit=crop&w=800&q=80',
      latitude: 11.558, longitude: 104.92, availability_status: 'AVAILABLE', rating_avg: 4.9, quantity: 1
    },
    {
      id: '5', owner_id: 'u6', title: 'Drill Set (Makita)', description: 'Full set', category: ItemCategory.TOOLS,
      price_per_day: 5, currency: 'USD', image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
      latitude: 11.565, longitude: 104.925, availability_status: 'AVAILABLE', rating_avg: 4.2, quantity: 1
    }
  ];

  if (category === 'All') return MOCK_DB;
  return MOCK_DB.filter(i => i.category === category);
};

interface RenterHomeScreenProps {
  onItemClick?: (item: Item) => void;
}

export const RenterHomeScreen: React.FC<RenterHomeScreenProps> = ({ onItemClick }) => {
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'All'>('All');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    // Mock Fetch
    fetchNearbyItems(selectedCategory, 11.5564, 104.9282).then(data => {
        if (mounted) { setItems(data); setLoading(false); }
    });
    return () => { mounted = false; };
  }, [selectedCategory]);

  return (
    <div className="bg-background h-full flex flex-col relative">
      
      {/* PROFESSIONAL STICKY HEADER */}
      <div className="bg-white/95 backdrop-blur-md pt-12 pb-3 px-5 shadow-sm z-30 sticky top-0 border-b border-gray-100">
        
        {/* Top Row: Brand & Profile */}
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/20">
                     <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                </div>
                <span className="font-black text-xl tracking-tighter text-gray-900">T-RENTAL</span>
            </div>
            
             <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 overflow-hidden cursor-pointer active:scale-95 transition-transform">
                <img src="https://picsum.photos/150" className="w-full h-full object-cover" alt="Profile" />
             </div>
        </div>

        {/* Location Badge */}
        <div className="flex items-center gap-1 mb-4">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 pl-2 pr-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
                <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-xs font-bold text-gray-700">Phnom Penh, KH</span>
                <svg className="w-3 h-3 text-gray-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3 group">
          <input 
            type="text" 
            placeholder="Search cameras, bikes, fashion..." 
            className="w-full bg-gray-50 h-12 rounded-2xl pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all border-transparent border focus:border-primary/20 shadow-sm"
          />
          <span className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <button className="absolute right-3 top-2.5 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
             <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <CategoryChip label="All" active={selectedCategory === 'All'} onClick={() => setSelectedCategory('All')} />
          {Object.values(ItemCategory).map(cat => (
            <CategoryChip key={cat} label={cat} active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)} />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative bg-gray-50">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-full space-y-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-gray-400">Finding items nearby...</p>
           </div>
        ) : viewMode === 'LIST' ? (
          <div className="h-full overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-24 no-scrollbar">
             {items.map(item => (
                <div key={item.id} onClick={() => onItemClick && onItemClick(item)} className="h-full">
                    <FeedItemCard item={item} />
                </div>
             ))}
             <div className="h-8 sm:hidden"></div>
          </div>
        ) : (
          <SimulatedMapView items={items} />
        )}
      </div>

      {/* View Toggle */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        <button 
          onClick={() => setViewMode(prev => prev === 'LIST' ? 'MAP' : 'LIST')}
          className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 hover:bg-black transition-all active:scale-95 border border-gray-700"
        >
          {viewMode === 'LIST' ? (
            <><span className="text-lg">🗺️</span><span className="text-sm font-bold">Map</span></>
          ) : (
            <><span className="text-lg">≣</span><span className="text-sm font-bold">List</span></>
          )}
        </button>
      </div>

    </div>
  );
};

// --- SUB COMPONENTS ---

const CategoryChip: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`
      px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border
      ${active 
        ? 'bg-primary text-white border-primary shadow-md shadow-indigo-200' 
        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
    `}
  >
    {label}
  </button>
);

const FeedItemCard: React.FC<{ item: Item }> = ({ item }) => (
  <div className="bg-white rounded-3xl p-3 shadow-card border border-gray-100 flex flex-col gap-3 active:scale-[0.98] transition-transform cursor-pointer">
    <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 relative">
      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
        <div className="flex items-center gap-1 text-[11px] font-bold text-gray-800">
           <span className="text-yellow-500">★</span> <span>{item.rating_avg}</span>
        </div>
      </div>
      <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl">
         <p className="text-white text-xs font-bold">${item.price_per_day}<span className="font-medium opacity-80 text-[10px]">/day</span></p>
      </div>
    </div>
    <div className="px-1.5 pb-1">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-gray-900 line-clamp-1 text-base">{item.title}</h3>
      </div>
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
           <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span className="text-[11px] font-bold">2.5 km • Tuol Kork</span>
        </div>
        <button className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-indigo-100">
           Book
        </button>
      </div>
    </div>
  </div>
);

const SimulatedMapView = ({ items }: { items: Item[] }) => {
  const CENTER_LAT = 11.5564;
  const CENTER_LONG = 104.9282;
  const ZOOM_SCALE = 2000; 

  return (
    <div className="w-full h-full bg-blue-50 relative overflow-hidden">
       <div 
         className="absolute inset-0 opacity-40 bg-cover bg-center grayscale-[30%]"
         style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Phnom_Penh_map.png/1200px-Phnom_Penh_map.png")' }}
       ></div>
       {items.map(item => {
          const latDiff = (item.latitude - CENTER_LAT) * ZOOM_SCALE; 
          const longDiff = (item.longitude - CENTER_LONG) * ZOOM_SCALE;
          const top = 50 - latDiff; 
          const left = 50 + longDiff;
          return (
            <div 
              key={item.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10 hover:z-20"
              style={{ top: `${top}%`, left: `${left}%` }}
              onClick={() => alert(`Selected: ${item.title}`)}
            >
               <div className="bg-gray-900 text-white border-2 border-white px-3 py-1.5 rounded-xl shadow-xl font-bold text-xs hover:scale-110 transition-transform flex flex-col items-center">
                  <span>${item.price_per_day}</span>
                  <div className="absolute -bottom-1.5 w-3 h-3 bg-gray-900 transform rotate-45 border-b border-r border-white"></div>
               </div>
            </div>
          );
       })}
       <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
          <div className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg pulse-ring"></div>
       </div>
    </div>
  );
}