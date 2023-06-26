const express = require("express");
const path = require("path");
const multer = require("multer");
const { BlobServiceClient } = require("@azure/storage-blob");
const upload = multer({ storage: multer.memoryStorage() });
const mongo = require("mongodb");
const ObjectId = mongo.ObjectId;
const port = process.env.PORT || 3001;
const pg = require("pg");
const app = express();
const ejs = require("ejs");
require("dotenv").config();

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const uri = process.env.MONGODB_URI;

const store = new MongoDBStore({
  uri: uri,
  collection: "mySessions",
});

const bcrypt = require("bcrypt");
const { error } = require("console");
const saltRounds = 10;

const client = new mongo.MongoClient(uri);
const blobConnectionString = process.env.BLOB_CONNECTION_STRING;
const blobServiceClient =
  BlobServiceClient.fromConnectionString(blobConnectionString);
const containerClient = blobServiceClient.getContainerClient("images");

async function run(dbName, collection) {
  try {
    client.connect;
    const db = client.db(dbName);
    db.admin()
    .serverInfo()
    .then((info) => {
      console.log("db version: " + info.version); // prints the MongoDB server version
      });
    return db.collection(collection);
  } catch (err) {
    console.log(err.stack);
  }
}

app.use(
  session({
    secret: "key that will sign cookie",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
  );
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  app.use(express.static(__dirname));
  //app.use(express.static('public'))
  app.set("view engine", "ejs");
  
  // ======== ||  middleware || ========
  const isLoggedIn = (req, res, next) => {
    if (req.session.isLoggedIn) {
      next();
    } else {
      res.redirect("/");
    }
  };
  
// ======== ||  Login models || ========
async function login() {
  const colUser = await run("CRWebDB", "Users");
  res.locals.user = "userAdmin"; // localStorage
  const password = "norKhalid";
  bcrypt.hash(password, saltRounds).then((cryptPassword) => {
    const user = {
      username: "Admin",
      password: cryptPassword,
    };

    colUser.insertOne(user);
  });
}

// ======== ||  Login page || ========

app.get("/", async (req, res) => {
  res.render("login");
  index();
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const colUser = await run("CRWebDB", "Users");
  
  colUser
  .findOne({ username })
  .then((user) => {
    if (!user) {
      // res.send("user not found");
      return res.redirect("/");
    }
    
    const encryptPassword = user.password;
    
    bcrypt
    .compare(password, encryptPassword)
    .then((response) => {
      if (response == true) {
        res.redirect(`/index/${user._id}`);
      } else res.send("كلمة المرور خاطئة");
        })
        .catch((err) => {
          res.send("comper:" + err);
        });
        req.session.isLoggedIn = true;
    })
    .catch((err) => {
      res.send(err);
    });
}),
app.get("/index", isLoggedIn, (req, res) => {
  res.render("index");
    index();
  });
  
app.get("/logout" , (req,res) => {
  req.session.destroy((removeSession) =>{
    if (removeSession) throw removeSession
    res.redirect("/")
  })
})

// ==========================================================

function index() {
  console.log("index Function is called");
  app.get("/indexJ", async (req, res) => {
    const data = await getCarData();
    res.json(data);
    console.log("data sent");
  });
}

app.get("/indexSel",isLoggedIn, async (req, res) => {
  const colInv = await run("CRWebDB", "InvInfo");
  const invNameTable = await colInv
  .find({})
  .project({ _id: 0, InvName: 1 })
  .toArray();

  res.json({ InvName: invNameTable });
});

async function getCarData() {
  // Call run() method and set the collection to "CarsInfo"
  const colCar = await run("CRWebDB", "CarsInfo");
  
  // find the desired doc and project without id
  const carsTable = await colCar.find({}).project({}).toArray();
  
  const colInv = await run("CRWebDB", "InvInfo");
  const invTable = await colInv.find({}).project({}).toArray();
  
  const colRent = await run("CRWebDB", "RentInfo");
  const rentTable = await colRent.find({}).project({}).toArray();
  
  const colOwner = await run("CRWebDB", "OwnerInfo");
  const ownerTable = await colOwner.find({}).project({}).toArray();
  
  const colEmp = await run("CRWebDB", "EmpInfo");
  const empTable = await colEmp.find({}).project({}).toArray();
  
  const colExpenses = await run("CRWebDB", "ExpensesInfo");
  const expensesTable = await colExpenses.find({}).project({}).toArray();
  
  return {
    CarsInfo: carsTable,
    InvInfo: invTable,
    RentInfo: rentTable,
    OwnerInfo: ownerTable,
    EmpInfo: empTable,
    ExpensesInfo: expensesTable,
  };
}

app.get("/daily",isLoggedIn, async (req, res) => {
  res.render("daily");
  daily();
});
function daily() {
  app.get("/dailyJ", async (req, res) => {
    let date = new Date(); // UTC date
    let localToday = date.toLocaleString("en-ZA", { timeZone: "Asia/Riyadh" });
    let startDate = new Date(localToday.slice(0, 10));
    let endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    
    const startMonth = new Date(localToday.slice(0, 8));
    const endMonth = new Date(
      localToday.slice(0, 6) + (Number(localToday.slice(6, 7)) + 1)
      );
      const data = await getDailyData(startDate, endDate, startMonth, endMonth);
      res.json(data);
    });
  }
  
  app.get("/dailySel",isLoggedIn, async (req, res) => {
    const colCar = await run("CRWebDB", "CarsInfo");
    const carPlateTable = await colCar
    .find({})
    .project({ _id: 0, CarPlate: 1 })
    .toArray();
    
    const colRent = await run("CRWebDB", "RentInfo");
    const renterNameTable = await colRent
    .find({})
    .project({ _id: 0, RenterName: 1 })
    .toArray();

    const colExpenses = await run("CRWebDB", "ExpensesInfo");
    const expNameTable = await colExpenses
    .find({})
    .project({ _id: 0, ExpenseName: 1 })
    .toArray();
    
    res.json({
      CarPlate: carPlateTable,
      RenterName: renterNameTable,
    ExpenseName: expNameTable,
  });
});

app.post("/dailyFilter",isLoggedIn, async (req, res) => {
  let start = new Date(req.body.startDate);
  let startString = start.toLocaleString("en-US", { timeZone: "UTC" });
  let startDate = new Date(startString);
  
  let end = new Date(req.body.endDate + "T24:00:00.000Z");
  let endString = end.toLocaleString("en-US", { timeZone: "UTC" });
  let endDate = new Date(endString);
  
  let data = await getDailyData(startDate, endDate, startDate, endDate);
  
  res.json(data);
});

async function getDailyData(startDate, endDate, startMonth, endMonth) {
  const colDailyRent = await run("CRWebDB", "DailyRentInfo");
  const dailyRentTable = await colDailyRent
  .find({
    _id: {
      $gte: new ObjectId(startDate / 1000),
      $lte: new ObjectId(endDate / 1000),
    },
  })
  .project({})
  .toArray();
  
  const colDailyExp = await run("CRWebDB", "DailyExpInfo");
  const dailyExpTable = await colDailyExp
  .find({
    _id: {
      $gte: new ObjectId(startDate / 1000),
      $lte: new ObjectId(endDate / 1000),
    },
    })
    .project({})
    .toArray();
    
    const monthRentTable = await colDailyRent
    .find({
      _id: {
        $gte: new ObjectId(startMonth / 1000),
        $lte: new ObjectId(endMonth / 1000),
      },
    })
    .project({ _id: 0, PaymentMethod: 1, RentPaid: 1 })
    .toArray();
    const monthExpTable = await colDailyExp
    .find({
      _id: {
        $gte: new ObjectId(startMonth / 1000),
        $lte: new ObjectId(endMonth / 1000),
      },
    })
    .project({ _id: 0, PaymentMethod: 1, ExpenseCost: 1 })
    .toArray();
    return {
      DailyRentInfo: dailyRentTable,
    DailyExpInfo: dailyExpTable,
    MonthRentInfo: monthRentTable,
    MonthExpInfo: monthExpTable,
  };
}

app.get("/reports",isLoggedIn, async (req, res) => {
  res.render("reports");
});


app.post("/upload/:colName",isLoggedIn, upload.any(), async (req, res) => {
  let data = {};
  for (const file in req.files) {
    const blockBlobClient = containerClient.getBlockBlobClient(
      req.files[file].fieldname + "_" + req.files[file].originalname
    );
    await blockBlobClient.upload(
      req.files[file].buffer,
      req.files[file].buffer.length
      );
      let fieldName = [req.files[file].fieldname];
      data[fieldName] = blockBlobClient.url;
    }
    
  let order = JSON.parse(req.body.order);
  let combinedData = {};
  for (let i = 0; i < order.length; i++) {
    // get the current property name from the array
    let propertyName = order[i];
    
    // check if the property exists in data or req.body
    if (Object.hasOwn(data, propertyName)) {
      // assign the property and value from data to the new object
      combinedData[propertyName] = data[propertyName];
    } else if (Object.hasOwn(req.body, propertyName)) {
      // assign the property and value from req.body to the new object
      combinedData[propertyName] = req.body[propertyName];
    } else {
      // assign a default value to the new object
      combinedData[propertyName] = "";
    }
  }
  
  async function insertNewData() {
    const colName = req.params.colName;
    try {
      // Use the collection in colName
      const col = await run("CRWebDB", colName);
      
      // Insert a single document, wait for promise so we can read it back
      
      await col.insertOne(combinedData);
      
      const last = await col.find().sort({ _id: -1 }).limit(1).toArray();
      console.log(last[0]);

      if (Object.hasOwn(combinedData, "RentPaid")) {
        let VATDB = combinedData["VAT"];
        let paidPrice = combinedData["RentPaid"];
        let finalWithout = 0;
        let finalVAT = 0;
        
        if (VATDB == 0) {
          finalWithout = Number.paidPrice;
          finalVAT = 0;
        } else {
          let VAT = 1 + VATDB / 100;
          let withoutVAT = paidPrice / VAT;
          let paidPriceVAT = paidPrice - paidPrice / VAT;
          
          let withoutVATFloor =
          Math.floor((withoutVAT + Number.EPSILON) * 100) / 100;
          let paidPriceVATCeil =
            Math.ceil((paidPriceVAT + Number.EPSILON) * 100) / 100;
            
            finalWithout = withoutVATFloor;
            finalVAT = paidPriceVATCeil;
          }
          const coll = await run("CRWebDB", "Accounts");
          
          await coll.insertOne({
            transactionID: last[0]._id,
            total: paidPrice,
            VATPercentage: finalVAT,
            totalBeforeVAT: finalWithout,
            VAT: VATDB,
          });
        }
        
        res.send(last[0]);
      } catch (err) {
        console.log(err.stack);
      }
    }
  insertNewData();
});

app.post("/updateImage",isLoggedIn, upload.single("file"), async (req, res) => {
  let data;
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(
      req.body.fieldName + "_" + req.file.originalname
      );
      await blockBlobClient.upload(req.file.buffer, req.file.buffer.length);
      data = blockBlobClient.url;
      console.log(req.file);
      
      // Use the collection "CarInfo"
      const colCar = await run("CRWebDB", req.body.colName);
      const fieldName = { [req.body.fieldName]: data };
      const id = new mongo.ObjectId(req.body._id);
      console.log(id);
      
      // Insert a single document, wait for promise so we can read it back
      colCar.updateOne({ _id: id }, { $set: fieldName }, function (err, result) {
        if (err) throw err;
        console.log(result.modifiedCount + " document(s) updated");
      });
    } catch (err) {
      console.log(err.stack);
  }
  res.json({ url: data });
});

app.post("/updateData",isLoggedIn, (req, res) => {
  async function update() {
    try {
      // Use the collection "CarInfo"
      const colCar = await run("CRWebDB", req.body.colName);
      const fieldName = { [req.body.fieldName]: req.body.newValue };
      const id = new mongo.ObjectId(req.body._id);
      console.log(id);
      
      // Insert a single document, wait for promise so we can read it back
      colCar.updateOne(
        { _id: id },
        { $set: fieldName },
        function (err, result) {
          if (err) throw err;
          console.log(result.modifiedCount + " document(s) updated");
        }
        );
      } catch (err) {
        console.log(err.stack);
      }
    }
    update();
    
    res.send(req.body.cellNewData);
  });
  
  app.post("/deleteRow",isLoggedIn, (req, res) => {
    async function update() {
      try {
        // Use the collection "CarInfo"
        const colCar = await run("CRWebDB", req.body.colName);
        const id = new mongo.ObjectId(req.body._id);
        console.log(id);
        
        // Insert a single document, wait for promise so we can read it back
        colCar.deleteOne({ _id: id }, function (err, result) {
          if (err) throw err;
          console.log(result.modifiedCount + " document(s) updated");
        });
      } catch (err) {
      console.log(err.stack);
    }
  }
  update();
  
  res.send(req.body.cellNewData);
});

app.listen(port);