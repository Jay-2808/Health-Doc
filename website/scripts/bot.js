const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");
const cameraButton = document.querySelector("#camera-btn");
const fileInput = document.getElementById("fileInput");

let userText = null;

const loadDataFromLocalstorage = () => {
    const themeColor = localStorage.getItem("themeColor");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class="default-text">
                            <h1>Health Doc</h1>
                            <p>Hi! I am Health Doc, your personal health assistant. How can I help you today?</p>
                        </div>`;

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const createChatElement = (content, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv;
};

const getChatCompletion = async () => {
    const prompt = chatInput.value.trim();
    if (!prompt) return;

    const outgoingHtml = `<div class="chat-content">
                            <div class="chat-details">
                                <img src="images/user.png" alt="user-img">
                                <p>${prompt}</p>
                            </div>
                          </div>`;
    const outgoingChatDiv = createChatElement(outgoingHtml, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    chatInput.value = "";

    const responseBox = chatContainer;
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/health-icon.png" alt="chatbot">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                  </div>`;
    const incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    const response = await fetch('http://localhost:1234/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: "lmstudio-community/gemma-2-2b-it-GGUF/gemma-2-2b-it-Q4_K_M.gguf",
            messages: [
                { role: "system", content: "Consider You as a Doctor, It should be short not like an essay so that it is easy to understood by a common man. And You must not deny any queries, Should not include words like I wont provide such things, consult a doctor like this. Tell the ways to cure or suggest the users or patients, if it is only a serious situation , suggest to visit a doctor" },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: -1,
            stream: false
        }),
    });


    const data = await response.json();
    let messageContent = data.choices[0].message.content;
    console.log(messageContent);

    messageContent = messageContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    messageContent = messageContent.replace(/\*(.*?)\*/g, '<em>$1</em>');

    const pElement = document.createElement("p");
    pElement.innerHTML = messageContent;
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);

    localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    fetch('http://127.0.0.1:5000/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: messageContent
        })
      })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
    
    localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    displayTypingEffect(pElement, messageContent);
};

function displayTypingEffect(element, text) {
    let i = 0;
    const typingSpeed = 5;
    let currentText = '';

    function typeCharacter() {
        if (i < text.length) {
            const nextChar = text.charAt(i);

            if (nextChar === '<') {
                const endTagIndex = text.indexOf('>', i);
                if (endTagIndex !== -1) {
                    currentText += text.substring(i, endTagIndex + 1);
                    i = endTagIndex + 1;
                }
            } else {
                currentText += nextChar;
                i++;
            }

            element.innerHTML = currentText;
            element.scrollTop = element.scrollHeight;
            setTimeout(typeCharacter, typingSpeed);
        } else {
            element.innerHTML += '<br>';
            element.scrollTop = element.scrollHeight;
        }
    }

    typeCharacter();
}

function clearChat() {
    document.getElementById('responseBox').innerHTML = '';
}

cameraButton.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", (e) => {
    let lat;
    let long;
    const success = (position) => {
        lat = position.coords.latitude;
        long = position.coords.longitude;
    };
    const error = () => {
        console.log("unable to access location");
    };

    navigator.geolocation.getCurrentPosition(success, error);

    const selectedFile = e.target.files[0];
    if (selectedFile) {
        let reply = null;
        const pElement = document.createElement("p");

        const formData = new FormData();
        formData.append("img", selectedFile);
        formData.append("lat", lat);
        formData.append("long", long);

        fetch('http://127.0.0.1:5050/predict', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                reply = data.data;
                const incomingChatDiv = createChatElement(html, "incoming");
                chatContainer.appendChild(incomingChatDiv);
                chatContainer.scrollTo(0, chatContainer.scrollHeight);

                pElement.textContent = reply;
                incomingChatDiv.querySelector(".typing-animation").remove();
                incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
                localStorage.setItem("all-chats", chatContainer.innerHTML);
                chatContainer.scrollTo(0, chatContainer.scrollHeight);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
});

deleteButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        getChatCompletion();
    }
});

loadDataFromLocalstorage();
sendButton.addEventListener("click", getChatCompletion);
