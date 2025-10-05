import React, { useState, useEffect } from "react";
import "./PrevDiag.css";
import Popup from "../Popup/Popup";

export default function PrevDiag() {
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [selectedDiag, setSelectedDiag] = useState(null);
  const [diagnoses, setDiagnoses] = useState([]);

  // Load diagnoses from localStorage on component mount
  useEffect(() => {
    const loadDiagnoses = () => {
      try {
        const savedDiagnoses = localStorage.getItem("diagnosisHistory");
        if (savedDiagnoses) {
          const parsedDiagnoses = JSON.parse(savedDiagnoses);
          setDiagnoses(parsedDiagnoses);
        }
      } catch (error) {
        console.error("Error loading diagnoses from localStorage:", error);
      }
    };

    loadDiagnoses();
  }, []);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRiskLevel = (level) => {
    if (!level) return "low";
    const levelLower = level.toLowerCase();
    if (levelLower.includes("high")) return "high";
    if (levelLower.includes("medium")) return "medium";
    return "low";
  };

  const openPopup = (diag) => {
    setSelectedDiag(diag);
    setPopupOpen(true);
  };

  return (
    <div className="prevdiag-container">
      <main className="main">
        <div className="intro">
          <h2 className="title">Past Diagnoses</h2>
          <p className="subtitle">
            Review previous diagnoses for reference and follow-up.
          </p>
        </div>

        {diagnoses.length === 0 ? (
          <div className="empty-state">
            <p>No previous diagnoses found.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {diagnoses.map((diag) => (
              <div key={diag.id} className="diag-card">
                <div className="card-content">
                  <div className="card-top">
                    <div className="patient-info">
                      <p>{formatDate(diag.timestamp)}</p>
                      <p>
                        {diag.patientInfo.gender}, {diag.patientInfo.age} years old
                      </p>
                    </div>
                    <div
                      className={`risk-label ${getRiskLevel(
                        diag.diagnosis.emergency?.level
                      )}`}
                    >
                      <span className="dot"></span>{" "}
                      {getRiskLevel(diag.diagnosis.emergency?.level)
                        .charAt(0)
                        .toUpperCase() +
                        getRiskLevel(diag.diagnosis.emergency?.level).slice(1)}{" "}
                      Risk
                    </div>
                  </div>
                  <h3 className="condition">
                    {diag.patientInfo.symptoms.substring(0, 50)}
                    {diag.patientInfo.symptoms.length > 50 ? "..." : ""}
                  </h3>
                  <button className="details-btn" onClick={() => openPopup(diag)}>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Popup isOpen={isPopupOpen} onClose={() => setPopupOpen(false)}>
        {selectedDiag && (
          <div className="popup-body">
            <h2>Diagnosis Details</h2>
            
            <p><strong>Date:</strong> {formatDate(selectedDiag.timestamp)}</p>
            <p><strong>Patient:</strong> {selectedDiag.patientInfo.gender}, {selectedDiag.patientInfo.age} years old</p>
            <p><strong>Symptoms:</strong> {selectedDiag.patientInfo.symptoms}</p>
            
            <p style={{ marginTop: '16px' }}><strong>Possible Conditions:</strong></p>
            <p>{selectedDiag.diagnosis.possible_conditions}</p>
            
            <p style={{ marginTop: '16px' }}><strong>Immediate Next Steps:</strong></p>
            <p>{selectedDiag.diagnosis.immediate_next_steps}</p>
            
            <p style={{ marginTop: '16px' }}><strong>Emergency Level:</strong> {selectedDiag.diagnosis.emergency?.level}</p>
            
            <p style={{ marginTop: '16px' }}><strong>Family Instructions:</strong></p>
            <p>{selectedDiag.diagnosis.family_instructions}</p>
          </div>
        )}
      </Popup>

      <footer className="footer">
        © 2025 MedMate. Your AI Healthcare Buddy.
      </footer>
    </div>
  );
}
