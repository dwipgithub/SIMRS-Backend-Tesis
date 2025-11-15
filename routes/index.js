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

import { getDataset } from "../controllers/DatasetController.js"
import { getEvaluasiModel } from "../controllers/EvaluasiModelController.js"

const router = express.Router()

// Authentikasi
router.post('/backend/login', login)
router.delete('/backend/logout', logout)
router.get('/backend/token', refreshToken)

// Dataset
router.get('/backend/dataset', verifyToken, getDataset)

// Evaluasi Model
router.get('/backend/evaluasi-model', verifyToken, getEvaluasiModel)

// Pasien
router.get('/backend/pasien', verifyToken, getPasien)
router.get('/backend/pasien/:id', verifyToken, showPasien)

// Pegawai
router.get('/backend/pegawai', verifyToken, getPegawai)
router.get('/backend/pegawai/:id', verifyToken, showPegawai)

// Pegawai
router.get('/backend/poliklinik', verifyToken, getPoliklinik)
router.get('/backend/poliklinik/:id', verifyToken, showPoliklinik)

// Tindakan
router.get('/backend/tindakan', verifyToken, getTindakan)
router.get('/backend/tindakan/:id', verifyToken, showTindakan)

// Pemeriksaan Lab
router.get('/backend/pemeriksaan-lab', verifyToken, getPemeriksaanLab)
router.get('/backend/pemeriksaan-lab/:id', verifyToken, showPemeriksaanLab)

// Kunjungan
router.post('/backend/kunjungan', verifyToken, inserKunjungan)
router.get('/backend/kunjungan', verifyToken, getKunjungan)
router.get('/backend/kunjungan/:id', verifyToken, showKunjungan)

// Pemeriksaan Awal
router.post('/backend/pemeriksaan-awal', verifyToken, insertPemeriksaanAwal)
router.get('/backend/pemeriksaan-awal', verifyToken, getPemeriksaanAwal)
router.get('/backend/pemeriksaan-awal/:id', verifyToken, showPemeriksaanAwal)

// Anamnesis
router.post('/backend/anamnesis', verifyToken, insertAnamnesis)
router.get('/backend/anamnesis', verifyToken, getAnamnesis)
router.get('/backend/anamnesis/:id', verifyToken, showAnamnesis)

// Tindakan Kunjungan
router.post('/backend/tindakan-kunjungan', verifyToken, insertTindakanKunjungan)
router.get('/backend/tindakan-kunjungan', verifyToken, getTindakanKunjungan)
router.get('/backend/tindakan-kunjungan/:id', verifyToken, showTindakanKunjungan)

// Order Lab
router.post('/backend/order-lab', verifyToken, insertOrderLab)
router.get('/backend/order-lab', verifyToken, getOrderLab)
router.get('/backend/order-lab/:id', verifyToken, showOrderLab)

// Hasil Lab
router.post('/backend/hasil-lab', verifyToken, insertHasilLab)
router.get('/backend/hasil-lab', verifyToken, getHasilLab)
router.get('/backend/hasil-lab/:id', verifyToken, showHasilLab)

// Prediksi Penyakit Jantung KNN
router.post('/backend/prediksi-penyakit-jantung', verifyToken, insertPrediksiPenyakitJantung)

export default router