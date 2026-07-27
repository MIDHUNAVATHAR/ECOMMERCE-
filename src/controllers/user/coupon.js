
//import schemas
const User = require("../../models/userSchema");
const Cart = require("../../models/cartSchema");
const Coupon = require("../../models/couponSchema");
const Logo = require("../../models/logoSchema");
const GenderCategory = require("../../models/genderCategory");


const { HTTP_STATUS } = require("../../constants/statusCodes")



//add coupon
//add coupon
const couponAddCart = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user.id : "" || req.session.passport ? req.session.passport.user : "";
        const user = await User.findById(userId);
        const cart = await Cart.findOne({ user: userId });

        if (!user || !cart) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ user: false });
        }

        const couponCode = req.body.couponCode ? req.body.couponCode.trim() : "";
        const coupon = await Coupon.findOne({ code: couponCode });

        if (!coupon) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: `Enter a valid Coupon` });
        } else if (new Date(coupon.expiryDate) <= new Date()) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: `Coupon Expired` });
        }

        // Calculate available cart total value
        let cartValue = 0;
        for (let i = 0; i < cart.items.length; i++) {
            if (cart.items[i].status == "Available") {
                for (let m = 0; m < cart.items[i].quantity; m++) {
                    cartValue += cart.items[i].discountedPrice;
                }
            }
        }

        // Check min purchase amount requirement
        if (coupon.minPurchaseAmount && cartValue < coupon.minPurchaseAmount) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: `Minimum purchase amount for this coupon is ₹${coupon.minPurchaseAmount}`
            });
        }

        // Check usage limit for user
        const userCoupon = user.appliedCoupons.find(c => c.couponCode === couponCode);

        if (userCoupon) {
            if (userCoupon.totalApply >= coupon.usageLimit) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: `Coupon limit Exceeded` });
            }
            userCoupon.totalApply += 1;
        } else {
            user.appliedCoupons.push({
                couponCode: couponCode,
                totalApply: 1, // Initial usage
            });
        }

        // Calculate percentage discount, capped by maxDiscountAmount
        let calculatedDiscount = (cartValue * coupon.discountPercentage) / 100;
        if (coupon.maxDiscountAmount && calculatedDiscount > coupon.maxDiscountAmount) {
            calculatedDiscount = coupon.maxDiscountAmount;
        }
        calculatedDiscount = parseFloat(calculatedDiscount.toFixed(2));

        user.couponBalance = calculatedDiscount;
        cart.couponBalance = calculatedDiscount;

        const updatedUser = await user.save();
        const appliedUserCoupon = updatedUser.appliedCoupons.find(c => c.couponCode === couponCode);
        updatedUser.coupon = appliedUserCoupon._id;

        await cart.save();
        await updatedUser.save();

        return res.status(HTTP_STATUS.OK).json({ success: true, message: "Coupon applied successfully" });

    } catch (err) {
        console.log(err);
        res.status(HTTP_STATUS.BAD_REQUEST).json({ user: false });
    }
}




//remove coupon
const removeCoupon = async (req, res) => {

    try {
        const couponId = req.body.couponId;

        const userId = req.session.user ? req.session.user.id : "" || req.session.passport ? req.session.passport.user : "";
        const user = await User.findById(userId);
        const cart = await Cart.findOne({ user: userId });

        if (user && user.appliedCoupons) {
            const userCoupon = user.appliedCoupons.find(coupon => coupon._id.equals(couponId));

            if (userCoupon && userCoupon.totalApply > 0) {
                userCoupon.totalApply = userCoupon.totalApply - 1;
            }
            user.couponBalance = 0;
            user.coupon = null;
            await user.save();
        }
        if (cart) {
            cart.couponBalance = 0;
            await cart.save();
        }

        res.status(HTTP_STATUS.OK).json({ success: true });

    } catch (err) {
        console.log(err);
        res.status(HTTP_STATUS.BAD_REQUEST).json({ user: false });
    }

}




//GET COUPONS
const coupons = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user.id : "" || req.session.passport ? req.session.passport.user : "";
        const logo = await Logo.findOne().sort({ updatedAt: -1 });
        const genderCategory = await GenderCategory.find({ softDelete: false });
        const user = await User.findById(userId);


        let cartTotal;
        if (userId) {
            const cart = await Cart.findOne({ user: userId });
            if (cart && cart.items > 0) {
                console.log(cart.items);
                cartTotal = cart.items.reduce((total, item) => {
                    return item.status === "Available" ? total + item.quantity : total;
                }, 0);
            }
        } else {
            cartTotal = 0;
        }



        const { page = 1, limit = 8 } = req.query;

        const coupons = await Coupon.find()
            .sort({ expiryDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit);


        const appliedCoupons = user.appliedCoupons;

        // Restructure coupons based on user's applied coupons
        const couponsWithAdjustedUsage = coupons.map(coupon => {
            // Find if user has applied this coupon
            const appliedCoupon = appliedCoupons.find(ac => ac.couponCode === coupon.code);

            // Get applied count - if coupon is found in applied coupons, use its totalApply, otherwise 0
            const appliedCount = appliedCoupon ? appliedCoupon.totalApply : 0;

            // Calculate remaining user limit
            const usageLimit = appliedCoupon ? Math.max(0, coupon.usageLimit - appliedCount) : coupon.usageLimit;


            return {
                ...coupon.toObject(), // Spread all coupon properties
                usageLimit: usageLimit // Override the original usageLimit with calculated one
            };

        })

        const totalCoupons = await Coupon.countDocuments();
        const totalPages = Math.ceil(totalCoupons / limit);


        res.render('frontend/coupons', {
            coupons: couponsWithAdjustedUsage, userId, totalPages, currentPage: page,
            limit, logo, genderCategory, user, cartTotal
        });
    } catch (err) {
        console.log(err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("frontend/404");
    }
}



module.exports = {
    couponAddCart,
    removeCoupon,
    coupons
}; 