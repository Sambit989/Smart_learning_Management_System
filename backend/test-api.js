const axios = require('axios');

async function testLogin() {
    try {
        console.log('Attempting login to http://localhost:5000/api/auth/login ...');
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'alice@test.com',
            password: 'password123'
        });
        console.log('Login Successful!');
        console.log('Status:', res.status);
    } catch (err) {
        console.error('Login Failed!');
        if (err.code) console.error('Error Code:', err.code);
        if (err.message) console.error('Error Message:', err.message);
        if (err.response) {
            console.error('Response Status:', err.response.status);
            console.error('Response Data:', JSON.stringify(err.response.data, null, 2));
        } else if (err.request) {
            console.error('No response received. Request sent.');
        } else {
            console.error('Error setting up request:', err.message);
        }
    }
}

testLogin();
