// ============================================
// CORE TYPES
// ============================================

export type UserRole = 'CUSTOMER' | 'RESTAURANT_OWNER' | 'ADMIN' | 'DELIVERY_PARTNER';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profilePicture?: string;
  dietaryPreference?: DietaryPreference;
  spicePreference?: SpiceLevel;
  budgetPreference?: BudgetPreference;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: UserRole;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// ============================================
// ADDRESS
// ============================================

export interface Address {
  id: number;
  label: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

// ============================================
// RESTAURANT
// ============================================

export type RestaurantStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  coverImage: string;
  logo: string;
  cuisines: string[];
  rating: number;
  totalReviews: number;
  deliveryTime: number;
  deliveryFee: number;
  minimumOrder: number;
  address: RestaurantAddress;
  isOpen: boolean;
  status: RestaurantStatus;
  offers: string[];
  tags: string[];
  ownerId: number;
}

export interface RestaurantAddress {
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
}

// ============================================
// FOOD
// ============================================

export type DietaryType = 'VEG' | 'NON_VEG' | 'EGG' | 'VEGAN' | 'JAIN';
export type SpiceLevel = 'MILD' | 'MEDIUM' | 'SPICY' | 'EXTRA_SPICY';
export type DietaryPreference = 'VEG' | 'NON_VEG' | 'VEGAN' | 'JAIN';
export type BudgetPreference = 'BUDGET' | 'MODERATE' | 'PREMIUM';

export interface FoodCategory {
  id: number;
  name: string;
  restaurantId: number;
  sortOrder: number;
}

export interface FoodItem {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryId: number;
  restaurantId: number;
  restaurantName: string;
  dietaryType: DietaryType;
  spiceLevel: SpiceLevel;
  rating: number;
  totalReviews: number;
  preparationTime: number;
  isAvailable: boolean;
  isBestseller: boolean;
  isRecommended: boolean;
  allergens?: string[];
  nutritionInfo?: NutritionInfo;
  tags?: string[];
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// ============================================
// CART
// ============================================

export interface CartItem {
  id: number;
  foodItem: FoodItem;
  quantity: number;
  specialInstructions?: string;
}

export interface Cart {
  id: number;
  userId: number;
  restaurantId: number;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  discount: number;
  total: number;
  couponCode?: string;
}

// ============================================
// ORDER
// ============================================

export type OrderStatus =
  | 'ORDER_PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'UPI' | 'CARD' | 'CASH_ON_DELIVERY' | 'NET_BANKING';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  restaurantId: number;
  restaurantName: string;
  restaurantLogo: string;
  items: OrderItem[];
  deliveryAddress: Address;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  discount: number;
  total: number;
  specialInstructions?: string;
  estimatedDeliveryTime: number;
  deliveryPartnerId?: number;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  placedAt: string;
  confirmedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface OrderItem {
  id: number;
  foodItemId: number;
  foodItemName: string;
  foodItemImage: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
  subtotal: number;
}

// ============================================
// FUTUREMEAL
// ============================================

export type FutureMealStatus =
  | 'PLANNED'
  | 'MATCH_FOUND'
  | 'READY'
  | 'ORDERED'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'EXPIRED';

export type CuisineType =
  | 'SOUTH_INDIAN'
  | 'NORTH_INDIAN'
  | 'HYDERABADI'
  | 'ANDHRA'
  | 'PUNJABI'
  | 'MUGHLAI'
  | 'STREET_FOOD'
  | 'CHINESE'
  | 'CONTINENTAL'
  | 'BIRYANI'
  | 'SEAFOOD'
  | 'DESSERTS'
  | 'HEALTHY'
  | 'ANY';

export interface FutureMeal {
  id: number;
  userId: number;
  title: string;
  description: string;
  plannedDate: string;
  plannedTime: string;
  maxBudget: number;
  cuisine: CuisineType;
  dietaryPreference: DietaryPreference;
  spicePreference: SpiceLevel;
  preferredRestaurantId?: number;
  preferredRestaurantName?: string;
  deliveryAddress: Address;
  specialConditions?: string;
  status: FutureMealStatus;
  recommendedFoodItem?: FoodItem;
  recommendedRestaurant?: Restaurant;
  recommendationScore?: number;
  recommendationReason?: string;
  isAIRecommended: boolean;
  createdAt: string;
  updatedAt: string;
  orderId?: number;
}

export interface FutureMealRequest {
  description: string;
  plannedDate: string;
  plannedTime: string;
  maxBudget: number;
  cuisine: CuisineType;
  dietaryPreference: DietaryPreference;
  spicePreference: SpiceLevel;
  preferredRestaurantId?: number;
  deliveryAddressId: number;
  specialConditions?: string;
}

// ============================================
// REVIEW
// ============================================

export interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  restaurantId: number;
  orderId: number;
  rating: number;
  comment: string;
  foodRating?: number;
  deliveryRating?: number;
  createdAt: string;
  helpfulCount: number;
}

// ============================================
// API RESPONSE WRAPPER
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ============================================
// SEARCH & FILTERS
// ============================================

export interface RestaurantFilter {
  cuisine?: string;
  rating?: number;
  deliveryTime?: number;
  isVeg?: boolean;
  maxDeliveryFee?: number;
  sortBy?: 'RATING' | 'DELIVERY_TIME' | 'DELIVERY_FEE' | 'DISTANCE';
  page?: number;
  size?: number;
}

export interface SearchResult {
  restaurants: Restaurant[];
  foods: FoodItem[];
  query: string;
}

// ============================================
// NOTIFICATION
// ============================================

export type NotificationType = 'ORDER_UPDATE' | 'FUTUREMEAL_MATCH' | 'PROMOTION' | 'SYSTEM';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, string>;
  createdAt: string;
}

// ============================================
// DELIVERY PARTNER
// ============================================

export type DeliveryStatus = 'AVAILABLE' | 'ON_DELIVERY' | 'OFFLINE';

export interface DeliveryPartner {
  id: number;
  userId: number;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: string;
  status: DeliveryStatus;
  rating: number;
  totalDeliveries: number;
  currentLatitude?: number;
  currentLongitude?: number;
}

// ============================================
// ADMIN STATS
// ============================================

export interface AdminStats {
  totalUsers: number;
  totalRestaurants: number;
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  futureMealsCreated: number;
  futureMealsConverted: number;
  todayOrders: number;
  todayRevenue: number;
}

export interface RestaurantStats {
  todayOrders: number;
  todayRevenue: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  popularItems: PopularItem[];
  activeOrders: number;
}

export interface PopularItem {
  foodItemId: number;
  foodItemName: string;
  foodItemImage: string;
  orderCount: number;
  revenue: number;
}
