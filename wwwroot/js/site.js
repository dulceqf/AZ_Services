(function () {
  // Build a base path to your site root, even if you are in /Home/
  // Examples:
  // /Home/services.html -> base = ".."
  // /services.html      -> base = "."
  const pathParts = window.location.pathname.split("/").filter(Boolean);

    // Find your project folder in the URL, like: /AZ_Services/Home/services.html
    const projectFolderIndex = pathParts.findIndex(p => p.toLowerCase() === "az_services");
    
    // Build a prefix like "/AZ_Services" if found, otherwise "" (site root)
    const prefix = projectFolderIndex >= 0
      ? "/" + pathParts.slice(0, projectFolderIndex + 1).join("/")
      : "";
    
    // These will become:
    // /AZ_Services/Shared/header.html (if your site is inside that folder)
    // /Shared/header.html (if your site is at root)
    const headerUrl = "/Shared/header.html";
    const footerUrl = "/Shared/footer.html";




  // Determine current page file (handles /Home/ and /Home/)
  let currentPage = pathParts[pathParts.length - 1] || "index.html";
  // If the URL is a folder (no .html), assume index.html
  if (!currentPage.includes(".")) currentPage = "index.html";
  // Remove query strings just in case
  currentPage = currentPage.split("?")[0].split("#")[0];

  // Load header
  fetch(headerUrl)
    .then((res) => {
      if (!res.ok) throw new Error(`Header fetch failed: ${res.status} ${res.statusText}`);
      return res.text();
    })
    .then((html) => {
      const header = document.getElementById("site-header");
      if (!header) return;

      header.innerHTML = html;

      // Interior pages use the full logo in the navbar; Home keeps the compact AZ mark.
      if (currentPage.toLowerCase() !== "index.html") {
        header.classList.add("interior-page-header");
      }

      // Highlight active nav link (only inside the injected header)
      header.querySelectorAll(".nav-link").forEach((link) => {
        const href = (link.getAttribute("href") || "").split("?")[0].split("#")[0];
        if (href === currentPage) link.classList.add("active");
      });

      // Auto-collapse navbar on mobile after clicking a link
      header.querySelectorAll("#mainNavbar .nav-link").forEach((link) => {
        link.addEventListener("click", () => {
          const nav = document.getElementById("mainNavbar");
          if (nav && nav.classList.contains("show") && window.bootstrap) {
            new bootstrap.Collapse(nav).hide();
          }
        });
      });
    })
    .catch((err) => console.error("Header load error:", err));

  // Load footer
  fetch(footerUrl)
    .then((res) => {
      if (!res.ok) throw new Error(`Footer fetch failed: ${res.status} ${res.statusText}`);
      return res.text();
    })
    .then((html) => {
      const footer = document.getElementById("site-footer");
      if (footer) {
        footer.innerHTML = html;
        const year = footer.querySelector("[data-current-year]");
        if (year) year.textContent = new Date().getFullYear();
      }
    })
    .catch((err) => console.error("Footer load error:", err));
})();

// Keep contact-form visitors on the site and show an accessible status message.
document.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || form.id !== "contact-form") return;

  event.preventDefault();
  const status = document.getElementById("form-status");
  const button = form.querySelector('button[type="submit"]');
  if (!status || !button) return;

  status.className = "form-status";
  status.textContent = "";
  button.disabled = true;
  button.textContent = "Sending…";

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error("Submission failed");

    form.reset();
    status.className = "form-status is-success";
    status.textContent = "Thank you! Your message was sent. AZ Services will contact you soon.";
  } catch (error) {
    status.className = "form-status is-error";
    status.innerHTML = 'We could not send your message. Please call <a href="tel:+15722044134">(572) 204-4134</a> or try again.';
  } finally {
    button.disabled = false;
    button.textContent = "Send message";
  }
});
