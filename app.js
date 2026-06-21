function filterScamCards(query) {
  const normalizedQuery = query.trim().toLowerCase();
  const cards = document.querySelectorAll(".scam-grid .scam-card");

  cards.forEach((card) => {
    const cardText = card.textContent.toLowerCase();
    const matches =
      normalizedQuery === "" || cardText.includes(normalizedQuery);

    card.style.display = matches ? "" : "none";
  });
}

// DOM — inside DOMContentLoaded, ONE time
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector(".s-input");
  const searchBtn = document.querySelector(".s-btn");
  const scamSection = document.querySelector(".scam-section");

  function handleSearch() {
    const destination = searchInput.value;
    filterScamCards(destination);

    if (destination.trim() !== "" && scamSection) {
      const rect = scamSection.getBoundingClientRect();
      const isNearViewport =
        rect.top <= window.innerHeight + 180 && rect.bottom >= 0;

      if (!isNearViewport) {
        scamSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  searchBtn.addEventListener("click", handleSearch);

  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  });

  filterScamCards("");
});
