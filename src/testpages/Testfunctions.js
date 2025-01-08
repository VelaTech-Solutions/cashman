import React, { useState } from "react";

const TestFunctions = () => {
  const [message, setMessage] = useState(""); // State to store the message

  const onClick = async () => {
    try {
      const response = await fetch("https://us-central1-cashman-790ad.cloudfunctions.net/helloWorld");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Function response:", data); // Logs the response to the console
      setMessage(data.message); // Update state with the response message
    } catch (error) {
      console.error("Error calling the function:", error);
      setMessage("Error: Unable to fetch the message."); // Display error message
    }
  };

  return (
    <div>
      <h1>Test Firebase Functions</h1>
      <button onClick={onClick}>Call Cloud Function</button>
      <p>{message}</p> {/* Display the message on the page */}
    </div>
  );
};

export default TestFunctions;
