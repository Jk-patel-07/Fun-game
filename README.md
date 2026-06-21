#  FUN 🔮

A fully responsive, glassmorphic Next.js App Router single-page application that predicts expected maths marks (0-70 scale), generates funny roasts based on scores, animates custom canvas confetti, plays synthesized click sounds, and persists entries directly into a MongoDB Atlas database using Mongoose.

---

## 🚀 Key Features

* **Interactive Workflow (Steps 1-4)**:
  * **Step 1**: Username validation (filters greetings, repetitive letters, short names, and test aliases).
  * **Step 2**: Synchronized numerical input and slider element constrained to the 0–70 marks range.
  * **Step 3**: Displays a randomized funny roast depending on the mark bracket.
  * **Step 4**: Allows submitting feedback messages directly to Jay.
* **Modern Design & Animations**:
  * Glassmorphism layout with floating mesh gradient blobs.
  * Fluid light/dark mode transitions synced to browser `localStorage`.
  * Fully customizable HTML5 canvas confetti engine.
* **Audio Feedback**:
  * Clean, browser-native synthesized click sounds using the Web Audio API.
* **Mongoose Schema & Storage**:
  * Saves entries automatically into the `user` collection inside the `fun` database.
  * Resilient offline fallback to browser `localStorage` if database connection goes down.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, Next.js 16 (App Router), HTML5 Canvas API, Web Audio API, Vanilla CSS
* **Backend**: Next.js Serverless Functions
* **Database**: MongoDB Atlas via Mongoose Client
* **Dev Server workarounds**: Forced Webpack bundler (`--webpack`) to avoid Windows SWC native binding locks.

---

## 📂 Project Structure

```text
├── app/
│   ├── submit-message/
│   │   └── route.js       # Next.js Serverless API Route (handles POST /submit-message)
│   ├── globals.css            # Glassmorphic themes & keyframe blob animations
│   ├── layout.js              # Next.js page wrapper with Outfit typography
│   └── page.js                # Core React workflow logic and frontend state
├── lib/
│   └── mongodb.js             # Mongoose connection helper (targets "fun" database)
├── vanilla_backup/            # Archive of original HTML/CSS/JS files and server.js
├── .env.local                 # Next.js environment configurations (ignored by Git)
├── .env                       # Legacy server environment configurations (ignored by Git)
├── package.json               # Dependencies and scripts
└── next.config.mjs            # Next.js custom configurations
```

---

## 💻 Local Setup & Run

### 1. Configure Connection Variables
Create a `.env.local` file in the root directory (for Next.js) and a `.env` file (for the legacy server compatibility). Add your MongoDB Atlas connection string:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Next.js Dev Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Running the Legacy Vanilla Server (Optional)
If you want to run the original backend server, execute:
```bash
node vanilla_backup/server.js
```
The legacy server will launch on **[http://localhost:8080](http://localhost:8080)**.

---

## 🌐 Deploying to Vercel

To successfully deploy and connect this project on Vercel, make sure you configure these settings in your dashboard:

### 1. Set the Framework Preset to Next.js
1. Go to your project settings in the **Vercel Dashboard**.
2. Under **General**, find **Framework Preset**.
3. Select **Next.js** from the dropdown (do not use *Node.js* or *Other*).
4. Click **Save**.

### 2. Configure Environment Variables
1. Go to **Settings** > **Environment Variables** in Vercel.
2. Add a new variable:
   * **Key**: `MONGODB_URI`
   * **Value**: *Your MongoDB Atlas connection URI*
3. Click **Save**.

### 3. MongoDB Atlas IP Access List (Whitelist)
Because Vercel serverless functions run from dynamic IPs, you must allow Atlas connections from anywhere:
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Go to **Network Access** in the left sidebar.
3. Click **Add IP Address**.
4. Type `0.0.0.0/0` manually into the **Access List Entry** field.
5. Click **Confirm**.

### 4. Redeploy the Project
* Go to the **Deployments** tab on Vercel, click the three dots (`...`) next to your latest deployment, and select **Redeploy** to trigger the build with the new settings.
