import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

const Schedule: React.FC = () => {
  const events = [
    { id: 1, title: 'Weekly Engineering Sync', time: 'Today, 10:00 AM', status: 'Upcoming' },
    { id: 2, title: 'Product Roadmap Review', time: 'Tomorrow, 2:00 PM', status: 'Scheduled' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Meeting Schedule</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {events.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {events.map((event) => (
              <div key={event.id} className="p-6 hover:bg-slate-50 transition-colors flex justify-between items-center">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                    <div className="flex items-center text-slate-500 mt-1 space-x-4">
                      <span className="flex items-center text-sm"><Clock size={14} className="mr-1"/> {event.time}</span>
                      <span className="flex items-center text-sm"><MapPin size={14} className="mr-1"/> Virtual Room</span>
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase rounded-full">
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            No upcoming meetings found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;