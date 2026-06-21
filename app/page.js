"use client";

import { useState, useEffect, useRef } from 'react';

// --- Funny Message Pools ---
const funnyMessages = {
  under30: [
    "Papa belt taiyar kar rahe hain... 💀",
    "Rickshaw chalane ki practice shuru kar do! 🛺",
    "System hang ho gaya aapka padhai ka! 📉",
    "Pandit ji se bolo shanti puja karwayen. 🕯️",
    "Fail hone ka dukh apni jagah, but screen dekh ke maza aaya na? 😂"
  ],
  under50: [
    "Sharma ji ka beta 99 laya hai, aur aap... 🥲",
    "Border pe khade ho, kabhi bhi gir sakte ho! 🚧",
    "Grace marks dekar pass kiya hai examiner ne. 🙏",
    "Chalo, compartment se toh bach gaye! 😅",
    "Thoda sa aur padh lete toh pass hone ki bheekh na mangni padti! 😝"
  ],
  under70: [
    "Sharma ji ke bete se door raho, depression ho jayega. 😂",
    "Na idhar ke rahe na udhar ke, pure middle class marks! 😐",
    "Average is the new cool? Bilkul nahi! 😜",
    "Mummy bolengi: 'Bas itna hi?' 🤰",
    "Exam hall me bas aaju-baaju hi dekha lagta hai. 👀"
  ],
  under90: [
    "Chalo, is baar toh bach gaye daant se! 🎉",
    "Party kab de rahe ho fir? 🍕",
    "Thoda aur padh lete toh topper ban jate. 😉",
    "Rishtedaaron ko batane layak marks hain. 😎",
    "Examiner pighal gaya lagta hai aapke answers dekh ke. 💥"
  ],
  topper: [
    "Hey Prabhu! Aap devta hain! 🛐",
    "Google me job pakki? 🖥️",
    "Kaun si chakki ka aata khate ho bhai? 🌾",
    "Sharma ji ka beta ab aapse tuition lega! 👑",
    "Itna padh ke kahan jaoge devta purus? 🚀"
  ]
};

const nameErrorMessages = [
  "😏 Apna asli naam dalo, kyu dar lag raha hai?",
  "😂 Bhai, ye naam thoda suspicious lag raha hai.",
  "🤨 Asli naam dalo, attendance nahi lag rahi.",
  "😎 Hero, apna original naam likho.",
  "🙄 'hi' naam nahi hota bhai."
];

const marksErrorMessages = [
  "😅 Bhai, Maths ka paper 70 marks ka hi tha!",
  "😂 70 se zyada marks kahan se laoge?",
  "🤨 Paper 70 marks ka tha, yaad hai na?",
  "📚 Maximum marks allowed: 70"
];

// --- Funny Message Picker (outside component to remain pure during render) ---
const getRandomFunnyMessage = (bracketKey) => {
  const messageList = funnyMessages[bracketKey];
  return messageList[Math.floor(Math.random() * messageList.length)];
};

