// auth.js - Authentication APIs
async function loginAPI(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            let errorMsg = 'Đăng nhập thất bại';
            try {
                const errData = await response.json();
                errorMsg = errData.detail || errorMsg;
            } catch (e) {}
            throw new Error(errorMsg);
        }

        const data = await response.json();
        // data.access_token will just be token
        localStorage.setItem('token', data.access_token);
        
        // Fetch full user profile after login
        await fetchCurrentUser();
        return true;
    } catch (error) {
        throw error;
    }
}

async function registerAPI(userData) {
    // userData expects: { username, password, email, fullName }
    return await fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

async function fetchCurrentUser() {
    try {
        const user = await fetchAPI('/users/me');
        if (user) {
            // Standardize format to what the app expects
            const currentUser = {
                id: user.id,
                username: user.username,
                email: user.email || '',
                fullName: user.fullName || user.username,
                role: user.role,
                status: user.status
            };
            localStorage.setItem('petshop_current_user', JSON.stringify(currentUser));
            return currentUser;
        }
    } catch (error) {
        console.error("Failed to fetch current user profile");
        localStorage.removeItem('petshop_current_user');
        localStorage.removeItem('token');
        return null;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('petshop_current_user');
    window.location.href = 'login.html';
}

function getCurrentUser() {
    const userStr = localStorage.getItem('petshop_current_user');
    return userStr ? JSON.parse(userStr) : null;
}
