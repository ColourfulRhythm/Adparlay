"""
Add drop-off report panel to ViewResponses.tsx.
Reads dropOff_page_N keys from Firestore form documents and shows a bar chart.
Also add UTM column to response cards.
"""

with open('src/pages/ViewResponses.tsx', 'r') as f:
    src = f.read()

# 1. Add dropoff state and fetch into the Form interface
old_form_iface = """interface Form {
  id: string;
  title: string;
  blocks?: Array<{
    title: string;
    questions: Array<{
      id: string;
      label: string;
      type: string;
    }>;
  }>;
}"""
new_form_iface = """interface Form {
  id: string;
  title: string;
  blocks?: Array<{
    title: string;
    questions: Array<{
      id: string;
      label: string;
      type: string;
    }>;
  }>;
  dropOffData?: Record<string, number>;
  totalViews?: number;
  totalSubmissions?: number;
}"""
src = src.replace(old_form_iface, new_form_iface)

# 2. Read dropOff_page_N data in fetchForms alongside blocks
old_fetch_map = """          const formsData = formsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            blocks: data.blocks || []
          };
        });"""
new_fetch_map = """          const formsData = formsSnapshot.docs.map(doc => {
          const data = doc.data();
          const dropOffData: Record<string, number> = {};
          Object.keys(data).filter(k => k.startsWith('dropOff_page_')).forEach(k => {
            dropOffData[k] = data[k];
          });
          return {
            id: doc.id,
            title: data.title,
            blocks: data.blocks || [],
            dropOffData,
            totalViews: data.views || 0,
            totalSubmissions: data.submissions || 0
          };
        });"""
src = src.replace(old_fetch_map, new_fetch_map)

# 3. Inject Drop-off Report panel right after the Filters section (before Response Display)
old_anchor = "        {/* Responses Display */}"
drop_off_panel = """        {/* Drop-off Report */}
        {selectedForm !== 'all' && (() => {
          const form = forms.find(f => f.id === selectedForm);
          if (!form || !form.dropOffData || !form.blocks) return null;
          const pages = form.blocks;
          const totalStarts = form.totalViews || 0;
          const totalCompletes = form.totalSubmissions || 0;

          // Build page-by-page drop-off data
          const pageData = pages.map((block, idx) => {
            const dropKey = `dropOff_page_${idx}`;
            const droppedHere = form.dropOffData![dropKey] || 0;
            return { title: block.title || `Page ${idx + 1}`, droppedHere, idx };
          });
          const maxDrop = Math.max(...pageData.map(p => p.droppedHere), 1);

          if (totalStarts === 0 && totalCompletes === 0 && maxDrop === 1) return null;

          return (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                    Drop-off Report
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Users who left on each page without completing</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Views: <strong className="text-gray-800">{totalStarts}</strong></span>
                  <span>Completed: <strong className="text-green-700">{totalCompletes}</strong></span>
                  {totalStarts > 0 && <span>Completion: <strong className="text-[#8B5CF6]">{Math.round((totalCompletes / totalStarts) * 100)}%</strong></span>}
                </div>
              </div>
              <div className="space-y-3">
                {pageData.map((page, i) => {
                  const pct = maxDrop > 0 ? (page.droppedHere / maxDrop) * 100 : 0;
                  const isWorst = page.droppedHere === maxDrop && maxDrop > 0;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-24 text-[12px] text-gray-600 truncate flex-shrink-0">{page.title}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isWorst ? 'bg-red-400' : 'bg-orange-300'}`}
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                      <div className={`text-[12px] font-medium w-20 text-right flex-shrink-0 ${isWorst ? 'text-red-600' : 'text-gray-600'}`}>
                        {page.droppedHere} left {isWorst && '⚠️'}
                      </div>
                    </div>
                  );
                })}
              </div>
              {maxDrop > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-[12px] text-red-700">
                  <strong>Insight:</strong> Most users drop off on <em>{pageData.find(p => p.droppedHere === maxDrop)?.title}</em>. Consider simplifying that page's questions or adding social proof.
                </div>
              )}
            </div>
          );
        })()}

        {/* Responses Display */}"""
src = src.replace(old_anchor, drop_off_panel)

# 4. Add UTM row to response cards
old_card_footer_anchor = "                            {/* Card Footer */}"
utm_row = """                            {/* UTM Source row if present */}
                            {response.formData?.utm_source && (
                              <div className="border-l-2 border-purple-200 pl-3">
                                <div className="font-medium text-gray-800 text-sm mb-1">📍 Traffic Source</div>
                                <div className="text-gray-600 text-sm">
                                  {response.formData.utm_source}
                                  {response.formData.utm_campaign && ` · ${response.formData.utm_campaign}`}
                                  {response.formData.utm_medium && ` · ${response.formData.utm_medium}`}
                                </div>
                              </div>
                            )}
                            {/* Card Footer */}"""
src = src.replace(old_card_footer_anchor, utm_row)

with open('src/pages/ViewResponses.tsx', 'w') as f:
    f.write(src)
print("ViewResponses.tsx - drop-off panel + UTM row added")
