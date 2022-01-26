<template>
  <div class="card mb-4">
    <div
      class="card-header external-catalog-card-header d-flex"
      @click.prevent="visible = !visible">
      <div class="mr-3">
        <font-awesome-icon
          icon="caret-right"
          :style="iconStyle"
          class="collapse-button collapse-button-external-catalog"
          @click.prevent="collapsed=!collapsed"/>
      </div>
      <b><span class="catalog-name">{{ externalCatalog.label || catalogData.name }}</span></b>
    </div>
    <b-collapse
      v-if="dataLoaded"
      id="collapse-4"
      v-model="visible"
      class="card-body mt-2">
        <b-pagination
          size="md"
          align="center"
          v-model="currentPage"
          v-on:input="changePage"
          :total-rows="catalogData.page.totalElements"
          :per-page="catalogData.page.size"></b-pagination>
        <external-resource-card
          v-for="(resource, name) in catalogData.resources"
          :key="name"
          :resource="resource"></external-resource-card>
    </b-collapse>
    <div v-else class="status-text">
      <h4>
        Loading data...
        <i class="fa fa-spinner fa-pulse" aria-hidden="true"></i>
      </h4>
    </div>
  </div>
</template>

<style>
.catalog-name {
  font-size: 1.30rem;
}

.collapse-button-external-catalog {
  margin-top: 0.43em;
}

.external-catalog-card-header {
  background-color: #e4e4e4;
}

.external-catalog-card-header:hover {
  cursor: pointer;
  background-color: #e4e4e4;
}
</style>

<script>
import 'array-flat-polyfill'
import ExternalResourceCard from './ExternalResourceCard'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'external-catalog-card',
  props: {
    externalCatalog: {
      type: [Object, String]
    },
    initCollapsed: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data () {
    return {
      visible: !this.initCollapsed,
      currentPage: 1,
      collapsed: this.initCollapsed
    }
  },
  computed: {
    ...mapGetters([
      'externalResources'
    ]),
    iconStyle () {
      return {
        transform: `rotate(${this.visible ? 90 : 0}deg)`,
        transition: 'transform 0.2s'
      }
    },
    catalogData () {
      if (this.externalResources) {
        return this.externalResources[this.externalCatalog.id] || []
      } else {
        return {}
      }
    },
    dataLoaded () {
      return Object.keys(this.catalogData).length > 0
    }
  },
  methods: {
    ...mapActions(['GetExternalCatalogsResources']),
    changePage (page) {
      this.GetExternalCatalogsResources({ catalog: this.externalCatalog.id, skip: page - 1 })
    }
  },
  components: {
    ExternalResourceCard
  }
}
</script>
