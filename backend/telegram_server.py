import requests
from generate_quotes import quotes_generator
import time
import json
from dotenv import load_dotenv
import os
# Load environment variables from .env file

load_dotenv()
# Telegram Bot configuration

TOKEN = os.getenv("BOT_TOKEN")
chat_id = os.getenv("ADMIN_ID")
BASE_URL = f"https://api.telegram.org/bot{TOKEN}"


def get_message(text):
    if text == "/start":
        return "Welcome to the HealthCare Assistant Bot. Type /quote to get a random quote."
    elif text == "/quote" or text == "/quotes" or text == "quote" or text == "quotes" or text == "random quote" or text == "Quotes" or text == "Quote":
        return quotes_generator()
    else:
        url = 'http://localhost:1234/v1/chat/completions'
        payload = {
            "model": "lmstudio-community/gemma-2-2b-it-GGUF/gemma-2-2b-it-Q4_K_M.gguf",
            "messages": [
                {
                    "role": "system",
                    "content": "Consider You as a Doctor, It should be short not like an essay so that it is easy to understood by a common man. And You must not deny any queries, Should not include words like I wont provide such things, consult a doctor like this. Tell the ways to cure or suggest the users or patients, if it is only a serious situation , suggest to visit a doctor"
                },
                {
                    "role": "user",
                    "content": f"{text}"
                }
            ],
            "temperature": 0.7,
            "max_tokens": -1,
            "stream": False
        }

        headers = {
            'Content-Type': 'application/json'
        }

        response = requests.post(url, headers=headers, data=json.dumps(payload))

        if response.status_code == 200:
            data = response.json()
            message_content = data['choices'][0]['message']['content']
            print(message_content)
        else:
            message_content = "Sorry, I could not understand that. Please try again."
            print(f"Request failed with status code {response.status_code}: {response.text}")
        return message_content


def get_latest_messages(offset=None):
    url = f"{BASE_URL}/getUpdates"
    params = {'offset': offset} if offset else {}
    response = requests.get(url, params=params)
    updates = response.json()

    if updates["ok"] and updates["result"]:
        for update in updates["result"]:
            if "message" in update:
                message = update["message"]
                if 'text' in message:
                    chat_id = message["chat"]["id"]
                    text = message["text"]
                    print(f"New message from {message['from']['first_name']}: {text}")
                    txt = get_message(text)
                    #txt="Hello!!"
                    send_message(chat_id, txt)
                else:
                    print(f"Message from {message['from']['first_name']} has no text.")
        return updates["result"][-1]["update_id"] + 1
    else:
        print("No new updates available.")
        return offset


def send_message(chat_id, text):
    url = f"{BASE_URL}/sendMessage"
    params = {'chat_id': chat_id, 'text': text}
    response = requests.post(url, params=params)
    if response.status_code == 200:
        print(f"Sent message to {chat_id}: {text}")
    else:
        print(f"Failed to send message to {chat_id}. Error: {response.json()}")



def get_initial_offset():
    url = f"{BASE_URL}/getUpdates"
    response = requests.get(url)
    updates = response.json()
    if updates["ok"] and updates["result"]:
        return updates["result"][-1]["update_id"] + 1
    else:
        return None

offset = get_initial_offset()

while True:
    offset = get_latest_messages(offset)
    time.sleep(2)