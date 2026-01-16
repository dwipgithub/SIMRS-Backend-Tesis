import { DataTypes, QueryTypes } from 'sequelize'
import { database } from '../config/Database.js'

export const Pegawai = database.define('pegawai', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true // Jika id dibuat otomatis
    },
    nik: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nama: {
        type: DataTypes.STRING,
        allowNull: false
    },
    profesi_id: {
        type: DataTypes.INTEGER // Asumsikan ini FK ke tabel Profesi
    },
    no_sip: {
        type: DataTypes.STRING
    },
    status_aktif: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    freezeTableName: true
});

export const get = (req, callback) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) > 100 ? 100 : parseInt(req.query.limit) || 100
    const offset = (page - 1) * limit;

    const sqlSelect = 'SELECT ' +
        'medical.pegawai.id, ' +
        'medical.pegawai.nik, ' +
        'medical.pegawai.nama, ' +
        'medical.pegawai.profesi_id, ' +
        'medical.pegawai.no_sip '

    const sqlFrom = 'FROM ' +
        'medical.pegawai '
    
    const sqlOrder = ' ORDER BY medical.pegawai.nama '

    const sqlLimit = 'LIMIT ? '
    
    const sqlOffSet = 'OFFSET ?'

    const filters = []
    const replacements = []

    const { nik, nama, profesiId } = req.query;

    if (nik) {
        filters.push("medical.pegawai.nik = ?");
        replacements.push(nik);
    }

    if (nama) {
        filters.push("medical.pegawai.nama LIKE ?");
        replacements.push(`%${nama}%`);
    }

    if (profesiId) {
        filters.push("medical.pegawai.profesi_id = ?");
        replacements.push(profesiId);
    }

    const sqlWhere = filters.length > 0 ? " WHERE " + filters.join(" AND ") : "";
    const replacementsWithLimit = [...replacements, limit, offset];

    const sql = sqlSelect + sqlFrom + sqlWhere + sqlOrder + sqlLimit + sqlOffSet;

    database.query(sql, {
        type: QueryTypes.SELECT,
        replacements: replacementsWithLimit
    }).then((res) => {
        const sqlSelectCount = 'SELECT count(medical.pegawai.id) as total_row_count From medical.pegawai '
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
        'medical.pegawai.id, ' +
        'medical.pegawai.nik, ' +
        'medical.pegawai.nama, ' +
        'medical.pegawai.profesi_id, ' +
        'medical.pegawai.no_sip '

    const sqlFrom = 'FROM ' +
        'medical.pegawai '
    
    const sqlWhere = 'WHERE ' +
        'medical.pegawai.id = ? ' +
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