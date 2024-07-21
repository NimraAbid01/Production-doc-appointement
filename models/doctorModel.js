const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
  },
  website: {
    type: String,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is necessary'],
  },
  experience: {
    type: String,
    required: [true, 'Experience is necessary'],
  },
  feePerConsultation: {
    type: Number,
    required: [true, 'The fee is required'],
},

  status: {
    type: String,
    default: 'pending',
  },
  timings: {
    type: {
     
      start: String,
      end: String,
    },
    required: [true, 'Work timings is required'],
  },
}, { timestamps: true });

const doctorModel = mongoose.model("doctors", doctorSchema);
module.exports = doctorModel;
