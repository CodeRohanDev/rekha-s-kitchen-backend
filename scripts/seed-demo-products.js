require('dotenv').config();
const { dbHelpers, collections } = require('../src/config/database');
const logger = require('../src/utils/logger');

// 8 Categories with demo products
const demoData = {
  categories: [
    {
      name: 'Appetizers',
      description: 'Start your meal with our delicious starters',
      display_order: 1
    },
    {
      name: 'Main Course',
      description: 'Traditional Indian main dishes',
      display_order: 2
    },
    {
      name: 'Biryanis & Rice',
      description: 'Aromatic rice dishes',
      display_order: 3
    }, 
    {
      name: 'Breads',
      description: 'Freshly baked Indian breads',
      display_order: 4
    },
    {
      name: 'Desserts',
      description: 'Sweet treats to end your meal',
      display_order: 5
    },
    {
      name: 'Beverages',
      description: 'Refreshing drinks',
      display_order: 6
    },
    {
      name: 'Tandoori Specials',
      description: 'Clay oven specialties',
      display_order: 7
    },
    {
      name: 'South Indian',
      description: 'Authentic South Indian delicacies',
      display_order: 8
    }
  ],

  products: {
    'Appetizers': [
      { name: 'Samosa (2 pcs)', price: 40, is_vegetarian: true, spice_level: 'mild', prep_time: 10, description: 'Crispy pastry filled with spiced potatoes and peas', min_order_qty: 2 },
      { name: 'Paneer Tikka', price: 250, is_vegetarian: true, spice_level: 'medium', prep_time: 15, description: 'Grilled cottage cheese marinated in spices' },
      { name: 'Chicken 65', price: 280, is_vegetarian: false, spice_level: 'hot', prep_time: 12, description: 'Spicy fried chicken with curry leaves' },
      { name: 'Vegetable Pakora', price: 120, is_vegetarian: true, is_vegan: true, spice_level: 'mild', prep_time: 10, description: 'Mixed vegetable fritters', min_order_qty: 2 },
      { name: 'Fish Amritsari', price: 350, is_vegetarian: false, spice_level: 'medium', prep_time: 15, description: 'Crispy fried fish in gram flour batter' },
      { name: 'Papdi Chaat', price: 150, is_vegetarian: true, spice_level: 'mild', prep_time: 8, description: 'Crispy wafers with yogurt and chutneys' }
    ],

    'Main Course': [
      { name: 'Butter Chicken', price: 420, is_vegetarian: false, spice_level: 'mild', prep_time: 20, description: 'Creamy tomato-based chicken curry' },
      { name: 'Palak Paneer', price: 320, is_vegetarian: true, spice_level: 'mild', prep_time: 18, description: 'Cottage cheese in spinach gravy' },
      { name: 'Chicken Tikka Masala', price: 450, is_vegetarian: false, spice_level: 'medium', prep_time: 22, description: 'Grilled chicken in spiced tomato sauce' },
      { name: 'Dal Makhani', price: 280, is_vegetarian: true, spice_level: 'mild', prep_time: 25, description: 'Black lentils cooked with butter and cream' },
      { name: 'Lamb Rogan Josh', price: 550, is_vegetarian: false, spice_level: 'hot', prep_time: 30, description: 'Kashmiri lamb curry with aromatic spices' },
      { name: 'Chana Masala', price: 220, is_vegetarian: true, is_vegan: true, spice_level: 'medium', prep_time: 15, description: 'Chickpeas in tangy tomato gravy' },
      { name: 'Kadai Paneer', price: 350, is_vegetarian: true, spice_level: 'medium', prep_time: 18, description: 'Cottage cheese with bell peppers in spicy gravy' }
    ],

    'Biryanis & Rice': [
      { name: 'Chicken Biryani', price: 380, is_vegetarian: false, spice_level: 'medium', prep_time: 25, description: 'Fragrant basmati rice with spiced chicken' },
      { name: 'Vegetable Biryani', price: 280, is_vegetarian: true, spice_level: 'mild', prep_time: 20, description: 'Mixed vegetables with aromatic rice' },
      { name: 'Lamb Biryani', price: 480, is_vegetarian: false, spice_level: 'medium', prep_time: 30, description: 'Tender lamb pieces with saffron rice' },
      { name: 'Jeera Rice', price: 120, is_vegetarian: true, is_vegan: true, spice_level: 'mild', prep_time: 12, description: 'Cumin-flavored basmati rice' },
      { name: 'Egg Biryani', price: 250, is_vegetarian: false, spice_level: 'mild', prep_time: 20, description: 'Boiled eggs with spiced rice' },
      { name: 'Hyderabadi Biryani', price: 420, is_vegetarian: false, spice_level: 'hot', prep_time: 35, description: 'Authentic Hyderabadi-style chicken biryani' }
    ],

    'Breads': [
      { name: 'Butter Naan', price: 50, is_vegetarian: true, spice_level: 'none', prep_time: 8, description: 'Soft leavened bread with butter', min_order_qty: 2 },
      { name: 'Garlic Naan', price: 60, is_vegetarian: true, spice_level: 'mild', prep_time: 8, description: 'Naan topped with garlic and cilantro', min_order_qty: 2 },
      { name: 'Tandoori Roti', price: 30, is_vegetarian: true, is_vegan: true, spice_level: 'none', prep_time: 6, description: 'Whole wheat flatbread', min_order_qty: 2 },
      { name: 'Cheese Naan', price: 80, is_vegetarian: true, spice_level: 'none', prep_time: 10, description: 'Naan stuffed with cheese' },
      { name: 'Aloo Paratha', price: 70, is_vegetarian: true, spice_level: 'mild', prep_time: 12, description: 'Flatbread stuffed with spiced potatoes' },
      { name: 'Laccha Paratha', price: 60, is_vegetarian: true, spice_level: 'none', prep_time: 10, description: 'Multi-layered crispy flatbread', min_order_qty: 2 }
    ],

    'Desserts': [
      { name: 'Gulab Jamun (2 pcs)', price: 80, is_vegetarian: true, spice_level: 'none', prep_time: 5, description: 'Soft milk dumplings in sugar syrup' },
      { name: 'Rasmalai (2 pcs)', price: 100, is_vegetarian: true, spice_level: 'none', prep_time: 5, description: 'Cottage cheese patties in sweet milk' },
      { name: 'Kheer', price: 70, is_vegetarian: true, spice_level: 'none', prep_time: 8, description: 'Rice pudding with cardamom' },
      { name: 'Gajar Halwa', price: 90, is_vegetarian: true, spice_level: 'none', prep_time: 10, description: 'Carrot pudding with nuts' },
      { name: 'Kulfi', price: 60, is_vegetarian: true, spice_level: 'none', prep_time: 2, description: 'Traditional Indian ice cream' },
      { name: 'Jalebi', price: 80, is_vegetarian: true, spice_level: 'none', prep_time: 8, description: 'Crispy sweet spirals in syrup' }
    ],

    'Beverages': [
      { name: 'Mango Lassi', price: 80, is_vegetarian: true, spice_level: 'none', prep_time: 3, description: 'Sweet yogurt drink with mango' },
      { name: 'Masala Chai', price: 30, is_vegetarian: true, spice_level: 'mild', prep_time: 5, description: 'Spiced Indian tea' },
      { name: 'Sweet Lassi', price: 60, is_vegetarian: true, spice_level: 'none', prep_time: 3, description: 'Sweet yogurt drink' },
      { name: 'Salt Lassi', price: 60, is_vegetarian: true, spice_level: 'none', prep_time: 3, description: 'Salted yogurt drink' },
      { name: 'Fresh Lime Soda', price: 50, is_vegetarian: true, is_vegan: true, spice_level: 'none', prep_time: 3, description: 'Refreshing lime and soda' },
      { name: 'Rose Milk', price: 70, is_vegetarian: true, spice_level: 'none', prep_time: 3, description: 'Chilled milk with rose syrup' }
    ],

    'Tandoori Specials': [
      { name: 'Tandoori Chicken (Half)', price: 350, is_vegetarian: false, spice_level: 'medium', prep_time: 25, description: 'Chicken marinated in yogurt and spices' },
      { name: 'Chicken Malai Tikka', price: 380, is_vegetarian: false, spice_level: 'mild', prep_time: 20, description: 'Creamy chicken tikka' },
      { name: 'Seekh Kebab', price: 400, is_vegetarian: false, spice_level: 'medium', prep_time: 18, description: 'Minced lamb skewers' },
      { name: 'Tandoori Prawns', price: 500, is_vegetarian: false, spice_level: 'medium', prep_time: 15, description: 'Grilled prawns with spices' },
      { name: 'Paneer Shashlik', price: 300, is_vegetarian: true, spice_level: 'mild', prep_time: 15, description: 'Grilled paneer with vegetables' },
      { name: 'Fish Tikka', price: 420, is_vegetarian: false, spice_level: 'medium', prep_time: 18, description: 'Marinated fish grilled in tandoor' }
    ],

    'South Indian': [
      { name: 'Masala Dosa', price: 180, is_vegetarian: true, is_vegan: true, spice_level: 'mild', prep_time: 15, description: 'Crispy crepe with potato filling' },
      { name: 'Idli Sambar (3 pcs)', price: 120, is_vegetarian: true, is_vegan: true, spice_level: 'mild', prep_time: 10, description: 'Steamed rice cakes with lentil soup', min_order_qty: 3 },
      { name: 'Medu Vada (3 pcs)', price: 100, is_vegetarian: true, is_vegan: true, spice_level: 'mild', prep_time: 12, description: 'Crispy lentil donuts', min_order_qty: 3 },
      { name: 'Uttapam', price: 150, is_vegetarian: true, spice_level: 'mild', prep_time: 12, description: 'Thick pancake with vegetables' },
      { name: 'Rava Dosa', price: 160, is_vegetarian: true, spice_level: 'mild', prep_time: 12, description: 'Crispy semolina crepe' },
      { name: 'Filter Coffee', price: 40, is_vegetarian: true, spice_level: 'none', prep_time: 3, description: 'Traditional South Indian coffee' }
    ]
  }
};

