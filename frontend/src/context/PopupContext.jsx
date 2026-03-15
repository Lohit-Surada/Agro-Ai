import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import "../styles/shared/PopupAlert.css";

const PopupContext = createContext({ showPopup: () => {} });

export const PopupProvider = ({ children }) => {
  const [popup, setPopup] = useState({
    message: "",
    type: "error",
    visible: false,
  });

  const showPopup = useCallback((message, type = "error") => {
    setPopup({ message, type, visible: true });
  }, []);

  const closePopup = useCallback(() => {
    setPopup((prev) => ({ ...prev, visible: false }));
  }, []);

  const value = useMemo(() => ({ showPopup }), [showPopup]);

  return (
    <PopupContext.Provider value={value}>
      {children}
      {popup.visible && (
        <div className="popup-overlay" role="dialog" aria-modal="true">
          <div className={`popup-alert popup-${popup.type === "alert" ? "warning" : popup.type}`}>
            <p className="popup-message">
              {popup.type === "alert" ? "⚠️ " : ""}
              {popup.message}
            </p>
            <button type="button" className="popup-ok-btn" onClick={closePopup}>
              OK
            </button>
          </div>
        </div>
      )}
    </PopupContext.Provider>
  );
};

export const usePopup = () => useContext(PopupContext);
