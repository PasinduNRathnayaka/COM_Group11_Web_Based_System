import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

},{minimize: false})

const User = mongoose.models.user || mongoose.model('user',userSchema)

export default User