import React, { useState, useRef } from 'react';
import { ItemCategory, Profile } from '../types';

interface LenderListingScreenProps {
  currentUser: Profile;
  onCancel: () => void;
  onSuccess: () => void;
}

export const LenderListingScreen: React.FC<LenderListingScreenProps> = ({ currentUser, onCancel, onSuccess }) => {
  const [step, setStep] = useState<1 | 2>(1); // 1: Details, 2: Availability
  const [uploading, setUploading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showPhotoGuide, setShowPhotoGuide] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory>(ItemCategory.OTHER);
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file as Blob));
      setImages(prev => [...prev, ...newImages].slice(0, 5));
    }
  };

  const toggleDateBlock = (dateStr: string) => {
    const newBlocked = new Set(blockedDates);
    if (newBlocked.has(dateStr)) {
      newBlocked.delete(dateStr);
    } else {
      newBlocked.add(dateStr);
    }
    setBlockedDates(newBlocked);
  };

  const handleNext = () => {
    if (!title || !price || !category) return alert("Please fill in the required fields.");
    setStep(2);
  };

  const handleSubmit = async () => {
    // 1. Security Check: Verification Status
    if (!currentUser.is_verified) {
      setShowVerifyModal(true);
      return;
    }

    setUploading(true);

    try {
      // Logic to insert into Supabase would go here
      // const blockedArray = Array.from(blockedDates);
      // await supabase.from('items').insert({ ... })
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert("Item listed successfully!");
      onSuccess();
    } catch (e) {
      alert("Error listing item");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-background min-h-full flex flex-col relative z-50 max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto border-x border-gray-100 shadow-2xl">
      
      {/* Verify Modal Overlay */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Identity Verification Required</h3>
            <p className="text-gray-500 text-center text-sm mb-6">
              To ensure safety for everyone, you must verify your Government ID before listing items.
            </p>
            <button 
              onClick={() => { setShowVerifyModal(false); onCancel(); /* Navigate to profile */ }}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl mb-3 shadow-lg shadow-indigo-200"
            >
              Verify Now
            </button>
            <button 
              onClick={() => setShowVerifyModal(false)}
              className="w-full py-3 text-gray-500 font-bold text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white px-4 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10 border-b border-gray-100">
        <button onClick={step === 1 ? onCancel : () => setStep(1)} className="text-gray-500 font-medium">
          {step === 1 ? 'Cancel' : 'Back'}
        </button>
        <h1 className="font-bold text-lg">List Item ({step}/2)</h1>
        {step === 2 ? (
           <button 
             onClick={handleSubmit} 
             disabled={uploading}
             className={`font-bold ${uploading ? 'text-gray-300' : 'text-primary'}`}
           >
             {uploading ? '...' : 'Publish'}
           </button>
        ) : (
          <button onClick={handleNext} className="font-bold text-primary">Next</button>
        )}
      </div>

      <div className="p-4 space-y-6 pb-20 overflow-y-auto">
        
        {step === 1 && (
          <>
             {/* Photo Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-sm font-bold text-gray-800 ml-1">Photos</h3>
                 {showPhotoGuide && (
                   <div className="bg-blue-50 text-blue-800 text-[10px] px-3 py-1.5 rounded-full font-bold flex items-center gap-2">
                     <span>💡 Tip: Capture any scratches clearly!</span>
                     <button onClick={() => setShowPhotoGuide(false)} className="opacity-50 hover:opacity-100">✕</button>
                   </div>
                 )}
              </div>
              
              <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 shrink-0 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer active:bg-gray-100 transition-colors"
                >
                  <span className="text-2xl text-gray-400">📷</span>
                  <span className="text-[10px] font-bold text-gray-400 mt-1">Add Photo</span>
                </div>
                {images.map((img, idx) => (
                  <div key={idx} className="w-24 h-24 shrink-0 relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <img src={img} alt="preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs backdrop-blur-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImagePick} />
            </div>

            {/* Form Fields */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Item Title</label>
                <input 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. GoPro Hero 9 Black" 
                  className="w-full mt-1 py-2 border-b border-gray-100 focus:outline-none focus:border-primary font-bold text-gray-900 bg-transparent placeholder:font-normal"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
                    <select 
                      value={category}
                      onChange={e => setCategory(e.target.value as ItemCategory)}
                      className="w-full mt-1 py-2 border-b border-gray-100 focus:outline-none bg-transparent font-medium text-sm"
                    >
                      {Object.values(ItemCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Daily Price ($)</label>
                    <input 
                        type="number"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="0.00" 
                        className="w-full mt-1 py-2 border-b border-gray-100 focus:outline-none focus:border-primary font-bold text-gray-900 bg-transparent"
                    />
                 </div>
              </div>

              <div>
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
                 <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe condition, accessories included..."
                    rows={3}
                    className="w-full mt-2 p-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                 />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="space-y-4">
             <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 text-sm mb-1">📅 Block Personal Usage</h3>
                <p className="text-xs text-blue-700 leading-relaxed">
                   Select the dates when you need this item for yourself. These dates will be shown as "Unavailable" to renters.
                </p>
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden pb-4">
                <SimpleWebCalendar blockedDates={blockedDates} onToggleDate={toggleDateBlock} />
             </div>

             <div className="flex justify-between px-2">
                 <span className="text-xs font-bold text-gray-400 uppercase">Blocked Days</span>
                 <span className="text-sm font-bold text-red-500">{blockedDates.size} days</span>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

// --- Custom Web Calendar Component ---
// Replaces react-native-calendars for web environment

const SimpleWebCalendar = ({ blockedDates, onToggleDate }: { blockedDates: Set<string>, onToggleDate: (d: string) => void }) => {
    const [viewDate, setViewDate] = useState(new Date());

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const monthName = viewDate.toLocaleString('default', { month: 'long' });

    const handlePrev = () => setViewDate(new Date(year, month - 1, 1));
    const handleNext = () => setViewDate(new Date(year, month + 1, 1));

    return (
        <div>
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
                <button onClick={handlePrev} className="p-2 hover:bg-white rounded-full">◀</button>
                <span className="font-bold text-gray-800">{monthName} {year}</span>
                <button onClick={handleNext} className="p-2 hover:bg-white rounded-full">▶</button>
            </div>
            
            <div className="grid grid-cols-7 text-center py-2 bg-gray-50/50">
                {['S','M','T','W','T','F','S'].map((d, idx) => (
                    <span key={`${d}-${idx}`} className="text-[10px] font-bold text-gray-400">{d}</span>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 p-2">
                {Array.from({length: firstDay}).map((_, i) => <div key={`empty-${i}`} />)}
                
                {Array.from({length: daysInMonth}).map((_, i) => {
                    const day = i + 1;
                    const dateStr = new Date(year, month, day).toISOString().split('T')[0]; // Simple YYYY-MM-DD
                    const isBlocked = blockedDates.has(dateStr);
                    const isToday = new Date().toISOString().split('T')[0] === dateStr;

                    return (
                        <div 
                            key={day}
                            onClick={() => onToggleDate(dateStr)}
                            className={`
                                aspect-square flex items-center justify-center rounded-lg cursor-pointer text-sm font-medium transition-all
                                ${isBlocked 
                                    ? 'bg-red-500 text-white shadow-md scale-95' 
                                    : 'text-gray-700 hover:bg-gray-100'}
                                ${isToday && !isBlocked ? 'border border-primary text-primary font-bold' : ''}
                            `}
                        >
                            {day}
                            {isBlocked && <div className="absolute w-full h-full flex items-center justify-center text-[10px] opacity-20">🚫</div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
