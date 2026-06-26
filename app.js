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

 async function handleSearch() {
    const destination = searchInput.value;

    if (destination.trim() !== "" && scamSection) {
      const rect = scamSection.getBoundingClientRect();
      const isNearViewport =
        rect.top <= window.innerHeight + 180 && rect.bottom >= 0;

      if (!isNearViewport) {
        scamSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    console.log('Fetching Reddit data...')
    const posts = await fetchRedditScams(destination);
    console.log('Fetched posts:', posts.length);
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
async function fetchRedditScams(destination) {
  try {
    const response = await fetch(`https://www.reddit.com/r/solotravel/search.json?q=${destination}+scam&sort=new&limit=10`
    )
 const data = await response.json();
 const posts = data.data.children.map(post => ({
  title: post.data.title,
  text: post.data.selftext,
  upvotes: post.data.ups,
 }))
 console.log('Reddit posts:', posts);
 return posts;
  } catch (error) {
    console.error("Error fetching Reddit:", error);
    return [];
  }
}