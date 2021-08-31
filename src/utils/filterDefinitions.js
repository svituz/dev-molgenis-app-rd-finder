/* istanbul ignore file */
// import { genericFilterOptions, dynamicCountryFilter, dynamicMaterialFilter, diagnosisAvailableFilterOptions, resscourceTypesAvailableFilterOptions } from './filterOptions'
import { genericFilterOptions, diagnosisAvailableFilterOptions } from './filterOptions'
// import { genericFilterOptions } from './filterOptions'

const filterDefinitions = (state) => [
  {
    component: 'StringFilter',
    name: 'search',
    label: 'Search',
    type: 'multi-filter',
    humanReadableString: 'Text search is',
    initiallyCollapsed: false
  },
  {
    component: 'CheckboxFilter',
    name: 'ressource_types',
    label: 'Type',
    type: 'checkbox-filter',
    table: 'rd_connect_ressource_types',
    options: genericFilterOptions('rd_connect_ressource_types'),
    initiallyCollapsed: false,
    filters: state.filters.selections.ressource_types,
    maxVisibleOptions: 10,
    humanReadableString: 'Ressource type(s):',
    optionsFilter: []
    // all: true
  },
  // {
  //   headerClass: 'bg-warning text-white',
  //   component: 'CovidNetworkFilter',
  //   name: 'covid19network',
  //   label: 'COVID-19',
  //   initiallyCollapsed: !state.route.query.collection_network || !state.route.query.biobank_network
  // },
  // {
  //   headerClass: 'bg-warning text-white',
  //   component: 'CovidFilter',
  //   name: 'covid19',
  //   label: 'COVID-19 Services',
  //   type: 'checkbox-filter',
  //   table: 'rd_connect_COVID_19',
  //   options: genericFilterOptions('rd_connect_COVID_19'),
  //   initiallyCollapsed: !state.route.query.covid19,
  //   filters: state.filters.selections.covid19,
  //   all: true,
  //   maxVisibleOptions: 25,
  //   humanReadableString: 'Covid-19 service(s):'
  // },
  // {
  //   component: 'CheckboxFilter',
  //   name: 'external_sources',
  //   label: 'External Sources',
  //   type: 'checkbox-filter',
  //   maxVisibleOptions: 10,
  //   table: 'rd_connect_external_sources',
  //   options: genericFilterOptions('rd_connect_external_sources'),
  //   initiallyCollapsed: !state.route.query.external_sources,
  //   filters: state.filters.selections.external_sources
  // },
  {
    component: 'MultiFilter',
    name: 'diagnosis_available',
    label: 'Diagnosis available',
    type: 'multi-filter',
    initialDisplayItems: 10,
    maxVisibleOptions: 10,
    table: 'rd_connect_disease_types',
    options: diagnosisAvailableFilterOptions('rd_connect_disease_types'),
    initiallyCollapsed: !state.route.query.diagnosis_available,
    humanReadableString: 'Disease type(s):'
    // optionsFilter: ['hollymolly']
  },
  {
    component: 'CheckboxFilter',
    name: 'materials',
    label: 'Materials',
    type: 'checkbox-filter',
    table: 'rd_connect_material_types',
    options: genericFilterOptions('rd_connect_material_types'), // dynamicMaterialFilter(),
    // initiallyCollapsed: !state.route.query.materials,
    initiallyCollapsed: false,
    filters: state.filters.selections.materials,
    maxVisibleOptions: 25,
    humanReadableString: 'Material type(s):',
    optionsFilter: []
  },
  {
    component: 'CheckboxFilter',
    name: 'country',
    label: 'Countries',
    type: 'checkbox-filter',
    table: 'rd_connect_countries',
    options: genericFilterOptions('rd_connect_countries'),
    filters: state.filters.selections.country,
    maxVisibleOptions: 10,
    humanReadableString: 'Countries:',
    initiallyCollapsed: false
    // optionsFilter: Object.keys(state.countryDictionary) // state.countryDictionary
    // optionsFilter: genericFilterOptions2
    // optionsFilter: Object.keys(state.countryDictionary)
  }
  // {
  //   component: 'CheckboxFilter',
  //   name: 'biobank_quality',
  //   label: 'Biobank quality marks',
  //   type: 'checkbox-filter',
  //   table: 'rd_connect_assess_level_bio',
  //   options: genericFilterOptions('rd_connect_assess_level_bio'),
  //   initiallyCollapsed: !state.route.query.biobank_quality,
  //   filters: state.filters.selections.biobank_quality,
  //   maxVisibleOptions: 25,
  //   humanReadableString: 'Biobank quality mark(s):'
  // },
  // {
  //   component: 'CheckboxFilter',
  //   name: 'collection_quality',
  //   label: 'Collection quality marks',
  //   type: 'checkbox-filter',
  //   table: 'rd_connect_assess_level_col',
  //   options: genericFilterOptions('rd_connect_assess_level_col'),
  //   initiallyCollapsed: !state.route.query.collection_quality,
  //   filters: state.filters.selections.collection_quality,
  //   maxVisibleOptions: 25,
  //   humanReadableString: 'Collection quality mark(s):'
  // },
  // {
  //   component: 'CheckboxFilter',
  //   name: 'type',
  //   label: 'Collection types',
  //   type: 'checkbox-filter',
  //   table: 'rd_connect_collection_types',
  //   options: genericFilterOptions('rd_connect_collection_types'),
  //   initiallyCollapsed: !state.route.query.type,
  //   filters: state.filters.selections.type,
  //   maxVisibleOptions: 25,
  //   humanReadableString: 'Collection type(s):'
  // },
  // {
  //   component: 'CheckboxFilter',
  //   name: 'biobank_network',
  //   label: 'Biobank network',
  //   type: 'checkbox-filter',
  //   table: 'rd_connect_networks',
  //   options: genericFilterOptions('rd_connect_networks'),
  //   initiallyCollapsed: !state.route.query.biobank_network,
  //   filters: state.filters.selections.biobank_network,
  //   maxVisibleOptions: 25,
  //   humanReadableString: 'Biobank with network(s):'
  // },
  // {
  //   component: 'CheckboxFilter',
  //   name: 'collection_network',
  //   label: 'Collection network',
  //   type: 'checkbox-filter',
  //   table: 'rd_connect_networks',
  //   options: genericFilterOptions('rd_connect_networks'),
  //   initiallyCollapsed: !state.route.query.collection_network,
  //   filters: state.filters.selections.collection_network,
  //   maxVisibleOptions: 25,
  //   humanReadableString: 'Collection with network(s):'
  // },
  // {
  //   component: 'CheckboxFilter',
  //   name: 'dataType',
  //   label: 'Data types',
  //   type: 'checkbox-filter',
  //   table: 'rd_connect_data_types',
  //   options: genericFilterOptions('rd_connect_data_types'),
  //   initiallyCollapsed: !state.route.query.dataType,
  //   filters: state.filters.selections.dataType,
  //   maxVisibleOptions: 25,
  //   humanReadableString: 'Data type(s):'
  // }
]

export default filterDefinitions
