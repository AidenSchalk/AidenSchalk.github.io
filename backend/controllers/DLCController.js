 
const asyncHandler = require('express-async-handler')
 
const DLC = require('../model/DLCModel')
const User = require('../model/userModel') // for update and delete

// http://localhost:5555/api/DLCs/
const getDLCs = asyncHandler(async (req, res) =>{
  
  
    const DLCs = await DLC.find({user:req.user.id})
 
    res.status(200).json(DLCs)
})

// ===== CREATE A DLC =====
const setDLC = asyncHandler(async(req, res) => {
    const { title, DLCID, price, downloaded, size, description } = req.body // requires all the feilds to have something in them instead of doing it all later

    // Validate that the request body contains a 'text' field 
    //  without this check, we'd save empty/useless DLCs to the database
    if (!title || !DLCID || !price || !size || !description) {
        // Set status to 400 (Bad Request) 
        //  tells the client they sent invalid data
        res.status(400)
        // Throw an error with a helpful message 
        //  asyncHandler catches this and passes it to our errorMiddleware
        throw new  Error("Please fill all fields. ")
    }


    // Insert a new DLC document into MongoDB 
    //  .create() both builds and saves the document in one step
    const DLC_created = await DLC.create(
        {
            // Set the text field to whatever the client sent in the request body
            title,
            DLCID,
            price,
            downloaded,
            size,
            description,
            user: req.user.id // adding which user created the DLC
            
        }
    )

    // Send back the newly created DLC as JSON 
    //  the client gets confirmation of what was saved, 
    // including the auto-generated _id
    res.status(200).json(DLC_created)
})

// ===== UPDATE A DLC =====
const updateDLC =  asyncHandler(async(req, res) => {

    // if we need to update any DLC - we need an id
    // Look up the DLC by the id from the URL parameter (e.g., /api/DLCs/abc123) 
    //  we first check if it exists before trying to update
    const dlc = await DLC.findById(req.params.id) // this will find our DLC

    // If no DLC was found with that id, send a 400 error 
    //  prevents updating a non-existent document
    if(!dlc){
        res.status(400)
        throw new Error("DLC not found")
    }

    //-------Only authorized user can update their DLC---------------
    const user = await User.findById(req.user.id)
    // we want to check if useer exist or not, if yes then they can only update and delete their DLCs
    if(!user){
        res.status(401)
        throw new Error(' user not found')
    }

    // Only the DLCs that belong to the user should be modified by that user.
    if (dlc.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error('User not authorized')
     }

    //--------------------------------------------


    // now lets update the DLC 
    // Find the DLC by id and update its text field in one operation
    const updatedDLC = await DLC.findByIdAndUpdate(
        req.params.id,          // which DLC to update
        req.body,               // the new data to apply
        {new: true}             // return the updated document instead of the old one 
        //  without this, Mongoose returns the document as it was BEFORE the update
    )

    // Send back the updated DLC so the client can see the changes took effect
    res.status(200).json(updatedDLC)
})

// ===== DELETE A DLC =====
const deleteDLC = asyncHandler(async (req, res) => {

    // Find the DLC first 
    //  we need the document object to call .deleteOne() on it
    const dlc = await DLC.findById(req.params.id) // this will find our DLC

    // If the DLC doesn't exist, tell the client 
    //  prevents trying to delete something that's already gone
    if(!dlc){
        res.status(400)
        throw new Error("DLC not found")
    }


    //-------Only authorized user can update their DLC ---------------
    const user = await User.findById(req.user.id)
    // we want to check if useer exist or not, if yes then they can only update and delete their DLCs
    if(!user){
        res.status(401)
        throw new Error(' user not found')
    }

    // check if the DLC has the user field, because we are adding the user key in the database
    if (dlc.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error('User not authorized')
     }

    //--------------------------------

    // Remove the DLC from the database 
    //  .deleteOne() is called on the document instance we found above
    await dlc.deleteOne()

    // Send back a confirmation message with the deleted DLC's id 
    //  lets the client know which DLC was removed
    res.status(200).json({ message: `Delete DLC ${req.params.id}` })
}
)
// ===== GET ALL DLCS (PUBLIC) =====
const getAllDLCs = asyncHandler(async (req, res) => {
  const dlcs = await DLC.find()
  res.status(200).json(dlcs)
})

// Export all four functions so DLCRoutes.js can attach them to the corresponding HTTP endpoints
module.exports = {
    getDLCs,
    setDLC,
    updateDLC,
    deleteDLC,
    getAllDLCs
}