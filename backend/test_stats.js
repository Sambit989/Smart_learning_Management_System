const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testEndpoints() {
    try {
        console.log("1. Logging in as Student...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'alice@test.com',
            password: '123456'
        });
        const token = loginRes.data.token;
        console.log("   Login success. Token obtained.");

        console.log("\n2. Testing /stats/student...");
        try {
            const statsRes = await axios.get(`${API_URL}/stats/student`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("   Student Stats:", JSON.stringify(statsRes.data, null, 2));
        } catch (e) {
            console.error("   FAILED /stats/student:", e.message, e.response?.data);
        }

        console.log("\n3. Testing /courses/enrolled...");
        try {
            const coursesRes = await axios.get(`${API_URL}/courses/enrolled`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("   Enrolled Courses:", JSON.stringify(coursesRes.data, null, 2));
        } catch (e) {
            console.error("   FAILED /courses/enrolled:", e.message, e.response?.data);
        }

    } catch (err) {
        console.error("Login failed:", err.message, err.response?.data);
    }
}

async function testInstructor() {
    try {
        console.log("\n4. Logging in as Instructor...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'instructor@test.com',
            password: '123456'
        });
        const token = loginRes.data.token;
        console.log("   Login success.");

        console.log("   Testing /stats/instructor...");
        try {
            const res = await axios.get(`${API_URL}/stats/instructor`, { headers: { Authorization: `Bearer ${token}` } });
            console.log("   Instructor Stats:", JSON.stringify(res.data, null, 2));
        } catch (e) {
            console.error("   FAILED /stats/instructor:", e.message, e.response?.data);
        }

        console.log("   Testing /courses/instructor/students...");
        try {
            const res = await axios.get(`${API_URL}/courses/instructor/students`, { headers: { Authorization: `Bearer ${token}` } });
            console.log("   Instructor Students:", JSON.stringify(res.data, null, 2));
        } catch (e) {
            console.error("   FAILED /courses/instructor/students:", e.message, e.response?.data);
        }

    } catch (err) {
        console.error("Instructor Login failed:", err.message);
    }
}

async function runTests() {
    await testEndpoints();
    await testInstructor();
}

runTests();
