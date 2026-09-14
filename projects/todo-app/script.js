/* =========================================================
   TODO APP - JAVASCRIPT
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const allCount = document.getElementById("allCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");

const filterButtons = document.querySelectorAll(".filter-btn");
const navItems = document.querySelectorAll(".nav-item");

const sortBtn = document.getElementById("sortBtn");
const sortMenu = document.getElementById("sortMenu");

const editModal = document.getElementById("editModal");
const editTaskInput = document.getElementById("editTaskInput");
const saveEditBtn = document.getElementById("saveEditBtn");
const closeModal = document.getElementById("closeModal");


/* =========================================================
   VARIABLES
========================================================= */

let currentFilter = "all";
let currentSort = "default";
let taskBeingEdited = null;


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    attachTaskEvents();

    updateCounters();

    updateEmptyState();

    updateGreeting();

});


/* =========================================================
   ADD TASK
========================================================= */

function addTask() {

    const taskText = taskInput.value.trim();

    // Don't add empty tasks
    if (taskText === "") {

        taskInput.focus();

        return;
    }


    const task = createTaskElement(taskText);

    taskList.appendChild(task);


    // Clear input
    taskInput.value = "";

    taskInput.focus();


    // Attach events to newly created task
    attachTaskEventsTo(task);


    updateCounters();

    applyFilter();

    saveTasks();

}


/* =========================================================
   CREATE TASK
========================================================= */

function createTaskElement(taskText) {

    const task = document.createElement("article");

    task.className = "task-card pending-task";

    task.dataset.category = "personal";
    task.dataset.status = "pending";


    task.innerHTML = `

        <button class="task-check">

            <i class="fa-solid fa-check"></i>

        </button>


        <div class="task-information">

            <h3>${escapeHTML(taskText)}</h3>


            <div class="task-meta">

                <span class="category personal">

                    <i class="fa-solid fa-cart-shopping"></i>

                    Personal

                </span>


                <span class="task-date">

                    <i class="fa-regular fa-calendar"></i>

                    Today

                </span>

            </div>

        </div>


        <div class="task-actions">

            <button class="edit-btn">

                <i class="fa-regular fa-pen-to-square"></i>

            </button>


            <button class="delete-btn">

                <i class="fa-regular fa-trash-can"></i>

            </button>


            <button class="more-btn">

                <i class="fa-solid fa-ellipsis-vertical"></i>

            </button>

        </div>

    `;


    return task;
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* =========================================================
   ADD BUTTON
========================================================= */

addTaskBtn.addEventListener("click", addTask);


/* =========================================================
   ENTER KEY
========================================================= */

taskInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        addTask();

    }

});


/* =========================================================
   TASK EVENTS
========================================================= */

function attachTaskEvents() {

    const tasks = document.querySelectorAll(".task-card");

    tasks.forEach(task => {

        attachTaskEventsTo(task);

    });

}


function attachTaskEventsTo(task) {

    const checkButton = task.querySelector(".task-check");
    const deleteButton = task.querySelector(".delete-btn");
    const editButton = task.querySelector(".edit-btn");


    /* Complete task */

    checkButton.addEventListener("click", () => {

        toggleTask(task);

    });


    /* Delete task */

    deleteButton.addEventListener("click", () => {

        deleteTask(task);

    });


    /* Edit task */

    editButton.addEventListener("click", () => {

        openEditModal(task);

    });

}


/* =========================================================
   COMPLETE / UNCOMPLETE
========================================================= */

function toggleTask(task) {

    const isCompleted =
        task.dataset.status === "completed";


    if (isCompleted) {

        // Make pending

        task.dataset.status = "pending";

        task.classList.remove("completed-task");

        task.classList.add("pending-task");

        task.querySelector(".task-check")
            .classList.remove("checked");

    }

    else {

        // Make completed

        task.dataset.status = "completed";

        task.classList.remove("pending-task");

        task.classList.add("completed-task");

        task.querySelector(".task-check")
            .classList.add("checked");

    }


    updateCounters();

    applyFilter();

    saveTasks();

}


/* =========================================================
   DELETE TASK
========================================================= */