async function seedDemoProducts() {
  try {
    logger.info('🌱 Starting demo product seeding...');

    // Step 1: Get all active outlets
    logger.info('🏪 Fetching active outlets...');
    const outlets = await dbHelpers.getDocs(collections.OUTLETS, [
      { type: 'where', field: 'is_active', operator: '==', value: true }
    ]);

    if (outlets.length === 0) {
      logger.error('❌ No active outlets found. Please create at least one outlet first.');
      logger.info('💡 Tip: Create an outlet using the admin panel or API');
      process.exit(1);
    }

    logger.info(`✅ Found ${outlets.length} active outlet(s)`);

    let totalCategories = 0;
    let totalProducts = 0;

    // Step 2: Create menu for each outlet
    for (const outlet of outlets) {
      logger.info(`\n🏪 Creating menu for: ${outlet.name} (${outlet.id})`);
      
      const categoryMap = {};

      // Create categories for this outlet
      logger.info('📁 Creating categories...');
      for (const categoryData of demoData.categories) {
        const category = await dbHelpers.createDoc(collections.MENU_CATEGORIES, {
          ...categoryData,
          outlet_id: outlet.id,
          is_active: true,
          item_count: 0,
          created_by: 'system'
        });

        categoryMap[categoryData.name] = category.id;
        totalCategories++;
        logger.info(`  ✓ ${categoryData.name}`);
      }

      // Create products for each category
      logger.info('🍽️  Creating products...');
      for (const [categoryName, products] of Object.entries(demoData.products)) {
        const categoryId = categoryMap[categoryName];

        for (const productData of products) {
          await dbHelpers.createDoc(collections.MENU_ITEMS, {
            category_id: categoryId,
            outlet_id: outlet.id,
            name: productData.name,
            description: productData.description,
            price: productData.price,
            is_vegetarian: productData.is_vegetarian || false,
            is_vegan: productData.is_vegan || false,
            is_gluten_free: false,
            spice_level: productData.spice_level || 'mild',
            preparation_time: productData.prep_time,
            ingredients: [],
            nutritional_info: {},
            image_url: null,
            is_available: true,
            is_active: true,
            min_order_quantity: productData.min_order_qty || 1,
            created_by: 'system',
            total_orders: 0,
            average_rating: 0,
            review_count: 0
          });

          totalProducts++;
        }

        // Update category item count
        await dbHelpers.updateDoc(collections.MENU_CATEGORIES, categoryId, {
          item_count: products.length
        });
      }

      logger.info(`✅ Menu created for ${outlet.name}`);
    }

    logger.info(`\n✨ Seeding completed successfully!`);
    logger.info(`📊 Summary:`);
    logger.info(`   - Outlets processed: ${outlets.length}`);
    logger.info(`   - Categories created: ${totalCategories} (${demoData.categories.length} per outlet)`);
    logger.info(`   - Products created: ${totalProducts}`);
    logger.info(`\n🎉 All outlet menus are ready!`);

    process.exit(0);
  } catch (error) {
    logger.error('❌ Error seeding demo products:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDemoProducts();
