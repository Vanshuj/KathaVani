#!/usr/bin/env node
/**
 * KathaVani Administrator Bootstrap Script
 * Securely creates or verifies the initial system administrator account.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const run = async () => {
  const uri = (process.env.MONGODB_URI || '').trim();
  if (!uri || uri === 'inmemory') {
    console.log('ℹ️   Backend is running in in-memory mode. The default admin credentials are configured in db.js:');
    console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@kathavani.org'}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'AdminKatha@2024!'}`);
    process.exit(0);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB.');

    const adminEmail = (process.env.ADMIN_EMAIL || process.argv[2] || 'admin@kathavani.org').trim().toLowerCase();
    const adminPassword = (process.env.ADMIN_PASSWORD || process.argv[3] || 'AdminKatha@2024!').trim();
    const adminName = (process.env.ADMIN_NAME || process.argv[4] || 'Master Administrator').trim();

    if (adminPassword.length < 8) {
      console.error('❌ Error: Admin password must be at least 8 characters long.');
      process.exit(1);
    }

    const existingAdmin = await User.findOne({ email: adminEmail });
    const hash = await bcrypt.hash(adminPassword, 10);

    if (existingAdmin) {
      existingAdmin.role = 'admin';
      existingAdmin.status = 'active';
      existingAdmin.isDeleted = false;
      existingAdmin.password = hash;
      existingAdmin.name = adminName;
      await existingAdmin.save();
      console.log(`🛡️  Administrator account updated: ${adminEmail}`);
    } else {
      await User.create({
        name: adminName,
        email: adminEmail,
        password: hash,
        role: 'admin',
        status: 'active',
        language: 'English',
        region: 'Pan India',
        karma: 999,
        badges: ['Master Storyteller', 'Cultural Guardian']
      });
      console.log(`🛡️  Initial Administrator account created: ${adminEmail}`);
    }

    console.log('\n🔒 Initial Admin Credentials configured successfully.');
    console.log(`   Login URL: /admin/login`);
    console.log(`   Email: ${adminEmail}`);
    console.log('   (Password hashed with bcryptjs)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Bootstrap error:', err.message);
    process.exit(1);
  }
};

run();
