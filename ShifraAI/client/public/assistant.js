// 🚀 AURA AI - The Ultimate SaaS Embed Script (Voice + UI) 🚀

(function() {
    const currentScript = document.currentScript;
    const userId = currentScript.getAttribute('data-user-id');
    const serverUrl = "http://localhost:8000"; // Tumhara Backend URL

    if (!userId) {
        console.error("❌ AURA AI: data-user-id is missing in the script tag!");
        return;
    }

    // 1. CSS Inject karna
    const style = document.createElement('style');
    style.innerHTML = `
        .aura-floating-btn { position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 999999; font-size: 28px; display: flex; align-items: center; justify-content: center; transition: transform 0.3s ease; }
        .aura-floating-btn:hover { transform: scale(1.1); }
        .aura-chat-window { position: fixed; bottom: 90px; right: 20px; width: 350px; height: 500px; background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); z-index: 999999; display: none; flex-direction: column; overflow: hidden; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #f3f4f6; }
        .aura-header { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; padding: 20px; text-align: center; font-weight: 600; font-size: 18px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .aura-body { flex: 1; padding: 20px; overflow-y: auto; background: #f9fafb; display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth; }
        .aura-controls { padding: 15px; background: white; border-top: 1px solid #f3f4f6; display: flex; justify-content: center; align-items: center; }
        .aura-mic-btn { width: 55px; height: 55px; border-radius: 50%; background: #ef4444; color: white; border: none; cursor: pointer; font-size: 24px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); transition: all 0.3s ease; display: flex; justify-content: center; align-items: center; }
        .aura-mic-btn.listening { animation: aura-pulse 1.5s infinite; background: #22c55e; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4); }
        
        @keyframes aura-pulse { 
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } 
            70% { transform: scale(1.1); box-shadow: 0 0 0 15px rgba(34, 197, 94, 0); } 
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } 
        }

        .aura-msg { max-width: 85%; padding: 12px 16px; border-radius: 14px; font-size: 14px; line-height: 1.5; word-wrap: break-word; }
        .aura-msg.ai { background: white; color: #374151; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border: 1px solid #f3f4f6;}
        .aura-msg.user { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; align-self: flex-end; border-bottom-right-radius: 4px; box-shadow: 0 2px 5px rgba(99, 102, 241, 0.2); }
    `;
    document.head.appendChild(style);

    // 2. HTML Elements Create Karna
    const container = document.createElement('div');
    container.id = "aura-widget-container";

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'aura-floating-btn';
    toggleBtn.innerHTML = '✨'; 

    const chatWindow = document.createElement('div');
    chatWindow.className = 'aura-chat-window';
    chatWindow.innerHTML = `
        <div class="aura-header">AURA AI Voice Agent</div>
        <div class="aura-body" id="aura-chat-body">
            <div class="aura-msg ai">Hi! Tap the mic and ask me anything.</div>
        </div>
        <div class="aura-controls">
            <button class="aura-mic-btn" id="aura-mic-btn">🎙️</button>
        </div>
    `;

    container.appendChild(chatWindow);
    container.appendChild(toggleBtn);
    document.body.appendChild(container);

    // 3. Widget Toggle Logic
    let isOpen = false;
    const chatBody = document.getElementById('aura-chat-body');
    
    toggleBtn.addEventListener('click', () => {
        isOpen = !isOpen;
        chatWindow.style.display = isOpen ? 'flex' : 'none';
        toggleBtn.innerHTML = isOpen ? '✖' : '✨';
    });

    // Helper: Add Message to UI
    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `aura-msg ${sender}`;
        msgDiv.innerText = text;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight; // Auto-scroll
    }

    // 4. 🔥 THE VOICE ENGINE (Speech-to-Text & Text-to-Speech) 🔥
    const micBtn = document.getElementById('aura-mic-btn');
    
    // Browser compatibility for Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-IN'; // Indian English
    } else {
        console.error("Speech Recognition not supported in this browser.");
    }

    let isListening = false;

    // 🔥 TRUE BARGE-IN: AI bol raha hai aur mic dabaya toh AI chup
    function stopAISpeaking() {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
    }

    micBtn.addEventListener('click', () => {
        if (!recognition) return alert("Your browser doesn't support Voice AI.");

        if (isListening) {
            recognition.stop();
        } else {
            stopAISpeaking(); // Barge-in Triggered!
            recognition.start();
        }
    });

    // Jab Sunna shuru kare
    recognition.onstart = () => {
        isListening = true;
        micBtn.classList.add('listening');
    };

    // Jab Sunna band kare
    recognition.onend = () => {
        isListening = false;
        micBtn.classList.remove('listening');
    };

    // Jab User bol kar ruk jaye (Text mile)
    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        appendMessage(transcript, 'user');
        
        // Backend API Call karenge
        await askAuraBackend(transcript);
    };

    // 5. 🚀 BACKEND API CALL 🚀
    async function askAuraBackend(userMessage) {
        // UI mein thinking dikhana
        appendMessage("Thinking...", 'ai');
        const thinkingNode = chatBody.lastChild;

        try {
            const response = await fetch(`${serverUrl}/api/widget/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, message: userMessage })
            });

            const data = await response.json();
            
            // Thinking message hatao
            chatBody.removeChild(thinkingNode);

            // 🔥 NAYA FIX: Agar backend se error aaya hai
            if (!response.ok || data.error) {
                const errorMsg = data.error || "Server connection failed.";
                appendMessage("❌ " + errorMsg, 'ai');
                speakText(errorMsg);
                return;
            }

            if (data.action === "navigate") {
                appendMessage(`Navigating to ${data.path}...`, 'ai');
                speakText(`Navigating to ${data.path}`);
                setTimeout(() => {
                    window.location.href = data.path; 
                }, 1500);
            } else {
                appendMessage(data.answer, 'ai');
                speakText(data.answer);
            }

        } catch (error) {
            console.error("Widget API Error:", error);
            chatBody.removeChild(thinkingNode);
            appendMessage("Sorry, my servers are currently down. 🧘‍♂️", 'ai');
            speakText("Sorry, my servers are currently down.");
        }
    }

    // 6. AI Text-to-Speech
    function speakText(text) {
        if (!text) return;
        stopAISpeaking(); // Purani aawaz roko naya bolne se pehle
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
    }

})();