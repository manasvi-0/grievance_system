from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
import numpy as np
import pickle
import datetime

app = Flask(__name__)
CORS(app)

# 🔥 Load ML assets
model = load_model("complaint_model (1).keras")
tfidf = pickle.load(open("vectorizers.pkl", "rb"))
label_encoder = pickle.load(open("label_encoder (1).pkl", "rb"))

# 🔥 Department Mapping (VERY IMPORTANT)
DEPT_MAP = {
    "animal control": "Animal Control",
    "bank": "Bank",
    "electricity": "Electricity",
    "environment": "Environment",
    "food": "Food",
    "garbage": "Garbage",
    "health": "Health",
    "housing": "Housing",
    "police": "Police",
    "public transport": "Public Transport",
    "roads": "Roads",
    "sanitation": "Sanitation",
    "water": "Water"
}

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "Backend running",
        "endpoints": ["/predict"]
    })

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    text = data.get("complaint", "").strip()

    if not text:
        return jsonify({"error": "Complaint text missing"}), 400

    # 🧠 Time context
    now = datetime.datetime.now()
    hour = now.hour
    day = now.weekday()

    # 🧠 Transform text
    text_vec = tfidf.transform([text]).toarray()

    # 🧠 Model prediction
    preds = model.predict(
        [text_vec, np.array([[hour, day]])],
        verbose=0
    )

    class_idx = int(np.argmax(preds))
    confidence = float(np.max(preds))

    raw_department = label_encoder.inverse_transform([class_idx])[0]

    # 🔥 Normalize + map
    clean = raw_department.lower().strip()
    department = DEPT_MAP.get(clean, "Other")

    return jsonify({
        "department": department,
        "confidence": round(confidence, 4)
    })

if __name__ == "__main__":
    app.run(debug=True)