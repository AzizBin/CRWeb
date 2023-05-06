const http = require('http');
const express = require('express')
const fs = require('fs');
const path = require('path');
const multer = require('multer')
const {BlobServiceClient}= require('@azure/storage-blob')
const upload = multer({storage:multer.memoryStorage()})
const mongo = require('mongodb')
const ObjectId = mongo.ObjectId
const port = process.env.PORT || 3001;
var checkMimeType = true;
const pg = require('pg')
const app = express()
const ejs = require('ejs');
require('dotenv').config()
const { query } = require('express');
const { dir, log } = require('console');
const { object } = require('webidl-conversions');

const MongoClient = require('mongodb').MongoClient

const uri = process.env.MONGODB_URI
const client = new mongo.MongoClient(uri)



const containerName = 'images';
const blobConnectionString = process.env.BLOB_CONNECTION_STRING
const blobServiceClient = BlobServiceClient.fromConnectionString(blobConnectionString);
const containerClient = blobServiceClient.getContainerClient('images');





//(function (err){
// 	const db = client.db("CRWebDB")
// 	const changeStream = db.watch()

	

//   	//Listen for change events in changeStream
//   	changeStream.on('change', (change) => {
//     	console.log(change);
//     	// Send the new document to JavaScript
//     	const dataToSend = JSON.stringify(change.fullDocument);
//     	const fetchOptions = {
//       		method: 'POST',
//       		headers: { 'Content-Type': 'application/json' },
//       		body: dataToSend
//     	};
//     	fetch('/jsFormData', fetchOptions);
//   	});
// })

async function run(dbName,collection) {
	try {
		client.connect
		const db = client.db(dbName);
		db.admin().serverInfo().then(info => {
			console.log('db version: ' + info.version) // prints the MongoDB server version
		  })
		return db.collection(collection);
	
	}
	catch (err) {
		console.log(err.stack);
	}
}






app.use(express.json());       
app.use(express.urlencoded({extended: true})); 

app.use(express.static(__dirname)) 
//app.use(express.static('public'))
app.set('view engine', 'ejs');

// app.get('/:page', (req, res) => {
	
	
// 	res.render(req.params.page)
// })

 
// app.post("/", (req, res) => {
//   const username = req.body.expensname;
  
//   console.log("Username: " + username);
  
//   res.render("Data received");
// });

const testData = [
		{ _id: 1, oName: 'Option 1'},
		{ _id: 2, oName: 'Option 2'},
		{ _id: 3, oName: 'Option 3'}
	]

app.get('/', async (req, res) => {

	res.render('index');
	index()
})

app.get('/index',async (req, res) => {

	res.render('index');
	index()
})
function index (){
	console.log('index Function is called')
	app.get('/indexJ',async (req, res) =>{
		const data = await getCarData()
		res.json(data)
		console.log('data sent')
	})
}

app.get('/daily',async (req, res) => {

	res.render('daily');
	daily()
})
function daily (){
	app.get('/dailyJ',async (req, res) =>{
		let today = new Date()
  		let startDate = new Date(today.toISOString().slice(0, 10))
		const data = await getDailyData(startDate, startDate)
		res.json(data)
		console.log('data sent')
	})
}

app.get('/indexSel', async (req, res) =>{
	const colInv = await run('CRWebDB', 'InvInfo')
	const invNameTable = await colInv.find({}).project({_id:0, InvName:1}).toArray()

	res.json({InvName: invNameTable})
})

app.get('/dailySel', async (req, res) =>{

	const colCar = await run('CRWebDB', 'CarsInfo')
	const carPlateTable = await colCar.find({}).project({_id:0, CarPlate:1}).toArray()

	const colRent = await run('CRWebDB', 'RentInfo')
	const renterNameTable = await colRent.find({}).project({_id:0, RenterName:1}).toArray()

	const colExpenses = await run('CRWebDB','ExpensesInfo')
	const expNameTable = await colExpenses.find({}).project({_id:0, ExpenseName:1}).toArray()

	res.json({
		CarPlate: carPlateTable, 
		RenterName: renterNameTable,
		ExpenseName: expNameTable
	})
})

