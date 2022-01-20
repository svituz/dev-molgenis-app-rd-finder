<template>
  <!-- <div class="container mg-collection-report-card"> -->
    <div class="container-flex" style="width:940px">
      <loading :active="isLoading" loader="dots" :is-full-page="true" color="#598c68" background-color="var(--light)"></loading>
      <!-- Back to previous page buttons -->
      <!-- <button class="btn btn-link pl-0" @click="back"><i class="fa fa-angle-left" aria-hidden="true"></i> Back</button> -->

      <div class="row" v-if="this.collection && !this.isLoading">
        <div class="col">
          <div class="container p-0 coll-report">
            <div class="row">
              <div class="col-7">
                <!-- <report-description :description="collection.description" :maxLength="500"></report-description> -->
                <div class="row">
                <div class="column-5">
                  <b-card
                    id="organisation-card"
                    class="rounded-xl shadow bb-card"
                    style="width: 545px; height: 325px; margin-top:-30px">
                  <b-card-text>
                    <div class="row" style="height: 40px;">
                      <div class="col-sm-6" style="text-align:left" position="relative" top="-5px"> <b>ID: </b> {{getCollectionID}}</div>
                      <div class="col-sm-6" style="text-align:right"> <b>Last Activity: </b>{{getActivity}}</div>
                    </div>
                    <div class="row card-head">

                      <div id="image-header" class="row" style="text-align:left;height:95px;display: inline-table;margin-left:10px;margin-right:10px" >
                        <!-- <report-title type="Collection" :name="collection.name"></report-title> -->
                        <a href="#">
                        <img style="max-width:250px; max-height: 85px;height: auto;margin-top:20px;margin-left:26px;margin-right:20px;float:left;" :src="this.collection.biobank.logo_link">
                        </a>
                        <!-- <div class="col-sm-2"></div> -->
                        <div style="font-size: 18px;font-weight: bold;color: #8bbf39;width: 95%;height: 116px;display: table-cell;vertical-align: middle;padding-right:15px;">
                            {{collection.name}}
                        </div>
                      </div>
                    </div>
                    <div class="truncated-description" style="margin-top:10px;" v-if="this.collection.biobank.description">
                      <td v-html="formatString(getDescriptionTrunc)"></td>
                    </div>
                    <div style="margin-top:2rem;" v-else>
                    </div>
                  </b-card-text>
                  <div class="card-button" style="position: absolute; top: 277px; left: 25px;padding-top:2px">
                    <a class="head-button" href="#" v-bind:class="toggleOverview" @click="toggleOverview"> Overview </a>
                    <p style="margin-bottom:-4px;"> [{{getInfoItems.length}}]</p>
                  </div>
                  <div class="card-button" style="position: absolute; top: 277px; left: 195px;padding-top:2px">
                    <a class="head-button"  href="#" v-bind:class="toggleDiseaseMatrix" @click="toggleDiseaseMatrix"> Diseases </a>
                    <p style="margin-bottom:-4px;">[{{this.collection.sub_collections.length}}]</p>
                  </div>
                  </b-card>
                  </div>
                </div>
                <collection-selector class="mb-2" style="margin-top:1rem;margin-left:20px;" v-if="isTopLevelCollection" :collection="collection" />
                </div>
                <!-- Recursive set of subcollections -->
          <!-- Right side card -->
          <!-- </div> -->
            <collection-report-info-card :info="info"></collection-report-info-card>
        </div>
        <div class="row" style="width:940px;">
        <div class="row" style="width:940px;" v-if="this.show_gi">
          <div class="col-8 info-box">
                <div>
                  <h4 class="header" style="margin-bottom:-10px"><b>General Information</b></h4>
                  <hr>
                  <div style="margin-left: 6px;">
                  <td v-if="checkInfoLengths(getInfoItems)" v-html="getInfoItemsText(getInfoItems)"></td>
                  </div>
                  <b-table v-if="!checkInfoLengths(getInfoItems)"
                  class="info-table"
                  id="general-info-table"
                  fixed
                  small
                  borderless
                  caption-top
                  thead-class="d-none"
                  :items=getInfoItems
                  :fields="[
                  {
                    key: 'info_type',
                  },
                  {
                    key: 'info_field',
                    tdClass: 'info-field-cl',
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
            <div class="col-3 info-box">
              <h4 class="header" style="margin-bottom:-10px"><b>Personnel</b></h4>
              <hr>
              <h5><b>Main Contact</b></h5>
              <p> </p>
              <p>{{ this.collection.contact.first_name }} {{ this.collection.contact.last_name }} <br>
              <a :href="'mailto:' + this.collection.contact.email">
                      <span> {{this.collection.contact.email}}</span>
              </a>
              </p>
            </div>
          </div>
        <div class="row" v-if="this.show_gi">
          <div class="col-7 info-box" style="margin-left: 21px; margin-top: 15px; margin-bottom:35px;">
            <td v-html="formatString(getDescription)"></td>
          </div>
        </div>
        <div class="row" v-if="this.show_disease">
          <div style="text-align:left" class="col-12 info-box">
                  <h4 style="text-align:left; margin-bottom:-10px" class="header"><strong>Disease Matrix</strong></h4>
                  <hr class="long-hr">
                  <b-table
                  id="disease-table"
                  class="disease_table"
                  bordered
                  show-empty
                  fixed
                  hover
                  small
                  striped
                  :items=getItemList
                  :fields="[
                    {
                      key: 'Disease_Name',
                      sortable: true
                    },
                    {
                      key: 'Number_of_patients_Donors',
                      sortable: true
                    },
                    {
                      key: 'Gene',
                      sortable: true
                    },
                    {
                      key: 'ORPHA_Code',
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
                <div class="row" v-if="this.collection.biobank.ressource_types.label === 'Biobank' & this.show_disease">
                <div style="text-align:left; margin-left: 31px;" class="col-12 info-box">
                  <h4 style="text-align:left; margin-bottom:-10px" class="header"><strong>ICD 10 Categories</strong></h4>
                  <hr class="long-hr">
                  <b-table
                  class="info-table"
                  id="categories-table"
                  borderless
                  fixed
                  small
                  thead-class="d-none"
                  :items=showDiseaseAreas>
                    <template v-slot:cell(field)="fields">
                    <b>{{ fields.item.field }}</b>
                  </template>
                  </b-table>
                </div>
                </div>
                </div>
            </div>
          </div>
      </div>
    </div>
      <div class="row-footer2" v-if="!this.isLoading">
      <p class="footer-p">
        Linking up rare disease resarch across the world
      </p>
      <p class="footer-p footer-link" >
        <a :href="geturl">RD-Connect</a>
      </p>
      <p class="footer-p footer-link">
        <router-link :to="'/dataprotectionstatement'">Data Protection statement </router-link>
      </p>
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
import { mapCollectionsDetailsTableContent, collectionReportInformation } from '@/utils/templateMapper'

export default {
  name: 'CollectionReport',
  components: {
    Loading,
    CollectionSelector,
    CollectionReportInfoCard
  },
  data () {
    return {
      truncated: true,
      show_disease: false,
      show_gi: true,
      make_table: true,
      geturl: 'https://rd-connect.eu/'
    }
  },
  methods: {
    ...mapActions(['GetCollectionReport']),
    back () {
      this.$router.go(-1)
    },
    toggleOverview () {
      this.show_gi = true
      this.show_disease = false
    },
    toggleDiseaseMatrix () {
      this.show_disease = true
      this.show_gi = false
    },
    getCode (subCollection, type) {
      var code = (subCollection.diagnosis_available[0] === undefined) ? '' : subCollection.diagnosis_available[0].code
      var codes = []
      if (code.length > 0) {
        for (const diag in subCollection.diagnosis_available) {
          var tryCode = (subCollection.diagnosis_available[diag].code === undefined) ? '' : subCollection.diagnosis_available[diag].code
          if (tryCode.length > 0) {
            code = String(subCollection.diagnosis_available[diag].ontology).includes(type) ? subCollection.diagnosis_available[diag].code : ''
            if (code.length > 0) {
              codes.push(code)
            }
          }
        }
      }
      const codeString = String(codes).replaceAll(',', '; ')
      return codeString
    },
    setTrunc () {
      if (this.truncated) {
        this.truncated = false
      } else {
        this.truncated = true
      }
    },
    formatString (stringDisp) {
      if (String(stringDisp).includes('undefined')) {
        return ''
      }
      return String(stringDisp).replace(/\]|\[|"/g, '')
    },
    getInfoItemsText (infoItems) {
      var text = ''
      for (const item in infoItems) {
        var line = infoItems[item].info_type + ' ' + '<b>' + infoItems[item].info_field + '</b> <br>'
        text = text.concat(line)
      }
      return text
    },
    checkInfoLengths (infoItems) {
      // for (const item in infoItems) {
      //   if (infoItems[item].info_type.length > 26 || infoItems[item].info_field.length > 27) {
      //     this.make_table = false
      //     return true
      //   }
      // }
      if (this.collection.biobank.ressource_types && this.collection.biobank.ressource_types.label === 'Biobank') {
        return true
      }
      return false
    },
    removeEmptyItems (reducedItems) {
      for (const item in reducedItems) {
        if (reducedItems[item].info_field.length === 0) {
          reducedItems.splice(item, 1)
        }
      }
      return reducedItems
    }
  },

  computed: {
    ...mapState({ collection: 'collectionReport', isLoading: 'isLoading' }),
    mainContent () {
      return this.collection ? mapCollectionsDetailsTableContent(this.collection) : {}
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
    showDiseaseAreas () {
      // const mask = this.collection[0]
      const dict = {
        Boolean5173: 'Certain infectious and parasitic diseases (A00-B99)',
        Boolean4958: 'Neoplasms (C00-D48)',
        Boolean4743: 'Diseases of the blood and blood-forming organs and certain disorders involving the immune mechanism (D50-D89)',
        Boolean4528: 'Endocrine, nutritional and metabolic diseases (E00-E90)',
        Boolean2579: 'Mental and behavioural disorders (F00-F99)',
        Boolean3227: 'Diseases of the nervous system (G00-G99)',
        Boolean3012: 'Diseases of the eye and adnexa (H00-H59)',
        Boolean2796: 'Diseases of the ear and mastoid process (H60-H95)',
        Boolean3443: 'Diseases of the circulatory system (I00-I99)',
        Boolean3659: 'Diseases of the respiratory system (J00-J99)',
        Boolean3875: 'Diseases of the digestive system (K00-K93)',
        Boolean4090: 'Diseases of the skin and subcutaneous tissue (L00-L99)',
        Boolean4307: 'Diseases of the musculoskeletal system and connective tissue (M00-M99)',
        Diseases_of_the_genitourinary_system__N00_N99_: 'Diseases of the genitourinary system (N00-N99)',
        Pregnancy__childbirth_and_the_puerperium__O00_O99_: 'Pregnancy, childbirth and the puerperium (O00-O99)',
        Certain_conditions_originating_in_the_perinatal_period__P00_P96_: 'Certain conditions originating in the perinatal period (P00-P96)',
        Congenital_malformations__deformations_and_chromosomal_abnormalities__Q00_Q99_: 'Congenital malformations, deformations and chromosomal abnormalities (Q00-Q99)'
      }

      var fieldsDisp = this.collection.disease_area_display
      if (fieldsDisp === undefined) {
        fieldsDisp = ' '
      }
      const shown = []

      // check if fieldsDisplay contains any of the above diseae areas
      for (const area in dict) {
        if (fieldsDisp.includes(area)) {
          shown.push({ field: dict[area] })
        }
      }
      // add "other" if its not undefined
      if (this.collection.disease_area_other) {
        shown.push({ field: this.collection.disease_area_other })
      }
      return shown
    },
    subCollections () {
      return this.collection && this.collection.sub_collections && this.collection.sub_collections.length
        ? mapCollectionsDetailsTableContent(this.collection.sub_collections)
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
        const date = moment(this.collection.sub_collections[0].timestamp).format('MM/DD/YYYY')
        return date
      } else {
        const date = 'N/A'
        return date
      }
    },
    getCollectionID () {
      const id = this.collection.biobank.id.split(':')[3]
      return id
    },
    getDescription () {
      return this.collection.biobank.description
    },
    getDescriptionTrunc () {
      const truncate = 190
      var temporalDivElement = document.createElement('div')
      temporalDivElement.innerHTML = this.collection.biobank.description
      var truncated = temporalDivElement.innerText.substring(0, truncate)
      // const truncated = this.collection.biobank.description.substring(0, truncate)
      if (truncated.length === truncate) {
        return truncated + '...'
      } else if (truncated.length > 6) {
        return truncated
      }
      return ''
    },
    getItemList () {
      const items = []
      for (const key in this.collection.sub_collections) {
        items.push({
          Disease_Name: this.collection.sub_collections[key].name === 'nan' ? '' : this.collection.sub_collections[key].name,
          Number_of_patients_Donors: this.collection.sub_collections[key].number_of_donors,
          Gene: this.collection.sub_collections[key].gene,
          ICD_10: this.getCode(this.collection.sub_collections[key], 'ICD'),
          ORPHA_Code: this.getCode(this.collection.sub_collections[key], 'orphanet'),
          OMIM: this.getCode(this.collection.sub_collections[key], 'omim'),
          Synonyms: this.collection.sub_collections[key].description
        })
      }
      return items
    },
    checkFunding () {
      if (this.collection.biobank.source_of_funding !== undefined) {
        return this.collection.biobank.source_of_funding.includes('Other') ? this.collection.biobank.text5085 : this.collection.biobank.source_of_funding
      }
      return ''
    },
    checkHost () {
      if (this.collection.biobank.host_is !== undefined) {
        return this.collection.biobank.host_is.includes('Other') ? this.collection.biobank.type_of_host : this.collection.biobank.host_is
      }
      return ''
    },
    getInfoItems () {
      const allItems = [
        { info_type: 'Acronym:', info_field: this.formatString(this.collection.biobank.acronym) },
        { info_type: 'Type of host institution:', info_field: this.formatString(this.checkHost) },
        { info_type: 'Source of funding:', info_field: this.formatString(this.collection.biobank.text5085 ? this.collection.biobank.text5085 : this.checkFunding) },
        { info_type: 'Target population of the registry:', info_field: this.formatString(this.collection.biobank.target_population) },
        { info_type: 'Year of establishment:', info_field: this.formatString(this.collection.biobank.year_of_establishment) },
        { info_type: 'Ontologies:', info_field: this.formatString(this.collection.biobank.ontologies_used) },
        { info_type: 'Biomaterial available:', info_field: this.formatString(this.collection.biobank.biomaterial_available) },
        { info_type: 'Additional Biomaterial available:', info_field: this.formatString(this.collection.biobank.additional_biomaterial_available) },
        { info_type: 'Imaging available:', info_field: this.formatString(this.collection.biobank.imaging_available) },
        { info_type: 'Additional Imaging available:', info_field: this.formatString(this.collection.biobank.additional_imaging_available) },
        { info_type: 'The registry biobanks is listed in other inventories networks:', info_field: this.formatString(this.collection.biobank.also_listed === '["not specified"]' ? this.collection.biobank.additional_networks_inventories : this.collection.biobank.also_listed) },
        { info_type: 'Additional networks inventories:', info_field: this.formatString(this.collection.biobank.also_listed !== '["not specified"]' ? this.collection.biobank.additional_networks_inventories : '') }
      ]

      if (this.collection.biobank.fields_display === undefined) {
        const minimal = [
          { info_type: 'Type of host institution:', info_field: this.formatString(this.collection.biobank.host_is) },
          { info_type: 'Source of funding:', info_field: this.formatString(this.checkFunding) },
          { info_type: 'Target population:', info_field: this.formatString(this.collection.biobank.target_population) },
          { info_type: 'Year of establishment:', info_field: this.formatString(this.collection.biobank.year_of_establishment) },
          { info_type: 'Ontologies used:', info_field: this.formatString(this.collection.biobank.ontologies_used) },
          { info_type: 'Imaging available:', info_field: this.formatString(this.collection.biobank.imaging_available) },
          { info_type: 'Also listed in:', info_field: this.formatString(this.collection.biobank.also_listed) }
        ]
        return this.removeEmptyItems(minimal)
      }

      var toPush
      const fields = this.collection.biobank.fields_display.split('_INSTANCE_')
      console.log(fields)
      console.log(this.collection.biobank)
      const reducedItems = []
      for (const field in fields) {
        var displayItem = String(fields[field]).slice(5).replaceAll('_', ' ').toUpperCase()
        if (displayItem === 'YM') {
          reducedItems.push(allItems[0])
        }
        if (displayItem === 'TEXT5085' && !this.collection.biobank.fields_display.includes('Source_of_funding')) {
          displayItem = 'SOURCE OF FUNDING'
        }
        for (const item in allItems) {
          const checkItem = allItems[item].info_type.split(':')[0].toUpperCase()
          if (checkItem === displayItem) {
            if (checkItem.includes('REGISTRY BIOBANKS')) {
              toPush = allItems[item]
              toPush.info_type = 'Also listed in:'
              reducedItems.push(toPush)
            } else if (checkItem.includes('POPULATION OF THE REGISTRY')) {
              toPush = allItems[item]
              toPush.info_type = 'Target population:'
              reducedItems.push(toPush)
            } else if (checkItem.includes('ADDITIONAL NETWORKS INVENTORIES')) {
              toPush = allItems[item]
              toPush.info_type = 'Additional networks listed:'
              reducedItems.push(toPush)
            } else {
              reducedItems.push(allItems[item])
            }
          }
        }
      }
      return this.removeEmptyItems(reducedItems)
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
  margin-top: -70px;
  border: none;
  margin-left: 20px;
}

#general-info-table {
  border-collapse: separate;
  border-spacing: 0px;
  padding: 0px;
  padding-top: 0em;
  width: 600px;
  margin-top: 0px;
  margin-left: 6px;
}
.info-table thead {
  width: 150px;
}

.disease-table {
  max-width: 100%;
}

.truncated-description {
  height: 4rem;
}

.table td{
  padding: 0px;
}

table.b-table[aria-busy='true'] {
  opacity: 0.6;
  color: #598c68;
}

.long-hr {
  width: 940px;
}

.info-box {
  margin-left: 20px;
  margin-right: 10px;
}

.head-button {
  margin-right: 100px;
}

hr {
  border:none;
  border-top:1px dotted #000;
  align-content: flex-start;
  margin-left: 0%;
  width: 97%;
  /* color:#fff; */
  /* background-color:#fff; */
  height:1px;
}

#disease-table {
  width: 940px;
}
#categories-table {
  width: 1080px;
}

.container, .container-sm, .container-md {
  min-width: 1100px;
  max-width: 1100px;
}

.card-button {
  background-color: #f4f4e1;
  padding-left: 5px;
  padding-bottom: 2px;
  width: 160px;
}

.info-field-cl {
  width: 40px;
}

</style>
