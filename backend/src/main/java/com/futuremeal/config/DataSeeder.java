package com.futuremeal.config;

import com.futuremeal.entity.*;
import com.futuremeal.entity.enums.*;
import com.futuremeal.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Seeds demo data on startup.
 * Enabled only when app.seed.enabled=true (default in dev).
 * Demo accounts: customer@futuremeal.in, owner@futuremeal.in,
 *                delivery@futuremeal.in, admin@futuremeal.in
 * All passwords: Demo@123
 */
@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final FoodItemRepository foodItemRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded — skipping.");
            return;
        }
        log.info("Seeding demo data...");
        seedUsers();
        seedRestaurantsAndFoods();
        log.info("Demo data seeded successfully.");
    }

    private void seedUsers() {
        String pwd = passwordEncoder.encode("Demo@123");

        User admin = userRepository.save(User.builder()
                .name("Admin User").email("admin@futuremeal.in").password(pwd)
                .phone("9000000001").role(UserRole.ADMIN).isActive(true).build());

        User customer = userRepository.save(User.builder()
                .name("Arjun Sharma").email("customer@futuremeal.in").password(pwd)
                .phone("9000000002").role(UserRole.CUSTOMER)
                .dietaryPreference(DietaryPreference.NON_VEG)
                .spicePreference(SpiceLevel.MEDIUM).isActive(true).build());

        User owner = userRepository.save(User.builder()
                .name("Priya Rangan").email("owner@futuremeal.in").password(pwd)
                .phone("9000000003").role(UserRole.RESTAURANT_OWNER).isActive(true).build());

        userRepository.save(User.builder()
                .name("Ravi Kumar").email("delivery@futuremeal.in").password(pwd)
                .phone("9000000004").role(UserRole.DELIVERY_PARTNER).isActive(true).build());

        // Add addresses for customer
        addressRepository.save(Address.builder()
                .user(customer).label("Home").street("Flat 4B, Kaveri Apartments")
                .area("Banjara Hills").city("Hyderabad").state("Telangana")
                .pincode("500034").isDefault(true).build());

        addressRepository.save(Address.builder()
                .user(customer).label("Work").street("Level 3, Tech Hub")
                .area("HITEC City").city("Hyderabad").state("Telangana")
                .pincode("500081").isDefault(false).build());

        log.info("Users seeded: admin, customer, owner, delivery partner");
    }

    private void seedRestaurantsAndFoods() {
        User owner = userRepository.findByEmail("owner@futuremeal.in").orElseThrow();

        // ── Restaurant 1: Spice Route Biryani ─────────────────────────────────
        Restaurant spiceRoute = restaurantRepository.save(Restaurant.builder()
                .name("Spice Route Biryani")
                .description("Authentic Hyderabadi dum biryani since 1985. Award-winning recipes.")
                .coverImage("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80")
                .logo("https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=100&q=80")
                .cuisines(List.of("Hyderabadi", "Biryani", "Mughlai"))
                .rating(4.6).totalReviews(2841)
                .deliveryTime(28).deliveryFee(30).minimumOrder(149)
                .street("Road No 12").area("Banjara Hills").city("Hyderabad")
                .state("Telangana").pincode("500034")
                .isOpen(true).status(RestaurantStatus.ACTIVE)
                .offers(List.of("20% off orders above ₹399", "Free delivery on first order"))
                .tags(List.of("bestseller", "popular"))
                .owner(owner).build());

        foodItemRepository.saveAll(List.of(
                food("Chicken Dum Biryani",
                     "Slow-cooked aromatic Hyderabadi biryani with tender chicken, saffron rice, and crispy fried onions.",
                     "https://images.unsplash.com/photo-1563379091339-03246963d96b?w=800&q=80",
                     229.0, 299.0, "Biryani", spiceRoute, DietaryType.NON_VEG, SpiceLevel.MEDIUM, 4.7, 1243, 25, true, true),
                food("Mutton Dum Biryani",
                     "Royal Hyderabadi mutton biryani, slow-cooked with whole spices and fragrant basmati.",
                     "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80",
                     299.0, null, "Biryani", spiceRoute, DietaryType.NON_VEG, SpiceLevel.SPICY, 4.8, 892, 35, true, false),
                food("Veg Biryani",
                     "Fragrant basmati rice cooked with seasonal vegetables and whole spices.",
                     "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80",
                     179.0, null, "Biryani", spiceRoute, DietaryType.VEG, SpiceLevel.MEDIUM, 4.3, 543, 22, true, false),
                food("Haleem",
                     "Slow-cooked mutton with wheat, lentils, and aromatic spices. A Hyderabadi delicacy.",
                     "https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?w=800&q=80",
                     199.0, null, "Starters", spiceRoute, DietaryType.NON_VEG, SpiceLevel.SPICY, 4.5, 671, 15, true, false),
                food("Mirchi Ka Salan",
                     "Tangy peanut and coconut-based curry with green chillies, a classic biryani accompaniment.",
                     "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
                     79.0, null, "Sides", spiceRoute, DietaryType.VEG, SpiceLevel.SPICY, 4.4, 312, 10, true, false)
        ));

        // ── Restaurant 2: Annapoorna South Indian ─────────────────────────────
        Restaurant annapoorna = restaurantRepository.save(Restaurant.builder()
                .name("Annapoorna South Indian")
                .description("Pure vegetarian South Indian comfort food. Crispy dosas, soft idlis, authentic sambar.")
                .coverImage("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80")
                .logo("https://images.unsplash.com/photo-1630383249896-42f06efd1494?w=100&q=80")
                .cuisines(List.of("South Indian", "Vegetarian", "Healthy"))
                .rating(4.4).totalReviews(1567)
                .deliveryTime(20).deliveryFee(20).minimumOrder(99)
                .street("100 Feet Road").area("Indiranagar").city("Bengaluru")
                .state("Karnataka").pincode("560038")
                .isOpen(true).status(RestaurantStatus.ACTIVE)
                .offers(List.of("10% off on all orders", "Free sambar with any dosa"))
                .tags(List.of("pure-veg", "healthy"))
                .owner(owner).build());

        foodItemRepository.saveAll(List.of(
                food("Masala Dosa",
                     "Crispy golden dosa with spiced potato filling. Served with coconut chutney and sambar.",
                     "https://images.unsplash.com/photo-1630383249896-42f06efd1494?w=800&q=80",
                     89.0, null, "Dosas", annapoorna, DietaryType.VEG, SpiceLevel.MILD, 4.5, 867, 15, true, true),
                food("Idli Sambar (4 Pcs)",
                     "Soft steamed rice cakes served with piping hot sambar and chutneys.",
                     "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
                     69.0, null, "Breakfast", annapoorna, DietaryType.VEG, SpiceLevel.MILD, 4.4, 723, 12, true, false),
                food("Medu Vada (2 Pcs)",
                     "Crispy lentil doughnuts served with coconut chutney and sambar.",
                     "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80",
                     59.0, null, "Breakfast", annapoorna, DietaryType.VEG, SpiceLevel.MILD, 4.3, 512, 10, true, false),
                food("Pesarattu",
                     "Andhra-style green moong dal dosa with upma stuffing and ginger chutney.",
                     "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800&q=80",
                     79.0, null, "Dosas", annapoorna, DietaryType.VEG, SpiceLevel.MILD, 4.2, 298, 18, true, false),
                food("Pongal",
                     "Creamy rice and moong dal cooked with ghee, cashews, and black pepper.",
                     "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80",
                     79.0, null, "Breakfast", annapoorna, DietaryType.VEG, SpiceLevel.MILD, 4.4, 445, 15, true, false),
                food("Filter Coffee",
                     "Freshly brewed South Indian filter coffee with frothy milk.",
                     "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80",
                     39.0, null, "Drinks", annapoorna, DietaryType.VEG, SpiceLevel.MILD, 4.6, 1102, 5, false, true)
        ));

        // ── Restaurant 3: Punjabi Tadka ────────────────────────────────────────
        Restaurant punjabi = restaurantRepository.save(Restaurant.builder()
                .name("Punjabi Tadka")
                .description("Rich North Indian curries, freshly baked naans, and classic Punjabi flavors.")
                .coverImage("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80")
                .logo("https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=100&q=80")
                .cuisines(List.of("North Indian", "Punjabi", "Mughlai"))
                .rating(4.3).totalReviews(983)
                .deliveryTime(35).deliveryFee(40).minimumOrder(199)
                .street("Lane 7, Koregaon Park").area("Koregaon Park").city("Pune")
                .state("Maharashtra").pincode("411001")
                .isOpen(true).status(RestaurantStatus.ACTIVE)
                .offers(List.of("Buy 1 Get 1 on Butter Naan"))
                .tags(List.of("family-friendly"))
                .owner(owner).build());

        foodItemRepository.saveAll(List.of(
                food("Butter Chicken",
                     "Tender chicken in rich tomato-cream sauce, slow-cooked with aromatic spices.",
                     "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80",
                     249.0, 299.0, "Main Course", punjabi, DietaryType.NON_VEG, SpiceLevel.MEDIUM, 4.6, 743, 20, true, true),
                food("Paneer Butter Masala",
                     "Soft paneer cubes in a rich, creamy tomato-cashew gravy.",
                     "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80",
                     199.0, null, "Main Course", punjabi, DietaryType.VEG, SpiceLevel.MILD, 4.5, 612, 18, true, false),
                food("Dal Makhani",
                     "Slow-cooked black lentils with cream and butter. A Punjabi classic.",
                     "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
                     179.0, null, "Main Course", punjabi, DietaryType.VEG, SpiceLevel.MILD, 4.4, 521, 15, true, false),
                food("Chole Bhature",
                     "Spiced chickpeas with fluffy deep-fried bread. The ultimate Punjabi breakfast.",
                     "https://images.unsplash.com/photo-1626500154949-a6a4f7dfbcf6?w=800&q=80",
                     149.0, null, "Main Course", punjabi, DietaryType.VEG, SpiceLevel.SPICY, 4.3, 432, 20, true, false),
                food("Butter Naan",
                     "Freshly baked soft naan brushed generously with butter.",
                     "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80",
                     49.0, null, "Breads", punjabi, DietaryType.VEG, SpiceLevel.MILD, 4.5, 891, 8, false, false)
        ));

        // ── Restaurant 4: Chaat Corner ─────────────────────────────────────────
        Restaurant chaat = restaurantRepository.save(Restaurant.builder()
                .name("Chaat Corner")
                .description("Delhi-style street food. Pani Puri, Pav Bhaji, Samosa Chaat and more.")
                .coverImage("https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1200&q=80")
                .logo("https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=100&q=80")
                .cuisines(List.of("Street Food", "Chaat", "Snacks"))
                .rating(4.5).totalReviews(2103)
                .deliveryTime(18).deliveryFee(15).minimumOrder(79)
                .street("Inner Circle").area("Connaught Place").city("Delhi")
                .state("Delhi").pincode("110001")
                .isOpen(true).status(RestaurantStatus.ACTIVE)
                .offers(List.of("Free Masala Papad on every order"))
                .tags(List.of("budget", "quick"))
                .owner(owner).build());

        foodItemRepository.saveAll(List.of(
                food("Pani Puri (8 Pcs)",
                     "Crispy hollow puris filled with spiced tamarind water, potato, and chickpeas.",
                     "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=800&q=80",
                     59.0, null, "Street Food", chaat, DietaryType.VEG, SpiceLevel.SPICY, 4.4, 1102, 10, true, true),
                food("Pav Bhaji",
                     "Spiced mashed vegetables served with buttered pav and lemon wedge.",
                     "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80",
                     99.0, null, "Street Food", chaat, DietaryType.VEG, SpiceLevel.MEDIUM, 4.5, 872, 15, true, false),
                food("Samosa (2 Pcs)",
                     "Crispy pastry stuffed with spiced potato and peas. Served with chutneys.",
                     "https://images.unsplash.com/photo-1601050690293-eec506b9e8e6?w=800&q=80",
                     49.0, null, "Snacks", chaat, DietaryType.VEG, SpiceLevel.MEDIUM, 4.3, 934, 12, true, false),
                food("Vada Pav",
                     "Mumbai's favourite street snack — spiced potato vada in a soft bun.",
                     "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
                     39.0, null, "Street Food", chaat, DietaryType.VEG, SpiceLevel.SPICY, 4.2, 765, 10, true, false),
                food("Momos (6 Pcs)",
                     "Steamed dumplings with vegetable filling. Served with spicy dip.",
                     "https://images.unsplash.com/photo-1562802378-063ec186a863?w=800&q=80",
                     89.0, null, "Snacks", chaat, DietaryType.VEG, SpiceLevel.MEDIUM, 4.4, 654, 15, true, false)
        ));

        log.info("Restaurants and foods seeded: {}, {}, {}, {}",
                spiceRoute.getName(), annapoorna.getName(), punjabi.getName(), chaat.getName());
    }

    private FoodItem food(String name, String desc, String image,
                           double price, Double originalPrice, String category,
                           Restaurant restaurant, DietaryType diet, SpiceLevel spice,
                           double rating, int reviews, int prepTime,
                           boolean bestseller, boolean recommended) {
        return FoodItem.builder()
                .name(name).description(desc).image(image)
                .price(price).originalPrice(originalPrice)
                .category(category).restaurant(restaurant)
                .dietaryType(diet).spiceLevel(spice)
                .rating(rating).totalReviews(reviews)
                .preparationTime(prepTime)
                .isAvailable(true)
                .isBestseller(bestseller)
                .isRecommended(recommended)
                .orderCount(reviews / 3) // approximate
                .build();
    }
}
