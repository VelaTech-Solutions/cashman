# CashMan

CashMan is a financial management application designed to simplify bank statement uploads, process transactions, and categorize them efficiently. The app is built using React and Firebase, offering a robust and modern platform for financial tracking.

---

## Table of Contents

- [Features](#features)
- [Directory Structure](#directory-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Get Tree](#get-tree)
- [Backup Project](#backup-project)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- Upload bank statements for processing.
- Categorize transactions automatically.
- Firebase integration for authentication, database, and storage.
- Responsive design for mobile and desktop.
- Modular and scalable codebase.

---

## Directory Structure

```plaintext
.
├── .firebase
│   ├── hosting.YnVpbGQ.cache
│   ├── hosting.cHVibGlj.cache
│   └── logs
│       └── vsce-debug.log
├── .firebaserc
├── .git
│   ├── branches
│   ├── config
│   ├── description
│   ├── hooks
│   ├── logs
│   ├── refs
│   └── ...
├── .github
│   └── workflows
│       ├── firebase-hosting-merge.yml
│       └── firebase-hosting-pull-request.yml
├── public
│   ├── favicon.ico
│   ├── index.html
│   ├── logo100.png
│   ├── manifest.json
│   └── robots.txt
├── src
│   ├── App.css
│   ├── App.js
│   ├── components
│   │   ├── Button.js
│   │   └── Input.js
│   ├── firebase
│   │   ├── auth.js
│   │   ├── config.js
│   │   └── ...
│   ├── pages
│   │   ├── Dashboard.js
│   │   ├── Login.js
│   │   └── ...
│   ├── services
│   │   └── apiService.js
│   └── styles
│       └── tailwind.css
├── README.md
├── firebase.json
├── firestore.rules
├── package.json
└── ...
```

---

## Getting Started

Follow these steps to set up and run the project locally:

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [Firebase CLI](https://firebase.google.com/docs/cli/)
- A Firebase project setup with authentication, Firestore, and storage enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/VelaTech-Solutions/cashman.git
   ```
2. Navigate to the project directory:
   ```bash
   cd cashman
   ```
3. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

### Running the App

Start the development server:

```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm test`

Launches the test runner in interactive watch mode.

---

## Deployment

1. Build the app:
   ```bash
   npm run build
   ```
2. Deploy using Firebase:
   ```bash
   firebase deploy
   ```

---

## Get Tree

```bash
tree -a -I 'node_modules|objects|build|venv|__pycache__|venvtest' > trash/directory_structure.txt
```

---

## Backup Project

```bash
zip -r /home/ubuntu/cashman/cashman_v2.3_backup.zip /home/ubuntu/cashman

```

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your improvements.

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

Functions
I am using / changing to python for the functions at functions
Removed the Java Functions

###

cd functions-py
sudo apt install python3-venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# update requirements.txt

pip freeze > requirements.txt

# testenv

python3 -m venv venvtest
source venvtest/bin/activate

# npx prettier --write .

npx prettier --write .
AIzaSyA3oEcsgRIIsNTKZdsJu2uJzVA3SnOl0Vk

export GOOGLE_GENAI_API_KEY=<your API key>

// import the Genkit and Google AI plugin libraries
import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';

// configure a Genkit instance
const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash, // set default model
});

const helloFlow = ai.defineFlow('helloFlow', async (name) => {
  // make a generation request
  const { text } = await ai.generate(`Hello Gemini, my name is ${name}`);
  console.log(text);
});

helloFlow('Chris');

 
rather havee thing that can be deceraed in the setting 

first get the bank names set in the setting 

Genkit api key
AIzaSyCpertYSwmw8CUCxfh54-LaWYYxgxjSOUg

export GOOGLE_GENAI_API_KEY=AIzaSyCpertYSwmw8CUCxfh54-LaWYYxgxjSOUg