import React, { useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";
const MARATHI_MONTHS = [
  "जानेवारी",
  "फेब्रुवारी",
  "मार्च",
  "एप्रिल",
  "मे",
  "जून",
  "जुलै",
  "ऑगस्ट",
  "सप्टेंबर",
  "ऑक्टोबर",
  "नोव्हेंबर",
  "डिसेंबर",
];
const MARATHI_NUMS = (n) => String(n).replace(/[0-9]/g, (d) => "०१२३४५६७८९"[d]);

const TITHIS = [
  "शुक्ल-प्रतिपदा",
  "शुक्ल-द्वितीया",
  "शुक्ल-तृतीया",
  "शुक्ल-चतुर्थी",
  "शुक्ल-पंचमी",
  "शुक्ल-षष्ठी",
  "शुक्ल-सप्तमी",
  "शुक्ल-अष्टमी",
  "शुक्ल-नवमी",
  "शुक्ल-दशमी",
  "शुक्ल-एकादशी",
  "शुक्ल-द्वादशी",
  "शुक्ल-त्रयोदशी",
  "शुक्ल-चतुर्दशी",
  "पौर्णिमा",
  "कृष्ण-प्रतिपदा",
  "कृष्ण-द्वितीया",
  "कृष्ण-तृतीया",
  "कृष्ण-चतुर्थी",
  "कृष्ण-पंचमी",
  "कृष्ण-षष्ठी",
  "कृष्ण-सप्तमी",
  "कृष्ण-अष्टमी",
  "कृष्ण-नवमी",
  "कृष्ण-दशमी",
  "कृष्ण-एकादशी",
  "कृष्ण-द्वादशी",
  "कृष्ण-त्रयोदशी",
  "कृष्ण-चतुर्दशी",
  "अमावास्या",
];
const NAKSHATRAS = [
  "अश्विनी",
  "भरणी",
  "कृत्तिका",
  "रोहिणी",
  "मृगशीर्ष",
  "आर्द्रा",
  "पुनर्वसू",
  "पुष्य",
  "आश्लेषा",
  "मघा",
  "पूर्वा-फाल्गुनी",
  "उत्तरा-फाल्गुनी",
  "हस्त",
  "चित्रा",
  "स्वाती",
  "विशाखा",
  "अनुराधा",
  "ज्येष्ठा",
  "मूळ",
  "पूर्वाषाढा",
  "उत्तराषाढा",
  "श्रवण",
  "धनिष्ठा",
  "शततारका",
  "पूर्वा भाद्रपदा",
  "उत्तरा भाद्रपदा",
  "रेवती",
];

const HAWAN_LIST = {
  "जननशांती तिथी": ["कृष्णचतुर्दशी", "अमावास्या", "क्षयतिथि"],
  "जननशांती नक्षत्रे": [
    "अश्विनी-पहिली ४८ मिनिटे",
    "पुष्य-दुसरा व तिसरा चरण",
    "आश्लेषा-पूर्ण",
    "मघा-प्रथम चरण",
    "उत्तराफाल्गुनी-प्रथम चरण",
    "चित्रा-पूर्वार्ध",
    "विशाखा-चतुर्थ चरण",
    "ज्येष्ठा-पूर्ण",
    "मूळ-पूर्ण",
    "पूर्वाषाढा-तिसरा चरण",
    "रेवती-शेवटची ४८ मिनिटे",
  ],
  "इतर कारणे": [
    "ग्रहण पर्वकाळात जन्म",
    "यमल (जुळे) जन्म",
    "सदंत जन्म",
    "अधोमुख जन्म",
    "तीन मुलींनंतर मुलगा जन्म",
    "तीन मुलांनंतर मुलगी जन्म",
    "मृत्युयोग",
  ],
};
const textToImage = (text, fontSize, fontName) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  ctx.font = `bold ${fontSize * 1.78}px "${fontName}", serif`;

  const metrics = ctx.measureText(text);
  canvas.width = metrics.width;
  canvas.height = fontSize * 3;

  ctx.font = `bold ${fontSize * 1.78}px "${fontName}", serif`;
  ctx.fillStyle = "#000000ff";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, canvas.height / 2);

  return canvas.toDataURL("image/png");
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [auth, setAuth] = useState({ user: "", pass: "" });
  const [formData, setFormData] = useState({
    name: "",
    day: "१",
    month: "जानेवारी",
    year: "२०२६",
    tithi: "",
    nakshatra: "",
    hawan: [],
    comments: "",
    customItems: [],
    currentInput: "",
  });

  const handleGeneratePdf = async () => {
    try {
      const existingPdfBytes = await fetch("/template.pdf").then((res) =>
        res.arrayBuffer()
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const page = pdfDoc.getPages()[0];
      const drawMarathi = async (text, x, y, size) => {
        if (!text) return;
        const imgUri = textToImage(text, size, "Martel");
        const imgBytes = await fetch(imgUri).then((res) => res.arrayBuffer());
        const embeddedImg = await pdfDoc.embedPng(imgBytes);
        const imgDims = embeddedImg.scale(0.5);
        page.drawImage(embeddedImg, {
          x,
          y: y - imgDims.height / 4,
          width: imgDims.width,
          height: imgDims.height,
        });
      };
      await drawMarathi(formData.name, 98, 449, 15);
      await drawMarathi(
        `${formData.day} ${formData.month} ${formData.year}`,
        98,
        424,
        15
      );
      await drawMarathi(formData.nakshatra, 309, 449, 15);
      await drawMarathi(formData.tithi, 309, 424, 15);
      let yPos = 340;
      const finalHawanList = [...formData.hawan, ...formData.customItems];
      if (formData.currentInput.trim() !== "") {
        finalHawanList.push(formData.currentInput.trim());
      }
      for (const item of finalHawanList) {
        await drawMarathi(`• ${item}`, 145, yPos, 13);
        yPos -= 25;
      }
      await drawMarathi(`टिप्पणी: ${formData.comments}`, 50, 98, 12);
      const pdfBytes = await pdfDoc.save();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(
        new Blob([pdfBytes], { type: "application/pdf" })
      );
      link.download = `Jyotish_Patrika_${formData.name || "Patrika"}.pdf`;
      link.click();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (!isLoggedIn) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#fdfaf6",
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (
              auth.user === import.meta.env.VITE_USERNAME &&
              auth.pass === import.meta.env.VITE_PASSWORD
            )
              setIsLoggedIn(true);
            else alert("Invalid Login");
          }}
          style={{
            background: "white",
            padding: "40px",
            border: "2px solid #5d4037",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ color: "#5d4037", textAlign: "center" }}>|| श्री ||</h2>
          <input
            type="text"
            placeholder="Username"
            style={{
              display: "block",
              margin: "10px 0",
              padding: "10px",
              width: "100%",
            }}
            onChange={(e) => setAuth({ ...auth, user: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            style={{
              display: "block",
              margin: "10px 0",
              padding: "10px",
              width: "100%",
            }}
            onChange={(e) => setAuth({ ...auth, pass: e.target.value })}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              background: "#5d4037",
              color: "white",
              padding: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            प्रवेश करा
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#fdfaf6",
        minHeight: "100vh",
        color: "#5d4037",
        fontFamily: "serif",
      }}
    >
      <header
        style={{
          textAlign: "center",
          borderBottom: "2px solid #5d4037",
          marginBottom: "30px",
        }}
      >
        <h1>|| श्री ||</h1>
        <h1>|| दत्त अवधुत ज्योतिषालय ||</h1>
        <h3>वेदमूर्ती राजेश लक्ष्मण जोशी गुरुजी</h3>
      </header>

      <div
        style={{
          maxWidth: "850px",
          margin: "auto",
          background: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div>
            <label>नाव:</label>
            <input
              type="text"
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                border: "1px solid #d7ccc8",
              }}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <label>जन्मतारीख:</label>
            <br />
            <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
              <select
                style={{ padding: "8px" }}
                onChange={(e) =>
                  setFormData({ ...formData, day: e.target.value })
                }
              >
                {[...Array(31)].map((_, i) => (
                  <option key={i} value={MARATHI_NUMS(i + 1)}>
                    {MARATHI_NUMS(i + 1)}
                  </option>
                ))}
              </select>
              <select
                style={{ padding: "8px" }}
                onChange={(e) =>
                  setFormData({ ...formData, month: e.target.value })
                }
              >
                {MARATHI_MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                style={{ padding: "8px" }}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
              >
                {[...Array(100)].map((_, i) => (
                  <option key={i} value={MARATHI_NUMS(1950 + i)}>
                    {MARATHI_NUMS(1950 + i)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label>तिथी:</label>
            <select
              style={{ width: "100%", padding: "10px", marginTop: "5px" }}
              onChange={(e) =>
                setFormData({ ...formData, tithi: e.target.value })
              }
            >
              <option value="">निवडा</option>
              {TITHIS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>नक्षत्र:</label>
            <select
              style={{ width: "100%", padding: "10px", marginTop: "5px" }}
              onChange={(e) =>
                setFormData({ ...formData, nakshatra: e.target.value })
              }
            >
              <option value="">निवडा</option>
              {NAKSHATRAS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            marginTop: "25px",
            border: "1px solid #d7ccc8",
            padding: "15px",
            borderRadius: "5px",
          }}
        >
          <label>
            <strong>विशेष हवन निवडा:</strong>
          </label>
          <div
            style={{
              maxHeight: "250px",
              overflowY: "auto",
              marginTop: "10px",
              paddingRight: "10px",
            }}
          >
            {Object.entries(HAWAN_LIST).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: "15px" }}>
                <p
                  style={{
                    fontWeight: "bold",
                    color: "#795548",
                    textDecoration: "underline",
                  }}
                >
                  {cat}
                </p>
                {items.map((i) => (
                  <label
                    key={i}
                    style={{
                      display: "block",
                      margin: "5px 0",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{ marginRight: "10px" }}
                      onChange={() =>
                        setFormData((p) => ({
                          ...p,
                          hawan: p.hawan.includes(i)
                            ? p.hawan.filter((x) => x !== i)
                            : [...p.hawan, i],
                        }))
                      }
                    />{" "}
                    {i}
                  </label>
                ))}
              </div>
            ))}
          </div>
          <input
            placeholder="इतर काही असल्यास लिहून एंटर दाबा..."
            value={formData.currentInput}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              border: "1px dashed #d7ccc8",
            }}
            onChange={(e) =>
              setFormData({ ...formData, currentInput: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value) {
                setFormData((p) => ({
                  ...p,
                  customItems: [...p.customItems, e.target.value],
                  currentInput: "",
                }));
                e.preventDefault();
              }
            }}
          />
          {formData.customItems.length > 0 && (
            <div style={{ fontSize: "12px", marginTop: "5px" }}>
              जास्तीचे: {formData.customItems.join(", ")}
            </div>
          )}
        </div>

        <div style={{ marginTop: "20px" }}>
          <label>टिप्पणी:</label>
          <textarea
            style={{
              width: "100%",
              height: "80px",
              marginTop: "5px",
              padding: "10px",
            }}
            onChange={(e) =>
              setFormData({ ...formData, comments: e.target.value })
            }
          />
        </div>

        <div style={{ marginTop: "20px", display: "flex", gap: "20px" }}>
          <button
            onClick={handleGeneratePdf}
            style={{
              flex: 1,
              background: "#5d4037",
              color: "white",
              padding: "15px",
              border: "none",
              cursor: "pointer",
              borderRadius: "5px",
              fontWeight: "bold",
            }}
          >
            PDF डाउनलोड करा
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "15px",
              background: "white",
              border: "1px solid #5d4037",
              color: "#5d4037",
              cursor: "pointer",
              borderRadius: "5px",
            }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
