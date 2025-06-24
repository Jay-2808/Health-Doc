from flask import Flask,jsonify,request
from flask_cors import CORS
from dotenv import load_dotenv
from backend.tts import tts
from backend.generate_quotes import quotes_generator

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/tts', methods=['POST'])
def tts_send():
    data = request.json
    content = data.get('content', '')
    tts(content)
    return jsonify({"message": "Text-to-speech executed"}), 200

@app.route('/quotes', methods=['GET'])
def quotes():
    return jsonify({"quotes": quotes_generator()}), 200
    
if __name__ == '__main__':
    app.run(debug=True)