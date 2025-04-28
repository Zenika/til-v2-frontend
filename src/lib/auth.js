import axios from "axios";
import { PUBLIC_TIL_GOOGLE_CLIENT_ID, PUBLIC_TIL_SERVER_URL, PUBLIC_TIL_FRONT_URL } from '$env/static/public';
import {get, writable} from "svelte/store";
import { goto } from '$app/navigation';

export const token = writable("");
export const currentUser = writable({})

const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${PUBLIC_TIL_GOOGLE_CLIENT_ID}&scope=openid%20email%20profile&redirect_uri=${PUBLIC_TIL_FRONT_URL}&state=redirect_uri%3D${PUBLIC_TIL_FRONT_URL}`


token.subscribe(newToken => {
    if(newToken !== "") {
        refreshUser()
    }
})

export function refreshUser() {
    axios.get(`${PUBLIC_TIL_SERVER_URL}/users/self`, {headers: {Authorization: get(token)}})
        .then(response => {
            currentUser.set(response.data)
        })
        .catch(err => {
            console.log(err)
        })
}

export function logout() {
    localStorage.removeItem("token");
    location.reload();
}

export function checkAuth() {
    const params = new URLSearchParams(window.location.search);

    // Check if user is authenticated or not
    if(localStorage.getItem("token") !== null) {
			// Run token renew (maybe very long if we are google-blacklisted...)
        axios.get(`${PUBLIC_TIL_SERVER_URL}/renew`, {headers: {Authorization: localStorage.getItem("token")}})
            .then(response => {
                localStorage.setItem("token", response.headers.get("authorization"));
                token.set(response.headers.get("authorization"));
            })
            .catch(() => {
                localStorage.removeItem("token")
                window.location.replace(googleUrl)
            })
    } else if(params.has("code")) {
        axios.get(`${PUBLIC_TIL_SERVER_URL}/auth?code=${params.get('code')}&state=${params.get('state')}`)
            .then(res => {
                localStorage.setItem("token", res.headers.get("authorization"));
                token.set(res.headers.get("authorization"));
								goto("/")
            })
            .catch(() => {
                window.location.replace(googleUrl)
            })
    } else {
        // Redirect directly to auth
        window.location.replace(googleUrl)
    }
}

