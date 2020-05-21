require('dotenv').config() // It must be the first line of code

const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const mongoose = require('mongoose')

var swaggerUi = require('swagger-ui-express')
var swaggerDocument = require('./swagger.json')
const sessionMiddleware = require('./api/middleware/session')
const User = require('./api/models/User')
const bcrypt = require('bcrypt');
var fs = require('fs');

let path = 'public'

if (!fs.existsSync(path)) {
	fs.mkdirSync(path);
}

const apiRouter = require('./api')

const app = express()

// Read values from environment variables
const PORT = process.env.APP_PORT
const MONGO_DB_HOST = process.env.MONGO_DB_HOST
const MONGO_DB_PORT = process.env.MONGO_DB_PORT
const MONGO_DB_DATABASE_NAME = process.env.MONGO_DB_DATABASE_NAME

mongoose.Promise = global.Promise

//mongo connection
mongoose
	.connect(
		`mongodb://${MONGO_DB_HOST}:${MONGO_DB_PORT}/${MONGO_DB_DATABASE_NAME}`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
			useCreateIndex: true,
		}
	)
	.then(async (mongoose) => {
		console.log('connected to mongo')
		const adminUser = await User.findOne({ role: 'ADM' }).select('+password')
		if (!adminUser) {
			console.log('creating admin user')
			const encryptedPass = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
			const adminUser = await new User({
				name: process.env.ADMIN_USERNAME,
				password: encryptedPass,
				email: process.env.ADMIN_EMAIL,
				idCard: process.env.ADMIN_IDCARD,
				role: 'ADM'
			})
				.save()
				.catch(console.error)

			if (adminUser) {
				console.log('Admin created')
				console.table([adminUser.toJSON()])
			}
		} else {
			console.log('Admin:')
			console.table([adminUser.toJSON()])
		}
	})
	.catch(console.error)


//api setup
app
	.use(express.json())
	.use(express.urlencoded({ extended: false }))

	// Setup cookie parser
	.use(cookieParser())

	// Setup session middleware
	.use(sessionMiddleware)

	//dispose public folder
	.use(express.static('public'))

	//swagger doc setup
	.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
	.use('/api', cors(), apiRouter)

	.listen(PORT, () => {
		console.log(`API started on http://localhost:${PORT}/api`)
		console.log(`API started on http://localhost:${PORT}/api-docs`)
	})