import { DataTypes, QueryTypes } from "sequelize"
import { database } from "../config/Database.js"

export const tindakanKunjungan = database.define('tindakan_kunjungan', {
    kunjungan_id: {
        type: DataTypes.INTEGER
    },
    tindakan_id: {
        type: DataTypes.INTEGER
    },
    tarif: {
        type: DataTypes.DOUBLE
    },
    dokter_id: {
        type: DataTypes.INTEGER
    },
}, {
    freezeTableName: true
})

export const get = (req, callback) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) > 100 ? 100 : parseInt(req.query.limit) || 100
    const offset = (page - 1) * limit;

    const sqlSelect = 'SELECT ' +
        'medical.tindakan_kunjungan.id AS id, ' +
        'medical.tindakan_kunjungan.tanggal, ' +
        'medical.tindakan.id AS tindakan_id, ' +
        'medical.tindakan.nama AS tindakan_nama, ' +
        'tindakan_dokter.id as tindakan_dokter_id, ' +
        'tindakan_dokter.nama as tindakan_dokter_nama, ' +
        'medical.kunjungan.id AS kunjungan_id, ' +
        'medical.kunjungan.tanggal AS kunjungan_tanggal, ' +
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
        'petugas_pendaftaran.nama AS petugas_pendaftaran_nama '
        
    const sqlFrom = 'FROM ' +
        'medical.tindakan_kunjungan ' +
        'INNER JOIN medical.tindakan ON medical.tindakan.id = medical.tindakan_kunjungan.tindakan_id ' +
        'INNER JOIN medical.kunjungan ON medical.kunjungan.id = medical.tindakan_kunjungan.kunjungan_id ' +
        'INNER JOIN medical.pasien ON medical.pasien.id = medical.kunjungan.pasien_id ' +
        'INNER JOIN medical.poliklinik ON medical.poliklinik.id = medical.kunjungan.poliklinik_id ' +
        'INNER JOIN medical.pegawai AS tindakan_dokter ON tindakan_dokter.id = medical.tindakan_kunjungan.dokter_id ' +
        'INNER JOIN medical.pegawai AS dokter ON dokter.id = medical.kunjungan.dokter_id ' +
        'INNER JOIN medical.pegawai AS petugas_pendaftaran ON petugas_pendaftaran.id = medical.kunjungan.petugas_pendaftaran_id '
    
    const sqlOrder = ' ORDER BY medical.pasien.nama '

    const sqlLimit = 'LIMIT ? '
    
    const sqlOffSet = 'OFFSET ?'

    const filters = []
    const replacements = []

    const {
        dokterId, 
        tanggal,
        kunjunganId,
        kunjunganTanggal,
        kunjunganPasienNik, 
        kunjunganPasienNama,
        kunjunganPasienId, 
        kunjunganPoliklinikId, 
        kunjunganDokterId, 
        kunjunganPetugasPendaftaranId
    } = req.query

    if (dokterId) {
        filters.push("medical.tindakan_kunjungan.dokter_id = ?")
        replacements.push(dokterId)
    }

    if (tanggal) {
        filters.push("DATE(medical.tindakan_kunjungan.tanggal) = ?")
        replacements.push(tanggal)
    }

    if (kunjunganId) {
        filters.push("medical.kunjungan.id = ?")
        replacements.push(kunjunganId)
    }

    if (kunjunganTanggal) {
        filters.push("DATE(medical.kunjungan.tanggal) = ?")
        replacements.push(kunjunganTanggal)
    }

    if (kunjunganPasienNik) {
        filters.push("medical.pasien.nik = ?")
        replacements.push(kunjunganPasienNik)
    }

    if (kunjunganPasienNama) {
        filters.push("medical.pasien.nama LIKE ?")
        replacements.push(`%${kunjunganPasienNama}%`)
    }

    if (kunjunganPasienId) {
        filters.push("medical.kunjungan.pasien_id = ?")
        replacements.push(kunjunganPasienId)
    }

    if (kunjunganPoliklinikId) {
        filters.push("medical.kunjungan.poliklinik_id = ?")
        replacements.push(kunjunganPoliklinikId)
    }

    if (kunjunganDokterId) {
        filters.push("medical.kunjungan.dokter_id = ?")
        replacements.push(kunjunganDokterId)
    }

    if (kunjunganPetugasPendaftaranId) {
        filters.push("medical.kunjungan.petugas_pendaftaran_id = ?")
        replacements.push(kunjunganPetugasPendaftaranId)
    }

    const sqlWhere = filters.length > 0 ? " WHERE " + filters.join(" AND ") : "";
    const replacementsWithLimit = [...replacements, limit, offset];

    const sql = sqlSelect + sqlFrom + sqlWhere + sqlOrder + sqlLimit + sqlOffSet;

    database.query(sql, {
        type: QueryTypes.SELECT,
        replacements: replacementsWithLimit
    }).then((res) => {
        const sqlSelectCount = 'SELECT ' +
                'count(medical.tindakan_kunjungan.id) as total_row_count '
        const sqlCount = sqlSelectCount.concat(sqlFrom).concat(sqlWhere)
        database.query(sqlCount, {
            type: QueryTypes.SELECT,
            replacements: replacements
        })
        .then(
            (resCount) => {
            
                const formattedData = res.map(item => ({
                    id: item.id,
                    tanggal: item.tanggal,
                    tindakan: {
                        id: item.tindakan_id,
                        nama: item.tindakan_nama
                    },
                    dokter: {
                        id: item.tindakan_dokter_id,
                        nama: item.tindakan_dokter_nama
                    },
                    kunjungan: {
                        id: item.kunjungan_id,
                        tanggal: item.kunjungan_tanggal,
                        pasien: {
                            id: item.pasien_id,
                            nik: item.pasien_nik,
                            nama: item.pasien_nama,
                            tanggalLahir: item.pasien_tanggal_lahir
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
                    }
                }))

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
        'medical.tindakan_kunjungan.id AS id, ' +
        'medical.tindakan_kunjungan.tanggal, ' +
        'medical.tindakan.id AS tindakan_id, ' +
        'medical.tindakan.nama AS tindakan_nama, ' +
        'tindakan_dokter.id as tindakan_dokter_id, ' +
        'tindakan_dokter.nama as tindakan_dokter_nama, ' +
        'medical.kunjungan.id AS kunjungan_id, ' +
        'medical.kunjungan.tanggal AS kunjungan_tanggal, ' +
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
        'petugas_pendaftaran.nama AS petugas_pendaftaran_nama '
        
    const sqlFrom = 'FROM ' +
        'medical.tindakan_kunjungan ' +
        'INNER JOIN medical.tindakan ON medical.tindakan.id = medical.tindakan_kunjungan.tindakan_id ' +
        'INNER JOIN medical.kunjungan ON medical.kunjungan.id = medical.tindakan_kunjungan.kunjungan_id ' +
        'INNER JOIN medical.pasien ON medical.pasien.id = medical.kunjungan.pasien_id ' +
        'INNER JOIN medical.poliklinik ON medical.poliklinik.id = medical.kunjungan.poliklinik_id ' +
        'INNER JOIN medical.pegawai AS tindakan_dokter ON tindakan_dokter.id = medical.tindakan_kunjungan.dokter_id ' +
        'INNER JOIN medical.pegawai AS dokter ON dokter.id = medical.kunjungan.dokter_id ' +
        'INNER JOIN medical.pegawai AS petugas_pendaftaran ON petugas_pendaftaran.id = medical.kunjungan.petugas_pendaftaran_id '
    
    const sqlWhere = 'WHERE ' +
        'medical.tindakan_kunjungan.id = ? ' +
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
                tanggal: row.tanggal,
                tindakan: {
                    id: row.tindakan_id,
                    nama: row.tindakan_nama
                },
                dokter: {
                    id: row.tindakan_dokter_id,
                    nama: row.tindakan_dokter_nama
                },
                kunjungan: {
                    id: row.kunjungan_id,
                    tanggal: row.kunjungan_tanggal,
                    pasien: {
                        id: row.pasien_id,
                        nik: row.pasien_nik,
                        nama: row.pasien_nama,
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
                    petugasPendaftaran: {
                        id: row.petugas_pendaftaran_id,
                        nama: row.petugas_pendaftaran_nama
                    }
                }
            }
            
            callback(null, formattedData) // kembalikan satu data pasien
        }
    })
    .catch((error) => {
        callback(error, null)
    })
}