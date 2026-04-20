import re

with open('src/pages/FormBuilder.tsx', 'r') as f:
    content = f.read()

# 1. Add conditional logic state after existing state declarations
old_state = "  const [mediaError, setMediaError] = useState<string>('');"
new_state = """  const [mediaError, setMediaError] = useState<string>('');
  const [showConditionalModal, setShowConditionalModal] = useState(false);
  const [conditionalSourceQuestion, setConditionalSourceQuestion] = useState<string>('');"""
content = content.replace(old_state, new_state)

# 2. Add conditional logic field to FormQuestion interface
old_interface = """  gridRows?: string[];
  gridColumns?: string[];
}"""
new_interface = """  gridRows?: string[];
  gridColumns?: string[];
  conditionalLogic?: {
    enabled: boolean;
    showIf: { questionId: string; operator: string; value: string }[];
    action: 'show' | 'hide' | 'skip';
  };
}"""
content = content.replace(old_interface, new_interface, 1)

# 3. Replace the questions section to add conditional logic badge + panel
old_q_map = '''                         {currentBlock.questions.map((question, questionIndex) => (
                          <motion.div
                            key={question.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-center justify-between p-3 rounded-lg border-[0.5px] transition-all group ${
                              activeQuestion === question.id 
                                ? 'border-[#8B5CF6] bg-[#1a1a1a]' 
                                : 'bg-[#141414] border-[#333] hover:border-[#444]'
                            }`}
                          >
                            <div className="flex items-center space-x-3 overflow-hidden">
                              <div className="w-8 h-8 rounded-md bg-[#222] flex items-center justify-center flex-shrink-0 text-gray-400">
                                {getQuestionIcon(question.type)}
                              </div>
                              <div className="min-w-0">
                                <h6 className="font-medium text-white text-[13px] truncate">{question.label}</h6>
                                <p className="text-[11px] text-[#A3A3A3] mt-0.5 truncate">
                                  {question.type.replace('_', ' ').replace(/\\b\\w/g, l => l.toUpperCase())} · {question.required ? 'Required' : 'Optional'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                              <div className={`w-1.5 h-1.5 rounded-full ${question.required ? 'bg-[#22c55e]' : 'bg-[#555]'}`}></div>
                              
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => {
                                    setEditingQuestion(question);
                                    setShowQuestionModal(true);
                                  }}
                                  className="px-2 py-1 bg-[#222] border border-[#333] text-[#A3A3A3] text-[11px] rounded hover:bg-[#333] hover:text-white transition-colors"
                                >
                                  Edit
                                </button>
                                
                                <button
                                  onClick={() => deleteQuestion(currentBlock.id, question.id)}
                                  className="px-2 py-1 bg-[#222] border border-[#333] text-red-400 text-[11px] rounded hover:bg-red-900/30 hover:border-red-800 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}'''

new_q_map = '''                         {currentBlock.questions.map((question, questionIndex) => (
                          <motion.div
                            key={question.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`rounded-lg border-[0.5px] transition-all ${
                              activeQuestion === question.id 
                                ? 'border-[#8B5CF6] bg-[#1a1a1a]' 
                                : 'bg-[#141414] border-[#333] hover:border-[#444]'
                            }`}
                          >
                            <div className="flex items-center justify-between p-3">
                              <div className="flex items-center space-x-3 overflow-hidden">
                                <div className="w-7 h-7 rounded-md bg-[#222] flex items-center justify-center flex-shrink-0 text-gray-400 text-base">
                                  {getQuestionIcon(question.type)}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h6 className="font-medium text-white text-[13px] truncate">{question.label}</h6>
                                    {question.conditionalLogic?.enabled && (
                                      <span className="text-[10px] bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#c4b5fd] px-1.5 py-0.5 rounded-full flex-shrink-0">
                                        ⚡ Logic
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-[#A3A3A3] mt-0.5 truncate">
                                    {question.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} · {question.required ? 'Required' : 'Optional'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1.5 flex-shrink-0 ml-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${question.required ? 'bg-[#22c55e]' : 'bg-[#555]'}`}></div>
                                <button
                                  onClick={() => { setEditingQuestion(question); setShowQuestionModal(true); }}
                                  className="px-2 py-1 bg-[#222] border border-[#333] text-[#A3A3A3] text-[11px] rounded hover:bg-[#333] hover:text-white transition-colors"
                                >Edit</button>
                                <button
                                  onClick={() => deleteQuestion(currentBlock.id, question.id)}
                                  className="px-2 py-1 bg-[#222] border border-[#333] text-red-400 text-[11px] rounded hover:bg-red-900/30 hover:border-red-800 transition-colors"
                                >Del</button>
                              </div>
                            </div>
                            {/* Conditional logic sub-row */}
                            {question.conditionalLogic?.enabled && question.conditionalLogic.showIf.length > 0 && (
                              <div className="mx-3 mb-3 border-l-2 border-[#8B5CF6]/40 pl-3 space-y-1">
                                {question.conditionalLogic.showIf.map((rule, ri) => {
                                  const srcQ = currentBlock.questions.find(q => q.id === rule.questionId);
                                  return (
                                    <div key={ri} className="flex items-center gap-2 text-[11px] text-[#A3A3A3]">
                                      <span className="text-[10px] text-[#777] font-medium uppercase">{ri === 0 ? 'IF' : 'AND'}</span>
                                      <span className="bg-[#1f1f1f] border border-[#333] px-2 py-0.5 rounded-full text-[#c4b5fd]">
                                        {srcQ ? srcQ.label : rule.questionId}
                                      </span>
                                      <span className="text-[#555]">{rule.operator}</span>
                                      <span className="bg-[#1f1f1f] border border-[#333] px-2 py-0.5 rounded-full">{rule.value}</span>
                                      <span className="text-[#555]">→ {question.conditionalLogic!.action}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </motion.div>
                        ))}'''

