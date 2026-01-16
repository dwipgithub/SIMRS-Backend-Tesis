import axios from "axios";

export const getEvaluasiModel = async (req, res) => {
    try {
        const response = await axios.get("http://127.0.0.1:8000/api/v1/model-klasifikasi/penyakit-jantung/evaluasi");

        res.status(200).send({
            status: true,
            message: "data found",
            data:  response.data.data
        })
    } catch (error) {
        console.error("Terjadi kesalahan saat memanggil API:", error.message);
        res.status(500).json({
            error: true,
            message: error.message,
            data: null
        });
    }
};

export const getPeringkatFitur = async (req, res) => {
    try {
        const response = await axios.get("http://127.0.0.1:8000/api/v1/model-klasifikasi/penyakit-jantung/peringkat-fitur");

        res.status(201).send({
            status: true,
            message: "Peringkat Fitur Created",
            data:  response.data.data
        })
    } catch (error) {
        console.error("Terjadi kesalahan saat memanggil API:", error.message);
        res.status(500).json({
            error: true,
            message: error.message,
            data: null
        });
    }
};

export const insertPelatihanKNN = async (req, res) => {
    try {
        const response = await axios.post("http://127.0.0.1:8000/api/v1/model-klasifikasi/penyakit-jantung/knn/pelatihan");

        res.status(201).send({
            status: true,
            message: response.data.message,
            data:  response.data.data.data
        })
    } catch (error) {
        console.error("Terjadi kesalahan saat memanggil API:", error.message);
        res.status(500).json({
            error: true,
            message: error.message,
            data: null
        });
    }
};

export const insertPelatihanLR = async (req, res) => {
    try {
        const response = await axios.post("http://127.0.0.1:8000/api/v1/model-klasifikasi/penyakit-jantung/lr/pelatihan");

        res.status(201).send({
            status: true,
            message: response.data.message,
            data:  response.data.data.data
        })
    } catch (error) {
        console.error("Terjadi kesalahan saat memanggil API:", error.message);
        res.status(500).json({
            error: true,
            message: error.message,
            data: null
        });
    }
};

export const insertPelatihanNB = async (req, res) => {
    try {
        const response = await axios.post("http://127.0.0.1:8000/api/v1/model-klasifikasi/penyakit-jantung/nb/pelatihan");

        res.status(201).send({
            status: true,
            message: response.data.message,
            data:  response.data.data.data
        })
    } catch (error) {
        console.error("Terjadi kesalahan saat memanggil API:", error.message);
        res.status(500).json({
            error: true,
            message: error.message,
            data: null
        });
    }
};

export const insertPrediksiKNN = async (req, res) => {
    try {

        const data = { ...req.body };

        const response = await axios.post("http://127.0.0.1:8000/api/v1/model-klasifikasi/penyakit-jantung/knn/prediksi", data);

        res.status(201).send({
            status: true,
            message: "data found",
            data:  response.data.data
        })
    } catch (error) {
        console.error("Terjadi kesalahan saat memanggil API:", error.message);
        res.status(500).json({
            error: true,
            message: error.message,
            data: null
        });
    }
};

export const insertPrediksiLR = async (req, res) => {
    try {

        const data = { ...req.body };

        const response = await axios.post("http://127.0.0.1:8000/api/v1/model-klasifikasi/penyakit-jantung/lr/prediksi", data);

        res.status(201).send({
            status: true,
            message: "data found",
            data:  response.data.data
        })
    } catch (error) {
        console.error("Terjadi kesalahan saat memanggil API:", error.message);
        res.status(500).json({
            error: true,
            message: error.message,
            data: null
        });
    }
};
