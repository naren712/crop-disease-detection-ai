import { useState, useRef , useEffect } from "react";
import "./App.css";

function App() {

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const resultRef = useRef(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  const [language, setLanguage] = useState("en"); // en / ta
  const [translatedAnswer, setTranslatedAnswer] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [error, setError] = useState("");
  const [selectedCrop, setSelectedCrop] = useState(null);

  const getVoice = (lang) => {
  const voices = window.speechSynthesis.getVoices();

  if (lang === "ta") {
    return voices.find(v => v.lang.includes("ta")) || voices[0];
  } else {
    return voices.find(v => v.lang.includes("en")) || voices[0];
  }
};
//voice load aaga
useEffect(() => {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}, []);


  const handleCropClick = (crop) => {
  if (selectedCrop === crop) {
    setSelectedCrop(null); // close
  } else {
    setSelectedCrop(crop); // open
  }
};


const translateText = async (text, lang) => {
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await res.json();
    return data[0].map(item => item[0]).join("");
  } catch {
    return text;
  }
};

//translation button logic 
const handleLanguageToggle = async () => {
  const text = getFullAnswer();   //imp
  if (!text) return;

  if (language === "en") {
    const tamil = await translateText(text, "ta");
    setTranslatedAnswer(tamil);
    setLanguage("ta");
  } else {
    setLanguage("en");
    setTranslatedAnswer("");       //reset
  }
};


const getFullAnswer = () => {
  if (answer) return answer;

  if (result) {
    return `
Disease: ${result.prediction}
Solution: ${result.solution?.join(", ")}
Prevention: ${result.prevention?.join(", ")}
`;
  }

  return "";
};


//txt-speech
const speakText = () => {

  // STOP if already speaking
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    return;
  }

  const text = finalAnswer; // FULL answer (ask + image)

  if (!text) return;

  const speech = new SpeechSynthesisUtterance(text);

  // language set
  speech.lang = language === "ta" ? "ta-IN" : "en-US";

  // voice fix
  speech.voice = getVoice(language);

  speech.rate = 1;
  speech.pitch = 1;

  speech.onend = () => setIsSpeaking(false);

  window.speechSynthesis.speak(speech);
  setIsSpeaking(true);
};

const finalAnswer =
  language === "ta" && translatedAnswer
    ? translatedAnswer
    : getFullAnswer();


const formatAnswer = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // bold convert
    .replace(/\n/g, "<br/>"); // new line
};


