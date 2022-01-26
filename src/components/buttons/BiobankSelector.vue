
<template>
  <div @click.stop>
    <input
      type="checkbox"
      :id="checkboxIdentifier"
      class="add-to-cart"
      @change.prevent="handleBiobankStatus"
      :checked="checkboxState"
      :value="false"
      hidden/>
    <!-- <label class="add-to-cart-label btn btn-outline-secondary" :for="checkboxIdentifier">
      <span class="mr-2">Select for record search</span>
    </label>
    <label
      class="btn remove-from-cart-label btn-outline-danger"
      :for="checkboxIdentifier">
      <span class="mr-2">Remove from record search</span>
    </label> -->
    <label v-if="!iconOnly" class="add-to-cart-label btn btn-outline-secondary px-2" :for="checkboxIdentifier">
      <span class="mr-2">Select for record search</span>
    </label>
    <label v-else class="add-to-cart-label btn" :for="checkboxIdentifier">
      <font-awesome-icon
        :style="checkboxFaStyle"
        :icon="['far', 'square']"
        size="lg"></font-awesome-icon>
    </label>
    <label
      v-if="!iconOnly"
      class="btn remove-from-cart-label btn-outline-danger px-2"
      :for="checkboxIdentifier">
      <span class="mr-2">Remove from record search</span>
    </label>
    <label
      v-else
      class="btn remove-from-cart-label"
      :for="checkboxIdentifier">
      <font-awesome-icon
        :style="checkboxFaStyle"
        :icon="['fas', 'check-square']"
        size="lg"></font-awesome-icon>
    </label>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'RecordsCollectionSelector',
  props: {
    biobankData: {
      type: [Object, Array],
      required: true
    },
    bookmark: {
      type: Boolean,
      required: false,
      default: false
    },
    iconOnly: {
      type: Boolean,
      required: false,
      default: true
    },
    checkboxFaStyle: {
      type: Object,
      required: false,
      default: function () {
        return {
          color: 'var(--secondary)'
        }
      }
    }
  },
  data: () => {
    return {
      faStyle: {
        color: 'var(--secondary)'
      }
    }
  },
  methods: {
    ...mapActions([
      'AddBiobankToRecordSearchSelection'
    ]),
    ...mapMutations([
      'RemoveBiobankFromRecordSearchSelection'
    ]),
    handleBiobankStatus (event) {
      const { checked } = event.target
      const data = { biobanks: [this.biobankData], bookmark: this.bookmark }

      if (checked) {
        this.AddBiobankToRecordSearchSelection(data)
      } else {
        this.RemoveBiobankFromRecordSearchSelection(data)
      }
      this.$emit('checked', checked)
    }
  },
  computed: {
    ...mapGetters(['biobanksSelectedForRecordSearch']),
    checkboxIdentifier () {
      return this.identifier
    },
    checkboxState () {
      return this.biobanksSelectedForRecordSearch.map(bs => bs.id).includes(this.identifier)
    },
    identifier () {
      return this.biobankData.id
    }
  }
}
</script>

<style scoped>
.btn {
  padding: 0 0.34rem;
}

.btn:hover {
  cursor: pointer;
}

.add-to-cart:checked ~ .add-to-cart-label {
  display: none;
}

.remove-from-cart-label {
  display: none;
}

.add-to-cart:checked ~ .remove-from-cart-label {
  display: inline-block;
}

.remove-from-cart-label:hover {
  cursor: pointer;
  opacity: 0.8;
}
</style>
