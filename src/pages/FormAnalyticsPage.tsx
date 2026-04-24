import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend
} from 'recharts';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

interface FormQuestion {
  id: string;
  type: string;
  label: string;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
}

interface FormBlock {
  id: string;
  questions: FormQuestion[];
}

interface Form {
  id: string;
  title: string;
  blocks: FormBlock[];
}

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'];

const FormAnalyticsPage: React.FC = () => {
  const { formId } = useParams();
  const { currentUser } = useAuth();
  const isPremium = currentUser?.subscription === 'premium';
  
  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartPreferences, setChartPreferences] = useState<Record<string, 'pie' | 'bar' | 'donut'>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [exportTheme, setExportTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (!formId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const formDoc = await getDoc(doc(db, 'forms', formId));
        if (formDoc.exists()) {
          setForm({ id: formDoc.id, ...formDoc.data() } as Form);
        }

        const subQuery = query(collection(db, 'formSubmissions'), where('formId', '==', formId));
        const subSnap = await getDocs(subQuery);
        setSubmissions(subSnap.docs.map(d => d.data()));
      } catch (err) {
        console.error("Error fetching form analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formId]);

  const exportSingleChart = async (id: string, label: string) => {
    const element = document.getElementById(`chart-${id}`);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: exportTheme === 'dark' ? '#0d0d0d' : '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${label.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analytics.png`);
        }
      });
    } catch (err) {
      console.error("Error exporting chart:", err);
    }
  };

  const exportAllCharts = async () => {
    const element = document.getElementById('analytics-report');
    if (!element) return;

    setIsExporting(true);
    // Give time for layout adjustment if needed
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(element, {
          backgroundColor: exportTheme === 'dark' ? '#0d0d0d' : '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true
        });
        
        canvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, `${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_full_report.png`);
          }
        });
      } catch (err) {
        console.error("Error exporting report:", err);
      } finally {
        setIsExporting(false);
      }
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white">
        Form not found.
      </div>
    );
  }

  // If not premium, show the lock screen
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
        <nav className="bg-[#0d0d0d] border-b border-[#1f1f1f] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to={`/builder/${formId}`} className="flex items-center">
                <img src="/logoreal.png" alt="AdParlay" className="h-7 w-auto" />
              </Link>
              <Link
                to={`/builder/${formId}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#333] text-[13px] font-['Outfit'] font-bold text-[#ddd] hover:text-white hover:border-[#555] transition-all shadow-lg shadow-black/5"
              >
                <span>←</span>
                Back to Builder
              </Link>
            </div>
          </div>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 blur-md pointer-events-none grid grid-cols-1 md:grid-cols-2 gap-8 p-12">
            <div className="bg-[#333] rounded-xl h-64"></div>
            <div className="bg-[#333] rounded-xl h-64"></div>
            <div className="col-span-1 md:col-span-2 bg-[#333] rounded-xl h-64"></div>
          </div>
          
          <div className="relative z-10 max-w-md mx-auto bg-[#111] border border-[#2a2a2a] p-8 rounded-2xl shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold font-['Outfit'] text-white mb-3">Unlock Question Analytics</h2>
            <p className="text-[#888] mb-8">
              Upgrade to Premium to visualize how respondents are answering each specific question in your form. Generate beautiful charts and export your data.
            </p>
            <Link 
              to="/pricing" 
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-['Outfit'] font-black rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[#8B5CF6]/20"
            >
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get all questions from the form
  const allQuestions = form.blocks.flatMap(b => b.questions);

  const renderQuestionVisualization = (question: FormQuestion) => {
    // Collect answers for this question
    const answers = submissions
      .map(sub => sub.formData?.[question.id])
      .filter(val => val !== undefined && val !== null && val !== '');

    if (answers.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
          <span className="text-[#555] text-sm">No responses yet</span>
        </div>
      );
    }

    // Multiple Choice, Dropdown, Checkboxes
    if (['multiple_choice', 'dropdown', 'checkboxes'].includes(question.type)) {
      const type = chartPreferences[question.id] || 'donut';
      
      const flatAnswers = question.type === 'checkboxes' 
        ? answers.flatMap(a => Array.isArray(a) ? a : [a]) 
        : answers;

      const counts: Record<string, number> = {};
      flatAnswers.forEach(a => {
        counts[String(a)] = (counts[String(a)] || 0) + 1;
      });

      const data = Object.keys(counts).map(key => ({
        name: key,
        value: counts[key]
      })).sort((a, b) => b.value - a.value);

      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-[#2a2a2a]">
              {(['donut', 'pie', 'bar'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setChartPreferences(prev => ({ ...prev, [question.id]: t }))}
                  className={`px-3 py-1 text-[11px] font-['Outfit'] font-bold rounded-md transition-all ${
                    type === t ? 'bg-[#8B5CF6] text-white shadow-lg' : 'text-[#777] hover:text-[#aaa]'
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              onClick={() => exportSingleChart(question.id, question.label)}
              className="text-[11px] font-['Outfit'] font-bold text-[#555] hover:text-[#8B5CF6] transition-colors"
            >
              DOWNLOAD
            </button>
          </div>
          <div className="flex-1 h-64 overflow-x-auto">
            <div className="min-w-[300px] h-full" id={`chart-${question.id}`}>
              <ResponsiveContainer width="100%" height="100%">
                {type === 'bar' ? (
                  <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={exportTheme === 'light' ? '#eee' : '#2a2a2a'} vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke={exportTheme === 'light' ? '#333' : '#777'} 
                      tick={{ fill: exportTheme === 'light' ? '#333' : '#777', fontSize: 10 }} 
                      angle={-45} 
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis stroke={exportTheme === 'light' ? '#333' : '#777'} tick={{ fill: exportTheme === 'light' ? '#333' : '#777', fontSize: 10 }} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: '8px' }}
                      itemStyle={{ color: '#8B5CF6', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="45%"
                      innerRadius={type === 'donut' ? 60 : 0}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={false}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px', paddingTop: '20px', color: exportTheme === 'light' ? '#333' : '#777' }}
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );
    }

    // Linear Scale
    if (question.type === 'linear_scale') {
      const counts: Record<string, number> = {};
      const min = question.scaleMin || 1;
      const max = question.scaleMax || 5;
      
      // Initialize all possible values with 0
      for (let i = min; i <= max; i++) {
        counts[String(i)] = 0;
      }
      
      answers.forEach(a => {
        if (counts[String(a)] !== undefined) {
          counts[String(a)]++;
        }
      });

      const data = Object.keys(counts).map(key => ({
        name: key,
        count: counts[key]
      }));

      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-end mb-4">
            <button
              onClick={() => exportSingleChart(question.id, question.label)}
              className="text-[11px] font-['Outfit'] font-bold text-[#555] hover:text-[#8B5CF6] transition-colors"
            >
              DOWNLOAD
            </button>
          </div>
          <div className="flex-1 h-64 overflow-x-auto">
            <div className="min-w-[300px] h-full" id={`chart-${question.id}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={exportTheme === 'light' ? '#eee' : '#2a2a2a'} vertical={false} />
                  <XAxis dataKey="name" stroke={exportTheme === 'light' ? '#333' : '#777'} tick={{ fill: exportTheme === 'light' ? '#333' : '#777' }} />
                  <YAxis stroke={exportTheme === 'light' ? '#333' : '#777'} tick={{ fill: exportTheme === 'light' ? '#333' : '#777' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: '8px' }}
                    itemStyle={{ color: '#8B5CF6', fontSize: '12px', fontWeight: 'bold' }}
                    cursor={{ fill: exportTheme === 'light' ? '#f5f5f5' : '#2a2a2a' }}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );
    }

    // Text inputs (short answer, paragraph, email, etc.)
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-end mb-4">
          <button
            onClick={() => exportSingleChart(question.id, question.label)}
            className="text-[11px] font-['Outfit'] font-bold text-[#555] hover:text-[#8B5CF6] transition-colors"
          >
            DOWNLOAD
          </button>
        </div>
        <div 
          id={`chart-${question.id}`}
          className={`rounded-lg border overflow-hidden max-h-64 overflow-y-auto flex-1 ${exportTheme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`}
        >
          <ul className={`divide-y ${exportTheme === 'light' ? 'divide-gray-100' : 'divide-[#2a2a2a]'}`}>
            {answers.slice(0, 50).map((ans, i) => (
              <li key={i} className={`px-4 py-3 text-sm ${exportTheme === 'light' ? 'text-gray-700' : 'text-[#ddd]'}`}>
                {String(ans)}
              </li>
            ))}
            {answers.length === 0 && (
              <li className={`px-4 py-3 text-sm ${exportTheme === 'light' ? 'text-gray-400' : 'text-[#777]'}`}>No text responses yet.</li>
            )}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <nav className="bg-[#0d0d0d] border-b border-[#1f1f1f] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={`/builder/${formId}`} className="flex items-center">
              <img src="/logoreal.png" alt="AdParlay" className="h-7 w-auto" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-sm text-[#777]">
                <span className="text-white font-medium">{form.title}</span> / Analytics
              </div>
              <Link
                to={`/builder/${formId}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#333] text-[13px] font-['Outfit'] font-bold text-[#ddd] hover:text-white hover:border-[#555] transition-all shadow-lg shadow-black/5"
              >
                <span>←</span>
                Back to Builder
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div 
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300 ${exportTheme === 'light' ? 'bg-white text-black' : 'bg-[#0d0d0d] text-white'}`} 
        id="analytics-report"
      >
        {/* Export Header (Visible only in export or when watermarking) */}
        <div className="mb-6 flex items-center justify-between border-b border-[#1f1f1f] pb-4">
          <div className="flex items-center gap-3">
            <img src="/logoreal.png" alt="AdParlay" className="h-6 w-auto" />
            <span className="text-[10px] font-['Outfit'] font-black text-[#555] uppercase tracking-widest">Analytics Report</span>
          </div>
          <div className="text-[10px] font-['Outfit'] font-bold text-[#555]">
            Generated on {new Date().toLocaleDateString()}
          </div>
        </div>

        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black font-['Outfit'] text-white mb-2">{form.title}</h1>
            <p className="text-[#888] font-['Outfit'] font-medium">Visualizing {submissions.length} total responses</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-[#111] border border-[#1f1f1f] p-1 rounded-xl">
              <button 
                onClick={() => setExportTheme('dark')}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-['Outfit'] font-black transition-all ${exportTheme === 'dark' ? 'bg-white text-black' : 'text-[#555] hover:text-white'}`}
              >
                DARK
              </button>
              <button 
                onClick={() => setExportTheme('light')}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-['Outfit'] font-black transition-all ${exportTheme === 'light' ? 'bg-white text-black' : 'text-[#555] hover:text-white'}`}
              >
                LIGHT
              </button>
            </div>
            
            <button
              onClick={exportAllCharts}
              disabled={isExporting}
              className="px-6 py-2.5 bg-[#8B5CF6] text-white font-['Outfit'] font-black rounded-xl hover:bg-[#7C3AED] transition-all shadow-lg shadow-[#8B5CF6]/20 flex items-center gap-2"
            >
              {isExporting ? 'EXPORTING...' : 'DOWNLOAD FULL REPORT'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {allQuestions.map(q => (
            <div key={q.id} className={`rounded-xl p-6 border transition-all ${exportTheme === 'light' ? 'bg-gray-50 border-gray-200 shadow-sm' : 'bg-[#111] border-[#1f1f1f]'}`}>
              <h3 className={`text-lg font-medium font-['Outfit'] mb-1 ${exportTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>{q.label || 'Untitled Question'}</h3>
              <p className={`text-xs font-['Outfit'] font-black uppercase tracking-[0.15em] mb-6 ${exportTheme === 'light' ? 'text-gray-400' : 'text-[#555]'}`}>Type: {q.type.replace('_', ' ')}</p>
              
              {renderQuestionVisualization(q)}
            </div>
          ))}
          {allQuestions.length === 0 && (
            <div className="col-span-1 lg:col-span-2 text-center py-12 text-[#777] bg-[#111] rounded-xl border border-[#1f1f1f]">
              This form has no questions to analyze yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormAnalyticsPage;