content = content.replace(old_q_map, new_q_map)

# 4. Add conditional logic section to question edit modal (after the file upload section, before the Cancel/Save buttons)
old_modal_footer = '''              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowQuestionModal(false);
                    setEditingQuestion(null);
                  }}
                  className="px-4 py-2 text-[#A3A3A3] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={saveQuestion}
                  className="px-4 py-2 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] transition-colors"
                >
                  Save Changes
                </button>
              </div>'''

new_modal_footer = '''              {/* Conditional Logic */}
                <div className="border-t border-[#333] pt-4 mt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-medium text-white flex items-center gap-2">
                        <span>⚡</span> Conditional Logic
                      </div>
                      <div className="text-[11px] text-[#777] mt-0.5">Show/hide this field based on other answers</div>
                    </div>
                    <button
                      onClick={() => setEditingQuestion(prev => prev ? {
                        ...prev,
                        conditionalLogic: {
                          enabled: !prev.conditionalLogic?.enabled,
                          showIf: prev.conditionalLogic?.showIf || [],
                          action: prev.conditionalLogic?.action || 'show'
                        }
                      } : null)}
                      className={`relative w-9 h-5 rounded-full transition-colors ${editingQuestion.conditionalLogic?.enabled ? 'bg-[#8B5CF6]' : 'bg-[#333]'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editingQuestion.conditionalLogic?.enabled ? 'translate-x-4' : 'translate-x-0.5'}`}></span>
                    </button>
                  </div>

                  {editingQuestion.conditionalLogic?.enabled && (
                    <div className="space-y-2">
                      {(editingQuestion.conditionalLogic?.showIf || []).map((rule, ri) => (
                        <div key={ri} className="flex items-center gap-2 p-2 bg-[#111] border border-[#2a2a2a] rounded-lg">
                          <span className="text-[10px] text-[#777] font-medium w-6">{ri === 0 ? 'IF' : 'AND'}</span>
                          <select
                            value={rule.questionId}
                            onChange={e => setEditingQuestion(prev => {
                              if (!prev) return null;
                              const rules = [...(prev.conditionalLogic?.showIf || [])];
                              rules[ri] = { ...rules[ri], questionId: e.target.value };
                              return { ...prev, conditionalLogic: { ...prev.conditionalLogic!, showIf: rules } };
                            })}
                            className="flex-1 min-w-0 px-2 py-1 bg-[#1a1a1a] border border-[#333] rounded text-[12px] text-white"
                          >
                            <option value="">Select question…</option>
                            {currentBlock?.questions.filter(q => q.id !== editingQuestion.id).map(q => (
                              <option key={q.id} value={q.id}>{q.label}</option>
                            ))}
                          </select>
                          <select
                            value={rule.operator}
                            onChange={e => setEditingQuestion(prev => {
                              if (!prev) return null;
                              const rules = [...(prev.conditionalLogic?.showIf || [])];
                              rules[ri] = { ...rules[ri], operator: e.target.value };
                              return { ...prev, conditionalLogic: { ...prev.conditionalLogic!, showIf: rules } };
                            })}
                            className="w-16 px-1.5 py-1 bg-[#1a1a1a] border border-[#333] rounded text-[12px] text-white"
                          >
                            <option value="=">=</option>
                            <option value="!=">≠</option>
                            <option value="contains">has</option>
                          </select>
                          <input
                            value={rule.value}
                            onChange={e => setEditingQuestion(prev => {
                              if (!prev) return null;
                              const rules = [...(prev.conditionalLogic?.showIf || [])];
                              rules[ri] = { ...rules[ri], value: e.target.value };
                              return { ...prev, conditionalLogic: { ...prev.conditionalLogic!, showIf: rules } };
                            })}
                            placeholder="value"
                            className="w-20 px-2 py-1 bg-[#1a1a1a] border border-[#333] rounded text-[12px] text-white placeholder-[#555]"
                          />
                          <button
                            onClick={() => setEditingQuestion(prev => {
                              if (!prev) return null;
                              const rules = (prev.conditionalLogic?.showIf || []).filter((_, i) => i !== ri);
                              return { ...prev, conditionalLogic: { ...prev.conditionalLogic!, showIf: rules } };
                            })}
                            className="text-red-400 hover:text-red-300 text-[14px] flex-shrink-0"
                          >×</button>
                        </div>
                      ))}
                      <button
                        onClick={() => setEditingQuestion(prev => {
                          if (!prev) return null;
                          const rules = [...(prev.conditionalLogic?.showIf || []), { questionId: '', operator: '=', value: '' }];
                          return { ...prev, conditionalLogic: { ...prev.conditionalLogic!, showIf: rules } };
                        })}
                        className="text-[12px] text-[#8B5CF6] hover:text-[#a78bfa] transition-colors"
                      >+ Add condition</button>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[12px] text-[#777]">Action:</span>
                        {(['show','hide','skip'] as const).map(a => (
                          <button
                            key={a}
                            onClick={() => setEditingQuestion(prev => prev ? { ...prev, conditionalLogic: { ...prev.conditionalLogic!, action: a } } : null)}
                            className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${editingQuestion.conditionalLogic?.action === a ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white' : 'bg-[#1a1a1a] border-[#333] text-[#777]'}`}
                          >{a}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowQuestionModal(false);
                    setEditingQuestion(null);
                  }}
                  className="px-4 py-2 text-[#A3A3A3] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={saveQuestion}
                  className="px-4 py-2 bg-[#8B5CF6] text-white rounded-lg hover:bg-[#7C3AED] transition-colors"
                >
                  Save Changes
                </button>
              </div>'''