app.get('/reports',async (req, res) => {
	// const data = await getCarData()
	let VATDB = 15
	let paidPrice = 1000
	let finalWithout
	let finalVAT
	
	if(VATDB==0){
		finalWithout = paidPrice
		finalVAT = 0
	}
	else{
		let VAT = 1+ VATDB/100
		let withoutVAT = paidPrice/VAT
		let paidPriceVAT = paidPrice - (paidPrice / VAT)

		let withoutVATFloor = Math.floor((withoutVAT + Number.EPSILON) * 100) / 100
		let paidPriceVATCeil = Math.ceil((paidPriceVAT + Number.EPSILON) * 100) / 100
		
		finalWithout = withoutVATFloor
		finalVAT = paidPriceVATCeil
	}
	
	

	console.log(finalWithout + "\n"+ finalVAT)
	res.render('reports')
  })

async function getCarData(){
  // Call run() method and set the collection to "CarsInfo"
  const colCar = await run('CRWebDB','CarsInfo')

  // find the desired doc and project without id
  const carsTable = await colCar.find({}).project({}).toArray();

  const colInv = await run('CRWebDB','InvInfo')
  const invTable = await colInv.find({}).project({}).toArray()
  

  const colRent = await run('CRWebDB','RentInfo')
  const rentTable = await colRent.find({}).project({}).toArray()

  const colOwner = await run('CRWebDB','OwnerInfo')
  const ownerTable = await colOwner.find({}).project({}).toArray()

  const colEmp = await run('CRWebDB','EmpInfo')
  const empTable = await colEmp.find({}).project({}).toArray()

  const colExpenses = await run('CRWebDB','ExpensesInfo')
  const expensesTable = await colExpenses.find({}).project({}).toArray()

  return({ CarsInfo: carsTable, 
    InvInfo: invTable,
    RentInfo: rentTable, 
    OwnerInfo: ownerTable,
    EmpInfo: empTable,
    ExpensesInfo: expensesTable
  });
  
}

app.post('/dailyFilter', async (req, res) => {
	let data = await getDailyData(new Date (req.body.startDate), new Date (req.body.endDate))
	res.json(data)
})

async function getDailyData(startDate, endDate){

  const colDailyRent = await run('CRWebDB','DailyRentInfo')
  const dailyRentTable = await colDailyRent.find({_id: {$gte: new ObjectId(startDate / 1000 - 10799), $lte: new ObjectId(endDate / 1000 + 75599) } }).project({}).toArray()

  const colDailyExp = await run('CRWebDB','DailyExpInfo')
  const dailyExpTable = await colDailyExp.find({_id: {$gte: new ObjectId(startDate / 1000), $lte: new ObjectId(endDate / 1000) }}).project({}).toArray()

  return({ 
    DailyExpInfo: dailyExpTable, 
    DailyRentInfo: dailyRentTable 
    });
  
}



 
app.listen(port);

app.post('/upload/:colName', upload.any(), async (req, res) => {
	let order = JSON.parse(req.body.order)
	console.log('Order: ' + order)

	let data = {}
	const body = req.body
	for (const file in req.files){
		
			const blockBlobClient = containerClient.getBlockBlobClient(req.files[file].fieldname + '_' + req.files[file].originalname);
			await blockBlobClient.upload(req.files[file].buffer, req.files[file].buffer.length);
			let fieldName = [req.files[file].fieldname]
			data[fieldName] = blockBlobClient.url
			
	}
	let combinedData = {}
	for (let i = 0; i < order.length; i++) {
		// get the current property name from the array
		let propertyName = order[i];
	  
		// check if the property exists in data or req.body
		if (data.hasOwnProperty(propertyName)) {
		  // assign the property and value from data to the new object
		  combinedData[propertyName] = data[propertyName];
		} else if (Object.prototype.hasOwnProperty.call(req.body, propertyName)) {
		  // assign the property and value from req.body to the new object
		  combinedData[propertyName] = req.body[propertyName];
		} else {
			// assign a default value to the new object
			combinedData[propertyName] = "";
		  }
	  }
	  console.log('Combined Data: ' + combinedData)
	const colName = req.params.colName;
	async function test() {
		try {
			
			// Use the collection in colName
			const col = await run('CRWebDB',colName)

			// Insert a single document, wait for promise so we can read it back
			
			await col.insertOne(combinedData)
			
				
			const last = await col.find().sort({_id: -1}).limit (1).toArray()
			console.log(last[0])
			res.send(last[0])
		
			} 
			catch (err) {
			 console.log(err.stack);
		 }
	}
	test()
})


