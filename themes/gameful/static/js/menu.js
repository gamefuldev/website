const menuBtn = document.getElementById("mobile-menu-button");
const menu = document.getElementById("main-menu");

menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("active");
    menu.classList.toggle("active");
});