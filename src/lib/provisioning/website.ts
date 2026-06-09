import { generateWebsiteTemplate } from '../../websiteTemplateGenerator';

export function provisionWebsite(db: any, school: any) {
  const config = generateWebsiteTemplate(school.type);
  console.log(`Provisioning website for ${school.name} with pages:`, config.pages);
}
