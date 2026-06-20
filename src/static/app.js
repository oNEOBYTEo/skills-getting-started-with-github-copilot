document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  let currentActivities = {};

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  function renderActivities() {
    const escapeHtml = (value) =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    activitiesList.innerHTML = "";
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

    Object.entries(currentActivities).forEach(([name, details]) => {
      const activityCard = document.createElement("div");
      activityCard.className = "activity-card";

      const spotsLeft = details.max_participants - details.participants.length;
      const participantsMarkup = details.participants.length
        ? `
          <ul class="participants-list">
            ${details.participants
              .map(
                (participant) => `
                  <li class="participant-item">
                    <span class="participant-name">${escapeHtml(participant)}</span>
                    <button
                      type="button"
                      class="participant-remove"
                      data-activity="${encodeURIComponent(name)}"
                      data-participant="${encodeURIComponent(participant)}"
                      aria-label="Remove participant"
                      title="Remove participant"
                    >
                      ×
                    </button>
                  </li>
                `
              )
              .join("")}
          </ul>
        `
        : '<p class="participants-empty">No participants yet.</p>';

      activityCard.innerHTML = `
        <h4>${name}</h4>
        <p>${details.description}</p>
        <p><strong>Schedule:</strong> ${details.schedule}</p>
        <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        <div class="participants-section">
          <p class="participants-title"><strong>Participants</strong></p>
          ${participantsMarkup}
        </div>
      `;

      activitiesList.appendChild(activityCard);

      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      activitySelect.appendChild(option);
    });

    activitiesList.querySelectorAll(".participant-remove").forEach((button) => {
      button.addEventListener("click", handleParticipantRemoval);
    });
  }

  async function handleParticipantRemoval(event) {
    const button = event.currentTarget;
    const activity = button.dataset.activity;
    const participant = button.dataset.participant;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(participant)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        showMessage(result.detail || "An error occurred", "error");
        return;
      }

      if (currentActivities[activity]) {
        currentActivities[activity].participants = currentActivities[activity].participants.filter(
          (existingParticipant) => existingParticipant !== participant
        );
      }

      renderActivities();
      showMessage(result.message, "success");
    } catch (error) {
      showMessage("Failed to remove participant. Please try again.", "error");
      console.error("Error removing participant:", error);
    }
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities", { cache: "no-store" });
      currentActivities = await response.json();
      renderActivities();
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
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
        if (currentActivities[activity]) {
          currentActivities[activity].participants = [...currentActivities[activity].participants, email];
          renderActivities();
        } else {
          await fetchActivities();
        }

        showMessage(result.message, "success");
        signupForm.reset();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