function deleteTask(task) {

    task.style.transform = "translateX(40px)";
    task.style.opacity = "0";


    setTimeout(() => {

        task.remove();

        updateCounters();

        updateEmptyState();

        saveTasks();

    }, 250);

}


/* =========================================================
   FILTER SYSTEM
========================================================= */

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        const filter = button.dataset.filter;

        setFilter(filter);

    });

});


navItems.forEach(button => {

    button.addEventListener("click", () => {

        const filter = button.dataset.filter;

        setFilter(filter);

    });

});


function setFilter(filter) {

    currentFilter = filter;


    /* Update top filter buttons */

    filterButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.filter === filter
        );

    });


    /* Update sidebar buttons */

    navItems.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.filter === filter
        );

    });


    applyFilter();

}


function applyFilter() {

    const tasks =
        document.querySelectorAll(".task-card");


    let visibleTasks = 0;


    tasks.forEach(task => {

        const status = task.dataset.status;


        let shouldShow = false;


        if (currentFilter === "all") {

            shouldShow = true;

        }

        else if (currentFilter === "pending") {

            shouldShow = status === "pending";

        }

        else if (currentFilter === "completed") {

            shouldShow = status === "completed";

        }


        if (shouldShow) {

            task.style.display = "flex";

            visibleTasks++;

        }

        else {

            task.style.display = "none";

        }

    });


    emptyState.classList.toggle(
        "show",
        visibleTasks === 0
    );

}


/* =========================================================
   COUNTERS
========================================================= */

function updateCounters() {

    const tasks =
        document.querySelectorAll(".task-card");


    let pending = 0;
    let completed = 0;


    tasks.forEach(task => {

        if (task.dataset.status === "pending") {

            pending++;

        }

        else if (task.dataset.status === "completed") {

            completed++;

        }

    });


    const total = pending + completed;


    allCount.textContent = total;

    pendingCount.textContent = pending;

    completedCount.textContent = completed;


    updateEmptyState();

}


/* =========================================================
   EMPTY STATE
========================================================= */

function updateEmptyState() {

    const tasks =
        document.querySelectorAll(".task-card");


    let visible = 0;


    tasks.forEach(task => {

        if (task.style.display !== "none") {

            visible++;

        }

    });


    emptyState.classList.toggle(
        "show",
        visible === 0
    );

}


/* =========================================================
   SORT MENU
========================================================= */

sortBtn.addEventListener("click", (event) => {

    event.stopPropagation();

    sortMenu.classList.toggle("show");

});


document.addEventListener("click", () => {

    sortMenu.classList.remove("show");

});


sortMenu.addEventListener("click", (event) => {

    const button =
        event.target.closest("button");


    if (!button) return;


    currentSort = button.dataset.sort;

    sortTasks(currentSort);

    sortMenu.classList.remove("show");

});


/* =========================================================
   SORT TASKS
========================================================= */

function sortTasks(type) {

    const tasks =
        [...document.querySelectorAll(".task-card")];


    if (type === "az") {

        tasks.sort((a, b) => {

            const titleA =
                a.querySelector("h3").textContent.toLowerCase();

            const titleB =
                b.querySelector("h3").textContent.toLowerCase();

            return titleA.localeCompare(titleB);

        });

    }


    else if (type === "za") {

        tasks.sort((a, b) => {

            const titleA =
                a.querySelector("h3").textContent.toLowerCase();

            const titleB =
                b.querySelector("h3").textContent.toLowerCase();

            return titleB.localeCompare(titleA);

        });

    }


    else if (type === "newest") {

        tasks.reverse();

    }


    else if (type === "oldest") {

        // Keep original order
        tasks.reverse();

    }


    tasks.forEach(task => {

        taskList.appendChild(task);

    });


    applyFilter();

}


/* =========================================================
   EDIT MODAL
========================================================= */

function openEditModal(task) {

    taskBeingEdited = task;


    const title =
        task.querySelector("h3").textContent;


    editTaskInput.value = title;


    editModal.classList.add("show");


    setTimeout(() => {

        editTaskInput.focus();

        editTaskInput.select();

    }, 100);

}


