import { useState } from 'react';
import PropTypes from 'prop-types';
import { saveComplaint } from '../firebaseConfig.js';
import { uploadImageToCloudinary } from '../cloudinaryConfig.js';
import { reverseGeocode } from '../utils/locationUtils.js';

const ML_SERVICE_URL = 'http://localhost:8000/classify';

function UploadForm({ user }) {
  const [file, setFile] = useState(null);
  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Pothole');
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);
  const [locationInput, setLocationInput] = useState('');

  async function requestLocation() {
    if (!navigator.geolocation) {
      setStatus('Geolocation API not supported by this browser.');
      return;
    }

    setStatus('Requesting location...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setStatus('Capturing address from coordinates...');
        const place = await reverseGeocode(lat, lng);
        setLocation(place);
        setStatus(`Location captured: ${place.label}`);
      },
      (error) => {
        setStatus(`Location error: ${error.message}`);
      }
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || (!location && !locationInput)) {
      setStatus('Please attach a photo and provide or capture location first.');
      return;
    }

    try {
      setStatus('Sending image to AI service...');
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(ML_SERVICE_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('AI service failed. Check the backend logs.');
      }

      const payload = await response.json();
      setResult(payload);
      setStatus('Classification complete. Uploading image...');

      const imageUrl = await uploadImageToCloudinary(file);
      setStatus('Saving complaint...');

      const locationPayload = location
        ? location
        : { address: locationInput };

      const complaint = {
        userId: user?.uid || 'anonymous',
        issueType: payload.prediction,
        severity,
        description,
        location: locationPayload,
        locationText: location?.label || locationInput,
        complaintLetter: payload.letter,
        status: 'Submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        resolvedAt: null,
        imageUrl,
        assignedTo: null,
        notes: [],
      };

      await saveComplaint(complaint);
      setStatus('Complaint saved successfully.');
    } catch (error) {
      console.error('Complaint save failed:', error);
      setStatus(`Save failed: ${error.message}`);
    }
  }

  return (
    <section className="upload-form">
      <h2>Report a Civic Issue</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Photo of the issue
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setFile(event.target.files[0])}
          />
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the issue in a few words"
          />
        </label>

        <label>
          Issue category
          <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
            <option value="Pothole">Pothole</option>
            <option value="Garbage">Garbage</option>
          </select>
        </label>

        <label>
          Location (optional)
          <input
            type="text"
            value={locationInput}
            onChange={(event) => setLocationInput(event.target.value)}
            placeholder="Enter address or landmark"
          />
        </label>

        <button type="button" onClick={requestLocation}>
          Capture Location
        </button>

        <button type="submit">Submit Report</button>
      </form>

      {location && (
        <div className="location-info">
          <strong>Captured location:</strong> {location.label}
          {(location.city || location.state) && (
            <div className="location-detail">
              {location.city ? location.city : ''}
              {location.city && location.state ? ', ' : ''}
              {location.state || ''}
            </div>
          )}
        </div>
      )}
      {!location && locationInput && (
        <div className="location-info">
          Entered location: {locationInput}
        </div>
      )}

      {result && (
        <div className="result-card">
          <strong>AI Prediction:</strong> {result.prediction}
          <p>{result.letter}</p>
        </div>
      )}

      <p className="status">{status}</p>
    </section>
  );
}

UploadForm.propTypes = {
  user: PropTypes.shape({
    uid: PropTypes.string,
    email: PropTypes.string,
  }),
};

export default UploadForm;


