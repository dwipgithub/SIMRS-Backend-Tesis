import axios from "axios";

export const insertPrediksiPenyakitJantung = async (req, res) => {
    try {

        const data = { ...req.body };

        const response = await axios.post("http://127.0.0.1:8000/penyakit-jantung/prediksi-knn", data);

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
