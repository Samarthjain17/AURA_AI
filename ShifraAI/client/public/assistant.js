// 🚀 AURA AI - The Ultimate SaaS Embed Script (Voice + UI + DSP Visualizer) 🚀

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
        .aura-mic-btn { width: 55px; height: 55px; border-radius: 50%; background: #ef4444; color: white; border: none; cursor: pointer; font-size: 24px; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); transition: all 0.1s ease; display: flex; justify-content: center; align-items: center; }
        /* Notice: Removed CSS pulse animation because we now use Real-Time JS visualization */
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

    // 4. 🚀 BACKEND API CALL 🚀
    async function askAuraBackend(userMessage) {
        appendMessage("Thinking...", 'ai');
        const thinkingNode = chatBody.lastChild;

        try {
            const response = await fetch(`${serverUrl}/api/widget/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, message: userMessage })
            });

            const data = await response.json();
            chatBody.removeChild(thinkingNode);

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

    // 5. AI Text-to-Speech
    function speakText(text) {
        if (!text) return;
        stopAISpeaking(); 
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
    }

    // 6. 🔥 THE VOICE & DSP ENGINE (Speech-to-Text & Real-time Visualizer) 🔥
    const micBtn = document.getElementById('aura-mic-btn');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-IN'; 
    } else {
        console.error("Speech Recognition not supported in this browser.");
    }

    let isListening = false;
    let audioContext;
    let analyser;
    let microphone;
    let dataArray;
    let animationId;

    function stopAISpeaking() {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
    }

    // 🎛️ Real-time Audio Frequency Analyzer (FFT)
    async function startVisualizer() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256; 
            
            microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            // Set base active state color
            micBtn.style.background = '#22c55e';
            visualize();
        } catch (err) {
            console.error("Microphone access denied for visualizer", err);
            // Fallback appearance if mic access is blocked but recognition still runs
            micBtn.style.background = '#22c55e';
            micBtn.style.transform = `scale(1.1)`;
            micBtn.style.boxShadow = `0 0 15px rgba(34, 197, 94, 0.6)`;
        }
    }

    function visualize() {
        if (!isListening) {
            resetMicStyle();
            return;
        }

        animationId = requestAnimationFrame(visualize);
        analyser.getByteFrequencyData(dataArray);

        // Calculate average amplitude
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        let avgAmplitude = sum / dataArray.length;

        // Map frequency data to UI scale and glow
        let scale = 1 + (avgAmplitude / 256) * 0.5; // Max scale will be around 1.5
        let glow = avgAmplitude * 0.8;

        micBtn.style.transform = `scale(${scale})`;
        micBtn.style.boxShadow = `0 0 ${glow}px rgba(34, 197, 94, 0.8)`;
    }

    function stopVisualizer() {
        if (animationId) cancelAnimationFrame(animationId);
        if (microphone) microphone.disconnect();
        if (audioContext && audioContext.state !== 'closed') audioContext.close();
        resetMicStyle();
    }

    function resetMicStyle() {
        micBtn.style.background = '#ef4444';
        micBtn.style.transform = `scale(1)`;
        micBtn.style.boxShadow = `0 4px 15px rgba(239, 68, 68, 0.4)`;
    }

    // Mic Click Event
    micBtn.addEventListener('click', () => {
        if (!recognition) return alert("Your browser doesn't support Voice AI.");

        if (isListening) {
            recognition.stop();
            stopVisualizer();
        } else {
            stopAISpeaking(); 
            recognition.start();
            startVisualizer(); 
        }
    });

    recognition.onstart = () => {
        isListening = true;
    };

    recognition.onend = () => {
        isListening = false;
        stopVisualizer();
    };

    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        appendMessage(transcript, 'user');
        await askAuraBackend(transcript);
    };

})();