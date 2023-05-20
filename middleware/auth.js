let user = require('../models/userSchema')
let  jwt = require('jsonwebtoken')
const session = require('express-session')

//============================================[Authentication Middleware]==========================================================

const authentication = async function (req, res, next) {
  
    try {
        let token = req.headers.authorization.split(" ")[1] || req.headers.Authorization.split(" ")[1]
        //let token = req.headers["x-api-key"] || req.headers["x-Api-key"];
        if (!token) return res.status(401).send({ status: false, message: "Authentication failed!" });

        decodedToken = jwt.verify(token, "myJWTSecretKey")
        req.user_id = decodedToken.userId

        next();


    } catch (error) {
        if (error.message == 'invalid token') return res.status(400).send({ status: false, message: "invalid token" });

        if (error.message == "jwt expired") return res.status(400).send({ status: false, message: "please login one more time, token is expired" });

        if (error.message == "invalid signature") return res.status(401).send({ status: false, message: "invalid signature" });

        return res.status(500).send({ status: false, message: error.message });
    }
};
//module.exports.authentication = authentication

//==================================================[Authorisation Middleware]============================================================

const authorisation = async function (req, res, next) {
    try {
        let userId = req.user_id 
        if (!userId) {
            return res.status(400).json({ error: 'You enter invalid token' });
        }

        let userLogin = await user.findOne({ _id: userId });
        //  console.log(userLogin)

        if (!userLogin) {
            return res.status(404).send({ status: false, msg: "No such Admin exists" });
        }
        let userLogging = userLogin._id.toString()
        if (adminId !== userLogging)
            return res.status(403).send({ status: false, msg: "Error, authorization failed" });

        next()
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.msg })
    }
}

module.exports = {authentication,authorisation}