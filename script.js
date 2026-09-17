// =====================================================
// EMPLOYEE LEAVE MANAGEMENT SYSTEM
// HTML + CSS + JAVASCRIPT + LOCALSTORAGE
// =====================================================


// -----------------------------------------------------
// DEMO LOGIN DETAILS
// -----------------------------------------------------

const users = {
    employee: {
        username: "employee",
        password: "1234"
    },

    admin: {
        username: "admin",
        password: "admin123"
    }
};


// -----------------------------------------------------
// LOGIN
// -----------------------------------------------------

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        const message = document.getElementById("loginMessage");

        if (!role) {
            message.textContent = "Please select a role.";
            message.style.color = "red";
            return;
        }

        if (
            users[role] &&
            username === users[role].username &&
            password === users[role].password
        ) {

            localStorage.setItem("loggedInUser", username);
            localStorage.setItem("userRole", role);

            message.textContent = "Login successful!";
            message.style.color = "green";

            setTimeout(function () {

                if (role === "employee") {
                    window.location.href = "employee.html";
                } else {
                    window.location.href = "admin.html";
                }

            }, 500);

        } else {

            message.textContent = "Invalid username or password.";
            message.style.color = "red";
        }

    });
}


// -----------------------------------------------------
// CHECK LOGIN
// -----------------------------------------------------

function checkLogin(requiredRole) {

    const loggedInUser = localStorage.getItem("loggedInUser");
    const userRole = localStorage.getItem("userRole");

    if (!loggedInUser || userRole !== requiredRole) {

        window.location.href = "index.html";

        return false;
    }

    return true;
}


// -----------------------------------------------------
// LOGOUT
// -----------------------------------------------------

function logout() {

    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userRole");

    window.location.href = "index.html";
}


// -----------------------------------------------------
// GET EXISTING LEAVES
// -----------------------------------------------------

function getLeaves() {

    const leaves = localStorage.getItem("leaves");

    if (leaves) {
        return JSON.parse(leaves);
    }

    return [];
}


// -----------------------------------------------------
// SAVE LEAVES
// -----------------------------------------------------

function saveLeaves(leaves) {

    localStorage.setItem("leaves", JSON.stringify(leaves));
}


// -----------------------------------------------------
// EMPLOYEE PAGE
// -----------------------------------------------------

if (window.location.pathname.includes("employee.html")) {

    if (!checkLogin("employee")) {

        // Stop execution if user is not logged in
    } else {

        const employeeName =
            localStorage.getItem("loggedInUser");

        document.getElementById("employeeName").textContent =
            employeeName;

        displayEmployeeLeaves();
    }
}


// -----------------------------------------------------
// APPLY FOR LEAVE
// -----------------------------------------------------

const leaveForm = document.getElementById("leaveForm");

if (leaveForm) {

    leaveForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const leaveType =
            document.getElementById("leaveType").value;

        const fromDate =
            document.getElementById("fromDate").value;

        const toDate =
            document.getElementById("toDate").value;

        const reason =
            document.getElementById("reason").value.trim();

        const message =
            document.getElementById("leaveMessage");

        // Check dates
        if (toDate < fromDate) {

            message.textContent =
                "To Date cannot be before From Date.";

            message.style.color = "red";

            return;
        }

        const employee =
            localStorage.getItem("loggedInUser");

        const leaves = getLeaves();

        const newLeave = {

            id: Date.now(),

            employee: employee,

            leaveType: leaveType,

            fromDate: fromDate,

            toDate: toDate,

            reason: reason,

            status: "Pending"
        };

        leaves.push(newLeave);

        saveLeaves(leaves);

        message.textContent =
            "Leave application submitted successfully.";

        message.style.color = "green";

        leaveForm.reset();

        displayEmployeeLeaves();
    });
}


// -----------------------------------------------------
// DISPLAY EMPLOYEE LEAVES
// -----------------------------------------------------

function displayEmployeeLeaves() {

    const table =
        document.getElementById("employeeLeaveTable");

    if (!table) {
        return;
    }

    const employee =
        localStorage.getItem("loggedInUser");

    const leaves = getLeaves();

    const employeeLeaves =
        leaves.filter(function (leave) {

            return leave.employee === employee;

        });

    table.innerHTML = "";

    if (employeeLeaves.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    No leave applications found.
                </td>
            </tr>
        `;

        return;
    }

    employeeLeaves.forEach(function (leave) {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${leave.leaveType}</td>

            <td>${leave.fromDate}</td>

            <td>${leave.toDate}</td>

            <td>${leave.reason}</td>

            <td>
                <span class="status ${leave.status.toLowerCase()}">
                    ${leave.status}
                </span>
            </td>

        `;

        table.appendChild(row);
    });
}


// -----------------------------------------------------
// ADMIN PAGE
// -----------------------------------------------------

if (window.location.pathname.includes("admin.html")) {

    if (!checkLogin("admin")) {

        // Stop execution

    } else {

        displayAdminLeaves();
        updateSummary();
    }
}


// -----------------------------------------------------
// DISPLAY ALL LEAVES FOR ADMIN
// -----------------------------------------------------

function displayAdminLeaves() {

    const table =
        document.getElementById("adminLeaveTable");

    if (!table) {
        return;
    }

    const leaves = getLeaves();

    table.innerHTML = "";

    if (leaves.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    No leave applications found.
                </td>
            </tr>
        `;

        return;
    }

    leaves.forEach(function (leave) {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${leave.employee}</td>

            <td>${leave.leaveType}</td>

            <td>${leave.fromDate}</td>

            <td>${leave.toDate}</td>

            <td>${leave.reason}</td>

            <td>
                <span class="status ${leave.status.toLowerCase()}">
                    ${leave.status}
                </span>
            </td>

            <td>

                ${
                    leave.status === "Pending"

                    ?

                    `
                    <button
                        class="approve-btn"
                        onclick="updateLeaveStatus(${leave.id}, 'Approved')">
                        Approve
                    </button>

                    <button
                        class="reject-btn"
                        onclick="updateLeaveStatus(${leave.id}, 'Rejected')">
                        Reject
                    </button>
                    `

                    :

                    "Completed"
                }

            </td>
        `;

        table.appendChild(row);
    });
}


// -----------------------------------------------------
// UPDATE LEAVE STATUS
// -----------------------------------------------------

function updateLeaveStatus(id, newStatus) {

    const leaves = getLeaves();

    const leave =
        leaves.find(function (item) {

            return item.id === id;

        });

    if (leave) {

        leave.status = newStatus;

        saveLeaves(leaves);

        displayAdminLeaves();

        updateSummary();
    }
}


// -----------------------------------------------------
// ADMIN SUMMARY
// -----------------------------------------------------

function updateSummary() {

    const leaves = getLeaves();

    const total = leaves.length;

    const pending =
        leaves.filter(function (leave) {
            return leave.status === "Pending";
        }).length;

    const approved =
        leaves.filter(function (leave) {
            return leave.status === "Approved";
        }).length;

    const rejected =
        leaves.filter(function (leave) {
            return leave.status === "Rejected";
        }).length;


    const totalElement =
        document.getElementById("totalLeaves");

    const pendingElement =
        document.getElementById("pendingLeaves");

    const approvedElement =
        document.getElementById("approvedLeaves");

    const rejectedElement =
        document.getElementById("rejectedLeaves");


    if (totalElement)
        totalElement.textContent = total;

    if (pendingElement)
        pendingElement.textContent = pending;

    if (approvedElement)
        approvedElement.textContent = approved;

    if (rejectedElement)
        rejectedElement.textContent = rejected;
}