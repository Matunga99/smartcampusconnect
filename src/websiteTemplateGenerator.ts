
export const WEBSITE_TEMPLATES: Record<string, { pages: string[], menus: string[] }> = {
  'Lower Primary School': {
    pages: ['Home', 'About', 'Admissions', 'Teachers', 'Gallery', 'Contact'],
    menus: ['Home', 'Admissions']
  },
  'Primary School': {
    pages: ['Home', 'About', 'Admissions', 'Academics', 'Gallery', 'Contact'],
    menus: ['Home', 'Academics']
  },
  'Secondary School': {
    pages: ['Home', 'About', 'Admissions', 'Academics', 'Departments', 'Student Life', 'Gallery', 'Contact'],
    menus: ['Home', 'Academics', 'Student Life']
  },
  'TVET Institution': {
    pages: ['Home', 'About', 'Courses', 'Departments', 'Admissions', 'Facilities', 'Contact'],
    menus: ['Home', 'Courses', 'Admissions']
  },
  'College': {
    pages: ['Home', 'About', 'Programs', 'Admissions', 'Student Life', 'Library', 'Contact'],
    menus: ['Home', 'Programs', 'Student Life']
  },
  'University': {
    pages: ['Home', 'Admissions', 'Faculties', 'Programs', 'Research', 'Library', 'Student Portal', 'Contact'],
    menus: ['Home', 'Faculties', 'Programs', 'Student Portal']
  },
  'Training Center': {
    pages: ['Home', 'Courses', 'Certifications', 'Trainers', 'Admissions', 'Contact'],
    menus: ['Home', 'Courses', 'Admissions']
  },
  'Corporate Academy': {
    pages: ['Home', 'Courses', 'Learning Paths', 'Certifications', 'Partners', 'Contact'],
    menus: ['Home', 'Courses', 'Learning Paths']
  }
};

export function generateWebsiteTemplate(institutionType: string) {
  const template = WEBSITE_TEMPLATES[institutionType];
  return {
    pages: template ? template.pages : ['Home', 'Contact'],
    menus: template ? template.menus : ['Home'],
    homepageLayout: 'standard',
    enabledSections: template ? template.pages : ['Home']
  };
}
