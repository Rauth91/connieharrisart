(function initContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector(".submit");
    const defaultLabel = submitButton.textContent;
    submitButton.textContent = "Sending...";
    if (status) status.textContent = "Sending your message...";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      submitButton.textContent = response.ok ? "Message sent" : "Try again";
      if (status) {
        status.textContent = response.ok
          ? "Thank you. Connie will follow up personally within a few business days."
          : "Something went wrong. Please try again or email Connie directly.";
      }
      if (response.ok) form.reset();
    } catch {
      submitButton.textContent = "Try again";
      if (status) status.textContent = "Connection issue. Please try again or call (225) 266-5037.";
    }

    setTimeout(() => {
      submitButton.textContent = defaultLabel;
    }, 2200);
  });
})();
