
// Base URL for all API requests
// In production, change this to your live domain e.g. 'https://yoursite.com/api'
const API_URL = 'https://aidenschalk-github-io.onrender.com/api' // dont forget to change this later

// ===== PROTECT THE PAGE =====
// Read the token that was saved to localStorage when the user logged in
const token = localStorage.getItem('token')

// If there is no token, the user is not logged in — send them back to the login page
if (!token) {
  window.location.href = 'index.html'
  throw new Error('No token') // stops the rest of the script from running

}

// ===== AUTH HEADER HELPER =====
// Every request to a protected route must include the JWT token in the Authorization header
// This function returns the headers object so we don't repeat it everywhere
function authHeader() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // format required by our authMiddleware.js
  }
}

// ===== LOGOUT =====
// When logout is clicked, remove the token from localStorage and go back to login
// Without the token, the user can no longer make authenticated requests
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token')
  window.location.href = 'index.html'
})

// ===== GET ALL DLCS =====
async function getDLCs() {
  // GET /api/DLCs — protected route, needs Authorization header
  const res = await fetch(`${API_URL}/DLCs`, {
    method: 'GET',
    headers: authHeader()
  })

  const DLCs = await res.json()

  if (!res.ok) {
    // If the request failed, show the error in the DLCs container
    document.getElementById('DLCsList').textContent = DLCs.message || 'Failed to load DLCs'
    return
  }

  // Pass the DLCs array to the render function to display them on the page
  renderDLCs(DLCs)
}

// ===== RENDER DLCS TO THE PAGE =====
function renderDLCs(DLCs) {
  const container = document.getElementById('DLCsList')

  // Clear whatever was previously rendered so we don't get duplicates
  container.innerHTML = ''

  if (DLCs.length === 0) {
    container.textContent = 'No DLCs yet. Add one above!'
    return
  }

  // Loop through each DLC and create HTML elements for it
  DLCs.forEach(DLC => {
    const div = document.createElement('div')
    div.innerHTML = `
      <p><strong>ID:</strong> ${DLC._id}</p>
      <p class="title3">${DLC.title}</p>
      <p class="text4">ID: ${DLC.DLCID}</p>
      <p class="text4">$${DLC.price}</p>
      <p class="text4">Downloaded: ${DLC.downloaded}</p>
      <p class="text4">${DLC.size} mb</p>
      <p class="subtext">Description: ${DLC.description}</p>

      <button onclick="deleteDLC('${DLC._id}')">Delete</button>
    `
    const button = document.createElement('button')
    button.textContent = "Edit"

    button.addEventListener('click', () => {
      startEdit(
        DLC._id,
        DLC.title,
        DLC.DLCID,
        DLC.price,
        DLC.downloaded,
        DLC.size,
        DLC.description
      )
    })
    div.appendChild(button);
    div.appendChild('<hr>');
    container.appendChild(div)
  })
}

// ===== CREATE A DLC =====
document.getElementById('createDLCForm').addEventListener('submit', async (e) => {
  // Prevent page refresh on form submit
  e.preventDefault()

  const title = document.getElementById('DLCTitle').value
  const DLCID = Number(document.getElementById('DLCID').value)
  const price = Number(document.getElementById('DLCPrice').value)
  const downloaded = document.querySelector('input[name="DLCDown"]:checked').value === 'true'
  const size = document.getElementById('DLCSize').value
  const description = document.getElementById('DLCDescription').value

  // POST /api/DLCs — sends the DLC text in the request body
  const res = await fetch(`${API_URL}/DLCs`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ title, DLCID,price,downloaded,size,description })
  })

  const data = await res.json()

  if (!res.ok) {
    // Show the error (e.g. "Please add a 'text' field")
    document.getElementById('createMsg').style.color = 'red'
    document.getElementById('createMsg').textContent = data.message || 'Failed to create DLC'
    return
  }

  // Show success message, clear the input, and refresh the DLCs list
  document.getElementById('createMsg').style.color = 'lime'
  document.getElementById('createMsg').textContent = 'DLC created!'
  document.getElementById('DLCTitle').value = ''
  document.getElementById('DLCID').value = ''
  document.getElementById('DLCPrice').value = ''
  document.querySelector('input[name="DLCDown"][value="false"]').checked = true
  document.getElementById('DLCSize').value = ''
  document.getElementById('DLCDescription').value = ''
  getDLCs()

})

// ===== DELETE A DLC =====
async function deleteDLC(id) {
  // Ask the user to confirm before permanently deleting
  const confirmed = confirm('Are you sure you want to delete this DLC?')
  if (!confirmed) return

  // DELETE /api/DLCs/:id — the id is in the URL, no request body needed
  const res = await fetch(`${API_URL}/DLCs/${id}`, {
    method: 'DELETE',
    headers: authHeader()
  })

  const data = await res.json()

  if (!res.ok) {
    alert(data.message || 'Failed to delete DLC')
    return
  }

  // Refresh the list so the deleted DLC disappears
  getDLCs()
}

// ===== SHOW EDIT FORM =====
// Called when the user clicks the Edit button on a DLC
// Populates the hidden edit section with the current DLC's id and text
function startEdit(id,title,DLCID,price,downloaded,size,description) {
  document.getElementById('editSection').style.display = 'block'
  document.getElementById('editDLCId').value = id         // store id in hidden input
  document.getElementById('editDLCTitle').value = title // pre-fill with current text
  document.getElementById('editDLCID').value = DLCID // pre-fill with current text
  document.getElementById('editDLCPrice').value = price // pre-fill with current text
  document.querySelector(`input[name="editDLCDown"][value="${downloaded}"]`).checked = true // pre-fill with current text
  document.getElementById('editDLCSize').value = size // pre-fill with current text
  document.getElementById('editDLCDescription').value = description // pre-fill with current text

  document.getElementById('editMsg').textContent = ''       // clear any previous messages
  // Scroll the edit section into view so the user doesn't have to scroll manually
  document.getElementById('editSection').scrollIntoView()
}

// ===== CANCEL EDIT =====
// Hide the edit form without making any changes
document.getElementById('cancelEditBtn').addEventListener('click', () => {
  document.getElementById('editSection').style.display = 'none'
})

// ===== SAVE EDIT =====
document.getElementById('saveEditBtn').addEventListener('click', async () => {
  // Read the DLC id (from the hidden input) and the updated text
  const id = document.getElementById('editDLCId').value
  const title = document.getElementById('editDLCTitle').value
  const DLCID = document.getElementById('editDLCID').value
  const price = document.getElementById('editDLCPrice').value
  const downloaded = document.querySelector('input[name="editDLCDown"]:checked').value === 'true'
  const size = document.getElementById('editDLCSize').value
  const description = document.getElementById('editDLCDescription').value


  // PUT /api/DLCs/:id — sends the updated text in the request body
  const res = await fetch(`${API_URL}/DLCs/${id}`, {
    method: 'PUT',
    headers: authHeader(),
    body: JSON.stringify({ title, DLCID,price,downloaded,size,description })
  })

  const data = await res.json()

  if (!res.ok) {
    document.getElementById('editMsg').style.color = 'red'
    document.getElementById('editMsg').textContent = data.message || 'Failed to update DLC'
    return
  }

  // Show success, hide the edit form, and refresh the DLCs list
  document.getElementById('editMsg').style.color = 'green'
  document.getElementById('editMsg').textContent = 'DLC updated!'
  document.getElementById('editSection').style.display = 'none'
  getDLCs()
})

// ===== LOAD DLCS ON PAGE LOAD =====
// Automatically fetch and display all DLCs when dashboard.html is opened
getDLCs()