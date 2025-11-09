export const searchFragment = `
<div class="m-10 w-full max-w-screen-md mx-auto text-gray-200">
  <div class="flex flex-col">
    <div class="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-xl">

      <!-- SEARCH + TOGGLE -->
      <div class="flex justify-center mb-6 relative w-full">
        <div class="relative w-full max-w-md">

          <!-- Search Icon -->
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 
                   4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clip-rule="evenodd"></path>
            </svg>
          </div>

          <!-- Search Input (wired by table.js) -->
          <input
            type="text"
            id="searchInput"
            class="block p-2 pl-10 text-sm text-gray-300 border border-gray-700 
                   rounded-lg w-full bg-gray-700 placeholder-gray-400
                   focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by name, phone number"
          />

          <!-- Toggle Filters Icon -->
          <button 
            id="toggleFilters"
            class="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 
                   items-center justify-center text-gray-300 hover:text-white transition"
            title="Toggle Filters"
          >
            <svg id="chevronIcon" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24" stroke="currentColor"
              class="h-6 w-6 transition-transform duration-300">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 9l-7 7-7-7" />
            </svg>
          </button>

        </div>
      </div>

      <!-- COLLAPSIBLE FILTER SECTION -->
      <form id="filterSection"
            class="transition-all duration-300 ease-in-out"
            style="max-height: 0; opacity: 0;"
      >

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">

          <!-- GENDER -->
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-300">Gender</label>
            <select 
              id="genderSelect"
              class="mt-2 block w-full rounded-md border border-gray-700 bg-gray-700 text-gray-300 
                     px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500">
              <option value="">All</option>
              <option value="m">Male</option>
              <option value="f">Female</option>
              <option value="others">Others</option>
            </select>
          </div>

          <!-- STATUS -->
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-300">Status</label>
            <select 
              id="statusSelect"
              class="mt-2 block w-full rounded-md border border-gray-700 bg-gray-700 text-gray-300 
                     px-2 py-2 shadow-sm outline-none focus:border-blue-500 focus:ring-blue-500">
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <!-- DATE RANGE PICKER (Flowbite) -->
          <div class="flex flex-col md:col-span-2">
            <label class="text-sm font-medium text-gray-300 mb-2">Date Range</label>

            <div id="date-range-picker" date-rangepicker class="flex items-center">

              <!-- Start Date -->
              <div class="relative w-full">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 
                    2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                  </svg>
                </div>
                <input 
                  id="datepicker-range-start"
                  name="start"
                  type="text"
                  placeholder="Start date"
                  datepicker-format="dd-mm-yyyy"
                  class="bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-lg 
                  focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5"
                >
              </div>

              <span class="mx-4 text-gray-400">to</span>

              <!-- End Date -->
              <div class="relative w-full">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1
                    1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2
                    2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 
                    2H5a1 1 0 0 1 0-2Z"/>
                  </svg>
                </div>
                <input 
                  id="datepicker-range-end"
                  name="end"
                  type="text"
                  placeholder="End date"
                  datepicker-format="dd-mm-yyyy"
                  class="bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-lg 
                  focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5"
                >
              </div>

            </div>
          </div>

        </div>

        <div class="mt-6 flex justify-end space-x-4">
          <button 
            type="reset"
            class="rounded-lg bg-gray-700 px-8 py-2 font-medium text-gray-300 border border-gray-600 hover:bg-gray-600">
            Reset
          </button>
          <button 
            type="submit"
            class="rounded-lg bg-blue-600 px-8 py-2 font-medium text-white hover:bg-blue-500">
            Search
          </button>
        </div>

      </form>

    </div>
  </div>
</div>
`;
