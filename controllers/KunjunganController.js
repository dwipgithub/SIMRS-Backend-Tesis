import { kunjungan, get, show } from "../models/Kunjungan.js"
import paginationDB from '../config/PaginationDB.js'

export const inserKunjungan =  async (req, res) => {
    try {
        const kunjunganBaru =  await kunjungan.create({
            pasien_id: req.body.pasienId,
            poliklinik_id: req.body.poliklinikId,
            dokter_id: req.body.dokterId,
            petugas_pendaftaran_id: req.user.pegawaiId
        })

        res.status(201).send({
            error: false,
            message: "data created",
            data: kunjunganBaru
        })
    } catch (error) {
        console.log("Gagal menyimpan kunjungan:", error);
        res.status(500).json({
            error: true,
            message: error.message
        })
    }
}

export const getKunjungan = (req, res) => {
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

export const showKunjungan = (req, res) => {
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