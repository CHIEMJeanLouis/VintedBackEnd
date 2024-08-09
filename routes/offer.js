const express = require("express");
const Offer = require("../models/Offer");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const isAuthenticated = require("../middlewares/isAuthenticated");

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      //   console.log(req.body); // les éléments de la requete "text"
      //   console.log(req.files); // les éléments de la requete "file" / Si plusieurs files => array d'object.
      //   console.log(convertToBase64(req.files.picture)); // affichage de l'image converti en base64.

      //Enregistrement de mon image sur Cloudinary =>
      const convertedPicture = convertToBase64(req.files.picture); // assignation de l'image converti dans variable convertedPicture
      const result = await cloudinary.uploader.upload(convertedPicture); //upload sur Cloudinary. Ne pas oublier le 'await' car
      //c'est une requete donc attente de la réponse pour continuer.
      //console.log(result);
      //console.log(req.user);
      const newOffer = new Offer({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          {
            MARQUE: req.body.brand,
          },
          {
            TAILLE: req.body.size,
          },
          {
            ÉTAT: req.body.condition,
          },
          {
            COULEUR: req.body.color,
          },
          {
            EMPLACEMENT: req.body.city,
          },
        ],
        product_image: result,
        owner: req.user,
      });

      await newOffer.save();
      res.status(201).json({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          {
            MARQUE: req.body.brand,
          },
          {
            TAILLE: req.body.size,
          },
          {
            ÉTAT: req.body.condition,
          },
          {
            COULEUR: req.body.color,
          },
          {
            EMPLACEMENT: req.body.city,
          },
        ],
        owner: { account: req.user.account, id: req.user.id },
        product_image: result,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    //filter RegExp :
    //RegExp pour RegularExpression : const regexp = new RegExp("pantalon","i")
    // const regexp = /pantalon/i;

    // const offersToDisplay = await Offer.find({ product_name: regexp }).select(
    //   "product_name product_price -_id"
    // );

    //filter fourchette :
    // const offersToDisplay = await Offer.find({
    //   product_price: { $gte: 40, $lte: 200 }, // product_price entre 40 et 200 max.
    // }).select("product_name product_price -_id");

    //console.log(req.query);
    if (req.query.title) {
      req.query.product_name = req.query.title;

      const offersToDisplay = await Offer.find({
        product_name: new RegExp(req.query.product_name, "i").populate("owner"),
      })
        .sort({ product_name: "asc" })
        .select("product_name product_price -_id");
      res.json(offersToDisplay);
    } else if (req.query.priceMin || req.query.priceMax) {
      req.query.product_price = {
        $gte: req.query.priceMin,
        $lte: req.query.priceMax,
      };
      //console.log(req.query.product_price); // { '$gte': '50', '$lte': '200' }//

      const offerToDisplay = await Offer.find({
        product_price: req.query.product_price,
      })
        .sort({ product_price: "asc" })
        .select("product_name product_price");
      //console.log(offerToDisplay);
      res.json(offerToDisplay);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/offers/:id", async (req, res) => {
  //console.log(req.params.id);
  const offer = await Offer.findById({ _id: req.params.id }).populate({
    path: "owner",
    select: "account",
  });

  res.status(200).json(offer);
});

module.exports = router;
