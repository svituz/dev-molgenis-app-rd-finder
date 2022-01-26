import { createRSQLQuery, createBiobankRSQLQuery, filterCollectionTree, getHumanReadableString } from './helpers'
import { groupCollectionsByBiobankId } from '../utils/grouping'
import { sortCollectionsByName } from '../utils/sorting'

export default {
  getFilters: (state) => {
    return state.filterFacets.filter((facet) => {
      return !state.disabledFilters.includes(facet.name)
    })
  },
  getHumanReadableString,
  loading: ({ collectionInfo, biobankIds }) => !(biobankIds && collectionInfo),
  biobanks: ({ collectionInfo, biobankIds, biobanks }, { loading, rsql }) => {
    if (loading) {
      return []
    }
    let ids = biobankIds
    if (rsql && rsql.length) {
      ids = collectionInfo
      // biobank IDs present in collectionIds
        .map(({ biobankId }) => biobankId)
      // also present in biobankIds
        .filter(biobankId => biobankIds.includes(biobankId))
      // first occurrence of ID only
        .filter((value, index, self) => self.indexOf(value) === index)
    }
    return ids.map(biobankId => {
      if (!Object.prototype.hasOwnProperty.call(biobanks, biobankId)) {
        return biobankId
      }
      const biobank = biobanks[biobankId]
      return {
        ...biobank,
        collections: sortCollectionsByName(filterCollectionTree(collectionInfo.map(it => it.collectionId), biobank.collections))
      }
    })
  },
  parentCollections: (state) => {
    const allParentCollections = state.collectionInfo.filter(colInfo => !colInfo.isSubcollection).map(fci => fci.collectionId)
    let flattenedCollections = []
    allParentCollections.forEach(function (apc) {
      flattenedCollections = flattenedCollections.concat(apc)
    })
    return flattenedCollections
  },
  collectionBiobankDictionary: state => state.collectionBiobankDictionary,
  collectionDictionary: state => state.collectionDictionary,
  getFoundBiobankIds: (_, { biobanks }) => biobanks.map(b => b.id || b).filter(bid => bid !== undefined),
  foundBiobanks: (_, { biobanks }) => {
    return biobanks.length
  },
  foundCollectionIds (state, { getFoundBiobankIds }) {
    // only if there are biobanks, then there are collections. we can't have rogue collections :)
    if (getFoundBiobankIds.length && state.collectionInfo.length) {
      const biobanksWithCollections = groupCollectionsByBiobankId(state.collectionInfo)

      let collectionIds = []
      for (const id of getFoundBiobankIds) {
        const collectionsInBiobank = biobanksWithCollections[id]
        if (collectionsInBiobank) collectionIds = collectionIds.concat(collectionsInBiobank)
      }
      return collectionIds
    }
    return []
  },
  selectedNonCommercialCollections (state, { selectedCollections }) {
    const selectedNonCommercialCollections = selectedCollections.map(sc => sc.value).filter(sid => state.nonCommercialCollections.includes(sid))
    return selectedNonCommercialCollections.length
  },
  foundCollectionsAsSelection: (_, { parentCollections, foundCollectionIds, collectionDictionary }) => {
    const parentCollectionIds = foundCollectionIds.filter(fci => parentCollections.includes(fci))
    return parentCollectionIds.map(colId => ({ label: collectionDictionary[colId], value: colId }))
  },
  collectionsInPodium ({ podiumCollectionIds, collectionInfo, isPodium }, { foundCollectionIds, selectedCollections }) {
    if (isPodium && podiumCollectionIds && collectionInfo && foundCollectionIds) {
      const selectedCollectionIds = selectedCollections.map(sc => sc.value)
      const collectionInfoInSelection = collectionInfo.filter(colInfo => foundCollectionIds.includes(colInfo.collectionId))

      const collectionNames = collectionInfoInSelection.filter(colInfo => podiumCollectionIds
        .includes(colInfo.collectionId))
        .map(podCols => ({ label: podCols.collectionName, value: podCols.collectionId }))
        .filter(cn => selectedCollectionIds.includes(cn.value))

      return collectionNames
    } else return []
  },
  selectedCollections: state => state.selectedCollections,
  allCollectionsSelected: (_, { parentCollections, selectedCollections }) => {
    // if we don't have any selections present in our cart
    if (selectedCollections.length === 0) return false

    const selectedCollectionIds = selectedCollections.map(sc => sc.value)
    // parent collections are the collections currently shown based on filters, compared to the cart
    const allIdsPresentInSelection = parentCollections.every(cid => selectedCollectionIds.includes(cid))

    return allIdsPresentInSelection
  },
  selectedBiobankQuality: state => state.filters.selections.biobank_quality,
  selectedCollectionQuality: state => {
    return state.filters.selections.collection_quality
  },
  satisfyAllBiobankQuality: state => state.filters.satisfyAll.includes('biobank_quality'),
  satisfyAllCollectionQuality: state => state.filters.satisfyAll.includes('collection_quality'),
  rsql: createRSQLQuery,
  biobankRsql: createBiobankRSQLQuery,
  resetPage: state => !state.isPaginating,
  /**
   * Get map of active filters
   */
  activeFilters: state => state.filters.selections,
  reductionFilters: state => state.filters.selections,
  dynamicFilters: state => state.dynamicFilters,
  getErrorMessage: state => {
    if (!state.error) {
      return undefined
    }
    if (state.error.errors) {
      return state.error.errors[0].message
    }
    if (state.error.message) {
      return state.error.message
    }
    return 'Something went wrong'
  },
  externalResources: state => {
    return state.externalResources
  },
  externalResourcesFilters: state => {
    const activeFilters = state.filters.selections
    const filters = {}

    if (activeFilters.diagnosis_available && activeFilters.diagnosis_available.length > 0) {
      filters.diagnosisAvailable = activeFilters.diagnosis_available
    }

    if (activeFilters.ressource_types && activeFilters.ressource_types.length > 0) {
      filters.ressourceTypes = activeFilters.ressource_types
    }

    if (activeFilters.country && activeFilters.country.length > 0) {
      filters.country = activeFilters.country
    }

    if (activeFilters.search && activeFilters.search.length > 0) {
      filters.name = activeFilters.search
    }

    if (activeFilters.external_catalogs && activeFilters.external_catalogs.length > 0) {
      filters.externalSources = []
      state.filters.selections.external_catalogs.forEach((source, index) => {
        filters.externalSources.push({
          id: source,
          label: 'external_catalogs' in state.filters.labels ? state.filters.labels.external_catalogs[index] : ''
        })
      })
    }
    return filters
  },
  recordQueryService: state => state.recordQueryService
}
