import { DataTypes } from "sequelize"
import { database } from "../config/Database.js"

export const pengguna = database.define('pengguna', {
    email: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
    pegawai_id: {
        type: DataTypes.STRING
    },
    refresh_token: {
        type: DataTypes.TEXT
    }
}, {
    freezeTableName: true
})