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
    // commit('SetLoading', true)
    // commit('SetCountryList', undefined)
    // let url = `${'/api/data/rd_connect_biobanks?filter=id,country&size=10'}&q=${encodeRsqlValue(getters.biobankRsql)}`
    let url = '/api/data/rd_connect_collections?filter=id,biobank(id,name,label,country),name,label,country,collaboration_commercial,parent_collection&expand=biobank&size=10000'
    if (getters.rsql) {
      url = `${url}&q=${encodeRsqlValue(getters.rsql)}`
    }
    api.get(url)
      .then(response => {
        commit('SetCollectionInfo', response)
        commit('SetDictionaries', response)
        // commit('SetCountryList', response)
        commit('MapQueryToState')
      }, error => {
        commit('SetError', error)
      })
    // await Promise.all([url])
  },
  GetFilterReduction ({ commit, getters }) {
    async function fetchData (url, filterName) {
      api.get(url).then(response => {
        // commit('SetReducedFilters', 'filter')
        const load = { filter: filterName, options: response.aggs.xLabels }
        console.log(load)
        commit('SetCountry', load)
      }, error => {
        commit('SetError', error)
      })
    }

    if (Object.keys(getters.activeFilters).length === 0) {
      return 0
    }

    const baseUrl = '/api/v2/rd_connect_collections'
    const dynamicFilters = ['country', 'materials']

    for (const filter in dynamicFilters) {
      const filterName = dynamicFilters[filter]
      const unique = `?aggs=x==${filterName};distinct==${filterName}`
      var additionalFilters = '&q='

      for (const activeFilter in getters.activeFilters) {
        if (activeFilter !== filterName) {
          var tempList = ''
          for (const option in getters.activeFilters[activeFilter]) {
            tempList = tempList + `${getters.activeFilters[activeFilter][option]},`
          }
          tempList = tempList.slice(0, -1)
          // additionalFilters = additionalFilters + `${activeFilter}=in=(${tempList})`

          if (getters.activeFilters[activeFilter].length > 1) {
            additionalFilters = additionalFilters + `${activeFilter}=in=(${tempList})`
          } else {
            additionalFilters = additionalFilters + `${activeFilter}==${tempList}`
          }
          additionalFilters = additionalFilters + ';'
        }
      }
      // console.log(additionalFilters)
      if (additionalFilters.at(-1) === ';' || additionalFilters.at(-1) === ',') {
        additionalFilters = additionalFilters.slice(0, -1)
      }
      const url = baseUrl + unique + additionalFilters
      console.log(url)
      fetchData(url, filterName)
    }
  },
  // GetReducedFilter ({ commit, getters }, entityName) {
  //   let url = '/api/data/rd_connect_collections?filter=id,biobank(id,name,label,country,ressource_types),name,label,country,materials,parent_collection&expand=biobank&size=10000'
  //   if (getters.rsql) {
  //     url = `${url}&q=${encodeRsqlValue(getters.rsql)}`
  //   }
  //   async function fetchData (response, entityName) {
  //     console.log('filterName:')
  //     console.log(entityName)
  //     console.log(response.items)
  //     // const key = String(entityName)
  //     const collects = response.items.map(item => (item.data[entityName].links.self))
  //     const countrylist = Array.from(new Set(collects))
  //     const aa = []
  //     for (var coll in countrylist) {
  //       aa.push(api.get(countrylist[coll]))
  //     }
  //     const results = await Promise.all(aa)
  //     return results
  //   }
  //   api.get(url)
  //     .then(response => {
  //       const resu = fetchData(response, entityName)
  //       if (resu) {
  //         console.log(resu)
  //         commit('SetReducedFilters', entityName, resu)
  //       }
  //     }, error => {
  //       commit('SetError', error)
  //     })
  // },
  // GetCountry ({ commit, getters }) {
  //   // console.log('action getcountry')
  //   let url = '/api/data/rd_connect_collections?filter=id,biobank(id,name,label,country,ressource_types),name,label,country,collaboration_commercial,parent_collection&expand=biobank&size=10000'
  //   if (getters.rsql) {
  //     url = `${url}&q=${encodeRsqlValue(getters.rsql)}`
  //   }
  //   async function fetchcountrydata (response) {
  //     // countrylist.forEach(function (coll) {
  //     // //   oo.push(api.get(coll))
  //     // // }

  //     const collects = response.items.map(item => (item.data.country.links.self))
  //     const countrylist = Array.from(new Set(collects))
  //     const aa = []
  //     for (var coll in countrylist) {
  //     // console.log(response.items[key].data.biobank.data.country.links.self)
  //       aa.push(api.get(countrylist[coll]))
  //     }
  //     // console.log(response)
  //     const collects2 = response.items.map(item => (item.data.biobank.data.ressource_types.links.self))
  //     const rescourcelist = Array.from(new Set(collects2))
  //     const bb = []
  //     for (var coll2 in rescourcelist) {
  //     // console.log(response.items[key].data.biobank.data.country.links.self)
  //       bb.push(api.get(rescourcelist[coll2]))
  //     }

  //     // console.log(aa)
  //     // const c1 = api.get(countrylist[0])
  //     // const c2 = api.get(countrylist[1])
  //     const results = await Promise.all(aa)

  //     // console.log('awaiiting')
  //     // console.log(results)
  //     // console.log(state.countryDictionary)
  //     // const oo = []
  //     // return new Promise(resolve => { resolve(results) })
  //     return results
  //   }
  //   //   console.log('oo')
  //   //   console.log(results)
  //   //   // results.forEach((res) => {
  //   //   //   oo[res.data.id] = res.data.name || ''
  //   //   // })
  //   //   console.log(oo)
  //   // }
  //   api.get(url)
  //     .then(response => {
  //       // if (response !== undefined) {
  //       // commit('ResetC', [])
  //       // }
  //       // console.log('fff')
  //       // console.log(getters.activeFilters)
  //       // console.log(response)
  //       const resu = fetchcountrydata(response)
  //       // commit('ResetC', [])
  //       if (resu) {
  //         commit('SetC', resu)
  //       }
  //       // commit('SetC', resu)
  //     }, error => {
  //       commit('SetError', error)
  //     })
  // },
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
