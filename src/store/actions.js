import api from '@molgenis/molgenis-api-client'
import helpers from './helpers'
import utils from '../utils'
import 'array-flat-polyfill'

import { encodeRsqlValue, transformToRSQL } from '@molgenis/rsql'
// import state from './state'
// import { filter } from 'core-js/core/array'

/* API PATHS */
const BIOBANK_API_PATH = '/api/v2/rd_connect_biobanks'
const COLLECTION_API_PATH = '/api/v2/rd_connect_collections'
// const BIOBANK_QUALITY_STANDARDS = '/api/v2/rd_connect_ops_standards'
// const COLLECTION_QUALITY_STANDARDS = '/api/v2/rd_connect_lab_standards'
// const FILEMETA_API_PATH = '/api/v2/rd_connect_fileMeta'

// export const COLLECTION_QUALITY_INFO_API_PATH = '/api/v2/rd_connect_col_qual_info'
// export const BIOBANK_QUALITY_INFO_API_PATH = '/api/v2/rd_connect_bio_qual_info'

const NETWORK_API_PATH = '/api/v2/rd_connect_networks'
const NEGOTIATOR_API_PATH = '/api/v2/sys_negotiator_NegotiatorConfig'
const NEGOTIATOR_CONFIG_API_PATH = '/api/v2/sys_negotiator_NegotiatorEntityConfig?attrs=*,biobankId(refEntityType)'
/**/

/* Query Parameters */
export const COLLECTION_ATTRIBUTE_SELECTOR = 'collections(id,description,materials,diagnosis_available,country,name,type,number_of_donors,order_of_magnitude(*),order_of_magnitude_donors(*),size,number_of_donors,sub_collections(*),parent_collection,quality(*),data_categories)'
export const COLLECTION_REPORT_ATTRIBUTE_SELECTOR = '*,diagnosis_available(label),data_use(label,uri),biobank(*),contact(title_before_name,first_name,last_name,title_after_name,email,phone),sub_collections(name,id,sub_collections(*),parent_collection,diagnosis_available(*),order_of_magnitude,materials,data_categories,number_of_donors,description,gene,timestamp),number_of_donors'
/**/

