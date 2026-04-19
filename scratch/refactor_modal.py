import re

def run():
    with open('src/pages/Dashboard.tsx', 'r') as f:
        content = f.read()

    # 1. Add AnimatePresence to imports
    if 'AnimatePresence' not in content:
        content = content.replace("import { motion } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';")

    # 2. Replace the old Template Modal with the new one
    # We need to find the start of `{showTemplateModal && (` 
    # and the end which is `)}` just before `{/* Payment Modal */}`
    
    old_modal_pattern = r"\{showTemplateModal && \(.*?\{/\* Payment Modal \*/\}"
    
    new_modal = '''{/* Template Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-[#0d0d0d] rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold font-['Outfit'] text-white">Choose a Template</h3>
                    <p className="text-[#b8b8b8] font-['Epilogue'] mt-1 text-sm">Start with a pre-built template or build from scratch.</p>
                  </div>
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                  {formTemplates.map((template) => (
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      key={template.id}
                      className="relative border border-white/10 bg-[#141414] rounded-2xl p-5 cursor-pointer overflow-hidden group"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      {/* Subtle hover gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative z-10">
                        <div className={`w-14 h-14 bg-gradient-to-br ${template.color} rounded-xl flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                          {template.icon}
                        </div>
                        <h4 className="font-bold text-white mb-2 font-['Outfit'] text-lg">{template.name}</h4>
                        <p className="text-sm text-[#b8b8b8] mb-4 font-['Epilogue']">{template.description}</p>
                        <div className="inline-flex items-center text-xs font-medium bg-white/5 text-gray-300 px-3 py-1.5 rounded-full">
                          {template.questions.length} questions
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-white/10 pt-8">
                  {/* AI Builder Option */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="relative rounded-2xl overflow-hidden p-[1px] group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-[#0d0d0d] h-full rounded-[15px] p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span className="text-white font-bold font-['Outfit'] text-lg">AI Builder</span>
                          {currentUser?.subscription === 'premium' && (
                            <span className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-pink-500/30 text-pink-300 text-xs px-2 py-0.5 rounded-full font-medium">Premium</span>
                          )}
                        </div>
                        <p className="text-[#b8b8b8] text-sm font-['Epilogue'] mb-6">Describe your form and let AI build it for you instantly.</p>
                      </div>
                      
                      {currentUser?.subscription === 'premium' ? (
                        <button
                          onClick={() => {
                            setShowTemplateModal(false);
                            setShowAIBuilderModal(true);
                          }}
                          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-500 hover:to-indigo-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                        >
                          Use AI Builder
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setShowTemplateModal(false);
                            setShowPaymentModal(true);
                          }}
                          className="w-full py-3 bg-white/5 text-white/50 rounded-xl font-medium hover:bg-white/10 hover:text-white transition-all border border-white/10"
                        >
                          Upgrade to Premium
                        </button>
                      )}
                    </div>
                  </motion.div>
                  
                  {/* Build from Scratch Option */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="border border-white/10 bg-[#141414] rounded-2xl p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 mb-4 border border-white/5">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-white mb-2 font-['Outfit'] text-lg">Build from Scratch</h4>
                      <p className="text-[#b8b8b8] text-sm font-['Epilogue'] mb-6">Start with a blank canvas and add fields manually.</p>
                    </div>
                    <button
                      onClick={handleBuildFromScratch}
                      className="w-full py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-all"
                    >
                      Start Blank Form
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
'''

    content = re.sub(old_modal_pattern, new_modal, content, flags=re.DOTALL)

    with open('src/pages/Dashboard.tsx', 'w') as f:
        f.write(content)
    print("Template modal refactored")

if __name__ == '__main__':
    run()
