// MAIN COLORS
let colors = {
	primary : '#F75564',
	success : '#28C76F',
	danger  : '#EA5455',
	warning : '#FF9F43',
	dark    : '#343434',
}

//User-Side Colors 
//primary: '#F75564',
//secondary: '#343434',
//accent: '#76C5BA',

// CONFIG
const baseConfig = {
  disableCustomizer : false,     
  disableThemeTour  : true,       
  footerType        : "hidden",    
  hideScrollToTop   : false,       
  mainLayoutType    : "vertical",  
  navbarColor       : "#fff",      
  navbarType        : "floating",  
  routerTransition  : "zoom-fade", 
  rtl               : false,      
  sidebarCollapsed  : false,      
  theme             : "light",  
  userInfoLocalStorageKey: "userInfo",
}

import Vue from 'vue'
import Vuesax from 'vuesax'
Vue.use(Vuesax, { theme:{ colors }, rtl: baseConfig.rtl })

export default baseConfig
