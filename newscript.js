// Initialize Supabase
const supabaseUrl = "https://gxomwxrhuuhnxknqthgm.supabase.co";
const supabaseKey = "YOUR_SUPABASE_KEY"; // Keep this key secure!

document.addEventListener("DOMContentLoaded", async () => {
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);
    const modsContainer = document.getElementById("mods-list");
    const blogContainer = document.getElementById("blog-posts");
    const adminLogin = document.getElementById("admin-login");
    const adminPanel = document.getElementById("admin-panel");
    const loginMessage = document.getElementById("login-message");
    const adminUsername = document.getElementById("admin-username");
    const adminPfp = document.getElementById("admin-pfp");
    let isAdminLoggedIn = false;

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
        return hashArray.map(byte => byte.toString(16).padStart(2,