const cropData = {
  corn: {
    name: "Corn",
    scientific: "Zea mays",
    image: "https://media.istockphoto.com/id/1133692494/photo/corn-cob-with-green-leaves-growth-in-agriculture-field-outdoor.jpg?s=612x612&w=0&k=20&c=xFYeDDO46cJ73fXEvqt0NFV6mSugjXoDAxdBNqno9Ac=",
    details:
      "Corn is a cereal plant widely grown for food, fodder, and industrial uses. It requires warm climate and well-drained soil. Season: June - July (Aadi Pattam), Nov - Dec (Karthigai Pattam), Jan – Feb (Thai pattam), April – May (Chittirai pattam) Rainfed: Sep - Oct (Puratassi Pattam)",
    diseases: ["Rust", "Leaf Spot", "Blight"]
  },
  tomato: {
    name: "Tomato",
    scientific: "Solanum lycopersicum",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg",
     details:
      "Tomato is a popular vegetable crop rich in vitamins. It grows well in moderate climate and requires regular watering.Well drained loamy soils rich in organic matter with a pH range of 6.5 - 7.5.Season May - June and November – December",
    diseases: ["Early Blight", "Late Blight", "Bacterial Spot","Leaf curl","Bacterial wilt","Furassium wilt","powdery mildew"]
    
  },
  peach: {
    name: "Peach",
    scientific: "Prunus persica  Rosaceae",
    image: "https://cdn.pixabay.com/photo/2022/08/09/07/28/fruits-7374361_1280.jpg",
    details:
      "Peach is a nutritious fruit crop rich in vitamins A and C,In April – May early season varieties like Killikrankie and Floridasun are suited for cultivation. Mid-season varieties like Shaw Pasand are suited for planting during June – July. However, Red Shanghai variety can be best planted during July – August",
    diseases: ["brown rot","Bacterial spots"]
  },
  brinjal: {
    name: "Brinjal",
    scientific: "Solanum melongena L Solanaceae",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC3nHWOAgAU2zpeUD4BAuJl4K_lxt1P0F0Fg&s",
    details:
      "Brinjal is a popular vegetable crop rich in fiber and Antioxidants, Season: December-january and May-june,Soil-type:Well drained loamy soil",
    diseases: ["Bacterial wilt","cercospora leaf spot","Damping off","Mosaic virus"]
  },
  grapes: {
  name: "Grapes",
  scientific: "Vitis vinifera",
  image: "https://www.shutterstock.com/image-photo/red-grapes-hanging-on-vine-600nw-2475929273.jpg",
  details:
    "Grapes are fruit crops grown in warm climates for fresh consumption and wine production. They require well-drained soil and good sunlight. Season: Dec - Jan planting, harvest after 4–6 months depending on variety.",
  diseases: ["Black Rot", "Downy Mildew", "Leaf Blight"]
},

rice: {
  name: "Rice",
  scientific: "Oryza sativa",
  image: "https://m.media-amazon.com/images/I/71OKZExBnkL._AC_UF1000,1000_QL80_.jpg",
  details:
    "Rice is a staple food crop grown in waterlogged fields. It requires high humidity and warm climate. Season: June - July (Kuruvai), Aug - Sep (Samba), Jan - Feb (Navarai).",
  diseases: ["Blast", "Bacterial Leaf Blight", "Brown Spot"]
},

sugarcane: {
  name: "Sugarcane",
  scientific: "Saccharum officinarum",
  image: "https://static.wixstatic.com/media/6e2303_4f8371354e4841ea9b2e392c0ff76c4e~mv2.webp/v1/fill/w_568,h_366,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/6e2303_4f8371354e4841ea9b2e392c0ff76c4e~mv2.webp",
  details:
    "Sugarcane is a tropical crop used for sugar production. It needs plenty of sunlight, water, and fertile soil. Season: Jan - March (planting), harvest after 10–12 months.",
  diseases: ["Red Rot", "Smut", "Wilt"]
},

potato: {
  name: "Potato",
  scientific: "Solanum tuberosum",
  image: "https://static.vecteezy.com/system/resources/thumbnails/058/178/528/small/fresh-potatoes-growing-in-a-fertile-field-under-sunlight-photo.jpg",
  details:
    "Potato is a tuber crop grown in cool climates. It requires well-drained soil and moderate temperature. Season: Oct - Nov (Rabi), June - July (Kharif in hills).",
  diseases: ["Early Blight", "Late Blight", "Black Scurf"]
}

};


const askQuestion = async () => {

  if (!question) {
    alert("Enter question!");
    return;
  }

  setLoadingAnswer(true);
  setError("");
  setAnswer("");

  try {
    const res = await fetch("http://127.0.0.1:8000/api/ask/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    const data = await res.json();

    if (data.answer) {
      setAnswer(data.answer);
    } else {
      setError("No answer found. Try again.");
    }

  } catch (err) {
    setError("Server error. Try again.");
  }

  setLoadingAnswer(false);
};

  // Severity Logic
  const getSeverity = (disease, confidence) => {

  if (disease.toLowerCase().includes("healthy")) {
    return { level: "None", color: "green" };
  }

  if (confidence > 85) return { level: "High", color: "red" };
  if (confidence > 60) return { level: "Medium", color: "orange" };
  return { level: "Low", color: "yellow" };
};

 //uploadImg function
const uploadImage = async () => {

    if (!image) {
      alert("Upload leaf image!");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/predict/", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      setResult(data);
      setHistory(prev => [data, ...prev]);

      //  AUTO SCROLL
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);

    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }

    setLoading(false);
  };

