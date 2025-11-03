require('dotenv').config();
const AuthUtils = require('../src/utils/auth');
const { dbHelpers, collections } = require('../src/config/database');
const logger = require('../src/utils/logger');

async function createSuperAdmin() {
    try {
        console.log('🔧 Creating Super Admin...');

        // Super admin details
        const superAdminData = {
            email: 'admin@rekhaskitchen.in',
            password: 'Rohan@0212',
            first_name: 'Super',
            last_name: 'Admin',
            phone: '+911234567890'
        };

        // Check if super admin already exists
        const existingUsers = await dbHelpers.getDocs(collections.USERS, [
            { type: 'where', field: 'email', operator: '==', value: superAdminData.email }
        ]);

        if (existingUsers.length > 0) {
            console.log('❌ Super admin already exists with email:', superAdminData.email);
            process.exit(1);
        }

        // Hash password
        const hashedPassword = await AuthUtils.hashPassword(superAdminData.password);

        // Create super admin user
        const userData = {
            email: superAdminData.email,
            password_hash: hashedPassword,
            phone: superAdminData.phone,
            role: 'super_admin',
            is_active: true,
            created_by: 'system'
        };

        const user = await dbHelpers.createDoc(collections.USERS, userData);

        // Create user profile
        const profileData = {
            user_id: user.id,
            first_name: superAdminData.first_name,
            last_name: superAdminData.last_name,
            avatar_url: null
        };

        await dbHelpers.createDoc(collections.USER_PROFILES, profileData, user.id);

        console.log('✅ Super Admin created successfully!');
        console.log('📧 Email:', superAdminData.email);
        console.log('🔑 Password:', superAdminData.password);
        console.log('👤 User ID:', user.id);
        console.log('🎯 Role:', user.role);
        console.log('');
        console.log('🚨 IMPORTANT: Change the password after first login!');
        console.log('');
        console.log('🧪 Test login with:');
        console.log('POST http://localhost:5050/api/v1/auth/login');
        console.log(JSON.stringify({
            email: superAdminData.email,
            password: superAdminData.password
        }, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating super admin:', error);
        process.exit(1);
    }
}

// Run the script
createSuperAdmin();