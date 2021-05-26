<template>
  <div class="row biobank-explorer-container">
    <div class="row row-header">
          <b>Linking up rare disease research across the world</b>
    </div>
            <div class="background-hack">
          <div class="background-hack-l">
          </div>
          <div class="background-hack-r">
          </div>
          </div>
    <div class="row explorer shadow">
    <div class="col-md-3">
    <div style="height: 80px;">
        <collection-select-all
        style="padding-top: 12px;"
          v-if="!loading && foundCollectionIds.length"
          class="mt-1 ml-3"
          router-enabled
        />
      </div>
      <filter-container style="position: relative; top: 20px; margin-bottom: 25px;"></filter-container>
    </div>
    <div class="col-md-9">
      <div class="row mb-3">
        <div class="col-md-8">
          <div v-if="isIE11">
            <input
              class="w-50 mr-2 p-1"
              type="text"
              v-model="ie11BookmarkToApply"
              placeholder="Place your recieved bookmark here"
            /><input
              type="button"
              class="btn btn-sm btn-secondary"
              @click="applyIE11Bookmark"
              value="Apply"
              :disabled="!ie11BookmarkToApply"
            />
            <div class="mt-1">
              <input
                class="w-50 d-inline p-1"
                id="ie11bookmark"
                :value="ie11Bookmark"
                placeholder="Your current bookmark"
              />
              <button
                class="btn btn-sm btn-success ml-2 d-inline"
                @click="copyIE11Bookmark"
                :disabled="!ie11Bookmark"
              >
                Copy<span class="fa fa-copy ml-1"></span>
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-4"></div>
      </div>
      <div class="row">
        <div class="col-md-12" v-if="!loading">
          <result-header></result-header>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <biobank-cards-container></biobank-cards-container>
        </div>
      </div>
    </div>
    </div>

    <cart-selection-toast
      v-if="
        !loading &&
        hasSelection &&
        !collectionCartShown &&
        this.foundCollectionIds.length
      "
      :cartSelectionText="`${this.selectedCollections.length} collection(s) selected`"
      :clickHandler="showSelection"
      :title="negotiatorButtonText"
      toastClass="bg-warning text-white"
    >
      <template v-slot:buttonText> Show selection </template>
    </cart-selection-toast>

    <b-modal
      hide-header
      id="collectioncart-modal"
      size="lg"
      scrollable
      centered
      body-bg-variant="white"
      footer-bg-variant="warning"
      body-class="pb-0"
      @hide="closeModal"
    >
      <template v-if="collectionCart.length > 0">
        <div
          class="card mb-3 border"
          :key="`${cart.biobankLabel}-${index}`"
          v-for="(cart, index) in collectionCart"
        >
          <div class="card-header font-weight-bold">{{ cart.biobankLabel }}</div>
          <div class="collection-cart">
            <div
              class="card-body d-flex border-bottom"
              :key="`${collection.label}-${index}`"
              v-for="(collection, index) in cart.collections"
            >
              <div>
                <font-awesome-icon
                  title="Not available for commercial use"
                  v-if="isNonCommercialCollection(collection.value)"
                  class="text-danger non-commercial mr-1"
                  :icon="['fab', 'creative-commons-nc-eu']"
                />
                <span> {{ collection.label }}</span>
              </div>
              <div class="pl-3 ml-auto">
                <span
                  class="fa fa-times text-bold remove-collection"
                  title="Remove collection"
                  @click="
                    RemoveCollectionsFromSelection({
                      collections: [collection],
                      router: $router,
                    })
                  "
                ></span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <p v-if="isPodium && !collectionsInPodium.length">
        Sorry, none of the samples are currently in Podium.
      </p>
      <template v-slot:modal-footer>
        <b-button class="btn btn-dark mr-auto" @click="removeAllCollections"
          >Remove all</b-button
        >
        <div>
          <span class="text-white font-weight-bold d-block">{{
            modalFooterText
          }}</span>
          <span class="text-white" v-if="selectedNonCommercialCollections > 0">
            <font-awesome-icon
              title="Not available for commercial use"
              class="text-white non-commercial mr-1"
              :icon="['fab', 'creative-commons-nc-eu']"
            />
            {{ selectedNonCommercialCollections }} are non-commercial only
          </span>
        </div>
        <div class="ml-auto">
          <b-button class="btn btn-dark mr-2" @click="hideModal"
            >Cancel</b-button
          >
          <b-button
            :disabled="
              (isPodium && !collectionsInPodium.length) ||
              !selectedCollections.length
            "
            class="btn btn-secondary ml-auto"
            @click="sendRequest"
            >{{ negotiatorButtonText }}</b-button
          >
        </div>
      </template>
    </b-modal>
    <div class="row-footer">
      <p class="footer-p">
      Linking up rare disease resarch across the world
      </p>
      <p class="footer-p footer-link">
        <a :href="getUrl">RD-Connect</a>
      </p>
      <p class="footer-p footer-link">
        <router-link :to="'/dataprotectionstatement'">Data Protection statement </router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { CartSelectionToast } from '@molgenis-ui/components-library'
import BiobankCardsContainer from './cards/BiobankCardsContainer'
import FilterContainer from './filters/FilterContainer'
import ResultHeader from './ResultHeader'
import { mapGetters, mapActions, mapState, mapMutations } from 'vuex'
import { createBookmark } from '../utils/bookmarkMapper'
import CollectionSelectAll from '@/components/buttons/CollectionSelectAll.vue'
// import { INITIAL_STATE } from '../store/state'

