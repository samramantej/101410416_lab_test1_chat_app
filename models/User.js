const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    password: { type: String, required: true },
    createon: { type: String, default: new Date().toLocaleString() }
});

module.exports = mongoose.model("User", userSchema);
