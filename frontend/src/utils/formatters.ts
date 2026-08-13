import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { OrderStatus, FutureMealStatus, DietaryType, SpiceLevel, CuisineType } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string, formatStr = 'dd MMM yyyy'): string {
  try {
    return format(parseISO(dateString), formatStr);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), 'dd MMM yyyy, hh:mm a');
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
}

export function formatDeliveryTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  ORDER_PLACED: 'Order Placed',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready for Pickup',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const FUTUREMEAL_STATUS_LABELS: Record<FutureMealStatus, string> = {
  PLANNED: 'Watching',
  MATCH_FOUND: 'Match Found',
  READY: 'Ready to Order',
  ORDERED: 'Ordered',
  POSTPONED: 'Postponed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
};

export const DIETARY_TYPE_LABELS: Record<DietaryType, string> = {
  VEG: 'Veg',
  NON_VEG: 'Non-Veg',
  EGG: 'Egg',
  VEGAN: 'Vegan',
  JAIN: 'Jain',
};

export const SPICE_LEVEL_LABELS: Record<SpiceLevel, string> = {
  MILD: 'Mild',
  MEDIUM: 'Medium',
  SPICY: 'Spicy',
  EXTRA_SPICY: 'Extra Spicy',
};

export const CUISINE_LABELS: Record<CuisineType, string> = {
  SOUTH_INDIAN: 'South Indian',
  NORTH_INDIAN: 'North Indian',
  HYDERABADI: 'Hyderabadi',
  ANDHRA: 'Andhra',
  PUNJABI: 'Punjabi',
  MUGHLAI: 'Mughlai',
  STREET_FOOD: 'Street Food',
  CHINESE: 'Chinese',
  CONTINENTAL: 'Continental',
  BIRYANI: 'Biryani',
  SEAFOOD: 'Seafood',
  DESSERTS: 'Desserts',
  HEALTHY: 'Healthy',
  ANY: 'Any Cuisine',
};

export function getDiscountPercentage(originalPrice: number, currentPrice: number): number {
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '…';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}
