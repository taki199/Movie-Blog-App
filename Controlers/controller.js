const Post=require('../server/Models/post')
const User = require('../server/Models/User')
const user=require('../server/Models/User')
const adminLayout = '../views/layouts/admin' 
const bcrypt = require('bcrypt')
const jwt=require("jsonwebtoken")
const jwtSecret=process.env.JWT_SECRET 




module.exports = {

    // display all posts in  Home page 
    getAllPosts:async (req, res) => {
        
        try {
            const locals={
                title:"Nodejs Blog",
                description:"just a simple blog Dummy"
            }
         let perPage=5;
         let page=req.query.page || 1
         
         const data=await Post.aggregate([{$sort:{createdAt:-1}}])
         .skip(perPage*page-perPage)
         .limit(perPage)
         .exec();

         const count = await Post.countDocuments({});
         const nextPage = parseInt(page) + 1;
         const hasNextPage = nextPage <= Math.ceil(count / perPage);



        
            res.render('index',
            {locals,
            data,
            current:page,
            nextPage:hasNextPage ? nextPage : null
        });
            
        } catch (error) {
            console.log(error)
            
        }
        
       
    },
    //find post by id 
    idPost:async(req,res)=>{
      
       try {
        
        let slug =req.params.id
        const data=await Post.findById({_id:slug})
        const locals={
            title:data.title,
            description:data.description
    
           }
        res.render('post',{ locals,data } )
       } catch (error) {
        console.log(error)
        
       }
    },

    // resaerch for posts for all users

    reashPost:async(req,res)=>{
        try {
            const locals={
                title:"Search",
                description:"simple Blog Description Dummy"
        
               }

            let searchTerm=req.body.searchTerm
            const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")

            console.log(searchTerm)
           
            const data = await Post.find({
                $or: [
                  { title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
                  { body: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
                ]
              });
            
            res.render('search',
            { locals,
            data } )
           } catch (error) {
            console.log(error)
            
           }


    },
    

    // first admin page before login 
    Admin: async (req, res) => {
        
        try {
            const locals={
                title:"Admin",
                description:"This is for the Admin of this Blog"
            }
    

        
            res.render('admin/index',{locals,layout:adminLayout});
            
        } catch (error) {
            console.log(error)
            
        }

    },
    //check Login using jwt and hashing password 
    logAdmin:async (req,res)=>{
        
        try {

            const {username,password}=req.body;
            const  user =await User.findOne({username});

            if(!user){
               return res.status(401).json({message: "Invalid Credentials"})
            }
            const isPasswordValid = await bcrypt.compare(password,user.password);
            if(!isPasswordValid){
             return  res.status(401).json({message: "Invalid Credentials"})

            }
          const token= jwt.sign({userId : user._id},jwtSecret,{expiresIn:'2h' })
          res.cookie('token',token,{httpOnly:true})

          res.redirect('/dashboard')

        
            
            
        } catch (error) {
            console.log(error)
            
        }

    },
    // registre admin in db  using post route but i did hide the form so i cant registre any user rn 
   registerAdmin:async (req,res)=>{
        
        try {
            
            const {username,password}=req.body;
            const hashedPassword = await bcrypt.hash(password,10);
            try {
                const user = await User.create({username,password:hashedPassword})
                res.status(201).json({message:"User created Succefully",user})
                
            } catch (error) {
                if(error.code===11000){
                    res.status(409).json({message:'User already in use'})
                }
                res.status(500).json({message:'Internal Error'});
                
            }
            
        } catch (error) {
            console.log(error)
            
        }

    },
    // get route to show dashboard of admin
    showDash: async (req, res) => {
        try {
          const locals = {
            title: 'Dashboard',
            description: 'Admin Dashboard'
          };
    
          const data = await Post.find();
    
          // currentUser will contain the logged-in user information if available
          const currentUser = req.currentUser;
    
          res.render('admin/dashboard', {
            locals,
            data,
            currentUser, // Pass currentUser to the view
            layout: adminLayout
          });
        } catch (error) {
          console.log(error);
          // Handle error
        }
      
        
    },
    // just get route to go to add Post Form
    adminCreate:async(req,res)=>{
        try {
            const locals={
                title:'Add Post',
                description:'Admin Adding Posts'

            }
            const data =await Post.find();
            res.render('admin/add-post',{
                locals,
                layout:adminLayout
            });
        } catch (error) {
            console.log(error)

            
        }
        

    },

    // add new post into db
    adminCreatePost:async(req,res)=>{
        try {

          try {
            const newPost= new Post({
                title:req.body.title,
                body:req.body.body
            });
            await Post.create(newPost);
            res.redirect('/dashboard')
            
        } catch (error) {
            console.log(error)
            
        }
           
          
          
        } catch (error) {
            console.log(error)

            
        }
        

    },
    getEdit:async(req,res)=>{
        try {
            const locals={
                title:"Admin edit post ",
                description:"this Page is For Admin to edit content"
            }
            
           const data =await Post.findOne({_id: req.params.id})
            res.render('admin/edit-post',{
            locals,
            data,
            layout: adminLayout})
        } catch (error) {
            console.log(error)

            
        }
        

    },

    adminEdit:async(req,res)=>{
        try {
            
            await Post.findByIdAndUpdate(req.params.id, {
                title: req.body.title,
                body: req.body.body,
                updatedAt: Date.now()
              });
              res.redirect(`/edit-post/${req.params.id}`);
        } catch (error) {
            console.log(error)

            
        }
        

    },
    adminDelete:async(req,res)=>{
        try {
            await Post.deleteOne( { _id: req.params.id } );
            res.redirect('/dashboard');
          } catch (error) {
            console.log(error);
          }
    },
    Logout: async(req,res)=> {
        
            res.clearCookie('token');
            //res.json({ message: 'Logout successful.'});
            res.redirect('/');
          
          
    }

}

// const insertPostData =()=>{
//     Post.insertMany([
//         {
//             title: "Stranger Things",
//             body: "A group of kids investigates supernatural occurrences in their small town."
//           },
//           {
//             title: "Breaking Bad",
//             body: "A high school chemistry teacher turned methamphetamine manufacturer partners with a former student."
//           },
//           {
//             title: "Game of Thrones",
//             body: "Nine noble families fight for control over the lands of Westeros."
//           },
//           {
//             title: "The Office (US)",
//             body: "A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium."
//           },
//           {
//             title: "Friends",
//             body: "Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan."
//           },
//           {
//             title: "Sherlock",
//             body: "A modern update finds the famous sleuth and his doctor partner solving crime in 21st-century London."
//           },
//           {
//             title: "The Crown",
//             body: "Follows the political rivalries and romance of Queen Elizabeth II's reign and the events that shaped the second half of the 20th century."
//           },
//           {
//             title: "Black Mirror",
//             body: "An anthology series exploring a twisted, high-tech multiverse where humanity's greatest innovations and darkest instincts collide."
//           },
//           {
//             title: "The Mandalorian",
//             body: "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic."
//           },
//           {
//             title: "The Witcher",
//             body: "Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts."
//           }

    
// ])

// }
// insertPostData();