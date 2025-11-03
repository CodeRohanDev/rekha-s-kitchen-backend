const admin = require('firebase-admin');
const logger = require('../utils/logger');
const path = require('path');

// Initialize Firebase Admin SDK
let serviceAccount;

try {
  // Try to load service account from JSON file
  serviceAccount = require('../../serviceaccount.json');
  logger.info('Loaded Firebase service account from JSON file');
} catch (error) {
  // Fallback to environment variables if JSON file fails
  logger.warn('Could not load serviceaccount.json, using environment variables');
  serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`,
    universe_domain: "googleapis.com"
  };
}

// Validate required fields
if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
  throw new Error('Missing required Firebase configuration. Please check your serviceaccount.json or environment variables.');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com/`,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
});

const db = admin.firestore();

// Collection names
const collections = {
  USERS: 'users',
  USER_PROFILES: 'user_profiles',
  OUTLETS: 'outlets',
  MENU_CATEGORIES: 'menu_categories',
  MENU_ITEMS: 'menu_items',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  PAYMENTS: 'payments',
  REVIEWS: 'reviews',
  COUPONS: 'coupons',
  CARTS: 'carts',
  NOTIFICATIONS: 'notifications',
  NOTIFICATION_PREFERENCES: 'notification_preferences',
  LOYALTY_PROGRAMS: 'loyalty_programs',
  USER_LOYALTY_ACCOUNTS: 'user_loyalty_accounts',
  LOYALTY_TRANSACTIONS: 'loyalty_transactions',
  MILESTONE_REWARDS: 'milestone_rewards',
  REFERRAL_PROGRAMS: 'referral_programs',
  USER_REFERRAL_ACCOUNTS: 'user_referral_accounts',
  REFERRALS: 'referrals',
  REFERRAL_REWARDS: 'referral_rewards',
  DELIVERY_FEE_CONFIG: 'delivery_fee_config',
  DELIVERY_PAYOUT_CONFIG: 'delivery_payout_config',
  PAYOUT_SCHEDULES: 'payout_schedules',
  DELIVERY_PAYOUTS: 'delivery_payouts',
  PAYOUT_BATCHES: 'payout_batches',
  OTP_VERIFICATIONS: 'otp_verifications',
  BANNERS: 'banners',
  REFRESH_TOKENS: 'refresh_tokens',
  FAVORITES: 'favorites',
  ISSUES: 'issues',
  FAQS: 'faqs'
};

// Database helper functions
const dbHelpers = {
  // Create a document
  async createDoc(collectionName, data, docId = null) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const docData = {
        ...data,
        created_at: timestamp,
        updated_at: timestamp
      };

      let docRef;
      if (docId) {
        docRef = db.collection(collectionName).doc(docId);
        await docRef.set(docData);
      } else {
        docRef = await db.collection(collectionName).add(docData);
      }

      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      logger.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  },

  // Get a document by ID
  async getDoc(collectionName, docId) {
    try {
      const doc = await db.collection(collectionName).doc(docId).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      logger.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  },

  // Get documents with queries (supports subcollections via path)
  async getDocs(collectionName, queries = [], orderBy = null, limit = null) {
    try {
      // Support both collection paths and subcollection paths
      // e.g., 'users' or 'users/userId/outlets'
      let query = db.collection(collectionName);

      // Apply where clauses
      queries.forEach(q => {
        if (q.type === 'where') {
          query = query.where(q.field, q.operator, q.value);
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.orderBy(orderBy.field, orderBy.direction || 'asc');
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      logger.info(`Fetched ${docs.length} documents from ${collectionName}`);
      
      return docs;
    } catch (error) {
      logger.error(`Error getting documents from ${collectionName}:`, error);
      throw error;
    }
  },

  // Update a document
  async updateDoc(collectionName, docId, data) {
    try {
      const updateData = {
        ...data,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection(collectionName).doc(docId).update(updateData);
      return await this.getDoc(collectionName, docId);
    } catch (error) {
      logger.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  },

  // Delete a document
  async deleteDoc(collectionName, docId) {
    try {
      await db.collection(collectionName).doc(docId).delete();
      return true;
    } catch (error) {
      logger.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  },

  // Batch operations
  async batchWrite(operations) {
    try {
      const batch = db.batch();
      
      operations.forEach(op => {
        const docRef = db.collection(op.collection).doc(op.docId);
        
        switch (op.type) {
          case 'set':
            batch.set(docRef, {
              ...op.data,
              created_at: admin.firestore.FieldValue.serverTimestamp(),
              updated_at: admin.firestore.FieldValue.serverTimestamp()
            });
            break;
          case 'update':
            batch.update(docRef, {
              ...op.data,
              updated_at: admin.firestore.FieldValue.serverTimestamp()
            });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }
      });

      await batch.commit();
      return true;
    } catch (error) {
      logger.error('Error in batch write:', error);
      throw error;
    }
  },

  // Transaction helper
  async runTransaction(callback) {
    try {
      return await db.runTransaction(callback);
    } catch (error) {
      logger.error('Error in transaction:', error);
      throw error;
    }
  },

  // Paginated query helper
  async getPaginatedDocs(collectionName, queries = [], page = 1, limit = 10) {
    try {
      let query = db.collection(collectionName);

      // Apply where clauses
      queries.forEach(q => {
        if (q.type === 'where') {
          query = query.where(q.field, q.operator, q.value);
        }
      });

      // Calculate offset
      const offset = (page - 1) * limit;

      // Get total count (simplified - in production you might want to cache this)
      const totalSnapshot = await query.get();
      const total = totalSnapshot.size;

      // Get paginated results
      const snapshot = await query.offset(offset).limit(limit).get();
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return {
        items,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit,
          has_next: page < Math.ceil(total / limit),
          has_previous: page > 1
        }
      };
    } catch (error) {
      logger.error(`Error in paginated query for ${collectionName}:`, error);
      throw error;
    }
  }
};

module.exports = {
  db,
  admin,
  collections,
  dbHelpers
};