#!/usr/bin/env node

/**
 * Setup script to create demo merchant account
 * Run this after starting the payments-server to create the demo merchant
 */

const fetch = require('node-fetch');

const PAYMENTS_SERVER_URL = 'http://localhost:5001';

async function setupDemoMerchant() {
  console.log('🔧 Setting up demo merchant account...\n');

  try {
    // Step 1: Create demo merchant account
    console.log('1. Creating demo merchant account...');
    const signupResponse = await fetch(`${PAYMENTS_SERVER_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'demo-merchant',
        password: 'demo-password-123',
        name: 'Demo Merchant'
      })
    });
    
    if (signupResponse.ok) {
      const signupData = await signupResponse.json();
      console.log('✅ Demo merchant created successfully');
      console.log(`   Merchant ID: ${signupData.merchant.id}`);
      console.log(`   Username: ${signupData.merchant.username}`);
      console.log(`   Token: ${signupData.token.substring(0, 20)}...`);
    } else if (signupResponse.status === 409) {
      console.log('ℹ️  Demo merchant already exists, proceeding with login...');
    } else {
      const errorData = await signupResponse.json();
      throw new Error(`Failed to create merchant: ${errorData.error}`);
    }

    // Step 2: Test login
    console.log('\n2. Testing merchant login...');
    const loginResponse = await fetch(`${PAYMENTS_SERVER_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'demo-merchant',
        password: 'demo-password-123'
      })
    });
    
    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      throw new Error(`Failed to login: ${errorData.error}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Merchant login successful');
    console.log(`   Token: ${loginData.token.substring(0, 20)}...`);
    
    // Step 3: Test merchant profile
    console.log('\n3. Testing merchant profile...');
    const profileResponse = await fetch(`${PAYMENTS_SERVER_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    if (!profileResponse.ok) {
      const errorData = await profileResponse.json();
      throw new Error(`Failed to get profile: ${errorData.error}`);
    }
    
    const profileData = await profileResponse.json();
    console.log('✅ Merchant profile retrieved');
    console.log(`   Merchant: ${profileData.merchant.name} (${profileData.merchant.username})`);
    
    console.log('\n🎉 Demo merchant setup completed successfully!');
    console.log('\nYou can now use these credentials in your demo backend:');
    console.log('MERCHANT_USERNAME=demo-merchant');
    console.log('MERCHANT_PASSWORD=demo-password-123');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\nMake sure the payments-server is running on http://localhost:5001');
  }
}

// Run the setup
setupDemoMerchant(); 