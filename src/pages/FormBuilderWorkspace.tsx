import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const FormBuilderWorkspace: React.FC = () => {
  const { formId } = useParams();
  const { currentUser } = useAuth();
  const isPremium = currentUser?.subscription === 'premium';
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
            <h1 className="text-[20px] sm:text-2xl font-semibold font-['Outfit'] text-white">Builder Workspace</h1>
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

          {/* Data Analysis Section */}
          <div className="mt-4 bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden min-h-[300px]">
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#1f1f1f]">
              <div className="w-6 h-6 rounded-md bg-[#1a1a1a] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-[#777]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-white">Advanced Data Analysis</div>
                <div className="text-[11px] text-[#555]">Business intelligence & reporting</div>
              </div>
              {!isPremium && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500">Premium Only</span>}
            </div>
            
            <div className="p-4 h-full">
              {isPremium ? (
                <div className="h-full flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
                      <div className="text-[11px] text-[#777] mb-1">Conversion Rate</div>
                      <div className="text-2xl font-bold text-white">42.8%</div>
                      <div className="text-[10px] text-green-400 mt-2">↑ 12% vs last month</div>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
                      <div className="text-[11px] text-[#777] mb-1">Average Time to Complete</div>
                      <div className="text-2xl font-bold text-white">1m 24s</div>
                      <div className="text-[10px] text-green-400 mt-2">↓ 5s vs last month</div>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
                      <div className="text-[11px] text-[#777] mb-1">Total Views</div>
                      <div className="text-2xl font-bold text-white">12,450</div>
                      <div className="text-[10px] text-green-400 mt-2">↑ 8% vs last month</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-col items-center justify-center py-6 border border-dashed border-[#2a2a2a] rounded-xl bg-[#161616]/50">
                    <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center mb-3 border border-[#8B5CF6]/20">
                      <svg className="w-5 h-5 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    </div>
                    <h3 className="text-[14px] font-semibold font-['Outfit'] text-white mb-1">Detailed Question-Level Analysis</h3>
                    <p className="text-[11px] text-[#555] mb-4 text-center max-w-xs">Deep dive into respondent behavior for each specific question with visual charts.</p>
                    <Link to={`/builder/${formId}/analytics`} className="inline-flex items-center gap-2 px-5 py-2 bg-[#8B5CF6] text-white text-[12px] font-semibold rounded-lg hover:bg-[#7C3AED] transition-colors shadow-lg shadow-[#8B5CF6]/10">
                      View Full Analytics Report
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 blur-sm pointer-events-none grid grid-cols-3 gap-4 p-4">
                    <div className="bg-[#333] rounded-lg"></div>
                    <div className="bg-[#333] rounded-lg"></div>
                    <div className="bg-[#333] rounded-lg"></div>
                    <div className="col-span-2 bg-[#333] rounded-lg h-[150px]"></div>
                    <div className="bg-[#333] rounded-lg h-[150px]"></div>
                  </div>
                  
                  <div className="relative z-10 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                      <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-[15px] font-semibold font-['Outfit'] text-white mb-2">Unlock Advanced Analytics</h3>
                    <p className="text-[13px] text-[#888] mb-6">Upgrade to Premium to visualize form performance, track conversions, and generate custom business intelligence reports.</p>
                    <Link to="/pricing" className="inline-flex items-center justify-center px-4 py-2 bg-white text-black text-[13px] font-semibold rounded-lg hover:bg-[#eee] transition-colors">
                      Upgrade to Premium
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilderWorkspace;
