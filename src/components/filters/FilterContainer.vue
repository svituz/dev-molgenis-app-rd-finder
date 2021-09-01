<template>
  <div id="filter-container">
    <!-- <FilterCard name="search" label="Search" description="Search by name, id, acronym" :collapsed="false">
      <StringFilter name="Search" v-model="search"></StringFilter>
    </FilterCard> -->
    <FilterCard
      v-for="filter in filters"
      :key="filter.name"
      :name="filter.name"
      :label="filter.label"
      :headerClass="filter.headerClass"
      :collapsed="filter.initiallyCollapsed">
      <component
        v-if="bookmarkMappedToState"
        :is="filter.component"
        :value="activeFilters[filter.name]"
        v-bind="filter"
        @input="(value) => filterChange(filter.name, value)"
        :returnTypeAsObject="true"
        :bulkOperation="true">
      </component>
    </FilterCard>
  </div>
</template>
<script>
/** Components used for filters */
import CovidFilter from '../filters/CovidFilter'
import CovidNetworkFilter from '../filters/CovidNetworkFilter'
import { StringFilter, FilterCard, CheckboxFilter, MultiFilter } from '@molgenis-ui/components-library'
// import state from '../../store/state'

/** */

import { mapGetters, mapMutations } from 'vuex'

export default {
  components: { StringFilter, CheckboxFilter, MultiFilter, FilterCard, CovidFilter, CovidNetworkFilter },
  data () {
    return {
      debounce: undefined
    }
  },
  computed: {
    ...mapGetters(['loading', 'foundC', 'showCountryFacet', 'countryDict', 'biobanks', 'activeFilters', 'getFoundBiobankIds', 'getFoundBiobanksCountries', 'filterDefinitions', 'bookmarkMappedToState']),
    // ...mapMutations(['SetCountryList']),
    search: {
      get () {
        return this.activeFilters.search
      },
      set (search) {
        if (this.debounce) {
          clearTimeout(this.debounce)
        }

        this.debounce = setTimeout(async () => {
          clearTimeout(this.debounce)
          this.UpdateFilter({ name: 'search', value: search, router: this.$router }) // passing router so we can set bookmark
        }, 500)
      }
    },
    getDict () {
      return this.countryDict
    },
    filters () {
      return this.filterDefinitions.filter((facet) => {
        // config option showCountryFacet is used to toggle Country facet
        // console.log(facet.name)
        // console.log(this.activeFilters)
        // console.log('activefilters')
        // console.log(facet.name)

        // console.log(Object.keys(this.countryDict))
        // console.log(Object.keys(state.countryDictionary))

        // if (facet.name === 'country') {
        //   console.log(this.filterDefinitions)
        this.filterDefinitions[4].optionsFilter = Object.keys(this.countryDict)
        // }
        // if (!facet.name === 'ressource_types') {
        //   console.log(this.countryDict)
        //   this.filterDefinitions[4].optionsFilter = this.optfilt // Object.keys(this.countryDict)
        //   console.log(this.filterDefinitions[4].optionsFilter.length)
        // }
        // console.log(this.foundC)
        // console.log(this.getFoundBiobanksCountries)
        // console.log(this.biobanks[5].country)
        // console.log(this.countryDictionary)
        // console.log(this.countryDictionary[0])
        // for (const bcountry in this.getFoundBiobanksCountries) {
        //   console.log(this.getFoundBiobanksCountries[bcountry].id)
        // }
        // facet.optionsFilter = ['Biobank']
        // state.countryDictionary = []
        // state.countryDictionary.AT = 'Austria'
        // console.log(state.countryDictionary)
        return !(this.showCountryFacet === false)
      }).filter((item) => item.component)
    }
  },
  methods: {
    ...mapMutations(['UpdateFilter']),
    filterChange (name, value) {
      // console.log('chango')
      // console.log(this.countryDict)
      // console.log('value')
      // console.log(name)
      // console.log(value)
      this.UpdateFilter({ name, value, router: this.$router })
      // console.log(Object.keys(this.countryDict))
      // console.log(Object.keys(state.countryDictionary))
      // if (name === 'country') {
      //   console.log(Object.keys(this.countryDict))
      // }
    }
  }
}
</script>
