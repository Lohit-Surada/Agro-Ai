import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import "../styles/search/CropSearch.css";

const BACKEND_ORIGIN = import.meta.env.VITE_API_BASE_URL;

const asText = (value) => {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined) return "";
  return String(value);
};

const asDisplay = (value) => {
  const text = asText(value).trim();
  return text ? text : "-----";
};

const toImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = String(path).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${BACKEND_ORIGIN}/${normalized}`;
};

const CropSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ crops: [], soils: [] });
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [searchParams] = useSearchParams();
  const searchCards = [
    ...results.crops.map((crop) => ({
      type: "crop",
      data: crop,
      id: crop._id || `crop-${crop.crop_name}-${crop.soil_type}`,
      title: asDisplay(crop.crop_name),
      subtitle: asDisplay(crop.soil_type),
      image: crop.image,
    })),
    ...results.soils.map((soil) => ({
      type: "soil",
      data: soil,
      id: soil._id || `soil-${soil.soil_name}`,
      title: asDisplay(soil.soil_name),
      subtitle: asDisplay(soil.soil_type),
      image: soil.image,
    })),
  ];

  const performSearch = async (q) => {
    if (!q.trim()) {
      setResults({ crops: [], soils: [] });
      return;
    }

    try {
      const res = await axios.get(
        `${BACKEND_ORIGIN}/api/search/?q=${encodeURIComponent(q)}`
      );
      setResults({
        crops: res.data?.crops || [],
        soils: res.data?.soils || [],
      });
    } catch (err) {
      console.error("Search failed", err.response?.data || err);
      setResults({ crops: [], soils: [] });
    }
  };

  const handleSearch = async () => {
    await performSearch(query);
  };

  useEffect(() => {
    const initialQ = searchParams.get("q") || "";
    setQuery(initialQ);
    if (initialQ) {
      performSearch(initialQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedDetail(null);
      }
    };

    if (selectedDetail) {
      window.addEventListener("keydown", onKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedDetail]);

  return (
    <div className="crop-search-page">
      <h2 className="results-title">Search Results</h2>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search crop or soil"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {query.trim() && searchCards.length === 0 && <p className="no-results-msg">No matching results found.</p>}
      {searchCards.map((item) => (
        <article
          className="result-item result-clickable-card"
          key={item.id}
          onClick={() => setSelectedDetail({ type: item.type, data: item.data })}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              setSelectedDetail({ type: item.type, data: item.data });
            }
          }}
        >
          {toImageUrl(item.image) && (
            <img className="result-thumb" src={toImageUrl(item.image)} alt={asText(item.title)} />
          )}
          <div className="result-content">
            <h4>{item.title}</h4>
            <p>{item.subtitle}</p>
          </div>
        </article>
      ))}

      {selectedDetail && (
        <div className="search-detail-overlay" onClick={() => setSelectedDetail(null)}>
          <section className="search-detail-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="search-detail-close" onClick={() => setSelectedDetail(null)}>
              Close
            </button>

            {selectedDetail.type === "crop" ? (
              <div className="search-detail-layout">
                <div className="search-detail-hero">
                  {toImageUrl(selectedDetail.data.image) ? (
                    <img
                      src={toImageUrl(selectedDetail.data.image)}
                      alt={asDisplay(selectedDetail.data.crop_name)}
                      className="search-detail-image"
                    />
                  ) : (
                    <div className="search-detail-placeholder">No image</div>
                  )}
                  <h3>{asDisplay(selectedDetail.data.crop_name)}</h3>
                </div>

                <div className="search-info-card">
                  <h4 className="search-info-title">Agricultural Crop Information</h4>
                  <div className="search-info-grid">
                    <div className="search-info-row">
                      <p className="search-info-label">Crop Name</p>
                      <p className="search-info-value">{asDisplay(selectedDetail.data.crop_name)}</p>
                    </div>
                    <div className="search-info-row">
                      <p className="search-info-label">Season</p>
                      <p className="search-info-value">{asDisplay(selectedDetail.data.season)}</p>
                    </div>
                    <div className="search-info-row">
                      <p className="search-info-label">Soil Type</p>
                      <p className="search-info-value">{asDisplay(selectedDetail.data.soil_type)}</p>
                    </div>
                    <div className="search-info-row">
                      <p className="search-info-label">Temperature (Celsius)</p>
                      <p className="search-info-value">{asDisplay(selectedDetail.data.temperature_celsius)}</p>
                    </div>
                    <div className="search-info-row">
                      <p className="search-info-label">pH Range</p>
                      <p className="search-info-value">{asDisplay(selectedDetail.data.ph_range)}</p>
                    </div>
                    <div className="search-info-row">
                      <p className="search-info-label">Humidity (%)</p>
                      <p className="search-info-value">{asDisplay(selectedDetail.data.humidity_percent)}</p>
                    </div>
                    <div className="search-info-row">
                      <p className="search-info-label">Rainfall (mm)</p>
                      <p className="search-info-value">{asDisplay(selectedDetail.data.rainfall_mm)}</p>
                    </div>
                    <div className="search-info-row">
                      <p className="search-info-label">Duration (Days)</p>
                      <p className="search-info-value">{asDisplay(selectedDetail.data.crop_duration_days)}</p>
                    </div>
                    <div className="search-info-row search-info-row-full">
                      <p className="search-info-label">Description</p>
                      <p className="search-info-value">{asDisplay(selectedDetail.data.description)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="search-detail-layout">
                <div className="search-detail-hero">
                  {toImageUrl(selectedDetail.data.image) ? (
                    <img
                      src={toImageUrl(selectedDetail.data.image)}
                      alt={asDisplay(selectedDetail.data.soil_name)}
                      className="search-detail-image"
                    />
                  ) : (
                    <div className="search-detail-placeholder">No image</div>
                  )}
                  <h3>{asDisplay(selectedDetail.data.soil_name)}</h3>
                </div>

                <div className="search-info-card">
                  <h4 className="search-info-title">Agricultural Soil Information</h4>
                  <div className="search-info-grid">
                    <div className="search-info-row">
                      <p className="search-info-label">Soil Name</p>
                      <p className="search-info-value">{asDisplay(selectedDetail.data.soil_name)}</p>
                    </div>
                    <div className="search-info-row">
                      <p className="search-info-label">Soil Type</p>
                      <p className="search-info-value">{asDisplay(selectedDetail.data.soil_type)}</p>
                    </div>
                    <div className="search-info-row">
                      <p className="search-info-label">pH Level</p>
                      <p className="search-info-value">{asDisplay(selectedDetail.data.ph_level)}</p>
                    </div>
                    <div className="search-info-row">
                      <p className="search-info-label">Nitrogen</p>
                      <p className="search-info-value">{asDisplay(selectedDetail.data.nutrient_content?.nitrogen)}</p>
                    </div>
                    <div className="search-info-row">
                      <p className="search-info-label">Phosphorus</p>
                      <p className="search-info-value">{asDisplay(selectedDetail.data.nutrient_content?.phosphorus)}</p>
                    </div>
                    <div className="search-info-row">
                      <p className="search-info-label">Potassium</p>
                      <p className="search-info-value">{asDisplay(selectedDetail.data.nutrient_content?.potassium)}</p>
                    </div>
                    <div className="search-info-row search-info-row-full">
                      <p className="search-info-label">Suitable Crops</p>
                      <p className="search-info-value">{asDisplay(selectedDetail.data.suitable_crops)}</p>
                    </div>
                    <div className="search-info-row search-info-row-full">
                      <p className="search-info-label">Description</p>
                      <p className="search-info-value">{asDisplay(selectedDetail.data.description)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default CropSearch;
