<template>
  <div class="autocomplete" v-click-outside="hideResults">
    <input
      type="text"
      v-model="query"
      @input="onChange"
      @focus="showResults"
      placeholder="Search for a location"
      v-on:keyup.down="resultDown"
      v-on:keyup.up="resultUp"
      v-on:keyup.enter="resultSelect"
    />
    <ul class="autocomplete-results" v-if="resultsVisible">
      <li
        v-for="(result, i) in results"
        :key="i"
        class="autocomplete-result"
        v-bind:class="{ selected: i === selectedResultIndex }"
        v-on:click="locationClick(result)"
      >
        {{ result.displayLabel }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { debounce } from "lodash-es";
import Vue from "vue";
import ClickOutside from "vue-click-outside";

interface GeocoderResult {
  displayLabel: string;
  location: google.maps.LatLngLiteral;
}

function getGeocoderResults(
  query: string
): Promise<google.maps.GeocoderResult[]> {
  return new Promise((resolve, reject) => {
    new google.maps.Geocoder().geocode(
      { address: query },
      (results, status) => {
        switch (status) {
          case google.maps.GeocoderStatus.OK:
            resolve(results);
            break;
          case google.maps.GeocoderStatus.INVALID_REQUEST:
          case google.maps.GeocoderStatus.ZERO_RESULTS:
            resolve([]);
            break;
          default:
            reject(status);
        }
      }
    );
  });
}

export default Vue.extend({
  name: "geocoder-input",
  data() {
    return {
      query: "",
      resultsVisible: false,
      selectedResultIndex: false as number | false,
      results: [] as GeocoderResult[],
    };
  },
  directives: {
    ClickOutside,
  },
  methods: {
    onChange: debounce(
      function () {
        //@ts-ignore
        this.autocompleteResults(this.query);
      },
      300,
      { maxWait: 600 }
    ),
    resultDown() {
      this.selectedResultIndex =
        this.selectedResultIndex === false
          ? 0
          : (this.selectedResultIndex + 1) % this.results.length;
    },
    resultUp() {
      this.selectedResultIndex =
        this.selectedResultIndex === false || this.selectedResultIndex === 0
          ? this.results.length - 1
          : this.selectedResultIndex - 1;
    },
    resultSelect() {
      if (this.selectedResultIndex === false) return;
      this.locationClick(this.results[this.selectedResultIndex]);
    },
    showResults() {
      this.resultsVisible = true;
    },
    hideResults() {
      this.resultsVisible = false;
    },
    updateGeocoderResults(rawResults: google.maps.GeocoderResult[]) {
      this.results = rawResults.map((res) => ({
        displayLabel: res.formatted_address,
        location: res.geometry.location.toJSON(),
      }));
      this.selectedResultIndex = false;
    },
    autocompleteResults(query: string): Promise<void | GeocoderResult[]> {
      return (
        getGeocoderResults(query)
          //@ts-ignore
          .then((results) => {
            this.updateGeocoderResults(results);
            return this.results;
          })
          .catch((status: google.maps.GeocoderStatus) => console.error(status))
      );
    },
    locationClick(result: GeocoderResult) {
      this.query = result.displayLabel;
      this.$emit("select-location", result.location);
      this.resultsVisible = false;
    },
  },
});
</script>

<style>
.autocomplete {
  position: relative;
  margin-top: 0.25rem;
}

.autocomplete input[type="text"] {
  display: block;
  width: 100%;
}

.autocomplete-results {
  position: absolute;
  top: 100%;
  right: 0;
  width: 25rem;
  max-width: 90vw;
  background: white;
  overflow: auto;
  max-height: 10rem;
  box-shadow: 1px 1px 3px 0 rgba(0, 0, 0, 0.3);
}

.autocomplete-result {
  list-style: none;
  text-align: left;
  font-size: 0.9rem;
  font-weight: 400;
  padding: 0.3rem 0.4rem;
  cursor: pointer;
  border-bottom: 1px solid #efefef;
}

.autocomplete-result:last-child {
  border-bottom: none;
}

.autocomplete-result:hover {
  background-color: #f1f9fe;
}

.autocomplete-result.selected {
  background-color: #c4d7e6;
}
</style>
