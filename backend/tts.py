import pyttsx3
import threading

def tts(content):
    def speak():
        engine = pyttsx3.init()
        engine.say(content)
        engine.runAndWait()

    thread = threading.Thread(target=speak)
    thread.start()