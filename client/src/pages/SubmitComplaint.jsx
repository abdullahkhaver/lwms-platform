import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components';
import { ComplaintForm } from '../components/ComplaintForm';

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const handleSuccess = (response) => {
    setSubmitted(true);
    setTimeout(() => {
      navigate('/my-complaints');
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complaint Submitted Successfully!
            </h2>
            <p className="text-gray-600 mb-4">
              Your complaint has been submitted to the LWMS team. You will be redirected to your
              complaints page shortly.
            </p>
            <p className="text-sm text-gray-500">Redirecting in 3 seconds...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <ComplaintForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