export default function Home() {
  // Navigation workflow state: 'name' | 'predict' | 'result'
  const [step, setStep] = useState('name');
  
  // Form values
  const [userName, setUserName] = useState('');
  const [typedMarks, setTypedMarks] = useState('35');
  const [sliderMarks, setSliderMarks] = useState(35);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  
  // Validation and error feedback state
  const [nameShake, setNameShake] = useState(false);
  const [marksShake, setMarksShake] = useState(false);
  const [messageShake, setMessageShake] = useState(false);
  const [nameBorderRed, setNameBorderRed] = useState(false);
  const [marksBorderRed, setMarksBorderRed] = useState(false);
  const [messageBorderRed, setMessageBorderRed] = useState(false);
  
  // Results
  const [predictedMarks, setPredictedMarks] = useState(35);
  const [resultMain, setResultMain] = useState('');
  const [resultFunny, setResultFunny] = useState('');
  const [resultEmoji, setResultEmoji] = useState('🏆');

  // Success screen substate
  const [messageSent, setMessageSent] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  // Web Audio Context Reference
  const audioCtxRef = useRef(null);

  // Confetti Animation References
  const canvasRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const confettiActiveRef = useRef(false);
  const confettiPiecesRef = useRef([]);

  // Toast timer reference
  const toastTimeoutRef = useRef(null);

  // --- Name Validation ---
  const isValidName = (name) => {
    const trimmed = name.trim().toLowerCase();
    
    // 1. Must contain alphabetic characters
    if (!/[a-z]/i.test(trimmed)) {
      return false;
    }
    
    // 2. Reject names with less than 3 unique letters (e.g. "hiiii", "ab")
    const lettersOnly = trimmed.replace(/[^a-z]/g, '');
    const uniqueLetters = new Set(lettersOnly);
    if (uniqueLetters.size < 3) {
      return false;
    }

    // 3. Reject names containing 3 or more consecutive repeated characters (e.g. "heyyyy")
    if (/(.)\1\1/.test(trimmed)) {
      return false;
    }

    // 4. Blacklist regexes for greetings, fake/test names
    const blacklistRegexes = [
      /^hi+$/i,
      /^hello+$/i,
      /^hey+$/i,
      /^bro+$/i,
      /^bhai+$/i,
      /^abc+$/i,
      /^xyz+$/i,
      /^qwerty+$/i,
      /^test.*$/i,
      /^user.*$/i,
      /^anonymous.*$/i,
      /^guest.*$/i,
      /^admin.*$/i,
      /^noone$/i,
      /^nobody$/i
    ];

    for (const regex of blacklistRegexes) {
      if (regex.test(trimmed)) {
        return false;
      }
    }

    return true;
  };

  // --- Click Sound Synthesis ---
  const playClickSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const now = audioCtxRef.current.currentTime;
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (err) {
      console.warn("Click sound failed:", err);
    }
  };

  // --- Submit to DB (Serverless) ---
  const submitToMongoDB = (name, marks, result, message) => {
    fetch('/submit-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        predictedMarks: marks !== undefined && marks !== null ? marks : '',
        predictionResult: result || '',
        message: message || ''
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Server status ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      console.log('Saved to MongoDB Atlas:', data);
    })
    .catch(error => {
      console.error('Database save failed, saving to LocalStorage:', error);
      try {
        const savedMessages = JSON.parse(localStorage.getItem('jay_messages') || '[]');
        savedMessages.push({
          name: name,
          message: message || '',
          predictedMarks: marks !== undefined && marks !== null ? marks : '',
          predictionResult: result || '',
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('jay_messages', JSON.stringify(savedMessages));
      } catch (err) {
        console.error("Failed to store message locally:", err);
      }
    });
  };

  // --- Trigger Prediction Calculation ---
  const triggerPrediction = (nameToSave, val) => {
    let mainResponse = "";
    let emoji = "";
    let bracketKey = "";
    
    if (val <= 21) {
      mainResponse = "Kuch padha karo 😅";
      emoji = "😅";
      bracketKey = "under30";
    } else if (val <= 35) {
      mainResponse = "Thoda aur mehnat karo 📚";
      emoji = "📚";
      bracketKey = "under50";
    } else if (val <= 49) {
      mainResponse = "Achha hai 👍";
      emoji = "👍";
      bracketKey = "under70";
    } else if (val <= 63) {
      mainResponse = "Bahut badhiya 🔥";
      emoji = "🔥";
      bracketKey = "under90";
    } else {
      mainResponse = "Topper ho kya? 🏆";
      emoji = "🏆";
      bracketKey = "topper";
    }

    const funnyResponse = getRandomFunnyMessage(bracketKey);

    setPredictedMarks(val);
    setResultMain(mainResponse);
    setResultFunny(funnyResponse);
    setResultEmoji(emoji);

    playClickSound();
    submitToMongoDB(nameToSave, val, mainResponse, '');
    setStep('result');

    if (val > 63) {
      startConfetti();
    }
  };

  // --- Canvas Confetti Engine ---
  const initConfettiPieces = () => {
    const pieces = [];
    const colors = ["#f472b6", "#c084fc", "#60a5fa", "#34d399", "#fbbf24", "#f87171"];
    const w = canvasRef.current ? canvasRef.current.width : window.innerWidth;
    const h = canvasRef.current ? canvasRef.current.height : window.innerHeight;

    for (let i = 0; i < 150; i++) {
      pieces.push({
        x: Math.random() * w,
        y: Math.random() * -h - 20,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 4 - 2,
        speedY: Math.random() * 5 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 4 - 2,
        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          this.rotation += this.rotationSpeed;

          if (this.y > h) {
            this.y = -20;
            this.x = Math.random() * w;
          }
        },
        draw(ctx) {
          ctx.save();
          ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
          ctx.rotate((this.rotation * Math.PI) / 180);
          ctx.fillStyle = this.color;
          ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
          ctx.restore();
        }
      });
    }
    confettiPiecesRef.current = pieces;
  };

  const animateConfetti = () => {
    if (!confettiActiveRef.current) return;
    const ctx = canvasRef.current ? canvasRef.current.getContext('2d') : null;
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      confettiPiecesRef.current.forEach((piece) => {
        piece.update();
        piece.draw(ctx);
      });
    }
    animationFrameIdRef.current = requestAnimationFrame(animateConfetti);
  };

  const startConfetti = () => {
    if (confettiActiveRef.current) return;
    confettiActiveRef.current = true;
    initConfettiPieces();
    animateConfetti();
    
    // Auto-stop confetti after 5 seconds to conserve CPU
    setTimeout(() => {
      stopConfetti();
    }, 5000);
  };

  const stopConfetti = () => {
    confettiActiveRef.current = false;
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    const ctx = canvasRef.current ? canvasRef.current.getContext('2d') : null;
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // --- Theme Initializer ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    setTimeout(() => {
      setMounted(true);
      setTheme(initialTheme);
    }, 0);

    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  // --- Sync URL params ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const nameParam = urlParams.get('name');
    const marksParam = urlParams.get('marks');

    if (nameParam && isValidName(nameParam)) {
      setTimeout(() => {
        setUserName(nameParam.trim());
        submitToMongoDB(nameParam.trim(), '', '', '');
        setStep('predict');

        if (marksParam) {
          const marksVal = parseInt(marksParam, 10);
          if (!isNaN(marksVal) && marksVal >= 0 && marksVal <= 70) {
            setTypedMarks(String(marksVal));
            setSliderMarks(marksVal);
            // Auto trigger predict click after delay
            setTimeout(() => {
              triggerPrediction(nameParam.trim(), marksVal);
            }, 450);
          }
        }
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Confetti Canvas Resizer ---
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Toast helper ---
  const triggerToast = (msg) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    setShowToast(true);
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // --- Toggle Theme ---
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  // Helper functions playClickSound, submitToMongoDB and isValidName moved to top of file

  // --- Proceed Step 1 Button ---
  const handleProceedName = () => {
    const val = userName.trim();
    if (val === "") {
      setNameShake(true);
      setNameBorderRed(true);
      setTimeout(() => setNameShake(false), 400);
      return;
    }

    if (!isValidName(val)) {
      const randomMsg = nameErrorMessages[Math.floor(Math.random() * nameErrorMessages.length)];
      triggerToast(randomMsg);
      setNameShake(true);
      setNameBorderRed(true);
      setTimeout(() => setNameShake(false), 400);
      return;
    }

    submitToMongoDB(val, '', '', '');
    setStep('predict');
  };

  // --- Sync Marks Text & Slider ---
  const handleMarksTextChange = (e) => {
    const val = e.target.value;
    setTypedMarks(val);
    if (val !== "") {
      const parsedVal = parseInt(val, 10);
      setSliderMarks(Math.max(0, Math.min(70, parsedVal || 0)));
    }
  };

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setSliderMarks(val);
    setTypedMarks(String(val));
  };

  const getEmojiForMarks = (value) => {
    if (value === "" || isNaN(value)) return "🧐";
    const val = parseInt(value, 10);
    if (val <= 21) return "😨";
    if (val <= 35) return "😬";
    if (val <= 49) return "🙂";
    if (val <= 63) return "😎";
    return "👑";
  };

  // triggerPrediction moved to top of file

  const handleCheckResult = () => {
    const inputValStr = typedMarks.trim();
    
    if (inputValStr === "" || isNaN(inputValStr)) {
      setMarksShake(true);
      setMarksBorderRed(true);
      setTimeout(() => setMarksShake(false), 400);
      return;
    }

    const val = parseInt(inputValStr, 10);
    if (val < 0) {
      setMarksShake(true);
      setMarksBorderRed(true);
      setTimeout(() => setMarksShake(false), 400);
      return;
    }

    if (val > 70) {
      const randomMsg = marksErrorMessages[Math.floor(Math.random() * marksErrorMessages.length)];
      triggerToast(randomMsg);
      setMarksShake(true);
      setMarksBorderRed(true);
      setTimeout(() => setMarksShake(false), 400);
      return;
    }

    triggerPrediction(userName, val);
  };

  // --- Send Message to Jay ---
  const handleSendMessage = () => {
    playClickSound();
    const msgText = feedbackMsg.trim();
    
    if (msgText === "") {
      setMessageShake(true);
      setMessageBorderRed(true);
      setTimeout(() => setMessageShake(false), 400);
      return;
    }

    fetch('/submit-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: userName,
        message: msgText,
        predictedMarks: predictedMarks,
        predictionResult: resultMain
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to record message on server');
      }
      return response.json();
    })
    .then(data => {
      console.log('Message Success:', data);
      const successMsg = `✅ Thanks ${userName}! Tumhara message Jay tak pahunch gaya.`;
      triggerToast(successMsg);
      setFeedbackMsg('');
      setMessageSent(true);
    })
    .catch(error => {
      console.error('Error submitting message, using LocalStorage fallback:', error);
      try {
        const savedMessages = JSON.parse(localStorage.getItem('jay_messages') || '[]');
        savedMessages.push({
          name: userName,
          message: msgText,
          predictedMarks: predictedMarks,
          predictionResult: resultMain,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('jay_messages', JSON.stringify(savedMessages));
      } catch (err) {
        console.error("Failed to store message in localStorage:", err);
      }

      const successMsg = `✅ Thanks ${userName}! Tumhara message Jay tak pahunch gaya.`;
      triggerToast(successMsg);
      setFeedbackMsg('');
      setMessageSent(true);
    });
  };

  // --- Reset Game Flow ---
  const handlePredictAgain = () => {
    stopConfetti();
    setStep('name');
    setMessageSent(false);
    setUserName('');
    setFeedbackMsg('');
    setTypedMarks('35');
    setSliderMarks(35);
  };



  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Background Blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      {/* Confetti Canvas */}
      <canvas id="confetti-canvas" ref={canvasRef}></canvas>

      {/* Toast Notification */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        {toastMessage}
      </div>

      <div className="container" id="app-container">
        {/* Header Actions */}
        <div className="header-actions">
          <button 
            className="theme-toggle-btn" 
            id="theme-toggle" 
            onClick={toggleTheme}
            aria-label="Toggle Theme" 
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            suppressHydrationWarning
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Website Branding */}
        <h1 className="title">Maths</h1>
        <p className="subtitle">EGD ka paper aa raha hai, pata he kya apko? 😭</p>

        {/* STEP 1: Name entry panel */}
        {step === 'name' && (
          <div className="name-panel" id="name-panel">
            <div className="emoji-preview">👋</div>
            <div className="question">Pehle apna naam batao! 👇</div>
            <div className="name-input-wrapper">
              <input 
                type="text" 
                id="user-name-input" 
                className={`message-name-input ${nameShake ? 'shake' : ''}`}
                style={{ borderColor: nameBorderRed ? 'red' : '' }}
                placeholder="Apna naam likho 😊" 
                maxLength={50}
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                  setNameBorderRed(false);
                }}
                onFocus={() => setNameBorderRed(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleProceedName();
                  }
                }}
                autoComplete="off"
              />
            </div>
            <button className="btn btn-primary" id="btn-proceed-name" onClick={handleProceedName}>
              Proceed 🚀
            </button>
          </div>
        )}

        {/* STEP 2: Marks entry panel */}
        {step === 'predict' && (
          <div className="input-panel" id="input-panel">
            <div className="emoji-preview" id="emoji-preview">
              {getEmojiForMarks(typedMarks)}
            </div>
            <div className="question">Maths me kitne aayenge?</div>
            <div className="marks-input-wrapper">
              <input 
                type="number" 
                id="marks-input" 
                className={`marks-input ${marksShake ? 'shake' : ''}`}
                style={{ borderColor: marksBorderRed ? 'red' : '' }}
                placeholder="Expected marks (0-70)" 
                min="0" 
                max="70" 
                value={typedMarks}
                onChange={handleMarksTextChange}
                onFocus={() => setMarksBorderRed(false)}
                autoComplete="off"
              />
            </div>
            <div className="slider-container">
              <input 
                type="range" 
                id="marks-slider" 
                className="marks-slider" 
                min="0" 
                max="70" 
                value={sliderMarks}
                onChange={handleSliderChange}
              />
            </div>
            <button className="btn btn-primary" id="btn-predict" onClick={handleCheckResult}>
              Check Result 🔮
            </button>
          </div>
        )}

        {/* STEP 3 & 4: Result display and message card */}
        {step === 'result' && (
          <div className="result-panel active" id="result-panel">
            <div className="emoji-preview" id="result-emoji">
              {resultEmoji}
            </div>

            <div className="result-card">
              <div className="result-main" id="result-main">{resultMain}</div>
              <div className="result-funny" id="result-funny">&ldquo;{resultFunny}&rdquo;</div>
            </div>

            {/* Message card for Jay */}
            <div className="message-card" id="message-card">
              {!messageSent ? (
                <div className="message-form-state" id="message-form-state">
                  <div className="message-card-title">💬 Message for Jay</div>
                  <div className="textarea-wrapper">
                    <textarea 
                      id="jay-message" 
                      className={`message-textarea ${messageShake ? 'shake' : ''}`}
                      style={{ borderColor: messageBorderRed ? 'red' : '' }}
                      placeholder="Kuch Jay ko batana chahte ho? 😊" 
                      maxLength={300}
                      value={feedbackMsg}
                      onChange={(e) => {
                        setFeedbackMsg(e.target.value);
                        setMessageBorderRed(false);
                      }}
                      onFocus={() => setMessageBorderRed(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      rows={3}
                    ></textarea>
                    <div className="char-counter" id="char-counter">
                      {feedbackMsg.length} / 300
                    </div>
                  </div>
                  <button className="btn btn-primary" id="btn-send-message" onClick={handleSendMessage}>
                    📨 Send Message to Jay
                  </button>
                  <div className="message-note">Your message will be seen by Jay 😊</div>
                </div>
              ) : (
                <div className="success-state active" id="success-state">
                  <div className="success-icon">🎉</div>
                  <div className="success-text">✅ Thanks {userName}! Tumhara message Jay tak pahunch gaya.</div>
                  <button className="btn btn-secondary" id="btn-predict-again" onClick={handlePredictAgain}>
                    Predict Again 🔄
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="footer">
          Designed with ❤️ &bull; 100% Fun Predicted
        </div>
      </div>
    </>
  );
}
