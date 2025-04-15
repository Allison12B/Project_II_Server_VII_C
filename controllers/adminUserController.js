const AdminUser = require("../models/adminUser");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const THE_SECRET_KEY = '123JWT';


/**
 * Controller of the creates a restricted users 
 *
 * @param {*} req
 * @param {*} res
 */

const adminCreate = (req, res) => {
    let admin = new AdminUser(req.body);

    admin.email = req.body.email;
    admin.password = Buffer.from(req.body.password).toString('base64');
    admin.phoneNumber = req.body.phoneNumber;
    admin.pin = req.body.pin;
    admin.name = req.body.name;
    admin.lastName = req.body.lastName;
    admin.age = req.body.age;
    admin.country = req.body.country;
    admin.dateBirth = req.body.dateBirth;

    //Valited the data to make a new insert
    if (
        typeof admin.email !== 'string' || admin.email.trim() === '' ||
        typeof admin.password !== 'string' || admin.password.trim() === '' ||
        typeof admin.phoneNumber !== 'number' || isNaN(admin.phoneNumber) ||
        typeof admin.pin !== 'number' || admin.pin < 100000 || admin.pin > 999999 ||
        typeof admin.name !== 'string' || admin.name.trim() === '' ||
        typeof admin.lastName !== 'string' || admin.lastName.trim() === '' ||
        typeof admin.age !== 'number' || isNaN(admin.age) || admin.age <= 18 ||
        typeof admin.country !== 'string' || admin.country.trim() === '' ||
        typeof admin.dateBirth !== 'string' || admin.dateBirth.trim() === ''
    ) {
        return res.status(422).json({
            error: 'No valid data provided for admin user',
        });
    }

    //Save the data in the database
    if (admin.email && admin.password && admin.phoneNumber && admin.pin && admin.name && admin.lastName && admin.age && admin.country && admin.dateBirth) {
        admin.save().then(() => {
            res.header({
                'location': `api/adminUser/?id=${admin.id}`
            });
            res.status(201).json(admin);
        })
            .catch((err) => {
                res.status(422);
                console.log('Error while saving the admin user', err);
                res.json({
                    error: 'There was an error saving the admin user'
                });
            });
    } else {
        res.status(422);
        console.log('The data of the object admin is not correct');
        res.json({
            error: 'The data of the object admin is not correct'
        });
    }
};

/**
 * Controller of the login 
 *
 * @param {*} req
 * @param {*} res
 */
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(422).json({ error: 'No valid data provided for administrator user' });
        }

        // Buscar usuario en la base de datos
        const userAdmin = await AdminUser.findOne({ email });

        if (!userAdmin) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Validar la contraseña
        const encodedPassword = Buffer.from(password).toString('base64');
        if (encodedPassword !== userAdmin.password) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generar el token después de validar credenciales
        const payload = {
            adminId: userAdmin._id,
            name: userAdmin.name,
            username: userAdmin.email,
            permission: ['create', 'edit', 'delete'],
            ip: req.ips,
            agent: req.get('user-agent')
        };

        const token = jwt.sign(payload, THE_SECRET_KEY, { expiresIn: '1h' });

        return res.status(200).json({ success: true, token, data: { id: userAdmin._id } });

    } catch (error) {
        console.error('Error en adminLogin:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

//Method for remove the session storage token 



//Controller for admin login pin
/**
 * @param {objetc} req
 * @param {object} res
 */
const adminPinLogin = async (req, res) => {
    try {
        const { pin } = req.body;
        const { adminId } = req.params;

        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(404).json({
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

        const userAdmin = await AdminUser.findOne({
            _id: adminId
        });

        if (!userAdmin) {
            return res.status(404).json({
                success: false,
                message: 'User Administrator not found'
            });
        }

        if (userAdmin.pin !== pinNumber) {
            return res.status(401).json({ success: false, message: 'Invalid PIN' });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: userAdmin._id
            }
        });

    } catch (error) {
        console.error('Error in admin pin login:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}


module.exports = {
    adminCreate,
    adminLogin,
    adminPinLogin
}