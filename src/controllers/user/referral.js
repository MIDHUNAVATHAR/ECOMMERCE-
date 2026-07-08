

//import schemas
const User = require("../../models/userSchema");


const { HTTP_STATUS } = require("../../constants/statusCodes")



const withDrawBalance = async (req, res) => {
    try {
        const { amount, userId } = req.body;

        const user = await User.findById(userId);

        user.walletBalance += user.rewardsBalance;
        user.rewardsBalance = 0;

        user.save();

        return res.status(HTTP_STATUS.OK).json({ status: true });


    } catch (err) {
        console.error('Error withdraw referral balance :', err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render('frontend/404');
    }
}





module.exports = { withDrawBalance }; 