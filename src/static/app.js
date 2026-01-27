document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const pullRequestsList = document.getElementById("pull-requests-list");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Function to fetch pull requests from API
  async function fetchPullRequests() {
    try {
      const response = await fetch("/pull-requests");
      const data = await response.json();

      // Clear loading message
      pullRequestsList.innerHTML = "";

      if (data.pull_requests.length === 0) {
        pullRequestsList.innerHTML = "<p>No open pull requests found.</p>";
        return;
      }

      // Populate pull requests list
      data.pull_requests.forEach((pr) => {
        const prCard = document.createElement("div");
        prCard.className = "activity-card";

        const createdDate = new Date(pr.created_at).toLocaleDateString();

        prCard.innerHTML = `
          <h4><a href="${pr.html_url}" target="_blank">PR #${pr.number}: ${pr.title}</a></h4>
          <p><strong>Author:</strong> ${pr.author}</p>
          <p><strong>Created:</strong> ${createdDate}</p>
          <p><strong>Status:</strong> ${pr.state}</p>
        `;

        pullRequestsList.appendChild(prCard);
      });
    } catch (error) {
      pullRequestsList.innerHTML = "<p>Failed to load pull requests. Please try again later.</p>";
      console.error("Error fetching pull requests:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
  fetchPullRequests();
});