/* =========================================================
   SAVE EDIT
========================================================= */

saveEditBtn.addEventListener("click", saveEdit);


editTaskInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        saveEdit();

    }

});


function saveEdit() {

    if (!taskBeingEdited) return;


    const newTitle =
        editTaskInput.value.trim();


    if (newTitle === "") {

        editTaskInput.focus();

        return;

    }


    taskBeingEdited.querySelector("h3")
        .textContent = newTitle;


    closeEditModal();

    saveTasks();

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeEditModal() {

    editModal.classList.remove("show");

    taskBeingEdited = null;

}


closeModal.addEventListener(
    "click",
    closeEditModal
);


editModal.addEventListener("click", (event) => {

    if (event.target === editModal) {

        closeEditModal();

    }

});


document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        closeEditModal();

    }

});


/* =========================================================
   LOCAL STORAGE
========================================================= */

function saveTasks() {

    const tasks =
        [...document.querySelectorAll(".task-card")];


    const taskData = tasks.map(task => {

        return {

            title:
                task.querySelector("h3").textContent,

            status:
                task.dataset.status,

            category:
                task.dataset.category,

            categoryName:
                task.querySelector(".category")
                    .textContent.trim(),

            date:
                task.querySelector(".task-date")
                    .textContent.trim()

        };

    });


    localStorage.setItem(
        "todoTasks",
        JSON.stringify(taskData)
    );

}


/* =========================================================
   LOAD TASKS
========================================================= */

function loadTasks() {

    const savedTasks =
        localStorage.getItem("todoTasks");


    if (!savedTasks) return;


    try {

        const tasks =
            JSON.parse(savedTasks);


        if (!Array.isArray(tasks)) return;


        taskList.innerHTML = "";


        tasks.forEach(data => {

            const task =
                createTaskElement(data.title);


            task.dataset.category =
                data.category || "personal";

            task.dataset.status =
                data.status || "pending";


            const category =
                task.querySelector(".category");


            const date =
                task.querySelector(".task-date");


            if (data.categoryName) {

                category.innerHTML =
                    `<i class="fa-solid fa-tag"></i>
                     ${escapeHTML(data.categoryName)}`;

            }


            if (data.date) {

                date.innerHTML =
                    `<i class="fa-regular fa-calendar"></i>
                     ${escapeHTML(data.date)}`;

            }


            if (data.status === "completed") {

                task.classList.remove("pending-task");

                task.classList.add("completed-task");

                task.querySelector(".task-check")
                    .classList.add("checked");

            }


            taskList.appendChild(task);

            attachTaskEventsTo(task);

        });


        updateCounters();

        applyFilter();


    }

    catch (error) {

        console.error(
            "Unable to load tasks:",
            error
        );

    }

}


/* =========================================================
   LOAD SAVED DATA
========================================================= */

loadTasks();


/* =========================================================
   GREETING
========================================================= */

function updateGreeting() {

    const hour = new Date().getHours();

    const heading =
        document.querySelector(".welcome-text h2");


    if (!heading) return;


    let greeting;


    if (hour < 12) {

        greeting = "Good Morning,";

    }

    else if (hour < 17) {

        greeting = "Good Afternoon,";

    }

    else {

        greeting = "Good Evening,";

    }


    heading.innerHTML =
        `${greeting}
         <span class="wave">👋</span>`;

}


/* =========================================================
   ADD CATEGORY BUTTON
========================================================= */

const addCategory =
    document.querySelector(".add-category");


addCategory.addEventListener("click", () => {

    const categoryName =
        prompt("Enter a new category:");


    if (!categoryName) return;


    alert(
        `"${categoryName}" category created!`
    );

});


/* =========================================================
   MORE BUTTON
========================================================= */

document.addEventListener("click", (event) => {

    const moreButton =
        event.target.closest(".more-btn");


    if (!moreButton) return;


    const task =
        moreButton.closest(".task-card");


    if (!task) return;


    const title =
        task.querySelector("h3").textContent;


    alert(
        `Task: ${title}\n\nCategory: ${
            task.dataset.category
        }\nStatus: ${
            task.dataset.status
        }`
    );

});