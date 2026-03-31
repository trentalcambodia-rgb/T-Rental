import React from 'react';
import { Item, ItemCategory } from '../types';

interface ShopInventoryScreenProps {
  items: Item[];
  onAddItem: () => void;
}

export const ShopInventoryScreen: React.FC<ShopInventoryScreenProps> = ({ items, onAddItem }) => {
  const totalItems = items.length;
  // Mock calculation: assume quantities > 1 means some are available
  const totalValue = items.reduce((acc, item) => acc + (item.price_per_day * item.quantity), 0);

  return (
    <div className="bg-background min-h-full pb-20">
      {/* Header */}
      <header className="bg-white pt-12 pb-4 px-6 shadow-sm border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
            <p className="text-xs text-gray-500 font-medium">Manage Stock</p>
        </div>
        <button 
            onClick={onAddItem}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md active:bg-indigo-800 transition-colors"
        >
            + Add New
        </button>
      </header>

      {/* Stats Bar */}
      <div className="px-6 py-4 grid grid-cols-2 gap-4">
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Total Assets</p>
            <p className="text-xl font-bold text-gray-900">{totalItems} SKUs</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
             <p className="text-[10px] text-gray-400 font-bold uppercase">Est. Daily Value</p>
             <p className="text-xl font-bold text-green-600">${totalValue}</p>
        </div>
      </div>

      {/* Inventory List */}
      <div className="px-6 space-y-4">
        {items.length === 0 && (
            <div className="text-center py-20 opacity-50">
                <p className="text-2xl mb-2">📦</p>
                <p className="text-gray-500 font-bold">No items yet.</p>
                <p className="text-xs text-gray-400">Add your first item to start earning.</p>
            </div>
        )}

        {items.map(item => (
            <InventoryCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

const InventoryCard: React.FC<{ item: Item }> = ({ item }) => {
    // Mock Availability Calculation
    const rentedOut = Math.floor(Math.random() * item.quantity); // Randomly simulate rented stock
    const available = item.quantity - rentedOut;

    return (
        <div className="bg-white rounded-2xl p-3 shadow-card border border-gray-100 flex gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                {available === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white uppercase transform -rotate-12 border-2 border-white px-1">Rented</span>
                    </div>
                )}
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 text-sm truncate pr-2">{item.title}</h3>
                        <div className="flex flex-col items-end">
                             <span className="font-bold text-gray-900 text-sm">${item.price_per_day}</span>
                             <span className="text-[10px] text-gray-400">/day</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">{item.category}</p>
                </div>

                <div className="flex justify-between items-end mt-2">
                    <div className="flex items-center gap-2 text-xs">
                        <span className={`font-bold ${available > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {available}/{item.quantity} Avail
                        </span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span className="text-gray-400 cursor-pointer underline hover:text-primary">Edit</span>
                    </div>
                    
                    <button className={`
                        w-8 h-8 rounded-full flex items-center justify-center transition-colors
                        ${item.availability_status === 'AVAILABLE' ? 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500' : 'bg-red-100 text-red-500'}
                    `} title="Pause Availability">
                        {item.availability_status === 'AVAILABLE' ? '⏸' : '▶'}
                    </button>
                </div>
            </div>
        </div>
    );
};