//return

  return (
    <div className="dashboard">

      <h1>🌿 Crop Disease Detection </h1>

      <div style={{ marginBottom: "10px" }}>
  <button onClick={handleLanguageToggle}>
    🌐 {language === "en" ? "Tamil" : "English"}
  </button>

  <button onClick={speakText} style={{ marginLeft: "10px" }}>
    {isSpeaking ? "⏹ Stop" : "🔊 Speak"}
  </button>
</div>


      <div className="upload-section">
        <label className="upload-box">
        
        {preview ? (
        <img src={preview} alt="preview" className="preview-img" />
      ) : (
      <div className="plus">+</div>
      )}
      
      <input
      type="file"
      hidden
      onChange={(e) => {
        const file = e.target.files[0];
        setImage(file);
        
        if (file) {
          setPreview(URL.createObjectURL(file));
        }
      }}
      />
      </label>
      <p className="choose-text">Choose File</p>
      
      <button onClick={uploadImage}>
        {loading ? "Analyzing..." : "Analyze Crop"}
        </button>
        </div>

        
        <hr></hr>
        <h2>Crop Info</h2>
        
        <div className="crop-buttons ">
          <button onClick={() => handleCropClick("corn")}><span>🌽</span> Corn</button>
          <button onClick={() => handleCropClick("tomato")}><span>🍅</span> Tomato</button>
          <button onClick={() => handleCropClick("peach")}><span>🍑</span> Peach</button>
          <button onClick={() => handleCropClick("brinjal")}><span>🍆</span> Brinjal</button>
          <button onClick={() => handleCropClick("grapes")}><span>🍇</span> Grapes</button>
          <button onClick={() => handleCropClick("rice")}><span>🌾</span> Rice</button>
          <button onClick={() => handleCropClick("sugarcane")}><span>🎋</span>  Sugarcane</button>
          <button onClick={() => handleCropClick("potato")}><span>🥔</span> Potato</button>
          </div>

          {selectedCrop && cropData[selectedCrop] &&(
  <div className="crop-card">


     <h2><center>{cropData[selectedCrop].name}</center></h2>

    <img
      src={cropData[selectedCrop].image}
      alt={selectedCrop}
      className="crop-img"
    />

    <p>
      <strong>Scientific Name:</strong>{" "}
      {cropData[selectedCrop].scientific}
    </p>

    <p>{cropData[selectedCrop].details}</p>

    <h4>Common Diseases:</h4>
    <ul>
      {cropData[selectedCrop].diseases.map((d, i) => (
        <li key={i}>{d}</li>
      ))}
    </ul>

  </div>
)}
<hr></hr>

      <h2>Ask Questions</h2>

<div className="ask-box">
  <input
    type="text"
    placeholder="Ask about crops..."
    value={question}
    onChange={(e) => setQuestion(e.target.value)}
  />

  <button onClick={askQuestion} disabled={loadingAnswer}>
   {loadingAnswer ? "..." : "Ask"}
  </button>
</div>

{/* LOADING */}
{loadingAnswer && (
  <div className="answer-box loading">
    ⏳ Thinking...
  </div>
)}

{/* ERROR */}
{error && (
  <div className="answer-box error">
    {error}
  </div>
)}

{/* ANSWER */}
{answer && (
  <div className="answer-box">
    <h4>Answer:</h4>
    <p dangerouslySetInnerHTML={{ __html: formatAnswer(finalAnswer) }}></p>
  </div>
)}


      {/* RESULT SECTION */}
      {result && (
        <div ref={resultRef} className="result-card">

          <h2>Disease: {result.prediction}</h2>

          <p>
            Confidence: {(result.confidence ).toFixed(2)}%
          </p>


          {(() => {
            const severity = getSeverity(result.prediction,result.confidence);
            return (
              <span
                className="severity-badge"
                style={{ backgroundColor: severity.color }}
              >
                Severity: {severity.level}
              </span>
            );
          })()}

          {/* Solution */}
          {result.solution && (
            <>
              <h3>Solution</h3>
              <ul>
                {result.solution.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </>
          )}

          {/* Prevention */}
          {result.prevention && (
            <>
              <h3>Prevention</h3>
              <ul>
                {result.prevention.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </>
          )}

        </div>
      )}

      {/* HISTORY SECTION */}
      {history.length > 0 && (
        <div className="history-section">
<hr></hr>
          <h2>Detection History</h2>

          {history.map((item, index) => (
            <div key={index} className="history-card">
              <strong>{item.prediction}</strong>
              <span>
                {(item.confidence ).toFixed(1)}%
              </span>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}


export default App;
