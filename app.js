// DATA — top level, outside everything
const sampleScams = [
  { id: 1, destination: 'bangkok', name: 'Tuk-Tuk Free Tour', description: 'Driver offers a free city tour...', avoid: 'Refuse all free tour offers. Use Grab.', severity: 'high', loss: 200 },
  { id: 2, destination: 'bangkok', name: 'Taxi No Meter', description: 'Driver claims meter is broken...', avoid: 'Insist on meter or book through Grab.', severity: 'medium', loss: 25 },
  { id: 3, destination: 'bali', name: 'Motorbike Damage Claim', description: 'Rental shop claims pre-existing scratches...', avoid: 'Photograph every angle before riding.', severity: 'high', loss: 150 }
]

function getScamsForDestination(destination) {
  return sampleScams.filter(scam => scam.destination === destination.toLowerCase())
}

// DOM — inside DOMContentLoaded, ONE time
document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.querySelector('.s-input')
  const searchBtn = document.querySelector('.s-btn')

  function handleSearch() {
    const destination = searchInput.value

    if (destination === '') {
      alert('Please enter a destination')
      return
    }

    const resultsTitle = document.querySelector('#destination-name')
    if (resultsTitle) {
      resultsTitle.textContent = destination
    }

    const scams = getScamsForDestination(destination)
    console.log('Scams found:', scams)
  }

  searchBtn.addEventListener('click', handleSearch)
})