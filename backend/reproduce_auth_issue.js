const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth/login';

async function testLogin(email, password, role) {
    try {
        const response = await axios.post(API_URL, {
            email,
            password,
            role
        });
        console.log(`Login SUCCESS for ${email} with password '${password}':`, response.status);
        console.log('Token:', response.data.token ? 'Received' : 'Missing');
    } catch (error) {
        if (error.response) {
            console.log(`Login FAILED for ${email} with password '${password}':`, error.response.status, error.response.data);
        } else {
            console.log(`Login ERROR:`, error.message);
        }
    }
}

async function runTests() {
    console.log('--- Testing Auth Logic ---');
    // 1. Correct credentials
    await testLogin('student@test.com', '123456', 'student');

    // 2. Wrong password
    await testLogin('student@test.com', 'wrongpass', 'student');

    // 3. User not found
    await testLogin('nonexistent@test.com', '123456', 'student');
}

runTests();
