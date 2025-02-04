import getters from '../../../../src/store/getters'
import { mockFilterOptionDictionary, mockFilters, mockGetFilterDefinitions, mockSelectedCollections, mockState } from '../mockData'

let state

describe('store', () => {
  beforeEach(() => {
    state = mockState()
  })

  describe('getters', () => {
    describe('rsql', () => {
      it('should transform the collection filters to rsql', () => {
        state.filters.selections.search = 'Cell&Co'
        state.filters.selections.country = ['AT', 'BE']
        state.filters.selections.covid19 = ['covid19']

        expect(getters.rsql(state)).toEqual('country=in=(AT,BE);(name=q=Cell&Co,id=q=Cell&Co,acronym=q=Cell&Co,biobank.name=q=Cell&Co,biobank.id=q=Cell&Co,biobank.acronym=q=Cell&Co)')
      })
      it('should return the empty string if no filters are selected', () => {
        expect(getters.rsql(state)).toEqual('')
      })
    })
    describe('biobankRsql', () => {
      it('should transform the biobank filters to rsql, with the default value of satisfyAll (false)', () => {
        state.filters.selections.country = ['AT', 'BE']
        state.filters.selections.covid19 = ['covid19']

        expect(getters.biobankRsql(state)).toEqual('country=in=(AT,BE);covid19biobank=in=(covid19)')
      })
      it('should create AND/OR filters for covid19 biobank filter values according to satisfyAll options', () => {
        state.filters.selections.search = 'Cell&Co'
        state.filters.selections.covid19 = ['covid19', 'covid19a']
        if (state.filters.satisfyAll.includes('covid19')) {
          expect(getters.biobankRsql(state)).toEqual('covid19biobank==covid19;covid19biobank==covid19a')
        } else {
          expect(getters.biobankRsql(state)).toEqual('covid19biobank=in=(covid19,covid19a)')
        }
      })
      it('should return an empty string if no filters are selected', () => {
        expect(getters.biobankRsql(state)).toEqual('')
      })
    })

    describe('getHumanReadableString', () => {
      it('Should return a string based on active filters and corresponding labels', () => {
        state.filters = mockFilters

        // add lookup to use in function
        state.filterOptionDictionary = mockFilterOptionDictionary
        // push a selection on the state, where there is no label from, to trigger lookup
        state.filters.selections.diagnosis_available = ['ORPHA:352530']

        expect(getters.getHumanReadableString(state, { getFilterDefinitions: mockGetFilterDefinitions }))
          .toBe('Countries: Europe and Biobank collaboration type(s): Non-commercial use and Disease type(s): [ ORPHA:352530 ] - Intellectual disability-obesity-brain malformations-facial dysmorphism syndrome')
      })
    })

    describe('podium', () => {
      it('should return an array of names of collection that are present in podium', () => {
        state.isPodium = true
        state.podiumCollectionIds = ['A', 'B']
        state.collectionInfo = [{ collectionId: 'A', collectionName: 'Collection A', biobankId: 'A-1' },
          { collectionId: 'B', collectionName: 'Collection B', biobankId: 'B-1' },
          { collectionId: 'C', collectionName: 'Collection C', biobankId: 'C-1' },
          { collectionId: 'D', collectionName: 'Collection D', biobankId: 'D-1' }]
        const foundCollectionIds = ['A', 'B', 'C', 'D', 'E', 'F']
        const selectedCollections = mockSelectedCollections

        expect(getters.collectionsInPodium(state, { foundCollectionIds, selectedCollections })).toStrictEqual([{ label: 'Collection A', value: 'A' }, { label: 'Collection B', value: 'B' }])
      })
    })

    describe('biobanks', () => {
      it('should return empty list when loading', () => {
        state = {}
        expect(getters.biobanks(state, { loading: true })).toStrictEqual([])
      })
      it('should look up the biobanks for matching collection ids and filter the biobank\'s collections', () => {
        state.biobanks = {
          1: { id: '1', name: 'one', collections: [{ id: 'col-1', sub_collections: [] }] },
          2: { id: '2', name: 'two', collections: [{ id: 'col-2', sub_collections: [] }, { id: 'col-3', sub_collections: [] }] }
        }
        state.biobankIds = ['1', '2']
        state.collectionInfo = [{ collectionId: 'col-2', biobankId: '2' }]
        const otherGetters = { loading: false, rsql: 'type=in=(type1)' }
        expect(getters.biobanks(state, otherGetters)).toStrictEqual([{ id: '2', name: 'two', collections: [{ id: 'col-2', sub_collections: [] }] }])
      })
      it('should return all biobanks if the collections are not filtered', () => {
        state.biobanks = {
          2: { id: '2', name: 'two', collections: [{ id: 'col-2', sub_collections: [] }] }
        }
        state.biobankIds = ['1', '2']
        state.collectionInfo = [{ collectionId: 'col-2', biobankId: '2' }]

        const otherGetters = { loading: false, rsql: '' }
        expect(getters.biobanks(state, otherGetters)).toStrictEqual([
          '1',
          { id: '2', name: 'two', collections: [{ id: 'col-2', sub_collections: [] }] }
        ])
      })
      it('should not filter out collections with matching subcollections',
        () => {
          const biobank1 = {
            id: '1',
            name: 'one',
            collections: [{ id: 'col-1', sub_collections: [] }]
          }
          const biobank2 = {
            id: '2',
            name: 'two',
            collections: [
              { id: 'col-2', sub_collections: [] },
              { id: 'col-3', sub_collections: [{ id: 'col-4', sub_collections: [] }] }]
          }
          const state = {
            biobanks: { 1: biobank1, 2: biobank2 },
            biobankIds: ['1', '2'],
            collectionInfo: [{ collectionId: 'col-4', biobankId: '2' }]
          }
          const otherGetters = { loading: false, rsql: 'type=in=(type1)' }
          expect(getters.biobanks(state, otherGetters)).toStrictEqual([{
            id: '2',
            name: 'two',
            collections: [{ id: 'col-3', sub_collections: [{ id: 'col-4', sub_collections: [] }] }]
          }])
        })

      it('should return the biobanks in the order they appear in collectionInfo', () => {
        const state = {
          biobanks: {
            1: { id: '1', name: 'B', collections: [{ id: 'col-1', sub_collections: [] }] },
            2: { id: '2', name: 'A', collections: [{ id: 'col-2', sub_collections: [] }] }
          },
          biobankIds: ['1', '2'],
          collectionInfo: [
            { collectionId: 'col-1', biobankId: '2' },
            { collectionId: 'col-2', biobankId: '1' }
          ]
        }
        const otherGetters = { loading: false, rsql: 'type=in=(type1)' }
        expect(getters.biobanks(state, otherGetters)).toStrictEqual([
          { id: '2', name: 'A', collections: [{ id: 'col-2', sub_collections: [] }] },
          { id: '1', name: 'B', collections: [{ id: 'col-1', sub_collections: [] }] }
        ])
      })
    })

    it('should return the total amount of collections for found biobanks', () => {
      const state = {
        collectionInfo: [
          { collectionId: 'col-1', biobankId: 'A' },
          { collectionId: 'col-2', biobankId: 'B' },
          { collectionId: 'col-3', biobankId: 'B' }
        ]
      }

      const getFoundBiobankIds = ['B']
      const otherGetters = { getFoundBiobankIds }
      const ids = getters.foundCollectionIds(state, otherGetters)
      expect(ids.length).toEqual(2)
    })

    it('should return an array of biobank Ids', () => {
      const biobanks = [
        { id: '1', name: 'Biobank 1', collections: [{ id: 'col-1', sub_collections: [] }] },
        { id: '2', name: 'Biobank 2', collections: [{ id: 'col-2', sub_collections: [] }] },
        { id: '3', name: 'Biobank 3', collections: [{ id: 'col-3', sub_collections: [] }, { id: 'col-4', sub_collections: [] }] }
      ]

      const otherGetters = { biobanks }
      expect(getters.getFoundBiobankIds(state, otherGetters)).toStrictEqual(['1', '2', '3'])
    })
    it('should return an array of biobank Ids when only ids are present', () => {
      const biobanks = ['1', '2', '3']

      const otherGetters = { biobanks }
      expect(getters.getFoundBiobankIds(state, otherGetters)).toStrictEqual(['1', '2', '3'])
    })

    describe('loading', () => {
      it('should be false if both biobankIds and collectionInfo are present', () => {
        const state = {
          biobankIds: ['biobank1'],
          collectionInfo: [{ collectionId: 'col-2', biobankId: 'biobank1' }]
        }
        expect(getters.loading(state)).toBe(false)
      })

      it('should be true if biobankIds are missing', () => {
        const state = {
          biobankIds: undefined,
          collectionInfo: [{ collectionId: 'col-2', biobankId: 'biobank1' }]
        }
        expect(getters.loading(state)).toBe(true)
      })

      it('should be true if collectionInfo is missing', () => {
        const state = {
          biobankIds: ['biobank1'],
          collectionInfo: undefined
        }
        expect(getters.loading(state)).toBe(true)
      })
    })

    describe('activeFilters', () => {
      it('should retrieve an object of filter name <-> filters', () => {
        state.filters.selections = {
          search: 'test searchterm',
          country: ['AT'],
          materials: ['PLASMA'],
          collection_quality: ['eric'],
          biobank_quality: ['eric'],
          type: ['BIRTH_COHORT', 'CASE_CONTROL'],
          covid19: ['covid19'],
          dataType: ['BIOLOGICAL_SAMPLES', 'GENEALOGICAL_RECORDS']
        }

        const actual = getters.activeFilters(state)
        const expected = {
          materials: ['PLASMA'],
          country: ['AT'],
          type: ['BIRTH_COHORT', 'CASE_CONTROL'],
          covid19: ['covid19'],
          dataType: ['BIOLOGICAL_SAMPLES', 'GENEALOGICAL_RECORDS'],
          collection_quality: ['eric'],
          biobank_quality: ['eric'],
          search: 'test searchterm'
        }

        expect(actual).toStrictEqual(expected)
      })

      it('should retrieve an object of filters with diagnosis_available in it', () => {
        const expected = {
          diagnosis_available: ['urn:miriam:icd:C00-C97']
        }
        state.filters.selections = expected
        const actual = getters.activeFilters(state)
        expect(actual).toStrictEqual(expected)
      })
    })

    describe('showCountryFacet', () => {
      it('should return true if showCountryFacet setting is set to true', () => {
        const state = { showCountryFacet: true }
        expect(getters.showCountryFacet(state)).toEqual(true)
      })
      it('should return false if showCountryFacet setting is set to false', () => {
        const state = { showCountryFacet: false }
        expect(getters.showCountryFacet(state)).toEqual(false)
      })
    })

    describe('getErrorMessage', () => {
      it('should return undefined if no error is set', () => {
        const state = { error: undefined }
        expect(getters.getErrorMessage(state)).toEqual(undefined)
      })
      it('should return message of first error', () => {
        const state = { error: { errors: [{ message: 'this is the first error' }] } }
        expect(getters.getErrorMessage(state)).toEqual('this is the first error')
      })
      it('should return message of first error', () => {
        const state = { error: new Error('Beautiful message') }
        expect(getters.getErrorMessage(state)).toEqual('Beautiful message')
      })
      it('should return that something went wrong', () => {
        const state = { error: {} }
        expect(getters.getErrorMessage(state)).toEqual('Something went wrong')
      })
    })

    describe('selectedNonCommercialCollections', () => {
      const state = {
        nonCommercialCollections: ['A']
      }
      const selectedCollections = mockSelectedCollections
      it('Gives a count of collections that are non-commercial only', () => {
        const numberOfNonCommercialCollections = getters.selectedNonCommercialCollections(state, { selectedCollections })
        expect(numberOfNonCommercialCollections).toBe(1)
      })
    })

    describe('Collection Selection Getters', () => {
      const state = {}
      state.collectionInfo = [
        { collectionId: 'col-1', biobankId: '2', isSubcollection: false },
        { collectionId: 'col-2', biobankId: '1', isSubcollection: true }
      ]

      it('should return only parent collection ids', () => {
        const result = getters.parentCollections(state)
        expect(result).toStrictEqual(['col-1'])
      })
      it('Should return filters as label + value objects', () => {
        const parentCollections = ['col-1']
        const foundCollectionIds = ['col-1', 'col-2']
        const collectionDictionary = { 'col-1': 'Collection A', 'col-2': 'Collection B' }
        const result = getters.foundCollectionsAsSelection(state, { parentCollections, foundCollectionIds, collectionDictionary })

        expect(result).toStrictEqual([{ label: 'Collection A', value: 'col-1' }])
      })
    })
    describe('Biobank Quality Getters', () => {
      const state = mockState()
      state.filters.selections.biobank_quality = ['bq_1', 'bq_2']
      state.filters.satisfyAll = ['biobank_quality']

      it('should return biobank quality and satisfyAll flag', () => {
        const biobankQualityInfo = getters.selectedBiobankQuality(state)
        expect(biobankQualityInfo).toStrictEqual(['bq_1', 'bq_2'])
        const biobankQualitySatisfyAllInfo = getters.satisfyAllBiobankQuality(state)
        expect(biobankQualitySatisfyAllInfo).toStrictEqual(true)
      })
    })
    describe('Collections Quality Getters', () => {
      const state = mockState()
      state.filters.selections.collection_quality = ['bq_1', 'bq_2']
      state.filters.satisfyAll = ['collection_quality']

      it('should return biobank quality and satisfyAll flag', () => {
        const biobankQualityInfo = getters.selectedCollectionQuality(state)
        expect(biobankQualityInfo).toStrictEqual(['bq_1', 'bq_2'])
        const biobankQualitySatisfyAllInfo = getters.satisfyAllCollectionQuality(state)
        expect(biobankQualitySatisfyAllInfo).toStrictEqual(true)
      })
    })
  })
})
