const AdminUser = require("../models/adminUser");
const mongoose = require("mongoose");
require('dotenv').config();
const jwt = require("jsonwebtoken");
const THE_SECRET_KEY = '123JWT';
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');

const mailersend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY,
});
//console.log('MailerSend API key:', process.env.MAILERSEND_API_KEY);

/**
 * Controller of the creates a restricted users 
 *
 * @param {*} req
 * @param {*} res
 */

const adminCreate = async (req, res) => {
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
    admin.state = "Pending";

    // Validar los datos para la inserción
    if (
        typeof admin.email !== 'string' || admin.email.trim() === '' ||
        typeof admin.password !== 'string' || admin.password.trim() === '' ||
        typeof admin.phoneNumber !== 'number' || isNaN(admin.phoneNumber) ||
        typeof admin.pin !== 'number' || admin.pin < 100000 || admin.pin > 999999 ||
        typeof admin.name !== 'string' || admin.name.trim() === '' ||
        typeof admin.lastName !== 'string' || admin.lastName.trim() === '' ||
        typeof admin.age !== 'number' || isNaN(admin.age) || admin.age <= 18 ||
        typeof admin.country !== 'string' || admin.country.trim() === '' ||
        typeof admin.dateBirth !== 'string' || admin.dateBirth.trim() === '' ||
        typeof admin.state !== 'string'
    ) {
        return res.status(422).json({
            error: 'No valid data provided for admin user',
        });
    }

    // Generar un token de verificación
    const verificationToken = jwt.sign({ email: admin.email }, THE_SECRET_KEY, { expiresIn: '24h' });

    // Guardar el token de verificación en el admin
    admin.verificationToken = verificationToken;

    // Guardar los datos en la base de datos
    if (
        admin.email && admin.password && admin.phoneNumber && admin.pin &&
        admin.name && admin.lastName && admin.age && admin.country &&
        admin.dateBirth && admin.state
    ) {
        admin.save().then(() => {
            // Enviar el correo de verificación
            const verificationLink = `http://localhost:3001/api/verify?token=${verificationToken}`;

            const emailParams = new EmailParams()
                .setFrom(new Sender('admin@test-pzkmgq77owvl059v.mlsender.net', 'KidsTube'))
                .setTo([new Recipient(admin.email, `${admin.name} ${admin.lastName}`)])
                .setSubject("Verifica tu correo de administrador")
                .setHtml(`
                    <p>Hola ${admin.name},</p>
                    <p>Gracias por registrarte como administrador. Para activar tu cuenta, por favor haz clic en el siguiente enlace:</p>
                    <p><a href="${verificationLink}">Verificar correo</a></p>
                `);


            mailersend.email.send(emailParams)
                .then(() => {
                    res.header({
                        'location': `api/adminUser/?id=${admin.id}`
                    });
                    res.status(201).json({
                        message: 'Usuario administrador creado con éxito. Por favor, verifica tu correo.'
                    });
                })
                .catch((err) => {
                    console.log('Error while sending verification email', err);
                    res.status(500).json({
                        error: 'Hubo un error al enviar el correo de verificación'
                    });
                });
        })
            .catch((err) => {
                if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
                    // Error por correo duplicado
                    console.log('Correo duplicado:', err.keyValue.email);
                    res.status(409).json({
                        error: `El correo ${err.keyValue.email} ya está registrado como administrador.`
                    });
                } else {
                    console.log('Error while saving the admin user', err);
                    res.status(500).json({
                        error: 'Error interno al guardar el usuario administrador'
                    });
                }
            });
    } else {
        res.status(422);
        console.log('The data of the object admin is not correct');
        res.json({
            error: 'The data of the object admin is not correct'
        });
    }
};

// Método para verificar el correo
const verifyEmail = async (req, res) => {
    const token = req.query.token;

    if (!token) {
        return res.status(400).json({ error: "Token is required" });
    }

    try {
        // Verificamos el token
        const decoded = jwt.verify(token, THE_SECRET_KEY);

        // Buscamos al admin por el email decodificado
        const admin = await AdminUser.findOne({ email: decoded.email });

        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        // Si ya está verificado
        if (admin.isVerified) {
            return res.status(200).json({ message: "Email already verified" });
        }

        // Actualizamos el estado
        admin.isVerified = true;
        admin.state = "Active";
        await admin.save();

        return res.status(200).json({ message: "¡Correo verificado con éxito!" });

    } catch (error) {
        return res.status(400).json({ error: "Invalid or expired token" });
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

        if (!userAdmin.isVerified) {
            return res.status(401).json({ success: false, message: 'Cuenta no verificada' });
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
    adminPinLogin,
    verifyEmail
}