export default {
  GetNegotiatorEntities ({ commit }) {
    api.get(NEGOTIATOR_CONFIG_API_PATH).then(response => {
      commit('SetNegotiatorEntities', response)
    })
  },
  // async GetQualityStandardInformation ({ commit }) {
  //   const biobankQualityInfo = api.get(`${BIOBANK_QUALITY_STANDARDS}?num=10000&attrs=label,description`)
  //   const collectionQualityInfo = api.get(`${COLLECTION_QUALITY_STANDARDS}?num=10000&attrs=label`)
  //   const response = await Promise.all([biobankQualityInfo, collectionQualityInfo])

  //   commit('SetQualityStandardDictionary', response)
  // },
  /*
   * Retrieves biobanks and stores them in the cache
   */
  GetBiobanks ({ commit }, biobankIds) {
    const q = encodeRsqlValue(transformToRSQL({ selector: 'id', comparison: '=in=', arguments: biobankIds }))
    api.get(`${BIOBANK_API_PATH}?num=10000&attrs=${COLLECTION_ATTRIBUTE_SELECTOR},*&q=${q}`)
      .then(response => {
        commit('SetBiobanks', response.items)
      //  commit('SetCountryList', response)
      }, error => {
        commit('SetError', error)
      })
  },
  // We need to get id's to use in RSQL later, because we can't do a join on this table
  // GetCollectionIdsForQuality ({ state, commit }) {
  //   const collectionQuality = state.route.query.collection_quality ? state.route.query.collection_quality : null
  //   const qualityIds = state.filters.selections.collection_quality ?? collectionQuality
  //   const selection = 'assess_level_col'
  //   if (qualityIds && qualityIds.length > 0) {
  //     const query = encodeRsqlValue(transformToRSQL({
  //       operator: 'AND',
  //       operands: flatten([
  //         state.filters.satisfyAll.includes('collection_quality')
  //           ? createQuery(qualityIds, selection, state.filters.satisfyAll.includes('collection_quality'))
  //           : createInQuery(selection, qualityIds)
  //       ])
  //     }
  //     ))
  //     api.get(`${COLLECTION_QUALITY_INFO_API_PATH}?attrs=collection(id)&q` + query).then(response => {
  //       commit('SetCollectionIdsWithSelectedQuality', response)
  //     })
  //   } else {
  //     commit('SetCollectionIdsWithSelectedQuality', [])
  //   }
  // },
  // Same as collections above
  // GetBiobankIdsForQuality ({ state, commit }) {
  //   const biobankQuality = state.route.query.biobank_quality ? state.route.query.biobank_quality : null
  //   const qualityIds = state.filters.selections.biobank_quality ?? biobankQuality
  //   const selection = 'assess_level_bio'
  //   if (qualityIds && qualityIds.length > 0) {
  //     const query = encodeRsqlValue(transformToRSQL({
  //       operator: 'AND',
  //       operands: flatten([
  //         state.filters.satisfyAll.includes('biobank_quality')
  //           ? createQuery(qualityIds, selection, state.filters.satisfyAll.includes('biobank_quality'))
  //           : createInQuery(selection, qualityIds)
  //       ])
  //     }
  //     ))
  //     api.get(`${BIOBANK_QUALITY_INFO_API_PATH}?attrs=biobank(id)&q=` + query).then(response => {
  //       commit('SetBiobankIdsWithSelectedQuality', response)
  //     })
  //   } else {
  //     commit('SetBiobankIdsWithSelectedQuality', [])
  //   }
  // },
  /*
   * Retrieves all collection identifiers matching the collection filters, and their biobanks
   */
  GetCollectionInfo ({ commit, getters }) {
    commit('SetCollectionInfo', undefined)
    let url = '/api/data/rd_connect_collections?filter=id,biobank(id,name,label,country),name,label,country,collaboration_commercial,parent_collection&expand=biobank&size=10000'
    if (getters.rsql) {
      url = `${url}&q=${encodeRsqlValue(getters.rsql)}`
    }
    api.get(url)
      .then(response => {
        commit('SetCollectionInfo', response)
        commit('SetDictionaries', response)
        commit('MapQueryToState')
      }, error => {
        commit('SetError', error)
      })
  },
  GetFilterReduction ({ commit, getters }) {
    // prepare async function and build correct query URLs for
    // the api/v2 - implementation of sql: DISTINCT command.
    // E.G. for country: ?aggs=x==country;distinct==country

    async function fetchData (url, filterName) {
      // asnyc function so we can load data and commit it right away
      api.get(url).then(response => {
        const load = { filter: filterName, options: response.aggs.xLabels }
        console.log(load)
        commit('SetFilterReduction', load)
      }, error => {
        commit('SetError', error)
      })
    }
    // prepare baseUrl and set list for dynamic filters that will be updated
    // this is still hardcoded!! List needs to be set here, state.List needs also to be set
    // in states object.
    const baseUrl = '/api/v2/rd_connect_collections'
    const dynamicFilters = ['country', 'materials']

    // if there is no activeFilter (anymore):
    // reset the dynamic filters:
    if (Object.keys(getters.activeFilters).length === 0) {
      commit('ResetDynamicFilters', dynamicFilters)
      return 0
    }

    // iterate over previously defined dynamic filters
    // and create one query URL for each dynamic filter
    for (const filter in dynamicFilters) {
      const filterName = dynamicFilters[filter]
      const unique = `?aggs=x==${filterName};distinct==${filterName}`
      var additionalFilters = '&q='

      for (const activeFilter in getters.activeFilters) {
        // skip the filter that was just changed
        if (activeFilter !== filterName) {
          var tempList = ''
          for (const option in getters.activeFilters[activeFilter]) {
            tempList = tempList + `${getters.activeFilters[activeFilter][option]},`
          }
          // remove the last comma from URL:
          tempList = tempList.slice(0, -1)

          if (getters.activeFilters[activeFilter].length > 1) {
            additionalFilters = additionalFilters + `${activeFilter}=in=(${tempList})`
          } else {
            additionalFilters = additionalFilters + `${activeFilter}==${tempList}`
          }
          additionalFilters = additionalFilters + ';'
        }
      }
      // check and remove the last semicolon from URL:
      if (additionalFilters.at(-1) === ';') {
        additionalFilters = additionalFilters.slice(0, -1)
      }
      // construct query URL and fetch data for each dynamic fitler:
      const url = baseUrl + unique + additionalFilters
      fetchData(url, filterName)
    }
  },
  GetBiobankIds ({ commit, getters }) {
    commit('SetBiobankIds', undefined)
    // commit('SetCountryList', undefined)
    let url = '/api/data/rd_connect_biobanks?filter=id,country&size=1000'
    if (getters.biobankRsql) {
      url = `${url}&q=${encodeRsqlValue(getters.biobankRsql)}`
    }
    console.log('GetIDs:')
    console.log(url)
    api.get(url)
      .then(response => {
        // console.log('handler getbiobankids')
        // console.log(response.items)
        // commit('SetCountryList', response)
        commit('SetBiobankIds', response.items.map(item => item.data.id))
      }, error => {
        commit('SetError', error)
      })
    // url = '/api/data/rd_connect_collections?filter=biobank(country),country&expand=biobank&size=10000'
    // if (getters.rsql) {
    //   url = `${url}&q=${encodeRsqlValue(getters.rsql)}`
    // }
    // api.get(url)
    //   .then(response => {
    //     commit('SetCountryList', response)
    //   }, error => {
    //     commit('SetError', error)
    //   })
  },
  GetBiobankReport ({ commit, state }, biobankId) {
    if (state.allBiobanks) {
      commit('SetBiobankReport', state.allBiobanks.find(it => it.id === biobankId))
      return
    }
    commit('SetLoading', true)
    api.get(`${BIOBANK_API_PATH}/${biobankId}?attrs=${COLLECTION_ATTRIBUTE_SELECTOR},${utils.qualityAttributeSelector('bio')},contact(*),*`).then(response => {
      commit('SetBiobankReport', response)
      commit('SetLoading', false)
    }, error => {
      commit('SetError', error)
      commit('SetLoading', false)
    })
  },
  GetCollectionReport ({ commit }, collectionId) {
    commit('SetLoading', true)
    api.get(`${COLLECTION_API_PATH}/${collectionId}?attrs=${COLLECTION_REPORT_ATTRIBUTE_SELECTOR}`).then(response => {
      commit('SetCollectionReport', response)
      commit('SetLoading', false)
    }, error => {
      commit('SetError', error)
      commit('SetLoading', false)
    })
  },
  GetNegotiatorType ({ commit }) {
    api.get(`${NEGOTIATOR_API_PATH}`).then(response => {
      commit('SetPodium', response)
    }, error => {
      commit('SetError', error)
    })
  },
  GetNetworkReport ({ commit }, networkId) {
    commit('SetNetworkBiobanks', undefined)
    commit('SetNetworkCollections', undefined)
    commit('SetNetworkReport', undefined)
    commit('SetLoading', true)
    const networks = api.get(`${NETWORK_API_PATH}/${networkId}`)
      .then(response => commit('SetNetworkReport', response))
      .finally(() => commit('SetLoading', false))
    const collections = api.get(`${COLLECTION_API_PATH}?q=network==${networkId}&num=10000&attrs=${COLLECTION_REPORT_ATTRIBUTE_SELECTOR}`)
      .then(response => commit('SetNetworkCollections', response.items))
    const biobanks = api.get(`${BIOBANK_API_PATH}?q=network==${networkId}&num=10000`)
      .then(response => commit('SetNetworkBiobanks', response.items))
    Promise.all([collections, biobanks, networks])
      .catch((error) => commit('SetError', error))
  },
  GetPodiumCollections ({ state, commit }) {
    if (state.isPodium && state.podiumCollectionIds.length === 0) { // only fetch once.
      api.get("/api/data/rd_connect_collections?num=10000&filter=id&q=podium!=''").then(response => {
        commit('SetPodiumCollections', response)
      })
    }
  },
  /**
   * Transform the state into a NegotiatorQuery object.
   * Calls the DirectoryController method '/export' which answers with a URL
   * that redirects to a Negotiator server specified in the Directory settings
   */
  async SendToNegotiator ({ state, getters, commit }) {
    const options = {
      body: JSON.stringify(helpers.createNegotiatorQueryBody(state, getters, helpers.getLocationHref()))
    }
    return api.post('/plugin/directory/export', options)
      .then(helpers.setLocationHref, error => commit('SetError', error))
  },
  AddCollectionsToSelection ({ commit, getters }, { collections, bookmark }) {
    commit('SetCollectionsToSelection', { collections, bookmark })
    commit('SetSearchHistory', getters.getHumanReadableString)
  }
}
// /@molgenis-ui/molgenis-theme/dist/themes/mg-molgenis-blue-4.css
// /@molgenis-ui/molgenis-theme/dist/themes/mg-molgenis-blue-3.css
//
// https://unpkg.com/@molgenis-ui/molgenis-theme@2.1.1/dist/themes/mg-rd-connect-4.css
// https://unpkg.com/@molgenis-ui/molgenis-theme@2.1.1/dist/themes/mg-rd-connect-3.css
