import { Admin } from "../models/adminModel.js";
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import passport from 'passport';

var opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extracts JWT from Authorization header

    secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET_KEY, // Secret key for JWT verification
};

passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
    console.log("fdsafd")
    try {
        // Attempt to find the admin based on the _id from JWT payload
        const user = await Admin.findOne({ _id: jwt_payload._id }).select('-password'); // Exclude password field

        if (user) {
            return done(null, user); // If admin found, pass the admin object
        } else {
            return done(null, false); // If no admin found, authentication fails
        }

    } catch (error) {
        return done(error, false); // Corrected variable name from 'err' to 'error'
    }
}));