/* istanbul ignore file */
import api from '@molgenis/molgenis-api-client'
import { encodeRsqlValue, transformToRSQL } from '@molgenis/rsql'
import { isCodeRegex } from '../../src/store/helpers'
// import state from '../store/state'

export const genericFilterOptions = (tableName) => {
  return () => new Promise((resolve) => {
    api.get(`/api/v2/${tableName}`).then(response => {
      const filterOptions = response.items.map((obj) => { return { text: obj.label || obj.name, value: obj.id } })
      resolve(filterOptions)
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

//   console.log('filteroptions')
//   // console.log(new Set(collects))
//   const countrylist = ['http://localhost:8082/api/data/rd_connect_countries/AT', 'http://localhost:8082/api/data/rd_connect_countries/CZ']
//   // console.log(countrylist.length)
//   // const oo = []
//   return ({ oo }) => new Promise((resolve) => {
//     countrylist.forEach(function (coll) {
//       api.get(coll).then(response => {
//         const oo = ['AT', 'CZ'] // response.map((data) => { return data.id })
//         // console.log(oo)
//         // const key = response.data.id
//         // const name = response.data.name
//         // oo[key] = name
//         resolve(oo)
//         // console.log('hier')
//         // console.log(oo)
//       })
//     })
//   })
// }
/** Specific logic for diagnosis available filter */
const createDiagnosisLabelQuery = (query) => transformToRSQL({ selector: 'label', comparison: '=like=', arguments: query })
const createDiagnosisCodeQuery = (query) => transformToRSQL({ selector: 'code', comparison: '=like=', arguments: query.toUpperCase() })
/** */

export const diagnosisAvailableFilterOptions = (tableName) => {
  // destructure the query part from the multi-filter
  return ({ query, queryType }) => new Promise((resolve) => {
    let url = `/api/v2/${tableName}`

    if (query) {
      // initial load, values are ids
      if (queryType === 'in') {
        url = `${url}?q=${encodeRsqlValue(`id=in=(${query})`)}`
      } else if (isCodeRegex.test(query)) {
        url = `${url}?q=${encodeRsqlValue(createDiagnosisCodeQuery(query))}`
      } else {
        url = `${url}?q=${encodeRsqlValue(createDiagnosisLabelQuery(query))}`
      }
    }

    api.get(url).then(response => {
      const filterOptions = response.items.map((obj) => { return { text: `[ ${obj.code} ] - ${obj.label || obj.name}`, value: obj.id } })
      resolve(filterOptions)
    })
  })
}

export const collaborationTypeFilterOptions = () => {
  return () => new Promise((resolve) => {
    resolve([{ text: 'Commercial use', value: 'true' }, { text: 'Non-commercial use', value: 'false' }])
  })
}
