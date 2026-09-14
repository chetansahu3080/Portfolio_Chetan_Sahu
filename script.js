

/* =========================================
   DARK / LIGHT MODE
========================================= */

const themeBtn = document.getElementById("theme-btn");

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("light-mode");

    const icon = themeBtn.querySelector("i");

    if (document.body.classList.contains("light-mode")) {

        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");

    } else {

        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");

    }

});


/* =========================================
   SCROLL TO TOP
========================================= */

const topBtn = document.getElementById("top-btn");

topBtn.addEventListener("click", () => {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});


/* =========================================
   SHOW / HIDE TOP BUTTON
========================================= */

window.addEventListener("scroll", () => {

    if (window.scrollY > 300) {

        topBtn.style.opacity = "1";
        topBtn.style.visibility = "visible";

    } else {

        topBtn.style.opacity = "0";
        topBtn.style.visibility = "hidden";

    }

});


/* Initial state */

topBtn.style.opacity = "0";
topBtn.style.visibility = "hidden";


/* =========================================
   ACTIVE NAVIGATION LINK
========================================= */

const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".navbar nav a");

window.addEventListener("scroll", () => {

    let currentSection = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;

        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight
        ) {

            currentSection = section.getAttribute("id");

        }

    });


    navLinks.forEach(link => {

        link.classList.remove("active");

        if (
            link.getAttribute("href") ===
            "#" + currentSection
        ) {

            link.classList.add("active");

        }

    });

});


/* =========================================
   SCROLL REVEAL ANIMATION
========================================= */

const revealElements = document.querySelectorAll(
    ".feature-card, .skill-card, .project-card, .timeline-item"
);

const revealObserver = new IntersectionObserver(
    (entries, observer) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

                observer.unobserve(entry.target);

            }

        });

    },
    {
        threshold: 0.15
    }
);


revealElements.forEach(element => {

    element.classList.add("reveal");

    revealObserver.observe(element);

});


/* =========================================
   PROJECT HOVER EFFECT
========================================= */

const projectCards =
    document.querySelectorAll(".project-card");

projectCards.forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.transform =
            "translateY(-7px)";

    });


    card.addEventListener("mouseleave", () => {

        card.style.transform =
            "translateY(0)";

    });

});


/* =========================================
   SMOOTH NAVIGATION
========================================= */

navLinks.forEach(link => {

    link.addEventListener("click", event => {

        event.preventDefault();

        const targetId =
            link.getAttribute("href");

        const target =
            document.querySelector(targetId);

        if (target) {

            target.scrollIntoView({
                behavior: "smooth"
            });

        }

    });

});


/* =========================================
   CONSOLE MESSAGE
========================================= */

console.log(
    "Welcome to Chetan Sahu's Portfolio 🚀"
);

