import React, { useEffect, useState } from "react";
import './App.css';

// The main application component.
const App: React.FC = () => {
  // State to hold the current value of the input field.
  const [inputValue, setInputValue] = useState<string>("");

  // State to hold the temporary notification message.
  const [notification, setNotification] = useState<string>("");

  // Handler function for when the "Submit" button is clicked.
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission behavior

    const decisionTopic = inputValue.trim();

    if (decisionTopic === "") {
      // Use a distinct message for the error case
      setNotification(
        "Error: Please ask a question so the universe can decide!"
      );
      return;
    }

    // 1. Randomly decide between SHOULD and SHOULDN'T (50/50 chance)
    const decision = Math.random() < 0.5 ? "SHOULD" : "SHOULDNT";

    // 2. Construct the response message
    // Note: The message is structured to make the 'SHOULD/SHOULDNT' part clear.
    const message = `The universe has decided: You ${decision.toLowerCase()} ${decisionTopic}!`;

    // Set the notification.
    setNotification(message);

    // Clear the input field after submitting.
    setInputValue("");
  };

  // useEffect hook to automatically clear the notification after 3 seconds.
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification("");
      }, 3000); // Notification disappears after 3 seconds

      // Cleanup function: this runs if the component unmounts or if
      // the 'notification' state changes before the timeout finishes.
      return () => clearTimeout(timer);
    }
  }, [notification]); // Re-run effect whenever 'notification' changes

  return (
    <div className="app-container">
      <div className="main-card">
        <h1 className="title">Decision Maker</h1>
        <p className="subtitle">What do you need help making a decision for?</p>

        {/* The Input Form */}
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g., go to the party tonight"
            className="input-field"
            aria-label="Decision input field"
          />

          <button type="submit" className="submit-button">
            Help me decide!
          </button>
        </form>
      </div>

      {/* --- Floating Popup Notification Area --- */}
      {notification && (
        <div
          // The fixed container acts as a semi-transparent backdrop and centers the content
          className="popup-backdrop"
        >
          <div
            role="alert"
            // The actual notification box
            className="popup-box"
            // Dynamic background colors based on success or error
            style={{
              animation: "bounceIn 0.3s forwards",
              backgroundColor: notification.startsWith("Error")
                ? "#dc2626"
                : "#4f46e5",
            }}
          >
            <div className="popup-icon">
              {/* Use a Crystal Ball for decision/success, or Warning for error */}
              {notification.startsWith("Error") ? "⚠️" : "🔮"}
            </div>
            {notification}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
