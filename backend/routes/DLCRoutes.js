// Import Express — needed to access the Router factory function
const express = require('express')

// Create a Router instance
// keeping route definitions modular and out of the main server.js file
const router = express.Router()

// Import CRUD controller functions from DLCController.js
// Each function handles exactly one operation and is mapped to a route + HTTP method below

const {
    getDLCs,    // GET    — fetch all DLCs belonging to the authenticated user
    setDLC,     // POST   — create a new DLC
    updateDLC,  // PUT    — overwrite an existing DLC by ID
    deleteDLC   // DELETE — remove a DLC by ID
} = require('../controllers/DLCController')

// Import the `protect` middleware from authMiddleware.js
// `protect` runs BEFORE the controller on any route it's applied to.
// It validates the incoming JWT from the Authorization header, decodes the user ID,
// fetches that user from the DB, and attaches them to req.user.
// If the token is missing, expired, or invalid — it rejects the request with a 401
// and the controller function never runs.
// Please look into this code (../middleware/authMiddleware)

const { protect } = require('../middleware/authMiddleware')

// ---- Routes for /api/DLCs/ --------------------------
// GET  /api/DLCs/  → protect runs first, then getDLCs (returns all DLCs for req.user)
// POST /api/DLCs/  → protect runs first, then setDLC  (creates a DLC owned by req.user)

router.route('/').get(protect, getDLCs).post(protect, setDLC)

// ---- Routes for /api/DLCs/:id--------------------------
// PUT    /api/DLCs/:id → protect runs first, then updateDLC (edits DLC with matching :id)
// DELETE /api/DLCs/:id → protect runs first, then deleteDLC (removes DLC with matching :id)
// :id is a URL parameter accessible in the controller via req.params.id

router.route('/:id').put(protect, updateDLC).delete(protect, deleteDLC)

// Export this router so server.js can mount it:
// app.use('/api/DLCs', require('./routes/DLCRoutes'))
// All routes defined above are relative to that /api/DLCs base path
module.exports = router