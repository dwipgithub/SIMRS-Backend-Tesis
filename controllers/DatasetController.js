import axios from "axios";

export const getDataset = async (req, res) => {
    try {
        const response = await axios.get("http://127.0.0.1:8000/api/v1/dataset/penyakit-jantung");

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

export const getDatasetClassDistribution = async (req, res) => {
    try {
        const response = await axios.get("http://127.0.0.1:8000/api/v1/dataset/penyakit-jantung/distribusi-kelas");

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

export const getDatasetStatistic = async (req, res) => {
    try {
        const response = await axios.get("http://127.0.0.1:8000/api/v1/dataset/penyakit-jantung/statistik");

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
