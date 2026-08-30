import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Leaf, RefreshCw } from "lucide-react";
import { Restaurant } from "../types";
import { restaurantService } from "../services/restaurantService";
import { RestaurantCard } from "../components/restaurant/RestaurantCard";
import { RestaurantCardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { AmbientBackground } from "../components/ui/AmbientBackground";
import { extractError } from "../services/api";
import { CUISINE_CATEGORIES } from "../utils/seedData";

const SORT_OPTIONS = [
  { value: "RATING",        label: "Top Rated"       },
  { value: "DELIVERY_TIME", label: "Fastest"          },
  { value: "DELIVERY_FEE",  label: "Low Delivery Fee" },
];

export default function RestaurantsPage() {
  const [searchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading]         = useState(true);
  const [apiError, setApiError]       = useState<string | null>(null);
  const [search, setSearch]           = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get("cuisine") || "");
  const [sortBy, setSortBy]           = useState("RATING");
  const [vegOnly, setVegOnly]         = useState(false);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await restaurantService.getRestaurants({
        cuisine: selectedCuisine || undefined,
        sortBy,
        isVeg: vegOnly || undefined,
        size: 50,
      });
      setRestaurants(data.content || []);
    } catch (err) {
      setApiError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [selectedCuisine, sortBy, vegOnly]);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  const filtered = restaurants.filter(r =>
    !search ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.cuisines.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  const clearFilters = () => { setSelectedCuisine(""); setSearch(""); setVegOnly(false); };

  return (
    <div className="min-h-screen pt-20" style={{ background: "#0e0c0a" }}>
      <AmbientBackground variant="warm" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-16">

        {/* Header */}
        <div className="py-10">
          <p className="text-label mb-3" style={{ color: "#e8892a" }}>EXPLORE</p>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: "clamp(2rem,5vw,3.5rem)", color: "#f3ede0", fontWeight: 700 }}>
            Find your restaurant.
          </h1>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#625a50" }} />
          <input
            className="input-dark pl-11"
            placeholder="Search restaurants or cuisines\u2026"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button onClick={() => setSelectedCuisine("")} className={"chip " + (!selectedCuisine ? "chip-ember" : "chip-dim")}>All</button>
          {CUISINE_CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setSelectedCuisine(selectedCuisine === c.id ? "" : c.id)}
              className={"chip " + (selectedCuisine === c.id ? "chip-ember" : "chip-dim")}>
              {c.emoji} {c.name}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="input-dark py-2 px-3 text-sm" style={{ width: "auto", background: "#1c1814", fontSize: "0.8125rem" }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: "#1c1814" }}>{o.label}</option>)}
            </select>
            <button onClick={() => setVegOnly(!vegOnly)} className={"chip flex items-center gap-1.5 " + (vegOnly ? "chip-green" : "chip-dim")}>
              <Leaf className="w-3 h-3" /> Veg
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <RestaurantCardSkeleton key={i} />)}
          </div>
        ) : apiError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-5">⚠️</div>
            <h3 style={{ fontFamily: '"Playfair Display",serif', color: "#f3ede0", fontSize: "1.4rem", marginBottom: "0.75rem" }}>
              Couldn't load restaurants
            </h3>
            <p style={{ color: "#625a50", fontFamily: '"DM Sans",sans-serif', marginBottom: "1.5rem", maxWidth: 360 }}>
              {apiError.includes("Network") || apiError.includes("timeout")
                ? "Make sure the backend server is running on port 8080."
                : apiError}
            </p>
            <button onClick={fetchRestaurants} className="btn-ember flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            emoji="🍽️"
            title="No restaurants found"
            description={search || selectedCuisine || vegOnly
              ? "Try adjusting your filters or search for something else."
              : "No restaurants are available right now. Check back soon."}
            ctaLabel={search || selectedCuisine || vegOnly ? "Clear filters" : undefined}
            onCta={search || selectedCuisine || vegOnly ? clearFilters : undefined}
          />
        ) : (
          <>
            <p className="text-label mb-5" style={{ color: "#4f4840" }}>{filtered.length} RESTAURANTS</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
