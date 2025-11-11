import { DataTypes, QueryTypes } from "sequelize"
import { database } from "../config/Database.js"

export const pemeriksaanawal = database.define('pemeriksaan_awal', {
    kunjungan_id: {
        type: DataTypes.INTEGER
    },
    tekanan_darah_sistolik: {
        type: DataTypes.INTEGER
    },
    tekanan_darah_diastolik: {
        type: DataTypes.INTEGER
    },
    denyut_nadi: {
        type: DataTypes.INTEGER
    },
    suhu_tubuh: {
        type: DataTypes.DECIMAL
    },
    tinggi_badan: {
        type: DataTypes.DECIMAL
    },
    berat_badan: {
        type: DataTypes.DECIMAL
    },
    pemeriksa_id: {
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
        'medical.pemeriksaan_awal.id as id, ' +
        'medical.pemeriksaan_awal.tekanan_darah_sistolik, ' +
        'medical.pemeriksaan_awal.tekanan_darah_diastolik, ' +
        'medical.pemeriksaan_awal.denyut_nadi, ' +
        'medical.pemeriksaan_awal.suhu_tubuh, ' +
        'medical.pemeriksaan_awal.tinggi_badan, ' +
        'medical.pemeriksaan_awal.berat_badan, ' +
        'medical.pemeriksaan_awal.tanggal, ' +
        'medical.pemeriksaan_awal.pemeriksa_id, ' +
        'pemeriksa.nama as pemeriksa_nama, ' +
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
        'medical.pemeriksaan_awal ' +
        'INNER JOIN medical.kunjungan ON medical.kunjungan.id = medical.pemeriksaan_awal.kunjungan_id ' +
        'INNER JOIN medical.pasien ON medical.pasien.id = medical.kunjungan.pasien_id ' +
        'INNER JOIN medical.poliklinik ON medical.poliklinik.id = medical.kunjungan.poliklinik_id ' +
        'INNER JOIN medical.pegawai AS pemeriksa ON pemeriksa.id = medical.pemeriksaan_awal.pemeriksa_id ' +
        'INNER JOIN medical.pegawai AS dokter ON dokter.id = medical.kunjungan.dokter_id ' +
        'INNER JOIN medical.pegawai AS petugas_pendaftaran ON petugas_pendaftaran.id = medical.kunjungan.petugas_pendaftaran_id '
    
    const sqlOrder = ' ORDER BY medical.pasien.nama '

    const sqlLimit = 'LIMIT ? '
    
    const sqlOffSet = 'OFFSET ?'

    const filters = []
    const replacements = []

    const { 
        tanggal,
        pemeriksaId,
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
        filters.push("DATE(medical.pemeriksaan_awal.tanggal) = ?")
        replacements.push(tanggal)
    }

    if (pemeriksaId) {
        filters.push("medical.pemeriksaan_awal.pemeriksa_id = ?")
        replacements.push(pemeriksaId)
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
                'count(medical.pemeriksaan_awal.id) as total_row_count '
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
                    tekananDarahSistolik: item.tekanan_darah_sistolik,
                    tekananDarahDiastolik: item.tekanan_darah_diastolik,
                    denyutNadi: item.denyut_nadi,
                    suhuTubuh: item.suhu_tubuh,
                    tinggiBadan: item.tinggi_badan,
                    beratBadan: item.berat_badan,
                    pemeriksa: {
                        id: item.pemeriksa_id,
                        nama: item.pemeriksa_nama
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
        'medical.pemeriksaan_awal.id as id, ' +
        'medical.pemeriksaan_awal.tekanan_darah_sistolik, ' +
        'medical.pemeriksaan_awal.tekanan_darah_diastolik, ' +
        'medical.pemeriksaan_awal.denyut_nadi, ' +
        'medical.pemeriksaan_awal.suhu_tubuh, ' +
        'medical.pemeriksaan_awal.tinggi_badan, ' +
        'medical.pemeriksaan_awal.berat_badan, ' +
        'medical.pemeriksaan_awal.tanggal, ' +
        'medical.pemeriksaan_awal.pemeriksa_id, ' +
        'pemeriksa.nama as pemeriksa_nama, ' +
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
        'medical.pemeriksaan_awal ' +
        'INNER JOIN medical.kunjungan ON medical.kunjungan.id = medical.pemeriksaan_awal.kunjungan_id ' +
        'INNER JOIN medical.pasien ON medical.pasien.id = medical.kunjungan.pasien_id ' +
        'INNER JOIN medical.poliklinik ON medical.poliklinik.id = medical.kunjungan.poliklinik_id ' +
        'INNER JOIN medical.pegawai AS pemeriksa ON pemeriksa.id = medical.pemeriksaan_awal.pemeriksa_id ' +
        'INNER JOIN medical.pegawai AS dokter ON dokter.id = medical.kunjungan.dokter_id ' +
        'INNER JOIN medical.pegawai AS petugas_pendaftaran ON petugas_pendaftaran.id = medical.kunjungan.petugas_pendaftaran_id '

    const sqlWhere = 'WHERE ' +
        'medical.pemeriksaan_awal.id = ? ' +
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
                tekananDarahSistolik: row.tekanan_darah_sistolik,
                tekananDarahDiastolik: row.tekanan_darah_diastolik,
                denyutNadi: row.denyut_nadi,
                suhuTubuh: row.suhu_tubuh,
                tinggiBadan: row.tinggi_badan,
                beratBadan: row.berat_badan,
                pemeriksa: {
                    id: row.pemeriksa_id,
                    nama: row.pemeriksa_nama
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