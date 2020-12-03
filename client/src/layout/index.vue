<template>
    <div id="layout">
        <Nav />
        <Layout>
            <router-view/>
        </Layout>
    </div>
</template>

<script>
import Nav from './components/Nav'
import Layout from '@/components/Layout/index'

export default {
    name: 'layout',
    components: {
        Nav,
        Layout
    },
    
}
</script>

<style lang="less" scoped>

</style>