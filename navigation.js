
const navigation = [
    { name: 'Dashboard', id: 'dashboard', current: true },
    { name: 'Materials', id: 'materials', current: false },
    { name: 'Settings', id: 'settings', current: false },
    { name: 'Map', id: 'map', current: false },
    { name: 'Testing', id: 'testing', current: false },
    { name: 'Simulation', id: 'simulation', current: false }
];

const navListMobile = document.getElementById('navigationListMobile');
const navListDesktop = document.getElementById('navigationListDesktop');
const pageContent = document.getElementById('pageContent');
const currentPageMobile = document.getElementById('currentPageMobile');

// Generate navigation links
function generateNavigation() {
    navigation.forEach(item => {
        const navItemMobile = `
            <li>
                <a href="#" id="${item.id}NavLinkMobile"
                    class="${item.current ? 'bg-gray-50' : 'hover:bg-gray'} text-accentcolor group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold">
                    <img src="./icons/accent/${item.id}.svg" class="w-6 h-6">
                    ${item.name}
                </a>
            </li>
        `;

        const navItem = `
            <li>
                <a href="#" id="${item.id}NavLink"
                    class="${item.current ? 'bg-gray-50' : 'hover:bg-gray'} text-accentcolor group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold">
                    <img src="./icons/accent/${item.id}.svg" class="w-6 h-6">
                    ${item.name}
                </a>
            </li>
        `;

        navListMobile.innerHTML += navItemMobile;
        navListDesktop.innerHTML += navItem;
    });
}

function updateContent(id) {
    navigation.forEach(item => {
        if (item.id === id) {
            item.current = true;
            let page = document.getElementById(item.id);
            page.style.display = 'grid';
            document.getElementById("mobileTopBarTitle").innerHTML = item.name
        } else {
            item.current = false;
            let page = document.getElementById(item.id);
            page.style.display = 'none';
        }
    });
    navListMobile.innerHTML = '';
    navListDesktop.innerHTML = '';
    generateNavigation();
    addEventListeners();
    
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

// Add event listeners to navigation items
function addEventListeners() {
    navigation.forEach(item => {
        const navItemMobile = document.getElementById(`${item.id}NavLinkMobile`);
        if (navItemMobile) {
            navItemMobile.addEventListener('click', (e) => {
                e.preventDefault();
                updateContent(item.id);
                // Close mobile sidebar after selecting an item
                document.getElementById('mobileSidebar').classList.add('hidden');
            });
        }

        const navItemDesktop = document.getElementById(`${item.id}NavLink`);
        if (navItemDesktop) {
            navItemDesktop.addEventListener('click', (e) => {
                e.preventDefault();
                updateContent(item.id);
            });
        }
    });
}

generateNavigation();
addEventListeners();

// Sidebar toggle functionality
const sidebar = document.getElementById('mobileSidebar');
const openSidebarBtn = document.getElementById('openSidebarBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');

openSidebarBtn.addEventListener('click', () => {
    sidebar.classList.remove('hidden');
});

closeSidebarBtn.addEventListener('click', () => {
    sidebar.classList.add('hidden');
});

updateContent("dashboard")