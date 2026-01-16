import { DataTypes, QueryTypes } from "sequelize"
import { database } from "../config/Database.js"

export const anamnesis = database.define('anamnesis', {
    kunjungan_id: {
        type: DataTypes.INTEGER
    },
    riwayat_hipertensi: {
        type: DataTypes.INTEGER
    },
    riwayat_diabetes: {
        type: DataTypes.INTEGER
    },
    riwayat_merokok: {
        type: DataTypes.INTEGER
    },
    riwayat_jantung_keluarga: {
        type: DataTypes.DECIMAL
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
        'medical.anamnesis.id as id, ' +
        'medical.anamnesis.tanggal, ' +
        'medical.anamnesis.riwayat_hipertensi, ' +
        'medical.anamnesis.riwayat_diabetes, ' +
        'medical.anamnesis.riwayat_merokok, ' +
        'medical.anamnesis.riwayat_jantung_keluarga, ' +
        'anamnesis_dokter.id as anamnesis_dokter_id, ' +
        'anamnesis_dokter.nama AS anamnesis_dokter_nama, ' +
        'medical.kunjungan.id as kunjungan_id, ' +
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
        'medical.anamnesis ' +
        'INNER JOIN medical.kunjungan ON medical.kunjungan.id = medical.anamnesis.kunjungan_id ' +
        'INNER JOIN medical.pasien ON medical.pasien.id = medical.kunjungan.pasien_id ' +
        'INNER JOIN medical.poliklinik ON medical.poliklinik.id = medical.kunjungan.poliklinik_id ' +
        'INNER JOIN medical.pegawai AS anamnesis_dokter ON anamnesis_dokter.id = medical.anamnesis.dokter_id ' +
        'INNER JOIN medical.pegawai AS dokter ON dokter.id = medical.kunjungan.dokter_id ' +
        'INNER JOIN medical.pegawai AS petugas_pendaftaran ON petugas_pendaftaran.id = medical.kunjungan.petugas_pendaftaran_id '
    
    const sqlOrder = ' ORDER BY medical.pasien.nama '

    const sqlLimit = 'LIMIT ? '
    
    const sqlOffSet = 'OFFSET ?'

    const filters = []
    const replacements = []

    const { 
        tanggal,
        dokterId,
        kunjunganId,
        kunjunganTanggal,
        kunjunganPasienNik, 
        kunjunganPasienNama,
        kunjunganPasienId, 
        kunjunganPoliklinikId, 
        kunjunganDokterId, 
        kunjunganPetugasPendaftaranId
    } = req.query

    if (tanggal) {
        filters.push("DATE(medical.anamnesis.tanggal) = ?")
        replacements.push(tanggal)
    }

    if (dokterId) {
        filters.push("medical.anamnesis.dokter_id = ?")
        replacements.push(dokterId)
    }

    if (kunjunganId) {
        filters.push("medical.anamnesis.kunjungan_id = ?")
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
                'count(medical.anamnesis.id) as total_row_count '
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
                    riwayatHipertensi: item.riwayat_hipertensi,
                    riwayatDiabetes: item.riwayat_diabetes,
                    riwayatMerokok: item.riwayat_merokok,
                    riwayatJantungKeluarga: item.riwayat_jantung_keluarga,
                    dokter: {
                        id: item.anamnesis_dokter_id,
                        nama: item.anamnesis_dokter_nama
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
        'medical.anamnesis.id as id, ' +
        'medical.anamnesis.tanggal, ' +
        'medical.anamnesis.riwayat_hipertensi, ' +
        'medical.anamnesis.riwayat_diabetes, ' +
        'medical.anamnesis.riwayat_merokok, ' +
        'medical.anamnesis.riwayat_jantung_keluarga, ' +
        'anamnesis_dokter.id as anamnesis_dokter_id, ' +
        'anamnesis_dokter.nama AS anamnesis_dokter_nama, ' +
        'medical.kunjungan.id as kunjungan_id, ' +
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
        'medical.anamnesis ' +
        'INNER JOIN medical.kunjungan ON medical.kunjungan.id = medical.anamnesis.kunjungan_id ' +
        'INNER JOIN medical.pasien ON medical.pasien.id = medical.kunjungan.pasien_id ' +
        'INNER JOIN medical.poliklinik ON medical.poliklinik.id = medical.kunjungan.poliklinik_id ' +
        'INNER JOIN medical.pegawai AS anamnesis_dokter ON anamnesis_dokter.id = medical.anamnesis.dokter_id ' +
        'INNER JOIN medical.pegawai AS dokter ON dokter.id = medical.kunjungan.dokter_id ' +
        'INNER JOIN medical.pegawai AS petugas_pendaftaran ON petugas_pendaftaran.id = medical.kunjungan.petugas_pendaftaran_id '    

    const sqlWhere = 'WHERE ' +
        'medical.anamnesis.id = ? ' +
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
            console.log(row)
            const formattedData = {
                id: row.id,
                tanggal: row.tanggal,
                riwayatHipertensi: row.riwayat_hipertensi,
                riwayatDiabetes: row.riwayat_diabetes,
                riwayatMerokok: row.riwayat_merokok,
                riwayatJantungKeluarga: row.riwayat_jantung_keluarga,
                dokter: {
                    id: row.anamnesis_dokter_id,
                    nama: row.anamnesis_dokter_nama
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