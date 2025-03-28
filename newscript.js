// Supabase Integration Code Example with GitHub Secrets

const { createClient } = supabase;
const SUPABASE_URL = "https://your-supabase-url.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY; // Fetching from GitHub Secrets
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", async () => {
    const modsContainer = document.getElementById("mods-container");
    const blogContainer = document.getElementById("blog-container");
    const adminLogin = document.getElementById("admin-login");
    const adminPanel = document.getElementById("admin-panel");
    const loginMessage = document.getElementById("login-message");
    const adminUsername = document.getElementById("admin-username");
    const adminPfp = document.getElementById("admin-pfp");
    let isAdminLoggedIn = false;

    async function fetchData(table) {
        try {
            const { data, error } = await supabaseClient.from(table).select("*");
            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    }

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer)).map(byte => byte.toString(16).padStart(2, "0")).join("");
    }

    function showAdminLogin() {
        adminLogin.classList.remove("hidden");
        adminPanel.classList.add("hidden");
    }

    function showAdminPanel(username, pfpUrl) {
        if (!isAdminLoggedIn) {
            alert("You must log in to access the Admin Panel!");
            showAdminLogin();
            return;
        }
        adminLogin.classList.add("hidden");
        adminPanel.classList.remove("hidden");
        adminUsername.textContent = username;
        adminPfp.src = pfpUrl || "default-pfp.png";
    }

    document.getElementById("login-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const inputUsername = document.getElementById("username").value.trim();
        const inputPassword = document.getElementById("password").value.trim();
        const inputHashed = await hashPassword(inputPassword);

        const admins = await fetchData("adminAccounts");
        const admin = admins.find(acc => acc.username === inputUsername && acc.password === inputHashed);

        if (admin) {
            isAdminLoggedIn = true;
            alert("Login successful!");
            showAdminPanel(admin.username, admin.pfp);
        } else {
            loginMessage.textContent = "Incorrect username or password!";
            loginMessage.classList.remove("hidden");
        }
    });

    async function renderMods() {
        modsContainer.innerHTML = "";
        const mods = await fetchData("mods");
        mods.forEach((mod) => {
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
        blogs.forEach((blog) => {
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

    await renderMods();
    await renderBlogs();
});
