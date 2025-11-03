/**
 * FAQ System Initialization Script
 * 
 * This script populates the FAQ system with sample FAQs for all categories.
 * Run this after setting up the database to have initial FAQ content.
 * 
 * Usage:
 * 1. Ensure your server is running
 * 2. Create a super admin account and get access token
 * 3. Update ACCESS_TOKEN below
 * 4. Run: node scripts/initialize-faqs.js
 */

const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5050/api/v1';
const ACCESS_TOKEN = process.env.SUPER_ADMIN_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJYcHZVbEx5TlFQdDNnb2VxNHNERyIsImVtYWlsIjoiYWRtaW5AcmVraGFza2l0Y2hlbi5pbiIsInJvbGUiOiJzdXBlcl9hZG1pbiIsImlhdCI6MTc2MTc1MDQ5OCwiYXVkIjoicmVraGFzLWtpdGNoZW4tdXNlcnMiLCJpc3MiOiJyZWtoYXMta2l0Y2hlbiJ9.uGKHi99f50Z13RaJA7WYNZxqff3p-4f8ZDQ0jdAdofA';

// Sample FAQs for each category
const sampleFAQs = {
  general: [
    {
      question: 'What is Rekha\'s Kitchen?',
      answer: 'Rekha\'s Kitchen is a premium food delivery service offering authentic homestyle cooking. We prepare fresh, delicious meals using traditional recipes and high-quality ingredients, delivered right to your doorstep.',
      display_order: 0
    },
    {
      question: 'What areas do you deliver to?',
      answer: 'We currently deliver to multiple locations across the city. You can check if we deliver to your area by entering your address in the app. Our service radius is typically 15 km from each outlet.',
      display_order: 1
    },
    {
      question: 'What are your operating hours?',
      answer: 'We are open from 10:00 AM to 10:00 PM daily. You can place orders during these hours for immediate delivery or schedule orders for later.',
      display_order: 2
    },
    {
      question: 'How can I contact customer support?',
      answer: 'You can reach our customer support team through the app\'s Help section, call us at our support hotline, or email us at support@rekhaskitchen.com. We\'re here to help 7 days a week.',
      display_order: 3
    }
  ],

  orders: [
    {
      question: 'How do I place an order?',
      answer: 'To place an order: 1) Browse our menu and add items to your cart, 2) Review your cart and apply any coupons, 3) Select delivery address or pickup option, 4) Choose payment method, 5) Confirm your order. You\'ll receive a confirmation immediately.',
      display_order: 0
    },
    {
      question: 'How do I track my order?',
      answer: 'You can track your order in real-time from the Orders section of the app. You\'ll see live updates as your order is confirmed, prepared, and out for delivery. We also send push notifications at each stage.',
      display_order: 1
    },
    {
      question: 'Can I cancel my order?',
      answer: 'Yes, you can cancel your order within 5 minutes of placing it from the Orders section. After that, the kitchen starts preparing your food, so please contact customer support for assistance with cancellations.',
      display_order: 2
    },
    {
      question: 'Can I modify my order after placing it?',
      answer: 'You can modify your order within 5 minutes of placing it by canceling and placing a new order. After 5 minutes, please contact customer support immediately, and we\'ll try our best to accommodate changes if the order hasn\'t started preparation.',
      display_order: 3
    },
    {
      question: 'What if I receive the wrong order?',
      answer: 'If you receive an incorrect order, please contact customer support immediately through the app. Take photos of the items received, and we\'ll arrange for a replacement or full refund. Your satisfaction is our priority.',
      display_order: 4
    },
    {
      question: 'Can I schedule an order for later?',
      answer: 'Yes! You can schedule orders up to 7 days in advance. During checkout, select "Schedule for later" and choose your preferred date and time. We\'ll prepare and deliver your order at the scheduled time.',
      display_order: 5
    },
    {
      question: 'What is the minimum order value?',
      answer: 'The minimum order value varies by location and is typically ₹150-₹200. You\'ll see the minimum order requirement for your area when you add items to your cart.',
      display_order: 6
    }
  ],

  payments: [
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept multiple payment methods: Credit/Debit cards (Visa, Mastercard, Amex), UPI (Google Pay, PhonePe, Paytm), Digital wallets (Paytm, PhonePe), and Cash on Delivery (COD).',
      display_order: 0
    },
    {
      question: 'Is my payment information secure?',
      answer: 'Absolutely! We use industry-standard encryption and secure payment gateways. We never store your complete card details on our servers. All transactions are processed through PCI-DSS compliant payment partners.',
      display_order: 1
    },
    {
      question: 'When will I be charged?',
      answer: 'For online payments, you\'re charged immediately when you place the order. For Cash on Delivery, you pay when your order is delivered. If an order is canceled, refunds are processed within 5-7 business days.',
      display_order: 2
    },
    {
      question: 'How do refunds work?',
      answer: 'Refunds are processed to your original payment method within 5-7 business days. For UPI/wallet payments, refunds are typically faster (1-3 days). You\'ll receive a notification once the refund is initiated.',
      display_order: 3
    },
    {
      question: 'Can I use multiple payment methods for one order?',
      answer: 'Currently, we support one payment method per order. However, you can use loyalty points along with any payment method to get discounts on your order.',
      display_order: 4
    },
    {
      question: 'Do you charge any extra fees?',
      answer: 'We charge a delivery fee based on distance and order value. Some orders may have packaging charges. All fees are clearly shown before you confirm your order. There are no hidden charges.',
      display_order: 5
    }
  ],

  delivery: [
    {
      question: 'What are your delivery hours?',
      answer: 'We deliver from 10:00 AM to 10:00 PM daily. Orders placed outside these hours will be scheduled for delivery the next day starting from 10:00 AM.',
      display_order: 0
    },
    {
      question: 'How much is the delivery fee?',
      answer: 'Delivery fees vary based on distance from the outlet and order value. Typically, fees range from ₹20-₹60. Orders above certain amounts may qualify for free delivery. You\'ll see the exact fee before confirming your order.',
      display_order: 1
    },
    {
      question: 'How long does delivery take?',
      answer: 'Standard delivery takes 30-45 minutes depending on your location and order complexity. You\'ll see an estimated delivery time when placing your order. We always strive to deliver as quickly as possible while ensuring food quality.',
      display_order: 2
    },
    {
      question: 'Can I track my delivery in real-time?',
      answer: 'Yes! Once your order is out for delivery, you can track your delivery partner\'s location in real-time on the app. You\'ll also see their contact information in case you need to reach them.',
      display_order: 3
    },
    {
      question: 'What if I\'m not available to receive the delivery?',
      answer: 'Please ensure someone is available at the delivery address. If you can\'t receive the order, you can add delivery instructions in the app (e.g., "Leave with security"). For contactless delivery, we can leave the order at your doorstep.',
      display_order: 4
    },
    {
      question: 'Do you offer contactless delivery?',
      answer: 'Yes! We offer contactless delivery for your safety. Select this option during checkout, and our delivery partner will leave your order at your doorstep, ring the bell, and maintain safe distance.',
      display_order: 5
    }
  ],

  account: [
    {
      question: 'How do I create an account?',
      answer: 'Download the Rekha\'s Kitchen app and tap "Sign Up". You can register using your phone number (OTP verification) or email address. Fill in your basic details, and you\'re ready to order!',
      display_order: 0
    },
    {
      question: 'I forgot my password. How do I reset it?',
      answer: 'On the login screen, tap "Forgot Password". Enter your registered email or phone number, and we\'ll send you a password reset link or OTP. Follow the instructions to create a new password.',
      display_order: 1
    },
    {
      question: 'How do I update my profile information?',
      answer: 'Go to Profile > Edit Profile in the app. You can update your name, phone number, email, profile picture, and other details. Don\'t forget to save your changes.',
      display_order: 2
    },
    {
      question: 'How do I add or edit delivery addresses?',
      answer: 'Go to Profile > Addresses. You can add new addresses, edit existing ones, set a default address, or delete old addresses. You can save multiple addresses for home, work, and other locations.',
      display_order: 3
    },
    {
      question: 'Can I delete my account?',
      answer: 'Yes, you can delete your account by going to Profile > Settings > Delete Account. Please note that this action is permanent and will delete all your data including order history and loyalty points.',
      display_order: 4
    },
    {
      question: 'How do I change my notification preferences?',
      answer: 'Go to Profile > Settings > Notifications. You can customize which notifications you want to receive (order updates, promotions, loyalty rewards, etc.) via push notifications, email, or SMS.',
      display_order: 5
    }
  ],

  menu: [
    {
      question: 'How often do you update your menu?',
      answer: 'We regularly update our menu with seasonal specials and new dishes. Our core menu remains consistent, but we add special items weekly. Check the "What\'s New" section in the app for latest additions.',
      display_order: 0
    },
    {
      question: 'Do you have vegetarian and vegan options?',
      answer: 'Yes! We have a wide variety of vegetarian and vegan options. You can filter the menu by dietary preferences (vegetarian, vegan, gluten-free) to easily find suitable dishes.',
      display_order: 1
    },
    {
      question: 'Can I customize my order?',
      answer: 'Yes, many items can be customized. You can adjust spice levels, add extra toppings, or remove ingredients. Look for the "Customize" option when adding items to your cart, or add special instructions.',
      display_order: 2
    },
    {
      question: 'Do you provide nutritional information?',
      answer: 'Yes, nutritional information (calories, protein, carbs, fat) is available for most menu items. Tap on any dish to view detailed nutritional information and ingredients.',
      display_order: 3
    },
    {
      question: 'What if I have food allergies?',
      answer: 'Please check the ingredients list for each dish in the app. If you have severe allergies, mention them in the special instructions, and contact customer support. We take allergies seriously and will do our best to accommodate.',
      display_order: 4
    },
    {
      question: 'Why is a menu item unavailable?',
      answer: 'Items may be temporarily unavailable due to ingredient shortages, high demand, or outlet-specific availability. We update availability in real-time. Try checking a different outlet or ordering later.',
      display_order: 5
    }
  ],

  loyalty: [
    {
      question: 'How does the loyalty program work?',
      answer: 'Earn points with every order! For every ₹100 spent, you earn 10 loyalty points. Accumulate points and redeem them for discounts on future orders. 100 points = ₹10 discount.',
      display_order: 0
    },
    {
      question: 'How do I check my loyalty points?',
      answer: 'Go to Profile > Loyalty Points in the app. You\'ll see your current points balance, points history, and available rewards. You can also see how many points you\'ll earn on your current order.',
      display_order: 1
    },
    {
      question: 'How do I redeem my loyalty points?',
      answer: 'During checkout, you\'ll see an option to "Use Loyalty Points". Select how many points you want to redeem (minimum 100 points). The discount will be applied to your order total.',
      display_order: 2
    },
    {
      question: 'Do loyalty points expire?',
      answer: 'Loyalty points are valid for 12 months from the date they\'re earned. You\'ll receive notifications before your points expire so you can use them in time.',
      display_order: 3
    },
    {
      question: 'Can I transfer my loyalty points to someone else?',
      answer: 'Loyalty points are non-transferable and tied to your account. However, you can use your points to order food for anyone by using their delivery address.',
      display_order: 4
    },
    {
      question: 'What is the milestone rewards program?',
      answer: 'Complete milestones (e.g., 10 orders, 25 orders) to unlock special rewards like free meals, exclusive discounts, or bonus points. Check your progress in the Loyalty section.',
      display_order: 5
    }
  ],

  technical: [
    {
      question: 'The app is not working properly. What should I do?',
      answer: 'Try these steps: 1) Close and restart the app, 2) Check your internet connection, 3) Update to the latest app version, 4) Clear app cache (Settings > Apps > Rekha\'s Kitchen > Clear Cache), 5) If issues persist, contact support.',
      display_order: 0
    },
    {
      question: 'I\'m not receiving notifications. How do I fix this?',
      answer: 'Check: 1) Notification permissions are enabled for the app in your phone settings, 2) Notifications are enabled in app settings (Profile > Settings > Notifications), 3) Your phone is not in Do Not Disturb mode.',
      display_order: 1
    },
    {
      question: 'The app keeps crashing. What should I do?',
      answer: 'Try: 1) Update to the latest app version, 2) Restart your phone, 3) Clear app cache and data, 4) Uninstall and reinstall the app. If the problem continues, contact support with your device model and OS version.',
      display_order: 2
    },
    {
      question: 'I can\'t log in to my account. What should I do?',
      answer: 'Ensure you\'re using the correct phone number/email and password. Try "Forgot Password" to reset. Check your internet connection. If you still can\'t log in, contact support for assistance.',
      display_order: 3
    },
    {
      question: 'Which devices and OS versions are supported?',
      answer: 'Our app supports: Android 6.0 and above, iOS 12.0 and above. For the best experience, we recommend using the latest OS version and keeping the app updated.',
      display_order: 4
    },
    {
      question: 'How do I update the app?',
      answer: 'Go to Google Play Store (Android) or App Store (iOS), search for "Rekha\'s Kitchen", and tap "Update" if available. Enable automatic updates in your store settings to always have the latest version.',
      display_order: 5
    }
  ]
};

