import { DataTypes, QueryTypes } from "sequelize"
import { database } from "../config/Database.js"

export const orderLab = database.define('order_lab', {
    kunjungan_id: {
        type: DataTypes.INTEGER
    },
    dokter_id: {
        type: DataTypes.INTEGER
    },
}, {
    freezeTableName: true
})


export const orderLabDetail = database.define('order_lab_detail', {
    order_lab_id: {
        type: DataTypes.INTEGER
    },
    pemeriksaan_lab_id: {
        type: DataTypes.INTEGER
    }
}, {
    freezeTableName: true
})

export const get = (req, callback) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) > 100 ? 100 : parseInt(req.query.limit) || 100
    const offset = (page - 1) * limit

    const sqlSelect = 'SELECT ' +
        'medical.order_lab.id AS order_lab_id, ' +
        'medical.order_lab.tanggal AS order_lab_tanggal, ' +
        'medical.order_lab.kunjungan_id, ' +
        'medical.order_lab.dokter_id, ' +
        'dokter.nama AS dokter_nama, ' +
        'medical.kunjungan.tanggal AS kunjungan_tanggal, ' +
        'medical.pasien.id AS pasien_id, ' +
        'medical.pasien.nama AS pasien_nama, ' +
        'medical.pasien.nik AS pasien_nik, ' +
        'medical.pasien.tanggal_lahir AS pasien_tanggal_lahir, ' +
        'CASE ' + 
            'WHEN medical.pasien.jenis_kelamin = 1 THEN "Laki-Laki" ' +  
            'WHEN medical.pasien.jenis_kelamin = 2 THEN "Perempuan" ' + 
        'END AS pasien_jenis_kelamin, ' + 
        'medical.poliklinik.id AS poliklinik_id, ' +
        'medical.poliklinik.nama AS poliklinik_nama, ' +
        'medical.kunjungan.dokter_id AS kunjungan_dokter_id, ' +
        'kunjungan_dokter.nama AS kunjungan_dokter_nama, ' +
        'petugas_pendaftaran.id AS petugas_pendaftaran_id, ' +
        'petugas_pendaftaran.nama AS petugas_pendaftaran_nama, ' +
        'medical.order_lab_detail.id AS detail_id, ' +
        'medical.pemeriksaan_lab.id AS pemeriksaan_id, ' +
        'medical.pemeriksaan_lab.nama AS pemeriksaan_nama, ' +
        'medical.pemeriksaan_lab.nilai_rujukan_bawah, ' +
        'medical.pemeriksaan_lab.nilai_rujukan_atas, ' +
        'medical.pemeriksaan_lab.satuan, ' +
        'medical.pemeriksaan_lab.tarif '
    

    const sqlFrom = 'FROM ' +
    'medical.order_lab ' +
    'LEFT JOIN medical.order_lab_detail ON medical.order_lab_detail.order_lab_id = medical.order_lab.id ' +
    'LEFT JOIN medical.pemeriksaan_lab ON medical.pemeriksaan_lab.id = medical.order_lab_detail.pemeriksaan_lab_id ' +
    'INNER JOIN medical.kunjungan ON medical.kunjungan.id = medical.order_lab.kunjungan_id ' +
    'INNER JOIN medical.pasien ON medical.pasien.id = medical.kunjungan.pasien_id ' +
    'INNER JOIN medical.poliklinik ON medical.poliklinik.id = medical.kunjungan.poliklinik_id ' +
    'INNER JOIN medical.pegawai AS dokter ON dokter.id = medical.order_lab.dokter_id ' +
    'INNER JOIN medical.pegawai AS kunjungan_dokter ON kunjungan_dokter.id = medical.kunjungan.dokter_id ' +
    'INNER JOIN medical.pegawai AS petugas_pendaftaran ON petugas_pendaftaran.id = medical.kunjungan.petugas_pendaftaran_id '

    const sqlOrder = ' ORDER BY medical.order_lab.id '
    const sqlLimit = ' LIMIT ? '
    const sqlOffSet = ' OFFSET ? '

    const filters = []
    const replacements = []

    const { tanggal, dokterId, kunjunganId, kunjunganPasienNama, kunjunganPasienNik } = req.query

    if (tanggal) {
        filters.push('DATE(medical.order_lab.tanggal) = ?')
        replacements.push(tanggal)
    }

    if (dokterId) {
        filters.push('medical.order_lab.dokter_id = ?')
        replacements.push(dokterId)
    }

    if (kunjunganId) {
        filters.push('medical.order_lab.kunjungan_id = ?')
        replacements.push(kunjunganId)
    }

    if (kunjunganPasienNama) {
        filters.push('medical.pasien.nama LIKE ?')
        replacements.push(`%${kunjunganPasienNama}%`)
    }

    if (kunjunganPasienNik) {
        filters.push('medical.pasien.nik = ?')
        replacements.push(kunjunganPasienNik)
    }

    const sqlWhere = filters.length > 0 ? ' WHERE ' + filters.join(' AND ') : ''
    const replacementsWithLimit = [...replacements, limit, offset]

    const sql = sqlSelect + sqlFrom + sqlWhere + sqlOrder + sqlLimit + sqlOffSet

    // === QUERY DATA ===
    database.query(sql, {
        type: QueryTypes.SELECT,
        replacements: replacementsWithLimit
    }).then((rows) => {
        // === Hitung total data ===
        const sqlCount = `SELECT COUNT(DISTINCT medical.order_lab.id) AS total_row_count ${sqlFrom} ${sqlWhere}`

        database.query(sqlCount, {
            type: QueryTypes.SELECT,
            replacements
        }).then((countRes) => {
            const totalRowCount = countRes[0].total_row_count

            // === Grouping dengan reduce() ===
            const formattedData = Object.values(
                rows.reduce((acc, row) => {
                    if (!acc[row.order_lab_id]) {
                        acc[row.order_lab_id] = {
                            id: row.order_lab_id,
                            tanggal: row.order_lab_tanggal,
                            dokter: {
                                id: row.dokter_id,
                                nama: row.dokter_nama
                            },
                            orderLabDetail: [],
                            kunjungan: {
                                id: row.kunjungan_id,
                                tanggal: row.kunjungan_tanggal,
                                pasien: {
                                    id: row.pasien_id,
                                    nik: row.pasien_nik,
                                    nama: row.pasien_nama,
                                    tanggalLahir: row.pasien_tanggal_lahir,
                                    jenisKelamin: row.pasien_jenis_kelamin
                                },
                                poliklinik: {
                                    id: row.poliklinik_id,
                                    nama: row.poliklinik_nama
                                },
                                dokter: {
                                    id: row.kunjungan_dokter_id,
                                    nama: row.kunjungan_dokter_nama
                                },
                                petugasPendaftaran: {
                                    id: row.petugas_pendaftaran_id,
                                    nama: row.petugas_pendaftaran_nama
                                }
                            }
                        }
                    }

                    if (row.detail_id) {
                        acc[row.order_lab_id].orderLabDetail.push({
                            id: row.detail_id,
                            pemeriksaanLab: {
                                id: row.pemeriksaan_id,
                                nama: row.pemeriksaan_nama,
                                nilaiRujukanBawah: row.nilai_rujukan_bawah,
                                nilaiRujukanAtas: row.nilai_rujukan_atas,
                                satuan: row.satuan,
                                tarif: row.tarif
                            }
                        })
                    }

                    return acc
                }, {})
            )

            const data = {
                totalRowCount,
                page,
                limit,
                data: formattedData
            }

            callback(null, data)
        }).catch((error) => {
            callback(error, null)
        })
    }).catch((error) => {
        callback(error, null)
    })
}

