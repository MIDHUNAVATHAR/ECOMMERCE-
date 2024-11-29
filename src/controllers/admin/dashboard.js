
// Import necessary modules
const  moment  = require('moment');                       // For date manipulation
const  fs      = require("fs") ;                          // For file system operations
const  multer  = require("multer") ;                      // For file uploads
const  path    =  require("path") ;                       // For working with file paths


//import order schema for database queries
const  Order   = require("../../models/orderSchema") ; 



// Helper function to get date range based on filter
const getDateRange = (filter) => {
    const end = moment().endOf('day');                   // Current day end
    let start;
    

    // Determine the start date based on filter value
    switch(filter) {
        case 'day':                                     // Start of today
            start = moment().startOf('day') ; 
            break;
        case 'week':                                    // 7 days ago
            start = moment().subtract(7, 'days').startOf('day')  ;
            break;
        case 'month':                                  // 30 days ago
            start = moment().subtract(30, 'days').startOf('day') ;
            break;
        case 'year':                                   // 365 days ago
            start = moment().subtract(365, 'days').startOf('day');
            break;
        default:
            start = moment().subtract(30, 'days').startOf('day') ;  // Default to 30 days
    }
    
    return { start , end } ;                           // Return the start and end date
};



// Helper function to ensure the directory exists
const ensureDirectoryExistence = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true }); // Create the directory if it doesn't exist
    }
};




// Controller to get the admin dashboard data
const  dashboard  =  async ( req , res )  =>{           
    try{
        const filter = req.query.filter || 'month';       // Filter for date range
        const { start, end } = getDateRange(filter);      // Get start and end dates

        // Fetch completed orders within the date range
        const orders = await Order.find({
            createdAt: { $gte: start.toDate(), $lte: end.toDate() } ,         
            paymentStatus: 'completed'
        }).sort('createdAt') ;

        // Prepare sales data for graph
        const salesData = [] ;
        let currentDate = moment(start) ;          
        
        while (currentDate <= end) {
            const dayStart = moment(currentDate).startOf('day');
            const dayEnd = moment(currentDate).endOf('day');
            
            // Filter orders for the current day
            const dayOrders = orders.filter(order => 
                moment(order.createdAt).isBetween(dayStart, dayEnd)
            );
            
            // Calculate total sales for the day
            const totalSales = dayOrders.reduce((sum, order) => sum + order.totalPrice, 0);
            
            salesData.push({
                x: currentDate.format('YYYY-MM-DD'),       // Date in YYYY-MM-DD format
                y: totalSales                              // Total sales amount
            });
            
            currentDate.add(1, 'days');                    // Move to the next day
        }


        // Summary statistics
        const totalOrders = await Order.countDocuments({
            createdAt: { $gte: start.toDate(), $lte: end.toDate() }
        });
        
        const totalRevenue = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: start.toDate(), $lte: end.toDate() },
                    paymentStatus: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' }
                }
            }
        ]);

        const orderStatusCount = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: start.toDate(), $lte: end.toDate() } 
                }
            },
            {
                $group: {
                    _id: '$orderStatus',          // Group by order status
                    count: { $sum: 1 }            // Count the number of orders
                }
            }
        ]);


         // Fetch top 10 selling products
         const topProducts = await Order.aggregate([
            {
                $match: {
                    orderStatus: { $ne: 'cancelled' },  // Exclude cancelled orders
                    paymentStatus: 'completed'          // Only completed payments
                }
            },
            { $unwind: '$items' },                      // Unwind the items array
            {
                $group: {
                    _id: '$items.product',                      // Group by product ID
                    totalQuantity: { $sum: '$items.quantity' }, // Total quantity sold
                    totalRevenue: { $sum: '$items.totalPrice' },// Total revenue
                    orders: { $addToSet: '$_id' }               // Collect unique order IDs
                }
            },
            {
                $lookup: {
                    from: 'products',                   // Join with products collection
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },             // Get individual product details

            {
                $project: {
                    name: '$productDetails.title',      // Include product name
                    totalQuantity: 1,
                    totalRevenue: 1,
                    orderCount: { $size: '$orders' }   // Count of unique orders
                }
            },
            { $sort: { totalQuantity: -1 } },         // Sort by quantity sold
            { $limit: 10 }                            // Limit to top 10 products
        ]);

        


        // Fetch top 10 product categories 
        const topCategories = await Order.aggregate([
            
            {
                $match: {
                    orderStatus: { $ne: 'cancelled' },  // Only include non-cancelled orders
                    paymentStatus: 'completed'  // Only include completed payment orders
                }
            }, 
            { $unwind: '$items' },  // Unwind the items array to treat each item individually
            {
                $lookup: {
                    from: 'products',  // Lookup from the 'products' collection
                    localField: 'items.product',  // Match product ID from the order items
                    foreignField: '_id',  // Match the _id field in the 'products' collection
                    as: 'product'  // Alias the matched product details as 'product'
                }
            },
            { $unwind: '$product' },  // Unwind the product array to access individual product details
            {
                $group: {
                    _id: '$product.productCategory',  // Group by product category ID
                    totalQuantity: { $sum: '$items.quantity' },  // Sum the quantities for each category
                    totalRevenue: { $sum: '$items.totalPrice' },  // Sum the total price for each category
                    orders: { $addToSet: '$_id' },  // Collect unique order IDs
                    genderCategoryId: { $first: '$product.genderCategory' }  // Get the gender category ID from the product
                }
            },
            {
                $lookup: {
                    from: 'productcategories',  // Lookup from the 'categories' collection
                    localField: '_id',  // Match the product category ID
                    foreignField: '_id',  // Match with the _id field in the 'categories' collection
                    as: 'categoryDetails'  // Alias the matched category details as 'categoryDetails'
                }
            },
            { $unwind: '$categoryDetails' },  // Unwind to get the category name
            {
                $lookup: {
                    from: 'gendercategories',  // Lookup from the 'gendercategories' collection
                    localField: 'genderCategoryId',  // Match the gender category ID
                    foreignField: '_id',  // Match the _id field in the 'gendercategories' collection
                    as: 'genderCategoryDetails'  // Alias the matched gender category details as 'genderCategoryDetails'
                }
            },
            { $unwind: '$genderCategoryDetails' },  // Unwind to get the gender category details
            {
                $project: {
                    category: '$categoryDetails.name',  // Replace _id with the category name
                    genderCategory: '$genderCategoryDetails.name',  // Include the gender category name
                    totalQuantity: 1,  // Include total quantity in the result
                    totalRevenue: 1,  // Include total revenue in the result
                    orderCount: { $size: '$orders' }  // Calculate the number of unique orders
                }
            },
            { $sort: { totalQuantity: -1 } },  // Sort by total quantity in descending order
            { $limit: 10 }  // Limit the results to the top 10 categories
        ]);


 



        const topSubcategories = await Order.aggregate([
            {
                $match: {
                    orderStatus: { $ne: 'cancelled' },  // Only non-cancelled orders
                    paymentStatus: 'completed'          // Only completed payments
                }
            },
            { $unwind: '$items' },  // Unwind items array in orders
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',   // Match product in items with product _id
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },  // Unwind the product array
            {
                $lookup: {
                    from: 'productsubcategories',  // Lookup from subcategories collection
                    localField: 'product.productSubCategory',  // Match subcategory ID from product (correct field name)
                    foreignField: '_id',
                    as: 'subcategoryDetails'
                }
            },
            { $unwind: '$subcategoryDetails' },  // Unwind subcategory details
            {
                $lookup: {
                    from: 'productcategories',  // Lookup to get parent category from productcategories collection
                    localField: 'subcategoryDetails.productCategory',  // Assuming category field is named `productCategory`
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            { $unwind: '$categoryDetails' },  // Unwind category details
            {
                $group: {
                    _id: '$product.productSubCategory',  // Group by subcategory
                    subcategoryName: { $first: '$subcategoryDetails.name' },  // Get subcategory name
                    categoryName: { $first: '$categoryDetails.name' },  // Get parent category name
                    totalQuantity: { $sum: '$items.quantity' },  // Sum total quantities sold
                    totalRevenue: { $sum: '$items.totalPrice' },  // Sum total revenue
                    orders: { $addToSet: '$_id' }  // Collect order IDs
                }
            },
            {
                $project: {
                    subcategory: '$subcategoryName',  // Project subcategory name
                    parentCategory: '$categoryName',  // Project parent category name
                    totalQuantity: 1,
                    totalRevenue: 1,
                    orderCount: { $size: '$orders' }  // Count of unique orders
                }
            },
            { $sort: { totalQuantity: -1 } },  // Sort by total quantity in descending order
            { $limit: 10 }  // Limit to top 10
        ]);
        
      
        

        res.render('backend/admin-dashboard', {
            admin : req.session.admin.email ,
            partial : "partials/dashboard" ,
            salesData: JSON.stringify(salesData) ,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0 ,   
            orderStatusCount,
            currentFilter: filter,  
            topProducts,
            topCategories,
            topSubcategories
        });
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404") ; 
    }
}




