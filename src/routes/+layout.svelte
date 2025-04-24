<script lang="ts">
    let { children } = $props();
    import Header from "../components/header.svelte"
    import {checkAuth} from "$lib/auth";
    import { Toaster } from 'svelte-french-toast';
    import Footer from "../components/footer.svelte";
    import Konami from 'konami';

    checkAuth()

    const easterEgg = new Konami(() => {
        document.getElementById("logo").src = "/til.gif"
    })
</script>

<Header />
<Toaster />

<main>
{@render children()}
</main>

<Footer />
