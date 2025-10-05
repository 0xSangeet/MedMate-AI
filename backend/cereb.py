from rag_retriever import format_context_for_llm
import json
from cerebras.cloud.sdk import Cerebras

def get_response(symptoms):
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

    client = Cerebras(
        api_key="csk-hfkh8thyvx8nm5h53fyd6rntwjy4k63dk25ppf28kx346ff8",
    )

    context = format_context_for_llm(symptoms)

    system_prompt = """You are a clinical decision support assistant for healthcare workers in rural and low-resource settings. 
    Your role is to help non-doctor healthcare workers assess patients and provide immediate guidance.

    You MUST base your diagnosis and recommendations on the MSF (Médecins Sans Frontières) medical guidelines provided in the context.
    If the context provided is not relevant to the symptoms, explicitly state that you are referencing standard MSF medical guidelines.

    Always prioritize patient safety and provide clear, actionable guidance appropriate for resource-limited settings."""

    user_prompt = f"""Context from MSF Medical Guidelines:
    {context}

    Patient Symptoms:
    {symptoms}

    Based on the symptoms and the MSF medical guidelines context provided above, provide:
    1. Possible conditions as a single concise paragraph listing differential diagnoses
    2. Immediate next steps as a single paragraph with clear, actionable steps
    3. Emergency assessment with basic information and risk level (must be exactly "high risk", "medium risk", or "low risk")
    4. Family instructions as a single paragraph with clear care instructions

    Format all responses as concise paragraphs, not as bullet points or lists.
    If the provided context is not sufficient or relevant, reference general MSF medical guidelines for the presenting symptoms."""


    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            }
        ],
        model="llama3.3-70b",
        response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "clinical_diagnosis_schema",
                    "strict": True,
                    "schema": clinical_diagnosis_schema
                }
            }
    )
    
    result = chat_completion.choices[0].message.content

    return json.loads(result)

if __name__ == "__main__":
    print('ok')