content = content.replace(old_modal_footer, new_modal_footer)

# 5. Add Collaboration + Lead Activity Feed panels after the main builder content (before closing div of return)
# We'll insert it before the Question Edit Modal comment
old_before_modals = "      {/* Question Edit Modal */}"
new_before_modals = """      {/* Collaboration & Activity Feed - Coming Soon Panels */}
      {!previewMode && (
        <div className="border-t border-[#1f1f1f] bg-[#0d0d0d] px-3 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Lead Activity Feed */}
            <div className="bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#1f1f1f]">
                <div className="w-6 h-6 rounded-md bg-[#1a1a1a] flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#777]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
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
                  { init: 'FB', name: 'Fatimah B.', action: 'submitted this form', time: '1m ago', color: 'bg-green-900 text-green-300' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${item.color}`}>{item.init}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-white"><span className="font-medium">{item.name}</span> <span className="text-[#777]">{item.action}</span></div>
                    </div>
                    <div className="text-[11px] text-[#555] whitespace-nowrap">{item.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Collaboration */}
            <div className="bg-[#111] border border-[#1f1f1f] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#1f1f1f]">
                <div className="w-6 h-6 rounded-md bg-[#1a1a1a] flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#777]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-white">Team Collaboration</div>
                  <div className="text-[11px] text-[#555]">Real-time co-editing</div>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] text-[#555]">Coming Soon</span>
              </div>
              <div className="px-4 py-3 space-y-2.5 opacity-40 pointer-events-none select-none">
                {[
                  { init: 'TL', name: 'Tunde L.', role: 'Marketing Lead', status: 'Viewing analytics', online: true, grad: 'from-violet-700 to-purple-600' },
                  { init: 'SA', name: 'Sade A.', role: 'Sales Manager', status: 'Exporting leads', online: true, grad: 'from-purple-600 to-violet-500' },
                  { init: 'KB', name: 'Kola B.', role: 'Growth', status: 'Building form', online: true, grad: 'from-violet-500 to-purple-400' },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${m.grad} flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0`}>{m.init}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-white truncate">{m.name}</div>
                      <div className="text-[11px] text-[#555] truncate">{m.role}</div>
                    </div>
                    <div className="text-[11px] text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded-full whitespace-nowrap">{m.status}</div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] flex-shrink-0"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question Edit Modal */}"""

content = content.replace(old_before_modals, new_before_modals)

with open('src/pages/FormBuilder.tsx', 'w') as f:
    f.write(content)

print("FormBuilder.tsx - conditional logic + panels added.")
