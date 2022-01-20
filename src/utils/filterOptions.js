/* istanbul ignore file */
import api from '@molgenis/molgenis-api-client'
import store from '../store'
import { encodeRsqlValue, transformToRSQL } from '@molgenis/rsql'
import { isCodeRegex } from '../../src/store/helpers'
import state from '../store/state'
import { createTextSearchQuery } from '.'

// Async so we can fire and forget for performance.
async function cache (filterData) {
  store.commit('SetFilterOptionDictionary', filterData)
}

function retrieveFromCache (filterName) {
  return store.state.filterOptionDictionary[filterName] ?? []
}

function checkForBookmarkFilter (filterName, filterOptions) {
  if (!store.state.diagnosisAvailableFetched) {
    // If we have a cold start with a bookmark
    // we need to have the label for the selected filter
    const activeDiagnosisFilter = store.getters.activeFilters[filterName]

    if (activeDiagnosisFilter) {
      let options = []
      for (const activeFilter of activeDiagnosisFilter) {
        const optionToCache = filterOptions.filter(option => option.value === activeFilter)
        if (optionToCache) {
          options = options.concat(optionToCache)
        }
      }
      if (options.length) {
        cache({ filterName, filterOptions: options })
      }
    }
  }
}

export const genericFilterOptions = (tableName, filterName) => {
  return () => new Promise((resolve) => {
    const cachedOptions = retrieveFromCache(filterName)

    if (!cachedOptions.length) {
      api.get(`/api/v2/${tableName}`).then(response => {
        const filterOptions = response.items.map((obj) => { return { text: obj.label || obj.name, value: obj.id } })
        cache({ filterName, filterOptions })
        resolve(filterOptions)
      })
    } else {
      resolve(cachedOptions)
    }
  })
}

export const reducedFilterOptions = (entityName) => {
  // if latest filter selection is filterName dont do anything,
  // else create reduced filter array for specific filter
  if (Object.keys(state.filters.selections).at(-1) === entityName && state.loading) {
    return 0
  } else {
    // store.dispatch('GetReducedFilter', entityName)
  }
}
export const genericFilterOptions2 = (tableName) => {
  return () => new Promise((resolve) => {
    api.get(`/api/v2/${tableName}`).then(response => {
      // const filterOptions = response.items.map((obj) => { return { text: obj.label || obj.name, value: obj.id } })
      // resolve(filterOptions)
      var dict = []
      for (var count in state.countryDictionary) {
        // console.log(count)
        dict.push({ name: state.countryDictionary[count], id: count })
      }
      const countryresolve = dict.map((obj) => { return { text: obj.name, value: obj.id } })
      // UpdateFilter (state, { name, value, router })
      resolve(countryresolve)
    })
  })
}

// export const genericFilterOptions2 = () => {
//   return () => new Promise((resolve) => {
//     api.get(`/api/v2/${api}`).then(response => {
//       // var dict = []
//       // for (var count in state.countryDictionary) {
//       //   dict.push({ name: state.countryDictionary[count], id: count })
//       // }
//       // const countryresolve = dict.map((obj) => { return { text: obj.name, value: obj.id } })
//       const oo = ['AT', 'CZ']
//       resolve(oo)
//     })
//   })
// }

// export const genericFilterOptions2 = Object.keys(state.filters.selections) // ['AT', 'CZ'] //

// export const optionsFilteroptions = () => {
//   // const collects = response.items.map(item => (item.data.country.links.self))

//   const countrylist = ['http://localhost:8082/api/data/rd_connect_countries/AT', 'http://localhost:8082/api/data/rd_connect_countries/CZ']
//   return ({ oo }) => new Promise((resolve) => {
//     countrylist.forEach(function (coll) {
//       api.get(coll).then(response => {
//         const oo = ['AT', 'CZ'] // response.map((data) => { return data.id })
//         // const key = response.data.id
//         // const name = response.data.name
//         // oo[key] = name
//         resolve(oo)
//       })
//     })
//   })
// }
/** Specific logic for diagnosis available filter */
const createDiagnosisLabelQuery = (query) => transformToRSQL(createTextSearchQuery('label', query, true))
const createDiagnosisCodeQuery = (query) => transformToRSQL({ selector: 'code', comparison: '=like=', arguments: query.toUpperCase() })
/** */

export const diagnosisAvailableFilterOptions = (tableName, filterName) => {
  // destructure the query part from the multi-filter
  return ({ query, queryType }) => new Promise((resolve) => {
    let url = `/api/v2/${tableName}`
    if (query) {
      // initial load, values are id's
      if (queryType === 'in') {
        url = `${url}?q=${encodeRsqlValue(`code=in=(${query})`)}`
      } else if (isCodeRegex.test(query)) {
        url = `${url}?q=${encodeRsqlValue(createDiagnosisCodeQuery(query))}`
      } else {
        url = `${url}?q=${encodeRsqlValue(createDiagnosisLabelQuery(query))}`
      }
    }

    api.get(url).then(response => {
      const filterOptions = response.items.map((obj) => { return { text: `[ ${obj.code} ] - ${obj.label || obj.name}`, value: obj.id } })
      checkForBookmarkFilter(filterName, filterOptions)
      resolve(filterOptions)
    })
  })
}

export const collaborationTypeFilterOptions = () => {
  const filterOptions = [{ text: 'Commercial use', value: 'true' }, { text: 'Non-commercial use', value: 'false' }]

  return () => new Promise((resolve) => {
    resolve(filterOptions)
  })
}
