import { database } from '../config/Database.js'
import { orderLab, orderLabDetail, get, show  } from '../models/OrderLab.js'
import paginationDB from '../config/PaginationDB.js'

export const insertOrderLab =  async (req, res) => {
    let transaction;

    try {
        transaction = await database.transaction()
        const orderLabBaru = await orderLab.create({
            kunjungan_id: req.body.kunjunganId,
            dokter_id: req.user.pegawaiId
        }, { transaction })

        const dataDetail = req.body.data.map((value) => {
            return {
                order_lab_id: orderLabBaru.id,
                pemeriksaan_lab_id: value.pemeriksaanLabId
            }
        })

        const orderLabBaruDetail = await orderLabDetail.bulkCreate(dataDetail, { 
            transaction
        })
        
        await transaction.commit()

        res.status(201).send({
            error: false,
            message: "data created",
            data:  {
                orderLabBaru,
                orderLabBaruDetail
            }
        })
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.log("Gagal menyimpan order lab:", error);
        res.status(500).json({
            error: true,
            message: error.message
        })
    }
}

export const getOrderLab = (req, res) => {
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

export const showOrderLab = (req, res) => {
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