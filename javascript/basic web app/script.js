// Mock URLs for web services
const serviceUrls = {
    engineering: "https://demo9413525.mockable.io/engineering",
    hr: "https://demo9413525.mockable.io/hr",
};

// Function to fetch data and update the DOM
function fetchDataAndUpdate(serviceUrl) {
    const errorMessage = document.getElementById("error-message");
    const list = document.getElementById("data-list");
    list.innerHTML = ""; // Clear existing data
    errorMessage.classList.add("d-none"); // Hide error message

    fetch(serviceUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                list.innerHTML = `<li class="list-group-item">No employees found.</li>`;
                return;
            }

            // Create list items from the data
            data.forEach(item => {
                const listItem = document.createElement("li");
                listItem.className = "list-group-item d-flex justify-content-between align-items-center";
                listItem.innerHTML = `
                    <strong>${item.name}</strong>
                    <span>${item.role}</span>
                `;
                list.appendChild(listItem);
            });
        })
        .catch(error => {
            errorMessage.textContent = "Error: " + error.message;
            errorMessage.classList.remove("d-none");
        });
}

// Add event listeners to buttons
document.getElementById("btn1").addEventListener("click", () => fetchDataAndUpdate(serviceUrls.engineering));
document.getElementById("btn2").addEventListener("click", () => fetchDataAndUpdate(serviceUrls.hr));
