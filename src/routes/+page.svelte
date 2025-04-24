<script>
    import {onDestroy, onMount} from "svelte";
    import Content from "../components/content.svelte";
    import {posts, getPostPage, cleanAndLoad, loading} from "$lib/posts.js";
    import {currentUser} from "$lib/auth.js";
    import Tags from "svelte-tags-input";
    import {t} from "$lib/i18n";
    import {tags} from "$lib/tags.js";
    import {get} from "svelte/store";

    let cardList;
    let page = 0;
    let selectedTags = $state([]);

    function test() {
        page = 0;
        cleanAndLoad(selectedTags)
    }

    currentUser.subscribe(e => {
        if (e && e.id !== "") {
            selectedTags = e.automatic_tags_filter;
            page = 0;
        }
    })

    function clearTags() {
        selectedTags = []
        test()
    }

    function loadUserTags() {
        selectedTags = get(currentUser).automatic_tags_filter
        test()
    }


    function load() {
        getPostPage(page, selectedTags)
        page++
    }

    function wheel() {
        if (window.innerHeight + window.scrollY + 200 >= cardList.clientHeight) {
            load()
        }
    }

    onMount(() => {
        if (cardList) {
            window.addEventListener("wheel", wheel, {passive: true});
            window.addEventListener("scroll", wheel, {passive: true});
        }
    })

    onDestroy(() => {
        window.removeEventListener("wheel", wheel);
        window.removeEventListener("scroll", wheel);
    })
</script>

<div class="filter-cards-flex">
    <div class="filter-cards">
        <label for="filter">{$t('index.filter.label')}</label>
        <Tags autoComplete={$tags} onlyUnique={true} bind:tags={selectedTags} name="filter" id="filter" removeKeys={[]} onTagAdded={test}
              onTagRemoved={test} onlyAutocomplete={true}/>
    </div>
    <div>
        <button onclick={clearTags}><span class="far fa-trash-can"></span> <span class="menu-text">{$t('index.filter.remove_all')}</span></button>
        <button onclick={loadUserTags}><span class="far fa-user"></span> <span class="menu-text">{$t('index.filter.restore')}</span></button>
    </div>
</div>
{#if !$loading && $posts.length === 0}
    <div class="nothing-to-show">
        <span class="fas fa-sad-cry"></span><br/>
        <p>{$t('post.empty_list')}</p>
    </div>
{:else }
    <div class="cards" bind:this={cardList}>
        {#each $posts as article}
            <Content item={article}></Content>
        {/each}
    </div>
{/if}