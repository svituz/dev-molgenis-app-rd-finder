<template>
  <div class="biobank-cards-container">
    <div v-if="!loading && foundBiobanks > 0">
      <b-pagination
        v-if="foundBiobanks > pageSize"
        size="sm"
        align="center"
        :total-rows="foundBiobanks"
        v-model="currentPage"
        :per-page="pageSize"
      >
      <template v-if="busy" #last-text>
        <span class="text-info">
        <b-spinner style="width: 0.8rem; height: 0.8rem; margin-left: 0.2rem;" type="grow" label="Loading..."></b-spinner>
        <b-spinner style="width: 0.8rem; height: 0.8rem; margin-left: 0.2rem;" type="grow" label="Loading..."></b-spinner>
        <b-spinner style="width: 0.8rem; height: 0.8rem; margin-left: 0.2rem;" type="grow" label="Loading..."></b-spinner>
        </span>
      </template>
      </b-pagination>

      <div v-if="!loading && foundBiobanks > 0">
        <b-table
        id="biobank-table"
        responsive
        hover
        busy.sync="true"
        :items="biobank_items"
        :fields="[
          {
            key: 'Logo',
            'class': 'logo-col'
          },
          {
            key: 'Name',
            sortable: true,
          },
          {
            key: 'Type',
            sortable: false
          },
          {
            key: 'Number_of_cases',
            sortable: false
          },
          {
            key: 'Country',
            sortable: false
          }
        ]">
        <template v-slot:cell(Name)="ressource">
          <router-link :to="'/collection/' + ressource.item.id + ':collection_pa'">{{ressource.value}}</router-link>
        </template>
        <template v-slot:cell(Logo)="logo_link">
          <!-- {{ logo_link.item.Logo }} -->
          <img style="width:100%;" :src="logo_link.item.Logo">
        </template>
      </b-table>
      </div>
      <b-pagination
        v-if="foundBiobanks > pageSize & !busy"
        size="sm"
        align="center"
        :total-rows="foundBiobanks"
        v-model="currentPage"
        :per-page="pageSize"
      ></b-pagination>
    </div>

    <div v-else-if="!loading && foundBiobanks === 0" class="status-text">
      <h4>No resources were found</h4>
    </div>

    <div v-else class="status-text">
      <h4>
        Loading data...
        <i class="fa fa-spinner fa-pulse" aria-hidden="true"></i>
      </h4>
    </div>
  </div>
</template>

<style>
.status-text {
  text-align: center;
  justify-content: center;
  padding: 1rem;
}

.biobank-cards-container {
  width: 100%;
}
.logo-col {
  max-width: 5rem;
  max-height: 100rem;
  height: 100;
}
</style>

<script>
// import BiobankCard from './BiobankCard'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'biobank-cards-container',
  data () {
    return {
      currentPage: 1,
      pageSize: 10,
      items: [],
      busy: true
    }
  },
  methods: {
    ...mapActions(['GetBiobanks']),
    addNumberDonors (biobank) {
      var sum = 0
      for (const key in biobank.collections) {
        if (!biobank.collections[key].parent_collection) {
          sum += biobank.collections[key].number_of_donors
        }
      }
      return sum
      // var sumtotal = biobank.collections.reduce(function (prev, cur) {
      //   return (prev + cur.number_of_donors)
      // }, 0)
      // console.log('Total Messages:', sumtotal)
      // console.log('suj:', sum)

      // return sum
    },
    setBusy (value) {
      this.busy = value
    }
  },
  computed: {
    ...mapGetters([
      'biobanks',
      'foundBiobanks',
      'loading'
    ]),
    biobanksShown () {
      // return this.loading ? [] : this.biobanks.slice(this.pageSize * (this.currentPage - 1), this.pageSize * this.currentPage)
      return this.loading ? [] : this.biobanks.slice(this.pageSize * (this.currentPage - 1), this.pageSize * this.currentPage)
    },
    biobankIds () {
      return this.loading ? [] : this.biobanks.map(it => it.id || it)
    },
    biobankIdsToFetch () {
      return this.biobanksShown.filter(it => typeof it === 'string')
    },
    biobank_items () {
      this.setBusy(true)
      // check if deeper objects (e.g.: ressource_types) can be loaded:
      if (!this.biobanksShown[0].ressource_types) {
        return []
      }
      const items = []
      for (const key in this.biobanksShown) {
        items.push({
          Logo: this.biobanksShown[key].logo_link,
          Name: this.biobanksShown[key].name,
          id: this.biobanksShown[key].id,
          Type: this.biobanksShown[key].ressource_types.label,
          Number_of_cases: this.addNumberDonors(this.biobanksShown[key]),
          Country: this.biobanksShown[key].country.name
        })
      }
      this.setBusy(false)
      return items
    }
  },
  // components: {
  //   BiobankCard
  // },
  watch: {
    biobankIds (newValue, oldValue) {
      if (newValue.length !== oldValue.length ||
        !newValue.every((element, index) => element === oldValue[index])) {
        this.currentPage = 1
      }
    },
    biobankIdsToFetch (value) {
      if (value.length) {
        this.GetBiobanks(value)
      }
    }
  }
}
</script>
