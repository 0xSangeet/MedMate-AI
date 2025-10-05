import React, { useState, useEffect } from "react";
import "./PatientInput.css";
import mic from "../../assets/mic12.png";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export default function PatientInput() {
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  
  // API response state
  const [diagnosisData, setDiagnosisData] = useState(null);
  
  // Speech recognition hook
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Initialize localStorage array on component mount
  useEffect(() => {
    const savedDiagnoses = localStorage.getItem("diagnosisHistory");
    if (!savedDiagnoses) {
      localStorage.setItem("diagnosisHistory", JSON.stringify([]));
    }
  }, []);

  // Update symptoms when transcript changes
  useEffect(() => {
    if (transcript) {
      setSymptoms(transcript);
    }
  }, [transcript]);

  const toggleListening = () => {
    if (!browserSupportsSpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
      setError(null);
    }
  };

  const saveDiagnosisToHistory = (diagnosis, patientInfo) => {
    try {
      const existingHistory = JSON.parse(
        localStorage.getItem("diagnosisHistory") || "[]"
      );

      const newDiagnosis = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        patientInfo: {
          symptoms: patientInfo.symptoms,
          age: patientInfo.age || "Not specified",
          gender: patientInfo.gender || "Not specified",
        },
        diagnosis: diagnosis,
      };

      const updatedHistory = [newDiagnosis, ...existingHistory];
      localStorage.setItem("diagnosisHistory", JSON.stringify(updatedHistory));

      console.log("Diagnosis saved to history");
    } catch (err) {
      console.error("Error saving diagnosis to localStorage:", err);
    }
  };

  const handleGenerate = async () => {
    if (!symptoms.trim()) {
      setError("Please enter patient symptoms");
      return;
    }

    // Stop listening if active
    if (listening) {
      SpeechRecognition.stopListening();
    }

    setLoading(true);
    setError(null);
    setShowDiagnosis(false);

    try {
      const response = await fetch("http://127.0.0.1:7000/diagnosis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: symptoms,
          age: age || null,
          gender: gender || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setDiagnosisData(data);
      setShowDiagnosis(true);

      saveDiagnosisToHistory(data, {
        symptoms: symptoms,
        age: age,
        gender: gender,
      });
    } catch (err) {
      setError(err.message || "Failed to generate diagnosis. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getEmergencyStatus = (level) => {
    const levelLower = level?.toLowerCase() || "";
    if (levelLower.includes("high")) {
      return { color: "red", label: "High Risk" };
    } else if (levelLower.includes("medium")) {
      return { color: "yellow", label: "Medium Risk" };
    } else {
      return { color: "green", label: "Low Risk" };
    }
  };

  return (
    <div className="app">
      <main className="main">
        <div className="container">
          <h2 className="title">New Diagnosis</h2>

          <div className="card">
            <h3>Patient Information</h3>
            <div className="input-section">
              <div className="textarea-wrapper">
                <textarea
                  id="symptoms"
                  name="symptoms"
                  placeholder="Describe patient symptoms, history, and observations..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                ></textarea>
                <button 
                  className={`mic-btn ${listening ? "listening" : ""} ${!browserSupportsSpeechRecognition ? "disabled" : ""}`}
                  onClick={toggleListening}
                  disabled={!browserSupportsSpeechRecognition}
                  title={
                    !browserSupportsSpeechRecognition 
                      ? "Speech recognition not supported in this browser" 
                      : listening 
                      ? "Stop recording" 
                      : "Start recording"
                  }
                >
                  <img src={mic} className="mic" alt="Voice input" />
                </button>
              </div>
              {listening && (
                <p className="listening-indicator">Listening...</p>
              )}
              <div className="input-grid">
                <input
                  type="number"
                  placeholder="Age (optional)"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Gender (optional)"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Diagnosis"}
          </button>

          {showDiagnosis && diagnosisData && (
            <div className="card">
              <h3>AI-Generated Diagnosis</h3>
              <div className="output-section">
                <div className="output-box">
                  <p className="label">Possible Conditions</p>
                  <p>{diagnosisData.possible_conditions}</p>
                </div>

                <div className="output-box urgent">
                  <p className="urgent-title">Immediate Next Steps</p>
                  <p>{diagnosisData.immediate_next_steps}</p>
                </div>

                <div className="output-box">
                  <div className="flex-between">
                    <p className="label">Emergency Level</p>
                    <div className="status">
                      <div
                        className={`traffic-light ${
                          getEmergencyStatus(diagnosisData.emergency?.level).color
                        }`}
                      ></div>
                      <span className="status-text">
                        {getEmergencyStatus(diagnosisData.emergency?.level).label}
                      </span>
                    </div>
                  </div>
                  <p>{diagnosisData.emergency?.basic_info}</p>
                </div>

                <div className="output-box">
                  <div className="flex-between">
                    <p className="label">Family Instructions</p>
                    <div className="lang-switch">
                      <button className="active">English</button>
                      
                    </div>
                  </div>
                  <p>{diagnosisData.family_instructions}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
