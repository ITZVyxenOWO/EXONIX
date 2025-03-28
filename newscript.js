// Supabase Integration Code Example with GitHub Secrets

const { createClient } = supabase;
const SUPABASE_URL = "https://gxomwxrhuuhnxknqthgm.supabase.co";
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
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    let isAdminLoggedIn = false;

    // Fetch data from Supabase
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

    // Hash password
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer)).map(byte => byte.toString(16).padStart(2, "0")).join("");
    }

    // Show admin login form
    function showAdminLogin() {
        adminLogin.classList.remove("hidden");
        adminPanel.classList.add("hidden");
        modsContainer.classList.add("hidden");
        blogContainer.classList.add("hidden");
    }

    // Show admin panel after login
    function showAdminPanel(username, pfpUrl) {
        if (!isAdminLoggedIn) {
            alert("You must log in to access the Admin Panel!");
            showAdminLogin();
            return;
        }
        adminLogin.classList.add("hidden");
        adminPanel.classList.remove("hidden");
        modsContainer.classList.add("hidden");
        blogContainer.classList.add("hidden");

        adminUsername.textContent = username;
        adminPfp.src = pfpUrl || "default-pfp.png";
    }

    // Handle Admin Login
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

    // Render Mods
    async function renderMods(category = "all") {
        modsContainer.innerHTML = ""; // Clear container
        const mods = await fetchData("mods");
        const filteredMods = category === "all" ? mods : mods.filter((mod) => mod.category?.toLowerCase() === category.toLowerCase());

        filteredMods.forEach((mod) => {
            const modCard = document.createElement("div");
            modCard.classList.add("mod-card");

            const isComingSoon = mod.status === "coming-soon";
            const isTBC = mod.status === "tbc";
            const buttonText = isComingSoon ? "Coming Soon" : isTBC ? "TBC" : "Download";

            modCard.innerHTML = `
                <div class="mod-tag">${mod.category || 'Unknown Category'}</div>
                <small class="mod-id">Mod ID: <b>${mod.id || 'N/A'}</b></small>
                <img src="${mod.image || 'default-image.jpg'}" alt="${mod.name || 'Unnamed Mod'}" onerror="this.src='default-image.jpg'">
                <h3>${mod.name || 'Unnamed Mod'}</h3>
                <p>${mod.description || 'No description available.'}</p>
                ${isComingSoon || isTBC
                    ? `<span class="status red">${buttonText}</span>` 
                    : `<button class="download-btn">${buttonText}</button>`}
                <footer>${mod.author?.type === "Developer"
                    ? `Developed By ${mod.author?.name || 'Unknown Author'}` 
                    : `Sourced By ${mod.author?.name || 'Unknown Author'}`}</footer>
            `;
            modsContainer.appendChild(modCard);
        });
    }

    // Render Blog Posts
    async function renderBlogs() {
        blogContainer.innerHTML = ""; // Clear container
        const blogs = await fetchData("blogPosts");
        blogs.forEach((blog) => {
            const blogCard = document.createElement("div");
            blogCard.classList.add("blog-card");

            blogCard.innerHTML = `
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <img src="${blog.userPfp || 'default-pfp.png'}" alt="${blog.username || 'Unknown User'}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;">
                    <span>${blog.username || 'Unknown User'}</span>
                </div>
                <h3>${blog.title || 'Untitled Blog'}</h3>
                <p>${blog.content || 'No content available.'}</p>
                <small>Posted on: ${blog.date || 'Unknown Date'}</small>
            `;
            blogContainer.appendChild(blogCard);
        });
    }

    // Tab Switching for Admin Panel
    function switchTab(event) {
        tabButtons.forEach((button) => button.classList.remove("active"));
        tabContents.forEach((content) => content.classList.add("hidden"));
        event.target.classList.add("active");
        const targetTab = event.target.getAttribute("data-tab");
        const targetContent = document.getElementById(targetTab);
        targetContent.classList.remove("hidden");
    }

    tabButtons.forEach((button) => {
        button.addEventListener("click", switchTab);
    });

    // Handle Navigation Links
    document.querySelectorAll("nav a").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const category = e.target.getAttribute("data-category");

            if (category === "admin") {
                showAdminLogin();
            } else if (category === "blogs") {
                renderBlogs();
                blogContainer.classList.remove("hidden");
                modsContainer.classList.add("hidden");
                adminLogin.classList.add("hidden");
                adminPanel.classList.add("hidden");
            } else {
                renderMods(category);
                modsContainer.classList.remove("hidden");
                blogContainer.classList.add("hidden");
                adminLogin.classList.add("hidden");
                adminPanel.classList.add("hidden");
            }
        });
    });

    // Initial Rendering
    renderMods("all");
    renderBlogs();
});
