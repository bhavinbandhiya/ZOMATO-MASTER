import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
    fullName: {type: String, required: true},
    email:{type: String, required: true},
    password:{type: String},
    address:[{details: {type: String}, for:{type:String}}],
    phoneNumber:[{type:Number}]
},
{
    timestamps:true
});

UserSchema.method.generateJwtToken = function() {
    return jwt.sign({ user:this._id.toString()}, "ZomatoApp");
};

UserSchema.statics.findEmailAndPhone = async ({email, phoneNumber}) => {
    //check whether email exists
    const checkUserByEmail = await UserModel.findOne({email});

    //check whether phoneNumber exists
    const checkUserByPhone = await UserModel.findOne({phoneNumber});
    if(checkUserByEmail || checkUserByPhone) {
        throw new Error("User already exist");
    }

    return false;
};

UserSchema.pre("save",function(next){
    const user = this;
    //password isnot modified
    if(!user.isModified("password")) return next();

    //genereting bcrypt salt
    bcrypt.genSalt(8,(error,salt)=>{
        if(error) return next(error);

        //hashing the password
        bcrypt.hash(user.password,salt,(error,hash)=>{
            if(error) return next(error);

            //assigning hashed password
            user.password = hash;
            return next();
        });
    });
});

export const UserModel = mongoose.model("Users",UserSchema);