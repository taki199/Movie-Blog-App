const controller = require('../../Controlers/controller')

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt=require("jsonwebtoken")
const jwtSecret=process.env.JWT_SECRET 

/*Get rout 
Home 
 */
//get Everything
const authMiddleware=(req,res,next)=>{
    const token=req.cookies.token;
    if(!token){
        return res.status(401).json({message: "Unauthorized"})
    }
    try{
        const decoded=jwt.verify(token,jwtSecret);
        req.userId = decoded.userId;
        next()
    }catch(error){
         res.status(401).json({message: "Unauthorized"})
    }
}

router.get("/admin", controller.Admin)
router.post("/admin",controller.logAdmin)
router.post("/register",controller.registerAdmin)
router.get("/dashboard",authMiddleware,controller.showDash)
router.get("/add-post",authMiddleware ,controller.adminCreate)
router.post("/add-post",authMiddleware,controller.adminCreatePost)
router.get("/edit-post/:id",authMiddleware,controller.getEdit)
router.put("/edit-post/:id",authMiddleware,controller.adminEdit)
router.delete("/delete-post/:id",authMiddleware,controller.adminDelete)
router.get("/logout",controller.Logout)
// router.get('/logout', (req, res) => {


module.exports = router;