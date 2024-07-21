const express = require("express");
const colors = require("colors");
const morgan = require("morgan"); 
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const connectDB = require("./config/db");
const path = require('path')
// dotenv config
dotenv.config();

// MongoDB connection
connectDB();

// Express app
const app = express();

// Middlewares
app.use(express.json());
app.use(morgan("dev")); // Using the corrected morgan middleware

// Routes
app.use("/api/v1/user", require("./routes/userRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/doctor", require("./routes/doctorRoutes"));        

//static files 
app.use(express.static(path.join(__dirname, './client/build')))
app.get('*' ,function(req,res){
  res.sendFile(path.join(__dirname, './client/build/index.html'));
}
)
// Port
const port = process.env.PORT || 8080;

// Listen on port
app.listen(port, () => {
  console.log(
    `Server Running in ${process.env.NODE_MODE} Mode on port ${process.env.PORT}`
      .bgCyan.white
  );
});
