import React from 'react';
import { Link, useParams } from 'react-router-dom';

const FormBuilderWorkspace: React.FC = () => {
  const { formId } = useParams();
  const backToBuilderPath = formId ? `/builder/${formId}` : '/builder';

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <nav className="bg-[#0d0d0d] border-b border-[#1f1f1f] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={backToBuilderPath} className="flex items-center">
              <img src="/logoreal.png" alt="AdParlay" className="h-7 w-auto" />
            </Link>
            <Link
              to={backToBuilderPath}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1a1a1a] border border-[#333] text-[13px] text-[#ddd] hover:text-white hover:border-[#555] transition-colors"
            >
              <span>←</span>
              Back to Builder
            </Link>
          </div>
        </div>
      </nav>

      <div className="px-3 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-5">
            <h1 className="text-[20px] sm:text-2xl font-semibold text-white">Builder Workspace</h1>
            <p className="text-[13px] text-[#777] mt-1">Lead Activity and Team Collaboration are managed here.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden h-full min-h-[220px]">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#1f1f1f]">
                <div className="w-6 h-6 rounded-md bg-[#1a1a1a] flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#777]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-white">Lead Activity Feed</div>
                  <div className="text-[11px] text-[#555]">Live response tracking</div>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] text-[#555]">Coming Soon</span>
              </div>
              <div className="px-4 py-3 space-y-2.5 opacity-40 pointer-events-none select-none">
                {[
                  { init: 'EO', name: 'Emeka O.', action: 'submitted this form', time: '2s ago', color: 'bg-blue-900 text-blue-300' },
                  { init: 'AK', name: 'Amara K.', action: 'received PDF summary', time: '18s ago', color: 'bg-purple-900 text-purple-300' },
                  { init: 'FB', name: 'Fatimah B.', action: 'submitted this form', time: '1m ago', color: 'bg-green-900 text-green-300' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${item.color}`}>{item.init}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-white"><span className="font-medium">{item.name}</span> <span className="text-[#777]">{item.action}</span></div>
                    </div>
                    <div className="text-[11px] text-[#555] whitespace-nowrap">{item.time}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden h-full min-h-[220px]">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#1f1f1f]">
                <div className="w-6 h-6 rounded-md bg-[#1a1a1a] flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#777]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-white">Team Collaboration</div>
                  <div className="text-[11px] text-[#555]">Real-time co-editing</div>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] text-[#555]">Coming Soon</span>
              </div>
              <div className="px-4 py-3 space-y-2.5 opacity-40 pointer-events-none select-none">
                {[
                  { init: 'TL', name: 'Tunde L.', role: 'Marketing Lead', status: 'Viewing analytics', grad: 'from-violet-700 to-purple-600' },
                  { init: 'SA', name: 'Sade A.', role: 'Sales Manager', status: 'Exporting leads', grad: 'from-purple-600 to-violet-500' },
                  { init: 'KB', name: 'Kola B.', role: 'Growth', status: 'Building form', grad: 'from-violet-500 to-purple-400' }
                ].map((member, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${member.grad} flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0`}>{member.init}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-white truncate">{member.name}</div>
                      <div className="text-[11px] text-[#555] truncate">{member.role}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-[11px] text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded-full whitespace-nowrap">{member.status}</div>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilderWorkspace;