export default {
  name: 'biobank-explorer-container',
  components: {
    BiobankCardsContainer,
    FilterContainer,
    ResultHeader,
    CartSelectionToast,
    CollectionSelectAll
  },
  data: () => {
    return {
      modalEnabled: false,
      ie11BookmarkToApply: ''
    }
  },
  computed: {
    ...mapGetters([
      'rsql',
      'biobankRsql',
      'loading',
      'foundCollectionIds',
      'activeFilters',
      'collectionsInPodium',
      'selectedCollections',
      'collectionBiobankDictionary',
      'foundCollectionsAsSelection',
      'selectedNonCommercialCollections'
    ]),
    ...mapState([
      'isPodium',
      'nonCommercialCollections',
      'isIE11',
      'ie11Bookmark'
    ]),
    modalFooterText () {
      const collectionCount = this.isPodium
        ? this.collectionsInPodium.length
        : this.selectedCollections.length
      return this.isPodium
        ? `${collectionCount} collection(s) present in Podium`
        : `${collectionCount} collection(s) selected`
    },
    negotiatorButtonText () {
      return this.isPodium ? 'Send to Podium' : 'Send to the negotiator'
    },
    collectionCartShown () {
      return this.modalEnabled
    },
    currentSelectedCollections () {
      return this.isPodium ? this.collectionsInPodium : this.selectedCollections
    },
    collectionCart () {
      return this.groupCollectionsByBiobank(this.currentSelectedCollections)
    },
    hasSelection () {
      return this.selectedCollections.length > 0
    },
    getUrl () {
      return 'https://rd-connect.eu/'
    }
  },
  watch: {
    rsql: {
      immediate: true,
      handler: 'GetCollectionInfo'
    },
    biobankRsql: {
      immediate: true,
      handler: 'GetBiobankIds'
    },
    isPodium: {
      immediate: true,
      handler: 'GetPodiumCollections'
    }
  },
  methods: {
    ...mapMutations(['RemoveCollectionsFromSelection', 'MapQueryToState']),
    ...mapActions([
      'GetCollectionInfo',
      'GetBiobankIds',
      'GetPodiumCollections'
    ]),
    isNonCommercialCollection (collectionId) {
      return this.nonCommercialCollections.indexOf(collectionId) >= 0
    },
    groupCollectionsByBiobank (collectionSelectionArray) {
      const biobankWithSelectedCollections = []
      collectionSelectionArray.forEach((cs) => {
        const biobankLabel = this.collectionBiobankDictionary[cs.value]
        const biobankPresent = biobankWithSelectedCollections.find(
          (bsc) => bsc.biobankLabel === biobankLabel
        )

        if (biobankPresent) {
          biobankPresent.collections.push(cs)
        } else {
          biobankWithSelectedCollections.push({
            biobankLabel,
            collections: [cs]
          })
        }
      })
      return biobankWithSelectedCollections
    },
    removeAllCollections () {
      this.hideModal()
      this.RemoveCollectionsFromSelection({
        collections: this.currentSelectedCollections,
        router: this.$router
      })
    },
    hideModal () {
      this.$bvModal.hide('collectioncart-modal')
      this.closeModal()
    },
    closeModal () {
      this.modalEnabled = false
    },
    sendRequest () {
      this.$bvModal.hide('collectioncart-modal')
      this.$store.dispatch('SendToNegotiator').finally(this.closeModal)
    },
    showSelection () {
      this.$bvModal.show('collectioncart-modal')
      this.modalEnabled = true
    },
    applyIE11Bookmark () {
      const rawQuery = this.ie11BookmarkToApply.split('?')[1]
      const queryParts = rawQuery.split('&')
      const queryObject = {}

      queryParts.forEach((part) => {
        const propAndValue = part.split('=')
        queryObject[propAndValue[0]] = propAndValue[1]
      })
      this.MapQueryToState(queryObject)
      this.applyIE11Bookmark = ''
    },
    copyIE11Bookmark () {
      const ie11BookmarkElement = document.getElementById('ie11bookmark')
      ie11BookmarkElement.select()
      ie11BookmarkElement.setSelectionRange(0, 99999)
      document.execCommand('copy')
    }
  },
  mounted () {
    // check if collections have been added off-screen.
    if (this.selectedCollections.length) {
      createBookmark(this.$router, this.activeFilters, this.selectedCollections)
    }
  }
}
</script>

<style>
.non-commercial .fa-times {
  font-size: 1em;
}
.biobank-explorer-container {
  padding-top: 1rem;
}
.remove-collection:hover,
.btn:hover,
#select-all-label:hover {
  cursor: pointer;
}

.collection-cart > div:last-child {
  border:none !important;
}

.background-hack {
  height: 0px;
  position: relative;
} */

.background-hack-l {
  height: 0px;
  width: 50px;
  position: relative;
  left: -50px;
  top: -16px;
  background-color: #f4f4e1;
}

.background-hack-r {
  height: 80px;
  width: 50px;
  position: relative;
  left: 1130px;
  top: -96px;
  background-color: #f4f4e1;
}

.row-header {
  text-align: left;
  padding-top: 10px;
  font-size: 150%;
  height: 60px;
  background-color: #f4f4e1;
  width: 1160px;
  position: relative;
  left: 15px;
  margin-top: -40px
}
.row-footer {
    background-color: #F4F4E1;
    position: relative;
    min-width: 1900px;
    height: 85px;
    margin-top: 0px;
    margin-left: 0;
    text-align: center;
    z-index: 109;
    padding-left: -50px;
    left: -350px;
    border-top: 1px solid black;
    background-color: #fafaf0;
}
.image {
  position: relative;
  margin-left: 80px;
}
.explorer {
  padding-top: 10px;
  background-color: white;
  width:1140px;
  min-width:1160px;
  min-height: 800px;
  z-index: 900;
}
.biobank-explorer-container {
  margin-top: -20px;
}
.footer-p {
  margin-bottom: 0rem;
}
.footer-link {
  font-size: 120%;
}
</style>
