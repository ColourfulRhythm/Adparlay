"""
Add drop-off tracking to FormPreview.tsx (multi-step forms).
When a user advances or abandons a page, write the question index to Firestore.
"""

with open('src/pages/FormPreview.tsx', 'r') as f:
    src = f.read()

# Add dropOff tracking after existing useEffect imports
old_import = "import React, { useState, useEffect"
if "useRef" not in src:
    src = src.replace(old_import, "import React, { useState, useEffect, useRef", 1)

# Find where form submission Firestore write happens and inject UTM reading
old_submit = "// Track form submission"
utm_inject = """// Read UTM data captured on the landing page
      const utm: Record<string,string> = JSON.parse(sessionStorage.getItem('ap_utm') || '{}');
      // Track form submission"""
if old_submit in src:
    src = src.replace(old_submit, utm_inject, 1)

# Find Firestore write in form submission and add UTM + drop-off
old_fs_write = "submissions: (formData.submissions || 0) + 1"
if old_fs_write not in src:
    old_fs_write = "responses:"
new_fs_write_prefix = "utmData: utm,\n        dropOffQuestionIndex: null,\n        completedAt: new Date(),\n        "

# Only patch if we find submissions counter
if "submissions: (formData.submissions || 0) + 1" in src:
    src = src.replace(
        "submissions: (formData.submissions || 0) + 1",
        "submissions: (formData.submissions || 0) + 1,\n          lastLeadUtm: utm,\n          lastLeadAt: new Date()"
    )

# Add drop-off hook: on page change, record the question index in Firestore
drop_off_hook = """
  // Drop-off tracking: record furthest page reached
  const furthestPage = useRef(0);
  useEffect(() => {
    if (typeof currentBlockIndex !== 'undefined' && currentBlockIndex > furthestPage.current) {
      furthestPage.current = currentBlockIndex;
    }
  });

  // On unmount without completion, write drop-off page to Firestore
  useEffect(() => {
    return () => {
      if (!submitted && formId && furthestPage.current > 0) {
        try {
          const { doc, updateDoc, increment } = require('firebase/firestore');
          const { db } = require('../firebase');
          const key = `dropOff_page_${furthestPage.current}`;
          updateDoc(doc(db, 'forms', formId as string), {
            [key]: increment(1)
          }).catch(() => {});
        } catch (_) {}
      }
    };
  }, []);

"""

# Inject before the return statement
if "// Drop-off tracking" not in src:
    # Find a good injection point: after loading/error checks
    return_idx = src.rfind("\n  return (")
    if return_idx > 0:
        src = src[:return_idx] + "\n" + drop_off_hook + src[return_idx:]

with open('src/pages/FormPreview.tsx', 'w') as f:
    f.write(src)
print("FormPreview.tsx updated with drop-off tracking")
