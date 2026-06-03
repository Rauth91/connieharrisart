(function initContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector(".submit");
    const defaultLabel = submitButton.textContent;
    submitButton.textContent = "Sending...";
    if (status) status.textContent = "Submitting your inquiry...";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      let ok = response.ok;
      if (ok) {
        try {
          const data = await response.json();
          ok = Boolean(data.success);
        } catch {
          ok = true;
        }
      }

      submitButton.textContent = ok ? "Message Sent" : "Try Again";
      if (status) {
        status.textContent = ok
          ? "Thank you. Connie will follow up soon."
          : "Something went wrong. Please email connieharrisart@gmail.com.";
      }
      if (ok) form.reset();
    } catch {
      submitButton.textContent = "Try Again";
      if (status) status.textContent = "Connection issue. Please try again.";
    }

    setTimeout(() => {
      submitButton.textContent = defaultLabel;
    }, 2200);
  });
})();
