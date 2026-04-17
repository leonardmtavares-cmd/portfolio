const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-link");
const yearEl = document.getElementById("year");

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = !mobileMenu.classList.contains("hidden");
    mobileMenu.classList.toggle("hidden");
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.textContent = isOpen ? "Menu" : "Close";
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "Menu";
    });
  });
}

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && revealItems.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.15,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const mastheadVideo = document.getElementById("masthead-video");
const mastheadGif = document.getElementById("masthead-gif");

function showGifFallback() {
  if (mastheadGif) {
    mastheadGif.classList.add("is-visible");
  }
}

if (mastheadVideo) {
  mastheadVideo.addEventListener("canplay", () => {
    mastheadVideo.classList.add("is-visible");
  });

  mastheadVideo.addEventListener("error", showGifFallback);

  mastheadVideo.play().catch(() => {
    showGifFallback();
  });
} else {
  showGifFallback();
}

if (mastheadGif) {
  mastheadGif.addEventListener("error", () => {
    mastheadGif.remove();
  });
}

const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const formspreeEndpointInput = document.getElementById("formspree-endpoint");

function updateFormStatus(message, isError = false) {
  if (!formStatus) {
    return;
  }

  formStatus.textContent = message;
  formStatus.classList.toggle("text-red-700", isError);
  formStatus.classList.toggle("text-sand-700", !isError);
}

function buildMailtoLink(formData) {
  const recipient = "hello@leonardtavares.com";
  const subject = encodeURIComponent(formData.get("subject") || "New portfolio inquiry");
  const bodyLines = [
    `Name: ${formData.get("name") || ""}`,
    `Email: ${formData.get("email") || ""}`,
    "",
    String(formData.get("message") || "")
  ];
  const body = encodeURIComponent(bodyLines.join("\n"));

  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      updateFormStatus("Please complete all required fields before sending.", true);
      contactForm.reportValidity();
      return;
    }

    const formData = new FormData(contactForm);
    const endpoint = formspreeEndpointInput ? formspreeEndpointInput.value.trim() : "";

    if (!endpoint) {
      window.location.href = buildMailtoLink(formData);
      updateFormStatus("Opening your email client to send this message.");
      return;
    }

    updateFormStatus("Sending message...");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json"
        },
        body: formData
      });

      if (response.ok) {
        contactForm.reset();
        updateFormStatus("Thanks! Your message was sent successfully.");
      } else {
        window.location.href = buildMailtoLink(formData);
        updateFormStatus("Form service failed. Opening email client as fallback.", true);
      }
    } catch {
      window.location.href = buildMailtoLink(formData);
      updateFormStatus("Network error. Opening email client as fallback.", true);
    }
  });
}