app.post('/submit-form/:colName', (req, res) => {
	const colName = req.params.colName;
	async function test() {
		try {
			
			// Use the collection in colName
			const col = await run('CRWebDB',colName)

			// Insert a single document, wait for promise so we can read it back
			
			await col.insertOne(req.body)
				
			const last = await col.find().sort( {$natural:-1}).limit (1).toArray()
			console.log(last[0])
			res.send(last[0])
		
			} 
			catch (err) {
			 console.log(err.stack);
		 }
	}
	test()
  });


// app.get('/jsFormData/:colName', (req, res) => {
// 	const colName = req.params.colName;
// 	async function sendData() {
// 	  try {
// 		const colCar = await run('CRWebDB', colName);
//     	const dataToSend = JSON.stringify(change.fullDocument);
//     	const fetchOptions = {
//       		method: 'POST',
//       		headers: { 'Content-Type': 'application/json' },
//       		body: dataToSend
//     	};
//     	fetch('/jsFormData', fetchOptions);

		
// 	  } 
// 	  catch (err) {
// 		console.log(err.stack);
// 		res.status(500).json({ error: 'An error occurred' });
// 	  }
// 	}
// 	sendData();
//   });


app.post('/carFormSub', (req, res) => {
	async function test() {
		try {
			 // Use the collection "CarsInfo"
			 const col = await run('CRWebDB',"CarsInfo")

			 // Insert a single document, wait for promise so we can read it back
			 await col.insertOne(
				{'InvName': req.body.InvName,
				 'CarName': req.body.CarName,
				 'CarPlate': req.body.CarPlate, 
				 'CarDateOfPurchase': req.body.CarDateOfPurchase,
				 'CarPurchasePrice': req.body.CarPurchasePrice,
				 'CarRegExpDate': req.body.CarRegExpDate,
				 'CarCheckExpDate': req.body.CarCheckExpDate,
				 'CarInsurExpDate': req.body.CarInsurExpDate,
				 'CarTrackExpDate': req.body.CarTrackExpDate,
				 'CarExtraKeyStatus': req.body.CarExtraKeyStatus,
				})
				

		
			} 
			catch (err) {
			 console.log(err.stack);
		 }
	}
	

	
	test()
	
})

app.post('/invFormSub', (req, res) => {
	async function test() {
		try {
			 // Use the collection "InvInfo"
			 const col = await run('CRWebDB',"InvInfo")

			 // Insert a single document, wait for promise so we can read it back
			 await col.insertOne(
				{'InvName': req.body.InvName, 
				 'InvIDNumber': req.body.InvIDNumber, 
				 'InvIDPic': req.body.InvIDPic,
				 'InvInterestRate': req.body.InvInterestRate,
				 'InvPhoneNumber': req.body.InvPhoneNumber,
				 'InvContractPic': req.body.InvContractPic,
				})
			
			} 
			catch (err) {
			 console.log(err.stack);
		 }
	}
	test()
	
})

app.post('/rentFormSub', (req, res) => {
	async function test() {
		try {
			 // Use the collection "RentInfo"
			 const col = await run('CRWebDB',"RentInfo")

			 // Insert a single document, wait for promise so we can read it back
			 await col.insertOne(
				{'RenterName': req.body.RenterName, 
				 'RentIDNumber': req.body.RentIDNumber,
				 'RentIDPic': req.body.RentIDPic,
				 'RentContactNumber': req.body.RentContactNumber,
				 'RentAbsherNumber': req.body.RentAbsherNumber,
				 'DriverID': req.body.DriverID,
				 'DriverIDPic': req.body.DriverIDPic,
				 'RentContractPic': req.body.RentContractPic,
				 'RentAuthPic': req.body.RentAuthPic,   
				})
			
			} 
			catch (err) {
			 console.log(err.stack);
		 }
	}
	test()
	
})

app.post('/ownFormSub', (req, res) => {
	async function test() {
		try {
			 // Use the collection "OwnerInfo"
			 const col = await run('CRWebDB',"OwnerInfo")

			 // Insert a single document, wait for promise so we can read it back
			 await col.insertOne(
				{'OwnerName': req.body.OwnerName, 
				 'OwnerIDNumber': req.body.OwnerIDNumber,
				 'OwnerIDPic': req.body.OwnerIDPic,
				 'OwnerPercent': req.body.OwnerPercent,
				})
			
			} 
			catch (err) {
			 console.log(err.stack);
		 }
	}
	test()
	
})