export const show = (id, callback) => {
    const sqlSelect = 'SELECT ' +
        'medical.order_lab.id AS order_lab_id, ' +
        'medical.order_lab.tanggal AS order_lab_tanggal, ' +
        'medical.order_lab.kunjungan_id, ' +
        'medical.order_lab.dokter_id, ' +
        'dokter.nama AS dokter_nama, ' +
        'medical.kunjungan.tanggal AS kunjungan_tanggal, ' +
        'medical.pasien.id AS pasien_id, ' +
        'medical.pasien.nama AS pasien_nama, ' +
        'medical.pasien.nik AS pasien_nik, ' +
        'medical.pasien.tanggal_lahir AS pasien_tanggal_lahir, ' +
        'medical.poliklinik.id AS poliklinik_id, ' +
        'medical.poliklinik.nama AS poliklinik_nama, ' +
        'medical.kunjungan.dokter_id AS kunjungan_dokter_id, ' +
        'kunjungan_dokter.nama AS kunjungan_dokter_nama, ' +
        'petugas_pendaftaran.id AS petugas_pendaftaran_id, ' +
        'petugas_pendaftaran.nama AS petugas_pendaftaran_nama, ' +
        'medical.order_lab_detail.id AS detail_id, ' +
        'medical.pemeriksaan_lab.id AS pemeriksaan_id, ' +
        'medical.pemeriksaan_lab.nama AS pemeriksaan_nama, ' +
        'medical.pemeriksaan_lab.nilai_rujukan_bawah, ' +
        'medical.pemeriksaan_lab.nilai_rujukan_atas, ' +
        'medical.pemeriksaan_lab.satuan, ' +
        'medical.pemeriksaan_lab.tarif '
    

    const sqlFrom = 'FROM ' +
    'medical.order_lab ' +
    'LEFT JOIN medical.order_lab_detail ON medical.order_lab_detail.order_lab_id = medical.order_lab.id ' +
    'LEFT JOIN medical.pemeriksaan_lab ON medical.pemeriksaan_lab.id = medical.order_lab_detail.pemeriksaan_lab_id ' +
    'INNER JOIN medical.kunjungan ON medical.kunjungan.id = medical.order_lab.kunjungan_id ' +
    'INNER JOIN medical.pasien ON medical.pasien.id = medical.kunjungan.pasien_id ' +
    'INNER JOIN medical.poliklinik ON medical.poliklinik.id = medical.kunjungan.poliklinik_id ' +
    'INNER JOIN medical.pegawai AS dokter ON dokter.id = medical.order_lab.dokter_id ' +
    'INNER JOIN medical.pegawai AS kunjungan_dokter ON kunjungan_dokter.id = medical.kunjungan.dokter_id ' +
    'INNER JOIN medical.pegawai AS petugas_pendaftaran ON petugas_pendaftaran.id = medical.kunjungan.petugas_pendaftaran_id '

    const sqlWhere = 'WHERE ' +
        'medical.order_lab.id = ? '

    const sql = sqlSelect + sqlFrom + sqlWhere

    database.query(sql, {
        type: QueryTypes.SELECT,
        replacements: [id]
    })
    .then(rows => {
        if (rows.length === 0) {
            return callback(null, null)
        }

        // === Grouping data jadi satu objek ===
        const formattedData = rows.reduce((acc, row) => {
            if (!acc.id) {
                acc = {
                    id: row.order_lab_id,
                    tanggal: row.order_lab_tanggal,
                    dokter: {
                        id: row.dokter_id,
                        nama: row.dokter_nama
                    },
                    orderLabDetail: [],
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
                            id: row.kunjungan_dokter_id,
                            nama: row.kunjungan_dokter_nama
                        },
                        petugasPendaftaran: {
                            id: row.petugas_pendaftaran_id,
                            nama: row.petugas_pendaftaran_nama
                        }
                    }
                }
            }

            if (row.detail_id) {
                acc.orderLabDetail.push({
                    id: row.detail_id,
                    pemeriksaanLab: {
                        id: row.pemeriksaan_id,
                        nama: row.pemeriksaan_nama,
                        nilaiRujukanBawah: row.nilai_rujukan_bawah,
                        nilaiRujukanAtas: row.nilai_rujukan_atas,
                        satuan: row.satuan,
                        tarif: row.tarif
                    }
                })
            }

            return acc
        }, {})

        callback(null, formattedData)
    })
    .catch(error => {
        callback(error, null)
    })
}