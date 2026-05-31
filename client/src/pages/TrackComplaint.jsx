import { Navbar } from '../components';
import { ComplaintTracker } from '../components/ComplaintTracker';

export default function TrackComplaint() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <ComplaintTracker />
      </div>
    </div>
  );
}
