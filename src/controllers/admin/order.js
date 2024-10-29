



//import schemas
const Orders  =  require("../../models/orderSchema") ;






//GET ORDERS
const  orders   =   async  ( req , res ) => {
    try{
        
        if(!req.session.adminId){ 
            return res.redirect("/admin");
        }

        const page = parseInt(req.query.page) || 1 ;
        const limit = 10 ;
        
        const totalOrders = await Orders.countDocuments() ;
        const skip = ( page-1 ) * limit ; 
        
        const orders = await Orders.find().skip(skip).limit(limit).populate("userId") ; 
        const totalPages = Math.ceil( totalOrders/limit ) ;  

        res.render("backend/admin-dashboard.ejs" ,{ message : '',admin : req.session.adminEmail , 
        partial : "partials/orders" , orders ,  currentPage : page  , totalPages , 
        searchKeyword :"" 
    } ) ; 

    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404")  ;  
    }
}

 


//ORDER VIEW
const  viewOrder  =  async ( req , res )  =>{
    try{
        if(!req.session.adminId){
            res.redirect("/admin");
        } 
        
        const order = await Orders.findById(req.params.orderId).populate("items.product").populate("shippingAddress") ;
        // Format order date
        const orderDate = new Date(order.createdAt).toLocaleString();
        res.render("backend/admin-dashboard.ejs" ,{message : '',admin : req.session.adminEmail , partial : "partials/viewOrder" , order ,orderDate } ) ; 
        
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404")  ;         
    }
}




//UPDATE ORDER STATUS
const  updateOrderStatus  =  async  ( req , res ) =>{
    try{
        const { orderStatus , orderId } = req.body ;
        const status = await Orders.findByIdAndUpdate( orderId , { orderStatus  });
        if(status){
            res.status(200).json({success : true })
        }else{
            res.status(404).json({message : "order not found" })
        }  
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404")  ;          
    }
}






module.exports  =  { orders , viewOrder , updateOrderStatus  }