
// const Listing = require("../Models/listing.js");
const User = require("../Models/user.js");
// const Review = require("../Models/review.js");
const ExpressError = require("../utils/ExpressError.js")
const mongoose = require("mongoose");

module.exports.renderSignUp = (req, res) => {
    res.render("./user/signup.ejs");
}

module.exports.signUp = async (req, res) => {
    try {
        let { email, username, password } = req.body;
        let name = username.replace("@gmail.com", "");
        const newUser = new User({ email, username, name });
        let registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            console.log(registeredUser);
            req.flash("success", "Welcome To Connect 🤝 :)");
            res.redirect("/");
        });

    }
    catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
}


module.exports.renderLogin = (req, res) => {
    res.render("./user/login.ejs");
}


module.exports.login = async (req, res) => {
    req.flash("success", "Welcome To Connect 🤝! You are logged in !");
    
    
    res.redirect(`/user/profile/${req.user.id}/#profile`);
    
}


module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.flash("success", "You Are Logged Out!");
        res.redirect("/");
    });
}

module.exports.userProfile = async (req, res, next) => {
    let userProfile = await User.findById(req.params.id);
    
    // console.log(userProfile)
    if (userProfile) {
        // let reviews = await Review.find({ owner: req.params.id });
        // let listings = await Listing.find({ owner: req.params.id });
        res.render("./user/profile.ejs", { userProfile });
    } else {
        return next(new ExpressError(404, "User Acccount Does't Exist My Dear :)"));
    }

}
module.exports.editUserProfile = async (req, res, next) => {
    let userProfile = await User.findById(req.params.id);
    // console.log(userProfile)
    if (userProfile) {
        res.render("./user/editProfile.ejs", { userProfile });
    } else {
        return next(new ExpressError(404, "User Acccount Does't Exist My Dear :)"));
    }

}


module.exports.saveEditsOfUserProfile = async (req, res, next) => {
    let { user } = req.body;
    delete user.username; //it someone added i will not allow to change anybody
    user.name = user.name.toLowerCase(); //user have full choice to  decide name
    
    let userSocailNetwork = [];
    userSocailNetwork[0] = {
        appName:"instagram",
        profileURL:user?.instagram,
    }
    userSocailNetwork[1] = {
        appName:"linkedin",
        profileURL:user?.linkedin,
    }
    userSocailNetwork[2] = {
        appName:"youtube",
        profileURL:user?.youtube,
    }
    userSocailNetwork[3] = {
        appName:"facebook",
        profileURL:user?.fb,
    }
    userSocailNetwork[4] = {
        appName:"twitter",
        profileURL:user?.twitter,
    }
    userSocailNetwork[5] = {
        appName:"snapchat",
        profileURL:user?.snapchat,
    }
    userSocailNetwork[6] = {
        appName:"threads",
        profileURL:user?.threads,
    }
    userSocailNetwork[7] = {
        appName:"telegram",
        profileURL:user?.telegram,
    }
    user.userSocailNetwork = userSocailNetwork;

    //     user.contact_num = phone_no;
    let updatedUser = await User.findByIdAndUpdate(`${req.user._id}`, { ...user }, { new: true, runValidators: true });
    console.log(updatedUser);
    // let updatedUser = await User.findById(`${req.user._id}`);
    res.redirect(`/user/profile/${req.user._id}/#profile`);

}


module.exports.userIsNotLogin = (req, res, next) => {
    req.flash("error", "Before Doing That Please Login :)")
    res.redirect("/login/#user");
}


module.exports.addNewUser = async (req, res, next) => {
    let { fanID, starID } = req.body;
    console.log(req.body);
    let star = await User.findById(starID);
    let fan = await User.findById(fanID);

    //jab ye dono conditions true nhi hai tab ye ker do
    if (!(star.followers.includes(fanID) && fan.followings.includes(starID))) {
        // fan.followings.push(new mongoose.Types.ObjectId(starID));
        fan.followings.push(starID);
        star.followers.push(fan);
        await fan.save();
        await star.save();

        console.log("Follow Done")

        // res.redirect(`/user/profile/${starID}`);
        res.status(200).json({ message: "Done" });
    }
    else{
        res.status(403).json({ message: "You Are Already Following that person" });
    }


}
module.exports.removeUser = async (req, res, next) => {
    let { fanID, starID } = req.body;
    console.log(req.body);
    let star = await User.findByIdAndUpdate(starID, { $pull: { followers: fanID } });
    let fan = await User.findByIdAndUpdate(fanID, { $pull: { followings: starID } });

    console.log("Unfollow Done")

    // res.redirect(`/user/profile/${starID}`);
    res.status(200).json({ message: "Done" });
}


module.exports.showFollowers = async(req,res,next)=>{
    let userID = req.params.id;

    let userProfile = await User.findById(userID).populate('followers');
    // let listings = await Listing.find({ owner: userID });
    // let postLength = listings.length;
    console.log(userProfile)
    res.render("./user/userFollowers.ejs",{userProfile});
}

module.exports.showFollowings = async(req,res,next)=>{
    let userID = req.params.id;

    let userProfile = await User.findById(userID).populate('followings');
    // let listings = await Listing.find({ owner: userID });
    // let postLength = listings.length;
    res.render("./user/userFollowings.ejs",{userProfile});
}

module.exports.showAllUsers = async(req,res,next)=>{

    let users = await User.find({});
    // console.log(users)
    res.render("./user/allusers.ejs",{users});
}