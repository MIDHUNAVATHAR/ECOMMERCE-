
//import  schemas
const ReturnOrder = require("../../models/returnOrder");
const Product = require("../../models/product");
const User = require("../../models/userSchema");
const WalletTransaction = require("../../models/walletTransaction");
const Address = require('../../models/addressSchema');


const { ADMIN_ROUTES } = require("../../constants/routes")
const { VIEWS } = require("../../constants/view")
const { HTTP_STATUS } = require("../../constants/statusCodes")



//GET  RETURN ORDERS
const returnOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const statusFilter = req.query.status || '';
        const searchEmail = (req.query.search || '').trim();

        const query = {};

        if (statusFilter) {
            query.returnStatus = statusFilter;
        }

        if (searchEmail) {
            const users = await User.find({ email: { $regex: searchEmail, $options: 'i' } }).select('_id');
            const userIds = users.map(user => user._id);
            query.userId = { $in: userIds };
        }

        const totalOrders = await ReturnOrder.countDocuments(query);
        const totalPages = Math.ceil(totalOrders / limit);

        const returnOrders = await ReturnOrder.find(query)
            .populate('orderId')
            .populate('userId')
            .populate('pickupAddress')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.render("backend/admin-dashboard.ejs", {
            message: '', admin: req.session.admin.email, partial: "partials/returnOrders",
            returnOrders, currentPage: page, totalPages, totalOrders,
            statusFilter, searchEmail
        })
    } catch (err) {
        console.log(err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("frontend/404");
    }

}



//UPDATE STATUS
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;

        const returnOrder = await ReturnOrder.findById(id);

        if (!returnOrder) {
            return res.status(404).json({ message: 'Return order not found' });
        }

        // Check if order is already completed
        if (returnOrder.returnStatus === 'completed') {
            return res.status(400).json({
                message: 'Cannot modify completed return orders'
            });
        }

        returnOrder.returnStatus = status;
        if (adminNote) {
            returnOrder.adminNote = adminNote;
        }



        //update the product quantity to database 
        if (status === 'completed') {
            // Update product quantities
            for (const item of returnOrder.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    const sizeObj = product.sizes.find(size => size.size === item.size);
                    if (sizeObj) {
                        sizeObj.quantity += item.quantity;
                    }
                    await product.save();
                }
            }

            // Add refund amount to user's wallet
            const user = await User.findById(returnOrder.userId);
            if (user) {
                const refundAmount = toTwoDecimals(returnOrder.totalRefundAmount);
                user.walletBalance = toTwoDecimals(user.walletBalance + refundAmount);

                // Create wallet transaction record
                const walletTransaction = new WalletTransaction({
                    userId: user._id,
                    amount: refundAmount,
                    type: 'credit',
                    description: `Refund for returned order ${returnOrder._id}`,
                    balanceAfterTransaction: toTwoDecimals(user.walletBalance)
                });

                await walletTransaction.save();

                await user.save();
            }
        }

        await returnOrder.save();
        res.redirect('/admin/returnOrders');
    } catch (err) {
        console.log(err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("frontend/404");
    }
}



//VIEW RETURN ORDER
const getReturnOrderDetails = async (req, res) => {
    try {
        const returnOrderId = req.params.id;
        const returnOrder = await ReturnOrder.findById(returnOrderId)
            .populate('orderId')
            .populate('userId')
            .populate({
                path: 'items.product',
                model: 'Product'
            })
            .populate('pickupAddress');

        if (!returnOrder) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Return order not found' });
        }

        res.render("backend/admin-dashboard.ejs", {
            message: '', admin: req.session.admin.email,
            partial: "partials/returnOrderView", returnOrder
        });

    } catch (err) {
        console.log(err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("frontend/404");
    }
}



module.exports = {
    returnOrders,
    updateStatus,
    getReturnOrderDetails
};    