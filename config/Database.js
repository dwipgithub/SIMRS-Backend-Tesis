import { Sequelize } from "sequelize"

export const database = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: "mysql",
    define: {
        freezeTableName: true,
        timestamps: false
    },
    dialectOptions: {
        // useUTC: false
	connectTimeout: 60000
    },
    timezone: '+07:00', //for writing to database
    logging: console.log,
    pool: {
        max: 100,
        min: 0,
        acquire: 60000,
        idle: 10000
    }
})
