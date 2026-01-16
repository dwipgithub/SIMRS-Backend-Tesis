import { DataTypes } from "sequelize"
import { database } from "../config/Database.js"
import { Pegawai } from "./Pegawai.js"

export const pengguna = database.define('pengguna', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
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

pengguna.belongsTo(Pegawai, {
    foreignKey: 'pegawai_id',
    as: 'dataPegawai',
    onDelete: 'SET NULL'
});