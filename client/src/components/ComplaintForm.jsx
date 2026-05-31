import { useState, useRef } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { Alert, LoadingSpinner } from './index';
import { FiMapPin, FiCamera, FiX } from 'react-icons/fi';

export const ComplaintForm = ({ onSuccess }) => {
  const { createComplaint, loading, error, setError } = useComplaints();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    description: '',
    image: '',
    location: { lat: null, lng: null },
  });
  const [alert, setAlert] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [locationSelected, setLocationSelected] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({
          ...prev,
          image: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          }));
          setLocationSelected(true);
          setAlert({
            type: 'success',
            message: 'Location captured successfully',
          });
        },
        (error) => {
          setAlert({
            type: 'error',
            message: 'Failed to get location. Please enable location services.',
          });
        }
      );
    } else {
      setAlert({
        type: 'error',
        message: 'Geolocation is not supported by your browser',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    // Validation
    if (!formData.name.trim()) {
      setAlert({ type: 'error', message: 'Name is required' });
      return;
    }

    if (!formData.phone.trim()) {
      setAlert({ type: 'error', message: 'Phone number is required' });
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      setAlert({ type: 'error', message: 'Invalid phone number (10 digits required)' });
      return;
    }

    if (!formData.address.trim()) {
      setAlert({ type: 'error', message: 'Address is required' });
      return;
    }

    if (!formData.description.trim()) {
      setAlert({ type: 'error', message: 'Description is required' });
      return;
    }

    if (!formData.image) {
      setAlert({ type: 'error', message: 'Image is required' });
      return;
    }

    if (!locationSelected) {
      setAlert({ type: 'error', message: 'Location is required' });
      return;
    }

    try {
      const response = await createComplaint(formData);
      setAlert({
        type: 'success',
        message: `Complaint submitted successfully! Tracking ID: ${response.trackingId}`,
      });

      // Reset form
      setFormData({
        name: '',
        phone: '',
        address: '',
        description: '',
        image: '',
        location: { lat: null, lng: null },
      });
      setImagePreview(null);
      setLocationSelected(false);

      // Call success callback
      if (onSuccess) {
        setTimeout(() => onSuccess(response), 2000);
      }
    } catch (error) {
      // Error is already set in context
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit a Complaint</h2>

      {alert && (
        <div className="mb-6">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            autoClose={alert.type === 'success'}
          />
        </div>
      )}

      {error && (
        <div className="mb-6">
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
            autoClose={true}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="10-digit phone number"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Address *
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter the location of the waste"
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the waste management issue"
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Image *
          </label>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FiCamera size={18} />
              <span>Choose Image</span>
            </button>
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData((prev) => ({ ...prev, image: '' }));
                  }}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <button
            type="button"
            onClick={handleGetLocation}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <FiMapPin size={18} />
            <span>Get Current Location</span>
          </button>
          {locationSelected && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Location captured: {formData.location.lat?.toFixed(4)}, {formData.location.lng?.toFixed(4)}
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Submitting...</span>
            </>
          ) : (
            <span>Submit Complaint</span>
          )}
        </button>
      </form>
    </div>
  );
};
