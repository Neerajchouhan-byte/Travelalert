document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.querySelector(".s-input");
  const searchBtn = document.querySelector(".s-btn");

  function handleSearch() {
    const destination = searchInput.value;
    console.log("User searched for:", destination);
  }

  searchBtn.addEventListener("click", handleSearch);
});
function handleSearch() {
  const destination = searchInput.value;

  // Conditional — check if empty
  if (destination == "") {
    alert("Please enter a destination");
    return;
  }

  // Change the page based on input
  const resultsTitle = document.querySelector("#destination-name");

  if (resultsTitle) {
    resultsTitle.textContent = destination;
  }

  console.log("Searching for:", destination);
}
