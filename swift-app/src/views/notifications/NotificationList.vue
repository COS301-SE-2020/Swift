
<template>
  <v-container>
      <v-btn rounded color="accent" elevation="2" class="mr-2 body-2" width="75%" id="noti" value="Status" @click="change()">
          
          Notifications

      </v-btn>
</v-container>
</template>

<script>
import { mapActions, mapMutations } from "vuex";
import NavBar from '@/components/layout/NavBar';

export default {
  data () {
    return {
        myObj :
            {
            
                "Status":"Your order is being prepared", 
		        "Registered": "Successfully Registered", 
		        "Payment": "Payment successful",
		        "Add": "Food item Successfully added to your order",
		        "Remove" : "Food item removed from order",
		        "Details" : "User details Successfully edited",
                "Review" : "Review Successfully recorded",
            }
    }
            
        
  },
  
  methods: {

      change() {

          var val= document.getElementById('noti').value;

            alert(this.myObj[val]);
            if(val=="Status"){
            document.getElementById('noti').value= "Registered";}
            else if(val=="Registered"){
            document.getElementById('noti').value= "Payment";}
            else if(val=="Payment"){
            document.getElementById('noti').value= "Add";}
            else if(val=="Add"){
            document.getElementById('noti').value= "Remove";}
      },
  },
};
</script>

