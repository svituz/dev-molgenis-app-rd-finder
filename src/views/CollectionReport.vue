<template>
  <!-- <div class="container mg-collection-report-card"> -->
    <div class="container-fluid">
      <loading :active="isLoading" loader="dots" :is-full-page="true" color="#598c68" background-color="var(--light)"></loading>
      <!-- Back to previous page buttons -->
      <button class="btn btn-link pl-0" @click="back"><i class="fa fa-angle-left" aria-hidden="true"></i> Back</button>

      <div class="row" v-if="this.collection && !this.isLoading">
        <div class="col">
          <div class="container p-0">
            <div class="row">
              <div class="col-md-7">
                <!-- <report-description :description="collection.description" :maxLength="500"></report-description> -->

                <div>
                  <b-card
                    class="rounded-xl shadow bb-card"
                    style="max-width: 50rem;"
                  >
                  <b-card-text>
                    <div class="row" style="height: 40px;">
                      <div class="col-sm-6" style="text-align:left" position="relative" top="-5px"> <b>ID: </b> {{collection.biobank.id}}</div>
                      <div class="col-sm-6" style="text-align:right"> <b>Last Activity: </b>{{getActivity}}</div>
                    </div>
                    <div class="row card-head">
                      <div class="col-sm-2">
                      <!-- <h2 class="card-head">
                        <b-badge
                          v-if="collection.biobank.ressource_types.label == 'Registry'" variant="primary"
                          >
                        {{collection.biobank.ressource_types.label}}
                        </b-badge>
                        <b-badge
                          v-if="collection.biobank.ressource_types.label == 'Biobank'" variant="success"
                        >
                        {{collection.biobank.ressource_types.label}}
                        </b-badge>
                      </h2> -->
                      </div>
                      <div class="col-sm-8 card-head" style="text-align:center">
                        <!-- <report-title type="Collection" :name="collection.name"></report-title> -->
                        <b class="header"> {{collection.name}} </b>
                      </div>
                    </div>
                    {{getDescription}}
                  </b-card-text>
                  </b-card>
                </div>
                <collection-selector class="mb-2" v-if="isTopLevelCollection" :collection="collection" />
                <div>
                  <h4 class="header">General Information</h4>
                  <p>Type of Host Institution: <b>Test</b> <br />
                  Source of funding:    <b>Test</b><br />
                  Target population: <b>Test</b><br />
                  Year of establishment: <b>Test</b>
                  </p>
                  <p>Ontologies used: <b>Test</b></p>
                  <p>Imaging available: <b>Test</b></p>
                  <p>Also listed in: <b>Test</b></p>
                </div>
                <!-- Recursive set of subcollections -->
          <!-- Right side card -->
          </div>
          <collection-report-info-card :info="info"></collection-report-info-card>
        </div>
        <div style="text-align:center" class="mt-2">
                  <h2 class="header"><strong>Disease Matrix</strong></h2>
                  <b-table
                  bordered
                  hover
                  small
                  striped
                  :items=getItemList
                  :fields="[
                    {
                      key: 'Name',
                      sortable: true
                    },
                    {
                      key: 'Number_of_patients',
                      sortable: true
                    },
                    {
                      key: 'diagnosis',
                      sortable: true
                    },
                    {
                      key: 'ORPHA',
                      sortable: true
                    },
                    {
                      key: 'ICD_10',
                      sortable: true
                    },
                    {
                      key: 'Synonyms',
                      sortable: true
                    }
                  ]">
                  </b-table>
                </div>
            </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
// import ReportDescription from '@/components/report-components/ReportDescription'
// import ReportTitle from '@/components/report-components/ReportTitle'
// import ReportListRow from '@/components/report-components/ReportListRow'
// import ReportSubCollection from '@/components/report-components/ReportSubCollection'
import CollectionReportInfoCard from '@/components/cards/CollectionReportInfoCard'
import moment from 'moment'
import CollectionSelector from '@/components/filters/CollectionSelector'
import { mapDetailsTableContent, mapCollectionsData, collectionReportInformation } from '@/utils/templateMapper'

export default {
  name: 'CollectionReport',
  components: {
    Loading,
    CollectionSelector,
    CollectionReportInfoCard
  },
  methods: {
    ...mapActions(['GetCollectionReport']),
    back () {
      this.$router.go(-1)
    },
    getCode (subCollection, type) {
      var code = (subCollection.diagnosis_available[0] === undefined) ? '' : subCollection.diagnosis_available[0].code
      if (code.length > 0) {
        code = String(subCollection.diagnosis_available[0].ontology).includes(type) ? subCollection.diagnosis_available[0].code : ''
      }
      console.log(code)
      return code
    }
  },
  computed: {
    ...mapState({ collection: 'collectionReport', isLoading: 'isLoading' }),
    mainContent () {
      return this.collection ? mapDetailsTableContent(this.collection) : {}
    },
    isTopLevelCollection () {
      return this.collection.parent_collection === undefined
    },
    info () {
      return collectionReportInformation(this.collection)
    },
    get_items () {
      return [{ id: 1, last_activation: 2 }]
    },
    subCollections () {
      return this.collection && this.collection.sub_collections && this.collection.sub_collections.length
        ? mapCollectionsData(this.collection.sub_collections)
        : []
    },
    collectionId () {
      const splittedUrl = this.$route.fullPath.split('/')
      return splittedUrl[splittedUrl.length - 1]
    },
    getTitle () {
      return this.collection.name
    },
    getHeader () {
      return 'ID: ' + this.collection.biobank.id
    },
    getDescription () {
      return this.collection.biobank.description
    },
    getActivity () {
      if (this.collection.sub_collections.length) {
        const date = moment(this.collection.sub_collections[0].timestamp).format('MM/DD/YYYY hh:mm')
        return date
      } else {
        const date = 'N/A'
        return date
      }
    },
    getItemList () {
      const items = []
      for (const key in this.collection.sub_collections) {
        items.push({
          Name: this.collection.sub_collections[key].name,
          Number_of_patients: this.collection.sub_collections[key].number_of_donors,
          diagnosis: (this.collection.sub_collections[key].diagnosis_available[0] === undefined) ? '' : this.collection.sub_collections[key].diagnosis_available[0].label,
          ICD_10: this.getCode(this.collection.sub_collections[key], 'ICD'),
          ORPHA: this.getCode(this.collection.sub_collections[key], 'orphanet')

        })
      }
      return items
    }
  },
  // needed because if we route back the component is not destroyed but its props are updated for other collection
  watch: {
    $route (to, from) {
      if (from.name.indexOf('collection') >= 0) {
        location.reload()
      }
    }
  },
  mounted () {
    this.GetCollectionReport([this.collectionId])
  }
}
</script>

<style scoped>
>>> .mg-report-details-list th {
  vertical-align: top;
}
>>> .badge {
  transition: transform 0.1s;
  box-shadow: 0 0 0 1px white;
}
>>> .badge:hover {
  transform: scale(1.4);
}

>>> .rounded-xl {
  border-radius: 20px;
}
.header {
  color: #a6cc74
}
.card-head {
  background-color: white;
  font-size: 120%;
}
.bb-card {
  position: relative;
  margin-top: -70px;
  border: none;
}
</style>
