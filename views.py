from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .ml_model import predict_image

from .disease_info import DISEASE_INFO
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import requests
import os
import re
import fitz  # PyMuPDF


# ============ LOAD PDF ONCE ============

PDF_PATH = os.path.join(os.path.dirname(__file__), "organic cure.txt")

PDF_TEXT = ""

def load_pdf():
    global PDF_TEXT

    try:
        doc = fitz.open(PDF_PATH)

        text = ""
        for page in doc:
            text += page.get_text()

        PDF_TEXT = text.lower()

        print("PDF Loaded Successfully")
        print("Total characters:", len(PDF_TEXT))

    except Exception as e:
        print("PDF load error:", e)

load_pdf()


# ============ SEARCH FUNCTION ============

def search_answer(question):

    question = question.lower()
    words = question.split()

    pattern = r"\d+\).*?(?=\n\d+\)|$)"
    sections = re.findall(pattern, PDF_TEXT, re.DOTALL)

    if "disease" in question:
        sections = [s for s in sections if "disease" in s]

    best_section = ""
    best_score = 0

    for sec in sections:

        score = 0

        for word in words:
            if word in sec:
                score += 1

        # avoid generic sections
        if "common" in sec and score < 3:
            continue

        if score > best_score:
            best_score = score
            best_section = sec

    if best_section:
        return best_section.strip()

    return "Answer not found."

# ============ ASK QUESTION API ============

@csrf_exempt
def ask_question(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            question = data.get("question", "")

            if not question:
                return JsonResponse({"answer": "Please enter a valid question."})

            pdf_answer = search_answer(question)
            final_answer = generate_ai_answer(question, pdf_answer)

            return JsonResponse({
                "answer": final_answer
            })

        except Exception as e:
            return JsonResponse({
                "answer": "Server error occurred.",
                "error": str(e)
            })

    return JsonResponse({"answer": "Only POST method allowed."})


#gemini api
GEMINI_API_KEY = "your api key"
def generate_ai_answer(question, pdf_text):

    question_lower = question.lower()

    if any(word in question_lower for word in ["disease", "blight", "rust", "spot"]):
        prompt = f"""
You are an agriculture expert.

Give answer strictly in this format:

**🌿 Organic Solution:**
- ...
**🧪 Chemical Solution:**
- ...
**📌 Prevention:**
- ...

Context:
{pdf_text[:800]}
Question:
{question}
"""
    else:
        prompt = f"""
Explain clearly:

Context:
{pdf_text[:800]}

Question:
{question}
"""

    try:
        url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"

        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ]
        }

        response = requests.post(url, json=payload)
        data = response.json()

        print("FULL RESPONSE:", data)

        if "candidates" in data:
            return data["candidates"][0]["content"]["parts"][0]["text"]
        elif "error" in data:
            print("API ERROR:", data)
            return "⚠️ Daily limit reached. Try again tomorrow."
        else:
            return "⚠️ API Error or limit reached. Try later."

    except Exception as e:
        return "⚠️ Daily API limit reached. Try again tomorrow."


@api_view(['POST'])
def predict_crop(request):

    print("FILES:", request.FILES)

    if 'image' not in request.FILES:
        return Response(
            {'error': 'no image provided'},
            status=status.HTTP_400_BAD_REQUEST
        )

    image = request.FILES['image']
    result = predict_image(image)


    return Response({
        'prediction': result["prediction"],
        'confidence': round(result["confidence"] * 100 ,2),
        "solution": result["solution"],
    "prevention": result["prevention"],
        'message':"Prediction successful"
    })
