const axios = require('axios');

async function testDelete() {
    try {
        console.log("Logging in as admin...");
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@example.com',
            password: 'AdminPassword123!'
        });
        const token = loginRes.data.token;
        console.log("Admin token generated:", token.substring(0, 20) + '...');

        console.log("Fetching users...");
        const usersRes = await axios.get('http://localhost:5000/api/auth/users', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const users = usersRes.data;
        console.log(`Found ${users.length} users.`);

        const targetUser = users.find(u => u.email === 'subramanyac64@gmail.com');
        if (!targetUser) {
            console.log("User 'subramanyac64@gmail.com' not found.");
            // find by id instead
            const u2 = users.find(u => u.role !== 'admin');
            if (u2) {
                console.log(`Found non-admin user ${u2.email} with id ${u2.id}`);
                console.log("Attempting to delete user", u2.id);
                const rmRes = await axios.delete(`http://localhost:5000/api/auth/users/${u2.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("Delete response:", rmRes.data);
            }
            return;
        }

        console.log(`Attempting to delete user ${targetUser.id} (${targetUser.email})`);

        const deleteRes = await axios.delete(`http://localhost:5000/api/auth/users/${targetUser.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Delete success:", deleteRes.data);

    } catch (e) {
        console.error("Test failed!");
        if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Data:", e.response.data);
        } else {
            console.error(e.message);
        }
    }
}

testDelete();
