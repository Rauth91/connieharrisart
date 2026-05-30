(function initClassesPage() {
  const heroTitle = document.getElementById("hero-title");
  if (heroTitle) {
    const runShimmer = () => {
      heroTitle.classList.remove("shimmer");
      void heroTitle.offsetWidth;
      heroTitle.classList.add("shimmer");
    };
    setTimeout(runShimmer, 500);
    setInterval(runShimmer, 7000);
  }

  const classOfferings = [
    {
      code: "June 2026",
      title: "Finish Foundations Intensive",
      details: "2-day studio course · Beginner friendly · 8 seats",
      summary:
        "Build a strong technical base in Connie's decorative finish process from prep through final seal.",
      expect: [
        "Live demonstrations and coached repetition",
        "Color and glaze layering practice",
        "Take-home sample panels + workflow notes",
      ],
      fit: [
        "Beginners starting decorative finishes",
        "Artists refining consistency",
        "Career pivots entering finish work",
      ],
    },
    {
      code: "July 2026",
      title: "Texture + Patina Masterclass",
      details: "2-day studio course · Intermediate · 6 seats",
      summary:
        "Learn advanced depth-building for textured, time-worn, and architectural patina effects.",
      expect: [
        "Material sequencing for depth",
        "Controlled distressing techniques",
        "Critique rounds on your practice boards",
      ],
      fit: [
        "Painters with basic finish experience",
        "Designers wanting richer surface language",
        "Professionals expanding premium offerings",
      ],
    },
    {
      code: "Monthly",
      title: "Private Coaching Session",
      details: "Custom 1:1 training dates · By application",
      summary:
        "Personalized coaching focused on your project challenges, portfolio growth, or business goals.",
      expect: [
        "Custom lesson plan per inquiry",
        "Direct troubleshooting on real work",
        "Clear next-step action plan",
      ],
      fit: [
        "Working artists with specific goals",
        "Clients preparing a live project",
        "Small business owners scaling services",
      ],
    },
    {
      code: "Quarterly",
      title: "Designer Team Workshop",
      details: "Private small-group format for firms and studios",
      summary:
        "Studio workshop built for teams that want stronger decorative finish literacy and execution confidence.",
      expect: [
        "Shared vocabulary + finish strategy",
        "Team-based technique exercises",
        "Recommendations for future specs",
      ],
      fit: [
        "Interior design firms",
        "Boutique studios",
        "Hospitality and residential project teams",
      ],
    },
  ];

  const offeringsGrid = document.getElementById("offerings-grid");
  const classModal = document.getElementById("class-modal");
  const classModalClose = document.getElementById("class-modal-close");
  const classModalCode = document.getElementById("class-modal-code");
  const classModalTitle = document.getElementById("class-modal-title");
  const classModalSummary = document.getElementById("class-modal-summary");
  const classModalExpect = document.getElementById("class-modal-expect");
  const classModalFit = document.getElementById("class-modal-fit");
  const classModalDetails = document.getElementById("class-modal-details");
  const classCount = document.getElementById("class-count");

  function openClassModal(item) {
    if (!classModal) return;
    classModalCode.textContent = item.code;
    classModalTitle.textContent = item.title;
    classModalSummary.textContent = item.summary || "";
    classModalDetails.textContent = item.details || "";
    classModalExpect.innerHTML = (item.expect || []).map((line) => `<li>${line}</li>`).join("");
    classModalFit.innerHTML = (item.fit || []).map((line) => `<li>${line}</li>`).join("");
    classModal.classList.add("show");
    classModal.setAttribute("aria-hidden", "false");
  }

  function closeClassModal() {
    if (!classModal) return;
    classModal.classList.remove("show");
    classModal.setAttribute("aria-hidden", "true");
  }

  if (offeringsGrid) {
    if (classCount) classCount.textContent = String(classOfferings.length);
    offeringsGrid.innerHTML = classOfferings
      .map(
        (item, index) => `
    <button class="offering" type="button" data-class-index="${index}">
      <p>${item.code}</p>
      <strong>${item.title}</strong>
      <em>${item.details}</em>
      <span>View class details →</span>
    </button>`
      )
      .join("");

    offeringsGrid.querySelectorAll(".offering").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.getAttribute("data-class-index"));
        openClassModal(classOfferings[index]);
      });
    });
  }

  if (classModalClose) classModalClose.addEventListener("click", closeClassModal);
  if (classModal) {
    classModal.addEventListener("click", (event) => {
      if (event.target === classModal) closeClassModal();
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && classModal?.classList.contains("show")) closeClassModal();
  });
})();
