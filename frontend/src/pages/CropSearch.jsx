import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import "../styles/search/CropSearch.css";

const BACKEND_ORIGIN = "http://localhost:8000";

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
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [searchParams] = useSearchParams();

  const performSearch = async (q) => {
    if (!q.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    try {
      const res = await axios.get(
        `${BACKEND_ORIGIN}/api/search/?q=${encodeURIComponent(q)}`
      );
      const crops = (res.data?.crops || []).map((c) => ({ type: "crop", data: c }));
      const soils = (res.data?.soils || []).map((s) => ({ type: "soil", data: s }));
      setResults([...crops, ...soils]);
    } catch (err) {
      console.error("Search failed", err.response?.data || err);
      setResults([]);
    } finally {
      setHasSearched(true);
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

      {hasSearched && results.length === 0 && (
        <p className="no-results-msg">No results found.</p>
      )}

      {results.map((item) => {
        const isCrop = item.type === "crop";
        const name = isCrop ? asDisplay(item.data.crop_name) : asDisplay(item.data.soil_name);
        const subtitle = isCrop ? asDisplay(item.data.soil_type) : asDisplay(item.data.soil_type);
        const imgUrl = toImageUrl(item.data.image);
        const key = item.data._id || name;

        return (
          <article
            className="result-item result-clickable-card"
            key={key}
            onClick={() => setSelectedDetail(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                setSelectedDetail(item);
              }
            }}
          >
            {imgUrl && (
              <img className="result-thumb" src={imgUrl} alt={name} />
            )}
            <div className="result-content">
              <span className={`result-type-badge result-type-badge--${item.type}`}>
                {isCrop ? "Crop" : "Soil"}
              </span>
              <h4>{name}</h4>
              <p>{subtitle}</p>
            </div>
          </article>
        );
      })}

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
