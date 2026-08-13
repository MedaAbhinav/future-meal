import React from 'react';

export function FoodCardSkeleton() {
  return (
    <div className="card-dark overflow-hidden">
      <div className="skeleton w-full h-44" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="flex items-center justify-between mt-4">
          <div className="skeleton h-5 w-16 rounded" />
          <div className="skeleton h-8 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="card-dark overflow-hidden">
      <div className="skeleton w-full h-52" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-3/5 rounded" />
        <div className="skeleton h-3 w-2/5 rounded" />
        <div className="flex gap-2 mt-3">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-20 rounded-full" />
        </div>
        <div className="flex justify-between mt-2">
          <div className="skeleton h-4 w-20 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="card-dark p-5 space-y-4">
      <div className="flex items-center gap-4">
        <div className="skeleton w-14 h-14 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-1/2 rounded" />
          <div className="skeleton h-3 w-1/3 rounded" />
        </div>
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="skeleton h-px w-full" />
      <div className="flex justify-between">
        <div className="skeleton h-4 w-1/3 rounded" />
        <div className="skeleton h-4 w-1/4 rounded" />
      </div>
    </div>
  );
}
