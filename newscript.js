document.addEventListener("DOMContentLoaded", () => {
    const JSON_PATH = "DB/Volume1.json"; // Path to your JSON file
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

    let isAdminLoggedIn = false; // Track admin login state

    // Fetch JSON data
    async function fetchData() {
        try {
            const response = await fetch(JSON_PATH);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json(); // Return the parsed JSON object
        } catch (error) {
            console.error("Error fetching data:", error);
            return {}; // Return an empty object as fallback
        }
    }

    // Hash password
    async function hashPassword(password) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest("SHA-256", data);
            return Array.from(new Uint8Array(hashBuffer)).map(byte => byte.toString(16).padStart(2, "0")).join("");
        } catch (error) {
            console.error("Password hashing failed:", error);
        }
    }

    // Show admin login form
    function showAdminLogin() {
        adminLogin.classList.remove("hidden");
        adminPanel.classList.add("hidden");
        modsContainer.classList.add("hidden");
        blogContainer.classList.add("hidden");
        adminInfo?.classList.add("hidden");
    }

    // Show admin panel after login
    function showAdminPanel(username) {
        if (!isAdminLoggedIn) {
            alert("You must log in to access the Admin Panel!");
            showAdminLogin();
            return; // Prevent rendering the panel if not logged in
        }

        adminLogin.classList.add("hidden");
        adminPanel.classList.remove("hidden");
        modsContainer.classList.add("hidden");
        blogContainer.classList.add("hidden");

        adminInfo?.classList.remove("hidden");
        adminUsername.textContent = username;

        // Fetch data and set the admin's PFP
        fetchData().then((data) => {
            const adminAccounts = data.adminAccounts || {};
            const pfpUrl = adminAccounts[username]?.pfp || 'default-pfp.png'; // Fallback to default if no PFP exists
            adminPfp.src = `https://exonix.neocities.org/IMAGES/${pfpUrl}`;
        });
    }

    // Handle Admin Login
    document.getElementById("login-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const inputUsername = document.getElementById("username").value.trim();
        const inputPassword = document.getElementById("password").value.trim();
        const inputHashed = await hashPassword(inputPassword);

        const data = await fetchData();
        const adminAccounts = data.adminAccounts || {};

        if (adminAccounts[inputUsername] && inputHashed === adminAccounts[inputUsername]) {
            isAdminLoggedIn = true; // Mark the admin as logged in
            alert("Login successful!");
            showAdminPanel(inputUsername);
        } else {
            isAdminLoggedIn = false; // Ensure admin is not marked as logged in
            loginMessage.textContent = "Incorrect username or password!";
            loginMessage.classList.remove("hidden");
        }
    });

    // Render Mods
    async function renderMods(category = "all") {
        modsContainer.innerHTML = ""; // Clear container
        const data = await fetchData();
        const storedMods = data.mods || [];

        const filteredMods = category === "all"
            ? storedMods
            : storedMods.filter((mod) => mod.category?.toLowerCase() === category.toLowerCase());

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
        const data = await fetchData();
        const blogPosts = data.blogPosts || {};

        Object.keys(blogPosts).forEach((blogId) => {
            const blog = blogPosts[blogId];
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
