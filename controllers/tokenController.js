const TokenSession = require("../models/tokenSession");
const crypto = require("crypto");

const saveSession = function (username) {
    const token = crypto.createHash('md5').update(username).digest("hex");

    //Insert token
    const session = new TokenSession({
        token: token,
        user: username,
        expire: new Date()
    });

    return session.save()
        .then(() => session)
        .catch(err => {
            console.log('Error while saving the session:', err);
            return { error: 'There was an error saving the session' };
        });
};

module.exports = { 
    saveSession 
};
