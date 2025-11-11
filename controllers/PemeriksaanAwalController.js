import { pemeriksaanawal, get, show } from "../models/PemeriksaanAwal.js"
import paginationDB from '../config/PaginationDB.js'

export const insertPemeriksaanAwal =  async (req, res) => {
    try {
        const pemeriksaanAwalBaru =  await pemeriksaanawal.create({
            kunjungan_id: req.body.kunjunganId,
            tekanan_darah_sistolik: req.body.tekananDarahSistolik,
            tekanan_darah_diastolik: req.body.tekananDarahDiastolik,
            denyut_nadi: req.body.denyutNadi,
            suhu_tubuh: req.body.suhuTubuh,
            tinggi_badan: req.body.tinggiBadan,
            berat_badan: req.body.beratBadan,
            pemeriksa_id: req.user.pegawaiId
        })

        res.status(201).send({
            error: false,
            message: "data created",
            data: pemeriksaanAwalBaru
        })
    } catch (error) {
        console.log("Gagal menyimpan kunjungan:", error);
        res.status(500).json({
            error: true,
            message: error.message
        })
    }
}

export const getPemeriksaanAwal = (req, res) => {
    get(req, (err, results) => {
        if (err) {
            res.status(422).send({
                status: false,
                message: err
            })
            return
        }

        const paginationDBObject = new paginationDB(results.totalRowCount, results.page, results.limit, results.data)
        const remarkPagination = paginationDBObject.getRemarkPagination()
        const message = results.data.length ? 'data found' : 'data not found'

        res.status(200).send({
            status: true,
            message: message,
            pagination: remarkPagination,
            data: results.data
        })
    })
}

export const showPemeriksaanAwal = (req, res) => {
    show(req.params.id, (err, result) => {
        if (err) {
            res.status(422).send({
                status: false,
                message: err
            })
            return
        }

        const message = result ? 'data found' : 'data not found'

        res.status(200).send({
            status: true,
            message: message,
            data: result
        })
    })
}