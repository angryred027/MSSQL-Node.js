const express = require("express");
const sql = require("mssql");
const cors = require('cors');
const app = express();
const path = require('path');

const server = process.env.SERVER || 'localhost';
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public/images')));

const dbConfig = {
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'android',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'productions',
    options: {
        encrypt: process.env.DB_ENCRYPT === "true",
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === "true",
    },
    port: process.env.DB_PORT || 1433,
};

async function connectToDB() {
    try {
        await sql.connect(dbConfig);
        console.log("Connected to MSSQL database.");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
}

const isValid = (pid) => pid && typeof pid === "string" && pid.trim() !== "";
const isBarcode = (input) => {
    if (typeof input !== "string" || input.length < 6 || input.length > 50) {
        return false;
    }

    const numericPattern = /^\d{6,50}$/;
    const alphanumericPattern = /^[A-Za-z0-9\-\.\$\/\+\%\s]{6,50}$/;
    const codabarPattern = /^[A-D\d\-\$:\/\.\+]{6,50}$/;

    return numericPattern.test(input) || alphanumericPattern.test(input) || codabarPattern.test(input);
}

app.get("/", (req, res) => {
    res.status(200).send("Welcome, Happy to scan Barcode!");
});

app.get("/status", async (req, res) => {
    // try {
    //     const result = await sql.query("SELECT 1 AS status");
    //     if (result.recordset.length > 0) {
    res.status(200).json({ message: "Connected", item_no: "welcome" });
    const ipAddress = req.ip || req.connection.remoteAddress;
    console.log(ipAddress);
    //     } else {
    //         res.status(500).json({ message: "Disconnected" });
    //     }
    // } catch (error) {
    //     res.status(500).json({ message: "Error", error: error.message });
    // }
});

app.get("/api/data", async (req, res) => {
    const { search } = req.query;
    console.log(search);

    if (!isValid(search)) {
        return res.status(400).json({ error: "Invalid Production ID. Please try scanning again!" });
    }
    const data =
    {
        "item_no": "coffee1",
        "description": "MULTI CAFE",
        "category": "Electronics",
        "subcategory": "Mobile Phones",
        "price": 99.99,
        "locations": {
            "1-STM": {
                "min_qty": 5,
                "max_qty": 50,
                "bin": "A1-12",
                "qty_avail": 20,
                "qty_on_hand": 25
            },
            "2-ZEE": {
                "min_qty": 3,
                "max_qty": 30,
                "bin": "B2-10",
                "qty_avail": 15,
                "qty_on_hand": 18
            },
            "WH1": {
                "min_qty": 10,
                "max_qty": 100,
                "bin": "C3-5",
                "qty_avail": 50,
                "qty_on_hand": 55
            }
        }
    }

    res.status(200).json(data);


    // try {
    //     const result = await sql.query(`SELECT * FROM ${dbConfig.database} WHERE pid = ${pid}`);
    //     if (result.recordset.length === 0) {
    //         return res.status(404).json({ message: "No data found for the provided Production ID." });
    //     }
    //     res.status(200).json(result.recordset);
    // } catch (error) {
    //     console.error("Error fetching data:", error.message);
    //     res.status(500).json({ error: "Failed to fetch data. Please try again later." });
    // }
});

app.listen(port, '0.0.0.0', async () => {
    console.log(`Server is running on http://${server}:${port}`);
    // await connectToDB();
});
