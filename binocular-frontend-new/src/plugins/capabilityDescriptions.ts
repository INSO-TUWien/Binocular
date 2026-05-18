import { VisualizationPluginMetadataCategory } from './interfaces/visualizationPluginInterfaces/visualizationPluginMetadata.ts';

export const capabilityDescriptions: Partial<Record<VisualizationPluginMetadataCategory, string>> = {
  [VisualizationPluginMetadataCategory.Commits]: 'Visualize commit history, code changes, and developer activity over time',
  [VisualizationPluginMetadataCategory.Issues]: 'Track and visualize bug reports, feature requests, and project issues',
  [VisualizationPluginMetadataCategory.Ownership]: 'Analyze code ownership and contribution distribution across files',
  [VisualizationPluginMetadataCategory.AuthorBehaviour]: 'Examine individual developer patterns and contribution styles',
  [VisualizationPluginMetadataCategory.Statistics]: 'View aggregate repository metrics and overview statistics',
  [VisualizationPluginMetadataCategory.Expertise]: 'Identify developer expertise areas based on contribution history',
};