app.post('/empFormSub', (req, res) => {
	async function test() {
		try {
			 // Use the collection "EmpInfo"
			 const col = await run('CRWebDB',"EmpInfo")

			 // Insert a single document, wait for promise so we can read it back
			 await col.insertOne(
				{'EmpName': req.body.EmpName, 
				 'EmpIDNumber': req.body.EmpIDNumber,
				 'EmpIDPic': req.body.EmpIDPic,
				 'EmpPercent': req.body.EmpPercent,
				 'EmpComRate': req.body.EmpComRate,
				 'EmpSaleCom': req.body.EmpSaleCom,
				 'EmpBuyCom': req.body.EmpBuyCom,
				 'EmpRentCom': req.body.EmpRentCom,
				 'EmpSalary': req.body.EmpSalary,   
				})
			
			} 
			catch (err) {
			 console.log(err.stack);
		 }
	}
	test()
	
})



app.post('/expFormSub', (req, res) => {
	async function test() {
		try {
			 // Use the collection "ExpensesInfo"
			 const col = await run('CRWebDB',"ExpensesInfo")                                                                                                                                                         
			 
			 // Insert a single document, wait for promise so we can read it back
			 await col.insertOne(
				{'ExpenseName': req.body.ExpenseName,
				 'ExpenseReqPrice': req.body.ExpenseReqPrice,
				 'ExpenseReqPic': req.body.ExpenseReqPic,
			 })
			
			} 
			catch (err) {
			 console.log(err.stack);
		 }
	}
	test()
	
})

app.post('/dailyExpFormSub', (req, res) => {
	async function test() {
		try {
			 // Use the collection "DailyExpInfo"
			 const col = await run('CRWebDB',"DailyExpInfo")

			 // Insert a single document, wait for promise so we can read it back
			 await col.insertOne(
				{'CarPlateNumber': req.body.CarPlateNumber, 
				 'ExpenseSource': req.body.ExpenseSource,
				 'ExpenseDate': req.body.ExpenseDate,
				 'PaymentMethod': req.body.PaymentMethod,
				 'ExpenseCost': req.body.ExpenseCost,  
				})
			
			} 
			catch (err) {
			 console.log(err.stack);
		 }
	}
	test()
	
})

app.post('/dailyRentFormSub', (req, res) => {
	async function test() {
		try {
			 // Use the collection "RentInfo"
			 const col = await run('CRWebDB',"DailyRentInfo")

			 // Insert a single document, wait for promise so we can read it back
			 await col.insertOne(
				{'CarPlateNumber': req.body.CarPlateNumber, 
				 'RenterName': req.body.RenterName,
				 'RentStartDate': req.body.RentStartDate,
				 'RentEndDate': req.body.RentEndDate,
				 'PaymentMethod': req.body.PaymentMethod,
				 'RentPrice': req.body.RentPrice,   
				})
			
			} 
			catch (err) {
			 console.log(err.stack);
		 }
	}
	test()
	
})
// app.post('/updateData', (req, res) => {
// 	const{_id, cellNewValue} = req.body
// 	console.log(cellNewValue+'---'+_id)
// 	async function update() {
// 		try {
// 			 // Use the collection "CarInfo"
// 			 const colCar = await run("CarInfo")

// 			 // Insert a single document, wait for promise so we can read it back
// 			 await colCar.updateOne(
// 				{   
// 				})
			
// 			} 
// 			catch (err) {
// 			 console.log(err.stack);
// 		 }
// 	}
	
	
// })

