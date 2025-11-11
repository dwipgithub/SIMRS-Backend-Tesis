import { database } from '../config/Database.js'
import { hasilLab, hasilLabDetail, get, show  } from '../models/HasilLab.js'
import paginationDB from '../config/PaginationDB.js'

export const insertHasilLab =  async (req, res) => {
    let transaction;

    try {
        transaction = await database.transaction()
        const hasilLabBaru = await hasilLab.create({
            order_lab_id: req.body.orderLabId,
            petugas_lab_id: req.user.pegawaiId
        }, { transaction })

        const dataDetail = req.body.data.map((value) => {
            return {
                hasil_lab_id: hasilLabBaru.id,
                order_lab_detail_id: value.orderLabDetailId,
                nilai: value.nilai
            }
        })

        const hasilLabBaruDetail = await hasilLabDetail.bulkCreate(dataDetail, { 
            transaction
        })
        
        await transaction.commit()

        res.status(201).send({
            error: false,
            message: "data created",
            data:  {
                hasilLabBaru,
                hasilLabBaruDetail
            }
        })
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.log("Gagal menyimpan hasil lab:", error);
        res.status(500).json({
            error: true,
            message: error.message
        })
    }
}

export const getHasilLab = (req, res) => {
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

export const showHasilLab = (req, res) => {
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