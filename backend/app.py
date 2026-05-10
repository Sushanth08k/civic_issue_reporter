from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from model import load_model, predict_issue
from letter_generator import generate_complaint_letter

app = FastAPI(title='Civic Issue AI Service')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

model = load_model()

@app.post('/classify')
async def classify_issue(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()
        prediction = predict_issue(image_bytes)
        letter = generate_complaint_letter(
            issue_type=prediction,
            location='[captured location]',
            description='Automated report for civic issue',
        )
        return {
            'prediction': prediction,
            'letter': letter,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

if __name__ == '__main__':
    uvicorn.run('app:app', host='0.0.0.0', port=8000, reload=True)
