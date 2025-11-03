require('dotenv').config();
const { dbHelpers, collections } = require('../src/config/database');
const logger = require('../src/utils/logger');

async function initLoyaltyPrograms() {
    try {
        console.log('🎁 Initializing Loyalty Program...\n');

        // Define Milestone Program
        const milestoneProgram = {
            program_type: 'milestone',
            name: 'Milestone Rewards Program',
            description: 'Get a free meal every 10th order',
            is_active: true,
            is_default: true,
            config: {
                // Milestone settings
                orders_per_milestone: 10,         // Free meal every 10 orders
                
                // Reward settings
                reward_type: 'free_meal',         // Type of reward
                reward_value: 500,                // Maximum value of free meal (₹500)
                reward_expiry_days: 30,           // Reward expires in 30 days
                expiry_notification_days: 1,      // Notify 7 days before expiry
                
                // Reward items
                reward_items: [
                    'Any main course item up to ₹500',
                ],
                
                // Other settings
                eligible_order_types: ['delivery'],
                min_order_value: 200,             // Minimum order value to count towards milestone
                max_active_rewards: 3             // Maximum 3 unclaimed rewards at a time
            },
            created_by: 'system'
        };

        // Check if program already exists
        console.log('🔍 Checking for existing program...');
        
        const existingMilestonePrograms = await dbHelpers.getDocs(collections.LOYALTY_PROGRAMS, [
            { type: 'where', field: 'program_type', operator: '==', value: 'milestone' }
        ]);

        let milestoneProgramId;

        // Create or update Milestone Program
        if (existingMilestonePrograms.length > 0) {
            console.log('⚠️  Milestone program already exists. Updating...');
            milestoneProgramId = existingMilestonePrograms[0].id;
            await dbHelpers.updateDoc(collections.LOYALTY_PROGRAMS, milestoneProgramId, {
                ...milestoneProgram,
                updated_at: new Date(),
                updated_by: 'system'
            });
            console.log('✅ Milestone program updated successfully!');
        } else {
            console.log('📝 Creating Milestone program...');
            const createdProgram = await dbHelpers.createDoc(collections.LOYALTY_PROGRAMS, milestoneProgram);
            milestoneProgramId = createdProgram.id;
            console.log('✅ Milestone program created successfully!');
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 Loyalty Program Initialized Successfully!');
        console.log('='.repeat(60));
        
        console.log('\n📊 Program Summary:\n');
        
        console.log('🎯 MILESTONE PROGRAM (Default)');
        console.log('   ID:', milestoneProgramId);
        console.log('   Status:', milestoneProgram.is_active ? '✅ Active' : '❌ Inactive');
        console.log('   Milestone: Free meal every 10 orders');
        console.log('   Reward value: Up to ₹500');
        console.log('   Reward expiry: 30 days');
        
        console.log('\n' + '='.repeat(60));
        console.log('📝 Next Steps:');
        console.log('='.repeat(60));
        console.log('1. Test the program:');
        console.log('   GET http://localhost:3001/api/v1/loyalty/programs');
        console.log('');
        console.log('2. Users will be auto-enrolled in Milestone Program');
        console.log('   when they access: GET /api/v1/loyalty/account');
        console.log('');
        console.log('3. Admins can modify program config:');
        console.log('   POST http://localhost:3001/api/v1/loyalty/programs/configure');
        console.log('');
        console.log('4. View analytics:');
        console.log('   GET http://localhost:3001/api/v1/loyalty/admin/analytics');
        console.log('\n✨ Loyalty system is ready to use!\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error initializing loyalty program:', error);
        console.error('\nStack trace:', error.stack);
        process.exit(1);
    }
}

// Run the script
console.log('🚀 Starting Loyalty Programs Initialization...\n');
initLoyaltyPrograms();
