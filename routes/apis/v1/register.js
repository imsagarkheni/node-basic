let express = require("express");
let router = express.Router();
const mongoConnection = require('../../../utils/connections');
const responseManager = require('../../../utils/response.manager');
const usersModel = require('../../../models/users.model');
const helper = require('../../../utils/helper');
const constants = require('../../../utils/constants');


router.post('/register', async (req, res) => {
  const {firstName,lastName, email, mobileNo,password } = req.body;
  if(mobileNo && mobileNo != '' && mobileNo != null && mobileNo.length > 9){
    let otp = '1234';
    let primary = mongoConnection.useDb(constants.DEFAULT_DB);
    let userdata = await primary.model(constants.MODELS.users, usersModel).findOne({ $or: [{ mobileNo: mobileNo }, { email: email }] }).lean();
    if(userdata != null){
        return responseManager.badrequest({ message: 'User already exist with same mobile or email, Please try again...' }, res);
    }else {
            let obj = {
                firstName:firstName,
                lastName:lastName,
                email : email,
                mobileNo : mobileNo,
                password : password,
                profilePic: "",
                otp:otp,
            };
            await primary.model(constants.MODELS.users, usersModel).create(obj);
            return responseManager.onSuccess('User Registration successfully!', 1, res);
            }
    }else {
    return responseManager.onSuccess({message : 'Invalid contact number please try again'}, res);
    }
 });

router.post('/login', async (req, res) => {
    // res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    // res.setHeader('Access-Control-Allow-Origin', '*');
    let { mobileNo, password } = req.body;
    let primary = mongoConnection.useDb(constants.DEFAULT_DB);
    let userdata = await primary.model(constants.MODELS.users, usersModel).findOne({ mobileNo: mobileNo }).lean();
    if(userdata != null){
        if(userdata.password == password){
            let accessToken = await helper.generateAccessToken({ userid : userdata._id.toString() });
            return responseManager.onSuccess('login successfully!', {token : accessToken,userid:userdata.mobileNo}, res);
        }else{
            return responseManager.onSuccess('Invalid mobile number or password!',0, res);  
        }
        return responseManager.onSuccess('Invalid mobile number or password!',0, res);
    }else{
        return responseManager.onSuccess('User Not Found!!!',0, res);
    }

});
router.post('/changepasswordcurrent', async(req, res)=>{
    try {
        const { mobileNo, oldpassword, password } = req.body;
        if (password && password.trim() != '' && mobileNo && mobileNo.length == 10) {
            let primary = mongoConnection.useDb(constants.DEFAULT_DB);
            let userdata = await primary.model(constants.MODELS.users, usersModel).findOne({ mobileNo: mobileNo }).lean();
            if(userdata){
                if(userdata.password == oldpassword){
                    await primary.model(constants.MODELS.users, usersModel).updateOne({ _id: userdata._id }, {$set:{password: password} });
                    return responseManager.onSuccess('User password changed successfully!', 1, res);
                 }else{
                    return responseManager.onSuccess('Invalid old password!',0, res);
                }
            }else{
                return responseManager.badrequest({ message: 'Invalid User to update password, please try again' }, res);
            }
        } else {
            return responseManager.badrequest({ message: 'Invalid data to change User password, please try again' }, res);
        }
    } catch (error) {
        
    }
})
 module.exports = router;
