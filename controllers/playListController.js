const PlayList = require("../models/playList");
const mongoose = require("mongoose");

/**
 * Controller of the creates a restricted users 
 * @param {*} req
 * @param {*} res
 */

const playListCreate = async (req, res) => {
    try {
        let { name, restrictedUsers, adminUser } = req.body;

        let adminId = adminUser; 

        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({ error: "Invalid admin ID format" });
        }

        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(422).json({ error: 'Invalid data provided for creating a new playlist' });
        }

        if (!Array.isArray(restrictedUsers)) {
            restrictedUsers = [];
        }

        restrictedUsers = restrictedUsers
            .filter(id => mongoose.Types.ObjectId.isValid(id))  
            .map(id => new mongoose.Types.ObjectId(id));

        const newPlayList = new PlayList({
            name,
            restrictedUsers,
            adminId
        });

        await newPlayList.save();

        res.status(201)
            .header({ 'Location': `api/playList/?id=${newPlayList.id}` })
            .json(newPlayList);

    } catch (error) {
        console.error("Error creating playlist:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


/**
 * Method to delete a playList
 * @param {*} req
 * @param {*} res
 */
const playListDelete = async (req, res) => {
    try {
        const playListId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(playListId)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const playListFound = await PlayList.findByIdAndDelete(playListId);

        if (!playListFound) {
            return res.status(404).json({ error: 'PlayList not found' });
        }

        res.status(204).end(); 
    } catch (err) {
        console.error('Error while deleting the playList:', err);
        res.status(500).json({ error: 'There was an error deleting the playList' });
    }
};

/**
 * Get playList by Restricted User
 * @param {*} req
 * @param {*} res
 */
const playListGetByRestrictedUser = async (req, res) => {
    const restrictedUserId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(restrictedUserId)) {
        return res.status(400).json({ error: "Invalid user ID format" });
    }

    try {
        const playlists = await PlayList.find({
            restrictedUsers: new mongoose.Types.ObjectId(restrictedUserId)
        });

        if (playlists.length === 0) {
            return res.status(404).json({ message: "No playlists found for this user" });
        }

        return res.json(playlists);
    } catch (err) {
        console.error("Error fetching playlists:", err);
        return res.status(500).json({ error: "Error fetching playlists" });
    }
};

/**
 * Get playList by Restricted User
 * @param {*} req
 * @param {*} res
 */
const playListGetByAdminUser = async (req, res) => {
    const adminUser = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(adminUser)) {
        return res.status(400).json({ error: "Invalid user ID format" });
    }

    try {
        
        const playlists = await PlayList.find({
            adminId: new mongoose.Types.ObjectId(adminUser)
        });

        if (playlists.length === 0) {
            return res.status(404).json({ message: "No playlists found for this admin" });
        }

        return res.json(playlists);
    } catch (err) {
        console.error("Error fetching playlists:", err);
        return res.status(500).json({ error: "Error fetching playlists" });
    }
};


/**
 * Method to update a playList
 * @param {*} req
 * @param {*} res
 */
const playListPut = async (req, res) => {
    try {
        const playListId = req.params.id;
        const { name, restrictedUsers } = req.body;

        console.log("El ID of playList updated is:", playListId);

        if (!mongoose.Types.ObjectId.isValid(playListId)) {
            return res.status(400).json({ error: "Invalid playlist ID format" });
        }

        const playListFound = await PlayList.findById(playListId);

        if (!playListFound) {
            return res.status(404).json({ error: "PlayList not found" });
        }

        if (name && (typeof name !== "string" || name.trim() === "")) {
            return res.status(422).json({ error: "Invalid name format" });
        }

        if (restrictedUsers && (!Array.isArray(restrictedUsers) || !restrictedUsers.every(id => mongoose.Types.ObjectId.isValid(id)))) {
            return res.status(422).json({ error: "Invalid restrictedUsers format" });
        }

        if (name) playListFound.name = name;
        if (restrictedUsers) {
            playListFound.restrictedUsers = restrictedUsers.map(id => new mongoose.Types.ObjectId(id));
        }

        await playListFound.save().header({ 'Location': `/api/restrictedUser/?id=${playListId.id}` });

        console.log("PlayList updated successfully");
        return res.json(playListFound);
    } catch (err) {
        console.error("Error updating playlist:", err);
        return res.status(500).json({ error: "Error updating playlist" });
    }
};





//impots the methods
module.exports = {
    playListCreate,
    playListDelete,
    playListGetByRestrictedUser,
    playListPut,
    playListGetByAdminUser
}