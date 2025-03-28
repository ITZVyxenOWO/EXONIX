// Supabase Integration Code Example

const { createClient } = supabase;
const SUPABASE_URL = "https://your-supabase-url.supabase.co";
const SUPABASE_KEY = "your-anon-key";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", () => {
    const modsContainer = document.getElementById("mods-container");
    const blogContainer = document.getElementById("blog-container");
    const adminLogin = document.getElementById("admin-login");
    const adminPanel = document.getElementById("admin-panel");
    const loginMessage = document.getElementById("login-message");
    const adminInfo = document.getElementById("admin-info");
    const adminUsername = document.getElementById("admin-username");
    const adminPfp = document.getElementById("admin-pfp");
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    let isAdminLoggedIn = false;

    async function fetchData(table) {
        try {
            const { data, error } = await supabaseClient.from(table).select("*");
            if (error) throw error;
            return data;
        } catch (error) {
            console.error(`Error fetching ${table} data:`, error);
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
        adminInfo.classList.remove("hidden");
        adminUsername.textContent = username;
        adminPfp.src = pfpUrl || 'default-pfp.png';
    }

    document.getElementById("login-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const inputUsername = document.getElementById("username").value.trim();
        const inputPassword = document.getElementById("password").value.trim();
        const inputHashed = await hashPassword(inputPassword);

        const admins = await fetchData("adminAccounts");
        const admin = admins.find(a => a.username === inputUsername && a.password === inputHashed);
        
        if (admin) {
            isAdminLoggedIn = true;
            alert("Login successful!");
            showAdminPanel(admin.username, admin.pfp);
        } else {
            loginMessage.textContent = "Incorrect username or password!";
            loginMessage.classList.remove("hidden");
        }
    });

    async function renderMods(category = "all") {
        modsContainer.innerHTML = "";
        const mods = await fetchData("mods");
        
        const filteredMods = category === "all" ? mods : mods.filter(mod => mod.category?.toLowerCase() === category.toLowerCase());
        
        filteredMods.forEach((mod) => {
            const modCard = document.createElement("div");
            modCard.classList.add("mod-card");
            modCard.innerHTML = `
                <div class="mod-tag">${mod.category || 'Unknown'}</div>
                <small class="mod-id">Mod ID: <b>${mod.id || 'N/A'}</b></small>
                <img src="${mod.image || 'default-image.jpg'}" alt="${mod.name}" onerror="this.src='default-image.jpg'">
                <h3>${mod.name || 'Unnamed Mod'}</h3>
                <p>${mod.description || 'No description available.'}</p>
                <button class="download-btn">Download</button>
                <footer>${mod.author ? `Developed By ${mod.author}` : 'Unknown Author'}</footer>
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
                <div style="display: flex; align-items: center;">
                    <img src="${blog.userPfp || 'default-pfp.png'}" alt="${blog.username}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;">
                    <span>${blog.username || 'Unknown User'}</span>
                </div>
                <h3>${blog.title || 'Untitled'}</h3>
                <p>${blog.content || 'No content available.'}</p>
                <small>Posted on: ${blog.date || 'Unknown Date'}</small>
            `;
            blogContainer.appendChild(blogCard);
        });
    }

    tabButtons.forEach((button) => button.addEventListener("click", (event) => {
        tabButtons.forEach(btn => btn.classList.remove("active"));
        tabContents.forEach(content => content.classList.add("hidden"));
        event.target.classList.add("active");
        document.getElementById(event.target.getAttribute("data-tab")).classList.remove("hidden");
    }));

    document.querySelectorAll("nav a").forEach(link => link.addEventListener("click", (e) => {
        e.preventDefault();
        const category = e.target.getAttribute("data-category");
        if (category === "admin") {
            showAdminLogin();
        } else if (category === "blogs") {
            renderBlogs();
            blogContainer.classList.remove("hidden");
        } else {
            renderMods(category);
            modsContainer.classList.remove("hidden");
        }
    }));

    renderMods("all");
    renderBlogs();
});
