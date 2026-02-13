import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";
import { useShakeDetection } from "./useShakeDetection";
import config from './config';

const COLORS = ["#646cff", "#535bf2", "#4c4adb", "#4239c4", "#3828ad"];

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWakka, setShowWakka] = useState(false);
  const isShaking = useShakeDetection(20);
  const [isBroken, setIsBroken] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Animation "Wakka wakka" toutes les 5 secondes
    const interval = setInterval(() => {
      setShowWakka(true);
      setTimeout(() => setShowWakka(false), 2000); // Disparaît après 2 secondes
    }, 5000);

    return () => clearInterval(interval);
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
    return <div className="dashboard-container">Chargement...</div>;
  }

  // Statistiques hébergement
  const accommodationStats = [
    {
      name: "Oui",
      fullName: "Besoin hébergement",
      value: data.filter((g) => g.needsAccommodation).length,
    },
    {
      name: "Non",
      fullName: "Pas besoin",
      value: data.filter((g) => !g.needsAccommodation).length,
    },
  ];

  // Couleurs dynamiques pour l'hébergement (majorité en jaune, minorité en noir)
  const yesCount = accommodationStats[0].value;
  const noCount = accommodationStats[1].value;
  const accommodationColors = yesCount > noCount 
    ? ["#fbbf24", "#1a1a1a"] // Plus de "Oui" -> Oui en jaune, Non en noir
    : ["#1a1a1a", "#fbbf24"]; // Plus de "Non" -> Oui en noir, Non en jaune

  // Déterminer le côté de la bouche : 
  // Si jaune (Oui) majoritaire -> bouche à GAUCHE (partie noire)
  // Si noir (Non) majoritaire -> bouche à DROITE (partie noire)
  const isMouthLeft = yesCount > noCount;

  // Statistiques jours
  const dayStats = {};
  data.forEach((guest) => {
    guest.availableDays.forEach((day) => {
      dayStats[day] = (dayStats[day] || 0) + 1;
    });
  });
  const dayData = Object.entries(dayStats).map(([day, count]) => ({
    day,
    count,
  }));

  // Statistiques horaires
  const timeStats = {};
  data.forEach((guest) => {
    guest.availableTime.forEach((time) => {
      timeStats[time] = (timeStats[time] || 0) + 1;
    });
  });
  const timeData = Object.entries(timeStats).map(([time, count]) => ({
    time,
    count,
  }));

  // Allergies/régimes
  const dietList = data
    .filter((g) => g.allergiesAndDiet && g.allergiesAndDiet.trim() !== "")
    .map((g, idx) => ({ id: idx, text: g.allergiesAndDiet }));

  // Trouver le(s) jour(s) avec le plus de disponibilités
  const maxDayCount = Math.max(...Object.values(dayStats), 0);
  const bestDays = Object.entries(dayStats)
    .filter(([_, count]) => count === maxDayCount)
    .map(([day]) => day);

  return (
    <div className="dashboard-container">
      <h1>
        <span className={isBroken ? 'falling' : ''}>Tableau</span>
        {' '}de{' '}
        <span className={isBroken ? 'falling' : ''}>bord</span>
      </h1>
      <div className="stats-summary">
        <div className="stat-card">
          <h3><span className={isBroken ? 'falling' : ''}>{data.length}</span></h3>
          <p>Réponses <span className={isBroken ? 'falling' : ''}>totales</span></p>
        </div>
        {bestDays.length > 0 && (
          <div className="stat-card highlight">
            <h3><span className={isBroken ? 'falling' : ''}>Meilleur</span> jour</h3>
            <p className="best-day-label">Le <span className={isBroken ? 'falling' : ''}>plus</span> de disponibilités</p>
            <div className="best-days">
              {bestDays.map((day, idx) => (
                <span key={idx} className="best-day">{day}</span>
              ))}
            </div>
            <p className="best-day-count">{maxDayCount} <span className={isBroken ? 'falling' : ''}>personne(s)</span></p>
          </div>
        )}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2>
            <span className={isBroken ? 'falling' : ''}>Besoin</span>
            {' '}d'hébergement
          </h2>
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={accommodationStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  startAngle={225}
                  endAngle={585}
                >
                  {accommodationStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={accommodationColors[index]}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [value, props.payload.fullName]}
                />
                <Legend 
                  formatter={(value, entry) => entry.payload.fullName}
                />
              </PieChart>
            </ResponsiveContainer>
            <div
              style={{
                position: 'absolute',
                top: '30%',
                left: '55%',
                transform: 'translate(-50%, -50%)',
                width: '18px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#000',
                pointerEvents: 'none',
              }}
            />
            {showWakka && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  ...(isMouthLeft 
                    ? { left: '3%' } // Bouche à gauche -> texte à gauche, bien décalé du cercle
                    : { right: '3%' } // Bouche à droite -> texte à droite, bien décalé du cercle
                  ),
                  transform: 'translateY(-50%)',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#fbbf24',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  pointerEvents: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMouthLeft ? 'flex-start' : 'flex-end',
                  gap: '2px',
                  animation: 'wakkaFade 2s ease-out',
                }}
              >
                <div>Wakka</div>
                <div>wakka</div>
              </div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <h2>
            <span className={isBroken ? 'falling' : ''}>Disponibilité</span>
            {' '}par{' '}
            <span className={isBroken ? 'falling' : ''}>jour</span>
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#eee" />
              <YAxis stroke="#eee" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
              />
              <Bar dataKey="count" fill="#646cff" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>
            Disponibilité{' '}
            <span className={isBroken ? 'falling' : ''}>par</span>
            {' '}horaire
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#eee" />
              <YAxis stroke="#eee" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
              />
              <Bar dataKey="count" fill="#535bf2" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card list-card">
          <h2>
            <span className={isBroken ? 'falling' : ''}>Allergies</span>
            {' '}et régimes{' '}
            <span className={isBroken ? 'falling' : ''}>alimentaires</span>
          </h2>
          {dietList.length === 0 ? (
            <p className="empty-state">Aucune <span className={isBroken ? 'falling' : ''}>information</span> renseignée</p>
          ) : (
            <ul className="diet-list">
              {dietList.map((item) => (
                <li key={item.id}>{item.text}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button className="back-btn" onClick={() => window.location.href = "/"}>
        <span className={isBroken ? 'falling' : ''}>Retour</span> au formulaire
      </button>
      <button className="back-btn" onClick={() => window.location.href = "/responses"} style={{ marginTop: "1rem" }}>
        Voir les <span className={isBroken ? 'falling' : ''}>réponses</span>
      </button>
    </div>
  );
}

export default Dashboard;
