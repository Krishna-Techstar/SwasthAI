import axios from 'axios';

const API_URL = 'http://localhost:3001/api/v1';

async function testRegistration() {
  try {
    console.log('Testing Doctor Registration...');
    
    // 1. Send OTP (Dumb mode)
    console.log('Step 1: Sending OTP...');
    const otpRes = await axios.post(`${API_URL}/auth/otp/send`, {
      phone: '9876543210'
    });
    console.log('OTP Result:', otpRes.data);

    // 2. Verify OTP (Dumb mode - any 6 digits)
    console.log('Step 2: Verifying OTP...');
    const verifyRes = await axios.post(`${API_URL}/auth/otp/verify`, {
      phone: '9876543210',
      otp: '000000'
    });
    console.log('Verify Result:', verifyRes.data);

    // 3. Signup as Doctor
    console.log('Step 3: Signing up as Doctor...');
    const signupRes = await axios.post(`${API_URL}/auth/signup`, {
      role: 'DOCTOR',
      fullName: 'Dr. Demo Physician',
      email: `demo-doctor-${Date.now()}@swasthai.com`,
      phone: '9876543210',
      password: 'password123',
      registrationNumber: 'REG123456',
      specialization: 'General Medicine',
      experienceYears: 5
    });
    console.log('Signup Result:', signupRes.data);

    console.log('\n✅ TEST SUCCESSFUL!');
    console.log('Doctor registered and should be in the admin approval queue.');
  } catch (error) {
    console.error('❌ TEST FAILED');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRegistration();
