



//import  schemas
const  User     =     require("../../models/userSchema") ;




//GET USERS
const  users   =   async  ( req , res )  =>{
    try{
      
    //pagination 
     const page = parseInt(req.query.page) || 1 ;   
     const limit = 7;
     const sort = req.query.sort || 'asc' ; 
     const sortOrder =  sort === 'asc' ? 1 : -1 ;
     const startIndex = (page - 1) *limit ;
     const endIndex   = page * limit ;
     
     const search = req.query.search || '' ; 
     const query = search 
     ? { 
         $or: [
             { firstName: { $regex: search, $options: 'i' } }, 
             { email: { $regex: search , $options: 'i' } }     
         ] 
     }
     : {};

     const users = await User.find(query).sort({ joinedDate: sortOrder })  
     const totalUsers =users.length; // Get the total number of users

     const resultUsers = users.slice( startIndex , endIndex );
     res.render("backend/admin-dashboard.ejs" , {partial : "partials/users" ,admin : req.session.admin.email , users : resultUsers,currentpage :page,totalUsers:totalUsers,limit:limit,sort:sort});

    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404") ;         
    }
}




//DELETE USERS
const  userDel  =  async  ( req , res )  => {
    try{
        const deletId = req.query.id;
        await User.findByIdAndDelete(deletId);
        res.redirect("/admin/customers") ; 
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404") ;         
    }
}




//GET EDIT USERS 
const  userEdit  =  async (req,res) =>{ 
    try{
      const userId =  req.query.id;
      const user = await User.findById(userId);
      res.render("backend/admin-dashboard.ejs" ,{ partial : "partials/edit-user",user:user ,admin : req.session.adminEmail}); 
    }catch(err){
        console.log(err);
        res.status(500).render("frontend/404") ;   
    }
}




//UPDATE USERS
const  updateUsers  =  async  ( req , res )  =>{
    try{
        let { userId, firstName, lastName, email, password } = req.body ; 
        firstName = firstName.trim();
        lastName  = lastName.trim();
        email     = email.trim(); 
        password  = password.trim();
        const updates = { firstName, lastName, email };
        if (password) {
            updates.password = password ;  
        }
        await User.findByIdAndUpdate(userId, updates);
        res.redirect('/admin/customers');
    }catch(err){
        console.log(err);
        res.status(500).render("frontend/404") ;  
    }
}



//USER STATUS UPDATE 
const   updateStatus  =  async  ( req , res )  => { 
    try{
        const userId = req.params.id;
        const { status } = req.body;
        await User.findByIdAndUpdate(userId , { status } );
        res.redirect('/admin/customers');
    }catch(err){
        console.log(err);
        res.status(500).render("frontend/404") ;     
    }
}




module.exports  =  {  users , userDel , userEdit , updateUsers ,  updateStatus  }  ;