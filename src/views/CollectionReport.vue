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
                <div class="row">
                <div class="column-md-5">
                  <b-card
                    id="organisation-card"
                    class="rounded-xl shadow bb-card"
                    style="max-width: 50rem;"
                  >
                  <b-card-text>
                    <div class="row" style="height: 40px;">
                      <div class="col-sm-6" style="text-align:left" position="relative" top="-5px"> <b>ID: </b> {{collection.biobank.id}}</div>
                      <div class="col-sm-6" style="text-align:right"> <b>Last Activity: </b>{{getActivity}}</div>
                    </div>
                    <div class="row card-head">
                      <div id="image-header" class="row card-head" style="text-align:left;margin:0.5rem;" >
                        <!-- <report-title type="Collection" :name="collection.name"></report-title> -->
                        <div class="col-sm-2" style="width:50%;min-width:10rem;margin: 0 15px;">
                        <img style="max-width:10rem;" :src="this.collection.biobank.logo_link">
                        </div>
                        <div class="col-sm-2" style="margin: 1 1rem;min-width:25rem;">
                            <b class="header top"> {{collection.name}} </b>
                        </div>
                      </div>
                    </div>
                    <div class="truncated-description" style="margin-top:2rem;" v-if="this.truncated && this.collection.biobank.description">
                      {{getDescriptionTrunc}} ... <a href="#" v-bind:class="setTrunc" @click="setTrunc"> ShowMore </a>
                    </div>
                    <div style="margin-top:2rem;" v-else-if="this.collection.biobank.description">
                      {{getDescription}} <a href="#" v-bind:class="setTrunc" @click="setTrunc"> ShowLess </a>
                    </div>
                    <div style="margin-top:2rem;" v-else>
                    </div>
                  </b-card-text>
                  </b-card>
                  </div>
                </div>
                <collection-selector class="mb-2" style="margin-top:1rem;" v-if="isTopLevelCollection" :collection="collection" />
                </div>
                <!-- Recursive set of subcollections -->
          <!-- Right side card -->
          <!-- </div> -->
            <collection-report-info-card :info="info"></collection-report-info-card>
        </div>
        <div class="row">
          <div class="col-md7 info-box" style="width: 60%">
                <div>
                  <h4 class="header"><b>General Information</b></h4>
                  <hr>
                  <b-table
                  class="info-table"
                  id="general-info-table"
                  borderless
                  fixed
                  caption-top
                  thead-class="d-none"
                  :items=getInfoItems
                  :fields="[
                  {
                    key: 'info_type',
                    tdClass: 'info-field-cl',
                    position: sticky,
                    // colspan: '0.5',
                    // rowspan: '0.5'
                  },
                  {
                    key: 'info_field'
                  }
                  ]">
                  <template #table-caption><b><h4 class="header_disease"><strong>{{collection.name}}</strong></h4></b></template>
                  <template v-slot:cell(info_field)="field">
                    <b>{{ field.item.info_field }}</b>
                  </template>
                  <!-- :fields="[
                  {
                    key: 'info_field'
                  }
                  ]">
                  <template v-slot:cell(info_field)="field">
                    {{ field.item.info_type }}<b> {{ field.item.info_field }}</b>
                  </template> -->

                  </b-table>
                </div>
            </div>
            <div class="col-md-3 info-box">
              <h4 class="header"><b>Personnel</b></h4>
              <hr>
              <h5><b>Main Contact</b></h5>
              <p> </p>
              <p>{{ this.collection.contact.first_name }} {{ this.collection.contact.last_name }}
              <a :href="'mailto:' + this.collection.contact.email">
                      <span> {{this.collection.contact.email}}</span>
              </a>
              </p>
              <!-- <template v-if="info.contact">
                <h4 class="header">Personnel</h4>
                <ul class="right-content-list">
                  <template v-if="info.head">
                    <li>
                      <span class="font-weight-bold mr-1">Head/PI:</span>
                      <span>{{ info.head }}</span>
                    </li>
                  </template>
                  <li v-if="info.contact.name">
                    <span class="font-weight-bold mr-1">Main Contact:</span>
                    <span>{{ info.contact.name }}</span>
                  </li>
                  <li v-if="info.contact.email">
                    <span class="fa fa-fw fa-paper-plane mr-2" aria-hidden="true"></span>
                    <a :href="'mailto:' + info.contact.email">
                      <span> {{info.contact.email}}</span>
                    </a>
                  </li>
                </ul>
                </div>
              </template> -->
            </div>
          </div>
        <div style="text-align:left" class="mt-2">
                  <h2 style="text-align:center" class="header"><strong>Disease Matrix</strong></h2>
                  <b-table
                  id="disease-table"
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
                      key: 'Gene',
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
                      key: 'OMIM',
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
  data () {
    return {
      truncated: true
    }
  },
  methods: {
    ...mapActions(['GetCollectionReport']),
    back () {
      this.$router.go(-1)
    },
    getCode (subCollection, type) {
      var code = (subCollection.diagnosis_available[0] === undefined) ? '' : subCollection.diagnosis_available[0].code
      console.log(subCollection.diagnosis_available)
      var codes = []
      if (code.length > 0) {
        for (const diag in subCollection.diagnosis_available) {
          code = String(subCollection.diagnosis_available[diag].ontology).includes(type) ? subCollection.diagnosis_available[diag].code : ''
          console.log(subCollection.diagnosis_available)
          if (code.length > 0) {
            codes.push(code)
          }
        }
      }
      return String(codes)
    },
    setTrunc () {
      if (this.truncated) {
        this.truncated = false
      } else {
        this.truncated = true
      }
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
    getActivity () {
      if (this.collection.sub_collections.length) {
        const date = moment(this.collection.sub_collections[0].timestamp).format('MM/DD/YYYY hh:mm')
        return date
      } else {
        const date = 'N/A'
        return date
      }
    },
    getDescription () {
      return this.collection.biobank.description
    },
    getDescriptionTrunc () {
      const truncate = 200
      const truncated = this.collection.biobank.description.substring(0, truncate)
      return truncated
    },
    getItemList () {
      const items = []
      for (const key in this.collection.sub_collections) {
        items.push({
          Name: this.collection.sub_collections[key].name,
          Number_of_patients: this.collection.sub_collections[key].number_of_donors,
          Gene: this.collection.sub_collections[key].gene,
          ICD_10: this.getCode(this.collection.sub_collections[key], 'ICD'),
          ORPHA: this.getCode(this.collection.sub_collections[key], 'orphanet'),
          OMIM: this.getCode(this.collection.sub_collections[key], 'omim'),
          Synonyms: this.collection.sub_collections[key].description
        })
      }
      return items
    },
    getInfoItems () {
      const allItems = [
        { info_type: 'Acronym:', info_field: this.collection.biobank.acronym },
        { info_type: 'Type of host institution:', info_field: this.collection.biobank.host_is },
        { info_type: 'Source of funding:', info_field: this.collection.biobank.source_of_funding },
        { info_type: 'Target population:', info_field: this.collection.biobank.target_population },
        { info_type: 'Year of establishment:', info_field: this.collection.biobank.year_of_establishment },
        { info_type: 'Ontologies used:', info_field: this.collection.biobank.ontologies_used },
        { info_type: 'Additional Ontologies:', info_field: this.collection.biobank.additional_ontologies },
        { info_type: 'Biomaterial available:', info_field: this.collection.biobank.biomaterial_available },
        { info_type: 'Additional Biomaterial available:', info_field: this.collection.biobank.additional_biomaterial_available },
        { info_type: 'Imaging available:', info_field: this.collection.biobank.imaging_available },
        { info_type: 'Additional Imaging Data available:', info_field: this.collection.biobank.additional_imaging_available },
        { info_type: 'Also listed in:', info_field: this.collection.biobank.also_listed },
        { info_type: 'Additional Networks listed:', info_field: this.collection.biobank.additional_networks_inventories }
      ]

      if (this.collection.biobank.fields_display === undefined) {
        const minimal = [
          { info_type: 'Type of host institution:', info_field: this.collection.biobank.host_is },
          { info_type: 'Source of funding:', info_field: this.collection.biobank.source_of_funding },
          { info_type: 'Target population:', info_field: this.collection.biobank.target_population },
          { info_type: 'Year of establishment:', info_field: this.collection.biobank.year_of_establishment },
          { info_type: 'Ontologies used:', info_field: this.collection.biobank.ontologies_used },
          { info_type: 'Imaging available:', info_field: this.collection.biobank.imaging_available },
          { info_type: 'Also listed in:', info_field: this.collection.biobank.additional_networks_inventories }
        ]
        return minimal
      }
      const fields = this.collection.biobank.fields_display.split('_INSTANCE_')
      const reducedItems = []
      for (const item in allItems) {
        const field = allItems[item].info_type.split(':')[0].toUpperCase().replaceAll(' ', '_')
        console.log(field)
        console.log(fields)
        const found = fields.find(v => (v.toUpperCase().includes(field)))
        console.log(found)
        if (found) {
          reducedItems.push(allItems[item])
        }
      }
      return reducedItems
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
.header_disease {
  color: #080808ee
}
.top {
  font-size: 70%;
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

#general-info-table {
  font-size: 90%;
  border-collapse: separate;
  border-spacing: 0px;
  padding: 0px;
  max-width: 380px;
  justify-content: right;
  align-items: right;
}

.truncated-description {
  height: 4rem;
}

.table td{
  padding: 0px;
}

.info-box {
  margin-left: 1rem;
  margin-right: 1rem;
}

hr {
  border:none;
  border-top:1px dotted #000;
  align-content: flex-start;
  margin-left: 0%;
  /* color:#fff; */
  /* background-color:#fff; */
  height:1px;
}

</style>
