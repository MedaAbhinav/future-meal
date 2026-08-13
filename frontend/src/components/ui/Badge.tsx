import React from 'react';
import { OrderStatus, FutureMealStatus, DietaryType } from '../../types';
import { ORDER_STATUS_LABELS, FUTUREMEAL_STATUS_LABELS } from '../../utils/formatters';

export function DietaryBadge({ type }: { type: DietaryType }) {
  const isVeg = type === 'VEG' || type === 'VEGAN' || type === 'JAIN';
  return (
    <span className={isVeg ? 'diet-veg' : 'diet-nonveg'} title={type} />
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const chipClass =
    status === 'DELIVERED'         ? 'chip chip-green' :
    status === 'CANCELLED'         ? 'chip chip-red'   :
    status === 'OUT_FOR_DELIVERY'  ? 'chip chip-ember' :
    status === 'PREPARING'         ? 'chip chip-gold'  :
    'chip chip-dim';
  return <span className={chipClass}>{ORDER_STATUS_LABELS[status]}</span>;
}

export function FutureMealStatusBadge({ status }: { status: FutureMealStatus }) {
  const chipClass =
    status === 'READY'        ? 'chip chip-green' :
    status === 'MATCH_FOUND'  ? 'chip chip-ember' :
    status === 'ORDERED'      ? 'chip chip-gold'  :
    status === 'CANCELLED' || status === 'EXPIRED' ? 'chip chip-red' :
    'chip chip-dim';
  return <span className={chipClass}>{FUTUREMEAL_STATUS_LABELS[status]}</span>;
}

export function DiscountBadge({ originalPrice, currentPrice }: { originalPrice: number; currentPrice: number }) {
  const pct = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  if (pct <= 0) return null;
  return <span className="chip chip-green">{pct}% off</span>;
}
