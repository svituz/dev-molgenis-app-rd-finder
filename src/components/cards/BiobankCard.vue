<template>
  <div class="card biobank-card">
    <div class="card-header biobank-card-header" @click.prevent="collapsed = !collapsed">
      <div class="row">
        <div class="col-md-5" v-if="!loading">
          <h5>
            <router-link :to="'/biobank/' + biobank.id">
              <i v-if="biobank['ressource_types']['label'] == 'Biobank'" class="fa fa-table mr-1" style="color:green" aria-hidden="true" aria-labelledby="biobank-name"></i>
              <i v-if="biobank['ressource_types']['label'] == 'Registry'" class="fa fa-table mr-1" style="color:blue" aria-hidden="true" aria-labelledby="biobank-name"></i>
            </router-link>
            <span id="biobank-name">{{ biobank.name }}</span>
          </h5>
          <small v-if="biobank.quality && biobank.quality.length > 0">
            <quality-column :qualities="biobank.quality" :spacing="0"></quality-column>
          </small>
          <span v-if="availableCovidTypes">
            <b-img class="biobank-icon covid-icon" :src="require('../../assets/custom_icons/covid19.png')" title="Covid-19" />
          </span>
        </div>
        <div class="col-md-6" v-if="!loading">
          <p>
            <!-- <small>
              <b>Collection types:</b>
            </small>
            <small>{{ collectionTypes }}</small>
            <br /> -->
            <small>
              <b>Ressource Type:</b>
            </small>
            <small>{{ biobank['ressource_types']['label'] }}</small>
            <br />
            <template v-if="availableCovidTypes">
              <br />
              <small>
                <b>Covid-19:</b>
              </small>
              <small :key="type + index" v-for="(type, index) of availableCovidTypes">{{ type }}</small>
            </template>
          </p>
        </div>
        <div v-if="!loading" class="col-md-1 text-right pr-1">
            <span v-if="biobankInSelection" class="fa fa-check text-success" aria-hidden="true"></span>
        </div>
        <div v-else class="col-md-12 text-center">
          <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
        </div>
      </div>
    </div>
    <!-- <div class="card-body table-card" v-if="!collapsed && !loading">
      <collections-table v-if="biobank.collections.length > 0" :collections="sortedCollections"></collections-table>
    </div> -->
  </div>
</template>

<style>
.table-card {
  padding: 0.1rem;
}

.biobank-card {
  margin-bottom: 1em;
}

.biobank-card-header {
  background-color: #f5f5f5;
}

.biobank-card-header:hover {
  cursor: pointer;
  background-color: #e4e4e4;
}
.biobank-icon:hover {
  cursor: pointer;
}

.covid-icon {
  height: 1.5rem;
  width: auto;
}
</style>

<script>
// import CollectionsTable from '../tables/CollectionsTable.vue'
import { mapGetters, mapMutations } from 'vuex'
import utils from '../../utils'
import { sortCollectionsByName } from '../../utils/sorting'
import QualityColumn from '../tables/QualityColumn'
import 'array-flat-polyfill'

export default {
  name: 'biobank-card',
  components: {
    QualityColumn
  },
  props: {
    biobank: {
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
      biobankSelected: false,
      collapsed: this.initCollapsed
    }
  },
  computed: {
    ...mapGetters(['selectedCollections']),
    biobankInSelection () {
      const biobankCollectionSelection = this.biobank.collections.filter(bcf => !bcf.parent_collection).map(bc => ({ label: bc.label || bc.name, value: bc.id }))
      return this.selectedCollections.map(sc => sc.value).some(id => biobankCollectionSelection.map(pc => pc.value).includes(id))
    },
    getCollectionMag () {
      // const collections = Object.keys(this.biobank.collections)
      const collections = this.biobank.collections.filter(
        collection => !collection.parent_collection
      )
      let numbers = 0
      if (this.biobank.ressource_types.label === 'Registry') {
        numbers = collections[0].order_of_magnitude_donors.size
      } else if (this.biobank.ressource_types.label === 'Biobank') {
        numbers = collections[0].size
      }
      return numbers
    },
    sortedCollections () {
      return sortCollectionsByName(this.biobank.collections)
    },
    loading () {
      return typeof this.biobank === 'string'
    },
    collectionTypes () {
      const getSubCollections = collection => [
        collection,
        ...collection.sub_collections.flatMap(getSubCollections)
      ]
      const types = this.biobank.collections
        .flatMap(getSubCollections)
        .flatMap(collection => collection.type)
        .map(type => type.label)
      return utils.getUniqueIdArray(types).join(', ')
    },
    availableCovidTypes () {
      if (
        this.biobank.covid19biobank &&
        this.biobank.covid19biobank.length > 0
      ) {
        return this.biobank.covid19biobank
          .map(covidItem => covidItem.label || covidItem.name)
          .join(', ')
      } else return ''
    }
  },
  methods: {
    ...mapMutations(['AddCollectionToSelection', 'RemoveCollectionFromSelection'])
  }
}
</script>

<style>
.table-card {
  padding: 0.1rem;
}

.biobank-card {
  margin-bottom: 1em;
}

.biobank-card-header {
  background-color: #f5f5f5;
}

.biobank-card-header:hover {
  cursor: pointer;
  background-color: #e4e4e4;
}
.biobank-icon:hover {
  cursor: pointer;
}

.covid-icon {
  height: 1.5rem;
  width: auto;
}

.icon-alignment {
  position: relative;
  top: 1px;
}
</style>
