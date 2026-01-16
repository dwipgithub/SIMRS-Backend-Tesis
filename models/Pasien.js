import { QueryTypes } from 'sequelize'
import { database } from '../config/Database.js'

export const get = (req, callback) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) > 100 ? 100 : parseInt(req.query.limit) || 100
    const offset = (page - 1) * limit;

    const sqlSelect = 'SELECT ' +
        'medical.pasien.id, ' +
        'medical.pasien.nik, ' +
        'medical.pasien.nama, ' +
        'jenis_kelamin, ' +
        'medical.pasien.tanggal_lahir, ' +
        'medical.pasien.alamat '

    const sqlFrom = 'FROM ' +
        'medical.pasien '
    
    const sqlOrder = ' ORDER BY medical.pasien.nama '

    const sqlLimit = 'LIMIT ? '
    
    const sqlOffSet = 'OFFSET ?'

    const filters = []
    const replacements = []

    const { nik, nama } = req.query;

    if (nik) {
        filters.push("medical.pasien.nik = ?");
        replacements.push(nik);
    }

    if (nama) {
        filters.push("medical.pasien.nama LIKE ?");
        replacements.push(`%${nama}%`);
    }

    const sqlWhere = filters.length > 0 ? " WHERE " + filters.join(" AND ") : "";
    const replacementsWithLimit = [...replacements, limit, offset];

    const sql = sqlSelect + sqlFrom + sqlWhere + sqlOrder + sqlLimit + sqlOffSet;

    database.query(sql, {
        type: QueryTypes.SELECT,
        replacements: replacementsWithLimit
    }).then((res) => {
        const sqlSelectCount = 'SELECT count(medical.pasien.id) as total_row_count From medical.pasien '
        const sqlCount = sqlSelectCount.concat(sqlWhere)
        database.query(sqlCount, {
            type: QueryTypes.SELECT,
            replacements: replacements
        })
        .then(
            (resCount) => {
                const data = {
                    totalRowCount: resCount[0].total_row_count,
                    page: page,
                    limit: limit,
                    data: res
                }
                callback(null, data)
            },(error) => {
                throw error
            }
        )
        .catch((error) => {
            throw error
        })
    })
    .catch((error) => {
        callback(error, null)
    })
}

export const show = (id, callback) => {
    const sqlSelect = 'SELECT ' +
        'medical.pasien.id, ' +
        'medical.pasien.nik, ' +
        'medical.pasien.nama, ' +
        'jenis_kelamin, ' +
        'medical.pasien.tanggal_lahir, ' +
        'medical.pasien.alamat '

    const sqlFrom = 'FROM ' +
        'medical.pasien '
    
    const sqlWhere = 'WHERE ' +
        'medical.pasien.id = ? ' +
        'LIMIT 1 '

    const sql = sqlSelect + sqlFrom + sqlWhere
    
    database.query(sql, {
        type: QueryTypes.SELECT,
        replacements: [id]
    })
    .then((result) => {
        if (result.length === 0) {
            callback(null, null) // tidak ditemukan
        } else {
            callback(null, result[0]) // kembalikan satu data pasien
        }
    })
    .catch((error) => {
        callback(error, null)
    })
}