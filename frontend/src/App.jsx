import { useState, useEffect } from "react";
import "./App.css";
import { useShakeDetection } from "./useShakeDetection";
import config from "./config";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    allergiesAndDiet: "",
    needsAccommodation: false,
    availableDays: [],
    availableTime: [],
  });
  const [status, setStatus] = useState(null);
  const isShaking = useShakeDetection(20);
  const [isBroken, setIsBroken] = useState(false);

  useEffect(() => {
    if (isShaking && !isBroken) {
      setIsBroken(true);
    }
  }, [isShaking, isBroken]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox" && name !== "needsAccommodation") {
      // Pour les cases à cocher multiples (jours et horaires)
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
            {' '}- Jours (plusieurs choix possibles)
          </label>
          <div className="checkbox-group">
            <label className="checkbox-option">
              <input
                type="checkbox"
                name="availableDays"
                value="Dimanche 9"
                checked={formData.availableDays.includes("Dimanche 9")}
                onChange={handleChange}
              />
              <span className={isBroken ? 'falling' : ''}>Dimanche</span> 9 août
            </label>
            <label className="checkbox-option">
              <input
                type="checkbox"
                name="availableDays"
                value="Lundi 10"
                checked={formData.availableDays.includes("Lundi 10")}
                onChange={handleChange}
              />
              Lundi <span className={isBroken ? 'falling' : ''}>10</span> août
            </label>
            <label className="checkbox-option">
              <input
                type="checkbox"
                name="availableDays"
                value="Mardi 11"
                checked={formData.availableDays.includes("Mardi 11")}
                onChange={handleChange}
              />
              <span className={isBroken ? 'falling' : ''}>Mardi</span> 11 août
            </label>
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
    </div>
  );
}

export default App;
