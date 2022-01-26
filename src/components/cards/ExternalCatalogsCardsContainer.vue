<template>
  <div class="external-resource-cards-container">
    <div v-if="isAnyFilterActive">
      <external-catalog-card
        v-for="catalog in externalResourcesFilters.externalSources"
        :key="catalog.id"
        :externalCatalog="catalog">
      </external-catalog-card>
    </div>
    <div v-else class="status-text">
      <span>
        Select the external catalogs in the menù and search for a specific disease to query external catalogs
      </span>
    </div>
  </div>
</template>

<style>
.status-text {
  text-align: center;
  justify-content: center;
  padding: 1rem;
}

.external-resource-cards-container {
  width: 100%;
}
</style>

<script>
import ExternalCatalogCard from './ExternalCatalogCard'
import { mapGetters } from 'vuex'

export default {
  name: 'external-catalogs-cards-container',
  data () {
    return {}
  },
  computed: {
    ...mapGetters([
      'externalResourcesFilters',
      'externalResources'
    ]),
    isAnyFilterActive () {
      return 'externalSources' in this.externalResourcesFilters &&
        'diagnosisAvailable' in this.externalResourcesFilters &&
        this.externalResourcesFilters.externalSources.length > 0 &&
        this.externalResourcesFilters.diagnosisAvailable.length > 0
    }
  },
  components: {
    ExternalCatalogCard
  },
  mounted () {
  }
}
</script>
