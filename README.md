# Civic Issue Reporting System

## Overview
This project is a full-stack civic issue reporting application focused on real-world engineering concepts. Citizens can upload or capture a photo of damaged infrastructure, get the issue classified by an AI model, generate an official complaint letter automatically, and track the issue through a dashboard.

## Architecture

1. Frontend: React + CSS
   - Captures user uploads, location, and user input.
   - Calls the AI service for classification and letter generation.
   - Saves complaint data to Firebase Firestore and image files to Firebase Storage.
   - Uses browser Geolocation API and Leaflet/OpenStreetMap for location mapping.

2. Backend AI Service: Python + FastAPI
   - Receives images and returns predicted issue type.
   - Generates a formal complaint letter from the predicted class, location, and user input.
   - Can be deployed independently on Render or Railway.

3. Machine Learning: TensorFlow + OpenCV
   - Provides a training script for transfer learning on civic issue images.
   - Uses MobileNetV2 as a pretrained backbone for image classification.

4. Database & Auth: Firebase
   - Authentication with Firebase Auth.
   - Firestore for complaint records.
   - Firebase Storage for uploaded photos.

## Why these technologies?

- React: fast, component-based UI for building single-page applications.
- Firebase: free-tier backend, real-time database, auth, and storage without provisioning servers.
- FastAPI: lightweight Python API framework ideal for serving ML inference.
- TensorFlow: industry-standard for computer vision and transfer learning.
- Leaflet + OpenStreetMap: free mapping without Google Maps billing.

## Folder structure

- `frontend/` - React app and UI logic
- `backend/` - Python AI service for classification and letter generation
- `ml/` - Training script, dataset organization, and model preparation

## Getting started

### Frontend
1. Open `frontend`.
2. Run `npm install`.
3. Create Firebase project and configure `frontend/src/firebaseConfig.js`.
4. Run `npm run dev`.

### Backend
1. Open `backend`.
2. Run `python -m venv .venv` and activate it.
3. Run `pip install -r requirements.txt`.
4. Start with `uvicorn app:app --reload --host 0.0.0.0 --port 8000`.

### ML training
1. Open `ml`.
2. Install TensorFlow and dependencies.
3. Add labeled images under `ml/dataset/train` and `ml/dataset/val`.
4. Run `python train.py` to create `models/civic_issue_classifier`.
