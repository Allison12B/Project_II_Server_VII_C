const RestrictedUser = require("../models/restrictedUser");
const mongoose = require("mongoose");

/**
 * Controller for creating a restricted user
 *
 * @param {*} req
 * @param {*} res
 */
const userCreate = async (req, res) => {
  try {
    let { name, age, pin, avatar, adminId } = req.body;

    // Validar si el adminId tiene el formato correcto
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ error: "Invalid admin ID format" });
    }

    pin = Number(pin);

    if (
      typeof name !== 'string' || name.trim() === '' ||
      typeof age !== 'number' || age < 1 ||
      typeof pin !== 'number' || pin < 100000 || pin > 999999 ||
      typeof avatar !== 'string' || avatar.trim() === ''
    ) {
      return res.status(422).json({ error: 'Invalid data provided for restricted user' });
    }

    const user = new RestrictedUser({
      name,
      age,
      pin,
      avatar,
      adminId
    });

    await user.save();

    res.header('Location', 'api/restrictedUsers/id=${user.id}');
    return res.status(201).json(user);

  } catch (err) {
    console.error('Error while saving the restricted user:', err);
    return res.status(500).json({ error: 'There was an error saving the restricted user' });
  }
};

//Function for find by ID
async function userGetById(req, res) {
  try {
    const restrictedUserId = req.params.id;
    console.log("ID recibido:", restrictedUserId);

    if (!mongoose.Types.ObjectId.isValid(restrictedUserId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const user = await RestrictedUser.findById(restrictedUserId);
    if (!user) {
      return res.status(404).json({ error: "Restricted user not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error getting restricted user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Get all restricted users of a admin
 *
 * @param {*} req
 * @param {*} res
 */
const userGet = async (req, res) => {
  const adminUserId = req.params.id;

  // Validar si el ID tiene el formato correcto
  if (!mongoose.Types.ObjectId.isValid(adminUserId)) {
    return res.status(400).json({ error: "Invalid user ID format" });
  }
  try {
    const restrictedUser = await RestrictedUser.find({
      adminId: new mongoose.Types.ObjectId(adminUserId)
    });

    return res.json(restrictedUser);

  } catch (err) {
    console.error("Error fetching restrited user:", err);
    return res.status(500).json({ error: "Error fetching restrited user" });
  }
}

/**
 * Update restricted user by ID
 *
 * @param {*} req
 * @param {*} res
 */
const userPut = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await RestrictedUser.findById(id);

    if (!user) {
      return res.status(404).send({ message: 'Restricted user no encontrado' });
    }

    //  Update only the fields received in the request
    user.name = req.body.name || user.name;
    user.age = req.body.age || user.age;
    user.pin = req.body.pin || user.pin;
    user.avatar = req.body.avatar || user.avatar;
    user.adminId = req.body.adminId || user.adminId;

    // Save changes
    await user.save();

    console.log("Restricted user updated successfully");
    return res.json(user).header({ 'Location': `/api/restrictedUser/?id=${user.adminId}` });
  } catch (err) {
    console.error("Error updating restricted user:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Error updating restricted user" });
    }
  }
};

/**
 * Method to delete user
 *
 * @param {*} req
 * @param {*} res
 */
const userDelete = async (req, res) => {
  const userId = req.params.id;

  RestrictedUser.findByIdAndDelete(userId)
    .then((user) => {
      if (!user) {
        res.status(404); // Not found
        res.json({
          error: 'Restricted user not found'
        });
      } else {
        res.status(204).end(); // Not content
      }
    })
    .catch((err) => {
      res.status(500);
      console.log('Error while deleting the restricted user', err);
      res.json({
        error: 'There was an error deleting the restrcited user'
      });
    });
};

/**
 * Controller for user pin login
 * @param {Object} req 
 * @param {Object} res 
 */
const userLogin = async (req, res) => {
  try {
    const { pin } = req.body;
    const { profileId } = req.params;

    if (!profileId || !mongoose.Types.ObjectId.isValid(profileId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid profile ID provided'
      });
    }

    const pinNumber = Number(pin);
    if (isNaN(pinNumber)) {
      return res.status(422).json({
        success: false,
        error: 'PIN must be a number'
      });
    }

    const user = await RestrictedUser.findOne({ 
      _id: profileId
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.pin !== pinNumber) {
      return res.status(401).json({
        success: false
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id, 
        name: user.name
      }
    });
  }
  catch (error) {
    console.error('Error in user Login:', error); 
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  userCreate,
  userGet,
  userGetById,
  userPut,
  userDelete,
  userLogin
}