const generateLedger = async (req, res) => {
    try {
        const startDate = moment().startOf('year').toDate();
        const endDate = moment().endOf('year').toDate();

        // Fetch orders from the start of the year to the current date
        const orders = await Order.find({
            createdAt: { $gte: startDate, $lte: endDate },
            paymentStatus: 'completed'
        }).populate('items.product'); // Populate product details
           
        if(orders.length == 0){
            return res.redirect("/admin/dashboard") ;
        }
    
        // Create the ledger
        let ledgerData = "Product Name, Quantity Sold, Total Revenue, Order Date\n";
        let totalRevenue = 0;
        let totalQuantity = 0;

        orders.forEach((order) => {
            order.items.forEach((item) => {
                // Check if item.product and item.product.title are not null
                if (item.product && item.product.title) {
                    const orderDate = `"${moment(order.createdAt).format('DD/MM/YYYY')}"`; // Indian date format
                    const quantity = item.quantity;
                    const revenue = item.totalPrice;

                    ledgerData += `${item.product.title},${quantity},${revenue},${orderDate}\n`;
                    totalRevenue += revenue;
                    totalQuantity += quantity;
                }
            });
        });

        // Add total revenue and total quantity sold
        ledgerData += `\nTotal,${totalQuantity},${totalRevenue.toFixed(2)},\n`;

        // Directory to store the ledger file
        const ledgerDir = path.join(__dirname, '../../../public/ledger');

        // Ensure the directory exists
        ensureDirectoryExistence(ledgerDir);

        // Generate file path for the ledger file
        const filePath = path.join(ledgerDir, `ledger_${moment().format('YYYYMMDD_HHmmss')}.csv`);

        // Save the ledger data to the file
        fs.writeFileSync(filePath, ledgerData);

        // Provide a download link to the generated ledger
        res.download(filePath, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).send('Error generating ledger');
            }

            // Optionally, delete the ledger file after sending it to the user
            fs.unlinkSync(filePath);
        });
    } catch (err) {
        console.log(err);
        res.status(500).render("frontend/404");
    }
};





module.exports  =  {  
    dashboard , 
    generateLedger 
}  ; 