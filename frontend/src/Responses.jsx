import { useState, useEffect } from "react";
import "./Responses.css";
import { useShakeDetection } from "./useShakeDetection";
import config from './config';

function Responses() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const isShaking = useShakeDetection(20);
  const [isBroken, setIsBroken] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isShaking && !isBroken) {
      setIsBroken(true);
    }
  }, [isShaking, isBroken]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/guests`);
      const guests = await res.json();
      setData(guests);
      setLoading(false);
    } catch (err) {
      console.error("Erreur:", err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="responses-container">Chargement...</div>;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="responses-container">
      <h1>
        <span className={isBroken ? 'falling' : ''}>Réponses</span>
        {' '}<span className={isBroken ? 'falling' : ''}>individuelles</span>
      </h1>
      <p className="total-count">
        {data.length} <span className={isBroken ? 'falling' : ''}>réponse(s)</span> enregistrée(s)
      </p>

      {data.length === 0 ? (
        <div className="empty-state">Aucune réponse pour le moment</div>
      ) : (
        <div className="responses-list">
          {data.map((guest, index) => (
            <div key={guest._id} className="response-card">
              <div className="response-header">
                <span className="response-number">
                  <span className={isBroken ? 'falling' : ''}>Réponse</span> #{data.length - index}
                </span>
                <span className="response-date">{formatDate(guest.createdAt)}</span>
              </div>

              <div className="response-content">
                {guest.name && guest.name.trim() !== "" && (
                  <div className="response-field">
                    <strong><span className={isBroken ? 'falling' : ''}>Nom</span> :</strong>
                    <p>{guest.name}</p>
                  </div>
                )}

                {guest.allergiesAndDiet && guest.allergiesAndDiet.trim() !== "" && (
                  <div className="response-field">
                    <strong>
                      <span className={isBroken ? 'falling' : ''}>Allergies</span> / Régime :
                    </strong>
                    <p>{guest.allergiesAndDiet}</p>
                  </div>
                )}

                <div className="response-field">
                  <strong><span className={isBroken ? 'falling' : ''}>Hébergement</span> :</strong>
                  <p>{guest.needsAccommodation ? "Oui, besoin d'un hébergement" : "Non"}</p>
                </div>

                {guest.availableDays && guest.availableDays.length > 0 && (
                  <div className="response-field">
                    <strong>
                      <span className={isBroken ? 'falling' : ''}>Jours</span> disponibles :
                    </strong>
                    <div className="tags">
                      {guest.availableDays.map((day, idx) => (
                        <span key={idx} className="tag tag-day">{day}</span>
                      ))}
                    </div>
                  </div>
                )}

                {guest.availableTime && guest.availableTime.length > 0 && (
                  <div className="response-field">
                    <strong>
                      <span className={isBroken ? 'falling' : ''}>Horaires</span> disponibles :
                    </strong>
                    <div className="tags">
                      {guest.availableTime.map((time, idx) => (
                        <span key={idx} className="tag tag-time">{time}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="nav-buttons">
        <button className="nav-btn" onClick={() => window.location.href = "/"}>
          <span className={isBroken ? 'falling' : ''}>Formulaire</span>
        </button>
        <button className="nav-btn" onClick={() => window.location.href = "/dashboard"}>
          <span className={isBroken ? 'falling' : ''}>Statistiques</span>
        </button>
      </div>
    </div>
  );
}

export default Responses;
