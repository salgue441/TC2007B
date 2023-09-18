import nextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google"
import { apiV1Url } from "@/utils/constants";


window.onload =  function() {
    let jwt = null;
   
    onLogin(){
      jwt = await login()
    }

    fetch( apiV1Url+'/auth/login/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          googleToken: account.id_token
        })
      })
        .then(res => res.json())
        .then(data => {
          
          console.log(data)
        })
        
      //TODO Save tokens in cookies
}