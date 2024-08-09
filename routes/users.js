const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const fileUpload = require("express-fileupload");
// const cloudinary = require("cloudinary").v2;

// cloudinary.config({
//   cloud_name: "dhutcvppv",
//   api_key: "419197162369873",
//   api_secret: "IiGvxA1cxUzrgEIsuUchSPE_bXA",
// });

// const convertToBase64 = (file) => {
//   return `data${file.mimetype};base64,${file.data.toString("base64")}`;
// };

router.post("/user/signup", fileUpload(), async (req, res) => {
  try {
    //si le champs username est vide, renvoie message d'erreur
    if (!req.body.username) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    const user = await User.findOne({ email: req.body.email });
    if (user) {
      res.json({ message: "Email already used" });
    }

    //console.log(req.body);
    //on repasse en revue le User Model et on creer les variables manquantes :
    const password = req.body.password; //azerty
    const token = uid2(64);
    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    // const avatar = await cloudinary.uploader.upload(
    //   convertToBase64(req.files.avatar)
    // );
    // console.log(avatar);

    //on peut creer l'utilisateur en fonction de la requete body
    const newUser = new User({
      email: req.body.email,
      account: {
        username: req.body.username,
        //avatar: avatar.secure_url,
      },
      newsletter: req.body.newsletter,
      token: token,
      hash: hash,
      salt: salt,
    });

    await newUser.save(); //sauvegarde du nouvel utilisateur

    // const user = User.findOne({ email: req.body.email });

    // if (user) {
    //   return res.status(409).json({ message: "User already created" });
    // }

    // réponse en créant l'objet avec les infos de l'exemple. Ici, ne pas mentionner le hash, salt et
    //  token car données sensibles et non essentielles pour client

    res.status(201).json({
      id: newUser.id,
      token: newUser.token,
      account: newUser.account,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    // Grace au mail que je recois en req.body, je vais pouvoir chercher les données associées a ce mail.
    const user = await User.findOne({ email: req.body.email });
    //console.log(user); // => Objet avec toutes les données liées au mail.
    if (!user) {
      return res.status(404).json({ message: "Wrong login or password" });
    }

    //console.log(req.body); { email: 'Alexis@lereacteur.io', password: 'azerty' }

    //Je créer un newHash pour le comparer au hash que j'ai dans ma base de donnée. Si ca match => ok. sinon => out.
    const newHash = SHA256(req.body.password + user.salt).toString(encBase64);
    //console.log(newHash); // tM0/mKdHNBjhimMVTPKxQCmaMuKHf1dXTjaeIKticME= // le même que celui dans user

    if (newHash === user.hash) {
      res.status(200).json({
        id: user.id,
        token: user.token,
        account: user.account.username,
      });
    } else {
      return res.status(400).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
