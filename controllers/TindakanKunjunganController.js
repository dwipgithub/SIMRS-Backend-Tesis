import { tindakanKunjungan, get, show } from '../models/TindakanKunjungan.js'
import paginationDB from '../config/PaginationDB.js'

export const insertTindakanKunjungan =  async (req, res) => {
    try {
        const tindakanKunjunganBaru =  await tindakanKunjungan.create({
            kunjungan_id: req.body.kunjunganId,
            tindakan_id: req.body.tindakanId,
            tarif: req.body.tarif,
            dokter_id: req.user.pegawaiId
        })

        res.status(201).send({
            error: false,
            message: "data created",
            data:  tindakanKunjunganBaru
        })
    } catch (error) {
        console.log("Gagal menyimpan tindakan kunjungan:", error);
        res.status(500).json({
            error: true,
            message: error.message
        })
    }
}

export const getTindakanKunjungan = (req, res) => {
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

export const showTindakanKunjungan = (req, res) => {
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