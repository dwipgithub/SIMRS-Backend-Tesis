import { pengguna } from "../models/PenggunaModel.js";
import { Pegawai } from '../models/Pegawai.js'
import jsonWebToken from 'jsonwebtoken'

export const refreshToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken
    console.log(refreshToken)
    if(!refreshToken) {
        res.status(403).json({
            status: false,
            message: 'Unauthorized'
        })
        return
    }
    pengguna.findAll({
        attributes: ['id','email', 'pegawai_id'],
        where: {
            refresh_token: refreshToken
        },
            include: [{
            model: Pegawai,
            as: 'dataPegawai',
            attributes: ['nik', 'nama', 'profesi_id']
        }]
    })
    .then((results) => {
        if(!results[0]) {
            res.status(403).json({
                status: false,
                message: 'Unauthorized'
            })
            return
        }
        
        const payloadObject = {
            id: results[0].id,
            email: results[0].email,
            pegawaiId: results[0].pegawai_id,
            pegawaiNama: results[0].dataPegawai.nama
        }
        
        // console.log(payloadObject)

        jsonWebToken.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, jwtRes) => {
            if (err) return res.sendStatus(403)
            const accessToken = jsonWebToken.sign(payloadObject, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRESIN})
            
            res.status(201).send({
                status: true,
                message: "access token created",
                data: {
                    name: results[0].nama,
                    access_token: accessToken
                }
            })
        })
    })
    .catch((err) => {
        res.status(404).send({
            status: false,
            message: err
        })
        return
    })
}