import { useState, useEffect } from "react";
import "./App.css";
import { useShakeDetection } from "./useShakeDetection";
import config from "./config";

// Août 2026 commence un samedi (index 6 en lun=0)
const AUGUST_2026_START_DAY = 5; // 0=Lun, ..., 5=Sam
const DAYS_IN_AUGUST = 31;
const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function App() {
  const [formData, setFormData] = useState({
    name: "",
    allergiesAndDiet: "",
    needsAccommodation: false,
    availableDays: [],
    availableTime: [],
  });
  const [status, setStatus] = useState(null);
  const [experimentalEnabled, setExperimentalEnabled] = useState(() => {
    return localStorage.getItem("experimental") === "true";
  });
  const isShaking = useShakeDetection(experimentalEnabled);
  const [isBroken, setIsBroken] = useState(false);

  const toggleExperimental = () => {
    setExperimentalEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("experimental", String(next));
      if (!next) setIsBroken(false);
      return next;
    });
  };

  useEffect(() => {
    if (isShaking && !isBroken && experimentalEnabled) {
      setIsBroken(true);
    }
  }, [isShaking, isBroken, experimentalEnabled]);

  const toggleDay = (day) => {
    setFormData((prev) => {
      const days = prev.availableDays;
      if (days.includes(day)) {
        return { ...prev, availableDays: days.filter((d) => d !== day) };
      } else {
        return { ...prev, availableDays: [...days, day].sort((a, b) => a - b) };
      }
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox" && name === "availableTime") {
      setFormData((prev) => {
        const currentArray = prev[name];
        if (checked) {
          return { ...prev, [name]: [...currentArray, value] };
        } else {
          return { ...prev, [name]: currentArray.filter(item => item !== value) };
        }
      });
    } else if (name === "needsAccommodation") {
      setFormData((prev) => ({ ...prev, needsAccommodation: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Génère les cellules du calendrier août 2026
  const renderCalendar = () => {
    const cells = [];
    // Cases vides avant le 1er août (samedi = index 5)
    for (let i = 0; i < AUGUST_2026_START_DAY; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-cell empty" />);
    }
    // Jours du mois
    for (let day = 1; day <= DAYS_IN_AUGUST; day++) {
      const isSelected = formData.availableDays.includes(day);
      const dayIndex = (AUGUST_2026_START_DAY + day - 1) % 7;
      const isWeekend = dayIndex === 5 || dayIndex === 6; // Sam ou Dim
      cells.push(
        <div
          key={day}
          className={`calendar-cell${isSelected ? " selected" : ""}${isWeekend ? " weekend" : ""}`}
          onClick={() => toggleDay(day)}
        >
          {day}
        </div>
      );
    }
    return cells;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    // Validation : au moins un champ doit être rempli
    const hasName = formData.name.trim() !== "";
    const hasAllergies = formData.allergiesAndDiet.trim() !== "";
    const hasAccommodation = formData.needsAccommodation;
    const hasDays = formData.availableDays.length > 0;
    const hasTime = formData.availableTime.length > 0;

    if (!hasName && !hasAllergies && !hasAccommodation && !hasDays && !hasTime) {
      setStatus("empty");
      return;
    }

    try {
      const res = await fetch(`${config.API_BASE_URL}/api/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erreur serveur");

      setStatus("success");
      setFormData({
        name: "",
        allergiesAndDiet: "",
        needsAccommodation: false,
        availableDays: [],
        availableTime: [],
      });
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="container">
      <h1>
        <span className={isBroken ? 'falling' : ''}>Réponse</span>
        {' '}anonyme{' '}
        <span className={isBroken ? 'falling' : ''}>ou</span>
        {' '}pas{' '}
        <span className={isBroken ? 'falling' : ''}>c'est</span>
        {' '}vous{' '}
        <span className={isBroken ? 'falling' : ''}>qui</span>
        {' '}voyez
      </h1>

      {status === "success" && (
        <div className="alert success">Réponse enregistrée !</div>
      )}
      {status === "error" && (
        <div className="alert error">Une erreur est survenue.</div>
      )}
      {status === "empty" && (
        <div className="alert error">Veuillez remplir au moins un champ.</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">
            <span className={isBroken ? 'falling' : ''}>Nom</span>
            {' '}(optionnel)
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Votre nom ou prénom"
            className={isBroken ? 'falling' : ''}
          />
        </div>

        <div className="field">
          <label htmlFor="allergiesAndDiet">
            Allergies{' '}
            <span className={isBroken ? 'falling' : ''}>et</span>
            {' '}régime{' '}
            <span className={isBroken ? 'falling' : ''}>alimentaire</span>
          </label>
          <textarea
            id="allergiesAndDiet"
            name="allergiesAndDiet"
            value={formData.allergiesAndDiet}
            onChange={handleChange}
            placeholder="Mentionnez vos allergies, intolérances et régime spécifique (végé, vegan, halal, sans gluten...)"
            rows={3}
            className={isBroken ? 'falling' : ''}
          />
        </div>

        <div className="field checkbox-field">
          <label htmlFor="needsAccommodation">
            <input
              type="checkbox"
              id="needsAccommodation"
              name="needsAccommodation"
              checked={formData.needsAccommodation}
              onChange={handleChange}
              className={isBroken ? 'falling' : ''}
            />
            <span>Besoin{' '}</span>
            <span className={isBroken ? 'falling' : ''}>d'un</span>
            {' '}hébergement
          </label>
        </div>

        <div className="field">
          <label>
            <span className={isBroken ? 'falling' : ''}>Disponibilité</span>
            {' '}- Août 2026
          </label>
          <div className="calendar">
            <div className="calendar-header">
              {DAY_NAMES.map((d) => (
                <div key={d} className="calendar-header-cell">{d}</div>
              ))}
            </div>
            <div className="calendar-grid">
              {renderCalendar()}
            </div>
            {formData.availableDays.length > 0 && (
              <div className="calendar-selection">
                {formData.availableDays.length} jour(s) sélectionné(s)
              </div>
            )}
          </div>
        </div>

        <div className="field">
          <label>
            Disponibilité - <span className={isBroken ? 'falling' : ''}>Horaires</span> (plusieurs choix possibles)
          </label>
          <div className="checkbox-group">
            <label className="checkbox-option">
              <input
                type="checkbox"
                name="availableTime"
                value="Après-midi"
                checked={formData.availableTime.includes("Après-midi")}
                onChange={handleChange}
              />
              <span className={isBroken ? 'falling' : ''}>Après</span>-midi
            </label>
            <label className="checkbox-option">
              <input
                type="checkbox"
                name="availableTime"
                value="Soir"
                checked={formData.availableTime.includes("Soir")}
                onChange={handleChange}
              />
              Soir
            </label>
          </div>
        </div>

        <button type="submit">
          <span className={isBroken ? 'falling' : ''}>Envoyer</span>
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <a href="/dashboard" style={{ color: '#646cff', fontSize: '0.9rem', marginRight: '1rem' }}>
          <span className={isBroken ? 'falling' : ''}>Voir</span> les statistiques
        </a>
        <a href="/responses" style={{ color: '#646cff', fontSize: '0.9rem' }}>
          Voir les <span className={isBroken ? 'falling' : ''}>réponses</span>
        </a>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button
          type="button"
          className={`experimental-btn${experimentalEnabled ? ' active' : ''}`}
          onClick={toggleExperimental}
        >
          Expérimental
        </button>
      </div>
    </div>
  );
}

export default App;
