import { DataTypes, QueryTypes } from "sequelize"
import { database } from "../config/Database.js"

export const hasilLab = database.define('hasil_lab', {
    order_lab_id: {
        type: DataTypes.INTEGER
    },
    petugas_lab_id: {
        type: DataTypes.INTEGER
    },
}, {
    freezeTableName: true
})


export const hasilLabDetail = database.define('hasil_lab_detail', {
    hasil_lab_id: {
        type: DataTypes.INTEGER
    },
    order_lab_detail_id: {
        type: DataTypes.INTEGER
    },
    nilai: {
        type: DataTypes.DECIMAL
    }
}, {
    freezeTableName: true
})

export const get = (req, callback) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) > 100 ? 100 : parseInt(req.query.limit) || 100
    const offset = (page - 1) * limit

    // === SELECT ===
    const sqlSelect = 'SELECT ' +
        'medical.hasil_lab.id, ' +
        'medical.hasil_lab.tanggal, ' +
        'medical.hasil_lab.order_lab_id, ' +
        'medical.hasil_lab.petugas_lab_id, ' +
        'petugas_lab.nama AS petugas_lab_nama, ' +
        'medical.order_lab.tanggal AS order_lab_tanggal, ' +
        'dokter_order.nama AS dokter_order_nama, ' +
        'medical.kunjungan.id AS kunjungan_id, ' +
        'medical.kunjungan.tanggal AS kunjungan_tanggal, ' +
        'medical.pasien.id AS pasien_id, ' +
        'medical.pasien.nama AS pasien_nama, ' +
        'medical.pasien.nik AS pasien_nik, ' +
        'medical.pasien.tanggal_lahir AS pasien_tanggal_lahir, ' +
        'medical.poliklinik.id AS poliklinik_id, ' +
        'medical.poliklinik.nama AS poliklinik_nama, ' +
        'kunjungan_dokter.id AS kunjungan_dokter_id, ' +
        'kunjungan_dokter.nama AS kunjungan_dokter_nama, ' +
        'petugas_pendaftaran.id AS petugas_pendaftaran_id, ' +
        'petugas_pendaftaran.nama AS petugas_pendaftaran_nama, ' +
        'medical.hasil_lab_detail.id AS hasil_lab_detail_id, ' +
        'medical.hasil_lab_detail.nilai AS hasil_lab_nilai, ' +
        'medical.order_lab_detail.id AS order_lab_detail_id, ' +
        'medical.pemeriksaan_lab.id AS pemeriksaan_id, ' +
        'medical.pemeriksaan_lab.nama AS pemeriksaan_nama, ' +
        'medical.pemeriksaan_lab.nilai_rujukan_bawah, ' +
        'medical.pemeriksaan_lab.nilai_rujukan_atas, ' +
        'medical.pemeriksaan_lab.satuan, ' +
        'medical.pemeriksaan_lab.tarif '

    // === FROM & JOIN ===
    const sqlFrom = 'FROM medical.hasil_lab ' +
        'LEFT JOIN medical.hasil_lab_detail ON medical.hasil_lab_detail.hasil_lab_id = medical.hasil_lab.id ' +
        'LEFT JOIN medical.order_lab_detail ON medical.order_lab_detail.id = medical.hasil_lab_detail.order_lab_detail_id ' +
        'LEFT JOIN medical.pemeriksaan_lab ON medical.pemeriksaan_lab.id = medical.order_lab_detail.pemeriksaan_lab_id ' +
        'INNER JOIN medical.order_lab ON medical.order_lab.id = medical.hasil_lab.order_lab_id ' +
        'INNER JOIN medical.kunjungan ON medical.kunjungan.id = medical.order_lab.kunjungan_id ' +
        'INNER JOIN medical.pasien ON medical.pasien.id = medical.kunjungan.pasien_id ' +
        'INNER JOIN medical.poliklinik ON medical.poliklinik.id = medical.kunjungan.poliklinik_id ' +
        'INNER JOIN medical.pegawai AS dokter_order ON dokter_order.id = medical.order_lab.dokter_id ' +
        'INNER JOIN medical.pegawai AS kunjungan_dokter ON kunjungan_dokter.id = medical.kunjungan.dokter_id ' +
        'INNER JOIN medical.pegawai AS petugas_pendaftaran ON petugas_pendaftaran.id = medical.kunjungan.petugas_pendaftaran_id ' +
        'INNER JOIN medical.pegawai AS petugas_lab ON petugas_lab.id = medical.hasil_lab.petugas_lab_id '

    const sqlOrder = ' ORDER BY medical.hasil_lab.id '
    const sqlLimit = ' LIMIT ? '
    const sqlOffSet = ' OFFSET ? '

    // === FILTERS ===
    const filters = []
    const replacements = []
    const { tanggal, kunjunganId, orderLabId, pasienNama, pasienNik } = req.query

    if (tanggal) {
        filters.push('DATE(medical.hasil_lab.tanggal) = ?')
        replacements.push(tanggal)
    }

    if (kunjunganId) {
        filters.push('medical.kunjungan.id = ?')
        replacements.push(kunjunganId)
    }

    if (orderLabId) {
        filters.push('medical.order_lab.id = ?')
        replacements.push(orderLabId)
    }

    if (pasienNama) {
        filters.push('medical.pasien.nama LIKE ?')
        replacements.push(`%${pasienNama}%`)
    }

    if (pasienNik) {
        filters.push('medical.pasien.nik = ?')
        replacements.push(pasienNik)
    }

    const sqlWhere = filters.length > 0 ? ' WHERE ' + filters.join(' AND ') : ''
    const replacementsWithLimit = [...replacements, limit, offset]

    const sql = sqlSelect + sqlFrom + sqlWhere + sqlOrder + sqlLimit + sqlOffSet

    // === QUERY DATA ===
    database.query(sql, {
        type: QueryTypes.SELECT,
        replacements: replacementsWithLimit
    }).then(rows => {
        // === Hitung total data ===
        const sqlCount = `SELECT COUNT(DISTINCT medical.hasil_lab.id) AS total_row_count ${sqlFrom} ${sqlWhere}`
        database.query(sqlCount, {
            type: QueryTypes.SELECT,
            replacements
        }).then(countRes => {
            const totalRowCount = countRes[0].total_row_count

            // === Grouping dengan reduce() ===
            const formattedData = Object.values(
                rows.reduce((acc, row) => {
                    if (!acc[row.id]) {
                        acc[row.id] = {
                            id: row.id,
                            tanggal: row.tanggal,
                            petugasLab: {
                                id: row.petugas_lab_id,
                                nama: row.petugas_lab_nama
                            },
                            orderLab: {
                                id: row.order_lab_id,
                                tanggal: row.order_lab_tanggal,
                                dokter: { nama: row.dokter_order_nama }
                            },
                            hasilLabDetail: [],
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

                    if (row.hasil_lab_detail_id) {
                        acc[row.id].hasilLabDetail.push({
                            id: row.hasil_lab_detail_id,
                            nilai: row.hasil_lab_nilai,
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
        'medical.hasil_lab.id, ' +
        'medical.hasil_lab.tanggal, ' +
        'medical.hasil_lab.order_lab_id, ' +
        'medical.hasil_lab.petugas_lab_id, ' +
        'petugas_lab.nama AS petugas_lab_nama, ' +
        'medical.order_lab.tanggal AS order_lab_tanggal, ' +
        'dokter_order.nama AS dokter_order_nama, ' +
        'medical.kunjungan.id AS kunjungan_id, ' +
        'medical.kunjungan.tanggal AS kunjungan_tanggal, ' +
        'medical.pasien.id AS pasien_id, ' +
        'medical.pasien.nama AS pasien_nama, ' +
        'medical.pasien.nik AS pasien_nik, ' +
        'medical.pasien.tanggal_lahir AS pasien_tanggal_lahir, ' +
        'medical.poliklinik.id AS poliklinik_id, ' +
        'medical.poliklinik.nama AS poliklinik_nama, ' +
        'kunjungan_dokter.id AS kunjungan_dokter_id, ' +
        'kunjungan_dokter.nama AS kunjungan_dokter_nama, ' +
        'petugas_pendaftaran.id AS petugas_pendaftaran_id, ' +
        'petugas_pendaftaran.nama AS petugas_pendaftaran_nama, ' +
        'medical.hasil_lab_detail.id AS hasil_lab_detail_id, ' +
        'medical.hasil_lab_detail.nilai AS hasil_lab_nilai, ' +
        'medical.order_lab_detail.id AS order_lab_detail_id, ' +
        'medical.pemeriksaan_lab.id AS pemeriksaan_id, ' +
        'medical.pemeriksaan_lab.nama AS pemeriksaan_nama, ' +
        'medical.pemeriksaan_lab.nilai_rujukan_bawah, ' +
        'medical.pemeriksaan_lab.nilai_rujukan_atas, ' +
        'medical.pemeriksaan_lab.satuan, ' +
        'medical.pemeriksaan_lab.tarif '

    // === FROM & JOIN ===
    const sqlFrom = 'FROM medical.hasil_lab ' +
        'LEFT JOIN medical.hasil_lab_detail ON medical.hasil_lab_detail.hasil_lab_id = medical.hasil_lab.id ' +
        'LEFT JOIN medical.order_lab_detail ON medical.order_lab_detail.id = medical.hasil_lab_detail.order_lab_detail_id ' +
        'LEFT JOIN medical.pemeriksaan_lab ON medical.pemeriksaan_lab.id = medical.order_lab_detail.pemeriksaan_lab_id ' +
        'INNER JOIN medical.order_lab ON medical.order_lab.id = medical.hasil_lab.order_lab_id ' +
        'INNER JOIN medical.kunjungan ON medical.kunjungan.id = medical.order_lab.kunjungan_id ' +
        'INNER JOIN medical.pasien ON medical.pasien.id = medical.kunjungan.pasien_id ' +
        'INNER JOIN medical.poliklinik ON medical.poliklinik.id = medical.kunjungan.poliklinik_id ' +
        'INNER JOIN medical.pegawai AS dokter_order ON dokter_order.id = medical.order_lab.dokter_id ' +
        'INNER JOIN medical.pegawai AS kunjungan_dokter ON kunjungan_dokter.id = medical.kunjungan.dokter_id ' +
        'INNER JOIN medical.pegawai AS petugas_pendaftaran ON petugas_pendaftaran.id = medical.kunjungan.petugas_pendaftaran_id ' +
        'INNER JOIN medical.pegawai AS petugas_lab ON petugas_lab.id = medical.hasil_lab.petugas_lab_id '

    const sqlWhere = 'WHERE medical.hasil_lab.id = ?'
    const sqlOrder = ' ORDER BY medical.hasil_lab.id '

    const sql = sqlSelect + sqlFrom + sqlWhere + sqlOrder

    // === QUERY DATA ===
    database.query(sql, {
        type: QueryTypes.SELECT,
        replacements: [id]
    }).then(rows => {
        if (rows.length === 0) {
            return callback(null, null)
        }

        // === Format JSON menggunakan reduce() ===
        const formattedData = rows.reduce((acc, row) => {
            if (!acc[row.id]) {
                acc[row.id] = {
                    id: row.id,
                    tanggal: row.tanggal,
                    petugasLab: {
                        id: row.petugas_lab_id,
                        nama: row.petugas_lab_nama
                    },
                    orderLab: {
                        id: row.order_lab_id,
                        tanggal: row.order_lab_tanggal,
                        dokter: { nama: row.dokter_order_nama }
                    },
                    hasilLabDetail: [],
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

            if (row.hasil_lab_detail_id) {
                acc[row.id].hasilLabDetail.push({
                    id: row.hasil_lab_detail_id,
                    nilai: row.hasil_lab_nilai,
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
    }).catch((error) => {
        callback(error, null)
    })
}