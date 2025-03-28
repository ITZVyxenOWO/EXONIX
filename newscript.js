// Initialize Supabase
const supabaseUrl = "https://gxomwxrhuuhnxknqthgm.supabase.co";
const supabaseKey = "your_supabase_key";  // Replace with actual Supabase key (should be kept secret)
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", async () => {
    const modsContainer = document.getElementById("mods-list");
    const blogContainer = document.getElementById("blog-posts");
    const adminLogin = document.getElementById("admin-login");
    const adminPanel = document.getElementById("admin-panel");
    const loginMessage = document.getElementById("login-message");
    const adminUsername = document.getElementById("admin-username");
    const adminPfp = document.getElementById("admin-pfp");
    let isAdminLoggedIn = false;

    // Fetch data from Supabase table
    async function fetchData(table) {
        const { data, error } = await supabase.from(table).select("*");
        if (error) {
            console.error("Error fetching data:", error);
            return [];
        }
        return data;
    }

    async function renderMods() {
        modsContainer.innerHTML = "";
        const mods = await fetchData("mods");
        mods.forEach(mod => {
            const modCard = document.createElement("div");
            modCard.classList.add("mod-card");
            modCard.innerHTML = `
                <div class="mod-tag">${mod.category || 'Unknown'}</div>
                <img src="${mod.image || 'default-image.jpg'}" alt="${mod.name}">
                <h3>${mod.name}</h3>
                <p>${mod.description}</p>
                <button class="download-btn">Download</button>
            `;
            modsContainer.appendChild(modCard);
        });
    }

    async function renderBlogs() {
        blogContainer.innerHTML = "";
        const blogs = await fetchData("blogPosts");
        blogs.forEach(blog => {
            const blogCard = document.createElement("div");
            blogCard.classList.add("blog-card");
            blogCard.innerHTML = `
                <h3>${blog.title}</h3>
                <p>${blog.content}</p>
                <small>By ${blog.username}</small>
            `;
            blogContainer.appendChild(blogCard);
        });
    }

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Admin Login
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Example: Hashing password and comparing with stored password in Supabase
        const hashedPassword = await hashPassword(password);

        const { data, error } = await supabase
            .from("admins")
            .select("*")
            .eq("username", username)
            .eq("password", hashedPassword);

        if (error || !data.length) {
            loginMessage.classList.remove("hidden");
            loginMessage.textContent = "Invalid credentials!";
        } else {
            isAdminLoggedIn = true;
            adminLogin.classList.add("hidden");
            adminPanel.classList.remove("hidden");

            // Admin profile data
            adminUsername.textContent = data[0].username;
            adminPfp.src = data[0].profile_picture_url;
        }
    });

    // Call functions to render data
    renderMods();
    renderBlogs();
});
