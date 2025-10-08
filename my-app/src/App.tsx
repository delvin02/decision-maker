import React, { useEffect, useState } from "react";
import "./App.css";

// Define the structure for a stored decision item
interface DecisionItem {
  id: number;
  decision: string;
  weight: number;
  team: "product" | "engineering";
}

// The main application component.
const App: React.FC = () => {
  // State for the new item inputs
  const [decisionText, setDecisionText] = useState<string>("");
  const [weight, setWeight] = useState<number>(1); // Default weight to 1
  const [team, setTeam] = useState<"product" | "engineering">("product");
  const [betterDecision, setBetterDecision] = useState<boolean>(false);

  // State for the list of decisions
  const [decisionItems, setDecisionItems] = useState<DecisionItem[]>([]);

  // State to hold the temporary notification message (used for error/final result popups).
  const [notification, setNotification] = useState<string>("");

  // --- New Spinner States ---
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  // rotation holds the final degree of rotation for the spinner
  const [rotation, setRotation] = useState<number>(0);

  // --- Utility Function for Spinner ---
  // Generates the CSS conic-gradient background and rotation style for the spinner
  const generateWheelStyle = () => {
    if (decisionItems.length === 0) return {};

    const totalWeight = decisionItems.reduce(
      (sum, item) => sum + item.weight,
      0
    );
    let currentDegree = 0;
    const gradientStops: string[] = [];

    // Define distinct colors for the segments
    const colors = [
      "#ef4444",
      "#f59e0b",
      "#10b981",
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#f87171",
      "#fbbf24",
      "#34d399",
      "#60a5fa",
    ];

    decisionItems.forEach((item, index) => {
      const percentage = item.weight / totalWeight;
      const degrees = percentage * 360;
      const color = colors[index % colors.length]; // Cycle through colors

      gradientStops.push(`${color} ${currentDegree}deg`);
      gradientStops.push(`${color} ${currentDegree + degrees}deg`);

      currentDegree += degrees;
    });

    // Ensure the gradient closes perfectly at 360deg
    if (gradientStops.length > 0) {
      gradientStops.pop(); // Remove the last duplicate color stop
      gradientStops.push(
        `${colors[(decisionItems.length - 1) % colors.length]} 360deg`
      );
    }

    return {
      backgroundImage: `conic-gradient(${gradientStops.join(", ")})`,
      transform: `rotate(${rotation}deg)`,
      // CSS transition only applied when spinning is true for smooth animation
      transition: isSpinning
        ? "transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)"
        : "none",
    };
  };

  // --- HANDLERS ---

  // Handler for adding a new decision item to the list
  const handleAddDecision = (event: React.FormEvent) => {
    event.preventDefault();

    const text = decisionText.trim();
    const currentWeight = weight || 1;

    if (text === "" || currentWeight <= 0) {
      setNotification(
        "Error: Decision text and a positive weight (1 or more) are required!"
      );
      return;
    }

    const newItem: DecisionItem = {
      id: Date.now(),
      decision: text,
      weight: currentWeight,
      team: team,
    };

    setDecisionItems((prevItems) => [...prevItems, newItem]);

    // Reset inputs
    setDecisionText("");
    setWeight(1);
    setTeam("product");
  };

  // Handler for randomly selecting a decision item and starting the spin
  const handleDecide = (event: React.FormEvent) => {
    event.preventDefault();

    let productDecisions = 0;
    decisionItems.forEach((decision) => {
      if (decision.team == "product") productDecisions++;
    });

    if (productDecisions < 1 || decisionItems.length - productDecisions < 1) {
      setNotification(
        "Error: Please add at least one decision item for each team before deciding!"
      );
      return;
    }

    // Reset previous state before starting the spin
    setNotification("");

    // --- Weighted Random Selection Logic ---
    const totalWeight = decisionItems.reduce(
      (sum, item) =>
        sum + (betterDecision && item.team == "product" ? 0 : item.weight),
      0
    );
    let randomNum = Math.random() * totalWeight;

    let selectedItem: DecisionItem | null = null;
    let cumulativeWeight = 0;
    let winningEndDegree = 0;
    let winningStartDegree = 0;

    for (const item of decisionItems) {
      if (betterDecision && item.team == "product") continue;
      const segmentDegrees = (item.weight / totalWeight) * 360;
      winningStartDegree = cumulativeWeight;
      winningEndDegree = cumulativeWeight + segmentDegrees;

      randomNum -= item.weight;

      if (randomNum <= 0) {
        selectedItem = item;
        break;
      }
      cumulativeWeight += segmentDegrees;
    }

    if (!selectedItem) return;

    // Calculate target rotation to land the segment under the pointer (top center)
    const targetCenterDegree = (winningStartDegree + winningEndDegree) / 2;
    // Rotation needed to move the target center to the 360/0 position
    let finalDegree = 360 - targetCenterDegree;

    // Add multiple full spins (1800 degrees = 5 full spins) for a dramatic effect
    const fullSpins = 5;
    finalDegree += fullSpins * 360;

    setRotation(finalDegree);

    // Set a timeout to stop the spin and show the final decision after the CSS animation finishes (5 seconds)
    setTimeout(() => {
      setIsSpinning(false); // Stop spinning

      const finalMessage = `You should ${selectedItem!.decision}!`;

      setNotification(finalMessage); // Show final notification popup
    }, 0); // Must match the CSS transition duration
  };

  // Handler for removing a decision item
  const handleRemoveDecision = (id: number) => {
    setDecisionItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // useEffect hook to automatically clear the notification after 3 seconds, only for the final result.
  useEffect(() => {
    // Only run if notification is present AND we are NOT currently spinning
    if (notification && !isSpinning) {
      const timer = setTimeout(() => {
        setNotification("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification, isSpinning]);

  return (
    <div className="app-container">
      <div className="main-card">
        <h1 className="title">Decision Maker</h1>
        <p className="subtitle">
          What do you need help making a decision for? Add items with weights,
          and let the universe choose.
        </p>

        {/* --- Input Form for Adding Items --- */}
        <form onSubmit={handleAddDecision} className="input-form">
          {/* Decision Text Input */}
          <div className="input-group full-width">
            <label htmlFor="decisionText" className="input-label">
              Decision Idea
            </label>
            <input
              id="decisionText"
              type="text"
              value={decisionText}
              onChange={(e) => setDecisionText(e.target.value)}
              placeholder="e.g., go to the party tonight"
              className="input-field"
              aria-label="Decision input field"
              required
            />
          </div>

          <div className="input-row">
            {/* Weight Input */}
            <div className="input-group">
              <label htmlFor="weight" className="input-label">
                Weight (1-1000)
              </label>
              <input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) =>
                  setWeight(Math.max(1, parseInt(e.target.value) || 1))
                } // Ensure positive number
                placeholder="1"
                min="1"
                max="1000"
                className="input-field"
                aria-label="Weight input field"
                required
              />
            </div>

            {/* Team Select */}
            <div className="input-group">
              <label htmlFor="team" className="input-label">
                Team
              </label>
              <select
                id="team"
                value={team}
                onChange={(e) =>
                  setTeam(e.target.value as "product" | "engineering")
                }
                className="input-field select-field"
                aria-label="Team select field"
              >
                <option value="product">Product</option>
                <option value="engineering">Engineering</option>
              </select>
            </div>
          </div>

          <div className="button-group">
            <button type="submit" className="add-button">
              Add Decision
            </button>
            <button
              type="button" // Important: use type="button" to prevent form submission
              onClick={handleDecide}
              className="submit-button"
              disabled={decisionItems.length === 0 || isSpinning}
            >
              {isSpinning ? "Spinning..." : "Help me decide!"}
            </button>
          </div>
          <div className="checkBoxContainer">
            <input
              id="check"
              type="checkbox"
              onChange={() => {
                setBetterDecision(!betterDecision);
              }}
              checked={betterDecision}
            />
            <label htmlFor="check">
              Check this box for better decision making
            </label>
          </div>
        </form>

        {/* --- Decision List Display --- */}
        <div className="decision-list-container">
          <h2 className="list-title">
            Current Decisions ({decisionItems.length})
          </h2>
          {decisionItems.length === 0 ? (
            <p className="empty-message">
              Add items above to start making decisions!
            </p>
          ) : (
            <ul className="decision-list">
              {decisionItems.map((item, index) => (
                <li key={item.id} className="decision-item">
                  <span className="item-index">{index + 1}.</span>
                  <span className="item-details">
                    <span className="item-text">{item.decision}</span>
                    <span className="item-meta">
                      (Weight: {item.weight}, Team: {item.team})
                    </span>
                  </span>
                  <button
                    className="remove-button"
                    onClick={() => handleRemoveDecision(item.id)}
                    aria-label={`Remove decision ${item.decision}`}
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* --- Floating Popup / Spinner Area --- */}
      {/* Show popup if notification is set OR if spinner is active */}
      {(notification || isSpinning) && (
        <div
          className="popup-backdrop"
          onClick={() => {
            // Allow closing only if it's a static notification, NOT while spinning
            if (!isSpinning && !notification.includes("Error"))
              setNotification("");
          }}
        >
          {isSpinning ? (
            // SPINNER MODE: Display the wheel and pointer
            <div className="spinner-container">
              {/* Pointer is fixed over the wheel */}
              <div className="pointer-icon">&#x25B2;</div>
              <div
                className="spinner-wheel"
                // Apply the dynamic conic-gradient and rotation style
                style={generateWheelStyle()}
              ></div>
              <div className="loading-text">Spinning to decide...</div>
            </div>
          ) : (
            // NOTIFICATION MODE: Display the final result or error
            <div
              role="alert"
              className="popup-box"
              style={{
                animation: "bounceIn 0.3s forwards",
                backgroundColor: notification.includes("Error")
                  ? "#dc2626"
                  : "#4f46e5",
              }}
            >
              <div className="popup-icon">
                {notification.includes("Error") ? "⚠️" : "🔮"}
              </div>
              {notification}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
