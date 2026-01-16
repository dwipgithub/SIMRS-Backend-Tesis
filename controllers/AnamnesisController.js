import { anamnesis, get, show } from '../models/Anamnesis.js'
import paginationDB from '../config/PaginationDB.js'

export const insertAnamnesis =  async (req, res) => {
    try {
        const anamnesisBaru =  await anamnesis.create({
            kunjungan_id: req.body.kunjunganId,
            riwayat_hipertensi: req.body.riwayatHipertensi,
            riwayat_diabetes: req.body.riwayatDiabetes,
            riwayat_merokok: req.body.riwayatMerokok,
            riwayat_jantung_keluarga: req.body.riwayatJantungKeluarga,
            dokter_id: req.user.pegawaiId
        })

        res.status(201).send({
            error: false,
            message: "data created",
            data:  anamnesisBaru
        })
    } catch (error) {
        console.log("Gagal menyimpan anamnesis:", error);
        res.status(500).json({
            error: true,
            message: error.message
        })
    }
}

export const getAnamnesis = (req, res) => {
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

export const showAnamnesis = (req, res) => {
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