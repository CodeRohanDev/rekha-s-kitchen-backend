require('dotenv').config();
const { dbHelpers, collections } = require('../src/config/database');
const logger = require('../src/utils/logger');

async function initDeliverySystem() {
    try {
        console.log('🚚 Initializing Delivery System...\n');

        // Define Delivery Fee Configuration
        const feeConfig = {
            name: 'Standard Delivery Fee Structure',
            description: 'Distance and order value based delivery fees',
            is_active: true,
            tiers: [
                {
                    tier_name: '0-2 KM',
                    distance_min: 0,
                    distance_max: 2,
                    brackets: [
                        {
                            order_min: 0,
                            order_max: 200,
                            base_fee: 30,
                            per_km_fee: 0,
                            discount_percent: 0
                        },
                        {
                            order_min: 200,
                            order_max: 500,
                            base_fee: 25,
                            per_km_fee: 0,
                            discount_percent: 0
                        },
                        {
                            order_min: 500,
                            order_max: null,
                            base_fee: 0,
                            per_km_fee: 0,
                            discount_percent: 0
                        }
                    ]
                },
                {
                    tier_name: '2-10 KM',
                    distance_min: 2,
                    distance_max: 10,
                    brackets: [
                        {
                            order_min: 0,
                            order_max: 200,
                            base_fee: 30,
                            per_km_fee: 10,
                            discount_percent: 0
                        },
                        {
                            order_min: 200,
                            order_max: 500,
                            base_fee: 25,
                            per_km_fee: 8,
                            discount_percent: 0
                        },
                        {
                            order_min: 500,
                            order_max: null,
                            base_fee: 0,
                            per_km_fee: 0,
                            discount_percent: 0
                        }
                    ]
                },
                {
                    tier_name: '10-15 KM',
                    distance_min: 10,
                    distance_max: 15,
                    brackets: [
                        {
                            order_min: 0,
                            order_max: 200,
                            base_fee: 30,
                            per_km_fee: 10,
                            discount_percent: 0
                        },
                        {
                            order_min: 200,
                            order_max: 500,
                            base_fee: 25,
                            per_km_fee: 10,
                            discount_percent: 0
                        },
                        {
                            order_min: 500,
                            order_max: null,
                            base_fee: 25,
                            per_km_fee: 10,
                            discount_percent: 50
                        }
                    ]
                }
            ],
            created_by: 'system'
        };

        // Define Payout Configuration
        const payoutConfig = {
            name: 'Standard Delivery Partner Payout Structure',
            description: 'Distance based payout for delivery partners',
            is_active: true,
            tiers: [
                {
                    tier_name: '0-2 KM',
                    distance_min: 0,
                    distance_max: 2,
                    base_payout: 30,
                    per_km_payout: 0
                },
                {
                    tier_name: '2-10 KM',
                    distance_min: 2,
                    distance_max: 10,
                    base_payout: 25,
                    per_km_payout: 8
                },
                {
                    tier_name: '10-15 KM',
                    distance_min: 10,
                    distance_max: 15,
                    base_payout: 25,
                    per_km_payout: 10
                }
            ],
            created_by: 'system'
        };

        // Define Global Payout Schedule
        const globalSchedule = {
            schedule_type: 'weekly',
            day_of_week: 'friday',
            time: '23:59',
            is_active: true,
            applies_to: 'all',
            created_by: 'system'
        };

        // Check and create/update fee configuration
        console.log('🔍 Checking for existing fee configuration...');
        const existingFeeConfigs = await dbHelpers.getDocs(collections.DELIVERY_FEE_CONFIG);

        let feeConfigId;
        if (existingFeeConfigs.length > 0) {
            console.log('⚠️  Fee configuration already exists. Updating...');
            feeConfigId = existingFeeConfigs[0].id;
            await dbHelpers.updateDoc(collections.DELIVERY_FEE_CONFIG, feeConfigId, {
                ...feeConfig,
                updated_at: new Date(),
                updated_by: 'system'
            });
            console.log('✅ Fee configuration updated successfully!');
        } else {
            console.log('📝 Creating fee configuration...');
            const createdConfig = await dbHelpers.createDoc(collections.DELIVERY_FEE_CONFIG, feeConfig);
            feeConfigId = createdConfig.id;
            console.log('✅ Fee configuration created successfully!');
        }

        // Check and create/update payout configuration
        console.log('\n🔍 Checking for existing payout configuration...');
        const existingPayoutConfigs = await dbHelpers.getDocs(collections.DELIVERY_PAYOUT_CONFIG);

        let payoutConfigId;
        if (existingPayoutConfigs.length > 0) {
            console.log('⚠️  Payout configuration already exists. Updating...');
            payoutConfigId = existingPayoutConfigs[0].id;
            await dbHelpers.updateDoc(collections.DELIVERY_PAYOUT_CONFIG, payoutConfigId, {
                ...payoutConfig,
                updated_at: new Date(),
                updated_by: 'system'
            });
            console.log('✅ Payout configuration updated successfully!');
        } else {
            console.log('📝 Creating payout configuration...');
            const createdConfig = await dbHelpers.createDoc(collections.DELIVERY_PAYOUT_CONFIG, payoutConfig);
            payoutConfigId = createdConfig.id;
            console.log('✅ Payout configuration created successfully!');
        }

        // Check and create/update global schedule
        console.log('\n🔍 Checking for existing global schedule...');
        const existingSchedules = await dbHelpers.getDocs(collections.PAYOUT_SCHEDULES, [
            { type: 'where', field: 'applies_to', operator: '==', value: 'all' }
        ]);

        let scheduleId;
        if (existingSchedules.length > 0) {
            console.log('⚠️  Global schedule already exists. Updating...');
            scheduleId = existingSchedules[0].id;
            await dbHelpers.updateDoc(collections.PAYOUT_SCHEDULES, scheduleId, {
                ...globalSchedule,
                updated_at: new Date(),
                updated_by: 'system'
            });
            console.log('✅ Global schedule updated successfully!');
        } else {
            console.log('📝 Creating global schedule...');
            const createdSchedule = await dbHelpers.createDoc(collections.PAYOUT_SCHEDULES, globalSchedule);
            scheduleId = createdSchedule.id;
            console.log('✅ Global schedule created successfully!');
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 Delivery System Initialized Successfully!');
        console.log('='.repeat(60));
        
        console.log('\n📊 Configuration Summary:\n');
        
        console.log('💰 CUSTOMER DELIVERY FEES');
        console.log('   Config ID:', feeConfigId);
        console.log('   Status: ✅ Active');
        console.log('   Tiers: 3 (0-2 KM, 2-10 KM, 10-15 KM)');
        console.log('   Free delivery: Orders ₹500+');
        
        console.log('\n🚚 DELIVERY PARTNER PAYOUTS');
        console.log('   Config ID:', payoutConfigId);
        console.log('   Status: ✅ Active');
        console.log('   Tiers: 3 (0-2 KM, 2-10 KM, 10-15 KM)');
        console.log('   Base payout: ₹25-30');
        
        console.log('\n📅 PAYOUT SCHEDULE');
        console.log('   Schedule ID:', scheduleId);
        console.log('   Type: Weekly');
        console.log('   Day: Friday');
        console.log('   Time: 23:59');
        console.log('   Applies to: All delivery partners');
        
        console.log('\n' + '='.repeat(60));
        console.log('📝 Next Steps:');
        console.log('='.repeat(60));
        console.log('1. Test fee calculation:');
        console.log('   POST http://localhost:3001/api/v1/delivery/calculate-fee');
        console.log('');
        console.log('2. View fee structure:');
        console.log('   GET http://localhost:3001/api/v1/delivery/fee-structure');
        console.log('');
        console.log('3. Admin: View configurations:');
        console.log('   GET http://localhost:3001/api/v1/delivery/admin/fee-config');
        console.log('   GET http://localhost:3001/api/v1/delivery/admin/payout-config');
        console.log('');
        console.log('4. Admin: Manage schedules:');
        console.log('   GET http://localhost:3001/api/v1/delivery/admin/payout-schedule/global');
        console.log('\n✨ Delivery system is ready to use!\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error initializing delivery system:', error);
        console.error('\nStack trace:', error.stack);
        process.exit(1);
    }
}

// Run the script
console.log('🚀 Starting Delivery System Initialization...\n');
initDeliverySystem();
