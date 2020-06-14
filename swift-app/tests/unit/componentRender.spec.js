import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import NavBar from '../../src/components/layout/NavBar.vue'
import MenuSearchToolBar from '../../src/components/layout/MenuSearchToolBar.vue'
import RestaurantSearchToolBar from '../../src/components/layout/RestaurantSearchToolBar.vue'
import Home from '../../src/views/home/HomeView.vue'

// NavBar Component
describe('NavBar', () => {
  const wrapper = shallowMount(NavBar)

  it('renders the correct markup', () => {
    expect(wrapper.html()).contains('<span>Home</span>')
  })
})

// MenuSearchToolBar Component
describe('MenuSearchToolBar', () => {
  
  it('renders the searchbar title', () => {
    const wrapper = shallowMount(MenuSearchToolBar)
    expect(wrapper.html()).contains('<div class="title">What would you like to order?</div>')
  })

  it('renders correct data', () => {
    const wrapper = shallowMount(MenuSearchToolBar, {
      data: () => ({
        prices: ['low-high', 'high-low', 'R0-R49', 'R50-100'],
        sorting: ['rating', 'favourites', 'popular', 'free'],
        prepTimes: ['10 min', '20 min', '30 min', '30+ min'],
        restaurantImages: [
          { img: 'https://source.unsplash.com/GXXYkSwndP4/800x800/' },
        ],
      }),
    })
    expect(wrapper.find('.title').text()).equal('What would you like to order?')
  })
})

// RestaurantSearchToolBar Component
describe('RestaurantSearchToolBar', () => {
  it('renders the searchbar title', () => {
    const wrapper = shallowMount(RestaurantSearchToolBar)
    expect(wrapper.html()).contains('<div class="title">Where would you like to eat?</div>')
  })

  it('renders correct data', () => {
    const wrapper = shallowMount(RestaurantSearchToolBar)
    expect(wrapper.find('.title').text()).equal('Where would you like to eat?')
  })
})

// HomeView Component
describe('Home', () => {
  it('renders the categories', () => {
    const wrapper = shallowMount(Home)
    expect(wrapper.html()).contains('<div class="title">Categories</div>')
  })

  it('renders correct data', () => {
    const wrapper = shallowMount(Home, {
      data: () => ({
        prices: ['low-high', 'high-low', 'R0-R49', 'R50-100'],
        sorting: ['rating', 'favourites', 'popular', 'free'],
        prepTimes: ['10 min', '20 min', '30 min', '30+ min'],
        restaurantImages: [
          { img: 'https://source.unsplash.com/GXXYkSwndP4/800x800/' },
        ],
      }),
    })
    expect(wrapper.find('.title').text()).equal('Categories')
  })

  it('renders the specific category', () => {
    const wrapper = shallowMount(Home)
    expect(wrapper.html()).contains('<div class="mt-1 caption">Pizza</div>')
  })

  it('renders restaurants', () => {
    const wrapper = shallowMount(Home)
    expect(wrapper.find('.restaurants').text()).equal('Restaurants Near You')
  })

  it('Checks-in to restaurant', () => {
    const wrapper = shallowMount(Home)
    expect(wrapper.find('.checkInBtn').trigger('click'))
  })
})

