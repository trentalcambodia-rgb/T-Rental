import React, { useState, useRef } from 'react';
import { ItemCategory, UserRole } from '../types';
import { createItem, auth } from '../src/lib/supabase';

interface ShopAddItemScreenProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export const ShopAddItemScreen: React.FC<ShopAddItemScreenProps> = ({ onCancel, onSuccess }) => {
  const [images, setImages] = useState<string[]>([]); // Storing preview URLs
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory>(ItemCategory.OTHER);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(1);
  const [instantRent, setInstantRent] = useState(false);
  
  // Condition Report State
  const [conditions, setConditions] = useState({
    new: false,
    used: true,
    scratches: false,
    boxIncluded: false
  });

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file as Blob));
      setImages(prev => [...prev, ...newImages].slice(0, 5)); // Limit to 5
    }
  };

  const toggleCondition = (key: keyof typeof conditions) => {
    setConditions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    if (!title || !price) return alert("Please fill in required fields");
    
    const user = auth.currentUser;
    if (!user) return alert("Please sign in to list items");

    setUploading(true);

    try {
      await createItem({
        owner_id: user.id,
        title,
        description,
        category,
        price_per_day: parseFloat(price),
        image_url: images[0] || `https://picsum.photos/seed/${title}/800/600`,
        availability_status: 'AVAILABLE',
        quantity: stock,
        location_lat: 11.5564, // Default Phnom Penh
        location_lng: 104.9282
      });
      
      alert("Item Listed Successfully!");
      onSuccess();

    } catch (error) {
      console.error(error);
      alert("Failed to upload item");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-background min-h-full flex flex-col relative z-50 max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto border-x border-gray-100 shadow-2xl">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <button onClick={onCancel} className="text-gray-500 font-medium">Cancel</button>
        <h1 className="font-bold text-lg">Add Item</h1>
        <button 
          onClick={handleSubmit} 
          disabled={uploading}
          className={`font-bold ${uploading ? 'text-gray-300' : 'text-primary'}`}
        >
          {uploading ? '...' : 'Post'}
        </button>
      </div>

      <div className="p-4 space-y-6 pb-20 overflow-y-auto">
        
        {/* 1. Image Picker */}
        <div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
            {/* Add Button */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 shrink-0 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer active:bg-gray-200"
            >
              <span className="text-2xl text-gray-400">📷</span>
              <span className="text-[10px] font-bold text-gray-400 mt-1">Add Photo</span>
            </div>
            
            {/* Image Previews */}
            {images.map((img, idx) => (
              <div key={idx} className="w-24 h-24 shrink-0 relative rounded-xl overflow-hidden border border-gray-200">
                <img src={img} alt="preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleImagePick}
          />
          <p className="text-xs text-gray-400 mt-1 ml-1">{images.length}/5 photos selected</p>
        </div>

        {/* 2. Basic Info */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
              <input 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Sony A7III Camera Kit" 
                className="w-full mt-1 py-2 border-b border-gray-200 focus:outline-none focus:border-primary font-medium bg-transparent"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value as ItemCategory)}
                className="w-full mt-1 py-2 border-b border-gray-200 focus:outline-none bg-transparent font-medium"
              >
                {Object.values(ItemCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex gap-4">
               <div className="flex-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">Price / Day ($)</label>
                 <input 
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="0.00" 
                    className="w-full mt-1 py-2 border-b border-gray-200 focus:outline-none focus:border-primary font-bold text-lg bg-transparent"
                 />
               </div>
               
               {/* Stock Counter */}
               <div className="flex-1">
                 <label className="text-xs font-bold text-gray-500 uppercase">Stock Qty</label>
                 <div className="flex items-center gap-3 mt-1">
                    <button 
                      onClick={() => setStock(Math.max(1, stock - 1))}
                      className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-lg font-bold w-6 text-center">{stock}</span>
                    <button 
                      onClick={() => setStock(stock + 1)}
                      className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                 </div>
               </div>
            </div>
          </div>
          
          <div>
             <label className="text-xs font-bold text-gray-500 uppercase ml-1">Description</label>
             <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your item..."
                rows={4}
                className="w-full mt-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary bg-white text-sm"
             />
          </div>
        </div>

        {/* 3. Condition Report */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3 ml-1">Condition Report</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(conditions).map(key => {
               const isActive = conditions[key as keyof typeof conditions];
               return (
                  <button
                    key={key}
                    onClick={() => toggleCondition(key as keyof typeof conditions)}
                    className={`
                      px-4 py-2 rounded-full text-xs font-bold capitalize transition-all
                      ${isActive 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-white text-gray-500 border border-gray-200'}
                    `}
                  >
                    {key.replace(/([A-Z])/g, ' $1').trim()} {isActive && '✓'}
                  </button>
               );
            })}
          </div>
        </div>

        {/* 4. Instant Rent Toggle */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-900">Instant Rent</h3>
            <p className="text-xs text-gray-500">Auto-approve booking requests</p>
          </div>
          <div 
            onClick={() => setInstantRent(!instantRent)}
            className={`w-12 h-7 rounded-full flex items-center p-1 cursor-pointer transition-colors ${instantRent ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${instantRent ? 'translate-x-5' : ''}`} />
          </div>
        </div>

      </div>
    </div>
  );
};