from flask import Flask, request, jsonify
import main  # your original Firebase-style logic

app = Flask(__name__)

@app.route("/extract", methods=["POST", "OPTIONS"])
def extract_data_route():
    return main.handleExtractData(request)

@app.route("/get-template", methods=["GET"])
def get_template_route():
    return main.getBudgetTemplate(request)

if __name__ == "__main__":
    import os
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
