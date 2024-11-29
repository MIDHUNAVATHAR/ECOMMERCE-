



// Importing the User schema for interacting with the users collection
const  User     =     require("../../models/userSchema") ;




// GET request to fetch and display users with pagination, sorting, and search functionality
const  users   =   async  ( req , res )  =>{
    try{
     // Pagination settings
     const page = parseInt(req.query.page) || 1 ;               // Get the current page number or default to 1
     const limit = 7;                                           // Number of users per page
     const sort = req.query.sort || 'asc' ;                     // Sorting order ('asc' for ascending, 'desc' for descending)
     const sortOrder =  sort === 'asc' ? 1 : -1 ;               // Convert sort string to numerical order
     const startIndex = (page - 1) *limit ;                     // Calculate the starting index for slicing
     const endIndex   = page * limit ;                          // Calculate the ending index for slicing
     

     // Search query for filtering users
     const search = req.query.search || '' ;                    // Search term from the query or default to empty
     const query = search 
     ? { 
         $or: [
             { firstName: { $regex: search, $options: 'i' } },  // Case-insensitive search on firstName
             { email: { $regex: search , $options: 'i' } }      // Case-insensitive search on email
         ] 
     }
     : {};


     // Fetch all users matching the query and sort them by joinedDate
     const users = await User.find(query).sort({ joinedDate: sortOrder })  
     const totalUsers =users.length;                            // Get the total number of users matching the query


     // Get the users for the current page using slicing
     const resultUsers = users.slice( startIndex , endIndex );

     // Render the users page with the required data
     res.render("backend/admin-dashboard.ejs" , {
        partial : "partials/users" ,
        admin : req.session.admin.email , 
        users : resultUsers,
        currentpage :page,
        totalUsers:totalUsers,
        limit:limit,
        sort:sort
    });

    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404") ;             //Handle errors and render the 404 page
    }
}




// DELETE request to remove a user by ID
const  userDel  =  async  ( req , res )  => {
    try{
        const deletId = req.query.id;                       // Get the user ID from the query parameter
        await User.findByIdAndDelete(deletId);              // Delete the user from the database
        res.redirect("/admin/customers") ;                  // Redirect to the customers page after deletion
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404") ;            // Handle errors and render the 404 page 
    }
}




// GET request to fetch a user's details for editing
const  userEdit  =  async (req,res) =>{ 
    try{
      const userId =  req.query.id;                         // Get the user ID from the query parameter
      const user = await User.findById(userId);             // Fetch the user's details from the database
      res.render("backend/admin-dashboard.ejs" ,{ 
        partial : "partials/edit-user",
        user:user ,
        admin : req.session.adminEmail
      });                                                   // Render the edit-user page with the user's details
    }catch(err){
        console.log(err);
        res.status(500).render("frontend/404") ;            // Handle errors and render the 404 page
    }
}





// POST request to update a user's details
const  updateUsers  =  async  ( req , res )  =>{
    try{
        let { userId, firstName, lastName, email, password } = req.body ;     // Destructure user details from the request body
        firstName = firstName.trim();
        lastName  = lastName.trim();
        email     = email.trim(); 
        password  = password.trim();

        // Prepare the updates object
        const updates = { firstName, lastName, email };
        if (password) {
            updates.password = password ;                 // Include password in updates only if it's provided
        }

        // Update the user's details in the database
        await User.findByIdAndUpdate(userId, updates);    // Redirect to the customers page after updating
        res.redirect('/admin/customers');
    }catch(err){
        console.log(err);
        res.status(500).render("frontend/404") ;          // Handle errors and render the 404 page
    }
}




// POST request to update a user's status (e.g., active/inactive)
const   updateStatus  =  async  ( req , res )  => { 
    try{
        const userId = req.params.id;                      // Get the user ID from the URL parameter
        const { status } = req.body;                       // Get the new status from the request body
        await User.findByIdAndUpdate(userId , { status }); // Update the user's status in the database
        res.redirect('/admin/customers');                  // Redirect to the customers page after updating
    }catch(err){
        console.log(err);
        res.status(500).render("frontend/404") ;           // Handle errors and render the 404 page
    }
}




// Exporting the functions to be used in the routes
module.exports  =  {  
    users , 
    userDel , 
    userEdit , 
    updateUsers ,  
    updateStatus  
}  ;