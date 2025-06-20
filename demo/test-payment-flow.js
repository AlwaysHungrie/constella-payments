#!/usr/bin/env node

/**
 * Test script for the payment flow
 * Run this after starting all services to test the complete flow
 */

const fetch = require('node-fetch');

const DEMO_BACKEND_URL = 'http://localhost:3001';
const PAYMENTS_SERVER_URL = 'http://localhost:5001';

async function testPaymentFlow() {
  console.log('🧪 Testing Payment Flow...\n');

  try {
    // Step 1: Login to payments-server as merchant
    console.log('1. Logging in to payments-server as merchant...');
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
      throw new Error(`Failed to login to payments-server: ${errorData.error}`);
    }
    
    const loginData = await loginResponse.json();
    const merchantToken = loginData.token;
    console.log('✅ Merchant login successful\n');

    // Step 2: Create payment request
    console.log('2. Creating payment request...');
    const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const createResponse = await fetch(`${PAYMENTS_SERVER_URL}/api/payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nonce })
    });
    
    const createData = await createResponse.json();
    
    if (!createResponse.ok) {
      throw new Error(`Failed to create payment request: ${createData.error}`);
    }
    
    console.log('✅ Payment request created');
    console.log(`   Wallet Address: ${createData.paymentRequest.walletAddress}`);
    console.log(`   Nonce: ${nonce}\n`);

    // Step 3: Claim payment using merchant token
    console.log('3. Claiming payment...');
    const claimResponse = await fetch(`${PAYMENTS_SERVER_URL}/api/payments/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${merchantToken}`
      },
      body: JSON.stringify({ nonce })
    });
    
    const claimData = await claimResponse.json();
    
    if (!claimResponse.ok) {
      throw new Error(`Failed to claim payment: ${claimData.error}`);
    }
    
    console.log('✅ Payment claimed successfully');
    console.log(`   Amount: ${claimData.paymentRequest.amount}`);
    console.log(`   Status: ${claimData.paymentRequest.status}\n`);

    // Step 4: Test demo backend claim endpoint
    console.log('4. Testing demo backend claim endpoint...');
    const demoBackendResponse = await fetch(`${DEMO_BACKEND_URL}/api/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-user-token' // This would be a real user token in practice
      },
      body: JSON.stringify({ 
        nonce: nonce + '-demo' // Use a different nonce for demo backend test
      })
    });
    
    if (demoBackendResponse.ok) {
      const demoData = await demoBackendResponse.json();
      console.log('✅ Demo backend claim successful');
      console.log(`   Amount: ${demoData.amount}`);
      console.log(`   User ID: ${demoData.user.id}`);
    } else {
      const demoError = await demoBackendResponse.json();
      console.log('ℹ️  Demo backend test (expected to fail without real user token):', demoError.error);
    }

    console.log('\n🎉 Payment flow test completed successfully!');
    console.log('\nThe payments-server authentication and claim flow is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure all services are running:');
    console.log('- Demo Backend: http://localhost:3001');
    console.log('- Payments Server: http://localhost:5001');
    console.log('- Frontend: http://localhost:3000');
    console.log('\nAlso ensure the demo merchant is set up in payments-server:');
    console.log('cd payments-server && node setup-demo-merchant.js');
  }
}

// Run the test
testPaymentFlow(); 