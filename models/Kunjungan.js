import { DataTypes, QueryTypes } from "sequelize"
import { database } from "../config/Database.js"

export const kunjungan = database.define('kunjungan', {
    pasien_id: {
        type: DataTypes.INTEGER
    },
    poliklinik_id: {
        type: DataTypes.INTEGER
    },
    dokter_id: {
        type: DataTypes.INTEGER
    },
    petugas_pendaftaran_id: {
        type: DataTypes.INTEGER
    }
}, {
    freezeTableName: true
})

export const get = (req, callback) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) > 100 ? 100 : parseInt(req.query.limit) || 100
    const offset = (page - 1) * limit;

    const sqlSelect = 'SELECT ' +
        'medical.kunjungan.id, ' +
        'medical.pasien.id AS pasien_id, ' +
        'medical.pasien.nama AS pasien_nama, ' +  
        'medical.pasien.nik AS pasien_nik, ' + 
        'CASE ' + 
            'WHEN medical.pasien.jenis_kelamin = 1 THEN "Laki-Laki" ' +  
            'WHEN medical.pasien.jenis_kelamin = 2 THEN "Perempuan" ' + 
        'END AS pasien_jenis_kelamin, ' + 
        'DATE(CONVERT_TZ(medical.pasien.tanggal_lahir, "+00:00", "+07:00")) AS pasien_tanggal_lahir, ' + 
        'medical.kunjungan.poliklinik_id, ' +
        'medical.poliklinik.nama AS poliklinik_nama, ' + 
        'medical.kunjungan.dokter_id, ' +
        'dokter.nama AS dokter_nama, ' + 
        'medical.kunjungan.petugas_pendaftaran_id, ' +
        'petugas_pendaftaran.nama AS petugas_pendaftaran_nama, ' +
        'medical.kunjungan.tanggal AS kunjungan_tanggal '

    const sqlFrom = 'FROM ' +
        'medical.kunjungan ' +
        'INNER JOIN medical.pasien ON medical.pasien.id = medical.kunjungan.pasien_id ' +
        'INNER JOIN medical.poliklinik ON medical.poliklinik.id = medical.kunjungan.poliklinik_id ' +
        'INNER JOIN medical.pegawai AS dokter ON dokter.id = medical.kunjungan.dokter_id ' +
        'INNER JOIN medical.pegawai AS petugas_pendaftaran ON petugas_pendaftaran.id = medical.kunjungan.petugas_pendaftaran_id '
    
    const sqlOrder = ' ORDER BY medical.pasien.nama '

    const sqlLimit = 'LIMIT ? '
    
    const sqlOffSet = 'OFFSET ?'

    const filters = []
    const replacements = []

    const { 
        tanggal,
        pasienNik, 
        pasienNama,
        pasienId, 
        poliklinikId, 
        dokterId, 
        petugasPendaftaranId
    } = req.query

    if (pasienNik) {
        filters.push("medical.pasien.nik = ?")
        replacements.push(pasienNik)
    }

    if (pasienNama) {
        filters.push("medical.pasien.nama LIKE ?")
        replacements.push(`%${pasienNama}%`)
    }

    if (tanggal) {
        filters.push("DATE(medical.kunjungan.tanggal) = ?")
        replacements.push(tanggal)
    }

    if (pasienId) {
        filters.push("medical.kunjungan.pasien_id = ?")
        replacements.push(pasienId)
    }

    if (poliklinikId) {
        filters.push("medical.kunjungan.poliklinik_id = ?")
        replacements.push(poliklinikId)
    }

    if (dokterId) {
        filters.push("medical.kunjungan.dokter_id = ?")
        replacements.push(dokterId)
    }

    if (petugasPendaftaranId) {
        filters.push("medical.kunjungan.petugas_pendaftaran_id = ?")
        replacements.push(petugasPendaftaranId)
    }

    const sqlWhere = filters.length > 0 ? " WHERE " + filters.join(" AND ") : "";
    const replacementsWithLimit = [...replacements, limit, offset];

    const sql = sqlSelect + sqlFrom + sqlWhere + sqlOrder + sqlLimit + sqlOffSet;

    database.query(sql, {
        type: QueryTypes.SELECT,
        replacements: replacementsWithLimit
    }).then((res) => {

        const formattedData = res.map(item => ({
            id: item.id,
            tanggal: item.kunjungan_tanggal,
            pasien: {
                id: item.pasien_id,
                nik: item.pasien_nik,
                nama: item.pasien_nama,
                tanggalLahir: item.pasien_tanggal_lahir,
                jenisKelamin: item.pasien_jenis_kelamin
            },
            poliklinik: {
                id: item.poliklinik_id,
                nama: item.poliklinik_nama
            },
            dokter: {
                id: item.dokter_id,
                nama: item.dokter_nama
            },
            petugasPendaftaran: {
                id: item.petugas_pendaftaran_id,
                nama: item.petugas_pendaftaran_nama
            }
        }))

        const sqlSelectCount = 'SELECT ' +
                'count(medical.kunjungan.id) as total_row_count ' +
            'FROM ' +
                'medical.kunjungan ' +
                'INNER JOIN medical.pasien ON medical.pasien.id = medical.kunjungan.pasien_id ' +
                'INNER JOIN medical.poliklinik ON medical.poliklinik.id = medical.kunjungan.poliklinik_id ' +
                'INNER JOIN medical.pegawai AS dokter ON dokter.id = medical.kunjungan.dokter_id ' +
                'INNER JOIN medical.pegawai AS petugas_pendaftaran ON petugas_pendaftaran.id = medical.kunjungan.petugas_pendaftaran_id '

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
                    data: formattedData
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
        'medical.kunjungan.id, ' +
        'medical.pasien.id AS pasien_id, ' +
        'medical.pasien.nama AS pasien_nama, ' +  
        'medical.pasien.nik AS pasien_nik, ' + 
        'CASE ' + 
            'WHEN medical.pasien.jenis_kelamin = 1 THEN "Laki-Laki" ' +  
            'WHEN medical.pasien.jenis_kelamin = 2 THEN "Perempuan" ' + 
        'END AS pasien_jenis_kelamin, ' + 
        'DATE(CONVERT_TZ(medical.pasien.tanggal_lahir, "+00:00", "+07:00")) AS pasien_tanggal_lahir, ' + 
        'medical.kunjungan.poliklinik_id, ' +
        'medical.poliklinik.nama AS poliklinik_nama, ' + 
        'medical.kunjungan.dokter_id, ' +
        'dokter.nama AS dokter_nama, ' + 
        'medical.kunjungan.petugas_pendaftaran_id, ' +
        'petugas_pendaftaran.nama AS petugas_pendaftaran_nama, ' +
        'medical.kunjungan.tanggal AS kunjungan_tanggal '

    const sqlFrom = 'FROM ' +
        'medical.kunjungan ' +
        'INNER JOIN medical.pasien ON medical.pasien.id = medical.kunjungan.pasien_id ' +
        'INNER JOIN medical.poliklinik ON medical.poliklinik.id = medical.kunjungan.poliklinik_id ' +
        'INNER JOIN medical.pegawai AS dokter ON dokter.id = medical.kunjungan.dokter_id ' +
        'INNER JOIN medical.pegawai AS petugas_pendaftaran ON petugas_pendaftaran.id = medical.kunjungan.petugas_pendaftaran_id '

    const sqlWhere = 'WHERE ' +
        'medical.kunjungan.id = ? ' +
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
            const row = result[0]
            const formattedData = {
                id: row.id,
                tanggal: row.kunjungan_tanggal,
                pasien: {
                    id: row.pasien_id,
                    nama: row.pasien_nama,
                    nik: row.pasien_nik,
                    jenis_kelamin: row.pasien_jenis_kelamin,
                    tanggalLahir: row.pasien_tanggal_lahir
                },
                poliklinik: {
                    id: row.poliklinik_id,
                    nama: row.poliklinik_nama
                },
                dokter: {
                    id: row.dokter_id,
                    nama: row.dokter_nama
                },
                petugas_pendaftaran: {
                    id: row.petugas_pendaftaran_id,
                    nama: row.petugas_pendaftaran_nama
                }
            }
            
            callback(null, formattedData) // kembalikan satu data pasien
        }
    })
    .catch((error) => {
        callback(error, null)
    })
}