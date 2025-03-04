import React, { createContext, useState, useEffect } from "react";

export const TemplateContext = createContext();

export const TemplateProvider = ({ children }) => {
  const [templateBlob, setTemplateBlob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBudgetTemplate = async () => {
      console.log("🔍 Checking if template exists in localStorage...");

      const storedBlobUrl = localStorage.getItem("templateBlobUrl");

      if (storedBlobUrl) {
        setTemplateBlob(storedBlobUrl);
        setIsLoading(false);
        console.log("✅ Template already loaded from localStorage.");
        return;
      }

      console.log("⏳ No template in localStorage, fetching from backend...");

      try {
        const response = await fetch("https://us-central1-cashman-790ad.cloudfunctions.net/getBudgetTemplate");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        console.log("📩 Response received, converting to Blob...");
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        setTemplateBlob(blobUrl);
        localStorage.setItem("templateBlobUrl", blobUrl);

        console.log("✅ Template fetched and stored successfully!");
      } catch (error) {
        console.error("❌ Failed to fetch template:", error);
      } finally {
        setIsLoading(false);
        console.log("🏁 Fetch process completed.");
      }
    };

    fetchBudgetTemplate();
  }, []);

  return (
    <TemplateContext.Provider value={{ templateBlob, isLoading }}>
      {children}
    </TemplateContext.Provider>
  );
};
