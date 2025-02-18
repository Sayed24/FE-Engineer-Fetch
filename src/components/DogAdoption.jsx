import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "https://frontend-take-home-service.fetch.com";

// Reusable UI Components
const Input = ({ ...props }) => <input className="input" {...props} />;
const Button = ({ children, ...props }) => <button className="button" {...props}>{children}</button>;
const Select = ({ options, ...props }) => (
  <select className="select" {...props}>
    <option value="">All Breeds</option>
    {options.map((opt) => (
      <option key={opt} value={opt}>{opt}</option>
    ))}
  </select>
);

// Dog Card Component
const DogCard = ({ dog, isFavorite, toggleFavorite, onImageClick }) => (
  <div className="dog-card">
    <img src={dog.img} alt={dog.name} onClick={() => onImageClick(dog.img)} />
    <div className="dog-info">
      <h3>{dog.name}</h3>
      <p><strong>Breed:</strong> {dog.breed}</p>
      <p><strong>Age:</strong> {dog.age} years</p>
      <p><strong>Zip Code:</strong> {dog.zip_code}</p>
      <button className="favorite-button" onClick={() => toggleFavorite(dog.id)}>
        {isFavorite ? "Unfavorite" : "Favorite"}
      </button>
    </div>
  </div>
);

// Modal Component for Enlarged Image
const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content">
        <img src={imageUrl} alt="Enlarged Dog" />
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default function DogAdoption() {
  const [user, setUser] = useState({ name: "", email: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dogs, setDogs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [selectedBreed, setSelectedBreed] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const dogsPerPage = 12;

  useEffect(() => {
    if (isAuthenticated) {
      fetchBreeds();
      fetchDogs();
    }
  }, [isAuthenticated, sortOrder, selectedBreed, currentPage]);

  const handleLogin = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, user, { withCredentials: true });
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const fetchBreeds = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dogs/breeds`, { withCredentials: true });
      setBreeds(response.data);
    } catch (error) {
      console.error("Fetching breeds failed", error);
    }
  };

  const fetchDogs = async () => {
    try {
      let url = `${API_BASE_URL}/dogs/search?sort=breed:${sortOrder}&size=${dogsPerPage}&from=${(currentPage - 1) * dogsPerPage}`;
      if (selectedBreed) {
        url += `&breeds=${selectedBreed}`;
      }
      const response = await axios.get(url, { withCredentials: true });
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
          <div className="filters">
            <Select options={breeds} onChange={(e) => setSelectedBreed(e.target.value)} />
            <button className="sort-button" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
              Sort by Breed ({sortOrder === "asc" ? "Ascending" : "Descending"})
            </button>
          </div>

          <div className="dog-grid">
            {dogs.map((dog) => (
              <DogCard 
                key={dog.id} 
                dog={dog} 
                isFavorite={favorites.includes(dog.id)} 
                toggleFavorite={toggleFavorite}
                onImageClick={setSelectedImage} 
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="pagination">
            <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              Previous
            </Button>
            <span>Page {currentPage}</span>
            <Button onClick={() => setCurrentPage((prev) => prev + 1)}>
              Next
            </Button>
          </div>

          <button className="find-match" onClick={getMatch}>Find Your Match</button>

          {/* Image Modal */}
          <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
        </div>
      )}
    </div>
  );
}
