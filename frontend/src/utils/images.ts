// Reliable Indian food image URLs from Unsplash
// These are production-quality food images with proper fallbacks

export const FOOD_IMAGES = {
  // Biryani & Rice
  chicken_biryani: 'https://images.unsplash.com/photo-1563379091339-03246963d96b?w=800&q=80',
  mutton_biryani: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80',
  veg_biryani: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
  
  // South Indian
  masala_dosa: 'https://images.unsplash.com/photo-1630383249896-42f06efd1494?w=800&q=80',
  idli_sambar: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80',
  vada: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80',
  upma: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800&q=80',
  pongal: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80',

  // North Indian
  butter_chicken: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80',
  paneer_butter_masala: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80',
  dal_tadka: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
  chole_bhature: 'https://images.unsplash.com/photo-1626500154949-a6a4f7dfbcf6?w=800&q=80',
  naan: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80',

  // Hyderabadi / Andhra
  haleem: 'https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?w=800&q=80',
  gongura_chicken: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80',
  
  // Street Food
  pani_puri: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=800&q=80',
  pav_bhaji: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80',
  samosa: 'https://images.unsplash.com/photo-1601050690293-eec506b9e8e6?w=800&q=80',
  vada_pav: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
  momos: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=800&q=80',

  // Desserts
  gulab_jamun: 'https://images.unsplash.com/photo-1594671326618-f7ac7a777060?w=800&q=80',
  kheer: 'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=800&q=80',
  double_ka_meetha: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=800&q=80',

  // Drinks
  lassi: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80',
  chai: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80',
};

export const RESTAURANT_IMAGES = {
  biryani_house: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
  south_indian_cafe: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
  dhaba_style: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
  modern_indian: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=1200&q=80',
  street_food: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1200&q=80',
  mughlai: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80',
};

export const HERO_IMAGES = {
  main: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1600&q=80',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03246963d96b?w=1600&q=80',
  spread: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600&q=80',
};

export const PLACEHOLDER_FOOD = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';
export const PLACEHOLDER_RESTAURANT = 'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=1200&q=80';
export const PLACEHOLDER_AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80';

export function getImageWithFallback(src: string, fallback = PLACEHOLDER_FOOD): string {
  return src || fallback;
}

// Cuisine category icons (emoji-based for reliability)
export const CUISINE_EMOJIS: Record<string, string> = {
  SOUTH_INDIAN: '🥘',
  NORTH_INDIAN: '🫓',
  HYDERABADI: '🍲',
  ANDHRA: '🌶️',
  PUNJABI: '🫕',
  MUGHLAI: '👑',
  STREET_FOOD: '🥙',
  CHINESE: '🥟',
  CONTINENTAL: '🍽️',
  BIRYANI: '🍛',
  SEAFOOD: '🦞',
  DESSERTS: '🍮',
  HEALTHY: '🥗',
  ANY: '🍱',
};

// Cuisine cover images for the landing page
export const CUISINE_COVER_IMAGES: Record<string, string> = {
  SOUTH_INDIAN: 'https://images.unsplash.com/photo-1630383249896-42f06efd1494?w=600&q=80',
  NORTH_INDIAN: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80',
  HYDERABADI: 'https://images.unsplash.com/photo-1563379091339-03246963d96b?w=600&q=80',
  BIRYANI: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80',
  STREET_FOOD: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=600&q=80',
  DESSERTS: 'https://images.unsplash.com/photo-1594671326618-f7ac7a777060?w=600&q=80',
};