// Helper function to create FAQ
async function createFAQ(category, faq) {
  try {
    const response = await axios.post(
      `${BASE_URL}/faqs/admin`,
      {
        question: faq.question,
        answer: faq.answer,
        category: category,
        display_order: faq.display_order,
        is_active: true
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      id: response.data.data.faq.id,
      question: faq.question
    };
  } catch (error) {
    return {
      success: false,
      question: faq.question,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// Main initialization function
async function initializeFAQs() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 FAQ SYSTEM INITIALIZATION');
  console.log('='.repeat(60));

  // Validate token
  if (ACCESS_TOKEN === 'YOUR_SUPER_ADMIN_ACCESS_TOKEN_HERE') {
    console.log('\n❌ ERROR: Please set your access token');
    console.log('\nOptions:');
    console.log('1. Set SUPER_ADMIN_TOKEN environment variable:');
    console.log('   export SUPER_ADMIN_TOKEN="your_token_here"');
    console.log('   node scripts/initialize-faqs.js');
    console.log('\n2. Or edit the script and update ACCESS_TOKEN variable');
    return;
  }

  console.log(`\n📍 API Base URL: ${BASE_URL}`);
  console.log(`🔑 Using access token: ${ACCESS_TOKEN.substring(0, 20)}...`);

  let totalCreated = 0;
  let totalFailed = 0;

  // Process each category
  for (const [category, faqs] of Object.entries(sampleFAQs)) {
    console.log(`\n📂 Processing category: ${category.toUpperCase()}`);
    console.log('-'.repeat(60));

    for (const faq of faqs) {
      const result = await createFAQ(category, faq);

      if (result.success) {
        console.log(`✅ Created: "${result.question.substring(0, 50)}..."`);
        console.log(`   ID: ${result.id}`);
        totalCreated++;
      } else {
        console.log(`❌ Failed: "${result.question.substring(0, 50)}..."`);
        console.log(`   Error: ${result.error}`);
        totalFailed++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 INITIALIZATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully created: ${totalCreated} FAQs`);
  console.log(`❌ Failed: ${totalFailed} FAQs`);
  console.log(`📁 Categories: ${Object.keys(sampleFAQs).length}`);
  
  if (totalCreated > 0) {
    console.log('\n✨ FAQ system initialized successfully!');
    console.log('\n📱 Next steps:');
    console.log('1. Test the mobile endpoints: GET /api/v1/faqs');
    console.log('2. Verify FAQs in admin panel');
    console.log('3. Customize FAQs as needed');
  }

  if (totalFailed > 0) {
    console.log('\n⚠️  Some FAQs failed to create. Check the errors above.');
  }

  console.log('\n' + '='.repeat(60));
}

// Run initialization
initializeFAQs().catch(error => {
  console.error('\n❌ Initialization failed with error:');
  console.error(error);
  process.exit(1);
});
