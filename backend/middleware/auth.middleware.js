import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";

const verifyjwt = async ( req , _ , next) => {
    try {
        const token =  req.cookies?.accessToken || req?.accessToken ||req?.header("authorizaton")?.replace("Bearer ", "")

        if(!token){
            throw new ApiError(401, "Unauthorized acess token ");
        }

        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select(" -password -refreshToken")

        if(!user){
            throw new ApiError(404, "User not found");
        }
        req.user = user;
        next();
    } catch (error) {


       next(new ApiError(
            error?.statusCode || 500,
            error?.message || "Something went wrong",
            error?.errors || [],
            error?.stack || ""
        ));
    }
}
export default verifyjwt;