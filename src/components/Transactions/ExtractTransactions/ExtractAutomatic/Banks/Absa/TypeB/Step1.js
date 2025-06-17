// Step1 Extract Raw Data from Cloud Function
// Step1.js


export const extractRawData = async (clientId, bankName, processingMethod) => {
    try {
      const response = await fetch(
        "https://us-central1-cashman-790ad.cloudfunctions.net/handleExtractDataManual",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: clientId,
            bankName,
            method: processingMethod === "pdfparser" ? "Parser" : "OCR",
          }),
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("🔥 Cloud Function Response Error:", errorText);
        return false;
      }
  
      return true;
    } catch (error) {
      console.error("🔥 Error calling Cloud Function:", error);
      return false;
    }
  };