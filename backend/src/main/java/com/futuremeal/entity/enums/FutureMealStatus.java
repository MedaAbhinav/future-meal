package com.futuremeal.entity.enums;

public enum FutureMealStatus {
    PLANNED,        // Created, engine watching
    MATCH_FOUND,    // Engine found a good match, awaiting time
    READY,          // Time arrived, recommendation ready to order
    ORDERED,        // User ordered from recommendation
    POSTPONED,      // User postponed
    CANCELLED,      // User cancelled
    EXPIRED         // Time passed without ordering
}
