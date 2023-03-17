const mongoose = require("mongoose");

const addressInfo = {
  district: String,
  taluk: String,
  village: String,
  zip: String,
};

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    phone_number: {
      type: String,
      required: true,
    },
    phone_number_verified: {
      type: Boolean,
      default: false,
    },
    otp:String,
    gender: {
      type: String,
    },
    education: {
      type: String,
    },
    profession: {
      type: String,
    },
    family_size: {
      type: String,
    },
    dob: {
      type: String,
    },
    id_proof: {
      type: String,
    },
    address: addressInfo,
    role: {
      type: String,
      enum: ["ROLE_USER", "ROLE_ADMIN", "ROLE_SELLER"],
      default: "ROLE_USER",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
