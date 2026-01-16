import express from 'express'

import { login, logout } from '../controllers/PenggunaController.js'
import { refreshToken } from '../controllers/RefreshToken.js'
import { verifyToken } from '../middleware/VerifyToken.js'
import { getPasien, showPasien } from '../controllers/PasienController.js'
import { getPegawai, showPegawai } from '../controllers/PegawaiController.js'
import { getPoliklinik, showPoliklinik } from '../controllers/PoliklinikController.js'
import { getTindakan, showTindakan } from '../controllers/TindakanController.js'
import { getPemeriksaanLab, showPemeriksaanLab } from '../controllers/PemeriksaanLabController.js'
import { inserKunjungan, getKunjungan, showKunjungan } from '../controllers/KunjunganController.js'
import { insertPemeriksaanAwal, getPemeriksaanAwal, showPemeriksaanAwal } from '../controllers/PemeriksaanAwalController.js'
import { insertAnamnesis, getAnamnesis, showAnamnesis} from '../controllers/AnamnesisController.js'
import { insertTindakanKunjungan, getTindakanKunjungan, showTindakanKunjungan } from '../controllers/TindakanKunjunganController.js'
import { insertOrderLab, getOrderLab, showOrderLab } from '../controllers/OrderLabController.js'
import { insertHasilLab, getHasilLab, showHasilLab } from '../controllers/HasilLabController.js'
import { insertPrediksiPenyakitJantung } from '../controllers/PrediksiPenyakitJantungController.js'

import { getDataset, getDatasetStatistic, getDatasetClassDistribution } from "../controllers/DatasetController.js"
import { 
    getPeringkatFitur, 
    getEvaluasiModel,
    insertPelatihanKNN,
    insertPelatihanLR,
    insertPelatihanNB,
    insertPrediksiKNN,
    insertPrediksiLR
 } from "../controllers/ModelKlasifikasiController.js"

const router = express.Router()

// Authentikasi
router.post('/api/v1/login', login)
router.delete('/api/v1/logout', logout)
router.get('/api/v1/token', refreshToken)

// Pasien
router.get('/api/v1/pasien', verifyToken, getPasien)
router.get('/api/v1/pasien/:id', verifyToken, showPasien)

// Pegawai
router.get('/api/v1/pegawai', verifyToken, getPegawai)
router.get('/api/v1/pegawai/:id', verifyToken, showPegawai)

// Pegawai
router.get('/api/v1/poliklinik', verifyToken, getPoliklinik)
router.get('/api/v1/poliklinik/:id', verifyToken, showPoliklinik)

// Tindakan
router.get('/api/v1/tindakan', verifyToken, getTindakan)
router.get('/api/v1/tindakan/:id', verifyToken, showTindakan)

// Pemeriksaan Lab
router.get('/api/v1/pemeriksaan-lab', verifyToken, getPemeriksaanLab)
router.get('/api/v1/pemeriksaan-lab/:id', verifyToken, showPemeriksaanLab)

// Kunjungan
router.post('/api/v1/kunjungan', verifyToken, inserKunjungan)
router.get('/api/v1/kunjungan', verifyToken, getKunjungan)
router.get('/api/v1/kunjungan/:id', verifyToken, showKunjungan)

// Pemeriksaan Awal
router.post('/api/v1/pemeriksaan-awal', verifyToken, insertPemeriksaanAwal)
router.get('/api/v1/pemeriksaan-awal', verifyToken, getPemeriksaanAwal)
router.get('/api/v1/pemeriksaan-awal/:id', verifyToken, showPemeriksaanAwal)

// Anamnesis
router.post('/api/v1/anamnesis', verifyToken, insertAnamnesis)
router.get('/api/v1/anamnesis', verifyToken, getAnamnesis)
router.get('/api/v1/anamnesis/:id', verifyToken, showAnamnesis)

// Tindakan Kunjungan
router.post('/api/v1/tindakan-kunjungan', verifyToken, insertTindakanKunjungan)
router.get('/api/v1/tindakan-kunjungan', verifyToken, getTindakanKunjungan)
router.get('/api/v1/tindakan-kunjungan/:id', verifyToken, showTindakanKunjungan)

// Order Lab
router.post('/api/v1/order-lab', verifyToken, insertOrderLab)
router.get('/api/v1/order-lab', verifyToken, getOrderLab)
router.get('/api/v1/order-lab/:id', verifyToken, showOrderLab)

// Hasil Lab
router.post('/api/v1/hasil-lab', verifyToken, insertHasilLab)
router.get('/api/v1/hasil-lab', verifyToken, getHasilLab)
router.get('/api/v1/hasil-lab/:id', verifyToken, showHasilLab)

// Prediksi Penyakit Jantung KNN
router.post('/api/v1/prediksi-penyakit-jantung', verifyToken, insertPrediksiPenyakitJantung)

// Dataset
router.get('/api/v1/dataset/penyakit-jantung', verifyToken, getDataset)
router.get('/api/v1/dataset/penyakit-jantung/statistik', verifyToken, getDatasetStatistic)
router.get('/api/v1/dataset/penyakit-jantung/distribusi-kelas', verifyToken, getDatasetClassDistribution)

// Model Klasifikasi
router.get('/api/v1/model-klasifikasi/penyakit-jantung/evaluasi', verifyToken, getEvaluasiModel)
router.get('/api/v1/model-klasifikasi/penyakit-jantung/peringkat-fitur', verifyToken, getPeringkatFitur)

// Model Klasifikasi - Pelatihan
router.post('/api/v1/model-klasifikasi/penyakit-jantung/knn/pelatihan', verifyToken, insertPelatihanKNN)
router.post('/api/v1/model-klasifikasi/penyakit-jantung/lr/pelatihan', verifyToken, insertPelatihanLR)
router.post('/api/v1/model-klasifikasi/penyakit-jantung/nb/pelatihan', verifyToken, insertPelatihanNB)

// Model Klasifikasi - Prediksi KNN
router.post('/api/v1/model-klasifikasi/penyakit-jantung/lr/prediksi', verifyToken, insertPrediksiLR)

export default router