from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from rag_retriever import format_context_for_llm
from cereb import get_response
import time

app = Flask(__name__)
CORS(app)

clinical_diagnosis_schema = {
    "type": "object",
    "properties": {
        "possible_conditions": {
            "type": "string"
        },
        "immediate_next_steps": {
            "type": "string"
        },
        "emergency": {
            "type": "object",
            "properties": {
                "basic_info": {
                    "type": "string"
                },
                "level": {
                    "type": "string",
                    "enum": ["high risk", "medium risk", "low risk"]
                }
            },
            "required": ["basic_info", "level"],
            "additionalProperties": False
        },
        "family_instructions": {
            "type": "string"
        }
    },
    "required": ["possible_conditions", "immediate_next_steps", "emergency", "family_instructions"],
    "additionalProperties": False
}



@app.route('/')
def hello():
    return 'hello wemakedevs :)'

@app.route('/diagnosis', methods=['GET', 'POST'])
def send_data():
    data = request.json
    symptoms = data.get('symptoms')
    to_send = get_response(symptoms)
    time.sleep(4)
    return json.dumps(to_send)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7000)