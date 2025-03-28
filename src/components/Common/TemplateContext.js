import React, { createContext, useState, useEffect } from "react";

export const TemplateContext = createContext();

export const TemplateProvider = ({ children }) => {
  const [templateBlob, setTemplateBlob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBudgetTemplate = async () => {
      const storedBlobUrl = localStorage.getItem("templateBlobUrl");

      if (storedBlobUrl) {
        setTemplateBlob(storedBlobUrl);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("https://us-central1-cashman-790ad.cloudfunctions.net/getBudgetTemplate");
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setTemplateBlob(blobUrl);
        localStorage.setItem("templateBlobUrl", blobUrl);
      } catch (error) {
        console.error("❌ Failed to fetch template:", error);
      } finally {
        setIsLoading(false);
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

// 👇 Add this line
export default TemplateProvider;
