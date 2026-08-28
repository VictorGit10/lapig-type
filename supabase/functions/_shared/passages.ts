export type Passage = {
  id: string;
  eyebrow: string;
  title: string;
  authors: string;
  year: number;
  sourceUrl: string;
  referenceAbnt: string;
  text: string;
};

export const passages: Passage[] = [
  {
    id: 'pasturelands-modis-2000-2016',
    eyebrow: 'Pastagens brasileiras',
    title: 'Assessing the Spatial and Occupation Dynamics of the Brazilian Pasturelands Based on the Automated Classification of MODIS Images from 2000 to 2016',
    authors: 'Leandro Parente e Laerte Ferreira',
    year: 2018,
    sourceUrl: 'https://doi.org/10.3390/rs10040606',
    referenceAbnt: 'PARENTE, Leandro; FERREIRA, Laerte. Assessing the spatial and occupation dynamics of the Brazilian pasturelands based on the automated classification of MODIS images from 2000 to 2016. Remote Sensing, v. 10, n. 4, art. 606, 2018. DOI: https://doi.org/10.3390/rs10040606.',
    text: "The pasturelands areas of Brazil constitute an important asset for the country, as the main food source for the world's largest commercial herd, representing the largest stock of open land in the country, occupying ~21% of the national territory. Understanding the spatio-temporal dynamics of these areas is of fundamental importance for the goal of promoting improved territorial governance, emission mitigation and productivity gains. During this period, the pasture area varied from ~152 (2000) to ~179 (2016) million hectares. The Atlantic Forest was the only biome in which there was a retraction of pasture areas throughout this series. From 2006 on, the total pasture area in Brazil showed a trend towards stabilization, indicating a slight intensification of livestock activity in recent years.",
  },
  {
    id: 'pasturelands-modis-mapping-method',
    eyebrow: 'Método de mapeamento',
    title: 'Assessing the Spatial and Occupation Dynamics of the Brazilian Pasturelands Based on the Automated Classification of MODIS Images from 2000 to 2016',
    authors: 'Leandro Parente e Laerte Ferreira',
    year: 2018,
    sourceUrl: 'https://doi.org/10.3390/rs10040606',
    referenceAbnt: 'PARENTE, Leandro; FERREIRA, Laerte. Assessing the spatial and occupation dynamics of the Brazilian pasturelands based on the automated classification of MODIS images from 2000 to 2016. Remote Sensing, v. 10, n. 4, art. 606, 2018. DOI: https://doi.org/10.3390/rs10040606.',
    text: 'To map Brazilian pasturelands consistently over time, the study combined objective criteria with an automated Random Forest classification applied to MODIS satellite imagery. Ninety spectro-temporal metrics were calculated from red, near-infrared and shortwave-infrared bands, together with vegetation indices representing both dry and wet seasons. Processing in Google Earth Engine produced seventeen annual pasture maps, covering every year from 2000 through 2016, with an overall accuracy close to eighty percent. The resulting time series revealed two distinct periods in Brazilian land use. Between 2000 and 2005, expansion was strongly associated with the opening of new grazing areas, especially across the Deforestation Arc and the Matopiba region. After 2006, the total area began to stabilize. This transition suggests that recent production gains increasingly depended on using established pasture more efficiently rather than continually converting new land.',
  },
  {
    id: 'global-grasslands-2000-2022',
    eyebrow: 'Mapeamento global',
    title: 'Annual 30-m maps of global grassland class and extent (2000-2022) based on spatiotemporal Machine Learning',
    authors: 'Leandro Parente et al.',
    year: 2024,
    sourceUrl: 'https://doi.org/10.1038/s41597-024-04139-6',
    referenceAbnt: 'PARENTE, Leandro et al. Annual 30-m maps of global grassland class and extent (2000-2022) based on spatiotemporal Machine Learning. Scientific Data, v. 11, art. 1303, 2024. DOI: https://doi.org/10.1038/s41597-024-04139-6.',
    text: "Grasslands are among the most vital global ecosystems, and, comprising open grasslands, grassy shrublands, and savannas, they cover approximately 40% of the Earth's surface. These ecosystems are critical for carbon sequestration, food production, biodiversity maintenance, and cultural heritage for people all over the world. Geospatial monitoring for these areas is urgently needed to support conservation efforts, to underpin meaningful corporate supply chain no-conversion commitments, to reduce greenhouse gas emissions from the land sector, to aid contribution to positive land use planning, allow finance for nature-based solutions and to contribute to restoring degraded landscapes. In this paper, we present a novel data set with annual time series of global cultivated and natural/semi-natural grasslands mapped at 30 m spatial resolution covering the period from 2000 to 2022. The data are available under open license (CC-BY) and will be regularly updated and improved with additional regional contexts, as well as new years added as the EO images become available.",
  },
  {
    id: 'global-grasslands-training-data',
    eyebrow: 'Dados e aprendizado de máquina',
    title: 'Annual 30-m maps of global grassland class and extent (2000-2022) based on spatiotemporal Machine Learning',
    authors: 'Leandro Parente et al.',
    year: 2024,
    sourceUrl: 'https://doi.org/10.1038/s41597-024-04139-6',
    referenceAbnt: 'PARENTE, Leandro et al. Annual 30-m maps of global grassland class and extent (2000-2022) based on spatiotemporal Machine Learning. Scientific Data, v. 11, art. 1303, 2024. DOI: https://doi.org/10.1038/s41597-024-04139-6.',
    text: 'The global mapping framework brought together the GLAD Landsat analysis-ready archive, climate observations, terrain variables and measures of proximity to cities, roads and water. More than 2.3 million reference samples, interpreted from very high resolution imagery, supported separate machine-learning models for cultivated and natural or semi-natural grasslands. The models generated annual probability maps at thirty-meter resolution for the years 2000 to 2022. Spatial cross-validation was used to select probability thresholds and balance omission and commission errors for each class. The final collection occupies about four terabytes and is distributed both as cloud-optimized GeoTIFF files and as Google Earth Engine assets. By separating intensively managed grasslands from more natural systems, the dataset can help researchers trace conversion, compare compatible land-cover products and investigate how grassland use changes across regions and through time.',
  },
  {
    id: 'livestock-intensification-cerrado',
    eyebrow: 'Pecuária e Cerrado',
    title: 'Livestock intensification and environmental sustainability: An analysis based on pasture management scenarios in the Brazilian savanna',
    authors: 'Claudinei Oliveira dos Santos et al.',
    year: 2024,
    sourceUrl: 'https://doi.org/10.1016/j.jenvman.2024.120473',
    referenceAbnt: 'SANTOS, Claudinei Oliveira dos et al. Livestock intensification and environmental sustainability: an analysis based on pasture management scenarios in the Brazilian savanna. Journal of Environmental Management, v. 355, art. 120473, 2024. DOI: https://doi.org/10.1016/j.jenvman.2024.120473.',
    text: "Brazil's major beef production occurs in the Cerrado, predominantly as extensive pastures that covers ~50 Mha of the biome, of which approximately 2/3 show signs of degradation. Pasture recovery is now a key environmental policy, as it improves land use efficiency and soil carbon sequestration. With the increase in carrying capacity, beef production is estimated to potentially increase by 1/3 due to the recovery of degraded areas through intensive management. In addition, the increase in soil C stocks was only sufficient to compensate for 27% and 42% of the GHG emissions resulting from intensification in areas with intermediate and severe degradation, respectively. Therefore, to strike a balance between economic considerations and environmental impact, additional strategies are needed to reduce GHG emissions and/or enhance C sinks, such as increasing tree density on farms. From this perspective, implementing livestock intensification at the landscape scale can promote C stocks and the diversity of ecosystem services, opening the possibility of ecosystem restoration.",
  },
  {
    id: 'livestock-intensification-carbon-scenarios',
    eyebrow: 'Carbono e cenários',
    title: 'Livestock intensification and environmental sustainability: An analysis based on pasture management scenarios in the Brazilian savanna',
    authors: 'Claudinei Oliveira dos Santos et al.',
    year: 2024,
    sourceUrl: 'https://doi.org/10.1016/j.jenvman.2024.120473',
    referenceAbnt: 'SANTOS, Claudinei Oliveira dos et al. Livestock intensification and environmental sustainability: an analysis based on pasture management scenarios in the Brazilian savanna. Journal of Environmental Management, v. 355, art. 120473, 2024. DOI: https://doi.org/10.1016/j.jenvman.2024.120473.',
    text: 'The analysis used the Century process-based model to estimate changes in soil carbon across Cerrado pastures under different degradation conditions and recovery scenarios. Land-use maps from 1985 to 2020 provided baselines for degraded, intermediately degraded and non-degraded pasture classes. Before the modeled intensification, total soil carbon in the upper twenty centimeters was estimated at roughly 1,830 million tonnes across the pasture area, with the largest stocks found in land that was not degraded. Recovery can improve carrying capacity, store more carbon in soil and reduce pressure for agricultural expansion, but intensification also brings higher animal numbers and greater use of fertilizers and lime. For that reason, soil gains alone did not offset all associated greenhouse gas emissions. The study argues for decisions at landscape scale, combining productive pasture recovery with additional emission reductions, greater tree cover and restoration of areas that can deliver broader ecosystem services.',
  },
];

export function findPassage(passageId: string) {
  return passages.find((passage) => passage.id === passageId) ?? null;
}
