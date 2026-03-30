import { ItemCategory } from '../types';

export interface PhotoStep {
  id: string;
  label: string;
  description: string;
  overlayType: 'vehicle_front' | 'vehicle_side' | 'plate' | 'gadget_front' | 'serial' | 'generic';
}

export const PHOTO_GUIDES: Record<ItemCategory, PhotoStep[]> = {
  [ItemCategory.VEHICLE]: [
    { id: 'v_front', label: 'Front View', description: 'Capture the entire front of the vehicle.', overlayType: 'vehicle_front' },
    { id: 'v_left', label: 'Left Side', description: 'Full left side profile.', overlayType: 'vehicle_side' },
    { id: 'v_right', label: 'Right Side', description: 'Full right side profile.', overlayType: 'vehicle_side' },
    { id: 'v_back', label: 'Back View', description: 'Rear of the vehicle.', overlayType: 'vehicle_front' },
    { id: 'v_plate', label: 'License Plate', description: 'Close-up, clear text.', overlayType: 'plate' },
    { id: 'v_odo', label: 'Odometer', description: 'Current mileage dashboard.', overlayType: 'generic' },
  ],
  [ItemCategory.ELECTRONICS]: [
    { id: 'e_front', label: 'Front / Screen', description: 'Screen on (if applicable).', overlayType: 'gadget_front' },
    { id: 'e_back', label: 'Back / Body', description: 'Rear casing check.', overlayType: 'gadget_front' },
    { id: 'e_serial', label: 'Serial Number', description: 'Sticker or engraved text.', overlayType: 'serial' },
    { id: 'e_acc', label: 'Accessories', description: 'Chargers, cables, lens caps.', overlayType: 'generic' },
  ],
  [ItemCategory.FASHION]: [
    { id: 'f_front', label: 'Front', description: 'Full item in good lighting.', overlayType: 'generic' },
    { id: 'f_back', label: 'Back', description: 'Rear view.', overlayType: 'generic' },
    { id: 'f_tag', label: 'Brand Tag', description: 'Close up of the label.', overlayType: 'serial' },
  ],
  [ItemCategory.TOOLS]: [
    { id: 't_main', label: 'Main Tool', description: 'Full view of the tool.', overlayType: 'generic' },
    { id: 't_model', label: 'Model/Specs', description: 'Technical specification label.', overlayType: 'serial' },
  ],
  [ItemCategory.OTHER]: [
    { id: 'o_main', label: 'Main View', description: 'Clear photo of the item.', overlayType: 'generic' },
  ]
};

// SVG Paths for Ghost Overlays
export const GHOST_PATHS = {
  vehicle_front: "M4 14c0-2 1-4 4-4h8c3 0 4 2 4 4v6H4v-6z M2 18h20", // Simple Car Front
  vehicle_side: "M2 12c0-2 2-5 5-5h10l3 3v6H2v-4z", // Simple Car Side
  plate: "M4 10h16v4H4z", // Rectangle
  gadget_front: "M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z", // Phone/Tablet shape
  serial: "M4 10h16v4H4z M5 12h14", // Barcode hint
  generic: "M4 4h16v16H4z M12 8v8 M8 12h8" // Crosshair frame
};