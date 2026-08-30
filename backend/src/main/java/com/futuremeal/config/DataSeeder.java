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

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository       userRepository;
    private final RestaurantRepository restaurantRepository;
    private final FoodItemRepository   foodItemRepository;
    private final AddressRepository    addressRepository;
    private final PasswordEncoder      passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        long userCount = userRepository.count();
        long restaurantCount = restaurantRepository.count();
        log.info("Seed check — users: {}, restaurants: {}", userCount, restaurantCount);

        if (userCount > 0 && restaurantCount >= 10) {
            log.info("Already fully seeded ({} users, {} restaurants). Skipping.", userCount, restaurantCount);
            return;
        }

        if (userCount == 0) {
            log.info("Seeding all demo data from scratch...");
            seedUsers();
            seedRestaurantsAndFoods();
        } else {
            // Users exist but restaurants are missing or incomplete — reseed restaurants
            log.info("Users exist but only {} restaurants found. Re-seeding restaurants...", restaurantCount);
            foodItemRepository.deleteAll();
            restaurantRepository.deleteAll();
            seedRestaurantsAndFoods();
        }

        log.info("Seeding complete — {} users, {} restaurants.", userRepository.count(), restaurantRepository.count());
    }

    private void seedUsers() {
        String pwd = passwordEncoder.encode("Demo@123");
        User admin = userRepository.save(User.builder().name("Admin User").email("admin@futuremeal.in").password(pwd).phone("9000000001").role(UserRole.ADMIN).isActive(true).build());
        User customer = userRepository.save(User.builder().name("Arjun Sharma").email("customer@futuremeal.in").password(pwd).phone("9000000002").role(UserRole.CUSTOMER).dietaryPreference(DietaryPreference.NON_VEG).spicePreference(SpiceLevel.MEDIUM).isActive(true).build());
        User owner = userRepository.save(User.builder().name("Priya Rangan").email("owner@futuremeal.in").password(pwd).phone("9000000003").role(UserRole.RESTAURANT_OWNER).isActive(true).build());
        userRepository.save(User.builder().name("Ravi Kumar").email("delivery@futuremeal.in").password(pwd).phone("9000000004").role(UserRole.DELIVERY_PARTNER).isActive(true).build());
        addressRepository.save(Address.builder().user(customer).label("Home").street("Flat 4B, Kaveri Apartments").area("Banjara Hills").city("Hyderabad").state("Telangana").pincode("500034").isDefault(true).build());
        addressRepository.save(Address.builder().user(customer).label("Work").street("Level 3, Tech Hub").area("HITEC City").city("Hyderabad").state("Telangana").pincode("500081").isDefault(false).build());
    }

    private void seedRestaurantsAndFoods() {
        User owner = userRepository.findByEmail("owner@futuremeal.in").orElseThrow();

        // 1. Spice Route Biryani
        Restaurant r1 = save(owner,"Spice Route Biryani","Authentic Hyderabadi dum biryani since 1985.","https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800","https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200",List.of("Hyderabadi","Biryani","Mughlai"),4.6,2841,28,30,149,"Road No 12","Banjara Hills","Hyderabad","Telangana","500034",List.of("20% off orders above Rs.399","Free delivery on first order"),List.of("bestseller","popular"));
        foodItemRepository.saveAll(List.of(
            food("Chicken Dum Biryani","Slow-cooked aromatic Hyderabadi biryani with tender chicken and saffron rice.","https://images.unsplash.com/photo-1563379091339-03246963d96b?w=400",229.0,299.0,"Biryani",r1,DietaryType.NON_VEG,SpiceLevel.MEDIUM,4.7,1243,25,true,true),
            food("Mutton Dum Biryani","Royal Hyderabadi mutton biryani slow-cooked with whole spices.","https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400",329.0,null,"Biryani",r1,DietaryType.NON_VEG,SpiceLevel.SPICY,4.8,892,35,true,false),
            food("Veg Dum Biryani","Fragrant basmati with fresh vegetables, saffron and whole spices.","https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400",179.0,null,"Biryani",r1,DietaryType.VEG,SpiceLevel.MEDIUM,4.3,543,22,true,false),
            food("Prawn Biryani","Juicy prawns cooked with coastal spices and long-grain basmati.","https://images.unsplash.com/photo-1563379091339-03246963d96b?w=400",349.0,null,"Biryani",r1,DietaryType.NON_VEG,SpiceLevel.SPICY,4.6,456,30,false,false),
            food("Egg Biryani","Soft boiled eggs layered with spiced rice and caramelised onions.","https://images.unsplash.com/photo-1563379091339-03246963d96b?w=400",199.0,null,"Biryani",r1,DietaryType.EGG,SpiceLevel.MEDIUM,4.4,321,22,false,false),
            food("Haleem","Slow-cooked mutton with wheat, lentils and aromatic spices.","https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?w=400",199.0,null,"Starters",r1,DietaryType.NON_VEG,SpiceLevel.SPICY,4.5,671,15,true,false),
            food("Chicken 65","Crispy deep-fried chicken marinated in South Indian spices.","https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",179.0,null,"Starters",r1,DietaryType.NON_VEG,SpiceLevel.SPICY,4.6,834,15,true,false),
            food("Shami Kebab (4 pcs)","Minced mutton patties with aromatic spices, pan-fried.","https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",149.0,null,"Starters",r1,DietaryType.NON_VEG,SpiceLevel.MEDIUM,4.5,398,12,false,false),
            food("Mirchi Ka Salan","Tangy peanut-coconut curry with green chillies.","https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",79.0,null,"Sides",r1,DietaryType.VEG,SpiceLevel.SPICY,4.4,312,10,false,false),
            food("Raita","Cool yogurt with cucumber and fresh herbs.","https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",49.0,null,"Sides",r1,DietaryType.VEG,SpiceLevel.MILD,4.3,612,5,false,false),
            food("Double Ka Meetha","Hyderabadi bread pudding with condensed milk and saffron.","https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400",89.0,null,"Desserts",r1,DietaryType.VEG,SpiceLevel.MILD,4.7,445,10,true,false),
            food("Lassi","Thick creamy yogurt drink — sweet or salted.","https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400",59.0,null,"Drinks",r1,DietaryType.VEG,SpiceLevel.MILD,4.5,876,5,false,false)
        ));

        // 2. Annapoorna South Indian
        Restaurant r2 = save(owner,"Annapoorna South Indian","Pure vegetarian South Indian comfort food.","https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800","https://images.unsplash.com/photo-1630383249896-42f06efd1494?w=200",List.of("South Indian","Vegetarian","Healthy"),4.4,1567,20,20,99,"100 Feet Road","Indiranagar","Bengaluru","Karnataka","560038",List.of("10% off all orders"),List.of("pure-veg","healthy"));
        foodItemRepository.saveAll(List.of(
            food("Masala Dosa","Crispy golden dosa with spiced potato filling and sambar.","https://images.unsplash.com/photo-1630383249896-42f06efd1494?w=400",89.0,null,"Dosas",r2,DietaryType.VEG,SpiceLevel.MILD,4.5,867,15,true,true),
            food("Paper Roast Dosa","Tissue-thin dosa roasted crispy with ghee.","https://images.unsplash.com/photo-1630383249896-42f06efd1494?w=400",99.0,null,"Dosas",r2,DietaryType.VEG,SpiceLevel.MILD,4.6,512,15,true,false),
            food("Pesarattu","Andhra green moong dosa with upma stuffing.","https://images.unsplash.com/photo-1630383249896-42f06efd1494?w=400",79.0,null,"Dosas",r2,DietaryType.VEG,SpiceLevel.MILD,4.2,298,18,false,false),
            food("Idli Sambar (4 pcs)","Soft steamed rice cakes with hot sambar and chutneys.","https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400",69.0,null,"Breakfast",r2,DietaryType.VEG,SpiceLevel.MILD,4.4,723,12,true,false),
            food("Rava Idli (4 pcs)","Semolina idli with mustard and curry leaves.","https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400",79.0,null,"Breakfast",r2,DietaryType.VEG,SpiceLevel.MILD,4.3,341,12,false,false),
            food("Medu Vada (2 pcs)","Crispy lentil doughnuts with coconut chutney.","https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400",59.0,null,"Breakfast",r2,DietaryType.VEG,SpiceLevel.MILD,4.3,512,10,true,false),
            food("Pongal","Creamy rice and moong dal with ghee and cashews.","https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400",79.0,null,"Breakfast",r2,DietaryType.VEG,SpiceLevel.MILD,4.4,445,15,false,false),
            food("Upma","Semolina with vegetables, mustard and curry leaves.","https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400",59.0,null,"Breakfast",r2,DietaryType.VEG,SpiceLevel.MILD,4.2,289,10,false,false),
            food("Sambar Vada","Crispy vadas soaked in warm sambar.","https://images.unsplash.com/photo-1547592180-85f173990554?w=400",69.0,null,"Specials",r2,DietaryType.VEG,SpiceLevel.MILD,4.5,634,12,true,false),
            food("Bisibelebath","Karnataka rice with lentils, vegetables and spices.","https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400",99.0,null,"Specials",r2,DietaryType.VEG,SpiceLevel.MEDIUM,4.4,387,20,false,false),
            food("Sweet Pongal","Jaggery rice with ghee and cardamom.","https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400",69.0,null,"Desserts",r2,DietaryType.VEG,SpiceLevel.MILD,4.6,423,12,false,false),
            food("Filter Coffee","Freshly brewed South Indian filter coffee.","https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400",39.0,null,"Drinks",r2,DietaryType.VEG,SpiceLevel.MILD,4.6,1102,5,false,true)
        ));

        // 3. Punjabi Tadka
        Restaurant r3 = save(owner,"Punjabi Tadka","Rich North Indian curries, freshly baked naans and classic Punjabi flavours.","https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800","https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200",List.of("North Indian","Punjabi","Mughlai"),4.3,983,35,40,199,"Lane 7","Koregaon Park","Pune","Maharashtra","411001",List.of("Buy 1 Get 1 on Butter Naan"),List.of("family-friendly"));
        foodItemRepository.saveAll(List.of(
            food("Butter Chicken","Tender chicken in rich tomato-cream sauce.","https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400",249.0,299.0,"Main Course",r3,DietaryType.NON_VEG,SpiceLevel.MEDIUM,4.6,743,20,true,true),
            food("Chicken Tikka Masala","Chargrilled chicken in creamy fenugreek gravy.","https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400",259.0,null,"Main Course",r3,DietaryType.NON_VEG,SpiceLevel.MEDIUM,4.5,612,20,false,false),
            food("Paneer Butter Masala","Soft paneer in rich tomato-cashew gravy.","https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400",199.0,null,"Main Course",r3,DietaryType.VEG,SpiceLevel.MILD,4.5,612,18,true,false),
            food("Dal Makhani","Slow-cooked black lentils with cream and butter.","https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",179.0,null,"Main Course",r3,DietaryType.VEG,SpiceLevel.MILD,4.4,521,15,true,false),
            food("Chole Bhature","Spiced chickpeas with fluffy deep-fried bread.","https://images.unsplash.com/photo-1626500154949-a6a4f7dfbcf6?w=400",149.0,null,"Main Course",r3,DietaryType.VEG,SpiceLevel.SPICY,4.3,432,20,true,false),
            food("Sarson Ka Saag","Mustard greens with maize flatbread and white butter.","https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",179.0,null,"Main Course",r3,DietaryType.VEG,SpiceLevel.MILD,4.4,287,20,false,false),
            food("Palak Paneer","Fresh paneer in smooth spiced spinach gravy.","https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400",189.0,null,"Main Course",r3,DietaryType.VEG,SpiceLevel.MILD,4.3,398,18,false,false),
            food("Tandoori Chicken (half)","Chicken marinated in yogurt and spices, charred in tandoor.","https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",249.0,null,"Starters",r3,DietaryType.NON_VEG,SpiceLevel.SPICY,4.6,567,20,true,false),
            food("Butter Naan","Freshly baked soft naan brushed with butter.","https://images.unsplash.com/photo-1619894991209-9f4b0a3c5f70?w=400",49.0,null,"Breads",r3,DietaryType.VEG,SpiceLevel.MILD,4.5,891,8,false,false),
            food("Tandoori Roti","Whole wheat bread baked in clay tandoor.","https://images.unsplash.com/photo-1619894991209-9f4b0a3c5f70?w=400",35.0,null,"Breads",r3,DietaryType.VEG,SpiceLevel.MILD,4.4,765,8,false,false),
            food("Gulab Jamun (2 pcs)","Milk-solid dumplings soaked in rose sugar syrup.","https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400",69.0,null,"Desserts",r3,DietaryType.VEG,SpiceLevel.MILD,4.6,923,5,true,false),
            food("Sweet Lassi","Thick Punjabi lassi blended with cream and sugar.","https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400",79.0,null,"Drinks",r3,DietaryType.VEG,SpiceLevel.MILD,4.5,445,5,false,false)
        ));

        // 4. Chaat Corner
        Restaurant r4 = save(owner,"Chaat Corner","Delhi-style street food. Pani puri, pav bhaji, samosa chaat and more.","https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800","https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=200",List.of("Street Food","Chaat","Snacks"),4.5,2103,18,15,79,"Inner Circle","Connaught Place","Delhi","Delhi","110001",List.of("Free masala papad on every order"),List.of("budget","quick"));
        foodItemRepository.saveAll(List.of(
            food("Pani Puri (8 pcs)","Hollow puris filled with spiced tamarind water and chickpeas.","https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400",59.0,null,"Street Food",r4,DietaryType.VEG,SpiceLevel.SPICY,4.4,1102,10,true,true),
            food("Pav Bhaji","Spiced mashed vegetables with buttered pav.","https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400",99.0,null,"Street Food",r4,DietaryType.VEG,SpiceLevel.MEDIUM,4.5,872,15,true,false),
            food("Samosa (2 pcs)","Crispy pastry with spiced potato and peas.","https://images.unsplash.com/photo-1601050690293-eec506b9e8e6?w=400",49.0,null,"Snacks",r4,DietaryType.VEG,SpiceLevel.MEDIUM,4.3,934,12,true,false),
            food("Dahi Puri (6 pcs)","Puris with yogurt, chutneys and sev.","https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400",69.0,null,"Street Food",r4,DietaryType.VEG,SpiceLevel.MEDIUM,4.4,678,10,false,false),
            food("Bhel Puri","Puffed rice with onions, tomatoes and chutneys.","https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400",59.0,null,"Street Food",r4,DietaryType.VEG,SpiceLevel.MEDIUM,4.2,543,8,false,false),
            food("Aloo Tikki (2 pcs)","Crispy potato patties with chole and chutneys.","https://images.unsplash.com/photo-1601050690293-eec506b9e8e6?w=400",69.0,null,"Snacks",r4,DietaryType.VEG,SpiceLevel.SPICY,4.3,456,10,false,false),
            food("Vada Pav","Spiced potato vada in soft bun with chutneys.","https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400",39.0,null,"Street Food",r4,DietaryType.VEG,SpiceLevel.SPICY,4.2,765,10,true,false),
            food("Raj Kachori","Giant crispy shell with potato, chickpeas and yogurt.","https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400",79.0,null,"Specials",r4,DietaryType.VEG,SpiceLevel.MEDIUM,4.5,312,12,false,false),
            food("Momos Veg (6 pcs)","Steamed vegetable dumplings with spicy dip.","https://images.unsplash.com/photo-1562802378-063ec186a863?w=400",89.0,null,"Snacks",r4,DietaryType.VEG,SpiceLevel.MEDIUM,4.4,654,15,true,false),
            food("Momos Chicken (6 pcs)","Steamed chicken dumplings with red dip.","https://images.unsplash.com/photo-1562802378-063ec186a863?w=400",99.0,null,"Snacks",r4,DietaryType.NON_VEG,SpiceLevel.SPICY,4.5,789,15,true,false),
            food("Kulfi Falooda","Dense kulfi with rose syrup and vermicelli.","https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400",89.0,null,"Desserts",r4,DietaryType.VEG,SpiceLevel.MILD,4.6,543,5,true,false),
            food("Masala Chai","Spiced ginger-cardamom tea brewed with milk.","https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400",29.0,null,"Drinks",r4,DietaryType.VEG,SpiceLevel.MILD,4.5,1234,3,false,false)
        ));

        // 5. Dragon Palace (Indo-Chinese)
        Restaurant r5 = save(owner,"Dragon Palace","Authentic Indo-Chinese flavours — bold Chinese cooking with Indian spices.","https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800","https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200",List.of("Chinese","Indo-Chinese","Asian"),4.2,876,30,35,149,"MG Road","Koramangala","Bengaluru","Karnataka","560034",List.of("15% off first order"),List.of("chinese","indo-chinese"));
        foodItemRepository.saveAll(List.of(
            food("Chicken Fried Rice","Wok-tossed rice with chicken, egg and soy sauce.","https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",179.0,null,"Rice",r5,DietaryType.NON_VEG,SpiceLevel.MEDIUM,4.3,654,20,true,true),
            food("Veg Hakka Noodles","Stir-fried noodles with mixed vegetables.","https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",149.0,null,"Noodles",r5,DietaryType.VEG,SpiceLevel.MEDIUM,4.2,543,18,true,false),
            food("Chilli Chicken (dry)","Crispy chicken with capsicum and hot chilli sauce.","https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",219.0,null,"Starters",r5,DietaryType.NON_VEG,SpiceLevel.SPICY,4.5,876,15,true,false),
            food("Veg Manchurian Gravy","Vegetable balls in spicy Manchurian sauce.","https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400",159.0,null,"Main Course",r5,DietaryType.VEG,SpiceLevel.SPICY,4.3,432,18,false,false),
            food("Chicken Manchurian","Crispy chicken in Manchurian sauce.","https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",229.0,null,"Main Course",r5,DietaryType.NON_VEG,SpiceLevel.SPICY,4.4,598,18,false,false),
            food("Spring Rolls (4 pcs)","Crispy rolls with vegetable filling and chilli dip.","https://images.unsplash.com/photo-1601050690293-eec506b9e8e6?w=400",129.0,null,"Starters",r5,DietaryType.VEG,SpiceLevel.MILD,4.4,456,12,true,false),
            food("Schezwan Fried Rice","Wok rice with spicy Schezwan sauce.","https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",169.0,null,"Rice",r5,DietaryType.EGG,SpiceLevel.SPICY,4.4,387,18,false,false),
            food("Hot and Sour Soup","Classic soup with vinegar, chilli and vegetables.","https://images.unsplash.com/photo-1547592180-85f173990554?w=400",89.0,null,"Soups",r5,DietaryType.VEG,SpiceLevel.SPICY,4.2,312,10,false,false),
            food("Kung Pao Chicken","Diced chicken with peanuts and dried chillies.","https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",239.0,null,"Main Course",r5,DietaryType.NON_VEG,SpiceLevel.SPICY,4.3,267,20,false,false),
            food("Paneer Chilli Garlic","Cottage cheese stir-fried with garlic and capsicum.","https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400",189.0,null,"Main Course",r5,DietaryType.VEG,SpiceLevel.SPICY,4.2,287,18,false,false),
            food("Honey Chilli Potatoes","Crispy potato fingers in honey-chilli glaze.","https://images.unsplash.com/photo-1601050690293-eec506b9e8e6?w=400",129.0,null,"Starters",r5,DietaryType.VEG,SpiceLevel.MEDIUM,4.5,543,12,true,false),
            food("Wonton Soup","Delicate wontons in clear chicken broth.","https://images.unsplash.com/photo-1547592180-85f173990554?w=400",99.0,null,"Soups",r5,DietaryType.NON_VEG,SpiceLevel.MILD,4.3,198,12,false,false)
        ));

        // 6. Kerala Kitchen
        Restaurant r6 = save(owner,"Kerala Kitchen","Authentic Kerala cuisine from the coconut coast. Fish curry, appam and parotta.","https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800","https://images.unsplash.com/photo-1534482421-64566f976cfa?w=200",List.of("Kerala","South Indian","Seafood"),4.5,1243,32,30,179,"Fort Kochi Road","Ernakulam","Kochi","Kerala","682011",List.of("Free banana chips with every order"),List.of("kerala","seafood","coastal"));
        foodItemRepository.saveAll(List.of(
            food("Kerala Fish Curry","Tangy red fish curry with kokum and coconut milk.","https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400",259.0,null,"Fish",r6,DietaryType.NON_VEG,SpiceLevel.SPICY,4.6,678,25,true,true),
            food("Appam with Stew","Lacy rice hoppers with gentle coconut milk vegetable stew.","https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400",149.0,null,"Breakfast",r6,DietaryType.VEG,SpiceLevel.MILD,4.5,543,20,true,false),
            food("Malabar Parotta","Layered flaky flatbread cooked on griddle.","https://images.unsplash.com/photo-1619894991209-9f4b0a3c5f70?w=400",59.0,null,"Breads",r6,DietaryType.VEG,SpiceLevel.MILD,4.4,876,10,true,false),
            food("Prawn Moilee","Prawns in gentle coconut milk curry.","https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400",299.0,null,"Seafood",r6,DietaryType.NON_VEG,SpiceLevel.MEDIUM,4.5,345,25,false,false),
            food("Chicken Stew","Tender chicken in mild coconut milk with vegetables.","https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400",229.0,null,"Chicken",r6,DietaryType.NON_VEG,SpiceLevel.MILD,4.4,456,25,false,false),
            food("Puttu and Kadala Curry","Steamed rice cylinders with spiced black chickpea curry.","https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400",129.0,null,"Breakfast",r6,DietaryType.VEG,SpiceLevel.MEDIUM,4.4,312,15,false,false),
            food("Kerala Fish Fry","Spiced fish fillets fried with coconut oil and curry leaves.","https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400",219.0,null,"Starters",r6,DietaryType.NON_VEG,SpiceLevel.SPICY,4.7,567,15,true,false),
            food("Beef Fry","Kerala-style dry beef with coconut pieces and black pepper.","https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",249.0,null,"Beef",r6,DietaryType.NON_VEG,SpiceLevel.SPICY,4.8,432,20,true,false),
            food("Avial","Mixed vegetables in coconut-yogurt gravy.","https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",149.0,null,"Vegetarian",r6,DietaryType.VEG,SpiceLevel.MILD,4.3,234,20,false,false),
            food("Coconut Rice","Fragrant rice with fresh coconut and curry leaves.","https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400",99.0,null,"Rice",r6,DietaryType.VEG,SpiceLevel.MILD,4.3,287,15,false,false),
            food("Banana Chips","Thin raw banana chips fried in coconut oil.","https://images.unsplash.com/photo-1601050690293-eec506b9e8e6?w=400",49.0,null,"Snacks",r6,DietaryType.VEG,SpiceLevel.MILD,4.5,876,5,false,false),
            food("Payasam","Creamy rice pudding with coconut milk and jaggery.","https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400",79.0,null,"Desserts",r6,DietaryType.VEG,SpiceLevel.MILD,4.6,398,10,true,false)
        ));

        // 7. Andhra Spice
        Restaurant r7 = save(owner,"Andhra Spice","Bold Andhra and Telangana cuisine — fiery curries, gongura specials and authentic meals.","https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800","https://images.unsplash.com/photo-1563379091339-03246963d96b?w=200",List.of("Andhra","Telangana","South Indian"),4.4,1456,28,25,149,"Vijaya Nagar Colony","Vizag","Visakhapatnam","Andhra Pradesh","530002",List.of("Full Andhra Meals at Rs.149","Free papad and pickle"),List.of("andhra","spicy","meals"));
        foodItemRepository.saveAll(List.of(
            food("Gongura Chicken","Andhra specialty — chicken in tangy sorrel leaf masala.","https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400",259.0,null,"Chicken",r7,DietaryType.NON_VEG,SpiceLevel.EXTRA_SPICY,4.7,876,25,true,true),
            food("Andhra Chicken Curry","Fiery bone-in chicken curry with Andhra spices.","https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400",239.0,null,"Chicken",r7,DietaryType.NON_VEG,SpiceLevel.EXTRA_SPICY,4.6,654,25,true,false),
            food("Natu Kodi Vepudu","Country chicken dry fry with garlic and pepper.","https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",279.0,null,"Chicken",r7,DietaryType.NON_VEG,SpiceLevel.SPICY,4.7,543,25,true,false),
            food("Andhra Mutton Curry","Bold mutton curry with poppy seeds and coconut.","https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?w=400",299.0,null,"Mutton",r7,DietaryType.NON_VEG,SpiceLevel.EXTRA_SPICY,4.6,432,30,false,false),
            food("Chepa Vepudu","Spicy fish fry with red chilli and ginger garlic paste.","https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400",229.0,null,"Fish",r7,DietaryType.NON_VEG,SpiceLevel.SPICY,4.5,345,20,false,false),
            food("Andhra Meals","Full thali with rice, sambar, rasam, 4 curries and curd.","https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400",149.0,null,"Meals",r7,DietaryType.VEG,SpiceLevel.SPICY,4.5,1234,15,true,false),
            food("Gutti Vankaya Kura","Baby brinjal stuffed with spiced peanut-sesame masala.","https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",159.0,null,"Vegetarian",r7,DietaryType.VEG,SpiceLevel.SPICY,4.4,312,20,false,false),
            food("Pappu (Toor Dal)","Andhra-style toor dal with tomato and green chilli.","https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",99.0,null,"Vegetarian",r7,DietaryType.VEG,SpiceLevel.MEDIUM,4.4,456,15,false,false),
            food("Pesarattu Upma","Green moong crepe with upma stuffing and ginger chutney.","https://images.unsplash.com/photo-1630383249896-42f06efd1494?w=400",89.0,null,"Breakfast",r7,DietaryType.VEG,SpiceLevel.MILD,4.3,287,15,false,false),
            food("Pulihora","Tamarind rice with mustard, peanuts and curry leaves.","https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400",99.0,null,"Rice",r7,DietaryType.VEG,SpiceLevel.MEDIUM,4.4,345,10,false,false),
            food("Bobbatlu","Sweet flatbread stuffed with chana dal and jaggery.","https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400",79.0,null,"Desserts",r7,DietaryType.VEG,SpiceLevel.MILD,4.5,234,15,false,false),
            food("Buttermilk","Chilled spiced buttermilk with curry leaves and ginger.","https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400",39.0,null,"Drinks",r7,DietaryType.VEG,SpiceLevel.MILD,4.3,543,5,false,false)
        ));

        // 8. FitBowl (Healthy)
        Restaurant r8 = save(owner,"FitBowl","Healthy, clean and delicious food for the active lifestyle. Macro-balanced meals.","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200",List.of("Healthy","Salads","Protein","Vegan"),4.3,765,25,30,149,"Jubilee Hills","Jubilee Hills","Hyderabad","Telangana","500033",List.of("Free protein shake with orders above Rs.499"),List.of("healthy","fitness","low-calorie"));
        foodItemRepository.saveAll(List.of(
            food("Quinoa Power Bowl","Quinoa with roasted vegetables, chickpeas and tahini dressing.","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",249.0,null,"Bowls",r8,DietaryType.VEGAN,SpiceLevel.MILD,4.4,456,15,true,true),
            food("Grilled Chicken Salad","Grilled chicken with mixed greens and lemon dressing.","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",229.0,null,"Salads",r8,DietaryType.NON_VEG,SpiceLevel.MILD,4.3,345,15,false,false),
            food("Protein Omelette","3-egg white omelette with spinach and mushroom.","https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400",179.0,null,"Breakfast",r8,DietaryType.EGG,SpiceLevel.MILD,4.2,234,12,false,false),
            food("Avocado Toast","Multigrain toast with smashed avocado and microgreens.","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",189.0,null,"Breakfast",r8,DietaryType.VEGAN,SpiceLevel.MILD,4.3,312,10,false,false),
            food("Buddha Bowl","Brown rice, roasted sweet potato, edamame and turmeric dressing.","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",259.0,null,"Bowls",r8,DietaryType.VEGAN,SpiceLevel.MILD,4.4,267,15,false,false),
            food("Smoothie Bowl","Acai blend topped with granola, banana and berries.","https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400",199.0,null,"Breakfast",r8,DietaryType.VEG,SpiceLevel.MILD,4.5,345,8,true,false),
            food("Grilled Paneer Bowl","Tandoori paneer with brown rice and stir-fried vegetables.","https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400",229.0,null,"Bowls",r8,DietaryType.VEG,SpiceLevel.MEDIUM,4.3,234,15,false,false),
            food("Lentil Soup","Red lentil soup with cumin and lemon. High protein.","https://images.unsplash.com/photo-1547592180-85f173990554?w=400",149.0,null,"Soups",r8,DietaryType.VEGAN,SpiceLevel.MILD,4.2,198,12,false,false),
            food("Brown Rice Khichdi","Brown rice and moong dal with turmeric and ghee.","https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400",179.0,null,"Rice",r8,DietaryType.VEG,SpiceLevel.MILD,4.3,267,15,false,false),
            food("Chia Pudding","Chia seeds in almond milk topped with mango and granola.","https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400",159.0,null,"Desserts",r8,DietaryType.VEGAN,SpiceLevel.MILD,4.4,189,5,false,false),
            food("Green Detox Smoothie","Spinach, cucumber, apple, ginger and lemon.","https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400",149.0,null,"Drinks",r8,DietaryType.VEGAN,SpiceLevel.MILD,4.3,312,5,false,false),
            food("Overnight Oats","Rolled oats with chia, almond milk and berries.","https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400",169.0,null,"Breakfast",r8,DietaryType.VEGAN,SpiceLevel.MILD,4.3,234,5,false,false)
        ));

        // 9. Sweet Surrender (Desserts/Cafe)
        Restaurant r9 = save(owner,"Sweet Surrender","Traditional mithai, gelato, dessert jars and speciality teas and coffees.","https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800","https://images.unsplash.com/photo-1587314168485-3236d6710814?w=200",List.of("Desserts","Beverages","Cafe","Sweets"),4.6,1876,20,20,99,"Film Nagar","Jubilee Hills","Hyderabad","Telangana","500096",List.of("Buy 3 sweets get 1 free"),List.of("desserts","cafe","sweet"));
        foodItemRepository.saveAll(List.of(
            food("Gulab Jamun (4 pcs)","Milk-solid dumplings soaked in rose-cardamom syrup.","https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400",89.0,null,"Sweets",r9,DietaryType.VEG,SpiceLevel.MILD,4.7,1243,5,true,true),
            food("Rasmalai (3 pcs)","Soft cottage cheese discs in saffron thickened milk.","https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400",99.0,null,"Sweets",r9,DietaryType.VEG,SpiceLevel.MILD,4.7,987,8,true,false),
            food("Rasgulla (4 pcs)","Spongy cottage cheese balls in light sugar syrup.","https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400",79.0,null,"Sweets",r9,DietaryType.VEG,SpiceLevel.MILD,4.5,765,5,false,false),
            food("Mango Kulfi","Dense frozen kulfi with real mango pulp and saffron.","https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400",99.0,null,"Ice Cream",r9,DietaryType.VEG,SpiceLevel.MILD,4.6,876,5,true,false),
            food("Kheer","Creamy rice pudding with cardamom and pistachios.","https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400",89.0,null,"Sweets",r9,DietaryType.VEG,SpiceLevel.MILD,4.5,543,10,false,false),
            food("Shahi Tukda","Fried bread soaked in rabri with saffron and silver leaf.","https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400",119.0,null,"Sweets",r9,DietaryType.VEG,SpiceLevel.MILD,4.6,432,10,false,false),
            food("Falooda","Rose syrup with vermicelli, basil seeds and cold milk.","https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400",99.0,null,"Drinks",r9,DietaryType.VEG,SpiceLevel.MILD,4.5,654,5,true,false),
            food("Brownie with Ice Cream","Warm chocolate brownie with vanilla ice cream.","https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400",149.0,null,"Bakery",r9,DietaryType.VEG,SpiceLevel.MILD,4.6,543,8,true,false),
            food("Cold Coffee","Blended cold coffee with vanilla ice cream.","https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400",99.0,null,"Drinks",r9,DietaryType.VEG,SpiceLevel.MILD,4.5,765,5,false,false),
            food("Masala Chai","Classic spiced ginger-cardamom tea. Served hot.","https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400",35.0,null,"Drinks",r9,DietaryType.VEG,SpiceLevel.MILD,4.6,1543,3,false,false),
            food("Paan Kulfi","Meetha paan flavoured dense kulfi.","https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400",89.0,null,"Ice Cream",r9,DietaryType.VEG,SpiceLevel.MILD,4.4,312,5,false,false),
            food("Mango Lassi","Thick Alphonso mango blended with yogurt.","https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400",89.0,null,"Drinks",r9,DietaryType.VEG,SpiceLevel.MILD,4.7,876,5,true,false)
        ));

        // 10. Mumbai Street
        Restaurant r10 = save(owner,"Mumbai Street","The spirit of Mumbai in every bite — vada pav, pav bhaji, frankie and street chai.","https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800","https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=200",List.of("Street Food","Mumbai","Fast Food","Snacks"),4.4,2345,22,10,69,"Linking Road","Bandra West","Mumbai","Maharashtra","400050",List.of("Free cutting chai with any order"),List.of("mumbai","budget","quick"));
        foodItemRepository.saveAll(List.of(
            food("Vada Pav","Mumbai soul food — spiced potato vada in soft bun with chutneys.","https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400",39.0,null,"Snacks",r10,DietaryType.VEG,SpiceLevel.SPICY,4.5,2134,8,true,true),
            food("Pav Bhaji","Buttery spiced vegetable mash with soft pav.","https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400",99.0,null,"Snacks",r10,DietaryType.VEG,SpiceLevel.MEDIUM,4.6,1876,12,true,false),
            food("Misal Pav","Spicy sprouted curry topped with farsan and served with pav.","https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400",89.0,null,"Snacks",r10,DietaryType.VEG,SpiceLevel.SPICY,4.4,876,15,true,false),
            food("Chicken Frankie","Flatbread rolled with spiced chicken, onion and chutney.","https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",99.0,null,"Rolls",r10,DietaryType.NON_VEG,SpiceLevel.MEDIUM,4.4,765,12,true,false),
            food("Veg Frankie","Flatbread rolled with spiced potato and green chutney.","https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400",79.0,null,"Rolls",r10,DietaryType.VEG,SpiceLevel.MEDIUM,4.3,543,12,false,false),
            food("Keema Pav","Spiced minced mutton served with buttered pav.","https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?w=400",129.0,null,"Snacks",r10,DietaryType.NON_VEG,SpiceLevel.SPICY,4.5,654,15,false,false),
            food("Dabeli","Sweet-spicy potato filling in pav with peanuts and sev.","https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400",49.0,null,"Snacks",r10,DietaryType.VEG,SpiceLevel.MEDIUM,4.4,543,10,false,false),
            food("Sev Puri (6 pcs)","Crisp puris topped with potato, chutneys and sev.","https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400",59.0,null,"Snacks",r10,DietaryType.VEG,SpiceLevel.MEDIUM,4.3,432,8,false,false),
            food("Kanda Bhajiya","Crispy onion fritters with fresh coriander.","https://images.unsplash.com/photo-1601050690293-eec506b9e8e6?w=400",59.0,null,"Snacks",r10,DietaryType.VEG,SpiceLevel.MEDIUM,4.3,765,8,false,false),
            food("Bhel Puri","Puffed rice with chopped vegetables and chutneys.","https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400",49.0,null,"Snacks",r10,DietaryType.VEG,SpiceLevel.MEDIUM,4.2,654,8,false,false),
            food("Cutting Chai","Mumbai legendary half-cup of strong spiced tea.","https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400",15.0,null,"Drinks",r10,DietaryType.VEG,SpiceLevel.MILD,4.7,3456,3,false,false),
            food("Lemon Soda","Fresh lime with salt and soda. The perfect cooler.","https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400",29.0,null,"Drinks",r10,DietaryType.VEGAN,SpiceLevel.MILD,4.5,876,3,false,false)
        ));
    }

    private Restaurant save(User owner, String name, String desc, String cover, String logo,
            List<String> cuisines, double rating, int reviews, int deliveryTime,
            int deliveryFee, int minOrder, String street, String area, String city,
            String state, String pincode, List<String> offers, List<String> tags) {
        return restaurantRepository.save(Restaurant.builder()
                .name(name).description(desc).coverImage(cover).logo(logo)
                .cuisines(cuisines).rating(rating).totalReviews(reviews)
                .deliveryTime(deliveryTime).deliveryFee(deliveryFee).minimumOrder(minOrder)
                .street(street).area(area).city(city).state(state).pincode(pincode)
                .isOpen(true).status(RestaurantStatus.ACTIVE)
                .offers(offers).tags(tags).owner(owner).build());
    }

    private FoodItem food(String name, String desc, String image,
                           double price, Double originalPrice, String category,
                           Restaurant restaurant, DietaryType diet, SpiceLevel spice,
                           double rating, int reviews, int prepTime, boolean bestseller, boolean recommended) {
        return FoodItem.builder()
                .name(name).description(desc).image(image)
                .price(price).originalPrice(originalPrice)
                .category(category).restaurant(restaurant)
                .dietaryType(diet).spiceLevel(spice)
                .rating(rating).totalReviews(reviews)
                .preparationTime(prepTime)
                .isAvailable(true).isBestseller(bestseller).isRecommended(recommended)
                .orderCount(reviews / 3).build();
    }
}