require('dotenv').config();
const { dbHelpers, collections } = require('../src/config/database');
const logger = require('../src/utils/logger');

async function initReferralProgram() {
    try {
        console.log('🎁 Initializing Referral Program...\n');

        // Define Referral Program
        const referralProgram = {
            name: 'Refer and Earn Program',
            description: 'Refer friends and earn free meals',
            is_active: true,
            config: {
                // Referral settings
                referrals_per_reward: 5,          // 5 successful referrals = 1 reward
                min_orders_for_qualification: 1,   // Referred user must complete 1 order
                
                // Reward settings
                reward_type: 'free_meal',
                reward_value: 500,                 // ₹500 free meal
                reward_expiry_days: 30,            // Reward expires in 30 days
                expiry_notification_days: 1,       // Notify 1 days before expiry
                
                // Reward items
                reward_items: [
                    'Any main course item up to ₹500',
                ],
                
                // Limits
                max_active_rewards: 3,             // Maximum 3 unclaimed rewards at a time
                max_pending_referrals: 50,         // Maximum 50 pending referrals
                
                // Eligibility
                referrer_min_orders: 1,            // Referrer must have at least 1 order
                referred_user_min_order_value: 200 // Referred user's order must be ≥ ₹200
            },
            created_by: 'system'
        };

        // Check if program already exists
        console.log('🔍 Checking for existing program...');
        
        const existingPrograms = await dbHelpers.getDocs(collections.REFERRAL_PROGRAMS);

        let programId;

        if (existingPrograms.length > 0) {
            console.log('⚠️  Referral program already exists. Updating...');
            programId = existingPrograms[0].id;
            await dbHelpers.updateDoc(collections.REFERRAL_PROGRAMS, programId, {
                ...referralProgram,
                updated_at: new Date(),
                updated_by: 'system'
            });
            console.log('✅ Referral program updated successfully!');
        } else {
            console.log('📝 Creating Referral program...');
            const createdProgram = await dbHelpers.createDoc(collections.REFERRAL_PROGRAMS, referralProgram);
            programId = createdProgram.id;
            console.log('✅ Referral program created successfully!');
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 Referral Program Initialized Successfully!');
        console.log('='.repeat(60));
        
        console.log('\n📊 Program Summary:\n');
        
        console.log('🎯 REFER AND EARN PROGRAM');
        console.log('   ID:', programId);
        console.log('   Status:', referralProgram.is_active ? '✅ Active' : '❌ Inactive');
        console.log('   Referrals needed: 5 successful referrals');
        console.log('   Qualification: Referred user must complete 1 order');
        console.log('   Reward value: Up to ₹500');
        console.log('   Reward expiry: 60 days');
        console.log('   Max unclaimed rewards: 3');
        
        console.log('\n' + '='.repeat(60));
        console.log('📝 Next Steps:');
        console.log('='.repeat(60));
        console.log('1. Test the program:');
        console.log('   GET http://localhost:3001/api/v1/referral/program');
        console.log('');
        console.log('2. Users can get their referral code:');
        console.log('   GET http://localhost:3001/api/v1/referral/my-code');
        console.log('');
        console.log('3. New users can apply referral code:');
        console.log('   POST http://localhost:3001/api/v1/referral/apply');
        console.log('');
        console.log('4. View analytics:');
        console.log('   GET http://localhost:3001/api/v1/referral/admin/analytics');
        console.log('\n✨ Referral system is ready to use!\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error initializing referral program:', error);
        console.error('\nStack trace:', error.stack);
        process.exit(1);
    }
}

// Run the script
console.log('🚀 Starting Referral Program Initialization...\n');
initReferralProgram();
