const User = require("../models/Users");

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      //console.log(req.headers.authorization.replace("Bearer ",""));
      const token = req.headers.authorization.replace("Bearer ", "");
      const user = await User.findOne({ token: token });
      //console.log(user);

      if (user) {
        req.user = user;
        next();
      } else {
        return res
          .status(401)
          .json({ message: "You must be connected in order to publish" });
      }
    } else {
      return res
        .status(401)
        .json({ message: "You must be connected in order to publish" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

  //const token = req.headers.authorization.replace("Bearer ", ""); // je récupère le token dans le header

  // je cherche dans ma bdd si j'ai un token qui correspond =>
  // const user = User.findOne({token : token })
  // if si je trouve personne ;
  // return res.status(401).json({message : "you must be connected"})

  // SINON si je trouve qqn je peux ajouter cet utilisateur dans REQ

  //req.user = user // je peux maintenant utiliser req.user dans mes controllers, c'est a dire que je sais qui est connecté

  //req.fruit = "mandarine";

  //next(); // commande pour passer la main au prochain middleware
};

module.exports = isAuthenticated;
