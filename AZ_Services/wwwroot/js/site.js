(function () {
  // Build a base path to your site root, even if you are in /Home/
  // Examples:
  // /Home/services.html -> base = ".."
  // /services.html      -> base = "."
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const isInHomeFolder = pathParts.length > 1 && pathParts[pathParts.length - 2].toLowerCase() === "home";
  const base = isInHomeFolder ? ".." : ".";

  const headerUrl = `${base}/Shared/header.html`;
  const footerUrl = `${base}/Shared/footer.html`;

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
      if (footer) footer.innerHTML = html;
    })
    .catch((err) => console.error("Footer load error:", err));
})();
