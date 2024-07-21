
const userModel = require("../models/usermodels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");

const appointmentModel = require("../models/appointmentModel");
const moment = require("moment");
//register callback
const registerController = async (req, res) => {
  try {
    const exisitingUser = await userModel.findOne({ email: req.body.email });
    if (exisitingUser) {
      return res
        .status(200)
        .send({ message: "User Already Exist", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newUser = new userModel(req.body);
    await newUser.save();
    res.status(201).send({ message: "Register Sucessfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Register Controller ${error.message}`
    });
  }
};

// login callback
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).send({ message: "user not found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(200).send({ message: "Invlid EMail or Password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {expiresIn: "1d",});
    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error in Login CTRL ${error.message}` });
  }
};
const authController = async (req, res) => {
  try {
    const user = await userModel.findById({_id: req.body.userId});
    user.password = undefined;
    if (!user) {
      return res.status(200).send({
        message: "user not found",
        success: false,
      });
    } else {
      res.status(200).send({
        success: true,
        data: user,
        

      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "auth error",
      success: false,
      error,
    });
  }
};

const applyDoctorController = async (req, res) => {
  try {
    const newDoctor = await doctorModel({ ...req.body, status: 'pending' });
    await newDoctor.save();
    const adminUser = await userModel.findOne({ isAdmin: true });
    const notification = adminUser.notification;
    notification.push({
      type: 'apply-doctor-request',
      message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a Doctor Account`,
      data: {
        doctorId: newDoctor._id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
        onClickPath: '/admin/doctors'
      }
    });
     await userModel.findByIdAndUpdate(adminUser._id,{notification});
     res.status(201).send({
      success: true,
      message: 'Doctor application submitted successfully', 
     }); 
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: 'Error while applying for doctor'
    });
  }
};
//notification ctrl
const getAllNotificationController =async (req,res) =>{
try{
  const user = await userModel.findOne({_id: req.body.userId });
  const seennotification = user.seennotification;
  const notification = user.notification;
  seennotification.push(...notification);
  user.notification = [];
  user.seennotification = notification;
  const updatedUser = await user.save();
  res.status(200).send({
    success:true,
    message:'all notification mark as read',
    data:updatedUser,
  });
} catch(error){
  console.log(error);
    res.status(500).send({
      message: 'Error in notification',
      success: false,
      error,
      
});
}
};
//delete notification
const deleteAllNotificationController = async(req,res) =>{
  try{
   const user = await userModel.findOne({_id:req.body.userId});
   user.notification = [];
   user.seennotification = [];
   const updatedUser = await user.save();
   updatedUser.password = undefined;
   res.status(200).send({
    success:true,
    message:'Notifications deleted successfully',
    data:updatedUser,

   });
  }catch(error){
    console.log(error);
    res.status(500).send({
      message: 'Error in delete all notification',
      success:false,
      error,
    })
  }
};


//GET ALL DOC
const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Docots Lists Fetched Successfully",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Errro WHile Fetching DOcotr",
    });
  }
};

//bookeappointement


// bookingAvailabilityController




const bookingAvailabilityController = async (req, res) => {
  try {
    const date = moment(req.body.date, "YYYY-MM-DD").toISOString();
    const time = moment(req.body.time, "HH:mm").toISOString();

    // Check for any booked appointments that overlap with the requested time slot
    const existingAppointments = await appointmentModel.findOne({
      doctorId: req.body.doctorId,
      date,
      time,
      status: 'booked'
    });

    if (existingAppointments) {
      console.log(`Appointment already booked for ${req.body.date} at ${req.body.time}`);
      return res.status(200).send({
        success: false,
        message: "Appointment not available at this time",
      });
    } else {
      console.log(`Appointment available for ${req.body.date} at ${req.body.time}`);
      return res.status(200).send({
        success: true,
        message: "Appointment available",
      });
    }
  } catch (error) {
    console.log("Error in bookingAvailabilityController:", error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in checking availability",
    });
  }
};


  // bookeAppointmnetController
  
  const bookeAppointmnetController = async (req, res) => {
    try {
      const date = moment(req.body.date, "DD-MM-YYYY").format("YYYY-MM-DD");
      const time = moment(req.body.time, "HH:mm").format("HH:mm");
      const doctorId = req.body.doctorId;
  
      console.log(`Attempting to book appointment for: {
        date: '${date}',
        time: '${time}',
        doctorId: '${doctorId}'
      }`);
  
      // Check if the slot is already booked
      const existingAppointment = await appointmentModel.findOne({
        doctorId,
        date,
        time,
        status: 'booked',
      });
  
      if (existingAppointment) {
        return res.status(200).send({
          success: false,
          message: "This slot is already booked. Please choose another time.",
        });
      }
  
      const status = "pending";
      const doctor = await doctorModel.findById(doctorId);
  
      const newAppointment = new appointmentModel({
        userId: req.body.userId,
        doctorId: doctorId,
        doctorInfo: {
          id: doctor._id,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          phone: doctor.phone,
        },
        userInfo: req.body.userInfo,
        date: date,
        status: status,
        time: time,
      });
  
      await newAppointment.save();
  
      const user = await userModel.findOne({ _id: doctor.userId });
      user.notification.push({
        type: "New-appointment-request",
        message: `A New Appointment Request from ${req.body.userInfo.name}`,
        onClickPath: "/user/appointments",
      });
      await user.save();
  
      res.status(200).send({
        success: true,
        message: "Appointment Booked successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        error,
        message: "Error While Booking Appointment",
      });
    }
  };
  




//user appointement
const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({
      userId: req.body.userId,
    });
    res.status(200).send({
      success: true,
      message: "Users Appointments Fetch SUccessfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In User Appointments",
    });
  }
};
module.exports = {loginController, registerController , authController,applyDoctorController,getAllNotificationController,deleteAllNotificationController,getAllDoctorsController, bookeAppointmnetController , bookingAvailabilityController, userAppointmentsController};