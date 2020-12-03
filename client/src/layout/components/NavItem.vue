<template>
    <el-menu-item v-if="route.children.length === 1" :index="route.children[0].path">{{route.children[0].name}}</el-menu-item>
    <el-submenu v-else :index="index+'submenu'" :popper-append-to-body="false">
        <template slot="title">{{route.name}}</template>
        <el-menu-item v-for="item in route.children" :key="item.path" :index="item.path">{{item.name}}</el-menu-item>
        <!-- <el-menu-item :key="route.children[0].path" :index="route.children[0].path">{{item.name}}</el-menu-item> -->
    </el-submenu>
</template>

<script>
    export default {
       props: ['route', 'index'] 
    }
</script>

<style lang="less" scoped>

</style>