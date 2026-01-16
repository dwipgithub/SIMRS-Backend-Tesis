import { get, show } from '../models/Pasien.js'
import paginationDB from '../config/PaginationDB.js'
import Joi from 'joi'

export const getPasien = (req, res) => {
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

export const showPasien = (req, res) => {
    show(req.params.id, (err, result) => {
        if (err) {
            res.status(422).send({
                status: false,
                message: err
            })
            return
        }

        if (!result) {
            return res.status(404).send({
                status: false,
                message: "Data tidak ditemukan",
                data: result
            });
        }

        res.status(200).send({
            status: true,
            message: "Data ditemukan",
            data: result
        });
    })
}

