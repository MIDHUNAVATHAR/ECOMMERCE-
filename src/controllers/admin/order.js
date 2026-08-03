
//import schemas
const Orders = require("../../models/orderSchema");
const User = require("../../models/userSchema");
const WalletTransaction = require("../../models/walletTransaction");
const Product = require("../../models/product");


const { ADMIN_ROUTES } = require("../../constants/routes")
const { VIEWS } = require("../../constants/view")
const { HTTP_STATUS } = require("../../constants/statusCodes")

const toTwoDecimals = (value) => Number(parseFloat(value || 0).toFixed(2));

//GET ORDERS
const orders = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const searchEmail = (req.query.search || '').trim();
        const statusFilter = req.query.status || '';
        const skip = (page - 1) * limit;

        const query = {};

        if (statusFilter) {
            query.orderStatus = statusFilter;
        }

        if (searchEmail) {
            const users = await User.find({ email: { $regex: searchEmail, $options: 'i' } }).select('_id');
            const userIds = users.map(user => user._id);
            query.userId = { $in: userIds };
        }

        const totalOrders = await Orders.countDocuments(query);
        const totalPages = Math.ceil(totalOrders / limit);

        const orders = await Orders.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("userId");

        res.render("backend/admin-dashboard.ejs", {
            message: '', admin: req.session.admin.email,
            partial: "partials/orders", orders, currentPage: page, totalPages,
            searchKeyword: searchEmail,
            statusFilter
        });

    } catch (err) {
        console.log(err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("frontend/404");
    }
}


//ORDER VIEW
const viewOrder = async (req, res) => {
    try {

        const order = await Orders.findById(req.params.orderId).populate("items.product").populate("shippingAddress");
        // Format order date
        const orderDate = new Date(order.createdAt).toLocaleString();
        res.render("backend/admin-dashboard.ejs", { message: '', admin: req.session.admin.email, partial: "partials/viewOrder", order, orderDate });

    } catch (err) {
        console.log(err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("frontend/404");
    }
}



//UPDATE ORDER STATUS
const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, orderId } = req.body;

        const existingOrder = await Orders.findById(orderId);
        if (!existingOrder) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "order not found" });
        }

        const isTerminalStatus = ['delivered', 'cancelled'].includes(existingOrder.orderStatus);
        if (isTerminalStatus && orderStatus !== existingOrder.orderStatus) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "This order cannot be changed once it is delivered or cancelled." });
        }

        if (orderStatus === 'cancelled' && existingOrder.productCancellationLocked) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "A product from this order is already cancelled. The remaining products cannot be cancelled from this order."
            });
        }

        const savedOrder = await Orders.findByIdAndUpdate(orderId, { orderStatus }, { new: true });

        if (orderStatus === 'cancelled' && existingOrder.orderStatus !== 'cancelled') {
            for (let i = 0; i < savedOrder.items.length; i++) {
                if (savedOrder.items[i].itemStatus === 'cancelled') {
                    continue;
                }

                let productId = savedOrder.items[i].product;
                let size = savedOrder.items[i].size;
                let orderQuantity = savedOrder.items[i].quantity;

                let product = await Product.findById(productId);

                if (product) {
                    let itemToUpdate = product.sizes.find(item => item.size === size);

                    if (itemToUpdate) {
                        itemToUpdate.quantity += orderQuantity;
                        await product.save();
                    }
                }

                savedOrder.items[i].itemStatus = 'cancelled';
                savedOrder.items[i].cancelledAt = new Date();
            }

            savedOrder.productCancellationLocked = true;

            const userId = savedOrder.userId;
            const user = await User.findById(userId);

            const shouldRefund = savedOrder.paymentStatus === 'completed' && savedOrder.paymentMethod !== 'cash-on-delivery';
            const amountPayable = toTwoDecimals(shouldRefund ? savedOrder.totalPrice : 0);
            const walletRefundAmount = toTwoDecimals((savedOrder.appliedWallet || 0) + amountPayable);

            if (user && walletRefundAmount > 0) {
                user.walletBalance = toTwoDecimals((user.walletBalance || 0) + walletRefundAmount);
                const savedUser = await user.save();

                const walletTransaction = new WalletTransaction({
                    userId,
                    amount: walletRefundAmount,
                    type: 'credit',
                    description: `Refund for cancelled order ${savedOrder._id}`,
                    balanceAfterTransaction: toTwoDecimals(savedUser.walletBalance)
                });

                await walletTransaction.save();
            }

            await savedOrder.save();
        }

        return res.status(HTTP_STATUS.OK).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("frontend/404");
    }
}



module.exports = {
    orders,
    viewOrder,
    updateOrderStatus
}
