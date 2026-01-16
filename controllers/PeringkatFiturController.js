import axios from "axios";

export const getPeringkatFitur = async (req, res) => {
    try {
        const response = await axios.get("http://127.0.0.1:8000/penyakit-jantung/model-klasifikasi/peringkat-fitur");

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
