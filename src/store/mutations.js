/* jshint sub:true */
import Vue from 'vue'
import { createBookmark } from '../utils/bookmarkMapper'
import { fixCollectionTree } from './helpers'
import filterDefinitions from '../utils/filterDefinitions'
import api from '@molgenis/molgenis-api-client'
import state from './state'

const negotiatorConfigIds = ['directory', 'bbmri-eric-model']

export default {
  SetCovidNetworkFilter (state, { name, value, router }) {
    if (state.filters.selections[name]) {
      Vue.set(state.filters.selections, name, [...new Set([...state.filters.selections[name], value.value])])
      Vue.set(state.filters.labels, name, [...new Set([...state.filters.labels[name], value.text])])
    } else {
      Vue.set(state.filters.selections, name, [value.value])
      Vue.set(state.filters.labels, name, [value.text])
    }
    createBookmark(router, state.filters.selections, state.selectedCollections)
  },
  UnsetCovidNetworkFilter (state, { name, value, router }) {
    if (state.filters.selections[name]) {
      Vue.set(state.filters.selections, name, [...state.filters.selections[name].filter(item => item !== value.value)])
      Vue.set(state.filters.labels, name, [...state.filters.labels[name].filter(item => item !== value.text)])
    }
    createBookmark(router, state.filters.selections, state.selectedCollections)
  },
  /**
   * Register the filters for country, materials, standards, and diagnosis_available in the state
   * so they can be used for 1) the URL and 2) retrieving biobanks based on IDs
   *
   * @param state
   * @param name name of the state entry e.g. country, materials, standards, or diagnosis_available
   * @param filters an array of values
   */
  UpdateFilter (state, { name, value, router }) {
    if (name === 'search') {
      Vue.set(state.filters.selections, name, value)
      createBookmark(router, state.filters.selections, state.selectedCollections)
      return
    }

    const filterValues = []
    const filterTexts = []

    for (const item of value) {
      filterValues.push(item.value)
      filterTexts.push(item.text)
    }

    Vue.set(state.filters.selections, name, [...new Set(filterValues)])
    Vue.set(state.filters.labels, name, [...new Set(filterTexts)])
    createBookmark(router, state.filters.selections, state.selectedCollections)
  },
  UpdateAllFilters (state, selections) {
    state.filters.selections = {}
    for (const [key, value] of Object.entries(selections)) {
      if (key === 'search') {
        Vue.set(state.filters.selections, key, value)
        continue
      }

      Vue.set(state.filters.selections, key, value)
      const leftoverLabels = [...new Set(state.filterLabelCache.filter(flc => value.includes(flc.value)).map(flc => flc.text))]
      Vue.set(state.filters.labels, key, leftoverLabels)
    }
  },
  /**
   * Reset all filters in the state
   */
  ResetFilters (state) {
    state.filters.selections = {}
  },
  SetFilterLists (state) {
    console.log('Setting Filter Lists')
  },
  SetBiobanks (state, biobanks) {
    biobanks.forEach(biobank => {
      Vue.set(state.biobanks, biobank.id, fixCollectionTree(biobank))
    })
  },
  SetBiobankIds (state, biobankIds) {
    state.biobankIds = biobankIds
  },
  // SetCountries (state, countries) {
  //   console.log(countries)
  // },
  // TODO name more specifically
  SetDictionaries (state, response) {
    const collections = response.items.map(item => (
      {
        id: item.data.id,
        label: item.data.label || item.data.name,
        biobankName: item.data.biobank.data.label || item.data.biobank.data.name,
        commercialUse: item.data.collaboration_commercial
        // country: item.data.biobank.data.country
      }))

    // state.countryDictionary = []
    collections.forEach(function (collection) {
      state.collectionBiobankDictionary[collection.id] = collection.biobankName
      state.collectionDictionary[collection.id] = collection.label
      // state.countryDictionary[collection.id] = collection.country
      // api.get(collection.country).then(response => {
      //   // const materialsresolve = response.items.map((obj) => [obj.data.id, obj.data.label])
      //   for (var item in response.items) {
      //     state.countryDictionary[response.items[item].data.id] = response.items[item].data.id
      //   }
      // })
    })

    const newNonCommercialCollections = state.nonCommercialCollections.concat(collections.filter(collection => !collection.commercialUse).map(collection => collection.id))
    state.nonCommercialCollections = [...new Set(newNonCommercialCollections)]
  },
  SetCountryDict (id, name) {
    console.log(id, name)
    state.countryDictionary[id] = name
    console.log(state.countryDictionary)
  },
  SetCountryList (state, response) {
    if (response === undefined) {
      // state.countryDictionary = response
      return
    }
    // return () => new Promise((resolve) => {
    const collects = response.items.map(item => (item.data.country.links.self))

    // console.log('setycoutnrylist')
    // console.log(collects)
    // console.log(new Set(collects))
    const countrylist = Array.from(new Set(collects))
    // console.log(countrylist)
    // const oo = []
    // state.countryDictionary = []
    // state.countryDictionary.AT = 'Austria'
    // var ii = new Promise((resolve) => {
    //   countrylist.forEach(async function (coll) {
    //     api.get(coll).then(response => {
    //       const key = response.data.id
    //       const name = response.data.name
    //       oo[key] = name
    //       resolve(oo)
    //       // console.log('hier')
    //       // console.log(key)
    //     })
    //   })
    // })

    async function fetchcountrydata (countrylist) {
      // countrylist.forEach(function (coll) {
      // //   oo.push(api.get(coll))
      // // }
      const aa = []
      for (var coll in countrylist) {
      // console.log(response.items[key].data.biobank.data.country.links.self)
        aa.push(api.get(countrylist[coll]))
      }

      // console.log(aa)
      // const c1 = api.get(countrylist[0])
      // const c2 = api.get(countrylist[1])
      const results = await Promise.all(aa)
      // console.log('awaiiting')
      // console.log(results)
      // console.log(state.countryDictionary)
      state.countryDictionary = []
      results.forEach((res) => {
        state.countryDictionary[res.data.id] = res.data.name || ''
      })

      // state.countryDictionary[results[0].data.id] = results[0].data.name
      // console.log(state.countryDictionary)
    }
    // console.log('await done 1')
    fetchcountrydata(countrylist)
    // response = ii // sinnlos
    // console.log('length oo')
    // console.log(oo.length)
    // console.log(response)
    // console.log('await done 2')
    // console.log(state.countryDictionary)
    // console.log(state.countryDictionary.length)

    // for (var key in oo.items) {
    //   console.log('key')
    //   console.log(key)
    // }

    // state.countryDictionary = oo
    // (state.countryDictionary[response.data.id] = response.data.name))
    // resolve(state.countryDictionary[response.data.id])

    // })
    // })
    // if (response === undefined) {
    //   state.countrylist = response
    //   return
    // }

    // const CountryList = []
    // state.countryDictionary = []
    // // const countries = []

    // for (var key in response.items) {
    //   // console.log(response.items[key].data.biobank.data.country.links.self)
    //   CountryList.push(response.items[key].data.country.links.self)
    // }
    // // console.log(Array.from(new Set(CountryList)))
    // const countrylist = Array.from(new Set(CountryList))
    // // console.log(countrylist.length)
    // // console.log(CountryList.length)
    // for (var country in countrylist) {
    //   // api.get(state.countrylist[country]).then(response => (state.countryDictionary[response.data.id] = response.data.name))
    //   api.get(countrylist[country]).then(response => (state.countryDictionary[response.data.id] = response.data.name))
    //   // await state.countryDictionary
    // }
    // await state.countryDictionary
    // console.log('await dict')
    // console.log(state.countryDictionary)
  },
  // SetQualityStandardDictionary (state, response) {
  //   // Combine arrays from two tables and deduplicate
  //   const allStandards = [...new Set(
  //     response.map(response => response.items)
  //       .reduce((prev, next) => prev.concat(next)))
  //   ]
  //   const qualityStandardsDictionary = {}

  //   allStandards.forEach((standard) => {
  //     qualityStandardsDictionary[standard.label] = standard.description || ''
  //   })

  //   state.qualityStandardsDictionary = qualityStandardsDictionary
  // },
  SetCollectionInfo (state, response) {
    if (response === undefined) {
      state.collectionInfo = response
      return
    }

    const collectionInfo = response.items.map(item => ({
      collectionId: item.data.id,
      collectionName: item.data.label || item.data.name,
      biobankId: item.data.biobank.data.id,
      isSubcollection: item.data.parent_collection !== undefined
    }))
    state.collectionInfo = collectionInfo
  },
  /**
   * Store a single biobank in the state for showing a biobank report
   * @param state
   * @param biobank response object from the server containing meta and items for a single biobank
   */
  SetBiobankReport (state, biobank) {
    state.biobankReport = biobank
  },
  SetCollectionReport (state, collection) {
    state.collectionReport = collection
  },
  SetNetworkReport (state, network) {
    state.networkReport.network = network
  },
  SetNetworkCollections (state, collections) {
    state.networkReport.collections = collections
  },
  SetNetworkBiobanks (state, biobanks) {
    state.networkReport.biobanks = biobanks
  },
  // methods for rehydrating bookmark
  // SetCollectionIdsWithSelectedQuality (state, response) {
  //   if (response.items && response.items.length > 0) {
  //     state.collectionIdsWithSelectedQuality = []
  //     state.collectionIdsWithSelectedQuality = [...new Set(response.items.map(ri => ri.collection.id))]
  //   } else {
  //     const collectionQualityFilter = state.filters.selections.collection_quality
  //     const isCollectionQualityFilterActive = (collectionQualityFilter && collectionQualityFilter.length > 0) || state.route.query.collection_quality

  //     state.collectionIdsWithSelectedQuality = isCollectionQualityFilterActive ? ['no-collection-found'] : []
  //   }
  // },
  // SetBiobankIdsWithSelectedQuality (state, response) {
  //   if (response.items && response.items.length > 0) {
  //     state.biobankIdsWithSelectedQuality = []
  //     state.biobankIdsWithSelectedQuality = [...new Set(response.items.map(ri => ri.biobank.id))]
  //   } else {
  //     const biobankQualityFilter = state.filters.selections.biobank_quality
  //     const isBiobankQualityFilterActive = (biobankQualityFilter && biobankQualityFilter.length > 0) || state.route.query.biobank_quality

  //     state.biobankIdsWithSelectedQuality = isBiobankQualityFilterActive ? ['no-biobank-found'] : []
  //   }
  // },
  AddCollectionsToSelection (state, { collections, router }) {
    const currentIds = state.selectedCollections.map(sc => sc.value)
    const newCollections = collections.filter(cf => !currentIds.includes(cf.value))
    state.selectedCollections = state.selectedCollections.concat(newCollections)

    if (router) {
      createBookmark(router, state.filters.selections, state.selectedCollections)
    }
  },
  RemoveCollectionsFromSelection (state, { collections, router }) {
    const collectionsToRemove = collections.map(c => c.value)
    state.selectedCollections = state.selectedCollections.filter(sc => !collectionsToRemove.includes(sc.value))

    if (router) {
      createBookmark(router, state.filters.selections, state.selectedCollections)
    }
  },
  /**
   *
   * @param state
   * @param params
   */
  MapQueryToState (state, ie11Query) {
    const query = ie11Query || state.route.query
    const keysInQuery = Object.keys(query)
    // we load the filterdefinitions, grab the names, so we can loop over it to map the selections
    const filters = filterDefinitions(state).map(fd => fd.name)
      .filter(name => keysInQuery.includes(name))
      .filter(fr => !['search', 'nToken'].includes(fr)) // remove specific filters, else we are doing them again.

    if (query.search) {
      Vue.set(state.filters.selections, 'search', query.search)
    }

    if (query.nToken) {
      state.nToken = query.nToken
    }

    if (query.cart) {
      const decoded = decodeURIComponent(query.cart)
      const cartIdString = atob(decoded)
      const cartIds = cartIdString.split(',')
      state.selectedCollections = cartIds.map(id => ({ label: state.collectionDictionary[id], value: id }))
    }

    for (const filterName of filters) {
      if (query[filterName]) {
        Vue.set(state.filters.selections, filterName, decodeURIComponent(query[filterName]).split(','))
      }
    }
    state.bookmarkMappedToState = true
  },
  SetError (state, error) {
    state.error = error
  },
  SetLoading (state, loading) {
    state.isLoading = loading
  },
  SetPodium (state, response) {
    state.isPodium = response.items.map(item => item.id.toLowerCase()).some(id => id.includes('podium'))
  },
  SetPodiumCollections (state, response) {
    state.podiumCollectionIds = response.items.map(pc => pc.data.id)
  },
  SetNegotiatorEntities (state, negotiatorConfig) {
    const negotiatorEntities = negotiatorConfig.items.map(nci => {
      return { id: nci.id, collectionEntityId: nci.entity.id, biobankEntityId: nci.biobankId.refEntityType.id } // We need to have the table
    }).filter(ne => negotiatorConfigIds.includes(ne.id))[0]

    if (negotiatorEntities) {
      state.negotiatorCollectionEntityId = negotiatorEntities.collectionEntityId
      state.negotiatorBiobankEntityId = negotiatorEntities.biobankEntityId
    }
  }
}
