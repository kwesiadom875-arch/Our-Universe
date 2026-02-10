const API_URL = 'http://localhost:5000/api';

const runTests = async () => {
    try {
        console.log('--- Starting API Tests (Fetch) ---');

        // 1. Register
        console.log('1. Registering User...');
        let token;
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: `testuser_${Date.now()}`,
                    email: `test_${Date.now()}@example.com`,
                    password: 'password123'
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Registration failed');
            token = data.token;
            console.log('   Success! Token received.');
        } catch (err) {
            console.error('   Failed:', err.message);
            return;
        }

        // 2. Create Memory
        console.log('2. Creating Memory...');
        let memoryId;
        try {
            const res = await fetch(`${API_URL}/memories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    type: 'note',
                    content: 'Test Note Content',
                    style: { backgroundColor: '#fff' },
                    position: { x: 100, y: 100 }
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Create failed');
            memoryId = data._id;
            console.log('   Success! Memory created with ID:', memoryId);
        } catch (err) {
            console.error('   Failed:', err.message);
            return;
        }

        // 3. Get Memories
        console.log('3. Fetching Memories...');
        try {
            const res = await fetch(`${API_URL}/memories`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Fetch failed');

            const memory = data.find(m => m._id === memoryId);
            if (memory) {
                console.log('   Success! Created memory found in list.');
            } else {
                console.error('   Failed: Created memory NOT found.');
            }
        } catch (err) {
            console.error('   Failed:', err.message);
            return;
        }

        console.log('--- All Tests Passed ---');

    } catch (err) {
        console.error('Unexpected Error:', err);
    }
};

runTests();
