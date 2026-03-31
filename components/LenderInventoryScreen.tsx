import React from 'react';
import { Item } from '../types';

interface LenderInventoryScreenProps {
  items: Item[]; // Items owned by this lender
  onAddItem: () => void;
}

export const LenderInventoryScreen: React.FC<LenderInventoryScreenProps> = ({ items, onAddItem }) => {
  return (
    <div className="bg-background min-h-full pb-20">
      <header className="bg-white pt-12 pb-4 px-6 shadow-sm border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">My Gear</h1>
            <p className="text-xs text-gray-500 font-medium">Manage your listings</p>
        </div>
        <button 
            onClick={onAddItem}
            className="bg-text-main text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md active:scale-95 transition-transform"
        >
            + Add Item
        </button>
      </header>
      
      <div className="p-4 space-y-4">
        {items.length === 0 ? (
             <div className="text-center py-20 opacity-50">
                <p className="text-4xl mb-2">📸</p>
                <p className="font-bold text-gray-500">No items listed yet.</p>
                <p className="text-xs text-gray-400">Start earning by listing your gear.</p>
             </div>
        ) : (
            items.map(item => (
                <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 py-1 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{item.title}</h3>
                            <p className="text-xs text-gray-500">{item.category}</p>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.availability_status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {item.availability_status}
                            </span>
                            <span className="font-bold text-gray-900">${item.price_per_day}/day</span>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  )
}