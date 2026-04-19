import re

def run():
    with open('src/pages/Dashboard.tsx', 'r') as f:
        content = f.read()

    # 1. Imports
    if 'DashboardSkeleton' not in content:
        content = content.replace('import { useSEO } from \'../hooks/useSEO\';',
                                  'import { useSEO } from \'../hooks/useSEO\';\nimport DashboardSkeleton from \'../components/ui/DashboardSkeleton\';\nimport AnimatedDropdown from \'../components/ui/AnimatedDropdown\';\nimport { FileText, LayoutTemplate, Link as LinkIcon, MoreVertical, Eye, Trash2 } from \'lucide-react\';')

    # 2. Skeleton Loader
    old_loader = '''  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-900 text-xl">Loading...</div>
      </div>
    );
  }'''
    new_loader = '''  if (loading) {
    return <DashboardSkeleton />;
  }'''
    content = content.replace(old_loader, new_loader)

    # 3. Create New Dropdown
    old_create_actions = '''              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    console.log('Create New Form button clicked');
                    console.log('Current user:', currentUser);
                    console.log('Forms length:', forms.length);
                    console.log('Max forms:', currentUser?.maxForms);
                    
                    if (currentUser?.subscription === 'free' && forms.length >= (currentUser?.maxForms || 3)) {
                      alert('You have reached your form limit. Please delete some forms or upgrade to Premium.');
                      return;
                    }
                    console.log('Setting showTemplateModal to true');
                    setShowTemplateModal(true);
                  }}
                  className={`min-h-[44px] px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
                    currentUser?.subscription === 'free' && forms.length >= (currentUser?.maxForms || 3)
                      ? 'bg-gray-500 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  + Create New Form
                </button>
                <Link
                  to="/landing-builder"
                  className="min-h-[44px] px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center justify-center"
                >
                  + Create New Page
                </Link>
                <Link
                  to="/link-organizer-builder"
                  className="min-h-[44px] px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center justify-center"
                >
                  + Link Organizer
                </Link>
                {currentUser?.subscription === 'premium' ? ('''

    new_create_actions = '''              <div className="flex flex-col sm:flex-row gap-4">
                <AnimatedDropdown 
                  text="+ Create New"
                  items={[
                    {
                      name: 'Form',
                      icon: <FileText className="w-4 h-4" />,
                      onClick: () => {
                        if (currentUser?.subscription === 'free' && forms.length >= (currentUser?.maxForms || 3)) {
                          alert('You have reached your form limit. Please delete some forms or upgrade to Premium.');
                          return;
                        }
                        setShowTemplateModal(true);
                      }
                    },
                    {
                      name: 'Landing Page',
                      icon: <LayoutTemplate className="w-4 h-4" />,
                      link: '/landing-builder'
                    },
                    {
                      name: 'Link Organizer',
                      icon: <LinkIcon className="w-4 h-4" />,
                      link: '/link-organizer-builder'
                    }
                  ]}
                />
                {currentUser?.subscription === 'premium' ? ('''
    content = content.replace(old_create_actions, new_create_actions)

    # 4. Advanced Analytics Tidy Up
    # Fix grid and formatting for Total Forms
    content = content.replace('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8',
                              'grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8')

    content = content.replace('<div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 transition-all shadow-sm">\n            <div className="flex items-center justify-between">\n              <div>\n                <p className="text-gray-600 text-sm font-medium">Total Forms</p>\n                <p className="text-3xl font-bold text-gray-900">{stats.totalForms}</p>',
                              '<div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 hover:border-blue-300 transition-all shadow-sm">\n            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2">\n              <div>\n                <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">Total Forms</p>\n                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalForms}</p>')

    content = content.replace('<div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 transition-all shadow-sm">\n            <div className="flex items-center justify-between">\n              <div>\n                <p className="text-gray-600 text-sm font-medium">Total Submissions</p>\n                <p className="text-3xl font-bold text-gray-900">{stats.totalSubmissions}</p>',
                              '<div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 hover:border-blue-300 transition-all shadow-sm">\n            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2">\n              <div>\n                <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">Total Submissions</p>\n                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalSubmissions}</p>')

    content = content.replace('<div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 transition-all shadow-sm">\n            <div className="flex items-center justify-between">\n              <div>\n                <p className="text-gray-600 text-sm font-medium">Avg Submissions per Form</p>\n                <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}</p>',
                              '<div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 hover:border-blue-300 transition-all shadow-sm">\n            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2">\n              <div>\n                <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">Avg Submissions</p>\n                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.conversionRate}</p>')

    content = content.replace('<div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#333] hover:border-[#8B5CF6] transition-all">\n            <div className="flex items-center justify-between">\n              <div>\n                <p className="text-[#A3A3A3] text-sm font-medium">This Month</p>\n                <p className="text-3xl font-bold text-white">{stats.thisMonthSubmissions}</p>',
                              '<div className="bg-[#1a1a1a] rounded-2xl p-4 sm:p-6 border border-[#333] hover:border-[#8B5CF6] transition-all">\n            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2">\n              <div>\n                <p className="text-[#A3A3A3] text-xs sm:text-sm font-medium truncate">This Month</p>\n                <p className="text-2xl sm:text-3xl font-bold text-white">{stats.thisMonthSubmissions}</p>')

    # 5. Form Hamburger Dropdown
    old_form_actions = '''                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-32 flex-shrink-0">
                          <div className="flex items-center gap-2 mb-2 lg:mb-0">
                            <span className={`w-3 h-3 rounded-full ${getStatusColor(form.status)}`}></span>
                            <span className="text-xs text-gray-500 capitalize">{form.status}</span>
                          </div>
                          
                          <Link
                            to={`/builder/${form.id}`}
                            className="min-h-[44px] px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium text-sm"
                          >
                            Edit
                          </Link>
                          
                          <Link
                            to="/responses"
                            className="min-h-[44px] px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-medium text-sm inline-flex items-center justify-center"
                            title="View all responses for this form"
                          >
                            View Responses
                          </Link>
                          
                          <button
                            onClick={() => deleteForm(form.id)}
                            disabled={deletingForms.has(form.id)}
                            className={`min-h-[44px] px-4 py-3 rounded-lg transition-colors text-center font-medium text-sm ${
                              deletingForms.has(form.id)
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                            title="Delete this form and all its submissions"
                          >
                            {deletingForms.has(form.id) ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>'''
    
    new_form_actions = '''                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="hidden sm:flex items-center gap-2 mr-2">
                            <span className={`w-3 h-3 rounded-full ${getStatusColor(form.status)}`}></span>
                            <span className="text-xs text-gray-500 capitalize">{form.status}</span>
                          </div>
                          
                          <Link
                            to={`/builder/${form.id}`}
                            className="h-10 px-4 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                          >
                            Edit
                          </Link>
                          
                          <AnimatedDropdown 
                            align="right"
                            trigger={<button className="h-10 w-10 flex items-center justify-center border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"><MoreVertical className="w-5 h-5"/></button>}
                            items={[
                              {
                                name: 'View Responses',
                                icon: <Eye className="w-4 h-4" />,
                                link: '/responses'
                              },
                              {
                                name: deletingForms.has(form.id) ? 'Deleting...' : 'Delete Form',
                                icon: <Trash2 className="w-4 h-4" />,
                                destructive: true,
                                onClick: () => { if (!deletingForms.has(form.id)) deleteForm(form.id); }
                              }
                            ]}
                          />
                        </div>'''
    content = content.replace(old_form_actions, new_form_actions)

    # 6. Landing Page Hamburger Dropdown
    old_landing_actions = '''                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-32 flex-shrink-0">
                          <Link
                            to={`/landing-builder/${landingPage.id}`}
                            className="min-h-[44px] px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-medium text-sm"
                          >
                            Edit
                          </Link>
                          
                          <Link
                            to={`/landing/${landingPage.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-h-[44px] px-4 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium text-sm inline-flex items-center justify-center"
                            title="View landing page"
                          >
                            View Page
                          </Link>
                          
                          <button
                            onClick={() => deleteLandingPage(landingPage.id)}
                            disabled={deletingLandingPages.has(landingPage.id)}
                            className={`min-h-[44px] px-4 py-3 rounded-lg transition-colors text-center font-medium text-sm ${
                              deletingLandingPages.has(landingPage.id)
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                            title="Delete this landing page"
                          >
                            {deletingLandingPages.has(landingPage.id) ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>'''
    
    new_landing_actions = '''                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Link
                            to={`/landing-builder/${landingPage.id}`}
                            className="h-10 px-4 flex items-center justify-center bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                          >
                            Edit
                          </Link>
                          
                          <AnimatedDropdown 
                            align="right"
                            trigger={<button className="h-10 w-10 flex items-center justify-center border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"><MoreVertical className="w-5 h-5"/></button>}
                            items={[
                              {
                                name: 'View Page',
                                icon: <Eye className="w-4 h-4" />,
                                onClick: () => { window.open(`/landing/${landingPage.id}`, '_blank'); }
                              },
                              {
                                name: deletingLandingPages.has(landingPage.id) ? 'Deleting...' : 'Delete Page',
                                icon: <Trash2 className="w-4 h-4" />,
                                destructive: true,
                                onClick: () => { if (!deletingLandingPages.has(landingPage.id)) deleteLandingPage(landingPage.id); }
                              }
                            ]}
                          />
                        </div>'''
    content = content.replace(old_landing_actions, new_landing_actions)

    # 7. Link Organizer Hamburger Dropdown
    old_link_actions = '''                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-32 flex-shrink-0">
                          <Link
                            to={`/link-organizer-builder/${organizer.id}`}
                            className="min-h-[44px] px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center font-medium text-sm"
                          >
                            Edit
                          </Link>
                          
                          <Link
                            to={`/links/${organizer.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-h-[44px] px-4 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium text-sm inline-flex items-center justify-center"
                            title="View link organizer page"
                          >
                            View Page
                          </Link>
                          
                          <button
                            onClick={() => deleteLinkOrganizer(organizer.id)}
                            disabled={deletingLinkOrganizers.has(organizer.id)}
                            className={`min-h-[44px] px-4 py-3 rounded-lg transition-colors text-center font-medium text-sm ${
                              deletingLinkOrganizers.has(organizer.id)
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                            title="Delete this link organizer"
                          >
                            {deletingLinkOrganizers.has(organizer.id) ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>'''

    new_link_actions = '''                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Link
                            to={`/link-organizer-builder/${organizer.id}`}
                            className="h-10 px-4 flex items-center justify-center bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                          >
                            Edit
                          </Link>
                          
                          <AnimatedDropdown 
                            align="right"
                            trigger={<button className="h-10 w-10 flex items-center justify-center border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"><MoreVertical className="w-5 h-5"/></button>}
                            items={[
                              {
                                name: 'View Page',
                                icon: <Eye className="w-4 h-4" />,
                                onClick: () => { window.open(`/links/${organizer.id}`, '_blank'); }
                              },
                              {
                                name: deletingLinkOrganizers.has(organizer.id) ? 'Deleting...' : 'Delete Organizer',
                                icon: <Trash2 className="w-4 h-4" />,
                                destructive: true,
                                onClick: () => { if (!deletingLinkOrganizers.has(organizer.id)) deleteLinkOrganizer(organizer.id); }
                              }
                            ]}
                          />
                        </div>'''
    content = content.replace(old_link_actions, new_link_actions)

    with open('src/pages/Dashboard.tsx', 'w') as f:
        f.write(content)
    print("Dashboard refactored")

if __name__ == '__main__':
    run()
