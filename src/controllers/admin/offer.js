
//import schemas
const GenderCategory = require("../../models/genderCategory");
const Product = require("../../models/product");


const { ADMIN_ROUTES } = require("../../constants/routes")
const { VIEWS } = require("../../constants/view")
const { HTTP_STATUS } = require("../../constants/statusCodes")



//GET OFFERS
const offers = async (req, res) => {
    try {
        const genderCategories = await GenderCategory.find();
        const products = await Product.find();
        res.render("backend/admin-dashboard", { admin: req.session.admin.email, partial: "partials/offers", genderCategories, products });
    } catch (err) {
        console.log(err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("frontend/404");
    }
}



//GET PRODUCT OFFERS
const productOffers = async (req, res) => {
    try {

        const genderCategories = await GenderCategory.find();

        const searchQuery = req.query.search || '';
        let products;


        const page = parseInt(req.query.page) || 1;
        const limit = 7;

        // const totalOrders = await Product.countDocuments() ;
        const totalOrders = searchQuery
            ? await Product.countDocuments({ title: { $regex: searchQuery, $options: 'i' } })
            : await Product.countDocuments();

        const skip = (page - 1) * limit;


        //const products = await Product.find().skip(skip).limit(limit) ;

        if (searchQuery) {
            products = await Product.find({
                title: { $regex: searchQuery, $options: 'i' }  // Case-insensitive search
            }).skip(skip).limit(limit);
        } else {
            products = await Product.find().skip(skip).limit(limit); // Get all products if no search query
        }

        const totalPages = Math.ceil(totalOrders / limit);


        res.render("backend/admin-dashboard", {
            admin: req.session.admin.email, partial: "partials/offers-product", genderCategories, products,
            currentPage: page, totalPages, searchQuery
        });
    } catch (err) {
        console.log(err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("frontend/404");
    }
}



//POST SAVE CATEGORY OFFER
const saveCategoryOffer = async (req, res) => {
    try {
        const categoryId = req.body.id;
        const offer = req.body.offer;
        const expiryDate = req.body.expiryDate || new Date(Date.now() + 24 * 60 * 60 * 1000);

        await GenderCategory.findByIdAndUpdate(categoryId, { offer: offer, offerExpiry: expiryDate });
        res.status(HTTP_STATUS.OK).json({
            message: 'Category offer updated successfully',
        });
    } catch (err) {
        console.log(err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("frontend/404");
    }
}



//POST SAVE PRODUCT OFFER
const saveProductOffer = async (req, res) => {
    try {
        const productId = req.body.id;
        const offer = req.body.offer;
        const expiryDate = req.body.expiryDate || new Date(Date.now() + 24 * 60 * 60 * 1000);

        await Product.findByIdAndUpdate(productId, { offer: offer, offerExpiry: expiryDate });
        res.status(HTTP_STATUS.OK).json({
            message: 'Product offer updated successfully',
        });
    } catch (err) {
        console.log(err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("frontend/404");
    }
}



module.exports = {
    offers,
    saveCategoryOffer,
    saveProductOffer,
    productOffers
}