app.post('/updateImage', upload.single('file'), async (req, res)=>{
	let data
	try {
		
			const blockBlobClient = containerClient.getBlockBlobClient(req.body.fieldName + '_' + req.file.originalname);
			await blockBlobClient.upload(req.file.buffer, req.file.buffer.length);
			data= blockBlobClient.url
			console.log(req.file);
				
		

		// Use the collection "CarInfo"
		const colCar = await run('CRWebDB',req.body.colName)
		const fieldName = {[req.body.fieldName]: data}
		const id = new mongo.ObjectId(req.body._id)
		console.log(id)
			 
		// Insert a single document, wait for promise so we can read it back
		colCar.updateOne(
			{_id:id},
			{$set: fieldName},
			function(err, result){
				if(err) throw err
				console.log(result.modifiedCount + ' document(s) updated')
			}
		)
			
	} 
	catch (err) {
		console.log(err.stack);
	}
	res.json({url:data})
})
app.post('/updateData', (req, res) => {
	async function update() {
		try {
			// Use the collection "CarInfo"
			const colCar = await run('CRWebDB',req.body.colName)
			const fieldName = {[req.body.fieldName]: req.body.newValue}
			const id = new mongo.ObjectId(req.body._id)
			console.log(id)
				 
			// Insert a single document, wait for promise so we can read it back
			colCar.updateOne(
				{_id:id},
				{$set: fieldName},
				function(err, result){
					if(err) throw err
					console.log(result.modifiedCount + ' document(s) updated')
				}
			)
				
		} 
		catch (err) {
			console.log(err.stack);
		}
	}
	update()

	res.send(req.body.cellNewData);
});

app.post('/deleteRow', (req, res) => {
	async function update() {
		try {
			// Use the collection "CarInfo"
			const colCar = await run('CRWebDB',req.body.colName)
			const id = new mongo.ObjectId(req.body._id)
			console.log(id)
				 
			// Insert a single document, wait for promise so we can read it back
			colCar.deleteOne(
			{_id:id},
			function(err, result){
				if(err) throw err
				console.log(result.modifiedCount + ' document(s) updated')
			})
			
				
		} 
		catch (err) {
			console.log(err.stack);
		}
	}
	update()

	res.send(req.body.cellNewData);
});






/*const client = new pg.Client({
		user: 'testdb_nwdx_user',
		host: 'dpg-cggugqgrjent5o4ndga0-a',
		database: 'testdb_nwdx',
		password: 'gmj4Ruz61DXvKqczNudrvhWXbkkHcL6K',
		port: 5432,
	  })
	  client.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
	  });

app.post('/', (req, res) => {
	const {expensname} = req.body

	console.log(expensname)

	client.query(
		'INSERT INTO formdata (expensename) VALUES ($1)', [expensname], (err, result) => {
			if (err){
				console.log(err)
				res.status(500).send('Eror storing data')
			} else{
				res.status(200).send('Data stored successfully')
			}

		}
	)
})*/	  





// http.createServer( function(req, res) {

	

// 	var filename = req.url || "index.html";
// 	var ext = path.extname(filename);
// 	var localPath = __dirname;
// 	var validExtensions = {
// 		".html" : "text/html",
// 		".js": "application/javascript",
// 		".css": "text/css",
// 		".txt": "text/plain",
// 		".jpg": "image/jpeg",
// 		".gif": "image/gif",
// 		".png": "image/png",
// 		".woff": "application/font-woff",
// 		".woff2": "application/font-woff2"
// 	};

// 	var validMimeType = true;
// 	var mimeType = validExtensions[ext];
// 	if (checkMimeType) {
// 		validMimeType = validExtensions[ext] != undefined;
// 	}

// 	if (validMimeType) {
// 		localPath += filename;
//         console.log("Serving file: " + localPath);
//         getFile(localPath, res, mimeType);
// 	} else {

// 		if (filename == '/'){
// 			fs.readFile("./index.html", function(err, contents){
// 				if(!err) {
// 					res.setHeader("Content-Length", contents.length);
// 					if (mimeType != undefined) {
// 						res.setHeader("Content-Type", mimeType);
// 					}
// 					res.statusCode = 200;
// 					res.end(contents);
// 				} else {
// 					res.writeHead(500);
// 					res.end();
// 				}
// 			})
// 		}
// 		console.log("Invalid file extension detected: " + ext + " (" + filename + ")")
// 	}

// }).listen(port)

// // app.listen(port, () => {
	
// //   });

// function getFile(localPath, res, mimeType) {
// 	fs.readFile(localPath, function(err, contents) {
// 		if(!err) {
// 			res.setHeader("Content-Length", contents.length);
// 			if (mimeType != undefined) {
// 				res.setHeader("Content-Type", mimeType);
// 			}
// 			res.statusCode = 200;
// 			res.end(contents);
// 		} else {
// 			res.writeHead(500);
// 			res.end();
// 		}
// 	});
// }

