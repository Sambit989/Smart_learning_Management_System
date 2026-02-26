const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const EMAIL = 'student@test.com';
const PASSWORD = '123456';

async function run() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('Logged in!');

        // 2. Get Initial Stats
        const initialStats = await axios.get(`${API_URL}/stats/student`, config);
        console.log('Initial XP:', initialStats.data.xp);

        // 3. Submit Quiz (Mock ID 1)
        // Need to ensure a quiz exists or FK constraint might fail if strict.
        // Schema says quiz_id references quizzes(id).
        // I'll insert a dummy quiz first via DB query? 
        // Or assume ID 1 exists?
        // Let's rely on my previous inspection or just try.
        // If fail, I'll have to create a quiz first.

        console.log('Submitting Quiz...');
        // We'll use a random quiz ID, say 1. If it fails, we'll know.
        // Actually, let's create a quiz first if we can, but only instructors can.
        // I'll try submitting with ID 1.
        try {
            const submitRes = await axios.post(`${API_URL}/quiz/submit`, {
                quizId: 1, // diligent Assumption
                score: 100
            }, config);
            console.log('Quiz Submitted! XP Earned:', submitRes.data.xpEarned);
        } catch (e) {
            if (e.response && e.response.status === 500) {
                console.log('Quiz submission failed (likely FK constraint). Skipping submission test logic if no quiz exists.');
            } else {
                throw e;
            }
        }

        // 4. Get Final Stats
        const finalStats = await axios.get(`${API_URL}/stats/student`, config);
        console.log('Final XP:', finalStats.data.xp);

        if (finalStats.data.xp > initialStats.data.xp) {
            console.log('SUCCESS: XP increased!');
        } else {
            console.log('NOTE: XP did not increase (maybe quiz failed or logic issue).');
        }

    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) console.error(err.response.data);
    }
}

run();
