const video = require("../models/video");
const mongoose = require("mongoose");

/**
 * Controller of create a new video 
 * @param {*} req
 * @param {*} res
 */

//Method to create a new video
const videoCreate = async (req, res) => {
    try {
        let { name, url, description, playLists } = req.body;

        if (!name || typeof name !== 'string' || name.trim() === '' ||
            !url || typeof url !== 'string' || url.trim() === '') {
            return res.status(422).json({ error: 'Invalid data provided for creating a new video' });
        }

        if (!Array.isArray(playLists)) {
            playLists = [];
        }

        playLists = playLists.length > 0 ? playLists.map(id => new mongoose.Types.ObjectId(id)) : [];

        const newVideo = new video({
            name,
            url,
            description: description || "",
            playLists
        });

        await newVideo.save();

        res.status(201)
            .header({ 'Location': `api/video/?id=${newVideo.id}` })
            .json(newVideo);

    } catch (error) {
        console.error("Error creating video:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

/**
 * Method to delete a video
 * @param {*} req
 * @param {*} res
 */
const videoDelete = async (req, res) => {
    //pasar el id así: http://127.0.0.1:3001/api/video/1
    try {
        const videoId = req.params.id;
        const deletedVideo = await video.findByIdAndDelete(videoId);

        if (!deletedVideo) {
            return res.status(404).json({ error: 'Video not found' });
        }

        res.status(204).end(); //Not Content
    } catch (err) {
        console.error('Error while deleting the video:', err);
        res.status(500).json({ error: 'There was an error deleting the video' });
    }
};

/**
 * Method to find a video by Id
 * @param {*} req
 * @param {*} res
 */

async function getVideoById(req, res) {
    //pasar el id así: http://127.0.0.1:3001/api/video?id=1
    try {
        const videoId = req.params.id;
        console.log("ID recibido:", videoId);

        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const videoFind = await video.findById(videoId);

        if (!videoFind) {
            return res.status(404).json({ error: "video not found" });
        }

        return res.json(videoFind);
    } catch (error) {
        console.error("Error getting video:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

/**
 * Method to find a video by PlayListId
 * @param {*} req
 * @param {*} res
 */

const getVideoByPlayList = async (req, res) => {
    try {
        const playListId = req.params.id;
        console.log("ID recibido:", playListId);

        if (!mongoose.Types.ObjectId.isValid(playListId)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        // Convertir a ObjectId
        const playlistObjectId = new mongoose.Types.ObjectId(playListId);
        
        // Consulta con diagnóstico
        const query = { playLists: { $in: [playlistObjectId] } };
        console.log("Query ejecutado:", JSON.stringify(query));
        
        const videoFind = await video.find(query);
        console.log("Resultados encontrados:", videoFind);

        if (videoFind.length === 0) {
            console.log("No se encontraron videos para la playlist:", playListId);
            return res.status(200).json([]); 
        }

        return res.status(200).json(videoFind);
    } catch (error) {
        console.error("Error detallado:", {
            message: error.message,
            stack: error.stack,
            fullError: error
        });
        res.status(500).json({ 
            error: "Internal Server Error",
            details: error.message 
        });
    }
};

/**
 * Get all videos
 * @param {*} req
 * @param {*} res
 */
const videosGet = async (req, res) => {
    try {
        const videos = await video.find();

        if (!videos.length) {
            return res.status(404).json({ error: "No videos found" });
        }

        return res.json(videos);
    } catch (error) {
        console.error("Error getting all videos:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


/**
 * Update a video by ID
 *
 * @param {*} req
 * @param {*} res
 */
const videoPut = async (req, res) => {
    const videoId = req.params.id;

    // Validar si el ID tiene el formato correcto
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        return res.status(400).json({ error: "Invalid video ID format" });
    }

    try {
        const videoFound = await video.findById(videoId);

        if (!videoFound) {
            return res.status(404).send({ message: 'No video found' });
        }

        if (typeof videoFound.name !== 'string' || videoFound.name.trim() === '' ||
            typeof videoFound.url !== 'string' || videoFound.url.trim() === '' ||
            typeof videoFound.description !== 'string') {
            return res.status(422).json({ error: 'Invalid data provided for updating video' });
        }

        videoFound.name = req.body.name || videoFound.name;
        videoFound.url = req.body.url || videoFound.url;
        videoFound.description = req.body.description || videoFound.description;

        if (req.body.playLists && Array.isArray(req.body.playLists)) {
            // Convertir los valores a ObjectId y evitar duplicados
            const updatedPlayLists = [
                ...new Set([...videoFound.playLists, ...req.body.playLists.map(id => new mongoose.Types.ObjectId(id))])
            ];
            videoFound.playLists = updatedPlayLists;
        }

        await videoFound.save();

        console.log("Video updated successfully");
        return res.json(videoFound).header({ 'Location': `/api/video/?id=${videoFound}` });
    } catch (err) {
        console.error("Error updating video:", err);
        if (!res.headersSent) {
            res.status(500).json({ error: "Error updating video" });
        }
    }
};

//impots the methods
module.exports = {
    videoCreate,
    videoDelete,
    getVideoById,
    videosGet,
    videoPut,
    getVideoByPlayList
}