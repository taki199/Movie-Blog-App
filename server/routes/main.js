const controller = require('../../Controlers/controller')

const express = require('express');
const router = express.Router();


/*Get rout 
Home 
 */
//get Everything
router.get("/", controller.getAllPosts)
router.get("/post/:id",controller.idPost)
router.post("/search",controller.reashPost);



module.exports = router;