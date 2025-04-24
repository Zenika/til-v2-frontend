import axios from "axios";
import {PUBLIC_TIL_SERVER_URL} from "$env/static/public";
import toast from "svelte-french-toast";
import {goto} from "$app/navigation";
import {get, writable} from "svelte/store";
import {currentUser, token} from "$lib/auth.js";
import {t} from "$lib/i18n.js";
import {getTags} from "$lib/tags.js";

export const posts = writable([]);
export const loading = writable(false);

let totalPages = 1;
let retrievedPages = 0;

currentUser.subscribe(newToken => {
    if (newToken.id !== "") {
        retrievedPages = 0
        posts.set([])
        cleanAndLoad(newToken.automatic_tags_filter)
    }
});

export function cleanAndLoad(tags) {
    posts.set([])
    totalPages = 1;
    retrievedPages = 0;
    getPostPage(0, tags)
}

export function getPostPage(page, tags) {
    if(page === 0) {
        loading.set(true)
    }
    if (page < totalPages && page >= retrievedPages && get(token) !== "") {
        retrievedPages = page + 1
        axios.get(`${PUBLIC_TIL_SERVER_URL}/posts?page=${page}${tags && tags.length > 0 ? '&tags=' + tags.join(",") : ''}`, {headers: {'Authorization': get(token)}})
            .then(res => {
                let newPosts = get(posts)
                newPosts.push(...res.data.items);
                posts.set(newPosts)
                totalPages = res.data.total_pages
            })
            .finally(() => {
                loading.set(false)
            })
    }

}


export function deletePost(id) {
    axios.delete(`${PUBLIC_TIL_SERVER_URL}/posts/${id}`, {headers: {Authorization: get(token)}})
        .then(() => {
            toast.success(get(t)('post.deleted'), {
                position: "top-right"
            });
            let postsFilter = get(posts).filter(e => e.id !== id);
            posts.set(postsFilter)

        })
        .catch(err => {
            toast.error(get(t)('generic_error', {err: err.response.data}), {
                position: "top-right"
            });
        });
}


export function createPost(title, link, lang, tags, content) {

    let form = {
        title: title,
        link: link,
        tags: tags,
        content: content
    }

    form.tags.push(`lang:${lang}`);

    return axios.post(`${PUBLIC_TIL_SERVER_URL}/posts`, form, {headers: {Authorization: get(token)}})
        .then(() => {
            toast.success(get(t)('post.created'), {
                position: "top-right"
            });
            getTags()
            goto("/")
        })
        .catch(err => {
            toast.error(get(t)('generic_error', {err: err.response.data}), {
                position: "top-right"
            });
        });
}

