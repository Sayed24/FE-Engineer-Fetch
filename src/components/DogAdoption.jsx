import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "https://frontend-take-home-service.fetch.com";

// Reusable UI Components
const Input = ({ ...props }) => <input className="input" {...props} />;
const Button = ({ children, ...props }) => <button className="button" {...props}>{children}</button>;

// Dog Card Component
const DogCard = ({ dog, isFavorite, toggleFavorite }) => {
  return (
    <div className="dog-card">
      <img src={dog.img} alt={dog.name} />
      <div className="dog-info">
        <h3>{dog.name}</h3>
        <p><strong>Breed:</strong> {dog.breed}</p>
        <p><strong>Age:</strong> {dog.age}</p>
        <button className="favorite-button" onClick={() => toggleFavorite(dog.id)}>
          {isFavorite ? "Unfavorite" : "Favorite"}
        </button>
      </div>
    </div>
  );
};

export default function DogAdoption() {
  const [user, setUser] = useState({ name: "", email: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dogs, setDogs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    if (isAuthenticated) fetchDogs();
  }, [isAuthenticated, sortOrder]);

  const handleLogin = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, user, { withCredentials: true });
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const fetchDogs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dogs/search?sort=breed:${sortOrder}`, { withCredentials: true });
      const dogIds = response.data.resultIds;
      const dogDetails = await axios.post(`${API_BASE_URL}/dogs`, dogIds, { withCredentials: true });
      setDogs(dogDetails.data);
    } catch (error) {
      console.error("Fetching dogs failed", error);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]));
  };

  const getMatch = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/dogs/match`, favorites, { withCredentials: true });
      alert(`Your match is: ${response.data.match}`);
    } catch (error) {
      console.error("Matching failed", error);
    }
  };

  return (
    <div className="container">
      {!isAuthenticated ? (
        <div className="auth-form">
          <Input placeholder="Name" onChange={(e) => setUser({ ...user, name: e.target.value })} />
          <Input placeholder="Email" type="email" onChange={(e) => setUser({ ...user, email: e.target.value })} />
          <Button onClick={handleLogin}>Login</Button>
        </div>
      ) : (
        <div>
          <button className="sort-button" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
            Sort by Breed ({sortOrder === "asc" ? "Ascending" : "Descending"})
          </button>

          <div className="dog-grid">
            {dogs.map((dog) => (
              <DogCard key={dog.id} dog={dog} isFavorite={favorites.includes(dog.id)} toggleFavorite={toggleFavorite} />
            ))}
          </div>

          <button className="find-match" onClick={getMatch}>Find Your Match</button>
        </div>
      )}
    </div>
  );
}
